import httpStatus from 'http-status';
import ApiError from "../../../errors/ApiError";
import prisma from "../../../shared/prisma";
import { CreateShipmentPayload } from "./shipment.interface";
import { OrderStatus, ShipmentStatus } from '@prisma/client';

const createShipmentForOrder = async (
  orderId: number,
  payload: CreateShipmentPayload,
) => {
  const { carrier, trackingNumber, labelUrl } = payload;

  // 1) Check order exists
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // 2) Basic rules
  if (order.status === OrderStatus.CANCELLED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot create shipment for a cancelled order',
    );
  }

  // Only one shipment per order (simple)
  const existingShipment = await prisma.shipment.findFirst({
    where: { orderId },
  });

  if (existingShipment) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Shipment already exists for this order',
    );
  }

  // 3) Transaction: create shipment + mark order as SHIPPED
  const now = new Date();

  const shipment = await prisma.$transaction(async tx => {
    const createdShipment = await tx.shipment.create({
      data: {
        orderId,
        carrier: carrier ?? null,
        trackingNumber: trackingNumber ?? null,
        labelUrl: labelUrl ?? null,
        status: ShipmentStatus.IN_TRANSIT, // directly in transit for simplicity
        shippedAt: now,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.SHIPPED,
      },
    });

    return createdShipment;
  });

  return shipment;
};


const updateShipmentStatus = async (
  shipmentId: number,
  status: ShipmentStatus,
) => {
  // 1) Validate enum
  if (!Object.values(ShipmentStatus).includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid shipment status');
  }

  // 2) Load shipment + order
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: { order: true },
  });

  if (!shipment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shipment not found');
  }

  // If already DELIVERED, don't change
  if (shipment.status === ShipmentStatus.DELIVERED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Delivered shipment cannot be updated',
    );
  }

  const now = new Date();

  const updatedShipment = await prisma.$transaction(async tx => {
    let shippedAt = shipment.shippedAt;
    let deliveredAt = shipment.deliveredAt;

    // Set timestamps based on new status
    if (status === ShipmentStatus.IN_TRANSIT && !shippedAt) {
      shippedAt = now;
    }
    if (status === ShipmentStatus.DELIVERED && !deliveredAt) {
      deliveredAt = now;
    }

    const s = await tx.shipment.update({
      where: { id: shipmentId },
      data: {
        status,
        shippedAt,
        deliveredAt,
      },
    });

    // Sync order status with shipment status
    let newOrderStatus: OrderStatus | null = null;

    if (status === ShipmentStatus.IN_TRANSIT) {
      newOrderStatus = OrderStatus.SHIPPED;
    } else if (status === ShipmentStatus.DELIVERED) {
      newOrderStatus = OrderStatus.DELIVERED;
    } else if (status === ShipmentStatus.RETURNED) {
      newOrderStatus = OrderStatus.RETURNED;
    }

    if (newOrderStatus) {
      await tx.order.update({
        where: { id: shipment.orderId },
        data: {
          status: newOrderStatus,
        },
      });
    }

    return s;
  });

  return updatedShipment;
};
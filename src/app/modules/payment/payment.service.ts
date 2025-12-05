import httpStatus from 'http-status';
import { PaymentStatus, Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiError';

export const createPaymentForOrder = async (
  tx: Prisma.TransactionClient,
  params: {
    orderId: number;
    amount: Prisma.Decimal;
    gateway: string; // 'COD' | 'BKASH' | 'PAYPAL' | ...
    initialStatus: PaymentStatus; // PENDING, INITIATED, etc.
  },
) => {
  const { orderId, amount, gateway, initialStatus } = params;

  const payment = await tx.payment.create({
    data: {
      orderId,
      gateway, // COD, BKASH, PAYPAL...
      amount,
      status: initialStatus,
      transactionRef: null, // later set real trx ID for online
    },
  });

  return payment;
};

const updatePaymentStatus = async (
  adminUserId: number,
  orderId: number,
  paymentStatus: PaymentStatus,
) => {
  if (!Object.values(PaymentStatus).includes(paymentStatus)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payment status');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  const payment = order.payments[0];
  if (!payment) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'No payment record found for this order',
    );
  }

  const updated = await prisma.$transaction(async tx => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: { status: paymentStatus },
    });

    // always sync paymentStatus
    const orderUpdateData: Prisma.OrderUpdateInput = {
      paymentStatus,
    };

    // 🔥 if payment became SUCCESS and order is still PENDING,
    // move order to PROCESSING (ready to ship)
    if (
      paymentStatus === PaymentStatus.SUCCESS &&
      order.status === 'PENDING' 
    ) {
      orderUpdateData.status = 'PROCESSING'; 
    }

    await tx.order.update({
      where: { id: order.id },
      data: orderUpdateData,
    });

    return updatedPayment;
  });

  return updated;
};

const getMyPaymentForOrder = async (userId: number, orderId: number) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      payments: true,
    },
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // will be undefined if no payment row yet (should not happen if you create on order)
  return order.payments[0] ?? null;
};

export const PaymentService = {
  updatePaymentStatus,
  getMyPaymentForOrder,
};

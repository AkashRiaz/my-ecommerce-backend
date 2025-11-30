import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IAdjustInventoryPayload } from './inventory.interface';
import prisma from '../../../shared/prisma';

const adjustInventory = async (
  variantId: number,
  payload: IAdjustInventoryPayload,
) => {
  const { delta, reason, actorId } = payload;

  if (!Number.isInteger(delta) || delta === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'delta must be a non-zero integer',
    );
  }

  return prisma.$transaction(async tx => {
    // 1) ensure variant exists
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Product variant not found');
    }

    // 2) get or create inventory row
    let inventory = await tx.inventory.findUnique({
      where: { variantId },
    });

    if (!inventory) {
      inventory = await tx.inventory.create({
        data: {
          variantId,
          quantity: 0,
          safetyStock: 0,
        },
      });
    }

    const newQuantity = inventory.quantity + delta;

    if (newQuantity < 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Insufficient stock for this operation',
      );
    }

    // 3) update inventory
    const updatedInventory = await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: newQuantity,
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    // 4) create movement
    const movement = await tx.inventoryMovement.create({
      data: {
        inventoryId: updatedInventory.id,
        variantId,
        delta,
        reason,
        actorId: actorId ?? null,
      },
      include: {
        actor: true,
        variant: true,
        inventory: true,
      },
    });

    return { inventory: updatedInventory, movement };
  });
};

const getInventoryByVariant = async (
  variantId: number,
  withMovements = false,
) => {
  const inventory = await prisma.inventory.findUnique({
    where: { variantId },
    include: withMovements
      ? {
          variant: { include: { product: true } },
          movements: {
            orderBy: { createdAt: 'desc' },
            include: {
              actor: true,
              variant: true,
            },
          },
        }
      : {
          variant: { include: { product: true } },
        },
  });

  if (!inventory) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Inventory not found for this variant',
    );
  }

  return inventory;
};

const getAllInventory = async () => {
  const inventories = await prisma.inventory.findMany({
    include: {
      variant: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  return inventories;
};

const getMovements = async () => {
  const movements = await prisma.inventoryMovement.findMany({
    include: {
      variant: {
        include: { product: true },
      },
      inventory: true,
      actor: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return movements;
};

export const InventoryService = {
  adjustInventory,
  getInventoryByVariant,
  getAllInventory,
  getMovements,
};

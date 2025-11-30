import httpStatus from 'http-status';

import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const getWishlist = async (userId: number) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              variants: true,
            },
          },
        },
      },
    },
  });

  if (!wishlist) {
    return {
      id: null,
      userId,
      items: [],
    };
  }

  return wishlist;
};

const addToWishlist = async (
  userId: number,
  payload: { productId: number },
) => {
  const { productId } = payload;

  // make sure product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // do in transaction: ensure wishlist exists + upsert item
  await prisma.$transaction(async tx => {
    const wishlist = await tx.wishlist.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    // prevent duplicates using composite unique
    await tx.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
      update: {
        // if already exists, we might want to just keep addedAt or update it
        // here we do nothing -> no change
      },
      create: {
        wishlistId: wishlist.id,
        productId,
      },
    });
  });

  // return full updated wishlist
  return getWishlist(userId);
};

const removeItemByProduct = async (userId: number, productId: number) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
  });

  if (!wishlist) {
    // nothing to remove
    return getWishlist(userId);
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId,
      },
    },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wishlist item not found');
  }

  await prisma.wishlistItem.delete({
    where: { id: existing.id },
  });

  return getWishlist(userId);
};

const clearWishlist = async (userId: number) => {
  // thanks to onDelete: Cascade, deleting wishlist will delete items
  await prisma.wishlist.deleteMany({
    where: { userId },
  });

  // return empty wishlist shape
  return getWishlist(userId);
};

export const WishlistService = {
  getWishlist,
  addToWishlist,
  removeItemByProduct,
    clearWishlist,
};

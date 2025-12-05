import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const getCart = async (userId: number) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return {
      id: null,
      userId,
      items: [],
      cartSubtotal: 0,
    };
  }

  const items = cart.items.map(item => {
    const priceNumber = Number(item.price);

    return {
      ...item,
      price: priceNumber,
      itemTotal: item.quantity * priceNumber,
    };
  });

  // calculate subtotal
  const cartSubtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);

  return {
    ...cart,
    items,
    cartSubtotal,
  };
};

const addItemToCart = async (
  userId: number,
  payload: { variantId: number; quantity?: number },
) => {
  const { variantId, quantity = 1 } = payload;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'quantity must be a positive integer',
    );
  }

  // 1) Do mutations in a transaction
  await prisma.$transaction(async tx => {
    const cart = await tx.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Product variant not found');
    }

    await tx.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId: cart.id,
        variantId,
        quantity,
        price: variant.price,
      },
    });
  });

  // 2) After transaction, return full updated cart
  const updatedCart = await getCart(userId);
  return updatedCart;
};

const updateItemQuantity = async (
  userId: number,
  cartItemId: number,
  quantity: number,
) => {
  if (!Number.isInteger(quantity)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'quantity must be an integer');
  }

  // quantity <= 0 => remove item
  if (quantity <= 0) {
    return await removeItem(userId, cartItemId);
  }

  // ensure item belongs to this user
  const existing = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cart: {
        userId,
      },
    },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  // update quantity
  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  // 🔥 now return full updated cart with itemTotal + cartSubtotal
  const updatedCart = await getCart(userId);
  return updatedCart;
};

const removeItem = async (userId: number, cartItemId: number) => {
  // ensure item belongs to this user
  const existing = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cart: {
        userId,
      },
    },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  // 🔥 return updated cart
  return await getCart(userId);
};

const clearCart = async (userId: number) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return await getCart(userId);

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return await getCart(userId);
};


export const CartService = {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItem,
  clearCart,
};

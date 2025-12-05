import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { CouponType, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { InventoryReason } from '../inventory/inventory.constant';
import { createPaymentForOrder } from '../payment/payment.service';

type CreateOrderFromCartPayload = {
  addressId: number;
  couponCode?: string | null;
  paymentMethod: 'COD' | 'BKASH' | 'PAYPAL';
};
// src/app/modules/order/order.service.ts
const getCheckoutSummary = async (
  userId: number,
  payload: { addressId: number; couponCode?: string | null },
) => {
  const { addressId, couponCode } = payload;

  // 1) Load cart (source of truth)
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is empty');
  }

  // 2) Load address & ensure it belongs to this user
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
  }

  // 3) Subtotal (sum of item.price * quantity)
  const subtotalDecimal = cart.items.reduce(
    (sum, item) => sum.add(item.price.mul(item.quantity)),
    new Prisma.Decimal(0),
  );

  // 4) Shipping (same rule as createOrderFromCart)
  const cityLower = address.city.toLowerCase();
  const isInsideDhaka = cityLower.includes('dhaka');
  const shippingDecimal = new Prisma.Decimal(isInsideDhaka ? 60 : 120);

  // 5) Tax (for now 0, change if you need VAT)
  const taxDecimal = new Prisma.Decimal(0);

  // 6) Discount via coupon (same logic as in createOrderFromCart)
  let discountDecimal = new Prisma.Decimal(0);

  if (couponCode && couponCode.trim().length > 0) {
    const code = couponCode.trim();

    const coupon = await prisma.coupon.findFirst({
      where: {
        code,
        active: true,
      },
    });

    if (!coupon) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid coupon code');
    }

    const now = new Date();

    // not started yet
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon is not active yet');
    }

    // expired
    if (coupon.endsAt && coupon.endsAt < now) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon has expired');
    }

    // min cart value
    if (coupon.minCartValue && subtotalDecimal.lt(coupon.minCartValue)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Cart value is too low for this coupon',
      );
    }

    // global usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon usage limit reached');
    }

    // calculate discount
    if (coupon.type === CouponType.FIXED) {
      // fixed amount, but not more than subtotal
      discountDecimal = Prisma.Decimal.min(coupon.value, subtotalDecimal);
    } else if (coupon.type === CouponType.PERCENT) {
      // percentage of subtotal (coupon.value = 10 means 10%)
      discountDecimal = subtotalDecimal.mul(coupon.value).div(100);
    }
  }

  // 7) Total = subtotal + shipping + tax - discount
  const totalDecimal = subtotalDecimal
    .add(shippingDecimal)
    .add(taxDecimal)
    .sub(discountDecimal);

  if (totalDecimal.lt(0)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Total amount cannot be negative',
    );
  }

  // 8) Return plain numbers for frontend UI
  return {
    subtotal: subtotalDecimal.toNumber(),
    shippingAmount: shippingDecimal.toNumber(),
    taxAmount: taxDecimal.toNumber(),
    discountAmount: discountDecimal.toNumber(),
    totalAmount: totalDecimal.toNumber(),
  };
};

// helper to generate something like: ORD-20251130-123456
const generateOrderNumber = async () => {
  const random = Math.floor(Math.random() * 900000) + 100000; // 6 digits
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `ORD-${y}${m}${d}-${random}`;
};

const createOrderFromCart = async (
  userId: number,
  payload: CreateOrderFromCartPayload,
) => {
  const { addressId, couponCode } = payload;

  // 1) Load cart with items (this is the source of truth)
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
              inventory: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is empty');
  }

  // 2) Load address and ensure it belongs to this user
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
  }

  // 3) Compute subtotal using Decimal (secure, no float errors)
  const subtotalDecimal = cart.items.reduce(
    (sum, item) => sum.add(item.price.mul(item.quantity)),
    new Prisma.Decimal(0),
  );

  // 4) SHIPPING: simple rule (you can change later)
  const cityLower = address.city.toLowerCase();
  const isInsideDhaka = cityLower.includes('dhaka');
  const shippingDecimal = new Prisma.Decimal(isInsideDhaka ? 60 : 120);

  // 5) TAX: for now 0
  const taxDecimal = new Prisma.Decimal(0);

  // 6) DISCOUNT: via optional coupon
  let discountDecimal = new Prisma.Decimal(0);
  let appliedCoupon: { id: number } | null = null;

  if (couponCode && couponCode.trim().length > 0) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode.trim(),
        active: true,
      },
    });

    if (!coupon) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid coupon code');
    }

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon not started yet');
    }
    if (coupon.endsAt && coupon.endsAt < now) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon expired');
    }

    // minCartValue check
    if (coupon.minCartValue && subtotalDecimal.lt(coupon.minCartValue)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Cart value is too low for this coupon',
      );
    }

    // usageLimit check (global usage)
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon usage limit reached');
    }

    if (coupon.type === CouponType.FIXED) {
      // fixed amount discount, but not more than subtotal
      discountDecimal = Prisma.Decimal.min(coupon.value, subtotalDecimal);
    } else if (coupon.type === CouponType.PERCENT) {
      // percent of subtotal (coupon.value is like 10 for 10%)
      discountDecimal = subtotalDecimal.mul(coupon.value).div(100);
    }

    appliedCoupon = { id: coupon.id };
  }

  // 7) Calculate final total: subtotal + shipping + tax - discount
  const totalDecimal = subtotalDecimal
    .add(shippingDecimal)
    .add(taxDecimal)
    .sub(discountDecimal);

  if (totalDecimal.lt(0)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Total amount cannot be negative',
    );
  }

  // 8) Transaction: inventory check, create order, items, movements, coupon usage, clear cart
  const createdOrder = await prisma.$transaction(async tx => {
    // 8a) Re-check inventory inside tx
    for (const item of cart.items) {
      const inv = await tx.inventory.findUnique({
        where: { variantId: item.variantId },
      });

      if (!inv || inv.quantity < item.quantity) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Not enough stock for SKU ${item.variant.sku}`,
        );
      }
    }

    // 8b) Create order
    const orderNumber = await generateOrderNumber();
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId: address.id,

        shipToName: address.label ?? address.line1,
        shipToLine1: address.line1,
        shipToLine2: address.line2,
        shipToCity: address.city,
        shipToState: address.state,
        shipToPostal: address.postalCode,
        shipToCountry: address.country,

        subtotal: subtotalDecimal,
        taxAmount: taxDecimal,
        shippingAmount: shippingDecimal,
        discountAmount: discountDecimal,
        totalAmount: totalDecimal,
        // paymentStatus, status use defaults: PENDING
      },
    });

    // 8b.1) Create initial Payment row for COD
    if (payload.paymentMethod === 'COD') {
      await createPaymentForOrder(tx, {
        orderId: order.id,
        amount: totalDecimal,
        gateway: 'COD',
        initialStatus: PaymentStatus.PENDING,
      });
    }

    // 8c) Create order items snapshot
    await tx.orderItem.createMany({
      data: cart.items.map(item => ({
        orderId: order.id,
        variantId: item.variantId,
        productTitle: item.variant.product.title,
        sku: item.variant.sku,
        quantity: item.quantity,
        price: item.price,
        total: item.price.mul(item.quantity),
      })),
    });

    // 8d) Update inventory & log movement
    for (const item of cart.items) {
      const inv = await tx.inventory.update({
        where: { variantId: item.variantId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryId: inv.id,
          variantId: item.variantId,
          delta: -item.quantity,
          reason: InventoryReason.ORDER_PLACED,
          actorId: userId,
        },
      });
    }

    // 8e) Apply coupon usage
    if (appliedCoupon) {
      await tx.orderCoupon.create({
        data: {
          orderId: order.id,
          couponId: appliedCoupon.id,
        },
      });

      await tx.coupon.update({
        where: { id: appliedCoupon.id },
        data: {
          usedCount: { increment: 1 },
        },
      });
    }

    // 8f) Clear cart items
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  });

  // 9) Return full order for confirmation page
  const fullOrder = await prisma.order.findUnique({
    where: { id: createdOrder.id },
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
      address: true,
      coupons: {
        include: { coupon: true },
      },
      payments: true,
      shipments: true,
    },
  });

  return fullOrder;
};

// "My Orders" list
const getMyOrders = async (userId: number) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { placedAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      placedAt: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
    },
  });

  return orders;
};

// Single order details
const getMyOrderById = async (userId: number, orderId: number) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
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
      address: true,
      coupons: {
        include: { coupon: true },
      },
      payments: true,
      shipments: true,
    },
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  return order;
};

const updateOrderStatus = async (
  userId: number,
  orderId: number,
  status: OrderStatus,
) => {
  // 1) Validate status is a real enum value
  if (!Object.values(OrderStatus).includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid order status');
  }

  // 2) Ensure order exists
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // 3) (Optional) Business rules
  // Cannot change DELIVERED → PENDING
  if (existing.status === OrderStatus.DELIVERED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Completed orders cannot be changed',
    );
  }

  // 4) Update status
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  return updatedOrder;
};

export const OrderService = {
  createOrderFromCart,
  getMyOrders,
  getMyOrderById,
  getCheckoutSummary,
  updateOrderStatus,
};

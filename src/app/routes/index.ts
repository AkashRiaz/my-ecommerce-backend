import express from 'express';
import { AuthRouter } from '../modules/auth/auth.route';
import { UserRouter } from '../modules/user/user.route';
import { AddressRouter } from '../modules/address/address.route';
import { CategoryRouter } from '../modules/category/category.route';
import { ProductRouter } from '../modules/product/product.route';
import { InventoryRoute } from '../modules/inventory/inventory.route';
import { CartRoute } from '../modules/cart/cart.route';
import { WishlistRoute } from '../modules/wishlist/wishlist.route';
const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRouter,
  },
  {
    path: '/user',
    route: UserRouter,
  },
  {
    path: '/user',
    route: AddressRouter,
  },
  {
    path: '/category',
    route: CategoryRouter,
  },
  {
    path: '/product',
    route: ProductRouter,
  },
  {
    path: '/inventory',
    route: InventoryRoute,
  },
  {
    path: '/cart',
    route: CartRoute,
  },
  {
    path: '/wishlist',
    route: WishlistRoute
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;

import express from 'express';
import { AuthRouter } from '../modules/auth/auth.route';
import { UserRouter } from '../modules/user/user.route';
import { AddressRouter } from '../modules/address/address.route';
import { CategoryRouter } from '../modules/category/category.route';
import { ProductRouter } from '../modules/product/product.route';
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
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;

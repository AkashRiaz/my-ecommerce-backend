import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { ICategory, ICategoryUpdatePayload } from './category.interface';

const insertIntoDB = async (payload: ICategory) => {
  const existingCategory = await prisma.category.findUnique({
    where: { slug: payload.slug },
  });

  if (existingCategory) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Category with this slug already exists',
    );
  }

  const category = await prisma.category.create({
    data: {
      name: payload.name,
      slug: payload.slug,
      parentId: payload.parentId || null,
    },
    include: {
      parent: true,
      children: true,
      products: true,
    },
  });

  return category;
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    include: {
      parent: true,
      children: true,
      products: true,
    },
  });
  return categories;
};

const getSingleCategory = async (id: number) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      products: true,
    },
  });
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return category;
};

const updateCategory = async (id: number, payload: ICategoryUpdatePayload) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });
  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  const category = await prisma.category.update({
    where: { id },
    data: payload,
    include: {
      parent: true,
      children: true,
      products: true,
    },
  });
  return category;
};

const deleteCategory = async (id: number) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });
  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const category = await prisma.category.delete({
    where: { id },
    include: {
      parent: true,
      children: true,
      products: true,
    },
  });
  return category;
};

export const CategoryService = {
  insertIntoDB,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};

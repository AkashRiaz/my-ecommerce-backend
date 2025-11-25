import prisma from '../../../shared/prisma';
import { IProduct } from './product.interface';
import slugify from 'slugify';

const insertIntoDB = async (payload: IProduct) => {
  const {
    title,
    description,
    basePrice,
    categoryId,
    images,
    attributes,
    variants,
    metaTitle, // Extracting SEO fields
    metaDescription,
  } = payload;

  const slugRaw = slugify(title, { lower: true, strict: true });
  const slug = `${slugRaw}-${Date.now()}`;

  // 3. Start Transaction
  return await prisma.$transaction(async tx => {
    // --- STEP A: Create Base Product & Images ---
    const product = await tx.product.create({
      data: {
        title,
        slug,
        description,
        categoryId,
        basePrice,
        metaTitle,
        metaDescription,
        images: {
          create: images.map((url, index) => ({
            url,
            position: index,
            alt: `${title} - Image ${index + 1}`,
          })),
        },
      },

      include: {
        images: true,
        variants: true,
        attributes: {
          include: {
            attribute: true,
          },
        },
      },
    });

    // --- STEP B: Handle Attributes ---
    for (const attr of attributes) {
      // 1. Find or Create Global Attribute (e.g. "Color")
      const attributeDefinition = await tx.attribute.upsert({
        where: { name: attr.name },
        update: {},
        create: {
          name: attr.name,
          type: 'text',
        },
      });

      // 2. Link Values to Product (e.g. Product has Color: Red)
      for (const value of attr.values) {
        await tx.productAttribute.create({
          data: {
            productId: product.id,
            attributeId: attributeDefinition.id,
            value: value,
          },
        });
      }
    }

    // --- STEP C: Create Variants ---
    for (const variant of variants) {
      const createdVariant = await tx.productVariant.create({
        data: {
          productId: product.id,
          sku: variant.sku,
          price: variant.price,
          attributes: variant.attributes,
          title: `${title} - ${Object.values(variant.attributes).join(' / ')}`,
        },
      });

      const inventory = await tx.inventory.create({
        data: {
          variantId: createdVariant.id,
          quantity: 0,
          safetyStock: 0,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          variantId: createdVariant.id,
          inventoryId: inventory.id,
          delta: 0,
          reason: 'initial creation',
          actorId: null,
        },
      });
    }

    return product;
  });
};

const getAllProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      images: true,
      variants: true,
      attributes: {
        include: {
          attribute: true,
        },
      },
      category: true,
    },
  });
  return products;
};

const getSingleProduct = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      variants: true,
      attributes: {
        include: {
          attribute: true,
        },
      },
      category: true,
    },
  });
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

const updateProduct = async (id: number, payload) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });
  if (!existingProduct) {
    throw new Error('Product not found');
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: payload,
    include: {
      images: true,
      variants: true,
      attributes: {
        include: {
          attribute: true,
        },
      },
      category: true,
    },
  });
  return updatedProduct;
};

const deleteProduct = async (id: number) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new Error('Product not found');
  }

  const deletedProduct = await prisma.product.delete({
    where: { id },
  });
  return deletedProduct;
};

export const ProductService = {
  insertIntoDB,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};

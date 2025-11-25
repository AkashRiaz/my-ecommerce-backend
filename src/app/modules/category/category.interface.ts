export type IProduct = any; // Placeholder for the actual IProduct interface

export type ICategory = {
  name: string;
  slug: string;
  parentId?: number | null;
  parent?: ICategory | null;
  children: ICategory[];
  products: IProduct[]; // Use the placeholder here
};

export type ICategoryUpdatePayload = {
  name?: string;
  slug?: string;
  parentId?: number | null;
};

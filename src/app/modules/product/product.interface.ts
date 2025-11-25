// 3. The Product Interface
export type IProduct = {
  title: string;
  description?: string;
  basePrice: number; 
  categoryId: number;
  images: string[]; 
  attributes: {
    name: string; // "Color"
    values: string[]; // ["Red", "Blue"]
  }[];

  variants: {
    sku: string;
    price: number;
    stock?: number; 
    attributes: Record<string, string>; // JSON: { "Color": "Red", "Size": "S" }
  }[];

  metaTitle: string | null;
  metaDescription: string | null;
};

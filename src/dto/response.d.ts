export type categoryType = {
  id: string;
  name: string;
};

export type productType = {
  id: string;
  price: number;
  images: string[];
  itemCode: string;
  itemName: string;
  sellPrice: number;
  stock: number;
  barcode: string;
  buyPrice: number;
};

export type relationType = {
  backNumber: string;
  backUnit: string;
  backPrice: number;
  frontNumber: string;
  frontUnit: string;
  id: string;
  sellPrice: number;
};

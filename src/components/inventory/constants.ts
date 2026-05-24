import type { ProductFormState } from "@/types/inventory";

export const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: "",
  description: "",
  quantity: "0",
  price: "0.00",
};

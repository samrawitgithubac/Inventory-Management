export const routes = {
  dashboard: "/",
  productsNew: "/products/new",
  productEdit: (id: number | string) => `/products/${id}/edit`,
} as const;

export function isDashboardPath(pathname: string) {
  return pathname === "/";
}

export function isProductsNewPath(pathname: string) {
  return pathname === "/products/new";
}

export function isProductEditPath(pathname: string) {
  return /^\/products\/\d+\/edit$/.test(pathname);
}

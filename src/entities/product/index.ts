export type { Product, ProductVariant, ProductImage, ProductFilters, SearchProduct, SearchParams, SearchResponse } from './model/product.types'
export { toProduct } from './model/product.types'
export { getProducts, getProductBySlug, getAllProductsAdmin, createProduct, updateProduct, deleteProduct, searchProducts, getSimilarProducts } from './api/product-api'
export type { CreateProductPayload } from './api/product-api'
export {
  productKeys,
  useProducts,
  useProductBySlug,
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useSemanticSearch,
  useSimilarProducts,
} from './model/product-queries'

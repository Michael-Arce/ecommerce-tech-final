import {
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type CreateProductPayload,
} from '@/entities/product'

export type NewProductPayload = CreateProductPayload
export type UpdateProductPayload = Partial<CreateProductPayload>

export function useProductInventory() {
  const { data, isLoading } = useAdminProducts()
  const products = data?.data ?? []

  const { mutate: createMutate } = useCreateProduct()
  const { mutate: updateMutate } = useUpdateProduct()
  const { mutate: deleteMutate } = useDeleteProduct()

  function addProduct(payload: NewProductPayload) {
    createMutate(payload)
  }

  function updateProduct(id: string, payload: UpdateProductPayload) {
    updateMutate({ id, payload })
  }

  function deleteProduct(id: string) {
    deleteMutate(id)
  }

  return { products, isLoading, addProduct, updateProduct, deleteProduct }
}

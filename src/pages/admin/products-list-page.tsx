import { PageTitle } from '@/shared/ui'
import { ProductTable } from '@/features/product-inventory'

export function ProductsListPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle>Products</PageTitle>
      <ProductTable />
    </div>
  )
}

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui'
import { formatCurrency } from '@/shared/lib/format-currency'
import { useProductInventory } from '../model/use-product-inventory'
import type { Product } from '@/entities/product'

const CATEGORY_LABELS: Record<string, string> = {
  cat1: 'Laptops', cat2: 'Smartphones', cat3: 'Headphones',
  cat4: 'Monitors', cat5: 'Tablets', cat6: 'Components',
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">Out of stock</span>
  if (stock < 10)
    return <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">{stock} left</span>
  return <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">{stock} in stock</span>
}

const col = createColumnHelper<Product>()

export function ProductTable() {
  const { products, isLoading, deleteProduct } = useProductInventory()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = [
    col.display({
      id: 'image',
      header: '',
      cell: ({ row }) => {
        const img = row.original.images[0]
        return img
          ? <img src={img.url} alt={row.original.name} className="h-10 w-10 rounded-lg object-cover bg-background" />
          : <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center text-secondary/40 text-xs">—</div>
      },
    }),
    col.accessor('name', {
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-text" onClick={() => column.toggleSorting()}>
          Product <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ getValue }) => <span className="font-medium text-text text-sm">{getValue()}</span>,
    }),
    col.accessor('categoryId', {
      header: 'Category',
      cell: ({ getValue }) => (
        <span className="text-sm text-secondary">{CATEGORY_LABELS[getValue()] ?? getValue()}</span>
      ),
    }),
    col.accessor('price', {
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-text" onClick={() => column.toggleSorting()}>
          Price <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ getValue }) => <span className="text-sm font-semibold text-primary">{formatCurrency(getValue())}</span>,
    }),
    col.accessor('stock', {
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-text" onClick={() => column.toggleSorting()}>
          Stock <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ getValue }) => <StockBadge stock={getValue()} />,
    }),
    col.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Link
            to="/admin/products/$productId/edit"
            params={{ productId: row.original.id }}
            className="rounded-md p-1.5 text-secondary hover:bg-background hover:text-primary transition-colors"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => deleteProduct(row.original.id)}
            className="rounded-md p-1.5 text-secondary hover:bg-background hover:text-destructive transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-surface/60" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search products…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
        <Button size="sm" asChild>
          <Link to="/admin/products/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-secondary/20 bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="text-secondary">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-secondary">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-background/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-secondary">
        {table.getFilteredRowModel().rows.length} of {products.length} products
      </p>

    </div>
  )
}

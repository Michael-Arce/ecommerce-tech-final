import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, Eye, Store, Truck } from 'lucide-react'
import {
  Badge,
  Button,
  Input,
  PageTitle,
  Spinner,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/ui'
import { useOrders } from '@/entities/order'
import type { Order, OrderStatus } from '@/entities/order'
import { formatCurrency } from '@/shared/lib/format-currency'
import { formatDate } from '@/shared/lib/format-date'

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'Pagado / En Proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
  processing: 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20', // Pagado
  shipped: 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20',
  delivered: 'bg-teal-500/10 text-teal-700 hover:bg-teal-500/20',
  cancelled: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
}

const col = createColumnHelper<Order>()

export function AdminOrdersPage() {
  const { data: orders = [], isLoading } = useOrders()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = [
    col.accessor('id', {
      header: 'ID de la Orden',
      cell: ({ getValue }) => <span className="font-mono text-xs font-medium text-text">{getValue()}</span>,
    }),
    col.display({
      id: 'customer',
      header: 'Cliente',
      cell: ({ row }) => {
        const o = row.original
        // Adaptación preventiva en caso de que el backend envíe los datos del usuario poblado o genérico
        const name = (o as any).user ? `${(o as any).user.firstName} ${(o as any).user.lastName}` : 'Cliente / Invitado'
        return (
          <div className="flex flex-col">
            <span className="font-medium text-text">{name}</span>
            {o.shippingAddress?.city && o.shippingAddress?.city !== 'N/A' && (
              <span className="text-xs text-secondary">
                {o.shippingAddress.city}, {o.shippingAddress.state || o.shippingAddress.country}
              </span>
            )}
          </div>
        )
      },
    }),
    col.accessor('createdAt', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-text hover:text-primary transition-colors"
          onClick={() => column.toggleSorting()}
        >
          Fecha <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ getValue }) => <span className="text-sm text-secondary">{formatDate(getValue(), 'medium')}</span>,
    }),
    col.accessor('total', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-text hover:text-primary transition-colors"
          onClick={() => column.toggleSorting()}
        >
          Total <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ getValue }) => <span className="font-semibold text-primary">{formatCurrency(getValue())}</span>,
    }),
    col.accessor('deliveryMethod', {
      header: 'Método de Entrega',
      cell: ({ getValue }) => {
        const method = getValue()
        if (method === 'pickup') {
          return (
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md w-fit ring-1 ring-emerald-500/20">
              <Store className="h-4 w-4" /> Recoger en tienda
            </span>
          )
        }
        return (
          <span className="flex items-center gap-1.5 text-secondary px-2.5 py-1">
            <Truck className="h-4 w-4" /> Envío a domicilio
          </span>
        )
      },
    }),
    col.accessor('status', {
      header: 'Estado',
      cell: ({ getValue }) => {
        const status = getValue() as OrderStatus
        return (
          <Badge className={`border-none ${STATUS_CLASS[status] || STATUS_CLASS.pending}`}>
            {STATUS_LABEL[status] || status}
          </Badge>
        )
      },
    }),
    col.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 hover:text-primary transition-colors text-secondary">
            <Link to="/admin/orders/$orderId" params={{ orderId: row.original.id }}>
              <Eye className="mr-1.5 h-4 w-4" /> Ver detalle
            </Link>
          </Button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <PageTitle>Pedidos</PageTitle>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar pedidos (ID, Cliente, Estado)…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <div className="rounded-xl border border-secondary/20 bg-surface overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-secondary/10">
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className="text-secondary bg-background/30">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-secondary">
                    No se encontraron pedidos.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-background/80 transition-colors border-b border-secondary/10">
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
      )}

      <p className="text-xs text-secondary">
        {table.getFilteredRowModel().rows.length} de {orders.length} pedidos
      </p>
    </div>
  )
}

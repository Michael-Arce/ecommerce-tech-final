import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/ui'
import { formatCurrency } from '@/shared/lib/format-currency'
import { formatDate } from '@/shared/lib/format-date'
import { useOrderManagement } from '../model/use-order-management'
import type { Order, OrderStatus } from '@/entities/order'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending',    label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped',    label: 'Shipped' },
  { value: 'delivered',  label: 'Delivered' },
  { value: 'cancelled',  label: 'Cancelled' },
]

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending:    'bg-amber-500/10 text-amber-600',
  processing: 'bg-blue-500/10 text-blue-600',
  shipped:    'bg-indigo-500/10 text-indigo-600',
  delivered:  'bg-emerald-500/10 text-emerald-600',
  cancelled:  'bg-destructive/10 text-destructive',
}

const col = createColumnHelper<Order>()

export function OrdersTable() {
  const { orders, changeStatus, pendingId } = useOrderManagement()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = [
    col.accessor('id', {
      header: 'Order ID',
      cell: ({ getValue }) => (
        <Link
          to="/admin/orders/$orderId"
          params={{ orderId: getValue() }}
          className="font-mono text-xs text-primary hover:underline"
        >
          {getValue().slice(0, 8)}…
        </Link>
      ),
    }),
    col.accessor((row) => `${row.shippingAddress.city}, ${row.shippingAddress.state}`, {
      id: 'customer',
      header: 'Ship to',
      cell: ({ getValue }) => <span className="text-sm text-text">{getValue()}</span>,
    }),
    col.accessor('createdAt', {
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-text" onClick={() => column.toggleSorting()}>
          Date <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ getValue }) => <span className="text-sm text-secondary">{formatDate(getValue())}</span>,
    }),
    col.accessor('total', {
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-text" onClick={() => column.toggleSorting()}>
          Total <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ getValue }) => <span className="text-sm font-semibold text-primary">{formatCurrency(getValue())}</span>,
    }),
    col.accessor('status', {
      header: 'Status',
      cell: ({ getValue, row }) => {
        const currentStatus = getValue()
        const isPending = pendingId === row.original.id
        return (
          <Select
            value={currentStatus}
            onValueChange={(val) => void changeStatus(row.original.id, val as OrderStatus)}
            disabled={isPending}
          >
            <SelectTrigger className={`h-7 w-36 text-xs font-semibold border-0 ${STATUS_CLASS[currentStatus]}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
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
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search orders…"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-xs"
      />

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
                  No orders found.
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
        {table.getFilteredRowModel().rows.length} of {orders.length} orders
      </p>
    </div>
  )
}

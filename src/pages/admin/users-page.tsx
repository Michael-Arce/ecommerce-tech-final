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
import { ArrowUpDown, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import {
  Avatar, AvatarFallback, AvatarImage,
  Badge,
  Button,
  Input,
  PageTitle,
  Spinner,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/ui'
import type { User } from '@/entities/user'
import { useUsers, useUpdateUser, useDeleteUser } from '@/entities/user'
import { formatDate } from '@/shared/lib/format-date'

const col = createColumnHelper<User>()

function initials(user: User) {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
}

export function UsersPage() {
  const { data: users = [], isLoading } = useUsers()
  const { mutate: updateUser, isPending: isUpdating, variables: updateVars } = useUpdateUser()
  const { mutate: removeUser, isPending: isDeleting, variables: deleteVars } = useDeleteUser()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = [
    col.display({
      id: 'user',
      header: 'User',
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={u.avatarUrl} alt={u.firstName} />
              <AvatarFallback className="text-xs">{initials(u)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-text leading-tight">
                {u.firstName} {u.lastName}
              </p>
              <p className="text-xs text-secondary">{u.email}</p>
            </div>
          </div>
        )
      },
    }),
    col.accessor('role', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-text"
          onClick={() => column.toggleSorting()}
        >
          Role <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ getValue }) =>
        getValue() === 'admin' ? (
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Admin</Badge>
        ) : (
          <Badge variant="secondary">Customer</Badge>
        ),
    }),
    col.accessor('createdAt', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-text"
          onClick={() => column.toggleSorting()}
        >
          Joined <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-secondary">{formatDate(getValue(), 'medium')}</span>
      ),
    }),
    col.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const u = row.original
        const isAdmin = u.role === 'admin'
        const pendingUpdate = isUpdating && updateVars?.id === u.id
        const pendingDelete = isDeleting && deleteVars === u.id

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={pendingUpdate || pendingDelete}
              onClick={() =>
                updateUser({ id: u.id, data: { role: isAdmin ? 'customer' : 'admin' } })
              }
              className={
                isAdmin
                  ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
                  : 'text-primary hover:text-primary hover:bg-primary/10'
              }
            >
              {isAdmin ? (
                <>
                  <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
                  Demote
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  Promote
                </>
              )}
            </Button>
            <button
              type="button"
              disabled={pendingUpdate || pendingDelete}
              onClick={() => removeUser(u.id)}
              className="rounded-md p-1.5 text-secondary hover:bg-background hover:text-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Delete user"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: users,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const adminCount = users.filter((u) => u.role === 'admin').length
  const customerCount = users.filter((u) => u.role === 'customer').length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <PageTitle>Users</PageTitle>
        <div className="flex items-center gap-4 text-sm text-secondary">
          <span>
            <span className="font-semibold text-primary">{adminCount}</span> admins
          </span>
          <span>
            <span className="font-semibold text-text">{customerCount}</span> customers
          </span>
        </div>
      </div>

      <Input
        placeholder="Search users…"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-xs"
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <div className="rounded-xl border border-secondary/20 bg-surface overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className="text-secondary">
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
                    No users found.
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
      )}

      <p className="text-xs text-secondary">
        {table.getFilteredRowModel().rows.length} of {users.length} users
      </p>
    </div>
  )
}

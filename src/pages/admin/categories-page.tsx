import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Button,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
  Input,
  PageTitle,
  Sheet, SheetContent, SheetHeader, SheetTitle,
  Spinner,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/ui'
import type { Category } from '@/entities/category'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/entities/category'

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z
    .string()
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  parentId: z.string().optional().nullable().transform(val => val === '' ? null : val),
})

type FormValues = z.infer<typeof schema>

const col = createColumnHelper<Category>()

export function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories()
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutate: updateCategory, isPending: isUpdating, variables: updateVars } = useUpdateCategory()
  const { mutate: removeCategory, isPending: isDeleting, variables: deleteVars } = useDeleteCategory()

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', parentId: '' },
  })

  function openAdd() {
    form.reset({ name: '', slug: '', parentId: '' })
    setEditing(null)
    setSheetOpen(true)
  }

  function openEdit(category: Category) {
    form.reset({ name: category.name, slug: category.slug, parentId: category.parentId || '' })
    setEditing(category)
    setSheetOpen(true)
  }

  function handleNameChange(value: string) {
    form.setValue('name', value)
    if (!editing) {
      form.setValue(
        'slug',
        value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      )
    }
  }

  function handleSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      slug: values.slug,
      parentId: values.parentId === '' ? null : values.parentId,
    }

    if (editing) {
      updateCategory(
        { id: editing.id, payload },
        { onSuccess: () => setSheetOpen(false) },
      )
    } else {
      createCategory(payload, { onSuccess: () => setSheetOpen(false) })
    }
  }

  const columns = [
    col.accessor('name', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-text hover:text-primary transition-colors"
          onClick={() => column.toggleSorting()}
        >
          Nombre <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="font-medium text-text">{getValue()}</span>
      ),
    }),
    col.accessor('slug', {
      header: 'URL Amigable',
      cell: ({ getValue }) => (
        <code className="rounded bg-background px-1.5 py-0.5 text-xs text-secondary">
          {getValue()}
        </code>
      ),
    }),
    col.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const c = row.original
        const pendingUpdate = isUpdating && updateVars?.id === c.id
        const pendingDelete = isDeleting && deleteVars === c.id

        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              disabled={pendingUpdate || pendingDelete}
              onClick={() => openEdit(c)}
              className="rounded-md p-1.5 text-secondary hover:bg-background hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={pendingUpdate || pendingDelete}
              onClick={() => removeCategory(c.id)}
              className="rounded-md p-1.5 text-secondary hover:bg-background hover:text-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: categories,
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
      <PageTitle>Categorías</PageTitle>

      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar categorías…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Añadir Categoría
        </Button>
      </div>

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
                    No se encontraron categorías.
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
        {table.getFilteredRowModel().rows.length} de {categories.length} categorías
      </p>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? 'Editar Categoría' : 'Añadir Categoría'}</SheetTitle>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              noValidate
              className="mt-6 space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Laptops"
                        {...field}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Amigable (Slug)</FormLabel>
                    <FormControl>
                      <Input placeholder="laptops" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría Padre</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        value={field.value || ''}
                        className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                      >
                        <option value="">Ninguna (Categoría Principal)</option>
                        {categories
                          .filter((c) => c.id !== editing?.id) // Evitar que sea padre de sí misma
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isCreating || isUpdating}
                >
                  {editing ? 'Guardar cambios' : 'Añadir Categoría'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

import { useRef, useState } from 'react'
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
import { ArrowUpDown, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  Button,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
  Input,
  PageTitle,
  Sheet, SheetContent, SheetHeader, SheetTitle,
  Spinner,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/ui'
import { uploadProductImage } from '@/shared/api/upload-api'
import type { Brand } from '@/entities/brand'
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '@/entities/brand'

const schema = z.object({
  name:       z.string().min(2, 'At least 2 characters'),
  slug:       z.string().min(2).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  tagline:    z.object({
    en: z.string().min(2, 'At least 2 characters'),
    es: z.string().min(2, 'At least 2 characters'),
  }),
  bgColor:    z.string().min(4, 'Required'),
  logoUrl:    z.string().optional(),
  bannerUrl:  z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const col = createColumnHelper<Brand>()

export function BrandsPage() {
  const { data: res, isLoading } = useBrands()
  const brands = res?.data ?? []
  const { mutate: createBrand, isPending: isCreating } = useCreateBrand()
  const { mutate: updateBrand, isPending: isUpdating, variables: updateVars } = useUpdateBrand()
  const { mutate: removeBrand, isPending: isDeleting, variables: deleteVars } = useDeleteBrand()

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)

  const [logoPreview, setLogoPreview]     = useState<string>('')
  const [bannerPreview, setBannerPreview] = useState<string>('')
  const [isUploadingLogo, setIsUploadingLogo]     = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const logoRef   = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', tagline: { en: '', es: '' }, bgColor: '#000000', logoUrl: '', bannerUrl: '' },
  })

  function openAdd() {
    form.reset({ name: '', slug: '', tagline: { en: '', es: '' }, bgColor: '#000000', logoUrl: '', bannerUrl: '' })
    setLogoPreview('')
    setBannerPreview('')
    setEditing(null)
    setSheetOpen(true)
  }

  function openEdit(brand: Brand) {
    form.reset({
      name:      brand.name,
      slug:      brand.slug,
      tagline:   brand.tagline,
      bgColor:   brand.bgColor,
      logoUrl:   brand.logoUrl   ?? '',
      bannerUrl: brand.bannerUrl ?? '',
    })
    setLogoPreview(brand.logoUrl ?? '')
    setBannerPreview(brand.bannerUrl ?? '')
    setEditing(brand)
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

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
    setIsUploadingLogo(true)
    try {
      const { url } = await uploadProductImage(file)
      form.setValue('logoUrl', url)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerPreview(URL.createObjectURL(file))
    setIsUploadingBanner(true)
    try {
      const { url } = await uploadProductImage(file)
      form.setValue('bannerUrl', url)
    } finally {
      setIsUploadingBanner(false)
    }
  }

  function handleSubmit(values: FormValues) {
    if (editing) {
      updateBrand(
        { id: editing.id, payload: values },
        { onSuccess: () => setSheetOpen(false) },
      )
    } else {
      createBrand(values, { onSuccess: () => setSheetOpen(false) })
    }
  }

  const isUploading = isUploadingLogo || isUploadingBanner

  const columns = [
    col.display({
      id: 'logo',
      header: 'Logo',
      cell: ({ row }) => {
        const b = row.original
        return b.logoUrl ? (
          <img src={b.logoUrl} alt={b.name} className="h-8 w-16 object-contain" />
        ) : (
          <div
            className="flex h-8 w-16 items-center justify-center rounded text-xs font-bold text-white"
            style={{ backgroundColor: b.bgColor }}
          >
            {b.name.slice(0, 2).toUpperCase()}
          </div>
        )
      },
    }),
    col.display({
      id: 'banner',
      header: 'Banner',
      cell: ({ row }) => {
        const b = row.original
        return b.bannerUrl ? (
          <img src={b.bannerUrl} alt="" className="h-8 w-20 rounded object-cover" />
        ) : (
          <span className="text-xs text-muted">—</span>
        )
      },
    }),
    col.accessor('name', {
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-text" onClick={() => column.toggleSorting()}>
          Name <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ getValue }) => <span className="font-medium text-text">{getValue()}</span>,
    }),
    col.accessor('slug', {
      header: 'Slug',
      cell: ({ getValue }) => (
        <code className="rounded bg-background px-1.5 py-0.5 text-xs text-secondary">{getValue()}</code>
      ),
    }),
    col.accessor('tagline', {
      header: 'Tagline',
      cell: ({ getValue }) => <span className="text-sm text-secondary">{getValue().en}</span>,
    }),
    col.accessor('bgColor', {
      header: 'Color',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded border border-secondary/20" style={{ backgroundColor: getValue() }} />
          <code className="text-xs text-secondary">{getValue()}</code>
        </div>
      ),
    }),
    col.accessor('productCount', {
      header: 'Products',
      cell: ({ getValue }) => <span className="text-sm text-secondary">{getValue()}</span>,
    }),
    col.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const b = row.original
        const pendingUpdate = isUpdating && updateVars?.id === b.id
        const pendingDelete = isDeleting && deleteVars === b.id

        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              disabled={pendingUpdate || pendingDelete}
              onClick={() => openEdit(b)}
              className="rounded-md p-1.5 text-secondary hover:bg-background hover:text-primary transition-colors disabled:opacity-40"
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={pendingUpdate || pendingDelete}
              onClick={() => removeBrand(b.id)}
              className="rounded-md p-1.5 text-secondary hover:bg-background hover:text-destructive transition-colors disabled:opacity-40"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: brands,
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
      <PageTitle>Brands</PageTitle>

      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search brands…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add brand
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
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
                    No brands found.
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
        {table.getFilteredRowModel().rows.length} of {brands.length} brands
      </p>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? 'Edit brand' : 'Add brand'}</SheetTitle>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="mt-6 space-y-4">

              {/* Banner upload */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Banner image</p>
                <div
                  className="relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-secondary/30 bg-background transition-colors hover:border-primary/50"
                  onClick={() => bannerRef.current?.click()}
                >
                  {bannerPreview ? (
                    <>
                      <img src={bannerPreview} alt="Banner preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                        <ImagePlus className="h-6 w-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-secondary">
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-xs">Click to upload banner</span>
                      <span className="text-[10px] text-muted">Recommended: 800×400px</span>
                    </div>
                  )}
                </div>
                <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                {isUploadingBanner && <p className="text-xs text-secondary">Uploading…</p>}
              </div>

              {/* Logo upload */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Logo</p>
                <div
                  className="flex h-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-secondary/30 bg-background transition-colors hover:border-primary/50"
                  onClick={() => logoRef.current?.click()}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain p-3" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-secondary">
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-xs">Click to upload logo</span>
                    </div>
                  )}
                </div>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                {isUploadingLogo && <p className="text-xs text-secondary">Uploading…</p>}
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Apple" {...field} onChange={(e) => handleNameChange(e.target.value)} />
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
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="apple" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tagline.en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline (EN)</FormLabel>
                    <FormControl>
                      <Input placeholder="Think Different" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tagline.es"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline (ES)</FormLabel>
                    <FormControl>
                      <Input placeholder="Pensá diferente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bgColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-9 w-12 cursor-pointer rounded border border-secondary/30 bg-background p-0.5"
                        />
                        <Input placeholder="#000000" {...field} className="flex-1" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1" disabled={isCreating || isUpdating || isUploading}>
                  {editing ? 'Save changes' : 'Add brand'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

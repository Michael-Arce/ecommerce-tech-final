import { useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react'
import {
  Button,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
  Input,
  PageTitle,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Spinner,
} from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { useAdminProducts, useCreateProduct, useUpdateProduct } from '@/entities/product'
import { useCategories } from '@/entities/category'
import { useBrands } from '@/entities/brand'
import { uploadProductImage } from '@/shared/api/upload-api'

const MAX_IMAGES = 5

// ─── Schemas ─────────────────────────────────────────────────────────────────

const variantSchema = z.object({
  sku:      z.string().min(1, 'Required'),
  name:     z.string().min(1, 'Required'),
  price:    z.coerce.number().positive('Must be > 0'),
  stock:    z.coerce.number().int().min(0, 'Cannot be negative'),
  imageUrl: z.string().optional(),
})

const schema = z.object({
  name:           z.string().min(2, 'Required'),
  description:    z.string().min(10, 'At least 10 characters'),
  price:          z.coerce.number().positive('Must be > 0'),
  compareAtPrice: z.coerce.number().nonnegative().optional().or(z.literal('')),
  stock:          z.coerce.number().int().min(0, 'Cannot be negative'),
  categoryId:     z.string().min(1, 'Required'),
  brandId:        z.string().min(1, 'Required'),
  isActive:       z.boolean(),
  variants:       z.array(variantSchema).optional(),
})

type FormValues = z.infer<typeof schema>
type VariantValues = z.infer<typeof variantSchema>

// ─── Variant image upload state ───────────────────────────────────────────────

interface VariantImageState {
  preview:  string
  uploading: boolean
  error:    string | null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductFormPage() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { productId?: string }
  const productId = params.productId

  const { data: adminProducts } = useAdminProducts()
  const { data: categories = [] } = useCategories()
  const { data: brandsRes } = useBrands()
  const brands = brandsRes?.data ?? []

  const { mutateAsync: createProduct } = useCreateProduct()
  const { mutateAsync: updateProduct } = useUpdateProduct()

  const existing = productId
    ? adminProducts?.data?.find((p) => p.id === productId)
    : undefined

  const isEdit = Boolean(productId)

  // ── Product images ─────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageUrls, setImageUrls]       = useState<string[]>([])
  const [uploading, setUploading]       = useState(false)
  const [uploadError, setUploadError]   = useState<string | null>(null)

  // ── Variant images (indexed by field array position) ──────────────────────
  const [variantImages, setVariantImages] = useState<VariantImageState[]>([])
  const variantFileRefs = useRef<(HTMLInputElement | null)[]>([])

  // ── Form ──────────────────────────────────────────────────────────────────
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name:           '',
      description:    '',
      price:          0,
      compareAtPrice: '',
      stock:          0,
      categoryId:     '',
      brandId:        '',
      isActive:       true,
      variants:       [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variants',
  })

  // ── Populate form on edit ──────────────────────────────────────────────────
  useEffect(() => {
    if (existing) {
      form.reset({
        name:           existing.name,
        description:    existing.description,
        price:          existing.price,
        compareAtPrice: existing.compareAtPrice ?? '',
        stock:          existing.stock,
        categoryId:     existing.categoryId,
        brandId:        existing.brandId,
        isActive:       existing.isActive,
        variants: existing.variants.map((v) => ({
          sku:      v.sku,
          name:     v.name,
          price:    v.price,
          stock:    v.stock,
          imageUrl: v.imageUrl ?? '',
        })),
      })
      setImageUrls(existing.images?.map((img) => img.url) ?? [])

      setVariantImages(
        existing.variants.map((v) => ({
          preview:  v.imageUrl ?? '',
          uploading: false,
          error:    null,
        })),
      )
    }
  }, [existing, form])

  // Sync variantImages length with field array length
  useEffect(() => {
    setVariantImages((prev) => {
      if (prev.length === fields.length) return prev
      if (fields.length > prev.length) {
        return [...prev, ...Array.from({ length: fields.length - prev.length }, () => ({
          preview: '', uploading: false, error: null,
        }))]
      }
      return prev.slice(0, fields.length)
    })
    variantFileRefs.current = variantFileRefs.current.slice(0, fields.length)
  }, [fields.length])

  // ── Product image handlers ─────────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length || imageUrls.length >= MAX_IMAGES) return
    setUploadError(null)
    setUploading(true)
    try {
      const remaining = MAX_IMAGES - imageUrls.length
      const results = await Promise.all(files.slice(0, remaining).map((f) => uploadProductImage(f)))
      setImageUrls((prev) => [...prev, ...results.map((r) => r.url)])
    } catch {
      setUploadError('Upload failed. Try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleRemoveImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Variant image handlers ─────────────────────────────────────────────────
  async function handleVariantFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    const localPreview = URL.createObjectURL(file)
    setVariantImages((prev) => {
      const next = [...prev]
      next[index] = { preview: localPreview, uploading: true, error: null }
      return next
    })

    try {
      const result = await uploadProductImage(file)
      form.setValue(`variants.${index}.imageUrl`, result.url)
      setVariantImages((prev) => {
        const next = [...prev]
        next[index] = { preview: localPreview, uploading: false, error: null }
        return next
      })
    } catch {
      setVariantImages((prev) => {
        const next = [...prev]
        next[index] = {
          preview:  prev[index]?.preview ?? '',
          uploading: false,
          error:    'Upload failed.',
        }
        return next
      })
    }
  }

  function handleRemoveVariantImage(index: number) {
    form.setValue(`variants.${index}.imageUrl`, '')
    setVariantImages((prev) => {
      const next = [...prev]
      next[index] = { preview: '', uploading: false, error: null }
      return next
    })
    const ref = variantFileRefs.current[index]
    if (ref) ref.value = ''
  }

  function addVariant() {
    const newVariant: VariantValues = { sku: '', name: '', price: 0, stock: 0, imageUrl: '' }
    append(newVariant)
  }

  function removeVariant(index: number) {
    remove(index)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(values: FormValues) {
    const payload = {
      name:           values.name,
      description:    values.description,
      price:          values.price,
      compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : undefined,
      stock:          values.stock,
      categoryId:     values.categoryId,
      brandId:        values.brandId,
      isActive:       values.isActive,
      imageUrls:      imageUrls.length ? imageUrls : undefined,
      variants:       values.variants?.map((v) => ({
        sku:      v.sku,
        name:     v.name,
        price:    v.price,
        stock:    v.stock,
        imageUrl: v.imageUrl || undefined,
      })),
    }

    if (isEdit && productId) {
      await updateProduct({ id: productId, payload })
    } else {
      await createProduct(payload)
    }

    navigate({ to: '/admin/products' })
  }

  if (isEdit && !existing && !adminProducts) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  const anyUploading = uploading || variantImages.some((v) => v.uploading)


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="-ml-2" asChild>
          <Link to="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageTitle>
          {isEdit ? (existing ? `Edit: ${existing.name}` : 'Edit product') : 'New product'}
        </PageTitle>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* ── Main fields ── */}
          <div className="flex flex-col gap-4 lg:col-span-2">

            {/* Basic info */}
            <div className="rounded-xl border border-secondary/20 bg-surface p-6">
              <h2 className="mb-4 text-sm font-semibold text-text">Basic info</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder='MacBook Pro 16"' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea
                          rows={4}
                          placeholder="Describe the product…"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Pricing & stock */}
            <div className="rounded-xl border border-secondary/20 bg-surface p-6">
              <h2 className="mb-4 text-sm font-semibold text-text">Pricing & stock</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compareAtPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compare at ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Optional"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Variants */}
            <div className="rounded-xl border border-secondary/20 bg-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text">Variants</h2>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add variant
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-sm text-muted">
                  No variants yet. Add one for options like color or storage.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {fields.map((field, index) => {
                    const imgState = variantImages[index] ?? { preview: '', uploading: false, error: null }
                    return (
                      <div
                        key={field.id}
                        className="rounded-lg border border-secondary/15 bg-background p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted uppercase tracking-wide">
                            Variant {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <FormField
                            control={form.control}
                            name={`variants.${index}.name`}
                            render={({ field: f }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Space Gray" {...f} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`variants.${index}.sku`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                  <Input placeholder="MBP-SG-16" {...f} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`variants.${index}.price`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormLabel>Price ($)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" min="0" {...f} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`variants.${index}.stock`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormLabel>Stock</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" {...f} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Variant image */}
                        <div className="mt-3">
                          <p className="mb-1.5 text-xs font-medium text-text">Image</p>
                          <input
                            ref={(el) => { variantFileRefs.current[index] = el }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleVariantFileChange(e, index)}
                          />
                          {imgState.preview ? (
                            <div className="flex items-center gap-3">
                              <div className="relative h-16 w-16 shrink-0">
                                <img
                                  src={imgState.preview}
                                  alt={`Variant ${index + 1}`}
                                  className="h-full w-full rounded-lg object-cover"
                                />
                                {imgState.uploading && (
                                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                                    <Spinner />
                                  </div>
                                )}
                                {!imgState.uploading && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariantImage(index)}
                                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                              {!imgState.uploading && (
                                <button
                                  type="button"
                                  onClick={() => variantFileRefs.current[index]?.click()}
                                  className="text-xs font-medium text-primary hover:underline"
                                >
                                  Replace
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => variantFileRefs.current[index]?.click()}
                              className="flex items-center gap-2 rounded-lg border border-dashed border-secondary/30 px-4 py-2.5 text-xs text-muted transition hover:border-primary/40 hover:text-primary"
                            >
                              <ImagePlus className="h-4 w-4" />
                              Upload image
                            </button>
                          )}
                          {imgState.error && (
                            <p className="mt-1 text-xs text-red-500">{imgState.error}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="flex flex-col gap-4">
            {/* Product images */}
            <div className="rounded-xl border border-secondary/20 bg-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text">Images</h2>
                <span className="text-xs text-muted">{imageUrls.length}/{MAX_IMAGES}</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              {imageUrls.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {imageUrls.map((url, i) => (
                    <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-secondary/20 bg-background">
                      {i === 0 && (
                        <span className="absolute left-1 top-1 z-10 rounded bg-primary px-1 py-0.5 text-[10px] font-bold text-white leading-none">
                          Main
                        </span>
                      )}
                      <img src={url} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {imageUrls.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className={cn(
                        'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-secondary/30 text-muted transition',
                        'hover:border-primary/40 hover:text-primary disabled:opacity-50',
                      )}
                    >
                      {uploading
                        ? <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        : <ImagePlus className="h-5 w-5" />
                      }
                      <span className="text-[10px]">Add</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-secondary/30 py-8 text-muted transition hover:border-primary/40 hover:text-primary disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <ImagePlus className="h-8 w-8" />
                  )}
                  <span className="text-sm font-medium">Click to upload</span>
                  <span className="text-xs">PNG, JPG, WEBP · hasta {MAX_IMAGES} imágenes</span>
                </button>
              )}

              {uploadError && (
                <p className="mt-2 text-xs text-red-500">{uploadError}</p>
              )}
            </div>

            {/* Organization */}
            <div className="rounded-xl border border-secondary/20 bg-surface p-6">
              <h2 className="mb-4 text-sm font-semibold text-text">Organization</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === 'true')}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={form.formState.isSubmitting || anyUploading}>
                {isEdit ? 'Save changes' : 'Create product'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/admin/products">Cancel</Link>
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

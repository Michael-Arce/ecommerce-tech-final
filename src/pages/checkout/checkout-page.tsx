import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown, ChevronUp, MapPin, User, Wand2, Truck, Store } from 'lucide-react'
import { calculateSubtotal, calculateTax, calculateTotal } from '@/entities/cart'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  PageTitle,
} from '@/shared/ui'
import { OrderSummary } from '@/widgets/order-summary'
import { useCartStore } from '@/entities/cart'
import { usePlaceOrder } from '@/entities/order'

const formatCOP = (price: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(price)
}

const checkoutSchema = z.object({
  deliveryMethod: z.enum(['shipping', 'pickup']),
  fullName: z.string().min(1, 'Requerido'),
  email: z.string().email('Correo inválido'),
  phone: z.string().min(10, 'Mínimo 10 dígitos'),
  documentId: z.string().min(5, 'Requerido'),
  city: z.string().optional(),
  address: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.deliveryMethod === 'shipping') {
    if (!data.city || data.city.trim() === '') {
      ctx.addIssue({ path: ['city'], code: z.ZodIssueCode.custom, message: 'Requerido' })
    }
    if (!data.address || data.address.trim() === '') {
      ctx.addIssue({ path: ['address'], code: z.ZodIssueCode.custom, message: 'Requerido' })
    }
  }
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export function CheckoutPage() {
  const { t } = useTranslation()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const { mutateAsync: placeOrder } = usePlaceOrder()
  const navigate = useNavigate()
  const isPlacingOrder = useRef(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [isManualSubmitting, setIsManualSubmitting] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryMethod: 'shipping',
      fullName: '',
      email: '',
      phone: '',
      documentId: '',
      city: '',
      address: '',
    },
  })

  const deliveryMethod = form.watch('deliveryMethod')

  const subtotal = calculateSubtotal(items)
  const tax = calculateTax(subtotal, 0.1)
  const shippingCost = deliveryMethod === 'shipping' && subtotal < 99000 ? 15000 : 0
  const total = calculateTotal(subtotal, tax) + shippingCost

  useEffect(() => {
    if (items.length === 0 && !isPlacingOrder.current) {
      navigate({ to: '/cart' })
    }
  }, [items.length, navigate])

  function fillDemo() {
    form.reset({
      deliveryMethod: 'shipping',
      fullName: 'Juan Pérez',
      email: 'juan.perez@example.com',
      phone: '3001234567',
      documentId: '1020304050',
      city: 'Bogotá',
      address: 'Calle 123 # 45-67',
    })
  }

  async function onSubmit(data: CheckoutFormValues) {
    isPlacingOrder.current = true
    setOrderError(null)
    try {
      const res = await placeOrder({
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
        deliveryMethod: data.deliveryMethod,
        shippingAddress: data.deliveryMethod === 'shipping' ? {
          street: data.address || '',
          city: data.city || '',
          country: 'Colombia',
          cedula: data.documentId,
          celular: data.phone,
        } : {
          street: 'Recogida en tienda',
          city: 'N/A',
          country: 'Colombia',
          cedula: data.documentId,
          celular: data.phone,
        },
      })

      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl
      } else {
        clearCart()
        navigate({ to: '/checkout/confirmation/$orderId', params: { orderId: res.data.id } })
      }
    } catch {
      isPlacingOrder.current = false
      setOrderError(t('checkout.orderError') || 'Error al procesar la orden')
    }
  }

  async function handleManualPayment() {
    const isValid = await form.trigger()
    if (!isValid) return

    setIsManualSubmitting(true)
    setOrderError(null)
    try {
      const data = form.getValues()
      const res = await placeOrder({
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
        deliveryMethod: data.deliveryMethod,
        shippingAddress: data.deliveryMethod === 'shipping' ? {
          street: data.address || '',
          city: data.city || '',
          country: 'Colombia',
          cedula: data.documentId,
          celular: data.phone,
        } : {
          street: 'Recogida en tienda',
          city: 'N/A',
          country: 'Colombia',
          cedula: data.documentId,
          celular: data.phone,
        },
      })

      const mensaje = `Hola, quiero reportar el pago de mi pedido #${res.data.id} por un total de ${formatCOP(total)}.`
      clearCart()
      window.location.href = `https://wa.me/573000000000?text=${encodeURIComponent(mensaje)}`
    } catch {
      setIsManualSubmitting(false)
      setOrderError(t('checkout.orderError') || 'Error al procesar la orden')
    }
  }

  if (items.length === 0) return null

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 pb-28 lg:pb-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <PageTitle>{t('checkout.title')}</PageTitle>
        <button
          type="button"
          onClick={fillDemo}
          className="flex items-center gap-1.5 rounded-lg border border-secondary/20 bg-surface px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-primary/30 hover:text-primary"
        >
          <Wand2 className="h-3.5 w-3.5" />
          Llenar Demo
        </button>
      </div>

      <Form {...form}>
        <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-8 lg:grid-cols-3">

            {/* ── Form sections ── */}
            <div className="flex flex-col gap-8 lg:col-span-2">

              {/* Customer Data */}
              <section className="rounded-xl border border-secondary/20 bg-surface p-4 sm:p-6">
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-text">Datos del Cliente</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="juan@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Celular</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="300 123 4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="documentId"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Cédula de Ciudadanía</FormLabel>
                        <FormControl>
                          <Input placeholder="1020304050" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Delivery Method */}
              <section className="rounded-xl border border-secondary/20 bg-surface p-4 sm:p-6">
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Truck className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-text">Método de Entrega</h2>
                </div>

                <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label
                            className={`flex cursor-pointer flex-col rounded-lg border p-4 transition-colors ${
                              field.value === 'shipping'
                                ? 'border-primary bg-primary/5'
                                : 'border-secondary/20 bg-background hover:border-primary/30'
                            }`}
                            onClick={() => field.onChange('shipping')}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-text flex items-center gap-2">
                                <Truck className="h-4 w-4" /> Envío a domicilio
                              </span>
                              <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${field.value === 'shipping' ? 'border-primary' : 'border-secondary/30'}`}>
                                {field.value === 'shipping' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                              </div>
                            </div>
                            <span className="mt-2 text-xs text-secondary">Recibí tu pedido en la puerta de tu casa.</span>
                          </label>

                          <label
                            className={`flex cursor-pointer flex-col rounded-lg border p-4 transition-colors ${
                              field.value === 'pickup'
                                ? 'border-primary bg-primary/5'
                                : 'border-secondary/20 bg-background hover:border-primary/30'
                            }`}
                            onClick={() => field.onChange('pickup')}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-text flex items-center gap-2">
                                <Store className="h-4 w-4" /> Recoger en tienda
                              </span>
                              <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${field.value === 'pickup' ? 'border-primary' : 'border-secondary/30'}`}>
                                {field.value === 'pickup' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                              </div>
                            </div>
                            <span className="mt-2 text-xs text-secondary">Retirá gratis en nuestra sucursal.</span>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {/* Shipping */}
              {deliveryMethod === 'shipping' && (
                <section className="rounded-xl border border-secondary/20 bg-surface p-4 sm:p-6">
                  <div className="mb-5 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-base font-semibold text-text">Dirección de Envío</h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input placeholder="Bogotá" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Input placeholder="Calle 123 # 45-67" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              )}

            </div>

            {/* ── Order summary (desktop only) ── */}
            <div className="hidden lg:flex lg:flex-col lg:gap-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-secondary/20 bg-surface p-6">
                <h2 className="mb-4 text-base font-semibold text-text">{t('checkout.yourOrder')}</h2>
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                      <li
                      key={`${item.productId}-${item.variantId ?? ''}`}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={item.imageUrl || 'https://placehold.co/48x48/F9FAFB/6B7280?text=...'}
                        alt={item.name}
                        className="h-12 w-12 shrink-0 rounded-lg bg-background object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text">{item.name}</p>
                        <p className="text-xs text-secondary">{t('checkout.qty', { count: item.quantity })}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-primary">
                        {formatCOP(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nota: OrderSummary normalmente renderiza subtotales, se deja igual y el formato COP aplica en local */}
              <OrderSummary items={items} />
              {shippingCost > 0 && (
                <div className="flex justify-between text-sm mt-[-10px] mb-2 px-2 text-secondary">
                  <span>Envío</span><span>{formatCOP(shippingCost)}</span>
                </div>
              )}
              {deliveryMethod === 'pickup' && (
                <div className="flex justify-between text-sm mt-[-10px] mb-2 px-2 text-emerald-600 font-medium">
                  <span>Envío</span><span>Gratis (Recogida)</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-text border-t border-secondary/10 pt-3 px-2 mb-4">
                <span>Total Final</span><span className="text-primary">{formatCOP(total)}</span>
              </div>

              {orderError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {orderError}
                </p>
              )}
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-[#00E676] hover:bg-[#00C853] text-black border-none"
                  disabled={form.formState.isSubmitting || isManualSubmitting}
                >
                  {form.formState.isSubmitting ? 'Procesando...' : 'Continuar a pago con Addi'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleManualPayment}
                  disabled={form.formState.isSubmitting || isManualSubmitting}
                >
                  {isManualSubmitting ? 'Procesando...' : 'Pagar con Transferencia / Nequi'}
                </Button>
              </div>
            </div>

          </div>
        </form>
      </Form>

      {/* ── Sticky bottom bar — mobile only ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-secondary/20 bg-surface/95 backdrop-blur-sm">
        {/* Collapsible summary */}
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm"
        >
          <span className="font-medium text-text">{t('checkout.orderSummary')}</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-text">{formatCOP(total)}</span>
            {summaryOpen ? <ChevronDown className="h-4 w-4 text-muted" /> : <ChevronUp className="h-4 w-4 text-muted" />}
          </div>
        </button>

        {summaryOpen && (
          <div className="border-t border-secondary/10 px-4 py-3 text-sm">
            <div className="flex justify-between text-secondary">
              <span>{t('checkout.subtotal')}</span><span>{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between text-secondary mt-1">
              <span>{t('checkout.tax')}</span><span>{formatCOP(tax)}</span>
            </div>
            {shippingCost > 0 && (
              <div className="flex justify-between text-secondary mt-1">
                <span>Envío</span><span>{formatCOP(shippingCost)}</span>
              </div>
            )}
            {deliveryMethod === 'pickup' && (
              <div className="flex justify-between text-emerald-600 font-medium mt-1">
                <span>Envío</span><span>Gratis (Recogida)</span>
              </div>
            )}
            <div className="mt-2 flex justify-between font-bold text-text border-t border-secondary/10 pt-2">
              <span>{t('checkout.total')}</span><span>{formatCOP(total)}</span>
            </div>
          </div>
        )}

        <div className="px-4 pb-4">
          {orderError && (
            <p className="mb-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {orderError}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              size="lg"
              form="checkout-form"
              className="w-full bg-[#00E676] hover:bg-[#00C853] text-black border-none"
              disabled={form.formState.isSubmitting || isManualSubmitting}
            >
              {form.formState.isSubmitting ? 'Procesando...' : 'Continuar a pago con Addi'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleManualPayment}
              disabled={form.formState.isSubmitting || isManualSubmitting}
            >
              {isManualSubmitting ? 'Procesando...' : 'Pagar con Transferencia / Nequi'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
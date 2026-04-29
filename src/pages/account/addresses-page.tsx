import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Plus, Star, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  EmptyState,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  PageTitle,
  Spinner,
} from '@/shared/ui'
import {
  useAddresses,
  useCreateAddress,
  useSetDefaultAddress,
  useDeleteAddress,
} from '@/entities/address'

const addressSchema = z.object({
  street:  z.string().min(1, 'Required'),
  city:    z.string().min(1, 'Required'),
  state:   z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  zipCode: z.string().min(3, 'Invalid ZIP'),
})

type AddressFormValues = z.infer<typeof addressSchema>

export function AddressesPage() {
  const { t } = useTranslation()
  const { data: addresses = [], isLoading } = useAddresses()
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress()
  const { mutate: setDefault, isPending: isSettingDefault, variables: defaultVars } = useSetDefaultAddress()
  const { mutate: removeAddress, isPending: isDeleting, variables: deleteVars } = useDeleteAddress()

  const [showForm, setShowForm] = useState(false)

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { street: '', city: '', state: '', country: '', zipCode: '' },
  })

  function onSubmit(values: AddressFormValues) {
    createAddress(
      { ...values, isDefault: addresses.length === 0 },
      {
        onSuccess: () => {
          setShowForm(false)
          form.reset()
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <PageTitle>{t('account.addresses.title')}</PageTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {t('account.addresses.addAddress')}
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-secondary/20 bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">{t('account.addresses.newAddress')}</h3>
            <button
              type="button"
              onClick={() => { setShowForm(false); form.reset() }}
              className="text-secondary hover:text-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('account.addresses.street')}</FormLabel>
                    <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('account.addresses.city')}</FormLabel>
                      <FormControl><Input placeholder="New York" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('account.addresses.state')}</FormLabel>
                      <FormControl><Input placeholder="NY" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('account.addresses.zipCode')}</FormLabel>
                      <FormControl><Input placeholder="10001" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('account.addresses.country')}</FormLabel>
                      <FormControl><Input placeholder="United States" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={isCreating}>{t('account.addresses.saveAddress')}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); form.reset() }}>
                  {t('account.addresses.cancel')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {addresses.length === 0 ? (
        <EmptyState
          message={t('account.addresses.empty')}
          description={t('account.addresses.emptyDesc')}
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t('account.addresses.addAddress')}
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {addresses.map((addr) => {
            const pendingDefault = isSettingDefault && defaultVars === addr.id
            const pendingDelete  = isDeleting && deleteVars === addr.id

            return (
              <li
                key={addr.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-secondary/20 bg-surface p-5"
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{addr.street}</p>
                    <p className="mt-0.5 text-sm text-secondary">
                      {addr.city}, {addr.state} {addr.zipCode}
                    </p>
                    <p className="text-sm text-secondary">{addr.country}</p>
                    {addr.isDefault && (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        <Star className="h-3 w-3 fill-current" />
                        {t('account.addresses.default')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  {!addr.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pendingDefault || pendingDelete}
                      onClick={() => setDefault(addr.id)}
                    >
                      {pendingDefault ? t('account.addresses.saving') : t('account.addresses.setDefault')}
                    </Button>
                  )}
                  <button
                    type="button"
                    disabled={pendingDelete}
                    onClick={() => removeAddress(addr.id)}
                    className="text-secondary hover:text-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={t('account.addresses.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

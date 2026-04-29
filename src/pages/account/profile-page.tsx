import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
import { useAuthStore } from '@/features/authenticate'
import { useUpdateProfile } from '@/entities/user'
import { formatDate } from '@/shared/lib/format-date'

const profileSchema = z.object({
  firstName: z.string().min(2, 'At least 2 characters'),
  lastName: z.string().min(2, 'At least 2 characters'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile()
  const [editing, setEditing] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' },
  })

  if (!user) return null

  async function onSubmit(values: ProfileFormValues) {
    const res = await updateProfile(values)
    setUser({ ...user!, ...res.data })
    setEditing(false)
  }

  const fields = [
    { label: t('account.profile.email'),       value: user.email },
    { label: t('account.profile.memberSince'), value: formatDate(user.createdAt) },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <PageTitle>{t('account.profile.title')}</PageTitle>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            {t('account.profile.edit')}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => { setEditing(false); form.reset() }}>
            <X className="mr-1.5 h-3.5 w-3.5" />
            {t('account.profile.cancel')}
          </Button>
        )}
      </div>

      {editing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('account.profile.firstName')}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('account.profile.lastName')}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending ? t('account.profile.saving') : t('account.profile.saveChanges')}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setEditing(false); form.reset() }}>
                {t('account.profile.cancel')}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="rounded-xl border border-secondary/20 bg-surface">
          {[
            { label: t('account.profile.firstName'), value: user.firstName },
            { label: t('account.profile.lastName'),  value: user.lastName },
            ...fields,
          ].map((f, i, arr) => (
            <div
              key={f.label}
              className={[
                'flex items-center justify-between px-6 py-4',
                i < arr.length - 1 ? 'border-b border-secondary/10' : '',
              ].join(' ')}
            >
              <span className="text-sm text-secondary">{f.label}</span>
              <span className="text-sm font-medium text-text">{f.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

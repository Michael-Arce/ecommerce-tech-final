import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  AlertDescription,
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
import { useChangePassword } from '@/entities/user'
import type { ApiError } from '@/shared/types/api.types'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword:     z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export function PasswordChangePage() {
  const { t } = useTranslation()
  const { mutateAsync: changePassword } = useChangePassword()
  const [success, setSuccess] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(values: PasswordFormValues) {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword:     values.newPassword,
      })
      setSuccess(true)
      form.reset()
    } catch (err) {
      const apiError = err as ApiError
      form.setError('currentPassword', {
        message: apiError.message ?? t('account.password.incorrectCurrent'),
      })
    }
  }

  return (
    <div>
      <PageTitle className="mb-6">{t('account.password.title')}</PageTitle>

      {success && (
        <Alert className="mb-6 border-emerald-500/30 bg-emerald-500/10">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-700">
            {t('account.password.success')}
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-md rounded-xl border border-secondary/20 bg-surface p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('account.password.current')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('account.password.new')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('account.password.confirm')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? t('account.password.saving') : t('account.password.update')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

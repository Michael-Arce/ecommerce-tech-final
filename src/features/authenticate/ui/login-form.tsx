import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
} from '@/shared/ui'
import type { ApiError } from '@/shared/types/api.types'
import { useLogin } from '../model/use-login'

interface LoginFormProps {
  onSuccess?: () => void
  prefill?: { email: string; password: string }
}

export function LoginForm({ onSuccess, prefill }: LoginFormProps) {
  const { t } = useTranslation()
  const { mutate: login, isPending, error } = useLogin()
  const apiError = error as ApiError | null

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('auth.login.emailInvalid')),
        password: z.string().min(8, t('auth.login.passwordMin')),
      }),
    [t],
  )

  type LoginFormValues = z.infer<typeof loginSchema>

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    if (prefill) {
      form.setValue('email', prefill.email, { shouldValidate: false, shouldDirty: true })
      form.setValue('password', prefill.password, { shouldValidate: false, shouldDirty: true })
    }
  }, [prefill, form])

  function onSubmit(values: LoginFormValues) {
    login(values, { onSuccess })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        {apiError && (
          <Alert variant="destructive">
            <AlertDescription>{apiError.message}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={(props) => (
            <FormItem>
              <FormLabel>{t('auth.login.emailLabel')}</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...props.field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={(props) => (
            <FormItem>
              <FormLabel>{t('auth.login.passwordLabel')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...props.field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? t('auth.login.signingIn') : t('auth.login.signIn')}
        </Button>
      </form>
    </Form>
  )
}

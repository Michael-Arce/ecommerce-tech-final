import { useMemo } from 'react'
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
import { useRegister } from '../model/use-register'

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { t } = useTranslation()
  const { mutate: register, isPending, error } = useRegister()
  const apiError = error as ApiError | null

  const registerSchema = useMemo(
    () =>
      z
        .object({
          firstName: z.string().min(2, t('auth.register.firstNameMin')),
          lastName: z.string().min(2, t('auth.register.lastNameMin')),
          email: z.string().email(t('auth.register.emailInvalid')),
          password: z.string().min(8, t('auth.register.passwordMin')),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t('auth.register.passwordsNoMatch'),
          path: ['confirmPassword'],
        }),
    [t],
  )

  type RegisterFormValues = z.infer<typeof registerSchema>

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  function onSubmit({ confirmPassword: _confirmPassword, ...values }: RegisterFormValues) {
    register(values, { onSuccess })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={(props) => (
              <FormItem>
                <FormLabel>{t('auth.register.firstNameLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...props.field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={(props) => (
              <FormItem>
                <FormLabel>{t('auth.register.lastNameLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...props.field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={(props) => (
            <FormItem>
              <FormLabel>{t('auth.register.emailLabel')}</FormLabel>
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
              <FormLabel>{t('auth.register.passwordLabel')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...props.field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={(props) => (
            <FormItem>
              <FormLabel>{t('auth.register.confirmPasswordLabel')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...props.field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {apiError && (
          <Alert variant="destructive">
            <AlertDescription>{apiError.message}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? t('auth.register.creatingAccount') : t('auth.register.createAccount')}
        </Button>
      </form>
    </Form>
  )
}

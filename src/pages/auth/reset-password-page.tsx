import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { KeyRound, TriangleAlert } from 'lucide-react'
import {
  Alert, AlertDescription,
  Button,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
  Input,
} from '@/shared/ui'
import { useResetPassword } from '@/entities/user'

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { token?: string }
  const token = search.token

  const [error, setError] = useState<string | null>(null)
  const { mutateAsync: resetPassword } = useResetPassword()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function handleSubmit(values: FormValues) {
    if (!token) return
    setError(null)
    try {
      await resetPassword({ token, password: values.password })
      await navigate({ to: '/login', search: { returnUrl: undefined } })
    } catch {
      setError('This reset link is invalid or has expired.')
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-text">Invalid link</h1>
        <p className="mt-2 text-sm text-secondary">
          This password reset link is missing or expired.
        </p>
        <div className="mt-6">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Request a new link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-text">Set a new password</h1>
        <p className="mt-1 text-sm text-secondary">
          Choose a strong password for your account.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                    autoComplete="new-password"
                    {...field}
                  />
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
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Repeat your new password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            Reset password
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-secondary">
        <Link to="/login" className="font-medium text-secondary hover:text-text">
          ← Back to login
        </Link>
      </p>
    </div>
  )
}

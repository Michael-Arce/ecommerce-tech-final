import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, Mail } from 'lucide-react'
import {
  Button,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
  Input,
} from '@/shared/ui'
import type { Resolver } from 'react-hook-form'
import { useForgotPassword } from '@/entities/user'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const { mutateAsync: forgotPassword } = useForgotPassword()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { email: '' },
  })

  async function handleSubmit({ email }: FormValues) {
    await forgotPassword(email)
    setSubmittedEmail(email)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-text">Check your inbox</h1>
        <p className="mt-2 text-sm text-secondary">
          We sent a password reset link to{' '}
          <span className="font-semibold text-text">{submittedEmail}</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          Didn't get it? Check your spam folder or{' '}
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="font-medium text-primary hover:underline"
          >
            try again
          </button>
          .
        </p>
        <div className="mt-8">
          <Link to="/login" className="text-sm font-medium text-secondary hover:text-text">
            ← Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-text">Forgot your password?</h1>
        <p className="mt-1 text-sm text-secondary">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            Send reset link
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-secondary">
        Remember it?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  )
}

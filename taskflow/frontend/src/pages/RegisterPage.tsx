import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/Button'
import { FormField, Input } from '@/components/ui/Field'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getErrorMessage, normalizeApiError } from '@/lib/errors'

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Use at least 3 characters.')
      .max(150, 'Keep your username under 150 characters.')
      .regex(
        /^[\w.@+-]+$/,
        'Use letters, numbers and @/./+/-/_ only.',
      ),
    email: z.email('Enter a valid email address.').max(254),
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .max(128, 'Keep your password under 128 characters.'),
    password_confirm: z.string().min(1, 'Confirm your password.'),
  })
  .refine((data) => data.password === data.password_confirm, {
    path: ['password_confirm'],
    message: 'Passwords do not match.',
  })

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  useDocumentTitle('Create your account')
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      password_confirm: '',
    },
  })

  const submit = handleSubmit(async (values) => {
    setServerError(null)
    setIsSubmitting(true)
    try {
      await registerUser(values)
      toast.success('Your workspace is ready')
      navigate('/app', { replace: true })
    } catch (error) {
      const apiError = normalizeApiError(error)
      let mapped = false
      for (const field of [
        'username',
        'email',
        'password',
        'password_confirm',
      ] as const) {
        if (apiError.fields[field]) {
          setError(field, {
            type: 'server',
            message: apiError.fields[field],
          })
          mapped = true
        }
      }
      if (!mapped) {
        setServerError(getErrorMessage(error))
      }
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <AuthLayout>
      <div className="animate-rise-in">
        <p className="eyebrow">Get started</p>
        <h1 className="mt-2 font-display text-[30px] font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-[34px]">
          Make room for focused work.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Create your private workspace. No setup maze, no clutter — just a
          clear place to plan and finish.
        </p>

        {serverError ? (
          <div
            className="mt-6 rounded-xl border border-red-200 bg-danger-soft px-3.5 py-3 text-sm text-danger"
            role="alert"
          >
            {serverError}
          </div>
        ) : null}

        <form onSubmit={submit} noValidate className="mt-7 space-y-4">
          <FormField
            label="Username"
            htmlFor="register-username"
            error={errors.username?.message}
            hint="This is how you will appear in your workspace."
          >
            <Input
              id="register-username"
              autoFocus
              autoComplete="username"
              placeholder="e.g. alexmorgan"
              invalid={Boolean(errors.username)}
              aria-describedby={
                errors.username
                  ? 'register-username-error'
                  : 'register-username-hint'
              }
              {...register('username')}
            />
          </FormField>

          <FormField
            label="Email address"
            htmlFor="register-email"
            error={errors.email?.message}
          >
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? 'register-email-error' : undefined
              }
              {...register('email')}
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="register-password"
            error={errors.password?.message}
            hint="At least 8 characters. Avoid common or entirely numeric passwords."
          >
            <PasswordInput
              id="register-password"
              autoComplete="new-password"
              placeholder="Create a password"
              invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password
                  ? 'register-password-error'
                  : 'register-password-hint'
              }
              {...register('password')}
            />
          </FormField>

          <FormField
            label="Confirm password"
            htmlFor="register-password-confirm"
            error={errors.password_confirm?.message}
          >
            <PasswordInput
              id="register-password-confirm"
              autoComplete="new-password"
              placeholder="Repeat your password"
              invalid={Boolean(errors.password_confirm)}
              aria-describedby={
                errors.password_confirm
                  ? 'register-password-confirm-error'
                  : undefined
              }
              {...register('password_confirm')}
            />
          </FormField>

          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full"
            loading={isSubmitting}
          >
            Create my workspace
          </Button>
        </form>

        <p className="mt-4 text-center text-[11px] leading-5 text-subtle">
          Your account starts empty and private. You can create your first
          project in the next step.
        </p>

        <div className="mt-5 flex items-center justify-center gap-1 text-sm text-muted">
          Already have an account?
          <Link
            to="/login"
            className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

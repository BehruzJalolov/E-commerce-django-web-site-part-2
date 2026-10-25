import { zodResolver } from '@hookform/resolvers/zod'
import { LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/Button'
import { FormField, Input } from '@/components/ui/Field'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getErrorMessage, normalizeApiError } from '@/lib/errors'

const loginSchema = z.object({
  login: z.string().trim().min(1, 'Enter your email or username.'),
  password: z.string().min(1, 'Enter your password.'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  useDocumentTitle('Sign in')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: '', password: '' },
  })

  const submit = handleSubmit(async (values) => {
    setServerError(null)
    setIsSubmitting(true)
    try {
      await login(values)
      const state = location.state as { from?: string } | null
      const destination =
        state?.from && state.from.startsWith('/app') ? state.from : '/app'
      toast.success('Welcome back')
      navigate(destination, { replace: true })
    } catch (error) {
      const apiError = normalizeApiError(error)
      let hasFieldError = false
      for (const field of ['login', 'password'] as const) {
        if (apiError.fields[field]) {
          setError(field, {
            type: 'server',
            message: apiError.fields[field],
          })
          hasFieldError = true
        }
      }
      if (!hasFieldError) {
        setServerError(getErrorMessage(error))
      }
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <AuthLayout>
      <div className="animate-rise-in">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-2 font-display text-[30px] font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-[34px]">
          Pick up where you left off.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Sign in to see your projects, priorities and next clear action.
        </p>

        {serverError ? (
          <div
            className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-danger-soft px-3.5 py-3 text-sm text-danger"
            role="alert"
          >
            <LockKeyhole
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{serverError}</span>
          </div>
        ) : null}

        <form onSubmit={submit} noValidate className="mt-7 space-y-4">
          <FormField
            label="Email or username"
            htmlFor="login-identifier"
            error={errors.login?.message}
          >
            <Input
              id="login-identifier"
              autoFocus
              autoComplete="username"
              placeholder="you@example.com"
              invalid={Boolean(errors.login)}
              aria-describedby={
                errors.login ? 'login-identifier-error' : undefined
              }
              {...register('login')}
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="login-password"
            error={errors.password?.message}
          >
            <PasswordInput
              id="login-password"
              autoComplete="current-password"
              placeholder="Enter your password"
              invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'login-password-error' : undefined
              }
              {...register('password')}
            />
          </FormField>

          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full"
            loading={isSubmitting}
          >
            Sign in
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1 text-sm text-muted">
          New to TaskFlow?
          <Link
            to="/register"
            className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
          >
            Create an account
          </Link>
        </div>

        <div className="mt-9 flex items-start gap-2.5 rounded-xl border border-line bg-slate-50/70 px-3.5 py-3">
          <LockKeyhole
            className="mt-0.5 size-4 shrink-0 text-muted"
            aria-hidden="true"
          />
          <p className="text-[11px] leading-5 text-muted">
            You are signing in with a secure, HTTP-only session. Your password
            is never stored in the browser.
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { BadgeCheck, BookOpen, CalendarDays, CircleAlert, KeyRound, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FormField, Input } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/PageHeader'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/dates'
import {
  getErrorMessage,
  getFieldError,
  normalizeApiError,
} from '@/lib/errors'
import { getDisplayName } from '@/lib/utils'
import type {
  PasswordChangePayload,
  ProfilePayload,
  User,
} from '@/types/api'

const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Use at least 3 characters.')
    .max(150, 'Keep your username under 150 characters.')
    .regex(/^[\w.@+-]+$/, 'Use letters, numbers and @/./+/-/_ only.'),
  email: z.email('Enter a valid email address.').max(254),
  first_name: z.string().trim().max(150, 'Keep your first name under 150 characters.'),
  last_name: z.string().trim().max(150, 'Keep your last name under 150 characters.'),
})

type ProfileValues = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    old_password: z.string().min(1, 'Enter your current password.'),
    new_password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .max(128, 'Keep your password under 128 characters.'),
    new_password_confirm: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((values) => values.new_password === values.new_password_confirm, {
    path: ['new_password_confirm'],
    message: 'Passwords do not match.',
  })

type PasswordValues = z.infer<typeof passwordSchema>

export function ProfilePage() {
  useDocumentTitle('Profile & settings')
  const { user, updateUser } = useAuth()
  const name = getDisplayName(user)

  return (
    <div className="page-shell max-w-[1120px]">
      <PageHeader
        eyebrow="Account"
        title="Profile & settings"
        description="Keep your account details current and protect access to your workspace."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <ProfileDetailsCard
            name={name}
            onUpdated={(updated) => {
              updateUser(updated)
            }}
          />
          <PasswordCard />
        </div>

        <aside className="space-y-4">
          <section className="card p-5">
            <div className="flex items-center gap-3">
              <Avatar name={name} size="xl" />
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-ink">{name}</h2>
                <p className="mt-0.5 truncate text-xs text-muted">
                  @{user?.username}
                </p>
                <Badge tone="brand" className="mt-2">
                  <BadgeCheck className="size-3" aria-hidden="true" />
                  Personal workspace
                </Badge>
              </div>
            </div>

            <dl className="mt-5 space-y-3.5 border-t border-line pt-4 text-xs">
              <div className="flex items-start gap-2.5">
                <Mail
                  className="mt-0.5 size-4 shrink-0 text-subtle"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-[10px] font-medium text-subtle">
                    Email address
                  </dt>
                  <dd className="mt-0.5 break-all font-semibold text-ink">
                    {user?.email}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CalendarDays
                  className="mt-0.5 size-4 shrink-0 text-subtle"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-[10px] font-medium text-subtle">
                    Member since
                  </dt>
                  <dd className="mt-0.5 font-semibold text-ink">
                    {user?.date_joined ? formatDate(user.date_joined) : '—'}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <UserRound
                  className="mt-0.5 size-4 shrink-0 text-subtle"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-[10px] font-medium text-subtle">
                    Username
                  </dt>
                  <dd className="mt-0.5 font-semibold text-ink">
                    {user?.username}
                  </dd>
                </div>
              </div>
            </dl>
          </section>

          <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-positive" aria-hidden="true" />
              <h2 className="text-sm font-bold text-ink">Session security</h2>
            </div>
            <ul className="mt-3 space-y-3 text-[11px] leading-5 text-muted">
              <li className="flex items-start gap-2">
                <LockKeyhole
                  className="mt-0.5 size-3.5 shrink-0 text-subtle"
                  aria-hidden="true"
                />
                Authentication uses an HTTP-only session cookie and CSRF
                protection. Credentials are never kept in browser storage.
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck
                  className="mt-0.5 size-3.5 shrink-0 text-subtle"
                  aria-hidden="true"
                />
                Every project and task request is checked against your account
                on the server.
              </li>
            </ul>
            <a
              href="/api/docs/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 hover:text-brand-800"
            >
              <BookOpen className="size-3.5" aria-hidden="true" />
              View API documentation
            </a>
          </section>
        </aside>
      </div>
    </div>
  )
}

function ProfileDetailsCard({
  name,
  onUpdated,
}: {
  name: string
  onUpdated: (user: User) => void
}) {
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username ?? '',
      email: user?.email ?? '',
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: ProfilePayload) => api.updateProfile(payload),
    onSuccess: (updated) => {
      onUpdated(updated)
      reset({
        username: updated.username,
        email: updated.email,
        first_name: updated.first_name,
        last_name: updated.last_name,
      })
      toast.success('Profile updated', {
        description: 'Your account details have been saved.',
      })
    },
    onError: (error) => {
      const apiError = normalizeApiError(error)
      let mapped = false
      for (const field of [
        'username',
        'email',
        'first_name',
        'last_name',
      ] as const) {
        if (apiError.fields[field]) {
          setError(field, { type: 'server', message: apiError.fields[field] })
          mapped = true
        }
      }
      if (!mapped) {
        toast.error('Could not update profile', {
          description: getErrorMessage(error),
        })
      }
    },
  })

  const submit = handleSubmit((values) => {
    updateMutation.mutate({
      username: values.username,
      email: values.email,
      first_name: values.first_name,
      last_name: values.last_name,
    })
  })

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
          <UserRound className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-bold text-ink">Profile details</h2>
          <p className="mt-0.5 text-xs leading-5 text-muted">
            This is the identity shown across {name}&apos;s workspace.
          </p>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="First name"
            htmlFor="profile-first-name"
            error={errors.first_name?.message}
            optional
          >
            <Input
              id="profile-first-name"
              autoComplete="given-name"
              placeholder="Alex"
              invalid={Boolean(errors.first_name)}
              {...register('first_name')}
            />
          </FormField>
          <FormField
            label="Last name"
            htmlFor="profile-last-name"
            error={errors.last_name?.message}
            optional
          >
            <Input
              id="profile-last-name"
              autoComplete="family-name"
              placeholder="Morgan"
              invalid={Boolean(errors.last_name)}
              {...register('last_name')}
            />
          </FormField>
        </div>

        <FormField
          label="Username"
          htmlFor="profile-username"
          error={errors.username?.message}
          hint="You can sign in with either your username or email address."
        >
          <Input
            id="profile-username"
            autoComplete="username"
            invalid={Boolean(errors.username)}
            aria-describedby={
              errors.username ? 'profile-username-error' : 'profile-username-hint'
            }
            {...register('username')}
          />
        </FormField>

        <FormField
          label="Email address"
          htmlFor="profile-email"
          error={errors.email?.message}
          hint="Used to sign in and identify your account. Keep it up to date."
        >
          <Input
            id="profile-email"
            type="email"
            autoComplete="email"
            invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? 'profile-email-error' : 'profile-email-hint'
            }
            {...register('email')}
          />
        </FormField>

        <div className="flex justify-end border-t border-line pt-4">
          <Button
            type="submit"
            loading={updateMutation.isPending}
            disabled={!isDirty}
          >
            Save profile
          </Button>
        </div>
      </form>
    </section>
  )
}

function PasswordCard() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      new_password_confirm: '',
    },
  })

  const passwordMutation = useMutation({
    mutationFn: (payload: PasswordChangePayload) =>
      api.changePassword(payload),
    onSuccess: () => {
      reset()
      toast.success('Password changed', {
        description: 'Use your new password the next time you sign in.',
      })
    },
    onError: (error) => {
      const apiError = normalizeApiError(error)
      let mapped = false
      for (const field of [
        'old_password',
        'new_password',
        'new_password_confirm',
      ] as const) {
        if (apiError.fields[field]) {
          setError(field, { type: 'server', message: apiError.fields[field] })
          mapped = true
        }
      }
      if (!mapped) {
        const general =
          getFieldError(error, '__all__') ?? getErrorMessage(error)
        setError('root.server', { type: 'server', message: general })
      }
    },
  })

  const submit = handleSubmit((values) => {
    passwordMutation.mutate(values)
  })

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
          <KeyRound className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-bold text-ink">Change password</h2>
          <p className="mt-0.5 text-xs leading-5 text-muted">
            Choose a strong password you do not use anywhere else.
          </p>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        {errors.root?.server?.message ? (
          <div
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-danger-soft px-3.5 py-3 text-sm text-danger"
            role="alert"
          >
            <CircleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <p>{errors.root.server.message}</p>
          </div>
        ) : null}

        <FormField
          label="Current password"
          htmlFor="password-current"
          error={errors.old_password?.message}
        >
          <PasswordInput
            id="password-current"
            autoComplete="current-password"
            placeholder="Enter your current password"
            invalid={Boolean(errors.old_password)}
            {...register('old_password')}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="New password"
            htmlFor="password-new"
            error={errors.new_password?.message}
            hint="At least 8 characters."
          >
            <PasswordInput
              id="password-new"
              autoComplete="new-password"
              placeholder="Create a new password"
              invalid={Boolean(errors.new_password)}
              {...register('new_password')}
            />
          </FormField>
          <FormField
            label="Confirm new password"
            htmlFor="password-confirm"
            error={errors.new_password_confirm?.message}
          >
            <PasswordInput
              id="password-confirm"
              autoComplete="new-password"
              placeholder="Repeat the new password"
              invalid={Boolean(errors.new_password_confirm)}
              {...register('new_password_confirm')}
            />
          </FormField>
        </div>

        <p className="flex items-start gap-1.5 text-[11px] leading-5 text-muted">
          <LockKeyhole
            className="mt-0.5 size-3.5 shrink-0 text-subtle"
            aria-hidden="true"
          />
          Changing your password keeps this session signed in and signs out
          other sessions the next time they authenticate.
        </p>

        <div className="flex justify-end border-t border-line pt-4">
          <Button type="submit" loading={passwordMutation.isPending}>
            Update password
          </Button>
        </div>
      </form>
    </section>
  )
}

import { LoaderCircle } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'danger'
  | 'danger-ghost'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800',
  secondary:
    'border border-line-strong bg-surface text-ink shadow-sm hover:border-slate-300 hover:bg-slate-50',
  ghost: 'text-muted hover:bg-slate-100 hover:text-ink',
  outline:
    'border border-line-strong bg-transparent text-ink hover:border-slate-300 hover:bg-slate-50',
  danger:
    'bg-danger text-white shadow-sm hover:bg-red-700 active:bg-red-800',
  'danger-ghost': 'text-danger hover:bg-danger-soft',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-10 gap-2 rounded-[10px] px-4 text-sm',
  lg: 'h-11 gap-2 rounded-xl px-5 text-sm',
  icon: 'size-10 rounded-[10px]',
  'icon-sm': 'size-8 rounded-lg',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  asChild?: boolean
  children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      asChild = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) {
    const classes = cn(
      'inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:pointer-events-none disabled:opacity-55',
      variantStyles[variant],
      sizeStyles[size],
      className,
    )

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {children}
        </Slot>
      )
    }

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <LoaderCircle
            className="size-4 shrink-0 animate-spin"
            aria-hidden="true"
          />
        ) : null}
        {children}
      </button>
    )
  },
)

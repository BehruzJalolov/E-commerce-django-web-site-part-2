import { CircleAlert, ChevronDown } from 'lucide-react'
import {
  forwardRef,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

import { cn } from '@/lib/utils'

export const controlClassName =
  'block w-full rounded-[10px] border border-line-strong bg-surface px-3.5 text-sm text-ink shadow-[0_1px_1px_rgb(16_24_40/0.03)] placeholder:text-subtle transition-[border-color,box-shadow] duration-150 hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted aria-[invalid=true]:border-danger aria-[invalid=true]:focus:border-danger aria-[invalid=true]:focus:ring-danger/10'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, type = 'text', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(controlClassName, 'h-10', className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
})

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, rows = 3, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(controlClassName, 'min-h-[84px] resize-y py-2.5', className)}
        aria-invalid={invalid || undefined}
        {...props}
      />
    )
  },
)

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, invalid, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            controlClassName,
            'h-10 appearance-none pr-9',
            className,
          )}
          aria-invalid={invalid || undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
    )
  },
)

export function Label({
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('field-label', className)} {...props}>
      {children}
    </label>
  )
}

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  optional?: boolean
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  optional,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor} className="mb-0">
          {label}
        </Label>
        {optional ? (
          <span className="text-[11px] font-medium text-subtle">Optional</span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p className="field-error" id={`${htmlFor}-error`} role="alert">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null
  return (
    <p className="field-error" role="alert">
      <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  )
}

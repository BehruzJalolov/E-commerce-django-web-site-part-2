import { cn, getInitials } from '@/lib/utils'

const sizeStyles = {
  sm: 'size-8 text-[11px]',
  md: 'size-9 text-xs',
  lg: 'size-11 text-sm',
  xl: 'size-16 text-lg',
}

const toneStyles = {
  brand: 'bg-brand-100 text-brand-700',
  dark: 'bg-white/10 text-white ring-1 ring-white/10',
  slate: 'bg-slate-100 text-slate-700',
  emerald: 'bg-positive-soft text-positive',
}

interface AvatarProps {
  name: string
  size?: keyof typeof sizeStyles
  tone?: keyof typeof toneStyles
  className?: string
}

export function Avatar({
  name,
  size = 'md',
  tone = 'brand',
  className,
}: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide',
        sizeStyles[size],
        toneStyles[tone],
        className,
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  )
}

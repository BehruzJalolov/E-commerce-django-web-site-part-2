import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export const DropdownMenu = DropdownPrimitive.Root
export const DropdownMenuTrigger = DropdownPrimitive.Trigger

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  align = 'end',
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-[60] min-w-[190px] rounded-xl border border-line bg-surface p-1.5 shadow-float focus:outline-none',
          'data-[state=open]:animate-scale-in',
          className,
        )}
        {...props}
      >
        {children}
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  )
}

interface DropdownMenuItemProps {
  children: ReactNode
  icon?: LucideIcon
  onSelect?: (event: Event) => void
  destructive?: boolean
  disabled?: boolean
  className?: string
}

export function DropdownMenuItem({
  children,
  icon: Icon,
  onSelect,
  destructive = false,
  disabled = false,
  className,
}: DropdownMenuItemProps) {
  return (
    <DropdownPrimitive.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-ink outline-none transition-colors',
        'data-[highlighted]:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-45',
        destructive
          ? 'text-danger data-[highlighted]:bg-danger-soft'
          : 'text-ink',
        className,
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
      {children}
    </DropdownPrimitive.Item>
  )
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return (
    <DropdownPrimitive.Label className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-subtle">
      {children}
    </DropdownPrimitive.Label>
  )
}

export function DropdownMenuSeparator() {
  return (
    <DropdownPrimitive.Separator className="mx-1 my-1 h-px bg-line" />
  )
}

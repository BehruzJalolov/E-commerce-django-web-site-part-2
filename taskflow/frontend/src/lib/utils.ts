import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { User } from '@/types/api'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDisplayName(
  user: Pick<User, 'display_name' | 'username'> | null | undefined,
) {
  if (!user) return 'Account'
  return user.display_name?.trim() || user.username
}

export function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) return 'TF'
  return parts.map((part) => part[0]?.toUpperCase()).join('')
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function getPageParam(searchParams: URLSearchParams) {
  const parsed = Number(searchParams.get('page') ?? '1')
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  return Math.floor(parsed)
}

export function pageSizeFromUrl(
  searchParams: URLSearchParams,
  fallback: number,
) {
  const parsed = Number(searchParams.get('page_size') ?? fallback)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.min(Math.floor(parsed), 100)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

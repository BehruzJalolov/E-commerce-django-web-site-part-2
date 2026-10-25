import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  parseISO,
  startOfDay,
} from 'date-fns'

export function parseDate(value: string | null | undefined) {
  if (!value) return null
  const date = parseISO(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value: string | null | undefined) {
  if (!value) return 'No date'
  const date = parseDate(value)
  return date ? format(date, 'MMM d, yyyy') : 'No date'
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return 'No date'
  const date = parseDate(value)
  return date ? format(date, 'MMM d') : 'No date'
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = parseDate(value)
  return date ? format(date, 'MMM d, yyyy · h:mm a') : '—'
}

export function formatRelativeTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = parseDate(value)
  return date
    ? formatDistanceToNowStrict(date, { addSuffix: true })
    : '—'
}

export function formatDateInput(value: string | null | undefined) {
  if (!value) return ''
  const date = parseDate(value)
  return date ? format(date, 'yyyy-MM-dd') : ''
}

export interface DueDateMeta {
  label: string
  tone: 'neutral' | 'upcoming' | 'today' | 'overdue' | 'complete'
  daysUntil: number | null
}

export function getDueDateMeta(
  value: string | null | undefined,
  options: { completed?: boolean; isOverdue?: boolean } = {},
): DueDateMeta {
  if (!value) {
    return { label: 'No due date', tone: 'neutral', daysUntil: null }
  }

  const date = parseDate(value)
  if (!date) {
    return { label: 'No due date', tone: 'neutral', daysUntil: null }
  }

  if (options.completed) {
    return {
      label: format(date, 'MMM d'),
      tone: 'complete',
      daysUntil: null,
    }
  }

  const daysUntil = differenceInCalendarDays(
    startOfDay(date),
    startOfDay(new Date()),
  )

  if (options.isOverdue || daysUntil < 0) {
    return {
      label:
        daysUntil === -1
          ? 'Overdue by 1 day'
          : `Overdue by ${Math.abs(daysUntil)} days`,
      tone: 'overdue',
      daysUntil,
    }
  }

  if (daysUntil === 0) {
    return { label: 'Due today', tone: 'today', daysUntil }
  }

  if (daysUntil === 1) {
    return { label: 'Due tomorrow', tone: 'upcoming', daysUntil }
  }

  if (daysUntil <= 7) {
    return {
      label: `Due ${format(date, 'EEEE')}`,
      tone: 'upcoming',
      daysUntil,
    }
  }

  return {
    label: `Due ${format(date, 'MMM d')}`,
    tone: 'neutral',
    daysUntil,
  }
}

export function formatMonthDay(value: string | null | undefined) {
  if (!value) return '—'
  const date = parseDate(value)
  return date ? format(date, 'MMM d') : '—'
}

export function todayInputValue() {
  return format(new Date(), 'yyyy-MM-dd')
}

import type { TaskPriority, TaskStatus } from '@/types/api'

export interface TaskStatusOption {
  value: TaskStatus
  label: string
  description: string
}

export const TASK_STATUS_OPTIONS: TaskStatusOption[] = [
  {
    value: 'todo',
    label: 'To Do',
    description: 'Ready to be picked up',
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    description: 'Actively being worked on',
  },
  {
    value: 'done',
    label: 'Done',
    description: 'Completed and wrapped up',
  },
]

export const TASK_PRIORITY_OPTIONS: {
  value: TaskPriority
  label: string
}[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export const STATUS_META: Record<
  TaskStatus,
  { label: string; badge: string; dot: string; hex: string }
> = {
  todo: {
    label: 'To Do',
    badge: 'border-slate-200 bg-slate-50 text-slate-700',
    dot: 'bg-slate-400',
    hex: '#94a3b8',
  },
  in_progress: {
    label: 'In Progress',
    badge: 'border-sky-200 bg-info-soft text-info',
    dot: 'bg-sky-500',
    hex: '#0ea5e9',
  },
  done: {
    label: 'Done',
    badge: 'border-emerald-200 bg-positive-soft text-positive',
    dot: 'bg-emerald-500',
    hex: '#10b981',
  },
}

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; badge: string; dot: string; hex: string }
> = {
  low: {
    label: 'Low',
    badge: 'border-slate-200 bg-slate-50 text-slate-600',
    dot: 'bg-slate-400',
    hex: '#94a3b8',
  },
  medium: {
    label: 'Medium',
    badge: 'border-sky-200 bg-info-soft text-info',
    dot: 'bg-sky-500',
    hex: '#0ea5e9',
  },
  high: {
    label: 'High',
    badge: 'border-amber-200 bg-warning-soft text-warning',
    dot: 'bg-amber-500',
    hex: '#f59e0b',
  },
  urgent: {
    label: 'Urgent',
    badge: 'border-red-200 bg-danger-soft text-danger',
    dot: 'bg-red-500',
    hex: '#ef4444',
  },
}

export const DUE_FILTER_OPTIONS = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Due today' },
  { value: 'upcoming', label: 'Next 7 days' },
  { value: 'none', label: 'No due date' },
] as const

export const SORT_OPTIONS = [
  { value: '-updated_at', label: 'Recently updated' },
  { value: '-created_at', label: 'Newest first' },
  { value: 'created_at', label: 'Oldest first' },
  { value: 'due_date', label: 'Due date (soonest)' },
  { value: '-due_date', label: 'Due date (latest)' },
  { value: 'priority', label: 'Priority (urgent first)' },
  { value: 'title', label: 'Title (A–Z)' },
  { value: '-title', label: 'Title (Z–A)' },
] as const

export const PROJECT_SORT_OPTIONS = [
  { value: '-updated_at', label: 'Recently updated' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: '-name', label: 'Name (Z–A)' },
  { value: '-created_at', label: 'Newest first' },
] as const

export const PROJECT_COLORS = [
  '#4f46e5',
  '#0ea5e9',
  '#0d9488',
  '#16a34a',
  '#ca8a04',
  '#ea580c',
  '#e11d48',
  '#9333ea',
  '#475569',
] as const

export const PAGE_SIZE = 10
export const PROJECT_PAGE_SIZE = 9

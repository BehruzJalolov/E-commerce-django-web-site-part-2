import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DashboardPage } from '@/pages/DashboardPage'
import { api } from '@/lib/api'
import { renderWithProviders } from '@/test/utils'
import type { DashboardData } from '@/types/api'

vi.mock('@/lib/api')
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      username: 'alexmorgan',
      email: 'alex@example.com',
      first_name: 'Alex',
      last_name: 'Morgan',
      display_name: 'Alex Morgan',
      date_joined: '2026-01-10T09:00:00Z',
    },
  }),
}))
vi.mock('@/context/TaskDialogContext', () => ({
  useTaskDialog: () => ({
    openCreateTask: vi.fn(),
    openEditTask: vi.fn(),
  }),
}))

const emptyDashboard: DashboardData = {
  stats: {
    total_tasks: 0,
    todo_tasks: 0,
    in_progress_tasks: 0,
    completed_tasks: 0,
    overdue_tasks: 0,
    completion_percentage: 0,
    total_projects: 0,
    active_projects: 0,
  },
  status_breakdown: [
    { key: 'todo', label: 'To Do', count: 0 },
    { key: 'in_progress', label: 'In Progress', count: 0 },
    { key: 'done', label: 'Done', count: 0 },
  ],
  priority_breakdown: [
    { key: 'low', label: 'Low', count: 0 },
    { key: 'medium', label: 'Medium', count: 0 },
    { key: 'high', label: 'High', count: 0 },
    { key: 'urgent', label: 'Urgent', count: 0 },
  ],
  weekly_activity: Array.from({ length: 7 }, (_, index) => ({
    date: `2026-10-${String(18 + index).padStart(2, '0')}`,
    label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index] ?? 'Day',
    created: 0,
    completed: 0,
  })),
  recent_tasks: [],
  upcoming_tasks: [],
  projects: [],
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.mocked(api.getDashboard).mockResolvedValue(emptyDashboard)
  })

  it('renders an honest onboarding state for an empty account', async () => {
    renderWithProviders(<DashboardPage />, { initialEntries: ['/app'] })

    expect(
      await screen.findByText(
        'Start with one project. Then one clear next step.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Every task belongs to a project/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Create a project/ }),
    ).toHaveAttribute('href', '/app/projects')
    expect(screen.getByText(/Good (morning|afternoon|evening), Alex/)).toBeInTheDocument()
  })

  it('surfaces a retryable error without fabricating dashboard data', async () => {
    vi.mocked(api.getDashboard).mockRejectedValue(new Error('Network down'))

    renderWithProviders(<DashboardPage />, { initialEntries: ['/app'] })

    expect(
      await screen.findByText('Your dashboard could not be loaded'),
    ).toBeInTheDocument()
    expect(screen.getByText('Network down')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument()
  })
})

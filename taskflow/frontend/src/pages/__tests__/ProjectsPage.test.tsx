import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProjectsPage } from '@/pages/ProjectsPage'
import { api } from '@/lib/api'
import { ApiError } from '@/lib/errors'
import { makeProject } from '@/test/fixtures'
import { renderWithProviders } from '@/test/utils'

vi.mock('@/lib/api')

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.mocked(api.listProjects).mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    })
  })

  it('shows a useful empty state instead of invented project data', async () => {
    renderWithProviders(<ProjectsPage />, {
      initialEntries: ['/app/projects'],
    })

    expect(await screen.findByText('Start with a project')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create your first project' }),
    ).toBeInTheDocument()
    expect(api.listProjects).toHaveBeenCalled()
  })

  it('renders real project cards with progress from the API', async () => {
    vi.mocked(api.listProjects).mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [makeProject()],
    })

    renderWithProviders(<ProjectsPage />, {
      initialEntries: ['/app/projects'],
    })

    expect(
      await screen.findByRole('heading', { name: 'Website refresh' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('33%').length).toBeGreaterThan(0)
    expect(screen.getByText(/1 task complete/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Website refresh' }),
    ).toHaveAttribute('href', '/app/projects/1')
  })

  it('shows a retryable error state when the API fails', async () => {
    vi.mocked(api.listProjects).mockRejectedValue(
      new ApiError('The projects service is unavailable.', { status: 503 }),
    )

    renderWithProviders(<ProjectsPage />, {
      initialEntries: ['/app/projects'],
    })

    expect(
      await screen.findByText('Projects could not be loaded'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('The projects service is unavailable.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument()
  })
})

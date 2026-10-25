import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TaskTable } from '@/components/tasks/TaskTable'
import { api } from '@/lib/api'
import { makeTask } from '@/test/fixtures'
import { renderWithProviders } from '@/test/utils'

vi.mock('@/lib/api')

describe('TaskTable', () => {
  beforeEach(() => {
    vi.mocked(api.updateTask).mockResolvedValue(
      makeTask({ status: 'done', is_completed: true }),
    )
  })

  it('completes a task through the accessible completion control', async () => {
    const user = userEvent.setup()
    const task = makeTask()

    renderWithProviders(
      <TaskTable tasks={[task]} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )

    const completionButtons = screen.getAllByRole('button', {
      name: `Mark ${task.title} as complete`,
    })
    await user.click(completionButtons[0])

    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith(task.id, { status: 'done' })
    })
  })

  it('reopens a completed task with the same control', async () => {
    const user = userEvent.setup()
    const task = makeTask({
      status: 'done',
      is_completed: true,
      completed_at: '2026-10-24T09:00:00Z',
    })
    vi.mocked(api.updateTask).mockResolvedValue(
      makeTask({ status: 'todo', is_completed: false }),
    )

    renderWithProviders(
      <TaskTable tasks={[task]} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )

    const reopenButtons = screen.getAllByRole('button', {
      name: `Reopen ${task.title}`,
    })
    expect(reopenButtons[0]).toHaveAttribute('aria-pressed', 'true')
    await user.click(reopenButtons[0])

    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith(task.id, { status: 'todo' })
    })
  })
})

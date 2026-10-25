import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TaskStatusMenu } from '@/components/tasks/TaskStatusMenu'
import { renderWithRouter } from '@/test/utils'

describe('TaskStatusMenu', () => {
  it('offers every status from an accessible menu and emits the selection', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    renderWithRouter(
      <div>
        <TaskStatusMenu value="todo" onChange={onChange} />
      </div>,
    )

    const trigger = screen.getByRole('button', {
      name: /Change status. Current status: To Do/,
    })
    await user.click(trigger)

    expect(await screen.findByRole('menuitem', { name: /To Do/ })).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: /In Progress/ })).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: /Done/ })).toBeTruthy()

    await user.click(screen.getByRole('menuitem', { name: /In Progress/ }))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('in_progress')
    })
  })

  it('shows a pending state while a status change is saving', () => {
    renderWithRouter(
      <TaskStatusMenu value="in_progress" onChange={vi.fn()} pending />,
    )

    const trigger = screen.getByRole('button', {
      name: /Change status. Current status: In Progress/,
    })
    expect(trigger).toBeDisabled()
    expect(trigger).toHaveAttribute('aria-busy', 'true')
  })
})

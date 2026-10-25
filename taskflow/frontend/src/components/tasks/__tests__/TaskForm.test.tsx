import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TaskForm } from '@/components/tasks/TaskForm'
import { makeProject } from '@/test/fixtures'
import { renderWithRouter } from '@/test/utils'

describe('TaskForm', () => {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    onSubmit.mockReset()
    onCancel.mockReset()
  })

  function renderForm() {
    return renderWithRouter(
      <TaskForm
        projects={[
          makeProject(),
          makeProject({
            id: 2,
            name: 'Mobile app v2',
            color: '#0ea5e9',
          }),
        ]}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    )
  }

  it('blocks an empty title and shows an accessible error', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Create task' }))

    const error = await screen.findByText('Enter a task title.')
    expect(error).toBeInTheDocument()
    expect(screen.getByLabelText('Task title')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the selected project and normalizes an empty due date', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('Task title'), 'Draft launch note')
    await user.type(
      screen.getByLabelText('Description'),
      'Write the first announcement draft.',
    )
    await user.selectOptions(screen.getByLabelText('Priority'), 'urgent')
    await user.selectOptions(screen.getByLabelText('Project'), '2')
    await user.click(screen.getByRole('button', { name: 'Create task' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Draft launch note',
        description: 'Write the first announcement draft.',
        project: 2,
        status: 'todo',
        priority: 'urgent',
        due_date: null,
      })
    })
  })

  it('explains how to proceed when there are no projects', () => {
    renderWithRouter(
      <TaskForm
        projects={[]}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    )

    expect(screen.getByText('Create a project first')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Go to projects' }),
    ).toHaveAttribute('href', '/app/projects')
  })
})

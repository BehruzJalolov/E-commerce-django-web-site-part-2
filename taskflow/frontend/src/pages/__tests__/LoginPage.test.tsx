import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { LoginPage } from '@/pages/LoginPage'
import { makeUser } from '@/test/fixtures'
import { renderWithProviders } from '@/test/utils'

vi.mock('@/lib/api')

function renderLogin() {
  return renderWithProviders(
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<div>Workspace dashboard</div>} />
      </Routes>
    </AuthProvider>,
    { initialEntries: ['/login'] },
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(api.me).mockRejectedValue(new Error('Unauthorized'))
    vi.mocked(api.login).mockResolvedValue({ user: makeUser() })
  })

  it('shows client-side validation instead of submitting empty credentials', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByText('Enter your email or username.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(api.login).not.toHaveBeenCalled()
  })

  it('submits valid credentials and redirects into the workspace', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(
      screen.getByLabelText('Email or username'),
      'alex@example.com',
    )
    await user.type(screen.getByLabelText('Password'), 'correct-horse')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        login: 'alex@example.com',
        password: 'correct-horse',
      })
    })
    expect(await screen.findByText('Workspace dashboard')).toBeInTheDocument()
  })
})

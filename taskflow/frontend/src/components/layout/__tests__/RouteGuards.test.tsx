import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ProtectedRoute,
  PublicOnlyRoute,
} from '@/components/layout/RouteGuards'
import { renderWithProviders } from '@/test/utils'

const authState = vi.hoisted(() => ({
  value: {} as {
    isInitializing: boolean
    isAuthenticated: boolean
    authError: Error | null
    retryAuth: () => void
  },
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => authState.value,
}))

function setAuth(overrides: Partial<(typeof authState)['value']> = {}) {
  authState.value = {
    isInitializing: false,
    isAuthenticated: false,
    authError: null,
    retryAuth: vi.fn(),
    ...overrides,
  }
}

describe('route guards', () => {
  beforeEach(() => {
    setAuth()
  })

  it('redirects anonymous visitors away from the protected workspace', async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <div>Private workspace</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login screen</div>} />
      </Routes>,
      { initialEntries: ['/app'] },
    )

    expect(await screen.findByText('Login screen')).toBeInTheDocument()
    expect(screen.queryByText('Private workspace')).not.toBeInTheDocument()
  })

  it('renders protected content for an authenticated session', () => {
    setAuth({ isAuthenticated: true })
    renderWithProviders(
      <Routes>
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <div>Private workspace</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      { initialEntries: ['/app'] },
    )

    expect(screen.getByText('Private workspace')).toBeInTheDocument()
  })

  it('shows a recoverable error when the session cannot be verified', () => {
    setAuth({ authError: new Error('The server is unavailable.') })
    renderWithProviders(
      <Routes>
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <div>Private workspace</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      { initialEntries: ['/app'] },
    )

    expect(
      screen.getByText('We could not verify your session'),
    ).toBeInTheDocument()
    expect(screen.getByText('The server is unavailable.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('keeps authenticated users out of public-only auth screens', () => {
    setAuth({ isAuthenticated: true })
    renderWithProviders(
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <div>Login form</div>
            </PublicOnlyRoute>
          }
        />
        <Route path="/app" element={<div>Dashboard</div>} />
      </Routes>,
      { initialEntries: ['/login'] },
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Login form')).not.toBeInTheDocument()
  })

  it('shows a loading splash while the session is being restored', () => {
    setAuth({ isInitializing: true })
    renderWithProviders(
      <Routes>
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <div>Private workspace</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      { initialEntries: ['/app'] },
    )

    expect(screen.getByText(/Preparing your workspace/)).toBeInTheDocument()
    expect(screen.queryByText('Private workspace')).not.toBeInTheDocument()
  })
})

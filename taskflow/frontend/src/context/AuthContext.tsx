import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { api, ensureCsrfToken } from '@/lib/api'
import { isUnauthorized } from '@/lib/errors'
import { queryKeys } from '@/lib/queryKeys'
import type { LoginPayload, RegisterPayload, User } from '@/types/api'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  authError: Error | null
  retryAuth: () => void
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const meQuery = useQuery({
    queryKey: queryKeys.authMe,
    queryFn: () => api.me(),
    retry: false,
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    void ensureCsrfToken()
  }, [])

  const clearWorkspaceData = useCallback(() => {
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== 'auth',
    })
  }, [queryClient])

  const setAuthenticatedUser = useCallback(
    (user: User) => {
      clearWorkspaceData()
      queryClient.setQueryData(queryKeys.authMe, user)
    },
    [clearWorkspaceData, queryClient],
  )

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await api.login(payload)
      setAuthenticatedUser(response.user)
      return response.user
    },
    [setAuthenticatedUser],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await api.register(payload)
      setAuthenticatedUser(response.user)
      return response.user
    },
    [setAuthenticatedUser],
  )

  const logout = useCallback(async () => {
    await api.logout()
    queryClient.clear()
    queryClient.setQueryData(queryKeys.authMe, null)
  }, [queryClient])

  const updateUser = useCallback(
    (user: User) => {
      queryClient.setQueryData(queryKeys.authMe, user)
    },
    [queryClient],
  )

  const authError =
    meQuery.error && !isUnauthorized(meQuery.error) ? meQuery.error : null

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      isAuthenticated: Boolean(meQuery.data),
      isInitializing: meQuery.isPending,
      authError,
      retryAuth: () => {
        void meQuery.refetch()
      },
      login,
      register,
      logout,
      updateUser,
    }),
    [
      authError,
      login,
      logout,
      meQuery.data,
      meQuery.isPending,
      meQuery.refetch,
      register,
      updateUser,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.')
  }
  return context
}

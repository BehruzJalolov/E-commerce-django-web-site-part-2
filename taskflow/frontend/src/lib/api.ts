import axios from 'axios'

import type {
  AuthResponse,
  DashboardData,
  LoginPayload,
  PaginatedResponse,
  PasswordChangePayload,
  ProfilePayload,
  Project,
  ProjectPayload,
  ProjectQuery,
  RegisterPayload,
  Task,
  TaskPayload,
  TaskQuery,
  User,
} from '@/types/api'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 20_000,
})

const SAFE_METHODS = new Set(['get', 'head', 'options', 'trace'])
let csrfRequest: Promise<string | null> | null = null

function readCookie(name: string) {
  if (typeof document === 'undefined') return null
  const parts = document.cookie.split(';').map((part) => part.trim())
  const prefix = `${name}=`
  const match = parts.find((part) => part.startsWith(prefix))
  return match ? decodeURIComponent(match.slice(prefix.length)) : null
}

async function fetchCsrfToken() {
  const existing = readCookie('csrftoken')
  if (existing) return existing

  try {
    await apiClient.get('/auth/csrf/')
    return readCookie('csrftoken')
  } catch {
    return null
  }
}

export async function ensureCsrfToken() {
  const token = readCookie('csrftoken')
  if (token) return token

  if (!csrfRequest) {
    csrfRequest = fetchCsrfToken().finally(() => {
      csrfRequest = null
    })
  }
  return csrfRequest
}

apiClient.interceptors.request.use(async (config) => {
  const method = (config.method ?? 'get').toLowerCase()
  if (!SAFE_METHODS.has(method)) {
    const token = await ensureCsrfToken()
    if (token) {
      config.headers.set('X-CSRFToken', token)
    }
  }
  return config
})

type ParamValue = string | number | boolean | null | undefined

function cleanParams(params: Record<string, ParamValue>) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined,
    ),
  )
}

async function getProjectsPage(params: ProjectQuery = {}) {
  const response = await apiClient.get<PaginatedResponse<Project>>('/projects/', {
    params: cleanParams({
      archived: params.archived,
      search: params.search,
      ordering: params.ordering,
      page: params.page,
      page_size: params.page_size,
    }),
  })
  return response.data
}

async function getTasksPage(params: TaskQuery = {}) {
  const response = await apiClient.get<PaginatedResponse<Task>>('/tasks/', {
    params: cleanParams({
      status: params.status,
      priority: params.priority,
      project: params.project,
      due: params.due,
      search: params.search,
      ordering: params.ordering,
      page: params.page,
      page_size: params.page_size,
    }),
  })
  return response.data
}

export const api = {
  async me() {
    const response = await apiClient.get<User>('/auth/me/')
    return response.data
  },

  async login(payload: LoginPayload) {
    const response = await apiClient.post<AuthResponse>('/auth/login/', payload)
    return response.data
  },

  async register(payload: RegisterPayload) {
    const response = await apiClient.post<AuthResponse>(
      '/auth/register/',
      payload,
    )
    return response.data
  },

  async logout() {
    await apiClient.post('/auth/logout/')
  },

  async updateProfile(payload: ProfilePayload) {
    const response = await apiClient.patch<User>('/auth/profile/', payload)
    return response.data
  },

  async changePassword(payload: PasswordChangePayload) {
    await apiClient.post('/auth/password/change/', payload)
  },

  async getDashboard() {
    const response = await apiClient.get<DashboardData>('/dashboard/')
    return response.data
  },

  listProjects: getProjectsPage,

  async listAllProjects() {
    const projects: Project[] = []
    let page = 1
    let hasNext = true

    while (hasNext) {
      const data = await getProjectsPage({
        archived: 'all',
        ordering: 'name',
        page,
        page_size: 100,
      })
      projects.push(...data.results)
      hasNext = data.next !== null
      page += 1
    }

    return projects
  },

  async getProject(projectId: number) {
    const response = await apiClient.get<Project>(`/projects/${projectId}/`)
    return response.data
  },

  async createProject(payload: ProjectPayload) {
    const response = await apiClient.post<Project>('/projects/', payload)
    return response.data
  },

  async updateProject(projectId: number, payload: Partial<ProjectPayload>) {
    const response = await apiClient.patch<Project>(
      `/projects/${projectId}/`,
      payload,
    )
    return response.data
  },

  async deleteProject(projectId: number) {
    await apiClient.delete(`/projects/${projectId}/`)
  },

  listTasks: getTasksPage,

  async getTask(taskId: number) {
    const response = await apiClient.get<Task>(`/tasks/${taskId}/`)
    return response.data
  },

  async createTask(payload: TaskPayload) {
    const response = await apiClient.post<Task>('/tasks/', payload)
    return response.data
  },

  async updateTask(taskId: number, payload: Partial<TaskPayload>) {
    const response = await apiClient.patch<Task>(`/tasks/${taskId}/`, payload)
    return response.data
  },

  async deleteTask(taskId: number) {
    await apiClient.delete(`/tasks/${taskId}/`)
  },
}

export { apiClient, cleanParams }

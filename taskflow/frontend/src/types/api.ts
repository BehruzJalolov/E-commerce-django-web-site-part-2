export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  display_name: string
  date_joined: string
}

export interface ProjectMini {
  id: number
  name: string
  color: string
  is_archived: boolean
}

export interface Project extends ProjectMini {
  description: string
  task_count: number
  completed_task_count: number
  open_task_count: number
  completion_percentage: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  status_display: string
  priority: TaskPriority
  priority_display: string
  project: number
  project_detail: ProjectMini
  due_date: string | null
  is_completed: boolean
  is_overdue: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ProjectPayload {
  name: string
  description?: string
  color?: string
  is_archived?: boolean
}

export interface TaskPayload {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  project: number
  due_date?: string | null
}

export interface ProjectQuery {
  archived?: 'active' | 'archived' | 'all'
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface TaskQuery {
  status?: TaskStatus
  priority?: TaskPriority
  project?: number
  due?: 'overdue' | 'today' | 'upcoming' | 'none'
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export type SortOrder =
  | '-updated_at'
  | 'updated_at'
  | '-created_at'
  | 'created_at'
  | 'due_date'
  | '-due_date'
  | 'priority'
  | '-priority'
  | 'title'
  | '-title'

export interface StatusItem {
  key: TaskStatus | 'done'
  label: string
  count: number
}

export interface PriorityItem {
  key: TaskPriority
  label: string
  count: number
}

export interface WeeklyActivityItem {
  date: string
  label: string
  created: number
  completed: number
}

export interface ProjectOverview {
  id: number
  name: string
  color: string
  task_count: number
  completed_task_count: number
  completion_percentage: number
}

export interface DashboardStats {
  total_tasks: number
  todo_tasks: number
  in_progress_tasks: number
  completed_tasks: number
  overdue_tasks: number
  completion_percentage: number
  total_projects: number
  active_projects: number
}

export interface DashboardData {
  stats: DashboardStats
  status_breakdown: StatusItem[]
  priority_breakdown: PriorityItem[]
  weekly_activity: WeeklyActivityItem[]
  recent_tasks: Task[]
  upcoming_tasks: Task[]
  projects: ProjectOverview[]
}

export interface LoginPayload {
  login: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  password_confirm: string
}

export interface AuthResponse {
  user: User
}

export interface ProfilePayload {
  username: string
  email: string
  first_name: string
  last_name: string
}

export interface PasswordChangePayload {
  old_password: string
  new_password: string
  new_password_confirm: string
}

import type { Project, Task, User } from '@/types/api'

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    username: 'alexmorgan',
    email: 'alex@example.com',
    first_name: 'Alex',
    last_name: 'Morgan',
    display_name: 'Alex Morgan',
    date_joined: '2026-01-10T09:00:00Z',
    ...overrides,
  }
}

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    name: 'Website refresh',
    description: 'Rebuild the marketing site with a clearer story.',
    color: '#6366f1',
    is_archived: false,
    task_count: 3,
    completed_task_count: 1,
    open_task_count: 2,
    completion_percentage: 33,
    created_at: '2026-01-12T09:00:00Z',
    updated_at: '2026-10-24T09:00:00Z',
    ...overrides,
  }
}

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: 'Prepare the launch brief',
    description: 'Outline audience, message and launch sequence.',
    status: 'todo',
    status_display: 'To Do',
    priority: 'high',
    priority_display: 'High',
    project: 1,
    project_detail: {
      id: 1,
      name: 'Website refresh',
      color: '#6366f1',
      is_archived: false,
    },
    due_date: '2026-11-01',
    is_completed: false,
    is_overdue: false,
    completed_at: null,
    created_at: '2026-10-20T09:00:00Z',
    updated_at: '2026-10-23T09:00:00Z',
    ...overrides,
  }
}

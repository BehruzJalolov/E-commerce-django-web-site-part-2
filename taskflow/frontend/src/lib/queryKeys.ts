import type { ProjectQuery, TaskQuery } from '@/types/api'

export const queryKeys = {
  authMe: ['auth', 'me'] as const,
  dashboard: ['dashboard'] as const,
  projects: (params: ProjectQuery) => ['projects', 'list', params] as const,
  allProjects: ['projects', 'all'] as const,
  project: (projectId: number) => ['projects', 'detail', projectId] as const,
  tasks: (params: TaskQuery) => ['tasks', 'list', params] as const,
  infiniteTasks: (params: Omit<TaskQuery, 'page'>) =>
    ['tasks', 'infinite', params] as const,
  task: (taskId: number) => ['tasks', 'detail', taskId] as const,
}

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query'

import { api } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import type { ProjectQuery, TaskQuery } from '@/types/api'

export function useProjects(params: ProjectQuery) {
  return useQuery({
    queryKey: queryKeys.projects(params),
    queryFn: () => api.listProjects(params),
    placeholderData: keepPreviousData,
  })
}

export function useProject(projectId: number) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => api.getProject(projectId),
    enabled: Number.isFinite(projectId) && projectId > 0,
  })
}

export function useAllProjects() {
  return useQuery({
    queryKey: queryKeys.allProjects,
    queryFn: () => api.listAllProjects(),
    staleTime: 60_000,
  })
}

export function useTasks(params: TaskQuery, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tasks(params),
    queryFn: () => api.listTasks(params),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useTask(taskId: number) {
  return useQuery({
    queryKey: queryKeys.task(taskId),
    queryFn: () => api.getTask(taskId),
    enabled: Number.isFinite(taskId) && taskId > 0,
  })
}

export function useInfiniteTasks(params: Omit<TaskQuery, 'page'>) {
  return useInfiniteQuery({
    queryKey: queryKeys.infiniteTasks(params),
    queryFn: ({ pageParam }) =>
      api.listTasks({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
  })
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.getDashboard(),
  })
}

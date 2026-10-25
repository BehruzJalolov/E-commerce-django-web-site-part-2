import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { ProjectPayload, TaskPayload } from '@/types/api'

function invalidateTaskRelated(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['tasks'] })
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  void queryClient.invalidateQueries({ queryKey: ['projects'] })
}

function invalidateProjectRelated(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: ['projects'] })
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  void queryClient.invalidateQueries({ queryKey: ['tasks'] })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TaskPayload) => api.createTask(payload),
    onSuccess: () => invalidateTaskRelated(queryClient),
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: number
      payload: Partial<TaskPayload>
    }) => api.updateTask(taskId, payload),
    onSuccess: () => invalidateTaskRelated(queryClient),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: number) => api.deleteTask(taskId),
    onSuccess: () => invalidateTaskRelated(queryClient),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProjectPayload) => api.createProject(payload),
    onSuccess: () => invalidateProjectRelated(queryClient),
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number
      payload: Partial<ProjectPayload>
    }) => api.updateProject(projectId, payload),
    onSuccess: () => invalidateProjectRelated(queryClient),
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: number) => api.deleteProject(projectId),
    onSuccess: () => invalidateProjectRelated(queryClient),
  })
}

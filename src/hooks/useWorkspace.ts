import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
export const workspaceKey = ['workspace'] as const
export const useWorkspace = () =>
  useQuery({ queryKey: workspaceKey, queryFn: api.getWorkspace, staleTime: 30_000, retry: false })

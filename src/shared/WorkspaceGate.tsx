import type { ReactNode } from 'react'
import { useWorkspace } from '../hooks/useWorkspace'
import type { Dataset } from '../types'
import { ErrorState, LoadingState } from './States'
export function WorkspaceGate({ children }: { children: (data: Dataset) => ReactNode }) {
  const query = useWorkspace()
  if (query.isPending) return <LoadingState />
  if (query.isError)
    return (
      <ErrorState
        error={query.error}
        retry={() => {
          void query.refetch()
        }}
      />
    )
  return children(query.data)
}

import { openDB, type DBSchema } from 'idb'
import type { Dataset } from '../types'
import { createSeed } from './seed'
interface NexusDB extends DBSchema {
  workspace: { key: string; value: Dataset }
}
let database: ReturnType<typeof openDB<NexusDB>> | undefined
let initialization: Promise<void> | undefined
function connect() {
  return (database ??= openDB<NexusDB>('nexus-workspace-v1', 1, {
    upgrade(db) {
      db.createObjectStore('workspace')
    },
  }))
}
async function initialize() {
  initialization ??= (async () => {
    const db = await connect()
    const tx = db.transaction('workspace', 'readwrite')
    const data = await tx.store.get('primary')
    if (!data) await tx.store.put(createSeed(), 'primary')
    await tx.done
  })().catch((error) => {
    initialization = undefined
    throw error
  })
  await initialization
}
export async function readDataset(): Promise<Dataset> {
  await initialize()
  const data = await (await connect()).get('workspace', 'primary')
  if (!data) throw new Error('Workspace data is unavailable. Reload the page.')
  return data
}
export async function updateDataset(mutate: (data: Dataset) => void): Promise<Dataset> {
  await initialize()
  const tx = (await connect()).transaction('workspace', 'readwrite')
  try {
    const data = await tx.store.get('primary')
    if (!data) throw new Error('Workspace not found')
    mutate(data)
    await tx.store.put(data, 'primary')
    await tx.done
    return data
  } catch (error) {
    try {
      tx.abort()
    } catch {
      /* transaction already completed */
    }
    await tx.done.catch(() => undefined)
    throw error
  }
}

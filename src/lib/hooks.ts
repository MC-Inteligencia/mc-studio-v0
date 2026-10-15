import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { getSyncState, onSyncState, type SyncState } from '../sync/folder'
import type { User } from '../db/types'

export function useSync(): SyncState {
  const [s, setS] = useState(getSyncState())
  useEffect(() => {
    const off = onSyncState(setS)
    return () => { off() }
  }, [])
  return s
}

export function useCurrentUser(): User | undefined {
  return useLiveQuery(async () => {
    const id = (await db.settings.get('currentUserId'))?.value as string | undefined
    return id ? db.users.get(id) : undefined
  })
}

export function useUsers() {
  return useLiveQuery(() => db.users.toArray(), []) ?? []
}

const urlCache = new Map<string, string>()
export function useAssetUrl(id?: string): string | undefined {
  const asset = useLiveQuery(() => (id ? db.assets.get(id) : undefined), [id])
  if (!id || !asset) return undefined
  let u = urlCache.get(id)
  if (!u) {
    u = URL.createObjectURL(asset.blob)
    urlCache.set(id, u)
  }
  return u
}

export function useSetting<T>(key: string): T | undefined {
  return useLiveQuery(async () => (await db.settings.get(key))?.value as T | undefined, [key])
}

import { useSetAtom } from 'jotai'

import { contentAvailableOfflineAtom } from 'atoms/network'
import { SW_CACHES } from 'constants/sw'
import { type NoteData } from 'libs/db/note'
import { isResourceCached } from 'libs/sw'
import { isNetworkError, trpc } from 'libs/trpc'

export default function useNoteQuery(id: NoteData['id'], options: UseNoteQueryOptions) {
  const setContentAvailableOffline = useSetAtom(contentAvailableOfflineAtom)

  return trpc.useQuery(['note.byId', { id }], {
    ...options,
    onSuccess: async () => {
      const isCached = await isResourceCached(SW_CACHES.Api, '/api/trpc/note.byId', { id })

      setContentAvailableOffline(isCached)
    },
    useErrorBoundary: isNetworkError,
  })
}

interface UseNoteQueryOptions {
  enabled: boolean
}

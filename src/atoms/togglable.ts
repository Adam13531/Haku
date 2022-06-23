import { atom, type WritableAtom, PrimitiveAtom } from 'jotai'

import { onlineAtom } from 'atoms/network'
import { type FolderData } from 'libs/db/folder'
import { type NoteMetadata } from 'libs/db/note'
import { type TodoMetadata } from 'libs/db/todo'
import { type A11yImageParams } from 'libs/image'

export const [folderModalAtom, setFolderModalOpenedAtom] = createMutationModalAtom<FolderData>()
export const [contentModalAtom, setContentModalOpenedAtom] = createMutationModalAtom<NoteMetadata | TodoMetadata>()

export const shortcutModalOpenedAtom = atom(false)
export const editorImageModalAtom = atom<EditorImageModal>({ opened: false })

export const [inboxDrawerAtom, setInboxDrawerOpenedAtom] = createDrawerAtom()
export const [searchDrawerAtom, setSearchDrawerOpenedAtom] = createDrawerAtom<{ query: string }>()

export const commandPaletteOpenedAtom = atom(false)
export const navigationPaletteOpenedAtom = atom(false)

function createMutationModalAtom<TData>(): [
  WritableAtom<MutationModal<TData>, MutationModal<TData>>,
  WritableAtom<null, boolean>
] {
  const modalAtom = atom<MutationModal<TData>>({
    action: 'insert',
    data: undefined,
    opened: false,
  })

  const setModalOpenedAtom = atom(null, (get, set, opened: boolean) => {
    const online = get(onlineAtom)

    return set(modalAtom, { ...get(modalAtom), action: 'insert', data: undefined, opened: !online ? false : opened })
  })

  return [modalAtom, setModalOpenedAtom]
}

function createDrawerAtom<TData>(): [PrimitiveAtom<Drawer<TData>>, WritableAtom<null, boolean>] {
  const drawerAtom = atom<Drawer<TData>>({
    data: undefined,
    opened: false,
  })

  const setDrawerOpenedAtom = atom(null, (get, set, opened: boolean) => {
    const { opened: inboxDrawerOpened, ...inboxDrawer } = get(inboxDrawerAtom)
    const { opened: searchDrawerOpened, ...searchDrawer } = get(searchDrawerAtom)

    if (inboxDrawerOpened) {
      set(inboxDrawerAtom, { ...inboxDrawer, opened: false })
    }

    if (searchDrawerOpened) {
      set(searchDrawerAtom, { ...searchDrawer, opened: false })
    }

    return set(drawerAtom, { ...get(drawerAtom), opened })
  })

  return [drawerAtom, setDrawerOpenedAtom]
}

interface MutationModal<TData> {
  action: 'insert' | 'update' | 'delete'
  data: TData | undefined
  opened: boolean
}

interface EditorImageModal extends Partial<A11yImageParams> {
  opened: boolean
}

interface Drawer<TData> {
  data: TData | undefined
  opened: boolean
}

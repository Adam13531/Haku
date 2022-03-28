import { useAtom } from 'jotai'
import { useAtomCallback, useResetAtom } from 'jotai/utils'
import { useCallback, useEffect, useMemo } from 'react'

import { todoEditorStateAtom } from 'atoms/todo'
import { todoNodeChildrenAtom, todoNodeMutations, todoNodeNodesAtom } from 'atoms/todoNode'
import CacheStatus from 'components/ui/CacheStatus'
import Navbar from 'components/ui/Navbar'
import NetworkStatus from 'components/ui/NetworkStatus'
import SyncReport from 'components/ui/SyncReport'
import useContentMutation, { type ContentMutation } from 'hooks/useContentMutation'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'
import useIdle from 'hooks/useIdle'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import { type TodoMetadata } from 'libs/db/todo'

const TodoNavbar: React.FC<TodoNavbarProps> = ({ disabled, focusTodoNode, todoId, todoName }) => {
  const { offline } = useNetworkStatus()

  const [editorState, setEditorState] = useAtom(todoEditorStateAtom)
  const resetMutations = useResetAtom(todoNodeMutations)

  const { isLoading, mutate } = useContentMutation()

  const idle = useIdle()

  const navbarDisabled = disabled || isLoading

  const getTodoAtoms = useAtomCallback(
    useCallback(
      (get) => ({
        children: get(todoNodeChildrenAtom),
        mutations: get(todoNodeMutations),
        nodes: get(todoNodeNodesAtom),
      }),
      []
    )
  )

  const onSettledMutation = useCallback(
    (_: unknown, error: unknown) => {
      setEditorState({ error, isLoading: false, lastSync: error ? undefined : new Date() })

      focusTodoNode(false)
    },
    [focusTodoNode, setEditorState]
  )

  const onSuccessMutation = useCallback(() => {
    resetMutations()
  }, [resetMutations])

  const save = useCallback(async () => {
    if (offline || !todoId) {
      return
    }

    const { children, mutations, nodes } = await getTodoAtoms()

    const mutationData: ContentMutation = {
      action: 'update',
      id: todoId,
      children: { root: children.root },
      mutations: { delete: [], insert: {}, update: {} },
    }

    Object.entries(mutations).forEach(([id, mutationType]) => {
      const node = nodes[id]
      const nodeChildren = children[id]

      const isInsert = mutationType === 'insert'
      const isUdpate = mutationType === 'update'

      if ((isInsert || isUdpate) && node && nodeChildren) {
        if (isInsert) {
          mutationData.mutations.insert[id] = node
        } else {
          mutationData.mutations.update[id] = node
        }

        mutationData.children[id] = nodeChildren
      } else if (mutationType === 'delete') {
        mutationData.mutations.delete.push(id)
      }
    })

    setEditorState({ isLoading: true })

    mutate(mutationData, { onSettled: onSettledMutation, onSuccess: onSuccessMutation })
  }, [getTodoAtoms, mutate, offline, onSettledMutation, onSuccessMutation, setEditorState, todoId])

  useGlobalShortcuts(
    useMemo(
      () => [
        {
          group: 'Todo',
          keybinding: 'Meta+S',
          label: 'Save',
          onKeyDown: (event) => {
            event.preventDefault()

            if (!editorState.pristine) {
              save()
            }
          },
        },
      ],
      [editorState.pristine, save]
    )
  )

  useEffect(() => {
    if (idle && !editorState.pristine) {
      save()
    }
  }, [editorState.pristine, idle, save])

  return (
    <Navbar disabled={navbarDisabled} title={todoName}>
      <Navbar.Spacer />
      <SyncReport isLoading={isLoading} error={editorState.error} lastSync={editorState.lastSync} />
      <NetworkStatus />
      <CacheStatus />
      <Navbar.Button
        primary
        onPress={save}
        loading={isLoading}
        disabled={offline || editorState.pristine}
        pinged={!editorState.pristine && !isLoading}
      >
        Save
      </Navbar.Button>
    </Navbar>
  )
}

export default TodoNavbar

interface TodoNavbarProps {
  disabled?: boolean
  focusTodoNode: (scrollIntoView?: boolean) => void
  todoId: TodoMetadata['id']
  todoName?: TodoMetadata['name']
}

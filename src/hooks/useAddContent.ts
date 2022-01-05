import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from 'react-query'

import client, { handleApiError } from 'libs/api/client'
import { type AddNoteBody } from 'pages/api/notes'
import { type AddTodoBody } from 'pages/api/todos'
import { type NoteMetaData } from 'libs/db/note'
import useContentType, { ContentType } from 'hooks/useContentType'
import { CONTENT_TREE_QUERY_KEY } from 'hooks/useContentTree'
import { TodoMetaData } from 'libs/db/todo'

export default function useAddContent() {
  const { push } = useRouter()
  const { type, urlPath } = useContentType()
  const queryClient = useQueryClient()

  const mutation = useMutation<NoteMetaData | TodoMetaData, unknown, AddContentData>(
    (data) => {
      if (!type) {
        throw new Error('Missing content type to add content.')
      }

      return type === ContentType.NOTE ? addNote(data) : addTodo(data)
    },
    {
      onSuccess: (newContentData) => {
        queryClient.invalidateQueries(CONTENT_TREE_QUERY_KEY)

        push(`${urlPath}/${newContentData.id}`)
      },
    }
  )

  handleApiError(mutation)

  return mutation
}

function addNote(data: AddNoteBody) {
  return client.post('notes', { json: data }).json<NoteMetaData>()
}

function addTodo(data: AddTodoBody) {
  return client.post('notes', { json: data }).json<TodoMetaData>()
}

type AddContentData = AddNoteBody | AddTodoBody

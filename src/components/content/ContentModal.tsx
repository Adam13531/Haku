import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { type NestedValue, useForm } from 'react-hook-form'
import { RiErrorWarningLine, RiFileAddLine } from 'react-icons/ri'

import { contentModalAtom, setContentModalOpenedAtom } from 'atoms/modal'
import FolderPicker from 'components/folder/FolderPicker'
import Button from 'components/form/Button'
import Form from 'components/form/Form'
import IconButton from 'components/form/IconButton'
import TextInput from 'components/form/TextInput'
import Alert from 'components/ui/Alert'
import Modal from 'components/ui/Modal'
import { ROOT_FOLDER_ID } from 'constants/folder'
import useContentType from 'hooks/useContentType'
import useMetadataMutation, { type MetadataMutation } from 'hooks/useMetadataMutation'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import useToast from 'hooks/useToast'
import { type FolderData } from 'libs/db/folder'

const ContentModal: React.FC = () => {
  const { offline } = useNetworkStatus()

  const { cType, lcType } = useContentType()

  const { addToast } = useToast()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormFields>()

  const { error, isLoading, mutate } = useMetadataMutation()
  const { action, data: content, opened } = useAtomValue(contentModalAtom)
  const setOpened = useSetAtom(setContentModalOpenedAtom)

  const isUpdating = action === 'update' && typeof content !== 'undefined'
  const isRemoving = action === 'delete' && typeof content !== 'undefined'

  useEffect(() => {
    reset()
  }, [opened, reset])

  const onSubmit = handleSubmit(({ folder, ...data }) => {
    const folderId = folder.id === ROOT_FOLDER_ID ? undefined : folder.id

    const mutationData: MetadataMutation = isUpdating
      ? { ...data, action: 'update', folderId, id: content.id }
      : { ...data, action: 'insert', folderId }

    mutate(mutationData, { onSuccess: onSuccessfulMutation })
  })

  function onConfirmDelete() {
    if (isRemoving) {
      mutate({ action: 'delete', id: content.id }, { onSuccess: onSuccessfulMutation, onError: onErrorMutation })
    }
  }

  function onSuccessfulMutation() {
    setOpened(false)
    reset()
  }

  function onErrorMutation() {
    const action = isRemoving ? 'delete' : isUpdating ? 'update' : 'create'

    addToast({
      details: 'Please try again.',
      icon: RiErrorWarningLine,
      text: `Failed to ${action} ${lcType}.`,
      type: 'foreground',
    })
  }

  const title = `${isUpdating ? 'Edit' : 'New'} ${cType}`

  return (
    <>
      <Alert
        disabled={isLoading}
        onOpenChange={setOpened}
        title={`Delete ${cType}`}
        onConfirm={onConfirmDelete}
        opened={opened && isRemoving}
      >
        Are you sure you want to delete the {lcType} <strong>&ldquo;{content?.name}&rdquo;</strong>?
      </Alert>
      <Modal
        title={title}
        disabled={isLoading}
        onOpenChange={setOpened}
        opened={opened && !isRemoving}
        trigger={<IconButton icon={RiFileAddLine} tooltip={title} disabled={offline} />}
      >
        <Form onSubmit={onSubmit} error={error}>
          <TextInput
            type="text"
            label="Name"
            enterKeyHint="done"
            disabled={isLoading}
            placeholder="Beef Bourguignon"
            defaultValue={content?.name ?? ''}
            errorMessage={errors.name?.message}
            {...register('name', { required: 'required' })}
          />
          <FolderPicker
            name="folder"
            control={control}
            disabled={isLoading}
            defaultFolderId={content?.folderId}
            errorMessage={errors.folder?.message}
          />
          <Modal.Footer disabled={isLoading}>
            <Button type="submit" primary disabled={isLoading || offline} loading={isLoading}>
              {isUpdating ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default ContentModal

type FormFields = {
  name: string
  folder: NestedValue<FolderData>
}

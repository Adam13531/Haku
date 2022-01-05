import { useEffect } from 'react'
import { type NestedValue, useForm } from 'react-hook-form'
import { RiFolderAddLine } from 'react-icons/ri'

import Alert from 'components/Alert'
import Button from 'components/Button'
import FolderPicker, { ROOT_FOLDER_ID } from 'components/FolderPicker'
import Form from 'components/Form'
import IconButton from 'components/IconButton'
import Modal from 'components/Modal'
import TextInput from 'components/TextInput'
import useFolderMutation, { type FolderMutation } from 'hooks/useFolderMutation'
import { type FolderData } from 'libs/db/folder'
import { useStore, type StoreState } from 'stores'

const storeSelector = (state: StoreState) => [state.folder, state.setFolderModal] as const

const NewFolderModal: React.FC = () => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormFields>()

  const { error, isLoading, mutate } = useFolderMutation()
  const [{ data: folder, mutationType, opened }, setOpened] = useStore(storeSelector)

  const isUpdating = mutationType === 'update' && typeof folder !== 'undefined'
  const isRemoving = mutationType === 'remove' && typeof folder !== 'undefined'

  useEffect(() => {
    reset()
  }, [opened, reset])

  const onSubmit = handleSubmit(({ parentFolder, ...data }) => {
    const parentId = parentFolder.id === ROOT_FOLDER_ID ? null : parentFolder.id

    const mutationData: FolderMutation = isUpdating
      ? { ...data, mutationType: 'update', id: folder.id, parentId }
      : { ...data, mutationType: 'add', parentId }

    mutate(mutationData, { onSuccess: onSuccessfulMutation })
  })

  function onConfirmDelete() {
    if (isRemoving) {
      mutate({ mutationType: 'remove', id: folder.id }, { onSuccess: onSuccessfulMutation })
    }
  }

  function onSuccessfulMutation() {
    setOpened(false)
    reset()
  }

  return (
    <>
      <Alert
        disabled={isLoading}
        title="Delete Folder"
        onOpenChange={setOpened}
        onConfirm={onConfirmDelete}
        opened={opened && isRemoving}
      >
        Are you sure you want to delete the folder <strong>&ldquo;{folder?.name}&rdquo;</strong> and all its contents?
      </Alert>
      <Modal
        disabled={isLoading}
        onOpenChange={setOpened}
        opened={opened && !isRemoving}
        title={`${isUpdating ? 'Edit' : 'New'} Folder`}
        trigger={<IconButton icon={RiFolderAddLine} tooltip="New Folder" />}
      >
        <Form onSubmit={onSubmit} error={error}>
          <TextInput
            type="text"
            label="Name"
            disabled={isLoading}
            placeholder="Recipes"
            defaultValue={folder?.name ?? ''}
            errorMessage={errors.name?.message}
            {...register('name', { required: 'required' })}
          />
          <FolderPicker
            control={control}
            name="parentFolder"
            disabled={isLoading}
            label="Parent Folder"
            defaultFolderId={folder?.parentId}
            errorMessage={errors.parentFolder?.message}
          />
          <Modal.Footer disabled={isLoading}>
            <Button type="submit" primary disabled={isLoading} loading={isLoading}>
              Create
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default NewFolderModal

type FormFields = {
  name: string
  parentFolder: NestedValue<FolderData>
}

import { FolderType, Note } from '@prisma/client'
import { StatusCode } from 'status-code-enum'
import slug from 'url-slug'

import { handleDbError, prisma } from 'libs/db'
import { getFolderById } from 'libs/db/folder'
import {
  ApiError,
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_INVALID_TYPE,
  API_ERROR_NOTE_ALREADY_EXISTS,
  API_ERROR_NOTE_DOES_NOT_EXIST,
  API_ERROR_NOTE_HTML_OR_TEXT_MISSING,
} from 'libs/api/routes/errors'

export type NoteMetadata = Pick<Note, 'id' | 'folderId' | 'name' | 'slug'>
export type NoteData = NoteMetadata & Pick<Note, 'html'>

const noteMetadataSelect = { id: true, name: true, folderId: true, slug: true }
const noteDataSelect = { ...noteMetadataSelect, html: true }

export async function addNote(
  userId: UserId,
  name: NoteMetadata['name'],
  folderId?: NoteMetadata['folderId']
): Promise<NoteMetadata> {
  return prisma.$transaction(async (prisma) => {
    await validateFolder(folderId, userId)

    try {
      return await prisma.note.create({
        data: { userId, name, folderId, slug: slug(name), html: `<h1>${name}</h1><p></p>`, text: `${name}\n\n` },
        select: noteMetadataSelect,
      })
    } catch (error) {
      handleDbError(error, {
        unique: {
          userId_name: API_ERROR_NOTE_ALREADY_EXISTS,
          folderId_userId_name: API_ERROR_NOTE_ALREADY_EXISTS,
        },
      })
    }
  })
}

export async function getNote(id: NoteData['id'], userId: UserId): Promise<NoteData> {
  const note = await prisma.note.findFirst({ where: { id, userId }, select: noteDataSelect })

  if (!note) {
    throw new ApiError(API_ERROR_NOTE_DOES_NOT_EXIST, StatusCode.ClientErrorNotFound)
  }

  return note
}

export async function getNotesMetadataGroupedByFolder(userId: UserId): Promise<NotesMetadataGroupedByFolder> {
  const metaDatas = await prisma.note.findMany({
    where: { userId },
    select: noteMetadataSelect,
    orderBy: [{ name: 'asc' }],
  })

  const notesMetadataGroupedByFolder: NotesMetadataGroupedByFolder = new Map()

  metaDatas.forEach((note) => {
    notesMetadataGroupedByFolder.set(note.folderId, [...(notesMetadataGroupedByFolder.get(note.folderId) ?? []), note])
  })

  return notesMetadataGroupedByFolder
}

export function updateNote(id: NoteMetadata['id'], userId: UserId, data: UpdateNoteData): Promise<NoteMetadata> {
  return prisma.$transaction(async (prisma) => {
    const note = await getNoteById(id, userId)

    if (!note) {
      throw new ApiError(API_ERROR_NOTE_DOES_NOT_EXIST)
    }

    if ((data.html && !data.text) || (data.text && !data.html)) {
      throw new ApiError(API_ERROR_NOTE_HTML_OR_TEXT_MISSING)
    }

    await validateFolder(data.folderId, userId)

    try {
      return await prisma.note.update({
        where: {
          id,
        },
        data: {
          folderId: data.folderId,
          name: data.name,
          slug: data.name ? slug(data.name) : undefined,
          html: data.html,
          text: data.text,
        },
        select: data.html && data.text ? noteDataSelect : noteMetadataSelect,
      })
    } catch (error) {
      handleDbError(error, {
        unique: {
          userId_name: API_ERROR_NOTE_ALREADY_EXISTS,
          folderId_userId_name: API_ERROR_NOTE_ALREADY_EXISTS,
        },
      })
    }
  })
}

export function removeNote(id: NoteMetadata['id'], userId: UserId) {
  return prisma.$transaction(async (prisma) => {
    const note = await getNoteById(id, userId)

    if (!note) {
      throw new ApiError(API_ERROR_NOTE_DOES_NOT_EXIST)
    }

    return prisma.note.delete({ where: { id } })
  })
}

function getNoteById(id: number, userId: UserId): Promise<Note | null> {
  return prisma.note.findFirst({ where: { id, userId } })
}

async function validateFolder(folderId: NoteMetadata['folderId'] | undefined, userId: UserId) {
  if (folderId) {
    const folder = await getFolderById(folderId, userId)

    if (!folder) {
      throw new ApiError(API_ERROR_FOLDER_DOES_NOT_EXIST)
    }

    if (folder.type !== FolderType.NOTE) {
      throw new ApiError(API_ERROR_FOLDER_INVALID_TYPE)
    }
  }
}

type NotesMetadataGroupedByFolder = Map<NoteMetadata['folderId'], NoteMetadata[]>

type UpdateNoteData = Partial<Pick<NoteMetadata, 'name' | 'folderId'> & Pick<NoteData, 'html'> & Pick<Note, 'text'>>
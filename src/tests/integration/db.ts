import { type EmailAllowList, FolderType, TodoNode } from '@prisma/client'
import faker from '@faker-js/faker'
import slug from 'url-slug'

import { prisma } from 'libs/db'
import { type FolderData } from 'libs/db/folder'
import { type NoteMetadata } from 'libs/db/note'
import { type TodoMetadata } from 'libs/db/todo'
import { getTestUser } from 'tests/integration'

function createTestFolder(options: TestFolderOptions) {
  return prisma.folder.create({
    data: {
      name: options?.name ?? faker.lorem.words(),
      parentId: options?.parentId,
      type: options.type,
      userId: options?.userId ?? getTestUser().userId,
    },
  })
}

export function createTestNoteFolder(options?: Omit<TestFolderOptions, 'type'>) {
  return createTestFolder({ ...options, type: FolderType.NOTE })
}

export function createTestTodoFolder(options?: Omit<TestFolderOptions, 'type'>) {
  return createTestFolder({ ...options, type: FolderType.TODO })
}

export function getTestFolders(options: TestFolderOptions) {
  return prisma.folder.findMany({
    where: {
      ...options,
      type: options.type,
      userId: options?.userId ?? getTestUser().userId,
    },
  })
}

export function getTestFolder(id: FolderData['id']) {
  return prisma.folder.findUnique({ where: { id } })
}

export function createTestNote(options?: TestNoteOptions) {
  const name = options?.name ?? faker.lorem.words()
  const data = faker.lorem.paragraphs(3)

  return prisma.note.create({
    data: {
      name,
      folderId: options?.folderId,
      html: data,
      slug: slug(name),
      text: data,
      userId: options?.userId ?? getTestUser().userId,
    },
  })
}

export async function createTestTodo(options?: TestTodoOptions) {
  const name = options?.name ?? faker.lorem.words()

  const todoNode = await createTestTodoNode()

  return prisma.todo.create({
    data: {
      name,
      folderId: options?.folderId,
      slug: slug(name),
      userId: options?.userId ?? getTestUser().userId,
      rootNodes: [todoNode.id],
      nodes: {
        connect: [{ id: todoNode.id }],
      },
    },
    include: {
      nodes: true,
    },
  })
}

export function getTestNotes(options?: TestNoteOptions) {
  return prisma.note.findMany({
    where: {
      ...options,
      userId: options?.userId ?? getTestUser().userId,
    },
  })
}

export function getTestTodos(options?: TestTodoOptions) {
  return prisma.todo.findMany({
    where: {
      ...options,
      userId: options?.userId ?? getTestUser().userId,
    },
  })
}

export function getTestNote(id: NoteMetadata['id']) {
  return prisma.note.findUnique({ where: { id } })
}

export function getTestTodo(id: TodoMetadata['id']) {
  return prisma.todo.findUnique({ where: { id }, include: { nodes: true } })
}

export function createTestTodoNode(options?: TestTodoNodeOptions) {
  return prisma.todoNode.create({
    data: {
      content: options?.content ?? faker.lorem.words(),
    },
  })
}

export function createTestEmailAllowList() {
  return prisma.emailAllowList.create({
    data: {
      email: faker.internet.email(),
    },
  })
}

export function getTestEmailAllowLists(options: TestEmailAllowListOptions) {
  return prisma.emailAllowList.findMany({
    where: options,
  })
}

export function getTestEmailAllowList(id: EmailAllowList['id']) {
  return prisma.emailAllowList.findUnique({ where: { id } })
}

interface TestFolderOptions {
  name?: FolderData['name']
  parentId?: FolderData['parentId']
  type: FolderType
  userId?: UserId
}

interface TestNoteOptions {
  name?: NoteMetadata['name']
  folderId?: NoteMetadata['folderId']
  userId?: UserId
}

interface TestTodoOptions {
  name?: TodoMetadata['name']
  folderId?: TodoMetadata['folderId']
  userId?: UserId
}

interface TestTodoNodeOptions {
  content?: TodoNode['content']
}

interface TestEmailAllowListOptions {
  email?: EmailAllowList['email']
}

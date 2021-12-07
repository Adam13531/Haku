import { EmailAllowList } from '@prisma/client'

import { prisma } from 'libs/db'

export function getAllowedEmails(): Promise<EmailAllowList[]> {
  return prisma.emailAllowList.findMany()
}

export function addAllowedEmail(email: EmailAllowList['email']): Promise<EmailAllowList> {
  return prisma.emailAllowList.create({ data: { email } })
}

export async function removeAllowedEmail(id: EmailAllowList['id']): Promise<void> {
  await prisma.emailAllowList.delete({ where: { id } })
}

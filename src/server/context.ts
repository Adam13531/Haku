import { type IncomingHttpHeaders } from 'http'

import { inferAsyncReturnType } from '@trpc/server'
import { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { type NextApiRequest } from 'next'
import { getSession } from 'next-auth/react'

export async function createContext(opts?: CreateNextContextOptions) {
  return {
    isAdmin: isAdmin(opts?.req.headers),
    user: await getUser(opts?.req),
  }
}

function isAdmin(headers?: IncomingHttpHeaders) {
  const apiKey = headers?.['api-key']

  return apiKey === process.env.ADMIN_API_KEY
}

async function getUser(req: NextApiRequest | undefined) {
  const session = await getSession({ req })

  return session?.user
}

export type Context = Partial<inferAsyncReturnType<typeof createContext>>

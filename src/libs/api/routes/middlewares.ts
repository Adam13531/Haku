import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import StatusCode from 'status-code-enum'

import { z } from 'libs/validation'

export function withAdmin(handler: NextApiHandler) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const apiKey = req.headers['api-key']

    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(StatusCode.ClientErrorUnauthorized).end()
    }

    return handler(req, res)
  }
}

export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })

    if (!session) {
      return res.status(StatusCode.ClientErrorUnauthorized).end()
    }

    req.user = session.user

    return handler(req, res)
  }
}

export function withValidation<Schema extends ApiRequestValidationSchema, ResponseType>(
  handler: ApiHandlerWithValidation<Schema, ResponseType>,
  bodySchema?: Schema['body'],
  querySchema?: Schema['query']
) {
  return (req: NextApiRequest, res: NextApiResponse<ResponseType>) => {
    try {
      req.body = bodySchema?.parse(parseJson(req.body))
      req.query = querySchema?.parse(parseJson(req.query)) as NextApiRequest['query']

      return handler(req, res)
    } catch (error) {
      return res.status(StatusCode.ClientErrorBadRequest).end()
    }
  }
}

function parseJson(json: unknown) {
  return typeof json === 'string' ? JSON.parse(json) : json
}

type ValidationSchema = z.ZodType<unknown>
export type ApiRequestValidationSchema = { body?: ValidationSchema; query?: ValidationSchema }

export type ValidatedApiRequest<Schema extends ApiRequestValidationSchema> = Omit<NextApiRequest, 'body' | 'query'> & {
  body: Schema['body'] extends ValidationSchema ? z.infer<Schema['body']> : NextApiRequest['body']
  query: Schema['query'] extends ValidationSchema ? z.infer<Schema['query']> : NextApiRequest['query']
}

type ApiHandlerWithValidation<Schema extends ApiRequestValidationSchema, ResponseType> = (
  req: ValidatedApiRequest<Schema>,
  res: NextApiResponse<ResponseType>
) => void | Promise<void>

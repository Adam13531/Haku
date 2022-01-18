import { type NextApiResponse } from 'next'

import { createApiRoute } from 'libs/api/routes'
import { type ValidatedApiRequest, withAdmin, withValidation } from 'libs/api/routes/middlewares'
import { z, zQuerySchemaWithId } from 'libs/validation'
import { removeAllowedEmail } from 'libs/db/emailAllowList'

const route = createApiRoute(
  {
    delete: withValidation(deleteHandler, undefined, zQuerySchemaWithId),
  },
  [withAdmin]
)

export default route

async function deleteHandler(req: ValidatedApiRequest<{ query: RemoveAllowedEmailQuery }>, res: NextApiResponse<void>) {
  await removeAllowedEmail(req.query.id)

  return res.status(200).end()
}

type RemoveAllowedEmailQuery = z.infer<typeof zQuerySchemaWithId>

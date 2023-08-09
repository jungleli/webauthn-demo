import { rest } from 'msw'
import { db } from './db'

export const handlers = [
  rest.post('/register', async (req, res, ctx) => {
    try {
        const id = await db.users.add({
            // @ts-ignore
            username: req.body.username
          });
          return res(
            ctx.status(200),
            ctx.json({
              data: id,
            }),
          )
    } catch (error) {
        return res(
            ctx.status(403),
            ctx.json({
              errorMessage: error,
            }),
          )
    }
  }),
]

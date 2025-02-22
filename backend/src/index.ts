import { Hono } from 'hono'
import { userRouter } from './routes/user'
import { blogRouter } from './routes/blog'
import { trimTrailingSlash } from 'hono/trailing-slash'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_PASSWORD: string
  }
}>().basePath('/api/v1')

app.use(trimTrailingSlash())
app.route("/user", userRouter)
app.route("/blog", blogRouter)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})


export default app

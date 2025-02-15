import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate"
import { sign, verify } from "hono/jwt"

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_PASSWORD: string
  }
}>().basePath('/api/v1')

app.use("/blog/*", async (c, next) => {

  const header = c.req.header("Authorization") || "";

  const token = header.split(" ")[1]

  const response = await verify(token, c.env.JWT_PASSWORD);

  if (response.id) {

    await next();

  } else {
    c.status(403);
    return c.json({ "msg": "unauthorized" })
  }

})


const getPrismaClient = (c: any) => new PrismaClient({
  datasources: {
    db: {
      url: c.env.DATABASE_URL,
    },
  },
}).$extends(withAccelerate())

app.get('/', (c) => {
  const prisma = getPrismaClient(c)
  return c.text('Hello Hono!')
})

app.post("/signup", async (c) => {
  const prisma = getPrismaClient(c)
  const body = await c.req.json()

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name
      }
    })

    const token = await sign({ id: user.id }, c.env.JWT_PASSWORD)
    return c.json({ jwt: token })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Registration failed" }, 500)
  }
})

app.post("/signin", async (c) => {
  const prisma = getPrismaClient(c)
  const body = await c.req.json()

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password
      }
    })

    if (!user) {
      return c.json({ error: "User not found" }, 404)
    }

    const token = await sign({ id: user.id }, c.env.JWT_PASSWORD)
    return c.json({ jwt: token })
  } catch (error) {
    console.error(error)
    return c.json({ error: "Login failed" }, 500)
  }
})

app.post("/blog", (c) => {
  return c.text("blog")
})

app.put("/blog", (c) => {
  return c.text("put blog")

})

app.get("/blog/:id", (c) => {
  return c.text("get blog")
})

export default app

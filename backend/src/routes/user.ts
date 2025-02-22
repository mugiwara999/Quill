import { PrismaClient } from "@prisma/client/edge"

import { Hono } from "hono";
import { sign } from "hono/jwt";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_PASSWORD: string
  }
}>()

const getPrismaClient = (c: any) => new PrismaClient({
  datasources: {
    db: {
      url: c.env.DATABASE_URL
    }
  }
})

userRouter.post("/signup", async (c) => {
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

userRouter.post("/signin", async (c) => {
  const prisma = getPrismaClient(c)
  const body = await c.req.json()

  try {
    const user = await prisma.user.findFirst({
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


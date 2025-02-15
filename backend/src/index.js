import { Hono } from 'hono';
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import "dotenv/config";
const app = new Hono().basePath('/api/v1');
app.get('/', (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL,
    }).$extends(withAccelerate());
    return c.text('Hello Hono!');
});
app.post("/signup", (c) => {
    return c.text("signup");
});
app.post("/signin", (c) => {
    return c.text("signin");
});
app.post("/blog", (c) => {
    return c.text("blog");
});
app.put("/blog", (c) => {
    return c.text("put blog");
});
app.get("/blog/:id", (c) => {
    return c.text("get blog");
});
export default app;

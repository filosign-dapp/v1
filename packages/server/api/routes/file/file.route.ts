import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { respond } from "@/api/lib/utils/respond";
import W3UpClient from "@/api/lib/utils/w3up-client";
import { env } from "@/env";

const file = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        name: z.string(),
      })
    ),
    async (ctx) => {
      const { name } = ctx.req.valid("query");

      if (!name) {
        return respond.err(ctx, "Name is required", 400);
      }

      return respond.ok(
        ctx,
        {
          name,
        },
        "Successfully fetched data",
        200
      );
    }
  )

  .post(
    "/",
    async (ctx) => {
      try {
        const { file } = await ctx.req.parseBody();

        if(typeof file === 'string') {
          return respond.err(ctx, "File is required", 400);
        }

        const client = new W3UpClient();
        await client.init(
          {
            email: "kartik100100@gmail.com",
            spaceName: "portal",
          }
        )
        const cid = await client.uploadFile(file);

        return respond.ok(ctx, { cid }, "Successfully uploaded file", 200);
      } catch (error) {
        return respond.err(ctx, "Failed to upload file", 500);
      }
    }
  )

export default file;
export type FileType = typeof file;

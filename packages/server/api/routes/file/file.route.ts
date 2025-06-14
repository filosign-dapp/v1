import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { respond } from "@/api/lib/utils/respond";
import { getW3UpClient } from "@/api/lib/utils/w3up-client";

const file = new Hono()
  .get(
    "/:cid",
    zValidator(
      "param",
      z.object({
        cid: z.string(),
      })
    ),
    async (ctx) => {
      const { cid } = ctx.req.valid("param");

      if (!cid) {
        return respond.err(ctx, "CID is required", 400);
      }

      return respond.ok(
        ctx,
        {
          cid,
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

        const w3upClient = getW3UpClient();
        const cid = await w3upClient.uploadFile(file);
        const url = w3upClient.getGatewayUrl(cid);

        return respond.ok(ctx, { cid, url }, "Successfully uploaded file", 200);
      } catch (error) {
        return respond.err(ctx, "Failed to upload file", 500);
      }
    }
  )

export default file;
export type FileType = typeof file;

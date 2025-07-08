import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { respond } from "@/api/lib/utils/respond";
import { getW3UpClient } from "@/api/lib/utils/w3up-client";
import { db } from "@/api/lib/db/db";
import { filesTable } from "@/api/lib/db/schema";
import { zNumberString } from "@/api/lib/utils/zod";
import { eq, inArray, lt } from "drizzle-orm";
import { MAX_FILE_SIZE } from "@/src/lib/utils/files";
import { bearerAuth } from 'hono/bearer-auth'
import { env } from "@/env";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        page: zNumberString().default("1"),
        limit: zNumberString().default("10"),
      })
    ),
    async (ctx) => {
      const { page, limit } = ctx.req.valid("query");

      const cids = await db.select({
        cid: filesTable.cid,
      }).from(filesTable).limit(limit).offset((page - 1) * limit);

      return respond.ok(
        ctx,
        {
          cids: cids.flatMap(({ cid }) => cid),
          hasMore: cids.length === limit,
        },
        "Successfully fetched data",
        200
      );
    }
  )

  .get("/download/:cid", zValidator("param", z.object({
    cid: z.string(),
  })), async (ctx) => {
    const { cid } = ctx.req.valid("param");

    try {
      const file = await db.select().from(filesTable).where(eq(filesTable.cid, cid)).limit(1);

      if(!file || file.length === 0) {
        return respond.err(ctx, "File not found", 404);
      }

      return respond.ok(ctx, file[0], "Successfully fetched file", 200);
    } catch (error) {
      return respond.err(ctx, "Failed to fetch file", 500);
    }
  })

  .post(
    "/",
    async (ctx) => {
      try {
        const { file } = await ctx.req.parseBody();

        if (!file || !(file instanceof File)) {
          return respond.err(ctx, "File is required", 400);
        }

        if(file.size > MAX_FILE_SIZE) {
          return respond.err(ctx, "File is too large", 400);
        }

        const w3upClient = getW3UpClient();
        const cid = await w3upClient.uploadFile(file);

        await db.insert(filesTable).values({
          cid: cid.toString(),
          size: file.size,
          isDirectory: "false",
          fileNames: [file.name],
        });

        return respond.ok(ctx, { cid }, "Successfully uploaded file", 200);
      } catch (error) {
        return respond.err(ctx, "Failed to upload file", 500);
      }
    }
  )

  .post(
    "/directory",
    async (ctx) => {
      try {
        const body = await ctx.req.parseBody({ all: true });
        const files = body['files'] as File[];

        if (!files || !Array.isArray(files) || files.length === 0) {
          return respond.err(ctx, "Files are required", 400);
        }

        const totalSize = files.reduce((sum: number, file: File) => sum + file.size, 0);

        if(totalSize > 2 * MAX_FILE_SIZE) {
          return respond.err(ctx, `Total size cannot exceed ${2 * MAX_FILE_SIZE}`, 400);
        }

        const w3upClient = getW3UpClient();
        const cid = await w3upClient.uploadDirectory(files);

        const gatewayUrl = w3upClient.getGatewayUrl(cid.toString());
        console.log(gatewayUrl);

        const fileNames = files.map((file: File) => file.name);

        await db.insert(filesTable).values({
          cid: cid.toString(),
          size: totalSize,
          isDirectory: "true",
          fileNames,
        });

        return respond.ok(ctx, { cid }, "Successfully uploaded directory", 200);
      } catch (error) {
        console.error(error);
        return respond.err(ctx, "Failed to upload directory", 500);
      }
    }
  )

  .get("/flush", bearerAuth({ token: env.SUPERADMIN_PASSWORD }), zValidator("query", z.object({
    days: zNumberString().default("7"),
  })), async (ctx) => {
    const { days } = ctx.req.valid("query");

    try {
      const files = await db.select({
        id: filesTable.id,
        cid: filesTable.cid,
      }).from(filesTable).where(lt(filesTable.createdAt, new Date(Date.now() - (days * 24 * 60 * 60 * 1000))));

      if (files.length === 0) {
        return respond.ok(ctx, {}, "No outdated files found", 200);
      }

      const w3upClient = getW3UpClient();
      await Promise.allSettled(files.map(({ cid }) => w3upClient.removeFile(cid))).catch((error) => {
        console.log(error);
      });
      await db.delete(filesTable).where(inArray(filesTable.id, files.map(({ id }) => id)));

      return respond.ok(ctx, {}, "Successfully flushed outdated files", 200);
    } catch (error) {
      console.log(error);
      return respond.err(ctx, "Failed to flush files", 500);
    }
  })

export default app;
export type FileType = typeof app;

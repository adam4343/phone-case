import { createUploadthing, type FileRouter } from "uploadthing/express";
import z from "zod";
import { db } from "./db";
import { phoneCase } from "./db/schema/phone-case.schema";
import { eq } from "drizzle-orm";
import sharp from "sharp";

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ configId: z.string() }))
    .middleware(async ({ input }) => {
      if (!input.configId) throw new Error("configId is required");
      return { configId: input.configId };
    })
    .onUploadError(async ({ error }) => {
      console.error("💥 Upload failed in UploadThing backend:", error);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { configId } = metadata;

      const existingCase = await db
        .select()
        .from(phoneCase)
        .where(eq(phoneCase.id, configId))
        .get();

      const response = await fetch(file.ufsUrl);
      const buffer = await response.arrayBuffer();
      const imageData = await sharp(buffer).metadata();
      const { width, height } = imageData;

      

      const updateData = !existingCase?.image
        ? {
            image: file.ufsUrl,
            width: width || 500,
            height: height || 500,
            totalPrice: 0
          }
        : { croppedImage: file.ufsUrl };

      
      await db
        .update(phoneCase)
        .set(updateData)
        .where(eq(phoneCase.id, configId));

      return { configId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;

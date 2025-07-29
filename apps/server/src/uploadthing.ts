import { createUploadthing, type FileRouter } from "uploadthing/express";
import z from "zod";
import { db } from "./db";
import { phoneCase } from "./db/schema/phone-case.schema";
import { eq } from "drizzle-orm";

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
      
      if (!input.configId) {
        throw new Error("configId is required");
      }
      
      return { configId: input.configId };
    })
    .onUploadError(async ({ error }) => {
      console.error("💥 Upload failed in UploadThing backend:");
      console.error("Error:", error);
    })
    .onUploadComplete(async ({ metadata, file }) => {
    
      
      const { configId } = metadata;
      
      if (!configId) {
        throw new Error("configId is missing in upload metadata");
      }

      try { 
        const [updatedCase] = await db
          .update(phoneCase)
          .set({ image: file.url })
          .where(eq(phoneCase.id, configId))
          .returning();

        if (!updatedCase) {
          throw new Error(`No phone case found with configId: ${configId}`);
        }

        const result = { configId };
        
        return result;
      } catch (dbError) {
        throw new Error("Failed to update phone case with image");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
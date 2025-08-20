import { db } from "@/db";
import { model } from "@/db/schema/phone-case.schema";
import { getErrorMessage } from "@/lib/helpers/getErrorMessage";
import { Router } from "express";

export const modelRouter = Router();

modelRouter.get("/", async (req, res) => {
    try {
      const models = await db.select().from(model);

      res.json({ data: models });
    } catch (e) {
      console.error("Failed to fetch models:", e);
      res.status(500).json({ error: getErrorMessage(e) });
    }
  });
  
import { db } from "@/db";
import { phoneCase } from "@/db/schema/phone-case.schema";
import { Router } from "express";

export const phoneCaseRouter = Router();

phoneCaseRouter.post("/", async (req, res) => {
  try {
    const { configId } = req.body;

    if (!configId) {
      return res.status(400).json({ error: "Missing configId in request body." });
    }

    const [newCase] = await db
      .insert(phoneCase)
      .values({
        price: 0,
        image: "",
        croppedImage: "TEMP",
        height: 0,
        width: 0,
        modelId: "TEMP",
        materialId: "TEMP",
        finishId: "TEMP",
        id: configId,
      })
      .returning();

    res.json({ data: newCase });
  } catch (error) {
    console.error("Failed to create phone case:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}); 


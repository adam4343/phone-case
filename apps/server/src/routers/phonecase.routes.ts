import { db } from "@/db";
import { material, model, phoneCase } from "@/db/schema/phone-case.schema";
import { Router } from "express";
import { eq } from 'drizzle-orm';
import { getErrorMessage } from "@/lib/helpers/getErrorMessage";
import { color } from "@/db/schema/colors.schema";
import z from "zod";

export const phoneCaseRouter = Router();

const createPhoneCaseSchema = z.object({
  configId: z.string().min(1, "configId is required"),
});

const phoneCaseIdSchema = z.object({
  id: z.string().min(1, "id is required")
})

phoneCaseRouter.post("/", async (req, res) => {
  try {
    const result = createPhoneCaseSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: getErrorMessage(result.error.issues)});
    }

    const { configId } = req.body;

    if (!configId) {
      return res.status(404).json({error: "Missing configId in request body."})
    }

    const [newCase] = await db
      .insert(phoneCase)
      .values({
        price: 0,
        image: "",
        croppedImage: "TEMP",
        height: 0,
        width: 0,
        modelId: null,
        materialId: null,
        colorId: null,
        id: configId,
      })
      .returning();


    res.json({ data: newCase });
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
}); 

phoneCaseRouter.get("/:id", async (req, res) => {
  try {
    const response = phoneCaseIdSchema.safeParse(req.params);

    if(!response.success) {
      return res.status(400).json({error: getErrorMessage(response.error.issues)})
    }

    const { id } = response.data;


    if (!id) {
      return res.status(400).json({ error: "ID parameter is required" });
    }

    const result = await db
      .select()
      .from(phoneCase)
      .leftJoin(model, eq(phoneCase.modelId, model.id))
      .leftJoin(material, eq(phoneCase.materialId, material.id))
      .leftJoin(color, eq(phoneCase.colorId, color.id))
      .where(eq(phoneCase.id, id))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: "No phone case found" });
    }

    const fullPhoneCase = result[0];

    res.json({
      data: {
        ...fullPhoneCase.phone_case, 
        model: fullPhoneCase.model,
        material: fullPhoneCase.material,
        color: fullPhoneCase.color,
      },
    });
  } catch (error) {
    console.error("Get phone case error:", error);
    res.status(500).json({ error: getErrorMessage(error) });
  }
});


phoneCaseRouter.put("/:id", async (req, res) => {
  try {
    const result = phoneCaseIdSchema.safeParse(req.params);

    if(!result.success) {
      return res.status(400).json({error: getErrorMessage(result.error.issues)})
    }

    const {id} = result.data

    const { materialId, colorId, modelId } = req.body;

    if (!materialId || !colorId || !modelId) {
      return res.status(400).json({ error: "materialId, colorId, and modelId are required." });
    }

    const existingCase = await db
      .select()
      .from(phoneCase)
      .where(eq(phoneCase.id, id))
      .limit(1);

    if (existingCase.length === 0) {
      return res.status(404).json({ error: "Phone case not found" });
    }

    const [materialExists] = await db.select().from(material).where(eq(material.id, materialId)).limit(1);
    const [modelExists] = await db.select().from(model).where(eq(model.id, modelId)).limit(1);
    const [colorExists] = await db.select().from(color).where(eq(color.id, colorId)).limit(1);

    const price = materialExists.price + modelExists.price;

    if (!materialExists || !modelExists || !colorExists) {
      return res.status(400).json({ error: "Invalid materialId, modelId, or colorId." });
    }

    const [updatedCase] = await db
      .update(phoneCase)
      .set({ materialId, colorId, modelId, price })
      .where(eq(phoneCase.id, id))
      .returning();

    res.json({ data: updatedCase });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

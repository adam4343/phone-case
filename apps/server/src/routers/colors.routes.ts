import { db } from "@/db";
import { color } from "@/db/schema/colors.schema";
import { getErrorMessage } from "@/lib/helpers/getErrorMessage";
import { Router } from "express";

export const colorsRouter = Router();

colorsRouter.get("/", async (req, res) => {
    try {
        const allColors = await db.select().from(color);
        return res.json({ data: allColors });
    } catch (error) {
        return res.status(500).json({ error: getErrorMessage(error) });
    }
});

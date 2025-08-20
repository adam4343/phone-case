import { db } from "@/db";
import { material } from "@/db/schema/phone-case.schema";
import { getErrorMessage } from "@/lib/helpers/getErrorMessage";
import { Router } from "express";

export const materialRouter = Router()

materialRouter.get("/", async(req,res) => {

    try {
        const materials = await db.select().from(material);

        res.json({ data: materials });
    } catch(e) {
        console.error("Failed to fetch models:", e);
        res.status(500).json({ error: getErrorMessage(e) });
    }   
})


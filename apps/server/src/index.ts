import "dotenv/config";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing";
import { phoneCaseRouter } from "./routers/phonecase.routes";
import { colorsRouter } from "./routers/colors.routes";
import { modelRouter } from "./routers/model.routes";
import { materialRouter } from "./routers/material.routes";
import { orderRouter } from "./routers/orders.routes";

const app = express();
const isDev = process.env.NODE_ENV !== "production";

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/order/webhook", express.raw({ type: 'application/json' }), orderRouter);


app.use(express.json());

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: {
      token: process.env.UPLOADTHING_TOKEN!,
      callbackUrl: process.env.UPLOADTHING_URL || `${process.env.BETTER_AUTH_URL}/api/uploadthing`,
      isDev,
    },
  })
);

app.use("/api/phone-case", phoneCaseRouter);
app.use("/api/colors", colorsRouter);
app.use("/api/models", modelRouter);
app.use("/api/material", materialRouter);
app.use("/api/order", orderRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(
    `🚀 Server running in ${isDev ? "development" : "production"} mode on port ${port}`
  );
});
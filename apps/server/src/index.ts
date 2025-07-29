import "dotenv/config";
import cors from "cors";
import express, { Router } from "express";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing";
import { phoneCaseRouter } from "./routers/phonecase.routes";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: {
      token: process.env.UPLOADTHING_TOKEN,
      callbackUrl: `http://localhost:3001/api/uploadthing`,
      isDev: true, 
    },
  }),
);

app.use("/api/phone-case", phoneCaseRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

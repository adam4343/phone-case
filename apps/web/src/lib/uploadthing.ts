import { generateReactHelpers } from "@uploadthing/react";
import type {OurFileRouter} from "../../../server/src/uploadthing";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>(
    {url: "http://localhost:3001/api/uploadthing"}
);

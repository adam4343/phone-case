import { generateReactHelpers } from "@uploadthing/react";
import type {OurFileRouter} from "../../../server/src/uploadthing";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>(
    {url: `${process.env.NEXT_PUBLIC_API_URL}/api/uploadthing`}
);

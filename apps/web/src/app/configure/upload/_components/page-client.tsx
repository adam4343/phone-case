"use client";

import { Progress } from "@/components/ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { Image, Loader2, MousePointerSquareDashed } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import Dropzone, { type FileRejection } from "react-dropzone";
import { toast } from "sonner";
import axios from "axios";
import { v7 as uuidv7 } from 'uuid';

export default function PageClient() {
  const [isDragOver, setIsDragOver] = React.useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { isUploading, startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete([data]) {
      
      const configId = data.serverData?.configId;
      
      if (!configId) {
        toast.error("Upload succeeded, but configId is missing.");
        console.error("❌ ServerData:", data.serverData);
        return;
      }

      startTransition(() => {
        router.push(`/configure/design?id=${configId}`);
      });
    },
    onUploadProgress(p) {
      setUploadProgress(p);
    },
    onUploadError: (error) => {
      console.error("💥 Upload failed:", error);
      toast.error("Upload failed. Please try again.");
      setIsDragOver(false);
    }
  });

  const onDropAccepted = async (files: File[]) => {
    try {
      const configId = uuidv7();
      
   
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/phone-case`, {
        configId,
      });
      
      
      const actualConfigId = res.data.data.id;
      
      startUpload(files, { configId: actualConfigId });
      
      setIsDragOver(false);
      
    } catch (error) {
      console.error("💥 Failed to create phone case:", error);
      toast.error("Failed to create phone case configuration.");
      setIsDragOver(false);
    }
  };

  const onDropRejected = (rejectedFile: FileRejection[]) => {
    const [file] = rejectedFile;
    toast.error(`${file.file.type} is not supported`, { icon: "❌" });
    setIsDragOver(false);
  };

  return (
    <div
      className={cn(
        "relative h-full flex-1 my-16 w-full rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl flex justify-center flex-col items-center",
        {
          "ring-blue-900/25 bg-blue-900/10": isDragOver,
        }
      )}
    >
      <div className="relative flex flex-1 flex-col items-center justify-center w-full">
        <Dropzone
          accept={{
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
            "image/jpg": [".jpg"],
          }}
          onDropAccepted={onDropAccepted}
          onDropRejected={onDropRejected}
          onDragEnter={() => setIsDragOver(true)}
          onDragLeave={() => setIsDragOver(false)}
        >
          {({ getRootProps, getInputProps }) => (
            <div
              className="h-full w-full flex-1 flex flex-col items-center justify-center"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              {isDragOver ? (
                <MousePointerSquareDashed className="h-6 w-6 text-zinc-500 mb-2" />
              ) : isUploading || isPending ? (
                <Loader2 className="animate-spin h-6 w-6 text-zinc-500 mb-2" />
              ) : (
                <Image className="w-5 h-5 text-neutral-900" />
              )}
              <div className="flex flex-col justify-center mb-2 text-sm text-zinc-700">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="text-center">
                      Uploading...
                      <Progress
                        value={uploadProgress}
                        className="mt-2 w-40 h-2 bg-gray-300"
                      />
                    </div>
                  </div>
                ) : isPending ? (
                  <div className="flex flex-col items-center">
                    <p>Redirecting, please wait...</p>
                  </div>
                ) : isDragOver ? (
                  <p>
                    <span className="font-semibold">Drop file</span> to upload
                  </p>
                ) : (
                  <p>
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                )}
              </div>

              {isPending ? null : (
                <p className="text-xs text-zinc-500">PNG, JPEG, JPG</p>
              )}
            </div>
          )}
        </Dropzone>
      </div>
    </div>
  );
}
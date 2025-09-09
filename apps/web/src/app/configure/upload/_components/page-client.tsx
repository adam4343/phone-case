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
    <div className="mt-10 mb-20 pb-20">
      <div className=" max-w-6xl mx-auto">
        <div
          className={cn(
            "relative h-[500px] w-full rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex justify-center flex-col items-center transition-colors duration-200 hover:bg-gray-100/50",
            {
              "border-blue-500 bg-blue-50": isDragOver,
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
                  className="h-full w-full flex-1 flex flex-col items-center justify-center cursor-pointer group"
                  {...getRootProps()}
                >
                  <input {...getInputProps()} />
                  
                  {/* Icon */}
                  <div className="mb-6">
                    {isDragOver ? (
                      <MousePointerSquareDashed className="h-10 w-10 text-primary" />
                    ) : isUploading || isPending ? (
                      <Loader2 className="animate-spin h-10 w-10 text-primary" />
                    ) : (
                      <Image className="w-10 h-10 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    )}
                  </div>

                  {/* Main text */}
                  <div className="flex flex-col justify-center items-center mb-4 text-center">
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          Uploading...
                        </p>
                        <Progress
                          value={uploadProgress}
                          className="w-48 h-3 bg-gray-200"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          {uploadProgress}% complete
                        </p>
                      </div>
                    ) : isPending ? (
                      <div className="flex flex-col items-center">
                        <p className="text-lg font-medium text-gray-900">
                          Redirecting, please wait...
                        </p>
                      </div>
                    ) : isDragOver ? (
                      <div>
                        <p className="text-lg font-medium text-blue-600">
                          Drop your file here
                        </p>
                        <p className="text-sm text-blue-500 mt-1">
                          Release to upload
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          <span className="text-primary transition-colors">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Choose an image for your phone case
                        </p>
                      </div>
                    )}
                  </div>

                  {/* File format info */}
                  {!isPending && (
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <span>Supported formats:</span>
                      <span className="font-medium">PNG, JPEG, JPG</span>
                    </div>
                  )}
                </div>
              )}
            </Dropzone>
          </div>
        </div>
      </div>
    </div>
  );
}
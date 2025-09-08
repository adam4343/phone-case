"use client";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Rnd } from "react-rnd";
import ResizeHandle from "./resize-handle";
import ConfigForm from "./config-form";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import React from "react";
import { usePriceStore } from "@/lib/store/price-store";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const configSchema = z.object({
  color: z.object({
    id: z.string(),
    name: z.string(),
    hex: z.string(),
  }),
  model: z.string(),
  material: z.string(),
});

interface DesignConfiguratorProps {
  configId: string;
  imageUrl: string;
  imageDimensions: { width: number; height: number };
}

interface UpdatePhoneCaseParams {
  caseId: string;
  colorId: string;
  modelId: string;
  materialId: string;
}

type Config = z.infer<typeof configSchema>;

export async function updatePhoneCase({
  caseId,
  colorId,
  modelId,
  materialId,
}: UpdatePhoneCaseParams) {
  try {
    const res = await axios.put(
      `http://localhost:3001/api/phone-case/${caseId}`,
      {
        colorId,
        modelId,
        materialId,
      }
    );

    return res.data;
  } catch (error) {
    console.error("Failed to update phone case:", error);
    throw error;
  }
}

export default function DesignConfigurator({
  configId,
  imageUrl,
  imageDimensions,
}: DesignConfiguratorProps) {
  const router = useRouter();
  
  const mutation = useMutation({
    mutationFn: async (args: UpdatePhoneCaseParams) => {
      await Promise.all([saveConfig(), updatePhoneCase({...args})])
    },
    onSuccess: () => {
      toast.success("Successfully configured the case");
      router.push(`/configure/preview?id=${configId}`)
    },
    onError: () => {
      toast.error("Something went wrong");
    }
  });

  const form = useForm<Config>({
    resolver: zodResolver(configSchema),
  });

  const [resizedDimension, setResizedDimension] = React.useState({
    width: imageDimensions.width / 4,
    height: imageDimensions.height / 4,
  });

  const [resizedPositon, setResizedPosition] = React.useState({
    x: 150,
    y: 205,
  });

  const {startUpload} = useUploadThing("imageUploader");

  const color = form.watch("color");

  const phoneRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { totalPrice } = usePriceStore();

  async function saveConfig() {
    try {
      const {
        left: caseLeft,
        width,
        height,
        top: caseTop,
      } = phoneRef.current!.getBoundingClientRect();
      const {
        left: containerLeft,
        width: containerWidth,
        top: containerTop,
      } = containerRef.current!.getBoundingClientRect();
  
      const leftOffset = caseLeft - containerLeft;
      const topOffset = caseTop - containerTop;
  
      const actualX = resizedPositon.x - leftOffset;
      const actualY = resizedPositon.y - topOffset;
  
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
  
      const userImage = new window.Image();
      userImage.crossOrigin = "anonymous";
      userImage.src = imageUrl;
  
      await new Promise((resolve) => (userImage.onload = resolve));
  
      ctx?.drawImage(
          userImage,
          actualX,
          actualY,
          resizedDimension.width,
          resizedDimension.height,
      );
  
      const base64 = canvas.toDataURL();
      const base64Data = base64.split(",")[1];
  
      const blob = base64ToBlob(base64Data, "image/png");
      const file = new File([blob], "filename.png", {type: "image/png"});
  
      await startUpload([file], {configId});

    } catch(e) {
      toast.error("Something went wrong, try again")
    }
  }

  function base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length)

    for(let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], {type: mimeType});
  }

  return (
    <FormProvider {...form}>
      {/* Changed: Removed mt-10 mb-20 pb-20, added min-h-screen and flex-grow */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 p-4 min-h-[calc(100vh-200px)]">
        {/* Changed: Removed fixed height, added min-h-[600px] and flex-grow */}
        <div
          ref={containerRef}
          className="relative w-full min-h-[600px] flex-grow overflow-hidden flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 sm:p-8 lg:p-12 text-center"
        >
          <div className="relative w-48 sm:w-60 lg:w-72 xl:w-80 pointer-events-none aspect-[896/1831]">
            <AspectRatio
              ref={phoneRef}
              ratio={896 / 1831}
              className="pointer-events-none relative z-50 w-full"
            >
              <Image
                fill
                src={"/phone-template.png"}
                alt="phone image"
                className="pointer-events-none z-50 select-none"
              />
            </AspectRatio>
            <div className="absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]" />
            <div
              className="absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]"
              style={{ backgroundColor: color?.hex || "#000000" }}
            />
          </div>
          <Rnd
            default={{
              x: 150,
              y: 205,
              width: imageDimensions.width / 4,
              height: imageDimensions.height / 4,
            }}
            onResizeStop={(_, __, ref, ___, { x, y }) => {
              setResizedDimension({
                height: parseInt(ref.style.height.slice(0, -2)),
                width: parseInt(ref.style.width.slice(0, -2)),
              });
              setResizedPosition({ x, y });
            }}
            onDragStop={(_, data) => {
              const { x, y } = data;
              setResizedPosition({ x, y });
            }}
            resizeHandleComponent={{
              bottomLeft: <ResizeHandle />,
              bottomRight: <ResizeHandle />,
              topRight: <ResizeHandle />,
              topLeft: <ResizeHandle />,
            }}
            className="absolute z-20"
          >
            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                fill
                alt="your image"
                className="pointer-events-none"
              />
            </div>
          </Rnd>
        </div>

        {/* Changed: Removed fixed height, added min-h-[600px] and flex flex-col */}
        <div className="w-full min-h-[600px] flex flex-col relative rounded-lg border border-zinc-200">
          <div className="px-4 sm:px-6 lg:px-6 py-6 flex flex-col gap-6 flex-grow overflow-y-auto">
            <h2 className="tracking-tight font-bold text-xl sm:text-2xl">
              Customize your case
            </h2>
            <div className="h-[1px] w-full bg-zinc-200" />
            <ConfigForm />
          </div>

          <div className="bg-white p-6 border-t border-zinc-200 mt-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Price:</span>
                <span className="text-lg font-bold text-gray-900">
                  ${totalPrice}
                </span>
              </div>
              <Button
                isPending={mutation.isPending}
                type="button"
                className="w-full group flex items-center justify-center gap-2 transition-all duration-300"
                size="lg"
                onClick={() => {
                  mutation.mutate({
                    caseId: configId,
                    colorId: form.getValues("color.id"),
                    materialId: form.getValues("material"),
                    modelId: form.getValues("model"),
                  });
                }}
              >
                Continue
                <ArrowRight className="h-5 w-5 transition-transform duration-300 transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
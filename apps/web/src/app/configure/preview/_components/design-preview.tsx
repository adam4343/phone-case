"use client";

import AuthModal from "@/components/auth-modal";
import Phone from "@/components/custom/phone";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { PhoneCase } from "@/lib/types/phone-case";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import Confetti from "react-dom-confetti";
import { toast } from "sonner";

interface Props {
  phoneCase: PhoneCase;
}

async function createOrderSession( { configId }: {configId: string}) {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/order/checkout`,
      {
        configId,
      },
      {
      withCredentials: true
      }
    );

    return res.data.url;
  } catch (e) {
    console.error("Failed to create checkout session:", e);
  }
}

export default function DesignConfigurator({ phoneCase }: Props) {
  const [showConfetti, setShowConfetti] = React.useState<boolean>(false);
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const router = useRouter();
  const session = authClient.useSession();

  React.useEffect(() => {
    setShowConfetti(true);
  }, []);

  const mutation = useMutation({
    mutationKey: ["get-checkout-session"],
    mutationFn: createOrderSession,
    onSuccess: (data) => {
    
      if (data) {
        router.push(data);
      } else {
        throw Error("Cant load stripe payment url")
      }
    },
    onError: (err) => {
      toast.error(err.message)
    }
  });

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center"
      >
        <Confetti
          active={showConfetti}
          config={{ elementCount: 200, spread: 90 }}
        />
      </div>

      <div className="mt-20 grid grid-cols-1 text-sm sm:grid-cols-12 sm:grid-rows-1 sm:gap-6 md:gap-x-8 lg:gap-x-12">
        <div className="sm:col-span-4 md:col-span-3 md:row-span-2 md:row-end-2">
          <Phone
            imgSrc={phoneCase.croppedImage}
            style={{ backgroundColor: phoneCase.color.hex }}
          />
        </div>

        <div className="mt-6 sm:col-span-9 sm:mt-0 md:row-end-1">
          <h3 className="text-3xl font-bold tracking-tight text-gray-900">
            Your {phoneCase.model.name} Case
          </h3>

          <div className="mt-3 flex items-center gap-1.5 text-base ">
            <Check className="h-4 w-4 text-green-500" />
            In stock ready to ship
          </div>
        </div>

        <div className="sm:col-span-12 md:col-span-9 text-base">
          <div className="grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 sm:gap-x-6 sm:py-6 md:py-10">
            <div>
              <p className="font-medium text-zinc-950">Highlights</p>

              <ol className="mt-3 text-zinc-700 list-disc list-inside">
                <li>Wireless charging compatible</li>
                <li>TPU shock absorption</li>
                <li>Packaging made from recycled materials</li>
                <li>5 year print warranty</li>
              </ol>
            </div>

            <div>
              <p className="font-medium text-zinc-950">Materials</p>

              <ol className="mt-3 text-zinc-700 list-disc list-inside">
                <li>High-quality, durable material</li>
                <li>Scratch- and fingerprint resistant coating</li>
              </ol>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-gray-50 p-6 sm:rounded-lg sm:p-8">
              <div className="flow-root text-sm">
                {phoneCase.model && (
                  <div className="flex items-center justify-between py-1 mt-2">
                    <p className="text-gray-600">{phoneCase.model.name}</p>
                    <p className="font-medium text-gray-900">
                      ${phoneCase.model.price}
                    </p>
                  </div>
                )}

                {phoneCase.material && (
                  <div className="flex items-center justify-between py-1 mt-2">
                    <p className="text-gray-600">{phoneCase.material.name}</p>
                    <p className="font-medium text-gray-900">
                      ${phoneCase.material.price}
                    </p>
                  </div>
                )}

                <div className="my-2 h-px bg-gray-200" />

                <div className="flex items-center justify-between py-2">
                  <p className="font-semibold text-gray-900">Order total</p>
                  <p className="font-semibold text-gray-900">
                    ${phoneCase.price}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end pb-12">
              <Button
                onClick={() => {
                  if(!session.data?.session) {
                    setOpenModal(true);
                    localStorage.setItem("configId", phoneCase.id);
                    return; 
                  }
                  localStorage.removeItem("configId");
                  mutation.mutate( { configId: phoneCase.id });
                }}
                isPending={mutation.isPending}
                className="px-4 w-full sm:w-auto  sm:px-6 lg:px-8 group"
              >
                Check out{" "}
                <ArrowRight className="h-4 transition-all duration-300 ease-in-out group-hover:translate-x-1.5 w-4 ml-1.5 inline" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal  open={openModal}
        onOpenChange={setOpenModal}/>
    </>
  );
}

"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePriceStore } from "@/lib/store/price-store";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

interface Model {
  id: string;
  name: string;
  price: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const ModelSelectSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-12" />
    <Skeleton className="h-10 w-full" />
  </div>
);

async function getModels() {
  const res = await axios.get("http://localhost:3001/api/models");
  return res.data.data as Model[];
}

export default function ModelSelect() {
  const { data, isPending, error } = useQuery({
    queryKey: ["models"],
    queryFn: getModels,
  });

  const { control, setValue, watch } = useFormContext();
  const selectedModel = watch("model");

  const {setModelPrice} = usePriceStore()

  React.useEffect(() => {
    if (!data || selectedModel) return;

    const lowestPriceModel = data.reduce((lowest, current) =>
      current.price < lowest.price ? current : lowest
    );

    setModelPrice(lowestPriceModel.price)

    setValue("model", lowestPriceModel.id);
  }, [data, selectedModel, setValue]);

  const [newModels, oldModels] = React.useMemo(() => {
    if (!data) return [[], []];
    const currentYear = new Date().getFullYear();
    const newModels = data.filter((model) => model.year >= currentYear - 3);
    const oldModels = data.filter((model) => model.year < currentYear - 3);
    return [newModels, oldModels];
  }, [data]);

  if (isPending) return <ModelSelectSkeleton />;

  if (error) {
    return (
      <div className="space-y-2">
        <label htmlFor="model" className="font-medium text-sm text-gray-700">
          Model
        </label>
        <div className="w-[360px] h-10 flex items-center justify-center border border-red-200 rounded-md bg-red-50">
          <span className="text-sm text-red-600">Failed to load models</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="model" className="font-medium text-sm text-gray-700">
        Model
      </label>

      <Controller
        control={control}
        name="model"
        render={({ field }) => (
          <Select value={field.value} onValueChange={(id) => {
            field.onChange(id);

            const selected = data.find((m) => m.id === id);
            if (selected) {
              setModelPrice(selected.price);
            }
          }}>
            <SelectTrigger id="model" className="w-full p-5">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent
              side="bottom"
              className="max-h-[400px] w-[360px] sm:w-full"
              avoidCollisions={false}
              position="popper"
              sideOffset={4}
            >
              <div className="p-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <SelectGroup className="space-y-1">
                    <SelectLabel className="px-2 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Old Models ({oldModels.length})
                    </SelectLabel>
                    {oldModels.length === 0 ? (
                      <div className="px-2 py-2 text-xs text-gray-400 italic">
                        No old models available
                      </div>
                    ) : (
                      oldModels.map((model) => (
                        <SelectItem
                          key={model.id}
                          value={model.id}
                          className="cursor-pointer"
                        >
                          <span className="font-medium">{model.name}</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>

                  <SelectGroup className="space-y-1">
                    <SelectLabel className="px-2 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      New Models ({newModels.length})
                    </SelectLabel>
                    {newModels.length === 0 ? (
                      <div className="px-2 py-2 text-xs text-gray-400 italic">
                        No new models available
                      </div>
                    ) : (
                      newModels.map((model) => (
                        <SelectItem
                          key={model.id}
                          value={model.id}
                          className="cursor-pointer"
                        >
                          <span className="font-medium">{model.name}</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </div>
              </div>
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}

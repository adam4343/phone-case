"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Controller, useFormContext } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";

interface Color {
  id: string;
  name: string;
  hex: string;
  createdAt: Date;
  updatedAt: Date;
}

async function getColors(): Promise<Color[]> {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/colors`);
  return res.data.data;
}

export default function ColorSelect() {
  const { control, setValue, getValues, watch } = useFormContext();

  const { data, isPending, error } = useQuery({
    queryKey: ["colors"],
    queryFn: getColors,
  });

  const selectedColor = watch("color");

  useEffect(() => {
    if (data && !getValues("color")) {
      const defaultColor = data.find((color) => color.hex === "#000000") || data[0];
      if (defaultColor) {
        setValue("color", defaultColor); 
      }
    }
  }, [data, getValues, setValue]);

  if (isPending) {
    return (
      <div>
        <div className="mb-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-6 gap-6">
          {Array.from({ length: 16 }).map((_, i) => (
            <Skeleton key={i} className="w-[34px] h-[34px] rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading colors</div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-medium mb-4 text-sm">
        Color: {selectedColor ? selectedColor.name : "None selected"}
      </h3>

      <div className="grid grid-cols-6 gap-6">
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <>
              {data?.map((color) => {
                const isSelected = field.value?.id === color.id;

                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => {
                      field.onChange(color)
                      
                    }} 
                    className={`w-[34px] h-[34px] rounded-full transition-all duration-200 ring-1 ring-gray-200 ${
                      isSelected
                        ? "ring-2 ring-zinc-300 ring-offset-2 shadow-lg"
                        : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                );
              })}
            </>
          )}
        />
      </div>
    </div>
  );
}

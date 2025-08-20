"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Controller, useFormContext } from "react-hook-form";
import { usePriceStore } from "@/lib/store/price-store";

interface Material {
  id: string;
  name: string;
  price: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSelectSkeleton = () => (
  <div className="pt-6 space-y-4">
    <Skeleton className="h-4 w-16" />
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="w-full">
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

async function getMaterial() {
  const res = await axios.get("http://localhost:3001/api/material");
  return res.data.data as Material[];
}

export default function MaterialSelect() {
  const { data, isPending, error } = useQuery({
    queryKey: ["materials"],
    queryFn: getMaterial,
  });

  const { setMaterialPrice } = usePriceStore();

  const { control, setValue } = useFormContext();

  const sortedData = React.useMemo(() => {
    if (!data) return [];
    
    return [...data].sort((a, b) => a.price - b.price);
  }, [data]);

  useEffect(() => {
    if (sortedData.length > 0) {
      setValue("material", sortedData[0].id);
      setMaterialPrice(sortedData[0].price);
    }
  }, [sortedData, setValue, setMaterialPrice]);

  if (isPending) return <MaterialSelectSkeleton />;

  if (error) {
    return (
      <div className="pt-6 space-y-4">
        <label className="font-medium text-sm text-gray-700 block">Material</label>
        <Card className="w-full border-red-200 bg-red-50">
          <CardContent className="p-3">
            <span className="text-sm text-red-600">Failed to load materials</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pt-6 space-y-4">
      <label className="font-medium text-sm text-gray-700 block">Material</label>

      <Controller
        name="material"
        control={control}
        render={({ field }) => (
          <div className="space-y-3">
            {sortedData.map((material) => (
              <Card
                key={material.id}
                className={`w-full cursor-pointer transition-all duration-200 hover:shadow-md ${
                  field.value === material.id
                    ? "border-primary border-2"
                    : "border-gray-200"
                }`}
                onClick={() => {
                  field.onChange(material.id);
                  setMaterialPrice(material.price);
                }}
              >
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {material.name}
                      </h3>
                      {material.description && (
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {material.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <span className="font-semibold text-gray-900 text-sm">
                        ${material.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      />

      {sortedData.length === 0 && (
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 text-sm italic">No materials available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

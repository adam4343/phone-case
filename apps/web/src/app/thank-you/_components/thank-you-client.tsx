'use client'
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function ThankYouClient({ caseId }: { caseId: string }) {
  const query = useQuery({
    queryKey: ["order"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/order/${caseId}`
      );

      console.log(res)

      return res.data;
    },
    
  });

//   if (query.isLoading) return <p>Loading order...</p>;
//   if (query.error) return <p>Failed to load order</p>;
//   if (!query.data.data) return <p>No order found</p>;
  console.log(query.data)
  return <></>;
}

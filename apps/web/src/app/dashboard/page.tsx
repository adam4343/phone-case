"use client"
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardClient from "./_components/dashboard-client";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();


  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
    }
  }, [session, isPending]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
   <DashboardClient />
  );
}

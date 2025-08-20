'use server'
import { authClient } from "@/lib/auth-client";

export default async function createCheckoutSession({configId}: {configId: string}) {
    const session = await authClient.getSession()

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/phone-case/${{configId}}`, {
            method: "GET",
            headers: {
               "Content-Type": "application/json", 
            }
           })

           if (!res.ok) {
            throw new Error("Failed to create phone case");
          }
        
          const { data } = await res.json();

          if(!session.data?.user) {
            throw new Error("You need to be logged in to continue")
          }

    } catch(e) {
        console.error("createCheckoutSession error:", e);

    }
  

}

 
import axios from "axios";
import { notFound } from "next/navigation";
import DesignConfigurator from "./components/design-configurator";
import type { PhoneCase } from "@/lib/types/phone-case";
interface SearchParams {
    [key: string]: string | string[] | undefined;
}
interface PageProps {
    searchParams: Promise<SearchParams>;
}

export async function getPhoneCase(id: string) {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/phone-case/${id}`);
      
      if (!res.data.data) {
        return notFound();
      }
      
      return res.data.data as PhoneCase;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return notFound(); 
        }
        
        console.error('API Error:', error.response?.status, error.message);
        throw error; 
      }
      
      console.error('Unexpected error:', error);
      throw error;
    }
}

export default async function Page({searchParams}: PageProps) {
    const params = await searchParams;

    const {id} = params

    if(!id || typeof id !== "string") {
        return notFound()
    }

    const phoneCase = await getPhoneCase(id);

  
    return <DesignConfigurator
      configId={phoneCase.id}
      imageDimensions={{ width: phoneCase.width, height: phoneCase.height }}
      imageUrl={phoneCase.image}
    />
    
}
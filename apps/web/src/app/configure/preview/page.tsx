import { getPhoneCase } from "../design/page";
import { notFound } from "next/navigation";
import DesignPreview from "./_components/design-preview";

interface SearchParams {
  [key: string]: string | string[] | undefined;
}
interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function PreviewPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const { id } = params;

  if (!id || typeof id !== "string") {
    return notFound();
  }

  const phoneCase = await getPhoneCase(id);


  return (
    <>
    <DesignPreview phoneCase={phoneCase} />
    </>
  );
}

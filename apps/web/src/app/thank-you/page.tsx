import ThankYouClient from "./_components/thank-you-client";

interface ThankYouPageProps {
  searchParams: Promise<{
    caseId?: string;
  }>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { caseId } = await searchParams;
  
  return <ThankYouClient caseId={caseId ?? ""} />;
}
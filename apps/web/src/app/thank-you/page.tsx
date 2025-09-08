
import ThankYouClient from "./_components/thank-you-client";

interface ThankYouPageProps {
  searchParams: {
    caseId?: string;
  };
}

export default function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { caseId } = searchParams;

  return <ThankYouClient caseId={caseId ?? ""} />;
}


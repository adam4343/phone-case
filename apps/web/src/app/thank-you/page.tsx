import ThankYouClient from "./_components/thank-you-client";

interface Props {
    searchParams: Promise<{
      session_id: string
    }>
}


export default  async function ThankYouPage({searchParams}: Props) {
  const sessionId = (await searchParams).session_id;
  return (
      <ThankYouClient sessionId={sessionId} />
  );
}

import DestinationResults from "@/components/destinations/destinationResults";

export default async function DestinationResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <DestinationResults slug={slug} />;
}

import AiRecommendationForm from "@/components/destinations/aiRecommendationForm";

export default async function AiRecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string | string[] }>;
}) {
  const { destination } = await searchParams;
  const slug = Array.isArray(destination) ? destination[0] : destination;

  if (!slug) {
    return (
      <section className="section-wrapper min-h-screen pt-32 lg:pt-40">
        <p className="text-body-regular text-body-dark">
          Choose a destination to get your AI recommendations.
        </p>
      </section>
    );
  }

  return <AiRecommendationForm slug={slug} />;
}

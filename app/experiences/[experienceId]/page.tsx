import ExperienceDetail from "@/components/experiences/experienceDetail";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;

  return <ExperienceDetail experienceId={experienceId} />;
}

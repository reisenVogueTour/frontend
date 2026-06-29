"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import DestinationExperienceModal from "@/components/home/destinationExperienceModal";
import SelectPropmt from "./experienceForm/selectPrompt";
import SkeletonLoader from "./experienceForm/skeletonLoader";
import Ticket from "./experienceForm/Ticket";
import type { Destination } from "@/lib/types/reisen";

export default function ExperienceForm() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destination, setDestination] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectPrompt, setSelectPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const data = await api.destinations.list();
        setDestinations(data.items);
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to load destinations.",
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadDestinations();
  }, []);

  const selected = destinations.find((d) => d.slug === destination);

  return (
    <div className="flex flex-col items-center gap-10 relative z-3">
      {isLoading ? (
        <SkeletonLoader />
      ) : fetchError !== null ? (
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-section-inner-title text-error">
            Could not load destinations
          </h2>
          <p className="text-body-medium text-body-dark">{fetchError}</p>
        </div>
      ) : destinations.length ? (
        <Ticket
          destination={destination}
          destinations={destinations}
          selected={selected}
          setDestination={setDestination}
          setDestinations={setDestinations}
          setModalOpen={setModalOpen}
          setSelectPrompt={setSelectPrompt}
        />
      ) : (
        <p className="text-body-medium text-body-dark">
          No destinations yet, check back later.
        </p>
      )}

      {modalOpen && selected && (
        <DestinationExperienceModal
          slug={selected.slug}
          destinationName={selected.name}
          onClose={() => setModalOpen(false)}
        />
      )}

      {selectPrompt && <SelectPropmt setSelectPrompt={setSelectPrompt} />}
    </div>
  );
}

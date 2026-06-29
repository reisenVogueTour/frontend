import React from "react";
import Image from "next/image";
import DestinationSelect from "./destinationSelect";
import type { Destination } from "@/lib/types/reisen";

export default function Ticket({
  selected,
  destinations,
  destination,
  setDestination,
  setModalOpen,
  setSelectPrompt,
}: {
  selected: Destination | undefined;
  destination: string;
  destinations: Destination[];
  setDestination: React.Dispatch<React.SetStateAction<string>>;
  setDestinations: React.Dispatch<React.SetStateAction<Destination[]>>;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectPrompt: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      <div className="relative min-w-50 max-w-75 lg:max-w-full aspect-408/192">
        <Image
          src="/ticket_bg.svg"
          alt=""
          fill
          sizes="408px"
          className="object-contain"
          priority
        />

        <div className="relative z-10 flex h-full flex-col justify-center gap-6 px-5 lg:px-10 py-8">
          <div className="flex justify-between">
            <h2 className="text-section-inner-title bg-[linear-gradient(to_bottom,#2d2d2d_35.761%,#666666_69.754%)] bg-clip-text text-transparent font-bold uppercase">
              Start
            </h2>
            <DestinationSelect
              destinations={destinations}
              value={destination}
              onChange={setDestination}
              selected={selected}
            />
          </div>

          <Image
            src="/flight_path_home.svg"
            alt=""
            width={339}
            height={11}
            className="w-full h-auto"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => (selected ? setModalOpen(true) : setSelectPrompt(true))}
        className="primary-cta cursor-pointer"
      >
        <span className="primary-cta-inner">Find your next adventure</span>
      </button>
    </>
  );
}

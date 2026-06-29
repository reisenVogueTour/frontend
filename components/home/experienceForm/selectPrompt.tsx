import React from "react";
import { X } from "lucide-react";

export default function SelectPropmt({
  setSelectPrompt,
}: {
  setSelectPrompt: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-base/50 p-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Select a destination"
      onClick={() => setSelectPrompt(false)}
    >
      <div
        className="modal-show-animation flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white-base p-5 outline-none"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && setSelectPrompt(false)}
        tabIndex={-1}
      >
        <div className="flex justify-end">
          <button
            onClick={() => setSelectPrompt(false)}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-dark-base transition-colors hover:bg-primary cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 pb-6">
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-primary-50 px-5 py-6 text-center border border-primary">
            <h3 className="text-section-inner-title text-dark-base">
              Where are you headed?
            </h3>
            <p className="text-body-regular text-body-dark">
              Pick a destination from the ticket to start finding experiences.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectPrompt(false)}
            className="rounded-[64px] px-8 py-3.5 text-button  transition-colors bg-primary-50 hover:bg-primary cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

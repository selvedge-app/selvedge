"use client";

import { type Stage, STAGE_ORDER, STAGE_LABELS } from "@/lib/stages";

export function StagePipeline({
  currentStage,
  onAdvance,
}: {
  currentStage: Stage;
  onAdvance?: (stage: Stage) => void;
}) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {STAGE_ORDER.filter((s) => s !== "ARCHIVED").map((stage, idx) => {
        const isActive = idx === currentIdx;
        const isCompleted = idx < currentIdx;
        const isClickable = onAdvance && idx === currentIdx + 1;

        return (
          <button
            key={stage}
            disabled={!isClickable}
            onClick={() => isClickable && onAdvance(stage)}
            className={`flex-1 min-w-[5rem] rounded-md px-2 py-1.5 text-xs font-medium text-center transition-colors ${
              isActive
                ? "bg-gray-900 text-white"
                : isCompleted
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-400"
            } ${isClickable ? "cursor-pointer hover:bg-blue-100 hover:text-blue-800 ring-1 ring-blue-300" : "cursor-default"}`}
            title={
              isClickable ? `Advance to ${STAGE_LABELS[stage]}` : STAGE_LABELS[stage]
            }
          >
            {STAGE_LABELS[stage]}
          </button>
        );
      })}
    </div>
  );
}

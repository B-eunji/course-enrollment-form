"use client";

import type { Step } from "@/hooks/useEnrollmentForm";

const STEPS = [
  { label: "강의 선택" },
  { label: "신청자 정보" },
  { label: "확인 및 제출" },
] as const;

interface StepIndicatorProps {
  currentStep: Step;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="폼 진행 단계">
      <ol className="flex w-full min-w-0 items-center">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;
          const isLast = index === STEPS.length - 1;

          return (
            <li
              key={step.label}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex min-w-0 items-center ${isLast ? "" : "flex-1"}`}
            >
              {/* 단계 원형 + 라벨 */}
              <div className="flex shrink-0 flex-col items-center gap-1 sm:gap-2">
                <div
                  className={[
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors sm:h-9 sm:w-9 sm:text-sm",
                    isCompleted && "bg-indigo-600 text-white",
                    isCurrent && "border-2 border-indigo-600 bg-white text-indigo-600",
                    isUpcoming && "border-2 border-gray-300 bg-white text-gray-400",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {isCompleted ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                <span
                  className={[
                    "max-w-[4.25rem] text-center text-[10px] font-medium leading-tight sm:max-w-none sm:text-xs",
                    isCompleted && "text-indigo-600",
                    isCurrent && "text-indigo-700",
                    isUpcoming && "text-gray-400",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {step.label}
                </span>
              </div>

              {/* 연결선 (마지막 단계 제외) */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className={[
                    "mx-1 mb-4 h-0.5 min-w-2 flex-1 sm:mx-2 sm:mb-5",
                    isCompleted ? "bg-indigo-600" : "bg-gray-300",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

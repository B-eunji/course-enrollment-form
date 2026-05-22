"use client";

import type { Step } from "@/hooks/useEnrollmentForm";

const LAST_STEP: Step = 2;

interface FormNavigationProps {
  currentStep: Step;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void | Promise<void>;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
}

export default function FormNavigation({
  currentStep,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting = false,
  isSubmitDisabled = false,
}: FormNavigationProps) {
  const isFirstStep = currentStep === 0;
  const isFinalStep = currentStep === LAST_STEP;

  return (
    <div className="pt-6">
      {isFinalStep && isSubmitDisabled && !isSubmitting && (
        <p className="mb-3 text-center text-xs text-zinc-400">
          약관에 동의해야 제출할 수 있습니다.
        </p>
      )}

      <div className="flex items-center justify-between">
      {/* 이전 버튼: 첫 단계에서는 렌더링하지 않음 */}
      {isFirstStep ? (
        <div aria-hidden="true" />
      ) : (
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          이전
        </button>
      )}

      {/* 다음 / 제출 버튼 */}
      {isFinalStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || isSubmitDisabled}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {isSubmitting ? "제출 중..." : "신청 제출"}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          다음
        </button>
      )}
      </div>
    </div>
  );
}

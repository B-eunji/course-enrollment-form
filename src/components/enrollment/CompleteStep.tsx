"use client";

import type { Course } from "@/types/course";
import type { EnrollmentFormState, EnrollmentResponse } from "@/types/enrollment";

interface CompleteStepProps {
  enrollmentResult: EnrollmentResponse;
  formData: EnrollmentFormState;
  selectedCourse?: Course;
  onReset: () => void;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 py-2 text-sm">
      <dt className="w-28 shrink-0 text-zinc-400">{label}</dt>
      <dd className="text-zinc-800">{value}</dd>
    </div>
  );
}

export default function CompleteStep({
  enrollmentResult,
  formData,
  selectedCourse,
  onReset,
}: CompleteStepProps) {
  const isConfirmed = enrollmentResult.status === "confirmed";

  return (
    <div className="space-y-6">
      {/* 상단 완료 배너 */}
      <div
        className={`rounded-xl px-6 py-5 text-center ${
          isConfirmed
            ? "bg-green-50 ring-1 ring-green-200"
            : "bg-blue-50 ring-1 ring-blue-200"
        }`}
      >
        <div
          className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
            isConfirmed ? "bg-green-100" : "bg-blue-100"
          }`}
        >
          {isConfirmed ? (
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
        <p
          className={`text-base font-semibold ${
            isConfirmed ? "text-green-800" : "text-blue-800"
          }`}
        >
          {isConfirmed
            ? "신청이 완료되었습니다."
            : "신청이 접수되었습니다."}
        </p>
        {!isConfirmed && (
          <p className="mt-1 text-sm text-blue-600">
            검토 후 최종 확인 안내를 드릴 예정입니다.
          </p>
        )}
      </div>

      {/* 신청 요약 카드 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">신청 요약</h2>
        <dl className="divide-y divide-zinc-100">
          <InfoRow label="신청 번호" value={enrollmentResult.enrollmentId} />
          <InfoRow
            label="상태"
            value={isConfirmed ? "신청 완료" : "접수 중"}
          />
          <InfoRow
            label="신청 일시"
            value={formatDateTime(enrollmentResult.enrolledAt)}
          />
          {selectedCourse !== undefined && (
            <InfoRow label="강의명" value={selectedCourse.title} />
          )}
          <InfoRow
            label="신청 유형"
            value={formData.type === "personal" ? "개인 신청" : "단체 신청"}
          />
          <InfoRow label="신청자" value={formData.applicant.name} />
          <InfoRow label="이메일" value={formData.applicant.email} />
        </dl>
      </div>

      {/* 처음으로 돌아가기 */}
      <div className="text-center">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          처음으로 돌아가기
        </button>
      </div>
    </div>
  );
}

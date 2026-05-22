"use client";

import type { ReactNode } from "react";
import type { Course, CourseCategory } from "@/types/course";
import type { EnrollmentFormState } from "@/types/enrollment";
import type { Step } from "@/hooks/useEnrollmentForm";

interface ConfirmStepProps {
  formData: EnrollmentFormState;
  selectedCourse?: Course;
  onEditStep: (step: Step) => void;
  onChangeAgreement: (agreed: boolean) => void;
  errors: Record<string, string>;
  onClearError: (key: string) => void;
}

const CATEGORY_LABELS: Record<CourseCategory, string> = {
  development: "개발",
  design: "디자인",
  marketing: "마케팅",
  business: "비즈니스",
};

function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR") + "원";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-800">{title}</h2>
        {onEdit !== undefined && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            수정
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <dt className="w-28 shrink-0 text-zinc-400">{label}</dt>
      <dd className="text-zinc-800">{value}</dd>
    </div>
  );
}

export default function ConfirmStep({
  formData,
  selectedCourse,
  onEditStep,
  onChangeAgreement,
  errors,
  onClearError,
}: ConfirmStepProps) {
  const { applicant, type } = formData;
  const isGroup = type === "group";
  const group = isGroup ? (formData.group ?? null) : null;

  return (
    <div className="space-y-4">
      {/* 선택한 강의 정보 */}
      <SectionCard title="선택 강의" onEdit={() => onEditStep(0)}>
        {selectedCourse !== undefined ? (
          <dl className="space-y-2">
            <InfoRow label="강의명" value={selectedCourse.title} />
            <InfoRow
              label="카테고리"
              value={CATEGORY_LABELS[selectedCourse.category]}
            />
            <InfoRow label="강사" value={selectedCourse.instructor} />
            <InfoRow
              label="일정"
              value={`${formatDate(selectedCourse.startDate)} ~ ${formatDate(selectedCourse.endDate)}`}
            />
            <InfoRow label="수강료" value={formatPrice(selectedCourse.price)} />
            <InfoRow
              label="신청 현황"
              value={`${selectedCourse.currentEnrollment} / ${selectedCourse.maxCapacity}명`}
            />
          </dl>
        ) : (
          <p className="text-sm text-zinc-400">
            선택된 강의 정보를 찾을 수 없습니다.
          </p>
        )}
      </SectionCard>

      {/* 신청 유형 */}
      <SectionCard title="신청 유형">
        <p className="text-sm text-zinc-800">
          {type === "personal" ? "개인 신청" : "단체 신청"}
        </p>
      </SectionCard>

      {/* 신청자 정보 */}
      <SectionCard title="신청자 정보" onEdit={() => onEditStep(1)}>
        <dl className="space-y-2">
          <InfoRow label="이름" value={applicant.name} />
          <InfoRow label="이메일" value={applicant.email} />
          <InfoRow label="전화번호" value={applicant.phone} />
          <InfoRow
            label="수강 동기"
            value={
              applicant.motivation !== undefined && applicant.motivation !== ""
                ? applicant.motivation
                : "입력하지 않음"
            }
          />
        </dl>
      </SectionCard>

      {/* 단체 정보 */}
      {isGroup && (
        <SectionCard title="단체 정보">
          {group !== null ? (
            <>
              <dl className="space-y-2">
                <InfoRow label="단체명" value={group.organizationName} />
                <InfoRow label="담당자 연락처" value={group.contactPerson} />
                <InfoRow label="신청 인원수" value={`${group.headCount}명`} />
              </dl>

              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-zinc-400">
                  참가자 명단
                </p>
                {group.participants.length > 0 ? (
                  <ul className="space-y-2">
                    {group.participants.map((participant, index) => (
                      <li
                        key={index}
                        className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3"
                      >
                        <p className="mb-1 text-xs font-medium text-zinc-400">
                          참가자 {index + 1}
                        </p>
                        <dl className="space-y-1">
                          <InfoRow label="이름" value={participant.name} />
                          <InfoRow label="이메일" value={participant.email} />
                        </dl>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-400">
                    참가자 정보가 없습니다.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-400">
              단체 신청 정보를 찾을 수 없습니다. 이전 단계에서 다시 입력해
              주세요.
            </p>
          )}
        </SectionCard>
      )}

      {/* 약관 동의 */}
      <div
        id="terms-agreement"
        className={`rounded-xl border bg-zinc-50 px-5 py-4 ${
          errors.agreedToTerms ? "border-red-400" : "border-zinc-200"
        }`}
      >
        <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => {
              onChangeAgreement(e.target.checked);
              onClearError("agreedToTerms");
            }}
            className="mt-0.5 h-4 w-4 accent-blue-600"
          />
          <span>수강 신청 및 개인정보 수집·이용 약관에 동의합니다.</span>
        </label>
        {errors.agreedToTerms !== undefined && (
          <p className="mt-2 text-xs text-red-500">{errors.agreedToTerms}</p>
        )}
      </div>
    </div>
  );
}

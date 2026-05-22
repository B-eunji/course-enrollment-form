"use client";

import type { ReactNode } from "react";
import type {
  ApplicantInfo,
  EnrollmentFormState,
  GroupInfo,
  Participant,
} from "@/types/enrollment";

interface ApplicantStepProps {
  formData: EnrollmentFormState;
  onUpdateApplicant: (fields: Partial<ApplicantInfo>) => void;
  onUpdateGroup: (
    fields: Partial<Omit<GroupInfo, "headCount" | "participants">>
  ) => void;
  onUpdateHeadCount: (headCount: number) => void;
  onUpdateParticipant: (index: number, fields: Partial<Participant>) => void;
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-sm font-medium text-zinc-700"
    >
      {children}
    </label>
  );
}

function TextInput({
  id,
  type = "text",
  value,
  placeholder,
  onChange,
}: {
  id: string;
  type?: "text" | "email" | "tel";
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );
}

export default function ApplicantStep({
  formData,
  onUpdateApplicant,
  onUpdateGroup,
  onUpdateHeadCount,
  onUpdateParticipant,
}: ApplicantStepProps) {
  const { applicant, type } = formData;
  const isGroup = type === "group";
  const group = isGroup ? (formData.group ?? null) : null;

  const headCountOptions = Array.from({ length: 9 }, (_, i) => i + 2);

  return (
    <div className="space-y-8">
      {/* 공통 신청자 정보 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-800">신청자 정보</h2>

        <div>
          <FieldLabel htmlFor="applicant-name">이름</FieldLabel>
          <TextInput
            id="applicant-name"
            value={applicant.name}
            placeholder="홍길동"
            onChange={(value) => onUpdateApplicant({ name: value })}
          />
        </div>

        <div>
          <FieldLabel htmlFor="applicant-email">이메일</FieldLabel>
          <TextInput
            id="applicant-email"
            type="email"
            value={applicant.email}
            placeholder="example@email.com"
            onChange={(value) => onUpdateApplicant({ email: value })}
          />
        </div>

        <div>
          <FieldLabel htmlFor="applicant-phone">전화번호</FieldLabel>
          <TextInput
            id="applicant-phone"
            type="tel"
            value={applicant.phone}
            placeholder="010-0000-0000"
            onChange={(value) => onUpdateApplicant({ phone: value })}
          />
        </div>

        <div>
          <FieldLabel htmlFor="applicant-motivation">수강 동기</FieldLabel>
          <textarea
            id="applicant-motivation"
            value={applicant.motivation ?? ""}
            placeholder="수강 동기를 입력해 주세요."
            rows={4}
            maxLength={300}
            onChange={(e) => onUpdateApplicant({ motivation: e.target.value })}
            className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-right text-xs text-zinc-400">
            {(applicant.motivation ?? "").length}/300
          </p>
        </div>
      </section>

      {/* 단체 신청 추가 정보 */}
      {isGroup && (
        <section className="space-y-6">
          {/* 단체 기본 정보 */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 space-y-4">
            <h2 className="text-base font-semibold text-zinc-800">
              단체 정보
            </h2>

            <div>
              <FieldLabel htmlFor="org-name">단체명</FieldLabel>
              <TextInput
                id="org-name"
                value={group?.organizationName ?? ""}
                placeholder="(주)회사명"
                onChange={(value) =>
                  onUpdateGroup({ organizationName: value })
                }
              />
            </div>

            <div>
              <FieldLabel htmlFor="contact-person">담당자 연락처</FieldLabel>
              <TextInput
                id="contact-person"
                type="tel"
                value={group?.contactPerson ?? ""}
                placeholder="010-0000-0000"
                onChange={(value) => onUpdateGroup({ contactPerson: value })}
              />
            </div>

            <div>
              <FieldLabel htmlFor="head-count">신청 인원수</FieldLabel>
              <select
                id="head-count"
                value={group?.headCount ?? 2}
                onChange={(e) => onUpdateHeadCount(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {headCountOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}명
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 참가자 명단 */}
          {group !== null && group.participants.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-800">
                참가자 명단
              </h2>
              <ul className="space-y-3">
                {group.participants.map((participant, index) => (
                  <li
                    key={index}
                    className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3"
                  >
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                      참가자 {index + 1}
                    </p>

                    <div>
                      <FieldLabel htmlFor={`participant-name-${index}`}>
                        이름
                      </FieldLabel>
                      <TextInput
                        id={`participant-name-${index}`}
                        value={participant.name}
                        placeholder="홍길동"
                        onChange={(value) =>
                          onUpdateParticipant(index, { name: value })
                        }
                      />
                    </div>

                    <div>
                      <FieldLabel htmlFor={`participant-email-${index}`}>
                        이메일
                      </FieldLabel>
                      <TextInput
                        id={`participant-email-${index}`}
                        type="email"
                        value={participant.email}
                        placeholder="example@email.com"
                        onChange={(value) =>
                          onUpdateParticipant(index, { email: value })
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import type { Course } from "@/types/course";
import type {
  ApplicantInfo,
  EnrollmentFormState,
  GroupInfo,
  Participant,
} from "@/types/enrollment";

interface ApplicantStepProps {
  formData: EnrollmentFormState;
  selectedCourse?: Course;
  onUpdateApplicant: (fields: Partial<ApplicantInfo>) => void;
  onUpdateGroup: (
    fields: Partial<Omit<GroupInfo, "headCount" | "participants">>
  ) => void;
  onUpdateHeadCount: (headCount: number) => void;
  onUpdateParticipant: (index: number, fields: Partial<Participant>) => void;
  errors: Record<string, string>;
  onClearError: (key: string) => void;
  onClearErrors: (keys: string[]) => void;
}

function FieldLabel({
  htmlFor,
  required = false,
  optional = false,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-sm font-medium text-zinc-700"
    >
      {children}
      {required && (
        <span className="ml-0.5 text-red-500" aria-hidden="true">
          *
        </span>
      )}
      {optional && (
        <span className="ml-1 text-xs font-normal text-zinc-400">(선택)</span>
      )}
    </label>
  );
}

function TextInput({
  id,
  type = "text",
  value,
  placeholder,
  hasError = false,
  onChange,
}: {
  id: string;
  type?: "text" | "email" | "tel";
  value: string;
  placeholder?: string;
  hasError?: boolean;
  onChange: (value: string) => void;
}) {
  const borderCls = hasError
    ? "border-red-400 focus:border-red-400 focus:ring-red-400"
    : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500";
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 ${borderCls}`}
    />
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

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

export default function ApplicantStep({
  formData,
  selectedCourse,
  onUpdateApplicant,
  onUpdateGroup,
  onUpdateHeadCount,
  onUpdateParticipant,
  errors,
  onClearError,
  onClearErrors,
}: ApplicantStepProps) {
  const { applicant, type } = formData;
  const isGroup = type === "group";
  const group = isGroup ? (formData.group ?? null) : null;

  const headCountOptions = Array.from({ length: 9 }, (_, i) => i + 2);

  return (
    <div className="min-w-0 space-y-8">
      {selectedCourse !== undefined && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium text-blue-600">신청 중인 강의</p>
          <p className="mt-1 text-sm font-semibold text-zinc-800">
            {selectedCourse.title}
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            {formatDate(selectedCourse.startDate)} ~{" "}
            {formatDate(selectedCourse.endDate)} ·{" "}
            {formatPrice(selectedCourse.price)}
          </p>
        </div>
      )}

      {/* 공통 신청자 정보 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-800">신청자 정보</h2>

        <div>
          <FieldLabel htmlFor="applicant-name" required>
            이름
          </FieldLabel>
          <TextInput
            id="applicant-name"
            value={applicant.name}
            placeholder="홍길동"
            hasError={!!errors["applicant.name"]}
            onChange={(value) => {
              onUpdateApplicant({ name: value });
              onClearError("applicant.name");
            }}
          />
          <FieldError message={errors["applicant.name"]} />
        </div>

        <div>
          <FieldLabel htmlFor="applicant-email" required>
            이메일
          </FieldLabel>
          <TextInput
            id="applicant-email"
            type="email"
            value={applicant.email}
            placeholder="example@email.com"
            hasError={!!errors["applicant.email"]}
            onChange={(value) => {
              onUpdateApplicant({ email: value });
              onClearError("applicant.email");
            }}
          />
          <FieldError message={errors["applicant.email"]} />
        </div>

        <div>
          <FieldLabel htmlFor="applicant-phone" required>
            전화번호
          </FieldLabel>
          <TextInput
            id="applicant-phone"
            type="tel"
            value={applicant.phone}
            placeholder="010-0000-0000"
            hasError={!!errors["applicant.phone"]}
            onChange={(value) => {
              onUpdateApplicant({ phone: value });
              onClearError("applicant.phone");
            }}
          />
          <FieldError message={errors["applicant.phone"]} />
        </div>

        <div>
          <FieldLabel htmlFor="applicant-motivation" optional>
            수강 동기
          </FieldLabel>
          <textarea
            id="applicant-motivation"
            value={applicant.motivation ?? ""}
            placeholder="수강 동기를 입력해 주세요."
            rows={4}
            maxLength={300}
            onChange={(e) => {
              onUpdateApplicant({ motivation: e.target.value });
              onClearError("applicant.motivation");
            }}
            className={`w-full resize-none rounded-lg border px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 ${
              errors["applicant.motivation"]
                ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          <p className="mt-1 text-right text-xs text-zinc-400">
            {(applicant.motivation ?? "").length}/300
          </p>
          <FieldError message={errors["applicant.motivation"]} />
        </div>
      </section>

      {/* 단체 신청 추가 정보 */}
      {isGroup && (
        <section id="group-section" className="space-y-6">
          <FieldError message={errors.group} />
          {/* 단체 기본 정보 */}
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
            <h2 className="text-base font-semibold text-zinc-800">
              단체 정보
            </h2>

            <div>
              <FieldLabel htmlFor="org-name" required>
                단체명
              </FieldLabel>
              <TextInput
                id="org-name"
                value={group?.organizationName ?? ""}
                placeholder="(주)회사명"
                hasError={!!errors["group.organizationName"]}
                onChange={(value) => {
                  onUpdateGroup({ organizationName: value });
                  onClearError("group.organizationName");
                }}
              />
              <FieldError message={errors["group.organizationName"]} />
            </div>

            <div>
              <FieldLabel htmlFor="contact-person" required>
                담당자 연락처
              </FieldLabel>
              <TextInput
                id="contact-person"
                type="tel"
                value={group?.contactPerson ?? ""}
                placeholder="010-0000-0000"
                hasError={!!errors["group.contactPerson"]}
                onChange={(value) => {
                  onUpdateGroup({ contactPerson: value });
                  onClearError("group.contactPerson");
                }}
              />
              <FieldError message={errors["group.contactPerson"]} />
            </div>

            <div>
              <FieldLabel htmlFor="head-count" required>
                신청 인원수
              </FieldLabel>
              <select
                id="head-count"
                value={group?.headCount ?? 2}
                onChange={(e) => {
                  onUpdateHeadCount(Number(e.target.value));
                  onClearError("group.headCount");
                  onClearError("group.participants");
                }}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-1 ${
                  errors["group.headCount"]
                    ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                    : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              >
                {headCountOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}명
                  </option>
                ))}
              </select>
              <FieldError message={errors["group.headCount"]} />
            </div>
          </div>

          {/* 참가자 명단 */}
          {group !== null && group.participants.length > 0 && (
            <div id="group-participants" className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-800">
                참가자 명단
              </h2>
              <FieldError message={errors["group.participants"]} />
              <ul className="space-y-3">
                {group.participants.map((participant, index) => (
                  <li
                    key={index}
                    className="space-y-3 rounded-xl border border-zinc-200 bg-white p-3 sm:p-4"
                  >
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                      참가자 {index + 1}
                    </p>

                    <div>
                      <FieldLabel htmlFor={`participant-name-${index}`} required>
                        이름
                      </FieldLabel>
                      <TextInput
                        id={`participant-name-${index}`}
                        value={participant.name}
                        placeholder="홍길동"
                        hasError={!!errors[`group.participants.${index}.name`]}
                        onChange={(value) => {
                          onUpdateParticipant(index, { name: value });
                          onClearError(`group.participants.${index}.name`);
                        }}
                      />
                      <FieldError message={errors[`group.participants.${index}.name`]} />
                    </div>

                    <div>
                      <FieldLabel htmlFor={`participant-email-${index}`} required>
                        이메일
                      </FieldLabel>
                      <TextInput
                        id={`participant-email-${index}`}
                        type="email"
                        value={participant.email}
                        placeholder="example@email.com"
                        hasError={!!errors[`group.participants.${index}.email`]}
                        onChange={(value) => {
                          onUpdateParticipant(index, { email: value });
                          onClearErrors(
                            group.participants.map(
                              (_, participantIndex) =>
                                `group.participants.${participantIndex}.email`,
                            ),
                          );
                        }}
                      />
                      <FieldError message={errors[`group.participants.${index}.email`]} />
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

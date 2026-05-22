"use client";

import { useState } from "react";
import type {
  EnrollmentFormState,
  EnrollmentType,
  ApplicantInfo,
  GroupInfo,
  Participant,
} from "@/types/enrollment";
import {
  validateCourseStep,
  validateApplicantStep,
  validateConfirmStep,
} from "@/utils/validation";

export type Step = 0 | 1 | 2;

const MIN_HEAD_COUNT = 2;
const MAX_HEAD_COUNT = 10;

function createEmptyParticipant(): Participant {
  return { name: "", email: "" };
}

function createEmptyParticipants(count: number): Participant[] {
  return Array.from({ length: count }, () => createEmptyParticipant());
}

function createDefaultGroup(): GroupInfo {
  return {
    organizationName: "",
    contactPerson: "",
    headCount: MIN_HEAD_COUNT,
    participants: createEmptyParticipants(MIN_HEAD_COUNT),
  };
}

function createInitialFormData(): EnrollmentFormState {
  return {
    courseId: "",
    type: "personal",
    applicant: {
      name: "",
      email: "",
      phone: "",
      motivation: "",
    },
    agreedToTerms: false,
  };
}

export function useEnrollmentForm() {
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [formData, setFormData] = useState<EnrollmentFormState>(createInitialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── step validation ────────────────────────────────────────

  function validateCurrentStep(): Record<string, string> {
    switch (currentStep) {
      case 0:
        return validateCourseStep(formData);
      case 1:
        return validateApplicantStep(formData);
      case 2:
        return validateConfirmStep(formData);
    }
  }

  // ── 에러 제거 ──────────────────────────────────────────────

  function clearFieldError(key: string) {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  // ── 스텝 이동 ──────────────────────────────────────────────

  function goToNextStep() {
    const stepErrors = validateCurrentStep();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((prev) => (prev < 2 ? ((prev + 1) as Step) : prev));
  }

  function goToPreviousStep() {
    setCurrentStep((prev) => (prev > 0 ? ((prev - 1) as Step) : prev));
  }

  function goToStep(step: Step) {
    setCurrentStep(step);
  }

  // ── 강의 선택 ──────────────────────────────────────────────

  function updateCourseId(courseId: string) {
    setFormData((prev) => ({ ...prev, courseId }));
  }

  // ── 신청 유형 전환 ─────────────────────────────────────────

  function updateEnrollmentType(type: EnrollmentType) {
    setFormData((prev) => {
      if (prev.type === type) return prev;
      if (type === "group") {
        return { ...prev, type, group: createDefaultGroup() };
      }
      // personal 전환 시 group 데이터 제거
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { group: _removed, ...rest } = prev;
      return { ...rest, type };
    });
  }

  // ── 신청자 정보 ────────────────────────────────────────────

  function updateApplicant(fields: Partial<ApplicantInfo>) {
    setFormData((prev) => ({
      ...prev,
      applicant: { ...prev.applicant, ...fields },
    }));
  }

  // ── 단체 정보 (headCount 제외) ─────────────────────────────

  function updateGroup(fields: Partial<Omit<GroupInfo, "headCount" | "participants">>) {
    setFormData((prev) => {
      if (!prev.group) return prev;
      return { ...prev, group: { ...prev.group, ...fields } };
    });
  }

  // ── 참가자 개별 수정 ───────────────────────────────────────

  function updateParticipant(index: number, fields: Partial<Participant>) {
    setFormData((prev) => {
      if (!prev.group) return prev;
      if (index < 0 || index >= prev.group.participants.length) return prev;
      const participants = prev.group.participants.map((p, i) =>
        i === index ? { ...p, ...fields } : p
      );
      return { ...prev, group: { ...prev.group, participants } };
    });
  }

  // ── headCount 변경 (participants 길이 동기화) ──────────────

  function updateHeadCount(headCount: number) {
    const clamped = Math.min(MAX_HEAD_COUNT, Math.max(MIN_HEAD_COUNT, headCount));
    setFormData((prev) => {
      if (!prev.group) return prev;
      const current = prev.group.participants;
      let participants: Participant[];
      if (clamped > current.length) {
        participants = [
          ...current,
          ...createEmptyParticipants(clamped - current.length),
        ];
      } else {
        participants = current.slice(0, clamped);
      }
      return { ...prev, group: { ...prev.group, headCount: clamped, participants } };
    });
  }

  // ── 약관 동의 ──────────────────────────────────────────────

  function updateAgreement(agreedToTerms: boolean) {
    setFormData((prev) => ({ ...prev, agreedToTerms }));
  }

  // ── 폼 전체 초기화 ─────────────────────────────────────────

  function resetForm() {
    setCurrentStep(0);
    setFormData(createInitialFormData());
    setErrors({});
  }

  return {
    currentStep,
    formData,
    errors,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    clearFieldError,
    updateCourseId,
    updateEnrollmentType,
    updateApplicant,
    updateGroup,
    updateParticipant,
    updateHeadCount,
    updateAgreement,
    resetForm,
  };
}

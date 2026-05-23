"use client";

import { useEffect, useState } from "react";
import type { Course, CourseListResponse } from "@/types/course";
import type {
  EnrollmentFormState,
  EnrollmentRequest,
  EnrollmentResponse,
  ErrorCode,
  ErrorResponse,
} from "@/types/enrollment";
import { useEnrollmentForm } from "@/hooks/useEnrollmentForm";
import type { Step } from "@/hooks/useEnrollmentForm";
import StepIndicator from "@/components/enrollment/StepIndicator";
import CourseStep from "@/components/enrollment/CourseStep";
import ApplicantStep from "@/components/enrollment/ApplicantStep";
import ConfirmStep from "@/components/enrollment/ConfirmStep";
import CompleteStep from "@/components/enrollment/CompleteStep";
import FormNavigation from "@/components/enrollment/FormNavigation";
import {
  validateApplicantStep,
  validateConfirmStep,
  validateCourseStep,
} from "@/utils/validation";

// validation error key → DOM id 매핑
// 동적 참가자 key (group.participants.N.name/email)는 resolveErrorId에서 별도 처리
const ERROR_KEY_TO_ID: Record<string, string> = {
  courseId: "course-selection-error",
  "applicant.name": "applicant-name",
  "applicant.email": "applicant-email",
  "applicant.phone": "applicant-phone",
  "applicant.motivation": "applicant-motivation",
  group: "group-section",
  "group.organizationName": "org-name",
  "group.contactPerson": "contact-person",
  "group.headCount": "head-count",
  "group.participants": "group-participants",
  agreedToTerms: "terms-agreement",
};

function resolveErrorId(key: string): string | null {
  const staticId = ERROR_KEY_TO_ID[key];
  if (staticId !== undefined) return staticId;

  // group.participants.N.name 또는 group.participants.N.email
  const match = /^group\.participants\.(\d+)\.(name|email)$/.exec(key);
  if (match !== null) {
    return `participant-${match[2]}-${match[1]}`;
  }

  return null;
}

function getStepErrors(
  step: Step,
  data: EnrollmentFormState
): Record<string, string> {
  switch (step) {
    case 0:
      return validateCourseStep(data);
    case 1:
      return validateApplicantStep(data);
    case 2:
      return validateConfirmStep(data);
  }
}

function scrollToFirstError(errorRecord: Record<string, string>): void {
  const keys = Object.keys(errorRecord);
  if (keys.length === 0) return;

  const firstId = resolveErrorId(keys[0]);
  if (firstId === null) return;

  requestAnimationFrame(() => {
    document
      .getElementById(firstId)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function createEnrollmentRequest(
  formData: EnrollmentFormState
): EnrollmentRequest | null {
  if (formData.type === "personal") {
    return {
      type: "personal",
      courseId: formData.courseId,
      applicant: formData.applicant,
      agreedToTerms: formData.agreedToTerms,
    };
  }

  // group 신청인데 group 데이터가 없으면 null 반환
  if (formData.group === undefined) {
    return null;
  }

  return {
    type: "group",
    courseId: formData.courseId,
    applicant: formData.applicant,
    group: formData.group,
    agreedToTerms: formData.agreedToTerms,
  };
}

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  COURSE_FULL:
    "선택한 강의의 정원이 마감되었습니다. 다른 강의를 선택해 주세요.",
  DUPLICATE_ENROLLMENT:
    "이미 신청된 강의입니다. 입력 정보를 확인해 주세요.",
  INVALID_INPUT: "입력값을 다시 확인해 주세요.",
};

const FALLBACK_ERROR_MESSAGE =
  "신청 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";

async function parseErrorResponse(res: Response): Promise<ErrorResponse | null> {
  try {
    return (await res.json()) as ErrorResponse;
  } catch {
    return null;
  }
}

function resolveErrorMessage(errorResponse: ErrorResponse): string {
  return ERROR_MESSAGES[errorResponse.code] ?? FALLBACK_ERROR_MESSAGE;
}

export default function Home() {
  const {
    currentStep,
    formData,
    errors,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    clearFieldError,
    clearFieldErrors,
    updateCourseId,
    updateEnrollmentType,
    updateApplicant,
    updateGroup,
    updateHeadCount,
    updateParticipant,
    updateAgreement,
    resetForm,
  } = useEnrollmentForm();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [enrollmentResult, setEnrollmentResult] =
    useState<EnrollmentResponse | null>(null);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<CourseListResponse>;
      })
      .then((data) => setCourses(data.courses))
      .catch(() => {
        // ConfirmStep 요약용 courses 로드 실패는 조용히 처리
      });
  }, []);

  const selectedCourse = courses.find(
    (course) => course.id === formData.courseId
  );

  // ── 스텝 이동 핸들러 (submitError 초기화 포함) ─────────────

  function handlePrevious() {
    setSubmitError(null);
    goToPreviousStep();
  }

  function handleNext() {
    setSubmitError(null);
    const success = goToNextStep();
    if (!success) {
      scrollToFirstError(getStepErrors(currentStep, formData));
    }
  }

  function handleEditStep(step: Step) {
    setSubmitError(null);
    goToStep(step);
  }

  // ── 제출 핸들러 ────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitError(null);

    const requestData = createEnrollmentRequest(formData);
    if (requestData === null) {
      setSubmitError(
        "단체 신청 정보가 누락되었습니다. 이전 단계에서 다시 입력해 주세요."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (res.ok) {
        const result = (await res.json()) as EnrollmentResponse;
        setEnrollmentResult(result);
      } else {
        const errorBody = await parseErrorResponse(res);
        setSubmitError(
          errorBody !== null
            ? resolveErrorMessage(errorBody)
            : FALLBACK_ERROR_MESSAGE
        );
      }
    } catch {
      setSubmitError(FALLBACK_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── 처음으로 돌아가기 ──────────────────────────────────────

  function handleReset() {
    resetForm();
    setEnrollmentResult(null);
    setSubmitError(null);
    setIsSubmitting(false);
  }

  // ── 성공 화면 ──────────────────────────────────────────────

  if (enrollmentResult !== null) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-zinc-50 px-4 py-8 sm:py-12">
        <div className="mx-auto w-full min-w-0 max-w-2xl">
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">수강 신청 완료</h1>
            <p className="mt-2 text-sm text-zinc-500">
              신청 정보가 정상적으로 접수되었습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
            <CompleteStep
              enrollmentResult={enrollmentResult}
              formData={formData}
              selectedCourse={selectedCourse}
              onReset={handleReset}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-50 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full min-w-0 max-w-2xl">
        {/* 페이지 헤더 */}
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">다단계 수강 신청</h1>
          <p className="mt-2 text-sm text-zinc-500">
            강의를 선택하고 신청 정보를 입력한 뒤 최종 확인해 주세요.
          </p>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="mb-6 sm:mb-8">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* 폼 카드 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
          {currentStep === 0 && (
            <CourseStep
              selectedCourseId={formData.courseId}
              enrollmentType={formData.type}
              onSelectCourse={updateCourseId}
              onChangeEnrollmentType={updateEnrollmentType}
              errors={errors}
              onClearError={clearFieldError}
            />
          )}

          {currentStep === 1 && (
            <ApplicantStep
              formData={formData}
              onUpdateApplicant={updateApplicant}
              onUpdateGroup={updateGroup}
              onUpdateHeadCount={updateHeadCount}
              onUpdateParticipant={updateParticipant}
              errors={errors}
              onClearError={clearFieldError}
              onClearErrors={clearFieldErrors}
            />
          )}

          {currentStep === 2 && (
            <ConfirmStep
              formData={formData}
              selectedCourse={selectedCourse}
              onEditStep={handleEditStep}
              onChangeAgreement={updateAgreement}
              errors={errors}
              onClearError={clearFieldError}
            />
          )}

          {/* 제출 에러 메시지 */}
          {submitError !== null && currentStep === 2 && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {submitError}
            </div>
          )}

          {/* 네비게이션 */}
          <FormNavigation
            currentStep={currentStep}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isSubmitDisabled={!formData.agreedToTerms}
          />
        </div>
      </div>
    </main>
  );
}

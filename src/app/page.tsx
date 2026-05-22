"use client";

import { useEffect, useState } from "react";
import type { Course, CourseListResponse } from "@/types/course";
import { useEnrollmentForm } from "@/hooks/useEnrollmentForm";
import StepIndicator from "@/components/enrollment/StepIndicator";
import CourseStep from "@/components/enrollment/CourseStep";
import ApplicantStep from "@/components/enrollment/ApplicantStep";
import ConfirmStep from "@/components/enrollment/ConfirmStep";
import FormNavigation from "@/components/enrollment/FormNavigation";

export default function Home() {
  const {
    currentStep,
    formData,
    errors,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateCourseId,
    updateEnrollmentType,
    updateApplicant,
    updateGroup,
    updateHeadCount,
    updateParticipant,
    updateAgreement,
  } = useEnrollmentForm();

  const [courses, setCourses] = useState<Course[]>([]);

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

  function handleSubmit() {
    console.log("submit", formData);
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* 페이지 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">다단계 수강 신청</h1>
          <p className="mt-2 text-sm text-zinc-500">
            강의를 선택하고 신청 정보를 입력한 뒤 최종 확인해 주세요.
          </p>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="mb-8">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* 폼 카드 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          {currentStep === 0 && (
            <CourseStep
              selectedCourseId={formData.courseId}
              enrollmentType={formData.type}
              onSelectCourse={updateCourseId}
              onChangeEnrollmentType={updateEnrollmentType}
              errors={errors}
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
            />
          )}

          {currentStep === 2 && (
            <ConfirmStep
              formData={formData}
              selectedCourse={selectedCourse}
              onEditStep={goToStep}
              onChangeAgreement={updateAgreement}
              errors={errors}
            />
          )}

          {/* 네비게이션 */}
          <FormNavigation
            currentStep={currentStep}
            onPrevious={goToPreviousStep}
            onNext={goToNextStep}
            onSubmit={handleSubmit}
            isSubmitting={false}
            isSubmitDisabled={!formData.agreedToTerms}
          />
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { Course, CourseCategory } from "@/types/course";
import { COURSE_CATEGORIES } from "@/types/course";
import type { EnrollmentType } from "@/types/enrollment";
import type { CourseListResponse } from "@/types/course";

type CategoryFilter = CourseCategory | "all";

interface CourseStepProps {
  selectedCourseId: string;
  enrollmentType: EnrollmentType;
  onSelectCourse: (courseId: string) => void;
  onChangeEnrollmentType: (type: EnrollmentType) => void;
  errors: Record<string, string>;
}

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "전체",
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

export default function CourseStep({
  selectedCourseId,
  enrollmentType,
  onSelectCourse,
  onChangeEnrollmentType,
  errors,
}: CourseStepProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  useEffect(() => {
    setIsLoading(true);
    setErrorMessage(null);

    const url =
      activeCategory === "all"
        ? "/api/courses"
        : `/api/courses?category=${activeCategory}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json() as Promise<CourseListResponse>;
      })
      .then((data) => setCourses(data.courses))
      .catch(() => {
        setErrorMessage(
          "강의 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
        );
      })
      .finally(() => setIsLoading(false));
  }, [activeCategory]);

  function handleSelectCourse(course: Course) {
    if (course.currentEnrollment >= course.maxCapacity) return;
    onSelectCourse(course.id);
  }

  const allFilters: CategoryFilter[] = ["all", ...COURSE_CATEGORIES];

  return (
    <div className="space-y-6">
      {/* 신청 유형 선택 */}
      <div>
        <p className="mb-2 text-sm font-medium text-zinc-700">신청 유형</p>
        <div className="flex gap-4">
          {(["personal", "group"] as const).map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
            >
              <input
                type="radio"
                name="enrollmentType"
                value={type}
                checked={enrollmentType === type}
                onChange={() => onChangeEnrollmentType(type)}
                className="accent-blue-600"
              />
              {type === "personal" ? "개인 신청" : "단체 신청"}
            </label>
          ))}
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2">
        {allFilters.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* 강의 선택 에러 */}
      {errors.courseId !== undefined && (
        <p id="course-selection-error" className="text-xs text-red-500">
          {errors.courseId}
        </p>
      )}

      {/* 강의 목록 */}
      {isLoading ? (
        <p className="py-10 text-center text-sm text-zinc-500">
          강의 목록을 불러오는 중...
        </p>
      ) : errorMessage !== null ? (
        <p className="py-10 text-center text-sm text-red-500">{errorMessage}</p>
      ) : courses.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">
          해당 카테고리에 강의가 없습니다.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const isFull = course.currentEnrollment >= course.maxCapacity;
            const isSelected = selectedCourseId === course.id;

            return (
              <li
                key={course.id}
                className={`relative flex flex-col rounded-xl border-2 p-5 transition-all ${
                  isFull
                    ? "border-zinc-200 bg-zinc-50 opacity-60"
                    : isSelected
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
                }`}
              >
                {/* 마감 배지 */}
                {isFull && (
                  <span className="absolute right-4 top-4 rounded-md bg-zinc-400 px-2 py-0.5 text-xs font-semibold text-white">
                    마감
                  </span>
                )}

                {/* 카테고리 */}
                <span className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-500">
                  {CATEGORY_LABELS[course.category]}
                </span>

                {/* 제목 */}
                <h3 className="mb-1 text-base font-semibold text-zinc-800">
                  {course.title}
                </h3>

                {/* 설명 */}
                <p className="mb-3 line-clamp-2 text-sm text-zinc-500">
                  {course.description}
                </p>

                {/* 메타 정보 */}
                <dl className="mb-4 space-y-1 text-sm text-zinc-600">
                  <div className="flex gap-1">
                    <dt className="font-medium text-zinc-400">강사</dt>
                    <dd>{course.instructor}</dd>
                  </div>
                  <div className="flex gap-1">
                    <dt className="font-medium text-zinc-400">일정</dt>
                    <dd>
                      {formatDate(course.startDate)} ~{" "}
                      {formatDate(course.endDate)}
                    </dd>
                  </div>
                  <div className="flex gap-1">
                    <dt className="font-medium text-zinc-400">수강료</dt>
                    <dd className="font-semibold text-zinc-800">
                      {formatPrice(course.price)}
                    </dd>
                  </div>
                  <div className="flex gap-1">
                    <dt className="font-medium text-zinc-400">정원</dt>
                    <dd>
                      {course.currentEnrollment} / {course.maxCapacity}명
                    </dd>
                  </div>
                </dl>

                {/* 선택 버튼 */}
                <button
                  type="button"
                  disabled={isFull}
                  onClick={() => handleSelectCourse(course)}
                  className={`mt-auto w-full rounded-lg py-2 text-sm font-medium transition-colors ${
                    isFull
                      ? "cursor-not-allowed bg-zinc-200 text-zinc-400"
                      : isSelected
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {isFull ? "마감된 강의" : isSelected ? "선택됨" : "선택하기"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

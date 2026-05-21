import type { NextRequest } from "next/server";
import { MOCK_COURSES } from "@/constants/courses";
import { COURSE_CATEGORIES, type CourseCategory,type CourseListResponse } from "@/types/course";

function isCourseCategory(value: string):  value is CourseCategory  {
  return (COURSE_CATEGORIES as readonly string[]).includes(value);
}

export function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");

  if (category !== null) {
    if (!isCourseCategory(category)) {
      return Response.json(
        { code: "INVALID_INPUT", message: "유효하지 않은 카테고리입니다." },
        { status: 400 }
      );
    }

    const filtered = MOCK_COURSES.filter((c) => c.category === category);
    const body: CourseListResponse = { courses: filtered, total: filtered.length };
    return Response.json(body);
  }

  const body: CourseListResponse = {
    courses: MOCK_COURSES,
    total: MOCK_COURSES.length,
  };
  return Response.json(body);
}

import type { NextRequest } from "next/server";
import { MOCK_COURSES } from "@/constants/courses";
import type {
  EnrollmentRequest,
  EnrollmentResponse,
  ErrorResponse,
} from "@/types/enrollment";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}

function isEnrollmentRequest(value: unknown): value is EnrollmentRequest {
  if (typeof value !== "object" || value === null) return false;

  const v = value as Record<string, unknown>;

  if (!isNonEmptyString(v.courseId)) return false;
  if (v.type !== "personal" && v.type !== "group") return false;

  if (typeof v.applicant !== "object" || v.applicant === null) return false;
  const applicant = v.applicant as Record<string, unknown>;
  if (!isNonEmptyString(applicant.name)) return false;
  if (!isNonEmptyString(applicant.email)) return false;
  if (!isNonEmptyString(applicant.phone)) return false;

  if (v.agreedToTerms !== true) return false;

  if (v.type === "group") {
    if (typeof v.group !== "object" || v.group === null) return false;
    const group = v.group as Record<string, unknown>;

    if (!isNonEmptyString(group.organizationName)) return false;
    if (!isNonEmptyString(group.contactPerson)) return false;

    if (
      typeof group.headCount !== "number" ||
      group.headCount < 2 ||
      group.headCount > 10
    ) {
      return false;
    }

    if (!Array.isArray(group.participants)) return false;
    if (group.participants.length !== group.headCount) return false;

    for (const p of group.participants) {
      if (typeof p !== "object" || p === null) return false;
      const participant = p as Record<string, unknown>;
      if (!isNonEmptyString(participant.name)) return false;
      if (!isNonEmptyString(participant.email)) return false;
    }
  }

  return true;
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    const error: ErrorResponse = {
      code: "INVALID_INPUT",
      message: "요청 본문을 파싱할 수 없습니다.",
    };
    return Response.json(error, { status: 400 });
  }

  if (!isEnrollmentRequest(body)) {
    const error: ErrorResponse = {
      code: "INVALID_INPUT",
      message: "요청 데이터가 올바르지 않습니다.",
    };
    return Response.json(error, { status: 400 });
  }

  const course = MOCK_COURSES.find((c) => c.id === body.courseId);

  if (!course) {
    const error: ErrorResponse = {
      code: "INVALID_INPUT",
      message: "존재하지 않는 강의입니다.",
    };
    return Response.json(error, { status: 400 });
  }

  if (course.currentEnrollment >= course.maxCapacity) {
    const error: ErrorResponse = {
      code: "COURSE_FULL",
      message: "해당 강의는 정원이 마감되었습니다.",
    };
    return Response.json(error, { status: 409 });
  }

  if (body.applicant.email === "duplicate@example.com") {
    const error: ErrorResponse = {
      code: "DUPLICATE_ENROLLMENT",
      message: "이미 신청한 강의입니다.",
    };
    return Response.json(error, { status: 409 });
  }

  const enrollmentResponse: EnrollmentResponse = {
    enrollmentId: `ENR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    status: "confirmed",
    enrolledAt: new Date().toISOString(),
  };

  return Response.json(enrollmentResponse, { status: 201 });
}

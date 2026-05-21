export type EnrollmentType = "personal" | "group";

export interface ApplicantInfo {
  name: string;
  email: string;
  phone: string;
  motivation?: string;
}

export interface Participant {
  name: string;
  email: string;
}

/**
 * headCount: 단체 신청 인원수 (2~10명)
 * participants: headCount와 동일한 수의 참가자 명단
 */
export interface GroupInfo {
  organizationName: string;
  contactPerson: string;
  headCount: number;
  participants: Participant[];
}

/** 작성 중인 폼 전체 상태. useEnrollmentForm이 관리한다. */
export interface EnrollmentFormState {
  courseId: string;
  type: EnrollmentType;
  applicant: ApplicantInfo;
  group?: GroupInfo;
  agreedToTerms: boolean;
}

/** POST /api/enrollments — 개인 신청 요청 */
export interface PersonalEnrollmentRequest {
  type: "personal";
  courseId: string;
  applicant: ApplicantInfo;
  agreedToTerms: boolean;
}

/** POST /api/enrollments — 단체 신청 요청 */
export interface GroupEnrollmentRequest {
  type: "group";
  courseId: string;
  applicant: ApplicantInfo;
  group: GroupInfo;
  agreedToTerms: boolean;
}

export type EnrollmentRequest = PersonalEnrollmentRequest | GroupEnrollmentRequest;

export type EnrollmentStatus = "confirmed" | "pending";

export interface EnrollmentResponse {
  enrollmentId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
}

export type ErrorCode = "COURSE_FULL" | "DUPLICATE_ENROLLMENT" | "INVALID_INPUT";

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
}

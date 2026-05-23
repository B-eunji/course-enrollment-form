import type { EnrollmentFormState } from "@/types/enrollment";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KR_PHONE_REGEX = /^0\d{1,2}[- ]?\d{3,4}[- ]?\d{4}$/;

export function validateCourseStep(
  formState: EnrollmentFormState,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!formState.courseId) {
    errors.courseId = "강의를 선택해주세요.";
  }

  return errors;
}

export function validateApplicantStep(
  formState: EnrollmentFormState,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const { applicant, type, group } = formState;

  const name = applicant.name.trim();
  if (name.length < 2 || name.length > 20) {
    errors["applicant.name"] = "이름은 2~20자만 사용 가능합니다.";
  }

  if (!EMAIL_REGEX.test(applicant.email)) {
    errors["applicant.email"] = "올바른 이메일 형식을 입력해주세요.";
  }

  if (!KR_PHONE_REGEX.test(applicant.phone)) {
    errors["applicant.phone"] =
      "올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)";
  }

  if (applicant.motivation !== undefined && applicant.motivation.length > 300) {
    errors["applicant.motivation"] = "지원 동기는 300자 이하로 입력해주세요.";
  }

  if (type === "group") {
    if (!group) {
      errors.group = "단체 신청 정보를 입력해주세요.";
    } else {
      if (!group.organizationName.trim()) {
        errors["group.organizationName"] = "단체명을 입력해주세요.";
      }

      const contactPerson = group.contactPerson.trim();
      if (!contactPerson) {
        errors["group.contactPerson"] = "담당자 연락처를 입력해주세요.";
      } else if (!KR_PHONE_REGEX.test(group.contactPerson)) {
        errors["group.contactPerson"] =
          "올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)";
      }

      if (group.headCount < 2 || group.headCount > 10) {
        errors["group.headCount"] = "인원수는 2~10명 사이여야 합니다.";
      }

      if (group.participants.length !== group.headCount) {
        errors["group.participants"] =
          `참가자 정보를 ${group.headCount}명 모두 입력해주세요.`;
      }

      group.participants.forEach((p, i) => {
        const participantName = p.name.trim();
        if (!participantName) {
          errors[`group.participants.${i}.name`] =
            "참가자 이름을 입력해주세요.";
        } else if (participantName.length < 2 || participantName.length > 20) {
          errors[`group.participants.${i}.name`] =
            "이름은 2~20자만 사용 가능합니다.";
        }

        const participantEmail = p.email.trim();
        if (!participantEmail) {
          errors[`group.participants.${i}.email`] =
            "참가자 이메일을 입력해주세요.";
        } else if (!EMAIL_REGEX.test(participantEmail)) {
          errors[`group.participants.${i}.email`] =
            "올바른 이메일 형식을 입력해주세요.";
        }
      });

      const emailIndexMap = new Map<string, number[]>();
      group.participants.forEach((p, i) => {
        const participantEmail = p.email.trim();
        if (!participantEmail || !EMAIL_REGEX.test(participantEmail)) {
          return;
        }
        const normalizedEmail = participantEmail.toLowerCase();
        const indices = emailIndexMap.get(normalizedEmail) ?? [];
        indices.push(i);
        emailIndexMap.set(normalizedEmail, indices);
      });

      emailIndexMap.forEach((indices) => {
        if (indices.length < 2) {
          return;
        }
        indices.forEach((i) => {
          const errorKey = `group.participants.${i}.email`;
          if (!errors[errorKey]) {
            errors[errorKey] = "이미 입력된 참가자 이메일입니다.";
          }
        });
      });
    }
  }

  return errors;
}

export function validateConfirmStep(
  formState: EnrollmentFormState,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!formState.agreedToTerms) {
    errors.agreedToTerms = "약관에 동의해주세요.";
  }

  return errors;
}

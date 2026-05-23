# 다단계 수강 신청 폼 — 채용 과제

> Next.js App Router + TypeScript + Tailwind CSS 기반의 다단계 수강 신청 폼

---

## 프로젝트 개요

강의를 선택하고, 개인 또는 단체 신청 유형에 따라 신청자 정보를 입력한 뒤, 내용을 확인하고 제출하는 **3단계 수강 신청 폼**입니다.

- 단일 페이지 내 스텝 전환 (URL 변경 없음)
- 스텝 이동 전 클라이언트 유효성 검증
- 개인/단체 신청 유형에 따른 조건부 필드
- Next.js Route Handler 기반 Mock API로 강의 조회 및 신청 제출
- 스텝 간 입력 데이터 유지

---

## 기술 스택

| 항목 | 버전 / 선택 이유 |
| --- | --- |
| Next.js | 16.2.6 — App Router, Route Handler로 Mock API 구성 |
| React | 19.2.4 |
| TypeScript | ^5 — 개인/단체 요청 타입 분리 |
| Tailwind CSS | ^4 — 디자인 시안 없이 빠른 UI 구성 |
| 상태 관리 | `useState` + `useEnrollmentForm` custom hook |

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

```bash
# 빌드
npm run build

# 프로덕션 실행
npm run start
```

---

## 프로젝트 구조 설명

```
src/
├── app/
│   ├── api/
│   │   ├── courses/route.ts       # GET /api/courses
│   │   └── enrollments/route.ts   # POST /api/enrollments
│   └── page.tsx                   # 폼 진입점, 제출·스크롤·요청 변환
│
├── components/enrollment/
│   ├── CourseStep.tsx             # 1단계: 강의 선택 + 신청 유형
│   ├── ApplicantStep.tsx          # 2단계: 신청자·단체 정보
│   ├── ConfirmStep.tsx            # 3단계: 확인 + 약관 동의
│   ├── CompleteStep.tsx           # 제출 성공 화면
│   ├── StepIndicator.tsx          # 스텝 진행 표시
│   └── FormNavigation.tsx         # 이전 / 다음 / 제출
│
├── constants/courses.ts           # Mock 강의 데이터
├── hooks/useEnrollmentForm.ts     # 폼 상태·스텝·검증 통합
├── types/                         # course, enrollment 타입
└── utils/validation.ts            # 스텝별 클라이언트 검증
```

| 영역 | 역할 |
| --- | --- |
| `useEnrollmentForm` | `currentStep`, `formData`, `errors`, 스텝 이동, 필드 업데이트, `resetForm` |
| Step 컴포넌트 | `formData`를 props로 받는 controlled component, 변경만 hook에 위임 |
| `page.tsx` | Step 렌더링, API 제출, `createEnrollmentRequest`, 첫 에러 스크롤 |
| `validation.ts` | UI와 분리된 스텝별 검증 로직 |
| `constants/courses.ts` + Route Handler | DB 없이 Mock 데이터·API 시뮬레이션 |

---

## 요구사항 해석 및 가정

### 해석

- "다단계"는 **단일 페이지 내 스텝 전환**으로 구현한다. URL은 변경하지 않는다.
- 강의 데이터는 **상수 파일 + Route Handler**로 Mock한다.
- 단체 신청 최소 2명, 최대 10명. 참가자는 이름·이메일 필수.
- 단체 신청의 공통 신청자 정보는 **대표자/담당자**, 참가자 명단은 **실제 수강 대상자**로 분리한다.
- 제출 실패는 `COURSE_FULL`, `DUPLICATE_ENROLLMENT`, `INVALID_INPUT` 등 비즈니스 에러 코드로 구분한다.

### 가정

- 대표자를 참가자 명단에 포함할지는 서비스 정책에 따라 달라질 수 있다. 본 구현은 신청자 정보와 참가자 명단을 **별도 데이터**로 관리한다.
- 강의 카테고리 필터 UI는 API 응답의 `categories`를 사용할 수 있으며, 현재 `CourseStep`은 클라이언트 `COURSE_CATEGORIES` 상수와 동일한 값을 사용한다.
- 약관 동의는 필수 단일 체크박스 1개. 미동의 시 제출 버튼 비활성화.

---

## 설계 결정과 이유

### 단일 페이지 스텝 전환 (vs. 페이지 라우팅)

URL을 `/step/1`, `/step/2`로 나누면 직접 접근 시 이전 단계 데이터가 없어 처리가 복잡해진다. 단일 페이지에서 상태로 스텝을 관리하면 데이터 흐름이 단순하고, 중간 단계 직접 접근을 막기 쉽다.

### 폼 상태 관리: `useEnrollmentForm` custom hook

각 Step 컴포넌트가 독립적으로 `useState`를 가지면, 이전/다음 이동 시 데이터 유지와 최종 제출 데이터 조합이 복잡해진다고 판단했다. 따라서 `useEnrollmentForm`에서 `currentStep`, `formData`, `errors`, `resetForm` 등을 통합 관리한다.

Step 컴포넌트는 `formData`를 props로 받고, 변경 이벤트만 부모/hook으로 위임하는 **controlled component** 구조다.

React Hook Form 같은 라이브러리 대신 custom hook을 선택한 이유는, 과제 규모에서 상태 흐름과 조건부 데이터 처리 방침을 직접 보여주기 위해서다. 실제 대규모 서비스에서는 React Hook Form + Zod 등으로 확장하는 편이 유지보수에 유리하다는 trade-off가 있다.

### 유효성 검증 전략

**클라이언트 검증은 UX, 서버 검증은 데이터 신뢰성**을 위한 이중 방어로 본다.

| 시점 | 검증 내용 |
| --- | --- |
| Step 1 → 2 | `validateCourseStep` — 강의 선택 여부 |
| Step 2 → 3 | `validateApplicantStep` — 신청자 정보 + 단체 조건부 필드 |
| Step 3 제출 | 약관 미동의 시 제출 버튼 비활성화 (`validateConfirmStep` 로직 분리) |

- 검증 로직은 UI가 아닌 `utils/validation.ts`에 분리했다.
- 에러는 `errors` 객체(`Record<string, string>`)로 관리하고, 각 필드 근처에 표시한다.
- 검증 실패 시 `page.tsx`의 `scrollToFirstError`로 첫 번째 에러 위치로 스크롤한다.
- 입력값 수정 시 `clearFieldError` / `clearFieldErrors`로 해당 필드 에러를 즉시 제거한다.

**서버(Mock API) 검증**

- `POST /api/enrollments`에서 요청 구조·필수값·약관 동의를 검증하고, 실패 시 `INVALID_INPUT` (400)
- 정원 마감 강의 → `COURSE_FULL` (409)
- `duplicate@example.com` → `DUPLICATE_ENROLLMENT` (409)

### 조건부 필드 데이터 처리 방침

- 신청 유형은 `personal` / `group`으로 관리한다.
- 개인 → 단체 전환: `createDefaultGroup()`으로 단체 기본 데이터 생성
- 단체 → 개인 전환: `group` 필드 제거 (제출 데이터에 불필요한 단체 정보가 남지 않음)
- `headCount` 변경 시 `participants` 배열 길이를 동기화 (늘리면 빈 참가자 추가, 줄이면 slice)
- 공통 신청자 정보(`applicant`) = 대표자/담당자, `group.participants` = 실제 수강 대상자

**작성 중 상태 vs API 요청 타입 분리**

```ts
// 작성 중 — group은 단체 전환 전까지 optional
interface EnrollmentFormState {
  courseId: string;
  type: EnrollmentType;
  applicant: ApplicantInfo;
  group?: GroupInfo;
  agreedToTerms: boolean;
}

// 제출 요청 — type에 따라 group 필수 여부 확정
type EnrollmentRequest = PersonalEnrollmentRequest | GroupEnrollmentRequest;
```

제출 직전 `page.tsx`의 `createEnrollmentRequest()`에서 `personal` / `group` 요청 타입으로 좁혀 API 요청을 생성한다.

### Mock API를 Route Handler로 구성

별도 Express 서버 없이 Next.js Route Handler로 `/api/courses`, `/api/enrollments`를 구현했다. 클라이언트는 실제 서비스와 동일한 `fetch` 패턴을 유지하면서, 추가 인프라 없이 동작한다.

---

## Mock 데이터 / API 구성 방법

### Mock 데이터

- 강의 원본 데이터: `src/constants/courses.ts` (`MOCK_COURSES`)
- 카테고리 상수: `src/types/course.ts` (`COURSE_CATEGORIES`)
- Route Handler는 위 상수를 import해 응답을 생성한다. **실제 DB·메모리 저장소를 사용하지 않으며, 제출 내역을 영구 저장하지 않는다.**

### API 엔드포인트

#### `GET /api/courses`

| 쿼리 | 동작 |
| --- | --- |
| 없음 | 전체 강의 목록 반환 |
| `?category={category}` | 해당 카테고리 강의만 필터링 |

**응답 예시**

```json
{
  "courses": [ /* Course[] */ ],
  "categories": ["development", "design", "marketing", "business"]
}
```

- `categories`는 `COURSE_CATEGORIES` 상수 값을 그대로 반환한다.
- `category` 쿼리가 있으면 `courses`만 필터링되며, `categories` 목록은 동일하게 반환한다.
- 유효하지 않은 `category` → `INVALID_INPUT` (400)

#### `POST /api/enrollments`

개인/단체 신청 요청(`EnrollmentRequest`)을 받는다.

**성공 (201)**

```json
{
  "enrollmentId": "ENR-...",
  "status": "confirmed",
  "enrolledAt": "2026-05-24T..."
}
```

**에러 응답**

| code | 조건 | HTTP |
| --- | --- | --- |
| `INVALID_INPUT` | JSON 파싱 실패, 필수값 누락, 존재하지 않는 강의 | 400 |
| `COURSE_FULL` | `currentEnrollment >= maxCapacity` | 409 |
| `DUPLICATE_ENROLLMENT` | `applicant.email === "duplicate@example.com"` | 409 |

> 중복 신청 검증은 **저장소 조회가 아니라** 테스트용 이메일 규칙으로만 동작한다. 동일 이메일을 반복 제출해도 실제 중복 저장 검증은 발생하지 않는다.

---

## Mock API 테스트 방법

| 시나리오 | 방법 |
| --- | --- |
| 정상 제출 | `duplicate@example.com` 외 이메일로 3단계까지 입력 후 제출 |
| `DUPLICATE_ENROLLMENT` | 신청자 이메일에 `duplicate@example.com` 입력 후 제출 |
| `COURSE_FULL` | 정원 마감 강의(`currentEnrollment >= maxCapacity`)는 UI에서 선택 불가. 서버에서도 동일 조건으로 방어 |
| `INVALID_INPUT` | API에 불완전한 요청을 보내거나, 존재하지 않는 `courseId`로 제출 |
| 카테고리 필터 | 1단계에서 카테고리 버튼 클릭 → `GET /api/courses?category=...` 호출 확인 |

개발자 도구 Network 탭에서 `/api/courses`, `/api/enrollments` 요청·응답을 확인할 수 있다.

---

## 미구현 / 제약사항

| 항목 | 상태 |
| --- | --- |
| localStorage 임시 저장 | 미구현 |
| 브라우저 이탈 방지 (`beforeunload`) | 미구현 |
| 모바일 최적화 | 전체 구현하지 않음. 좁은 화면에서 가로 깨짐을 줄이기 위한 기본 레이아웃(`overflow-x-hidden`, `sm:` breakpoint 등)만 적용 |
| 강의 데이터 중복 fetch | `CourseStep`과 `page.tsx`가 각각 `/api/courses`를 호출할 수 있음. 구현 단순성·제출 안정성을 우선했으며, 실제 서비스에서는 상위 상태 또는 query cache로 단일화 가능 |
| Mock API 영속성 | 서버 메모리/DB 저장 없음. `duplicate@example.com` 외 실제 중복 신청 저장 검증 없음 |
| 인증/인가, i18n, a11y 전면 대응 | 과제 범위 외 또는 부분 적용 |

---

## AI 활용 범위

ChatGPT와 Cursor를 개발 보조 도구로 활용했다.

**AI 활용**

- 요구사항 분석, 구현 체크리스트 작성
- 코드 리뷰 보조, README 문구 정리
- 타입 / validation / API 흐름 검토

**직접 수행**

- 최종 설계 판단, 구현 범위 결정
- 브라우저 QA, `npm run build` 검증
- README 정합성 확인 (실제 구현과 대조)

AI가 생성한 결과를 그대로 제출하지 않았다. 리뷰 결과를 바탕으로 수정·검증한 뒤 반영했다.

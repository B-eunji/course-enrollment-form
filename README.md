# 다단계 수강 신청 폼 — 채용 과제

> Next.js App Router + TypeScript + Tailwind CSS 기반의 다단계 수강 신청 폼 구현 과제

---

## 프로젝트 개요

강의를 선택하고, 개인 또는 단체 신청 유형에 따라 신청자 정보를 입력한 뒤, 내용을 확인하고 제출하는 **3단계 수강 신청 폼**입니다.

- 단계 간 유효성 검증 후 이동
- 개인/단체 신청 유형에 따른 조건부 필드 표시
- Mock API(Next.js Route Handler)를 통한 강의 조회 및 신청 제출
- 입력 데이터는 스텝 이동 시에도 유지

---

## 기술 스택

| 항목         | 버전 / 선택 이유                                                |
| ------------ | --------------------------------------------------------------- |
| Next.js      | 16.2.6 — App Router 기반, Route Handler로 Mock API 구성         |
| React        | 19.2.4                                                          |
| TypeScript   | ^5 — 필수 조건, 개인/단체 타입 분리에 적합                      |
| Tailwind CSS | ^4 — 디자인 시안 없는 과제에서 빠른 UI 구성                     |
| 상태 관리    | useState + custom hook — 외부 라이브러리 없이 폼 흐름 직접 설계 |

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

## Mock API 테스트 안내

이 프로젝트의 API는 실제 DB 없이 Route Handler로 동작하는 Mock입니다.

| 시나리오 | 방법 |
| -------- | ---- |
| **DUPLICATE_ENROLLMENT 에러 테스트** | 신청자 이메일에 `duplicate@example.com` 입력 후 제출 |
| **COURSE_FULL 강의 선택 제한** | 정원이 마감된 강의는 UI에서 선택 불가 상태로 표시되며, 서버에서도 `COURSE_FULL`로 방어 |
| **정상 제출** | 위 이메일 외 임의 이메일로 모든 필드를 채운 뒤 제출 |

> **주의:** Mock API는 실제 DB를 사용하지 않습니다. 제출 내역은 영구 저장되지 않으며, 동일한 이메일을 반복 제출해도 실제 중복 저장소 기반 검증은 발생하지 않습니다. 중복 에러는 `duplicate@example.com` 이메일로만 확인할 수 있습니다.

---

## 요구사항 해석 및 가정

### 해석

- "다단계"는 화면 전환이 아닌 **단일 페이지 내 스텝 전환** 방식으로 구현한다. URL은 변경하지 않는다.
- 강의 데이터는 별도 DB 없이 **상수 파일 + Route Handler**로 Mock한다.
- "제출"은 실제 외부 API 없이 Route Handler에서 응답을 시뮬레이션한다.
- 단체 신청의 최소 인원은 2명, 최대 인원은 10명으로 제한한다.
- 참가자 명단은 이름과 이메일을 필수로 받는다.

### 가정

- 강의 카테고리는 고정값(상수)으로 관리한다.
- 폼 제출 실패는 단순 네트워크 오류뿐 아니라 COURSE_FULL, DUPLICATE_ENROLLMENT, INVALID_INPUT과 같은 비즈니스 에러 코드로 구분하여 사용자 메시지를 표시한다.
- 약관 동의는 필수 단일 체크박스 1개로 구현한다. 미동의 시 제출 버튼은 비활성화된다.
- 스텝 인디케이터는 완료/현재/미완료 세 가지 상태를 시각적으로 표시한다.

---

## 구현 범위

### 필수 구현

- [x] 강의 선택 (카테고리 필터 + 강의 목록)
- [x] 선택한 강의 정보 표시 (제목, 카테고리, 일정 등)
- [x] 개인 / 단체 신청 유형 선택
- [x] 공통 신청자 정보 입력 (이름, 이메일, 연락처)
- [x] 단체 신청 조건부 필드 (단체명, 인원수)
- [x] 참가자 명단 동적 입력 (신청 인원수에 맞춰 이름/이메일 입력 필드를 자동 생성)
- [x] 확인 및 제출 화면 (입력 요약 표시)
- [x] 약관 동의 (단일 필수 체크박스)
- [x] 제출 성공 / 실패 상태 처리
- [x] 스텝 이동 전 유효성 검증
- [x] 스텝 간 입력 데이터 유지
- [x] 스텝 인디케이터
- [x] Mock API 구성 (강의 목록 GET, 신청 제출 POST)

### 선택 구현

- [ ] localStorage 임시 저장 (새로고침 시 복원)
- [ ] 브라우저 이탈 방지 (`beforeunload` 이벤트)
- [ ] 반응형 레이아웃 (모바일 대응)

---

## 화면 흐름

```
[1단계] 강의 선택
  ├─ 카테고리 필터로 강의 목록 탐색
  ├─ 강의 선택 (단일 선택)
  ├─ 신청 유형 선택 (개인 / 단체)
  └─ 다음 → 유효성 검증 통과 시 2단계 이동

[2단계] 신청자 정보 입력
  ├─ 공통 필드: 이름, 이메일, 연락처
  ├─ [단체 선택 시] 단체명, 인원수, 참가자 명단 동적 입력
  └─ 다음 → 유효성 검증 통과 시 3단계 이동

[3단계] 확인 및 약관 동의
  ├─ 1·2단계 입력 내용 요약 표시
  ├─ 약관 동의 체크박스 (단일, 미동의 시 제출 비활성화)
  └─ 제출 → API 호출

[제출 결과]
  ├─ 성공: 신청 완료 화면 (신청 번호, 강의 정보 표시)
  └─ 실패: 3단계 확인 화면에 오류 메시지 표시, 입력 데이터 유지, 동일 화면에서 신청 제출로 재시도
```

---

## 현재 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── courses/
│   │   │   └── route.ts          # GET /api/courses — 강의 목록 반환
│   │   └── enrollments/
│   │       └── route.ts          # POST /api/enrollments — 신청 제출
│   └── page.tsx                  # 루트 페이지 (폼 진입점)
│
├── components/
│   └── enrollment/
│       ├── CourseStep.tsx         # 1단계: 강의 선택 + 신청 유형
│       ├── ApplicantStep.tsx      # 2단계: 신청자 정보 입력
│       ├── ConfirmStep.tsx        # 3단계: 확인 + 약관 동의
│       ├── CompleteStep.tsx       # 제출 결과 화면
│       ├── StepIndicator.tsx      # 상단 스텝 진행 표시기
│       └── FormNavigation.tsx     # 이전 / 다음 / 제출 버튼 영역
│
├── constants/
│   └── courses.ts                 # 강의 Mock 데이터 (카테고리 포함)
│
├── hooks/
│   └── useEnrollmentForm.ts       # 폼 전체 상태 + 스텝 전환 + 유효성 검증
│
├── types/
│   ├── course.ts                  # Course, Category 타입
│   └── enrollment.ts              # EnrollmentForm, ApplicantInfo, Participant 타입
│
└── utils/
    └── validation.ts              # 스텝별 유효성 검증 함수
```

---

## 설계 결정과 이유

### 단일 페이지 스텝 전환 (vs. 페이지 라우팅)

URL을 `/step/1`, `/step/2`로 분리하면 직접 접근 시 이전 단계 데이터가 없어 처리가 복잡해진다. 단일 페이지에서 상태로 스텝을 관리하면 데이터 흐름이 단순하고 중간 단계 직접 접근을 방지하기 용이하다.

### useState + custom hook (vs. Zustand / React Hook Form)

외부 폼 라이브러리를 쓰면 과제에서 직접 설계 능력을 보여주기 어렵다. `useEnrollmentForm` 훅에 상태 구조, 유효성 검증, 스텝 전환 로직을 집약하여 설계 의도를 명확히 전달한다.

### 작성 중 폼 상태와 제출 요청 타입 분리

작성 중인 폼 상태(`EnrollmentFormState`)와 API 제출 요청 타입(`EnrollmentRequest`)을 분리했다.

```ts
// 작성 중 폼 상태 — group은 단체 전환 전까지 optional
interface EnrollmentFormState {
  courseId: string;
  type: EnrollmentType;
  applicant: ApplicantInfo;
  group?: GroupInfo;
  agreedToTerms: boolean;
}

// 제출 요청 — type에 따라 group 필수 여부가 확정됨
type EnrollmentRequest =
  | PersonalEnrollmentRequest
  | GroupEnrollmentRequest;
```

- `updateEnrollmentType("group")` 호출 시 `createDefaultGroup()`으로 `group`을 생성한다.
- 개인 전환 시 `group` 필드를 제거해 불필요한 데이터가 남지 않게 한다.
- 제출 직전 `createEnrollmentRequest()`에서 `PersonalEnrollmentRequest` 또는 `GroupEnrollmentRequest`로 좁혀 API 요청을 만든다.

이렇게 하면 스텝 이동 중에는 optional `group`으로 유연하게 상태를 관리하고, 제출 시점에는 타입이 확정된 요청 객체만 서버로 전달할 수 있다.

### Mock API는 Route Handler로 구성

별도 Express 서버 없이 Next.js Route Handler로 `/api/courses`, `/api/enrollments`를 구현한다. 실제 API와 동일한 `fetch` 호출 패턴을 유지하면서도 환경 추가 없이 동작한다.

### Tailwind CSS v4

별도 디자인 시안이 없는 과제 특성상, 클래스 기반으로 빠르게 일관된 UI를 구성하기 위해 선택했다. CSS 파일 분리 없이 컴포넌트 내에서 스타일 의도를 바로 파악할 수 있다.

---

## 미구현 / 제약사항

- **실제 DB 연동 없음**: 모든 데이터는 메모리(상수) 기반 Mock
- **인증/인가 없음**: 과제 범위 외
- **다국어(i18n) 미지원**
- **접근성(a11y) 부분 적용**: 기본 시맨틱 태그 사용, 스크린리더 최적화는 미포함
- **배포 환경 미설정**: 로컬 실행 기준으로 작성

---

## AI 활용 범위

본 과제에서는 ChatGPT와 Cursor를 개발 보조 도구로 활용했습니다.

- ChatGPT: 요구사항 분석, 구현 우선순위 정리, 설계 결정 검토, README 문장 검토

- Cursor: README 초안 작성 및 문구 정리, 타입·validation·API 흐름 검토 보조, 코드 리뷰 및 리팩토링 보조

Cursor에서는 Claude Sonnet 계열 모델을 주로 사용했으며, AI가 제안한 결과물은 그대로 사용하지 않고 과제 요구사항과 실제 실행 결과를 기준으로 수정 및 검증했습니다.

| 활용 영역 | 내용 |
| --------- | ---- |
| 요구사항 분석 | 과제 명세를 구현 단위로 분해하는 과정에서 검토 보조 |
| 구현 체크리스트 작성 | 필수/선택 항목 분류 및 누락 여부 점검 |
| 설계 결정 검토 | 스텝 전환 방식, 상태 관리 구조 선택지 검토 |
| README 초안 작성 및 문구 정리 | 문서 초안 구성 및 실제 구현과의 문구 정리 |
| 코드 리뷰 보조 | 구현 후 타입·validation·API 흐름 검토 보조 |

> **최종 설계 판단과 구현 검증은 직접 수행합니다.**  
> AI가 제안한 내용이라도 요구사항과 맞지 않거나 불필요한 경우 채택하지 않습니다.

import type { Course } from "@/types/course";

export const MOCK_COURSES: Course[] = [
  {
    id: "course-001",
    title: "React와 Next.js로 시작하는 풀스택 개발",
    description:
      "React 기초부터 Next.js App Router까지, 실무에서 바로 쓸 수 있는 풀스택 개발 역량을 쌓습니다. TypeScript와 Tailwind CSS를 활용한 프로젝트 중심 커리큘럼으로 구성됩니다.",
    category: "development",
    price: 320000,
    maxCapacity: 30,
    currentEnrollment: 12,
    startDate: "2026-07-01T09:00:00+09:00",
    endDate: "2026-08-31T18:00:00+09:00",
    instructor: "김지훈",
  },
  {
    id: "course-002",
    title: "Figma로 완성하는 프로덕트 디자인",
    description:
      "Figma의 핵심 기능부터 디자인 시스템 구축, 프로토타이핑까지 실무 디자인 프로세스 전반을 다룹니다. UX 리서치와 사용성 원칙도 함께 학습합니다.",
    category: "design",
    price: 280000,
    maxCapacity: 20,
    currentEnrollment: 20,
    startDate: "2026-07-07T10:00:00+09:00",
    endDate: "2026-08-29T17:00:00+09:00",
    instructor: "이수연",
  },
  {
    id: "course-003",
    title: "데이터 기반 디지털 마케팅 전략",
    description:
      "GA4, Meta Ads, 검색광고 등 핵심 채널별 운영 전략과 성과 분석 방법을 배웁니다. 직접 캠페인을 설계하고 데이터로 의사결정하는 실습 중심 과정입니다.",
    category: "marketing",
    price: 240000,
    maxCapacity: 25,
    currentEnrollment: 8,
    startDate: "2026-08-04T10:00:00+09:00",
    endDate: "2026-09-26T17:00:00+09:00",
    instructor: "박서준",
  },
  {
    id: "course-004",
    title: "스타트업 창업자를 위한 비즈니스 모델 설계",
    description:
      "린 스타트업 방법론을 기반으로 비즈니스 모델 캔버스 작성, 고객 발견 인터뷰, 가설 검증 실습까지 진행합니다. 실제 창업 사례 분석이 포함됩니다.",
    category: "business",
    price: 360000,
    maxCapacity: 15,
    currentEnrollment: 15,
    startDate: "2026-07-14T09:00:00+09:00",
    endDate: "2026-09-05T18:00:00+09:00",
    instructor: "최민아",
  },
  {
    id: "course-005",
    title: "Python으로 배우는 데이터 분석 입문",
    description:
      "pandas, numpy, matplotlib를 활용한 데이터 전처리와 시각화를 학습합니다. 실무 데이터셋으로 EDA(탐색적 데이터 분석)를 직접 수행하는 과정입니다.",
    category: "development",
    price: 290000,
    maxCapacity: 30,
    currentEnrollment: 22,
    startDate: "2026-08-11T09:00:00+09:00",
    endDate: "2026-10-03T18:00:00+09:00",
    instructor: "정태호",
  },
];

# 프로젝트 문서 구조 가이드

프로젝트 문서를 효과적으로 관리하기 위한 구조와 규칙입니다.

## 현재 문서 상태

```
./
├── CLAUDE.md                    # Claude Code 작업 가이드
├── MCP_SETUP.md                 # MCP 설정 가이드
├── README.md                    # 프로젝트 개요
└── docs/
    ├── code-guidelines.md       # 코딩 규칙
    ├── PRODUCT_SPEC.md          # 제품 스펙
    └── SHOPS_TABLE_SCHEMA.md    # DB 스키마
```

## 추천하는 문서 구조

```
./
├── README.md                    # 프로젝트 메인 문서 (누구나 첫 번째로 읽음)
├── CLAUDE.md                    # Claude Code 전용 지침
├── CONTRIBUTING.md              # 기여 가이드 (협업 시 추가)
├── CHANGELOG.md                 # 변경 이력 (선택)
│
└── docs/                        # 모든 상세 문서는 여기에
    │
    ├── README.md                # docs 디렉토리 인덱스
    │
    ├── guides/                  # 사용 및 개발 가이드
    │   ├── getting-started.md   # 시작 가이드
    │   ├── development.md       # 개발 환경 설정
    │   ├── deployment.md        # 배포 가이드
    │   ├── migration-guide.md   # 마이그레이션 가이드 (이미 존재)
    │   └── code-guidelines.md   # 코딩 규칙 (이동 예정)
    │
    ├── architecture/            # 아키텍처 및 설계
    │   ├── overview.md          # 전체 아키텍처 개요
    │   ├── directory-structure.md # 디렉토리 구조 설명
    │   ├── state-management.md  # 상태 관리 전략
    │   └── api-design.md        # API 설계 원칙
    │
    ├── specs/                   # 기능 및 제품 스펙
    │   ├── PRODUCT_SPEC.md      # 제품 스펙 (이동 예정)
    │   ├── features/            # 기능별 상세 스펙
    │   │   ├── store-management.md
    │   │   ├── user-management.md
    │   │   └── product-catalog.md
    │   └── requirements/        # 요구사항 문서
    │
    ├── database/                # 데이터베이스 관련
    │   ├── schema.md            # 전체 스키마 개요
    │   ├── tables/              # 테이블별 상세 스키마
    │   │   ├── shops.md         # SHOPS_TABLE_SCHEMA.md 이동
    │   │   ├── users.md
    │   │   └── products.md
    │   └── migrations/          # 마이그레이션 이력
    │
    ├── api/                     # API 문서
    │   ├── overview.md          # API 개요
    │   ├── authentication.md    # 인증/인가
    │   └── endpoints/           # 엔드포인트별 문서
    │       ├── stores.md
    │       ├── users.md
    │       └── products.md
    │
    ├── setup/                   # 설정 및 환경 구성
    │   ├── MCP_SETUP.md         # MCP 설정 (이동 예정)
    │   ├── environment.md       # 환경 변수
    │   └── tools.md             # 개발 도구 설정
    │
    └── troubleshooting/         # 문제 해결
        ├── common-issues.md     # 자주 발생하는 문제
        └── debugging.md         # 디버깅 가이드
```

## 마이그레이션 계획

### Step 1: docs/README.md 생성
문서 디렉토리의 인덱스 역할을 하는 파일 생성

### Step 2: 서브 디렉토리 생성
```bash
cd docs
mkdir -p guides architecture specs database/tables api/endpoints setup troubleshooting
```

### Step 3: 기존 파일 이동
```bash
# 코딩 가이드라인 이동
mv docs/code-guidelines.md docs/guides/

# 제품 스펙 이동
mv docs/PRODUCT_SPEC.md docs/specs/

# DB 스키마 이동
mkdir -p docs/database/tables
mv docs/SHOPS_TABLE_SCHEMA.md docs/database/tables/shops.md

# MCP 설정 이동
mv MCP_SETUP.md docs/setup/
```

### Step 4: 루트 파일 참조 업데이트
README.md에서 이동된 파일들의 링크 수정

## 각 문서의 역할

### 루트 레벨 문서

#### README.md
- **목적**: 프로젝트의 첫인상, 빠른 시작 가이드
- **포함 내용**:
  - 프로젝트 소개
  - 주요 기능
  - 빠른 시작 (설치, 실행)
  - 기본 사용법
  - 문서 링크 (docs/ 디렉토리 가이드)
  - 라이선스, 기여자

#### CLAUDE.md
- **목적**: Claude Code가 프로젝트 작업 시 참고할 지침
- **포함 내용**:
  - 프로젝트 개요
  - 기술 스택
  - 개발 명령어
  - 중요 설정 (tsconfig, vite 등)
  - 프로젝트 구조
  - 코딩 컨벤션 (간단히)

#### CONTRIBUTING.md (협업 시 추가)
- **목적**: 외부 기여자를 위한 가이드
- **포함 내용**:
  - 기여 프로세스
  - 브랜치 전략
  - PR 규칙
  - 코드 리뷰 가이드

### docs/ 서브 디렉토리

#### guides/
**언제 사용**: How-to, 튜토리얼, 작업 가이드
- getting-started.md: 신규 개발자 온보딩
- development.md: 로컬 개발 환경 세팅
- deployment.md: 배포 프로세스
- migration-guide.md: 버전/구조 마이그레이션

#### architecture/
**언제 사용**: 시스템 설계, 구조 설명
- overview.md: 전체 시스템 아키텍처
- directory-structure.md: 폴더 구조 상세 설명
- state-management.md: 상태 관리 패턴
- api-design.md: API 설계 철학

#### specs/
**언제 사용**: 제품/기능 요구사항, 스펙
- PRODUCT_SPEC.md: 전체 제품 스펙
- features/: 각 기능별 상세 스펙
- requirements/: 기능별 요구사항

#### database/
**언제 사용**: DB 스키마, 마이그레이션
- schema.md: 전체 데이터 모델 개요
- tables/: 각 테이블별 상세 스키마
- migrations/: 스키마 변경 이력

#### api/
**언제 사용**: API 문서화
- overview.md: API 전반적인 설명
- authentication.md: 인증 방식
- endpoints/: 각 API 엔드포인트 상세 문서

#### setup/
**언제 사용**: 환경 설정, 도구 설정
- 개발 도구 설정
- CI/CD 설정
- 환경 변수 설명

#### troubleshooting/
**언제 사용**: 문제 해결, FAQ
- 자주 발생하는 오류와 해결책
- 디버깅 팁

## 문서 작성 규칙

### 파일명 규칙
```
# 일반 문서: kebab-case
getting-started.md
code-guidelines.md
api-design.md

# 중요 문서: UPPER_CASE (루트 레벨만)
README.md
CONTRIBUTING.md
CHANGELOG.md
```

### 문서 템플릿

모든 문서는 다음 구조를 따릅니다:

```markdown
# 제목

> 한 줄 요약 (선택)

## 개요
간단한 설명

## 목차 (긴 문서의 경우)
- [섹션 1](#섹션-1)
- [섹션 2](#섹션-2)

## 내용
...

## 관련 문서
- [문서 A](./path/to/doc-a.md)
- [문서 B](./path/to/doc-b.md)

## 업데이트 이력 (선택)
- 2025-01-15: 초안 작성
```

### 상호 참조
문서 간 링크를 적극 활용:

```markdown
자세한 API 설계 원칙은 [API Design Guide](../architecture/api-design.md)를 참고하세요.

데이터베이스 스키마는 [Database Schema](../database/schema.md)에서 확인할 수 있습니다.
```

## docs/README.md 예시

docs 디렉토리에는 반드시 README.md를 만들어 인덱스 역할을 합니다:

```markdown
# 프로젝트 문서

Gacha Store Admin 프로젝트의 모든 문서가 여기에 있습니다.

## 시작하기

- [Getting Started](./guides/getting-started.md) - 프로젝트 시작 가이드
- [Development Guide](./guides/development.md) - 개발 환경 설정

## 개발 가이드

- [Code Guidelines](./guides/code-guidelines.md) - 코딩 규칙
- [Migration Guide](./guides/migration-guide.md) - 마이그레이션 가이드

## 아키텍처

- [Architecture Overview](./architecture/overview.md) - 전체 아키텍처
- [Directory Structure](./architecture/directory-structure.md) - 폴더 구조

## 스펙 및 요구사항

- [Product Specification](./specs/PRODUCT_SPEC.md) - 제품 스펙

## 데이터베이스

- [Database Schema](./database/schema.md) - 데이터베이스 스키마
- [Tables](./database/tables/) - 테이블별 상세 스키마

## API

- [API Overview](./api/overview.md) - API 개요
- [Endpoints](./api/endpoints/) - API 엔드포인트 문서

## 설정

- [MCP Setup](./setup/MCP_SETUP.md) - MCP 설정 가이드
- [Environment Variables](./setup/environment.md) - 환경 변수

## 문제 해결

- [Common Issues](./troubleshooting/common-issues.md) - 자주 발생하는 문제
```

## 관리 원칙

### 1. Single Source of Truth
- 동일한 정보는 한 곳에만 작성
- 다른 곳에서는 링크로 참조

### 2. 최신 상태 유지
- 코드 변경 시 관련 문서도 함께 업데이트
- 오래된 문서는 deprecated 표시

### 3. 검색 가능성
- 명확한 제목과 섹션 구조
- 키워드 포함
- 목차 제공

### 4. 점진적 개선
- 처음부터 완벽할 필요 없음
- 필요할 때 문서 추가
- 사용하면서 개선

## 체크리스트

### 즉시 실행
- [ ] `docs/README.md` 생성 (문서 인덱스)
- [ ] `docs/guides/`, `docs/specs/`, `docs/database/tables/` 디렉토리 생성
- [ ] 기존 파일 이동
  - [ ] `code-guidelines.md` → `docs/guides/`
  - [ ] `PRODUCT_SPEC.md` → `docs/specs/`
  - [ ] `SHOPS_TABLE_SCHEMA.md` → `docs/database/tables/shops.md`
  - [ ] `MCP_SETUP.md` → `docs/setup/`
- [ ] 루트 `README.md`에서 링크 업데이트

### 점진적 추가
- [ ] `docs/guides/getting-started.md` 작성
- [ ] `docs/architecture/overview.md` 작성
- [ ] `docs/database/schema.md` 작성
- [ ] API 문서 작성 (백엔드 개발 시작 후)

## 유용한 도구

### 문서 생성 도구
- [Docusaurus](https://docusaurus.io/) - 문서 사이트 생성
- [VitePress](https://vitepress.dev/) - Vite 기반 문서 사이트

### 다이어그램
- [Mermaid](https://mermaid.js.org/) - 마크다운에서 다이어그램 작성
- [Draw.io](https://draw.io/) - 아키텍처 다이어그램

### 예시

```markdown
## Architecture Diagram

\`\`\`mermaid
graph TD
    A[Client] --> B[React App]
    B --> C[API Service]
    C --> D[Backend API]
    D --> E[Database]
\`\`\`
```

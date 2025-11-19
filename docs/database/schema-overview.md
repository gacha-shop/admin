# 데이터베이스 스키마 개요

> Gacha Store Admin 프로젝트의 전체 데이터베이스 구조

## 데이터베이스 정보

- **프로젝트**: gacha-shop
- **프로젝트 ID**: kabndipxpxxhwqljhsdv
- **리전**: ap-northeast-2 (Seoul)
- **PostgreSQL 버전**: 17.6.1.029
- **Supabase 상태**: ACTIVE_HEALTHY
- **최종 업데이트**: 2025-11-19

---

## 테이블 목록

프로젝트에는 총 **14개**의 테이블이 있습니다:

### 1. 사용자 관리 (Users)

| 테이블명       | 행 수 | RLS | 설명                                      |
| -------------- | ----- | --- | ----------------------------------------- |
| `general_users` | 0     | ✓   | 일반 유저 (소셜 로그인: Kakao, Google, Apple) |
| `admin_users`   | 8     | ✓   | 관리자 및 매장 오너 (이메일 로그인)       |

### 2. 매장 관리 (Shops)

| 테이블명      | 행 수 | RLS | 설명                                     |
| ------------- | ----- | --- | ---------------------------------------- |
| `shops`       | 29    | ✓   | 매장 정보 (가챠샵/피규어샵)             |
| `shop_images` | 0     | ✓   | 매장 이미지 (다중 이미지 지원)          |
| `shop_owners` | 2     | ✓   | 매장 소유자 관계 (admin_users ↔ shops) |

### 3. 태그 시스템 (Tags)

| 테이블명    | 행 수 | RLS | 설명                                   |
| ----------- | ----- | --- | -------------------------------------- |
| `tags`      | 6     | ✓   | 태그 마스터 (주차가능, 신작 많음 등)  |
| `shop_tags` | 3     | ✓   | 매장-태그 연결 (M:N 관계)             |

### 4. 권한 시스템 (Permissions)

| 테이블명                | 행 수 | RLS | 설명                                  |
| ----------------------- | ----- | --- | ------------------------------------- |
| `permissions`           | 0     | ✓   | 권한 정의 (CRUD 권한 등)             |
| `admin_permissions`     | 0     | ✓   | 관리자-권한 연결 (M:N)               |
| `menus`                 | 13    | ✓   | 메뉴 마스터 (계층 구조 지원)         |
| `admin_menu_permissions`| 24    | ✓   | 관리자-메뉴 권한 (M:N)               |

### 5. 유저 제보 (User Submissions)

| 테이블명           | 행 수 | RLS | 설명                                      |
| ------------------ | ----- | --- | ----------------------------------------- |
| `user_submissions` | 0     | ✓   | 일반 유저 매장 정보 제보 이력            |

### 6. 감사 로그 (Audit Logs)

| 테이블명          | 행 수 | RLS | 설명                                |
| ----------------- | ----- | --- | ----------------------------------- |
| `admin_audit_logs`| 0     | ✓   | 관리자 액션 감사 추적 로그          |

---

## ER 다이어그램

### 핵심 관계도

```
┌──────────────┐
│  auth.users  │ (Supabase Auth)
└──────┬───────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌─────────────┐ ┌──────────────┐
│general_users│ │ admin_users  │
│(소셜 로그인)│ │(이메일 로그인)│
└─────────────┘ └──────┬───────┘
                       │
                       │ owner_id
                       ▼
                ┌─────────────┐
                │shop_owners  │
                └──────┬──────┘
                       │ shop_id
                       ▼
                ┌─────────────┐      ┌──────────┐
                │   shops     │◄─────│shop_tags │
                └──────┬──────┘      └────┬─────┘
                       │                  │
                       │ shop_id          │ tag_id
                       ▼                  ▼
                ┌─────────────┐      ┌──────────┐
                │shop_images  │      │   tags   │
                └─────────────┘      └──────────┘

┌──────────────┐      ┌──────────────────────┐
│ admin_users  │◄─────│admin_menu_permissions│
└──────┬───────┘      └──────────┬───────────┘
       │                         │
       │                         ▼
       │                   ┌──────────┐
       │                   │  menus   │ (계층 구조)
       │                   └──────────┘
       │
       │ submitter_id
       ▼
┌──────────────────┐
│user_submissions  │
└──────────────────┘
```

---

## 주요 기능별 테이블 그룹

### 1. 인증 및 사용자 관리
- **auth.users** (Supabase Auth)
- **general_users**: 소셜 로그인 (Kakao, Google, Apple)
- **admin_users**: 이메일 로그인 + 승인 시스템
- **shop_owners**: 오너 ↔ 매장 연결

**특징**:
- 사용자 유형별 테이블 분리 (general vs admin)
- 관리자는 승인 시스템 (`approval_status`)
- 매장 오너는 소유 매장 정보 연결

### 2. 매장 정보 관리
- **shops**: 매장 기본 정보
- **shop_images**: 매장 이미지 (1:N)
- **tags**: 태그 마스터
- **shop_tags**: 매장-태그 관계 (M:N)

**특징**:
- 상세 주소 구조 (sido, sigungu, road_address 등)
- 검증 상태 관리 (`verification_status`)
- 소프트 삭제 (`is_deleted`)
- 태그 시스템으로 매장 특성 분류

### 3. 권한 및 메뉴 시스템
- **menus**: 메뉴 마스터 (계층 구조)
- **admin_menu_permissions**: 관리자별 메뉴 접근 권한
- **permissions**: 권한 정의 (미사용 - 향후 확장용)
- **admin_permissions**: 관리자별 권한 (미사용)

**특징**:
- 메뉴 기반 동적 권한 제어
- 계층 구조 지원 (parent_id)
- 역할(role) 기반 + 메뉴 기반 이중 권한 체계

### 4. 유저 참여 시스템
- **user_submissions**: 일반 유저의 매장 정보 제보
- **admin_audit_logs**: 관리자 액션 감사 로그

**특징**:
- 제보 유형: 신규, 수정 제안, 정정
- 검토 상태 관리 (`status`: pending, approved, rejected)
- 제보 시점 데이터 스냅샷 저장 (`submitted_data`)

---

## 설치된 PostgreSQL Extensions

### 활성 Extensions

| 이름             | 버전    | 스키마      | 설명                          |
| ---------------- | ------- | ----------- | ----------------------------- |
| `plpgsql`        | 1.0     | pg_catalog  | PL/pgSQL 절차 언어            |
| `uuid-ossp`      | 1.1     | extensions  | UUID 생성 함수                |
| `pgcrypto`       | 1.3     | extensions  | 암호화 함수                   |
| `supabase_vault` | 0.3.1   | vault       | Supabase Vault (비밀 관리)    |
| `pg_graphql`     | 1.5.11  | graphql     | GraphQL 지원                  |
| `pg_stat_statements` | 1.11 | extensions | SQL 통계 추적                |

### 사용 가능한 주요 Extensions (미설치)

- `postgis`: 지리 공간 데이터 지원
- `pg_trgm`: 텍스트 유사도 검색
- `vector`: 벡터 데이터 타입 및 유사도 검색
- `http`: HTTP 클라이언트
- `pg_cron`: 작업 스케줄러

---

## 마이그레이션 히스토리

총 **34개**의 마이그레이션이 적용되었습니다:

### 주요 마이그레이션

| 버전           | 이름                                       | 설명                              |
| -------------- | ------------------------------------------ | --------------------------------- |
| 20251029025409 | create_shops_table                         | shops 테이블 최초 생성            |
| 20251030132014 | update_shops_address_structure             | 주소 구조 상세화                  |
| 20251101064529 | add_social_urls_column                     | SNS URL 지원 추가                 |
| 20251101075550 | migrate_tags_data_and_drop_column          | tags 배열 → 정규화 테이블         |
| 20251102121205 | create_shop_images_table                   | 매장 이미지 테이블 생성           |
| 20251112063454 | create_general_users_table                 | 일반 유저 테이블 생성             |
| 20251112063516 | create_admin_users_table                   | 관리자 테이블 생성                |
| 20251112071629 | add_approval_status_to_admin_users         | 관리자 승인 시스템 추가           |
| 20251112075833 | drop_users_table                           | 기존 users 테이블 삭제            |
| 20251113020912 | create_shop_owner_function                 | 매장 오너 생성 함수               |
| 20251114135555 | create_menus_table                         | 메뉴 마스터 테이블 생성           |
| 20251114135654 | insert_initial_menu_data                   | 초기 메뉴 데이터 삽입             |

---

## RLS (Row Level Security) 정책

모든 테이블에서 RLS가 **활성화**되어 있습니다.

### 공통 정책 패턴

1. **Public Read**: 검증된 데이터만 공개 조회 (`anon`, `authenticated`)
2. **Admin Full Access**: 관리자는 모든 작업 가능 (`role = 'admin'`, `'super_admin'`)
3. **Owner Restricted**: 오너는 자신의 매장만 관리 (`role = 'owner'`)
4. **Self Read**: 본인 정보는 조회 가능 (`auth.uid() = id`)

---

## Edge Functions

총 **26개**의 Edge Functions가 배포되어 있습니다.

### 카테고리별 Functions

1. **인증 (2개)**: `admin-auth-signup`, `admin-auth-signin`
2. **매장 관리 (5개)**: `admin-shops-*`, `owner-shops-*`
3. **태그 관리 (4개)**: `admin-tags-*`
4. **관리자 관리 (3개)**: `admin-users-*`
5. **메뉴 관리 (6개)**: `admin-menus-*`, `admin-menu-permissions-update`
6. **유저 제보 (4개)**: `admin-submissions-*`, `general-shops-*`

자세한 내용은 [Edge Functions 문서](./edge-functions.md)를 참조하세요.

---

## 데이터 무결성 및 제약 조건

### CHECK 제약조건

주요 테이블의 CHECK 제약조건:

- **shops.shop_type**: `'gacha'`, `'figure'`, `'both'`
- **shops.verification_status**: `'pending'`, `'verified'`, `'rejected'`
- **shops.data_source**: `'user_submit'`, `'admin_input'`, `'crawling'`, `'partner_api'`
- **admin_users.role**: `'super_admin'`, `'admin'`, `'owner'`
- **admin_users.approval_status**: `'pending'`, `'approved'`, `'rejected'`

### 외래 키 제약조건

모든 관계는 외래 키로 명시적으로 정의되어 있으며:
- `ON DELETE CASCADE`: 부모 삭제 시 자식도 삭제 (shop_tags, shop_images 등)
- `ON DELETE SET NULL`: 부모 삭제 시 NULL로 설정 (created_by, updated_by 등)
- `ON DELETE RESTRICT`: 부모 삭제 방지 (shops.verified_by 등)

---

## 성능 최적화

### 인덱스 전략

1. **복합 인덱스**: 자주 함께 사용되는 컬럼 (예: shops의 region_level1, region_level2)
2. **부분 인덱스**: 조건부 인덱스 (예: `WHERE is_deleted = false`)
3. **GIN 인덱스**: Full-text 검색 (예: shops.name, shops.road_address)
4. **외래 키 인덱스**: JOIN 성능 향상

---

## 관련 문서

- [테이블 스키마](./tables/) - 각 테이블 상세 문서
- [Edge Functions](./edge-functions.md) - API 엔드포인트 문서
- [마이그레이션 가이드](../guides/migration-guide.md) - 디렉토리 구조 변경 가이드

---

## 최근 업데이트

### 2025-11-14
- 메뉴 권한 시스템 추가 (`menus`, `admin_menu_permissions`)
- 동적 메뉴 권한 제어 가능

### 2025-11-13
- 매장 오너 시스템 구현 (`shop_owners`)
- 주소 구조 상세화 (sido, sigungu, road_address 등)

### 2025-11-12
- 사용자 테이블 분리 (`general_users`, `admin_users`)
- 관리자 승인 시스템 추가

### 2025-11-01
- 태그 시스템 정규화 (`tags`, `shop_tags`)
- SNS URL 지원 추가 (`social_urls`)

---

## 주의사항

1. **모든 테이블에 RLS 활성화**: 직접 SQL 실행 시 권한 고려 필요
2. **소프트 삭제 사용**: 대부분의 테이블에서 `is_deleted` 플래그 사용
3. **UUID 사용**: 모든 Primary Key는 UUID 타입
4. **timestamptz 사용**: 모든 시간 데이터는 타임존 포함
5. **JSONB 활용**: 유연한 데이터 구조에 JSONB 사용 (business_hours, social_urls, metadata 등)

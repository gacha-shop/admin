# 클라이언트 ↔ 백엔드 아키텍처

> Gacha Store Admin 프로젝트의 전체 아키텍처 구조 및 통신 방식

## 목차

- [아키텍처 개요](#아키텍처-개요)
- [기술 스택](#기술-스택)
- [시스템 구성도](#시스템-구성도)
- [인증 및 권한 흐름](#인증-및-권한-흐름)
- [데이터 흐름](#데이터-흐름)
- [서비스 레이어 구조](#서비스-레이어-구조)
- [보안 및 RLS](#보안-및-rls)
- [배포 아키텍처](#배포-아키텍처)

---

## 아키텍처 개요

본 프로젝트는 **하이브리드 아키텍처**를 채택하여 **Supabase Edge Functions**와 **Supabase Client SDK**를 혼합하여 사용합니다.

### 핵심 설계 원칙

1. **Edge Functions 우선**: 비즈니스 로직, 복잡한 쿼리, 권한 검증은 Edge Functions에서 처리
2. **Client SDK 보조**: 인증 세션 관리, 간단한 조회는 Client SDK 사용
3. **RLS 보안**: 모든 테이블에 Row Level Security 적용
4. **타입 안전성**: TypeScript로 전체 프로젝트 구현
5. **역할 기반 권한**: JWT Claims + 메뉴 기반 동적 권한 제어

---

## 기술 스택

### 프론트엔드 (Client)

| 카테고리        | 기술                                  | 역할                              |
| --------------- | ------------------------------------- | --------------------------------- |
| **프레임워크**  | React 19.1.1 + React Compiler         | UI 렌더링 및 상태 관리            |
| **빌드 도구**   | Vite 7.1                              | 개발 서버 및 빌드                 |
| **언어**        | TypeScript 5.9 (Strict Mode)         | 타입 안전성                       |
| **스타일링**    | Tailwind CSS + shadcn/ui              | UI 컴포넌트 및 디자인 시스템      |
| **상태 관리**   | React Hooks (useState, useEffect 등)  | 컴포넌트 상태 관리                |
| **라우팅**      | React Router v6                       | 페이지 라우팅                     |
| **API 클라이언트** | Supabase JS Client + Fetch API     | 백엔드 통신                       |

### 백엔드 (Server)

| 카테고리           | 기술                                  | 역할                              |
| ------------------ | ------------------------------------- | --------------------------------- |
| **플랫폼**         | Supabase                              | BaaS (Backend as a Service)       |
| **데이터베이스**   | PostgreSQL 17.6.1                     | 데이터 저장 및 관리               |
| **서버리스 함수**  | Supabase Edge Functions (Deno)        | 비즈니스 로직 처리                |
| **인증**           | Supabase Auth                         | 사용자 인증 및 세션 관리          |
| **보안**           | Row Level Security (RLS)              | 데이터베이스 레벨 권한 제어       |
| **스토리지**       | Supabase Storage                      | 파일 업로드 및 관리 (이미지 등)   |

---

## 시스템 구성도

### 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                    사용자 (브라우저)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              React Client (Vite Dev Server)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Components (Pages, Layout, UI)                      │   │
│  └────────────┬─────────────────────────────────────────┘   │
│               │                                              │
│               ▼                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Service Layer                                       │   │
│  │  - AdminShopService                                  │   │
│  │  - AdminAuthService                                  │   │
│  │  - MenuService                                       │   │
│  │  - AdminUserService                                  │   │
│  │  - OwnerShopService                                  │   │
│  │  - TagService                                        │   │
│  └────────┬──────────────────────────┬──────────────────┘   │
│           │                          │                       │
│           │                          │                       │
└───────────┼──────────────────────────┼───────────────────────┘
            │                          │
            │ Edge Functions API       │ Supabase Client SDK
            │ (Business Logic)         │ (Auth, Simple Queries)
            │                          │
            ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Platform                         │
│  ┌────────────────────┐        ┌────────────────────────┐   │
│  │  Edge Functions    │        │  Supabase Auth         │   │
│  │  (Deno Runtime)    │        │  - Session Management  │   │
│  │                    │        │  - JWT Token           │   │
│  │  - admin-shops-*   │        │  - User Management     │   │
│  │  - admin-auth-*    │        └────────────────────────┘   │
│  │  - admin-menus-*   │                                      │
│  │  - admin-users-*   │        ┌────────────────────────┐   │
│  │  - owner-shops-*   │        │  Storage               │   │
│  │  - general-*       │        │  - shop_images/        │   │
│  └─────────┬──────────┘        └────────────────────────┘   │
│            │                                                 │
│            │ Database Queries                                │
│            ▼                                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL 17.6.1                                   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  Tables (14개)                               │   │   │
│  │  │  - shops, admin_users, general_users         │   │   │
│  │  │  - tags, shop_tags, shop_images              │   │   │
│  │  │  - menus, admin_menu_permissions             │   │   │
│  │  │  - permissions, admin_permissions            │   │   │
│  │  │  - user_submissions, admin_audit_logs        │   │   │
│  │  │  - shop_owners                               │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  RLS Policies (모든 테이블 활성화)           │   │   │
│  │  │  - Public Read (검증된 데이터만)             │   │   │
│  │  │  - Admin Full Access                         │   │   │
│  │  │  - Owner Restricted (본인 매장만)            │   │   │
│  │  │  - Self Read (본인 정보만)                   │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 인증 및 권한 흐름

### 1. 회원가입 및 로그인 흐름

#### 회원가입 (Admin/Owner)

```
[Client]                      [Edge Function]              [Supabase Auth]         [PostgreSQL]
   │                                │                            │                      │
   │ POST /admin-auth-signup        │                            │                      │
   │ {email, password, role, ...}   │                            │                      │
   ├───────────────────────────────>│                            │                      │
   │                                │                            │                      │
   │                                │ 1. 입력 검증               │                      │
   │                                │ 2. 비즈니스 로직 처리      │                      │
   │                                │                            │                      │
   │                                │ signUp(email, password)    │                      │
   │                                ├───────────────────────────>│                      │
   │                                │                            │                      │
   │                                │                            │ INSERT auth.users    │
   │                                │                            ├─────────────────────>│
   │                                │                            │                      │
   │                                │                            │<─────────────────────┤
   │                                │                            │                      │
   │                                │<───────────────────────────┤                      │
   │                                │                            │                      │
   │                                │ INSERT admin_users         │                      │
   │                                │ (approval_status: pending) │                      │
   │                                ├────────────────────────────┼─────────────────────>│
   │                                │                            │                      │
   │                                │<───────────────────────────┼──────────────────────┤
   │                                │                            │                      │
   │<───────────────────────────────┤                            │                      │
   │ {user, message: "Waiting..."}  │                            │                      │
```

#### 로그인 (Admin/Owner)

```
[Client]                      [Edge Function]              [Supabase Auth]         [PostgreSQL]
   │                                │                            │                      │
   │ POST /admin-auth-signin        │                            │                      │
   │ {email, password}              │                            │                      │
   ├───────────────────────────────>│                            │                      │
   │                                │                            │                      │
   │                                │ signInWithPassword()       │                      │
   │                                ├───────────────────────────>│                      │
   │                                │                            │                      │
   │                                │                            │ SELECT auth.users    │
   │                                │                            ├─────────────────────>│
   │                                │                            │                      │
   │                                │<───────────────────────────┤                      │
   │                                │ {session, user}            │                      │
   │                                │                            │                      │
   │                                │ SELECT admin_users         │                      │
   │                                │ (approval_status 체크)     │                      │
   │                                ├────────────────────────────┼─────────────────────>│
   │                                │                            │                      │
   │                                │<───────────────────────────┼──────────────────────┤
   │                                │                            │                      │
   │                                │ ✅ approved만 로그인 허용  │                      │
   │                                │ ❌ pending/rejected 거부   │                      │
   │                                │                            │                      │
   │<───────────────────────────────┤                            │                      │
   │ {session, user}                │                            │                      │
   │                                │                            │                      │
   │ setSession(access_token,       │                            │                      │
   │            refresh_token)      │                            │                      │
   ├───────────────────────────────────────────────────────────>│                      │
```

### 2. 권한 검증 흐름 (JWT Claims)

```
[Client]                   [Edge Function]               [PostgreSQL RLS]
   │                             │                              │
   │ GET /admin-shops-list       │                              │
   │ Authorization: Bearer {JWT} │                              │
   ├────────────────────────────>│                              │
   │                             │                              │
   │                             │ 1. JWT 검증                  │
   │                             │    - role 확인               │
   │                             │    - approval_status 확인    │
   │                             │                              │
   │                             │ SELECT * FROM shops          │
   │                             │ (RLS 정책 자동 적용)         │
   │                             ├─────────────────────────────>│
   │                             │                              │
   │                             │                              │ ✅ RLS Policy Check:
   │                             │                              │    - role = 'admin' → ALL
   │                             │                              │    - role = 'owner' → 본인 매장만
   │                             │                              │    - anon → verified만
   │                             │                              │
   │                             │<─────────────────────────────┤
   │                             │ Filtered Results             │
   │                             │                              │
   │<────────────────────────────┤                              │
   │ {data: [...]}               │                              │
```

### 3. 역할별 접근 권한

| 역할           | 권한                                                           |
| -------------- | -------------------------------------------------------------- |
| `super_admin`  | • 모든 기능 접근<br>• 관리자 승인/거부<br>• 메뉴 관리<br>• 권한 관리 |
| `admin`        | • 매장 CRUD<br>• 태그 관리<br>• 유저 제보 검토                |
| `owner`        | • 본인 매장만 조회/수정<br>• 매장 이미지 업로드                |
| `authenticated`| • 검증된 매장 조회<br>• 매장 제보 (general_users)             |
| `anon`         | • 검증된 매장 조회만                                           |

---

## 데이터 흐름

### 1. 매장 생성 흐름 (Admin)

```typescript
// 1. 클라이언트에서 서비스 호출
const shop = await AdminShopService.createShop({
  name: "가챠샵 강남점",
  shop_type: "gacha",
  road_address: "서울특별시 강남구 테헤란로 123",
  sido: "서울특별시",
  tag_ids: ["tag-uuid-1", "tag-uuid-2"],
  // ...
});

// 2. Service Layer (admin-shop.service.ts)
static async createShop(input: ShopCreateInput): Promise<Shop> {
  return callEdgeFunction<Shop>("/admin-shops-create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// 3. callEdgeFunction - JWT 토큰 자동 추가
async function callEdgeFunction<T>(endpoint: string, options: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(`${EDGE_FUNCTION_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.access_token}`, // ✅ JWT 자동 추가
      "Content-Type": "application/json",
    },
  });

  return response.json();
}

// 4. Edge Function (admin-shops-create)
// - JWT 검증 (role = 'admin' or 'super_admin')
// - 비즈니스 로직 처리
// - shops 테이블 INSERT
// - tag_ids가 있으면 shop_tags INSERT
// - RLS 정책 자동 적용

// 5. PostgreSQL
// INSERT INTO shops (...) VALUES (...)
// RLS Policy: admin/super_admin만 INSERT 가능

// 6. Response
// {
//   success: true,
//   data: { id: "...", name: "가챠샵 강남점", ... }
// }
```

### 2. 메뉴 기반 권한 조회 흐름

```typescript
// 1. 로그인 후 메뉴 조회
const menus = await MenuService.getAdminMenus();

// 2. Edge Function에서 처리
// SELECT m.* FROM menus m
// INNER JOIN admin_menu_permissions amp ON m.id = amp.menu_id
// WHERE amp.admin_id = auth.uid()
//   AND m.is_active = true
// ORDER BY m.display_order

// 3. 계층 구조로 변환하여 반환
// [
//   {
//     id: "1",
//     code: "dashboard",
//     name: "대시보드",
//     children: []
//   },
//   {
//     id: "2",
//     code: "shops",
//     name: "매장 관리",
//     children: [
//       { id: "3", code: "shops.list", name: "매장 목록" },
//       { id: "4", code: "shops.create", name: "매장 등록" }
//     ]
//   }
// ]

// 4. UI에서 메뉴 렌더링
menus.forEach(menu => {
  // 권한이 있는 메뉴만 표시
  if (menu.children && menu.children.length > 0) {
    // 하위 메뉴 표시
  }
});
```

---

## 서비스 레이어 구조

### Service Layer 아키텍처

```
src/services/
├── admin-shop.service.ts       # 관리자 매장 관리
│   ├── createShop()
│   ├── updateShop()
│   ├── deleteShop()
│   ├── listShops()
│   └── getShop()
│
├── admin-auth.service.ts       # 관리자 인증
│   ├── signUp()
│   ├── signIn()
│   ├── signOut()
│   ├── getCurrentUser()
│   ├── isAuthenticated()
│   └── hasRole()
│
├── menu.service.ts             # 메뉴 관리
│   ├── getAdminMenus()
│   ├── getAllMenus()
│   ├── createMenu()
│   ├── updateMenu()
│   ├── deleteMenu()
│   └── updateAdminMenuPermissions()
│
├── admin-user.service.ts       # 관리자 사용자 관리
│   ├── getAllAdminUsers()
│   ├── approveAdminUser()
│   └── rejectAdminUser()
│
├── owner-shop.service.ts       # 오너 매장 관리
│   ├── getOwnShop()
│   └── updateOwnShop()
│
└── tag.api.ts                  # 태그 관리
    ├── getTags()
    ├── createTag()
    ├── updateTag()
    └── deleteTag()
```

### 공통 유틸리티 함수

```typescript
// callEdgeFunction - Edge Functions 호출 헬퍼
export async function callEdgeFunction<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 1. 세션에서 JWT 토큰 가져오기
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("로그인이 필요합니다");
  }

  // 2. Edge Function 호출
  const response = await fetch(`${EDGE_FUNCTION_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.access_token}`, // JWT 자동 추가
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // 3. 응답 처리
  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "API 호출 실패");
  }

  return result.data as T;
}
```

---

## 보안 및 RLS

### 1. Row Level Security (RLS) 정책

모든 테이블에 RLS가 활성화되어 있으며, JWT Claims 기반으로 권한 검증:

#### shops 테이블 RLS 예시

```sql
-- 1. Public Read (검증된 매장만 공개)
CREATE POLICY "public_read_verified_shops"
ON shops FOR SELECT
TO anon, authenticated
USING (
  verification_status = 'verified'
  AND is_deleted = false
);

-- 2. Admin Full Access
CREATE POLICY "admin_full_access"
ON shops FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' IN ('admin', 'super_admin')
);

-- 3. Owner Restricted (본인 매장만)
CREATE POLICY "owner_own_shops_only"
ON shops FOR SELECT, UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'owner'
  AND id IN (
    SELECT shop_id FROM shop_owners
    WHERE owner_id = auth.uid()
  )
);
```

### 2. JWT Claims 구조

```json
{
  "sub": "user-uuid",
  "email": "admin@example.com",
  "role": "admin",
  "approval_status": "approved",
  "aud": "authenticated",
  "exp": 1234567890
}
```

### 3. Edge Functions 보안

```typescript
// Edge Function 내부에서 JWT 검증
import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  {
    global: {
      headers: { Authorization: req.headers.get('Authorization')! },
    },
  }
);

// 현재 유저 정보 가져오기 (JWT 자동 검증)
const { data: { user }, error } = await supabaseClient.auth.getUser();

if (error || !user) {
  return new Response(
    JSON.stringify({ success: false, error: '인증 실패' }),
    { status: 401 }
  );
}

// 역할 확인
const { data: adminUser } = await supabaseClient
  .from('admin_users')
  .select('role, approval_status')
  .eq('id', user.id)
  .single();

if (adminUser.approval_status !== 'approved') {
  return new Response(
    JSON.stringify({ success: false, error: '승인 대기 중' }),
    { status: 403 }
  );
}
```

---

## 배포 아키텍처

### 프로덕션 환경

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel / Netlify                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  React App (Static Hosting)                       │  │
│  │  - Build Output: dist/                            │  │
│  │  - HTTPS 자동 설정                                 │  │
│  │  - CDN 배포                                        │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase Cloud (Managed)                    │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │  Edge Functions  │  │  PostgreSQL 17.6.1       │    │
│  │  (Global CDN)    │  │  (ap-northeast-2 Seoul)  │    │
│  └──────────────────┘  └──────────────────────────┘    │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │  Auth            │  │  Storage                 │    │
│  │  (JWT Tokens)    │  │  (shop_images/)          │    │
│  └──────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 환경 변수 설정

```bash
# .env.production
VITE_SUPABASE_URL=https://kabndipxpxxhwqljhsdv.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 주요 특징 및 장점

### 1. 하이브리드 아키텍처의 장점

✅ **비즈니스 로직 중앙화**
- Edge Functions에서 복잡한 로직 처리
- 클라이언트는 얇게 유지 (Thin Client)
- 로직 변경 시 클라이언트 재배포 불필요

✅ **보안 강화**
- RLS로 데이터베이스 레벨 보안
- JWT Claims 기반 권한 검증
- Edge Functions에서 추가 검증 레이어

✅ **타입 안전성**
- TypeScript 전체 적용
- 인터페이스 정의로 계약 명확화
- 컴파일 타임 에러 검출

### 2. Edge Functions vs Client SDK 선택 기준

| 상황                          | 사용 방식              | 이유                                   |
| ----------------------------- | ---------------------- | -------------------------------------- |
| 매장 생성/수정/삭제           | Edge Functions         | 복잡한 비즈니스 로직, 여러 테이블 조작 |
| 관리자 승인 처리              | Edge Functions         | 트랜잭션, shop_owners 연결 필요        |
| 로그인/회원가입               | Edge Functions         | 추가 검증, Audit 로그 필요             |
| 현재 유저 정보 조회           | Client SDK             | 간단한 조회, RLS로 보안 충분           |
| 세션 관리 (로그아웃 등)       | Client SDK             | Supabase Auth 기본 기능                |

### 3. 성능 최적화

- **Edge Functions**: Deno Runtime, 글로벌 CDN 배포
- **React Compiler**: 자동 메모이제이션
- **RLS 인덱스**: 자주 사용되는 조건에 부분 인덱스 생성
- **Lazy Loading**: 페이지별 코드 스플리팅

---

## 관련 문서

- [Database Schema Overview](../database/schema-overview.md) - 데이터베이스 전체 구조
- [Edge Functions API](../database/edge-functions.md) - API 엔드포인트 문서
- [Admin Authentication](../features/admin-authentication.md) - 인증 상세 설명
- [Code Guidelines](../guides/code-guidelines.md) - 코딩 규칙

---

## 최근 업데이트

- **2025-11-19**: 초기 문서 작성
- 하이브리드 아키텍처 구조 정리
- 인증 및 권한 흐름 다이어그램 추가
- 서비스 레이어 구조 상세화

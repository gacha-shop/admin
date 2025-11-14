# Auth Edge Function 구현 완료

## 구현 개요

**하이브리드 아키텍처**: Edge Function (비즈니스 로직) + Supabase Auth (JWT, 세션 관리)

- ✅ Edge Function으로 회원가입/로그인 비즈니스 로직 처리
- ✅ Supabase Auth는 JWT 발급/검증, 세션 관리만 담당
- ✅ 자체 서버 마이그레이션 시 90% 코드 재사용 가능

---

## 구현된 파일 목록

### Backend (gacha-store-backend)

```
supabase/functions/
├── _shared/
│   ├── services/
│   │   ├── auth.service.ts              ✅ 새로 추가 (핵심 비즈니스 로직)
│   │   └── audit.service.ts             ✅ 새로 추가 (Audit 로깅)
│   │
│   ├── repositories/
│   │   └── admin-user.repository.ts     ✅ 새로 추가 (DB 접근)
│   │
│   ├── types/
│   │   └── auth.types.ts                ✅ 확장 (SignUpData, AdminUser 등)
│   │
│   └── utils/
│       ├── validation.ts                ✅ 확장 (이메일, 비밀번호, 전화번호 검증)
│       ├── response.ts                  ✅ 새로 추가
│       ├── cors.ts                      ✅ 새로 추가
│       └── email.ts                     ✅ 새로 추가
│
├── admin-auth-signup/
│   └── index.ts                         ✅ 새로 추가
│
└── admin-auth-signin/
    └── index.ts                         ✅ 새로 추가
```

### Frontend (gacha-store-admin)

```
src/services/
└── admin-auth.service.ts                ✅ 수정 (Edge Function API 호출)
```

---

## API 엔드포인트

### 1. 회원가입

**Endpoint:** `POST /functions/v1/admin-auth-signup`

**Request Body:**
```typescript
{
  email: string;
  password: string;
  full_name: string;
  role?: "admin" | "owner";
  // Owner 전용
  phone?: string;
  shop_id?: string;
  business_license?: string;
  business_name?: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    user: AdminUser,
    message: "회원가입이 완료되었습니다. 슈퍼 관리자의 승인을 기다려주세요."
  }
}
```

**처리 흐름:**
1. 입력 검증 (이메일, 비밀번호, 이름, 전화번호 등)
2. Supabase Auth로 유저 생성 (JWT 자동 발급)
3. admin_users 또는 shop_owners 테이블 생성
4. Audit 로그 기록
5. 환영 이메일 발송 (TODO)

### 2. 로그인

**Endpoint:** `POST /functions/v1/admin-auth-signin`

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    user: AdminUser,
    message: "로그인 성공"
  }
}
```

**처리 흐름:**
1. 입력 검증
2. Supabase Auth로 로그인 (JWT 검증)
3. admin_users 테이블 조회
4. 상태 검증 (active, approved)
5. last_login_at 업데이트
6. Audit 로그 기록

---

## 프론트엔드 사용법

### 회원가입

```typescript
import { AdminAuthService } from "@/services/admin-auth.service";

const { user, error } = await AdminAuthService.signUp({
  email: "admin@example.com",
  password: "password123",
  full_name: "홍길동",
  role: "admin",
});

if (error) {
  console.error(error.message);
} else {
  console.log("회원가입 성공:", user);
}
```

### 로그인

```typescript
const { user, error } = await AdminAuthService.signIn({
  email: "admin@example.com",
  password: "password123",
});

if (error) {
  console.error(error.message);
} else {
  console.log("로그인 성공:", user);
}
```

### 로그아웃 (기존 유지)

```typescript
const { error } = await AdminAuthService.signOut();
```

### 현재 유저 조회 (기존 유지)

```typescript
const { user, error } = await AdminAuthService.getCurrentUser();
```

---

## 배포 방법

### Backend Edge Functions 배포

```bash
cd /Users/kyusik/Desktop/gacha-store-backend

# 회원가입 Edge Function 배포
supabase functions deploy admin-auth-signup

# 로그인 Edge Function 배포
supabase functions deploy admin-auth-signin
```

### 환경변수 확인

`.env.local` 파일에 다음 변수가 있는지 확인:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 테스트 시나리오

### 1. Admin 회원가입

```bash
curl -X POST https://your-project.supabase.co/functions/v1/admin-auth-signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "test1234",
    "full_name": "테스트 관리자",
    "role": "admin"
  }'
```

**예상 결과:**
- ✅ admin_users 테이블에 유저 생성
- ✅ approval_status = "pending"
- ✅ Audit 로그 기록

### 2. Owner 회원가입

```bash
curl -X POST https://your-project.supabase.co/functions/v1/admin-auth-signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@test.com",
    "password": "test1234",
    "full_name": "테스트 사장님",
    "role": "owner",
    "phone": "010-1234-5678",
    "shop_id": "existing-shop-uuid"
  }'
```

**예상 결과:**
- ✅ shop_owners 테이블에 유저 생성
- ✅ shop과 연결
- ✅ Audit 로그 기록

### 3. 로그인 (승인 대기 상태)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/admin-auth-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "test1234"
  }'
```

**예상 결과:**
- ❌ "계정 승인 대기 중입니다" 에러

### 4. Super Admin이 승인 후 재로그인

**승인 처리:**
```sql
UPDATE admin_users
SET approval_status = 'approved', approved_at = NOW(), approved_by = 'super-admin-id'
WHERE email = 'admin@test.com';
```

**재로그인:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/admin-auth-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "test1234"
  }'
```

**예상 결과:**
- ✅ 로그인 성공
- ✅ last_login_at 업데이트
- ✅ Audit 로그 기록

---

## 에러 처리

### 회원가입 에러

| 에러 메시지 | 원인 | 해결 방법 |
|-----------|------|----------|
| "이미 사용 중인 이메일입니다" | 중복 이메일 | 다른 이메일 사용 |
| "Email must be less than 255 characters" | 이메일 너무 김 | 짧은 이메일 사용 |
| "Password must be at least 8 characters" | 비밀번호 너무 짧음 | 8자 이상 입력 |
| "Full name must be at least 2 characters" | 이름 너무 짧음 | 2자 이상 입력 |
| "매장 ID는 필수입니다" | Owner인데 shop_id 없음 | shop_id 제공 |
| "전화번호는 필수입니다" | Owner인데 phone 없음 | 전화번호 제공 |

### 로그인 에러

| 에러 메시지 | 원인 | 해결 방법 |
|-----------|------|----------|
| "이메일 또는 비밀번호가 올바르지 않습니다" | 잘못된 인증 정보 | 올바른 정보 입력 |
| "관리자 권한이 필요합니다" | admin_users 테이블에 없음 | 회원가입 필요 |
| "계정이 비활성화되었습니다" | status = "suspended" | 관리자 문의 |
| "계정 승인 대기 중입니다" | approval_status = "pending" | Super Admin 승인 대기 |
| "계정이 거부되었습니다" | approval_status = "rejected" | 관리자 문의 |

---

## 자체 서버 마이그레이션 가이드

### 재사용 가능한 코드 (90%)

다음 파일들은 자체 서버로 거의 그대로 이식 가능:

1. **AuthService** (`auth.service.ts`) - 90% 재사용
2. **AdminUserRepository** (`admin-user.repository.ts`) - 80% 재사용
3. **AuditService** (`audit.service.ts`) - 100% 재사용
4. **Validation Utils** (`validation.ts`) - 100% 재사용
5. **Email Utils** (`email.ts`) - 100% 재사용
6. **Types** (`auth.types.ts`) - 100% 재사용

### 교체가 필요한 코드 (10%)

1. **Supabase Auth 호출 부분** (AuthService 내부)
   ```typescript
   // Before: Supabase Auth
   await this.supabase.auth.admin.createUser({ email, password });

   // After: Custom Auth (bcrypt + JWT)
   const hashedPassword = await bcrypt.hash(password, 10);
   const user = await prisma.user.create({ data: { email, password: hashedPassword } });
   const token = jwt.sign({ userId: user.id }, SECRET);
   ```

2. **HTTP Handler** (Edge Function → Express)
   ```typescript
   // Before: Edge Function
   serve(async (req) => { ... });

   // After: Express Route
   app.post('/auth/signup', async (req, res) => { ... });
   ```

3. **Database Client** (Supabase → Prisma)
   ```typescript
   // Before: Supabase
   this.supabase.from('admin_users').insert(...)

   // After: Prisma
   prisma.adminUser.create({ data: ... })
   ```

**마이그레이션 소요 시간: 3-4일**

---

## 다음 단계

### 1. 추가 Edge Functions (선택사항)

- `admin-auth-signout`: 로그아웃 (현재는 클라이언트만)
- `admin-auth-refresh`: 토큰 갱신
- `admin-auth-reset-password`: 비밀번호 재설정

### 2. Audit Logs 테이블 생성 (선택사항)

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  changes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. 이메일 서비스 연동 (선택사항)

- SendGrid, AWS SES 등 연동
- `email.ts`에서 실제 이메일 발송 구현

---

## 주의사항

### 1. CORS 설정

Edge Function에서 CORS가 자동으로 처리됩니다:
```typescript
// _shared/utils/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### 2. 세션 관리

- Supabase Auth SDK가 자동으로 세션 관리
- JWT는 localStorage에 자동 저장
- `getCurrentUser()`는 기존 방식 그대로 사용

### 3. RPC 함수 의존성

현재 다음 RPC 함수에 의존:
- `create_admin_user`
- `create_shop_owner`

이 함수들이 DB에 있어야 정상 동작합니다.

---

**작성일:** 2025-11-14
**작성자:** Claude Code
**문서 버전:** 1.0

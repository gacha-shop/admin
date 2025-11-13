# 어드민 인증 시스템

> 작성일: 2025-11-12

## 개요

Gacha Store Admin의 어드민 인증 시스템은 `admin_users` 테이블을 사용하여 관리자와 사장님을 위한 전용 인증을 제공합니다.

---

## 아키텍처

### 데이터베이스 구조

```
auth.users (Supabase 관리)
    └── admin_users (어드민 전용)
        ├── id (FK → auth.users.id)
        ├── email
        ├── full_name
        ├── role (super_admin, admin, owner)
        └── status (active, suspended, deleted)
```

### 인증 흐름

#### 회원가입

1. 사용자가 이메일, 비밀번호, 이름, 역할을 입력
2. `supabase.auth.signUp()` → auth.users 테이블에 생성
3. `create_admin_user()` RPC 함수 호출 → admin_users 테이블에 생성
4. 자동 로그아웃 후 로그인 페이지로 이동

#### 로그인

1. 사용자가 이메일, 비밀번호 입력
2. `supabase.auth.signInWithPassword()` → 인증 확인
3. admin_users 테이블에서 사용자 조회
4. status가 'active'인지 확인
5. last_login_at 업데이트
6. 대시보드로 이동

---

## 주요 기능

### 1. AdminAuthService

**위치**: `src/services/admin-auth.service.ts`

```typescript
// 회원가입
AdminAuthService.signUp({
  email: "admin@example.com",
  password: "password123",
  full_name: "홍길동",
  role: "admin" // or "owner"
})

// 로그인
AdminAuthService.signIn({
  email: "admin@example.com",
  password: "password123"
})

// 로그아웃
AdminAuthService.signOut()

// 현재 사용자 조회
AdminAuthService.getCurrentUser()

// 인증 확인
AdminAuthService.isAuthenticated()

// 역할 확인
AdminAuthService.hasRole(['super_admin', 'admin'])
```

### 2. AuthContext

**위치**: `src/contexts/AuthContext.tsx`

전역 인증 상태 관리:

```typescript
const { user, isLoading, signOut } = useAuth();
```

### 3. ProtectedRoute

**위치**: `src/components/auth/ProtectedRoute.tsx`

인증되지 않은 사용자의 접근을 차단하고 로그인 페이지로 리다이렉트합니다.

---

## RLS (Row Level Security) 정책

### admin_users 테이블

```sql
-- 본인 프로필 조회
CREATE POLICY "Admins can view own profile"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);

-- 본인 프로필 수정
CREATE POLICY "Admins can update own profile"
  ON admin_users FOR UPDATE
  USING (auth.uid() = id);

-- 슈퍼 관리자는 모든 어드민 조회
CREATE POLICY "Super admins can view all admins"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
        AND role = 'super_admin'
        AND status = 'active'
    )
  );

-- 슈퍼 관리자는 어드민 생성
CREATE POLICY "Super admins can create admins"
  ON admin_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
        AND role = 'super_admin'
        AND status = 'active'
    )
  );
```

---

## RPC 함수

### create_admin_user

**목적**: 회원가입 시 RLS를 우회하여 admin_users에 레코드를 생성합니다.

```sql
CREATE OR REPLACE FUNCTION public.create_admin_user(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT,
  user_role TEXT DEFAULT 'admin'
)
RETURNS json
```

**사용 예시**:

```typescript
const { data, error } = await supabase.rpc('create_admin_user', {
  user_id: authUser.id,
  user_email: 'admin@example.com',
  user_full_name: '홍길동',
  user_role: 'admin'
});
```

---

## 역할 (Roles)

### super_admin

- 모든 관리자 계정 생성/조회/수정
- 모든 상점 관리
- 시스템 설정 변경

### admin

- 모든 상점 관리
- 태그 관리
- 일반 사용자 관리

### owner

- 본인 소유 상점만 관리
- 상점 정보 수정
- 제한된 권한

---

## 테스트 방법

### 1. 회원가입 테스트

1. `/signup` 페이지 접속
2. 정보 입력:
   - 이메일: test-admin@example.com
   - 이름: 테스트 관리자
   - 역할: 관리자 (Admin)
   - 비밀번호: test1234
   - 비밀번호 확인: test1234
3. "회원가입" 버튼 클릭
4. 성공 메시지 확인
5. 2초 후 로그인 페이지로 자동 이동

### 2. 로그인 테스트

1. `/login` 페이지 접속
2. 회원가입한 이메일과 비밀번호 입력
3. "로그인" 버튼 클릭
4. 대시보드로 리다이렉트 확인
5. GNB에 사용자 정보 표시 확인

### 3. 보호된 라우트 테스트

1. 로그아웃 상태에서 `/` 접속 시도
2. 자동으로 `/login`으로 리다이렉트 확인

### 4. 로그아웃 테스트

1. GNB의 "로그아웃" 버튼 클릭
2. 로그인 페이지로 리다이렉트 확인

---

## 트러블슈팅

### 문제 1: 회원가입 후 admin_users에 데이터가 없음

**원인**: RLS 정책이 새 사용자의 INSERT를 차단

**해결**: `create_admin_user` RPC 함수 사용 (SECURITY DEFINER로 RLS 우회)

### 문제 2: 회원가입 후 화면이 멈춤

**원인**:
1. 에러 발생 시 finally 블록에서 `setIsLoading(false)`가 실행되지 않음
2. Supabase가 회원가입 시 자동 로그인하여 AuthContext가 활성화됨

**해결**:
1. 에러 핸들링 개선
2. 회원가입 성공 후 명시적으로 `signOut()` 호출

### 문제 3: 기존 auth 유저가 admin_users에 없음

**해결 방법**:

```sql
-- 1. auth에만 있는 사용자 확인
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN admin_users adu ON au.id = adu.id
WHERE adu.id IS NULL;

-- 2. 수동으로 admin_users에 추가 (슈퍼 관리자 권한 필요)
INSERT INTO admin_users (id, email, full_name, role, status)
VALUES (
  '사용자-UUID',
  'email@example.com',
  '사용자 이름',
  'admin',
  'active'
);
```

---

## 보안 고려사항

1. **비밀번호 정책**: 최소 6자 이상 (Supabase 기본값)
2. **이메일 확인**: 현재 비활성화 (개발 환경)
3. **MFA**: admin_users 테이블에 mfa_enabled 필드 준비됨 (Phase 2)
4. **세션 관리**: Supabase가 자동으로 JWT 토큰 관리
5. **RLS**: 모든 테이블에 RLS 활성화

---

## 향후 개선사항

- [ ] 이메일 인증 활성화
- [ ] MFA (Multi-Factor Authentication) 구현
- [ ] 비밀번호 재설정 기능
- [ ] 로그인 시도 횟수 제한
- [ ] 감사 로그 (admin_audit_logs) 자동 기록
- [ ] 역할 기반 권한 시스템 (admin_permissions) 구현

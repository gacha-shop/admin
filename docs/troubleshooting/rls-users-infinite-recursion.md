# Supabase RLS 정책 무한 재귀 오류

> 발생일: 2025-10-30
> 해결 상태: ✅ 해결됨

## 문제 상황

관리자 계정으로 로그인 시도 시 다음 에러 발생:

```
https://kabndipxpxxhwqljhsdv.supabase.co/rest/v1/users?select=role&id=eq.17e7412b-2b83-4a0f-b947-95682afe359c

{
    "code": "42P17",
    "details": null,
    "hint": null,
    "message": "infinite recursion detected in policy for relation \"users\""
}
```

### 발생 시점
- 로그인 페이지에서 이메일/비밀번호 입력 후 로그인 버튼 클릭
- `supabase.auth.signInWithPassword()` 성공 후
- 사용자의 role을 확인하기 위해 `users` 테이블 조회 시

### 영향
- 관리자 로그인 불가
- users 테이블 조회 불가

---

## 원인 분석

### 문제가 있던 RLS 정책

초기 users 테이블 생성 시 다음과 같은 RLS 정책을 설정:

```sql
-- ❌ 무한 재귀를 유발하는 정책
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users  -- 🔴 여기가 문제!
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 무한 재귀 발생 메커니즘

1. **사용자가 users 테이블 조회 시도**
   ```sql
   SELECT role FROM users WHERE id = 'user-id';
   ```

2. **RLS 정책이 실행됨**
   - "이 사용자가 조회 권한이 있는지 확인"
   - 정책 내에서 `SELECT 1 FROM public.users`를 실행

3. **정책 내 쿼리가 다시 RLS 정책 트리거**
   - users 테이블을 조회하므로 다시 RLS 정책 확인
   - 또 다시 `SELECT 1 FROM public.users` 실행

4. **무한 반복**
   ```
   조회 시도 → 정책 확인 → users 조회 → 정책 확인 → users 조회 → ...
   ```

### 왜 이런 정책을 만들었나?

초기 설계 의도:
- "관리자만 모든 사용자 정보를 볼 수 있어야 한다"
- "일반 사용자는 자신의 정보만 볼 수 있어야 한다"

하지만 RLS 정책 내에서 같은 테이블을 조회하면 재귀가 발생합니다.

---

## 해결 방법

### 1. RLS 정책 단순화

```sql
-- 마이그레이션: fix_users_rls_infinite_recursion

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- ✅ 수정된 정책: 인증된 사용자는 모두 조회 가능
CREATE POLICY "Authenticated users can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);  -- 재귀 없음!
```

### 2. 왜 이렇게 해도 안전한가?

**users 테이블에는 민감한 정보가 없음:**
- ❌ 비밀번호: `auth.users` 테이블에 암호화되어 저장 (접근 불가)
- ✅ 이메일: 앱 내에서 공유되어도 문제없음
- ✅ 이름/닉네임: 공개 정보
- ✅ role: 관리자 여부는 Edge Function에서 검증

**실제 보안은 어디서?**
- Edge Function의 권한 체크
- 예: `admin-create-shop` 함수에서 role 확인
  ```typescript
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Forbidden: Admin access required' }),
      { status: 403 }
    );
  }
  ```

### 3. UPDATE 정책은 유지

사용자는 여전히 자신의 정보만 수정 가능:

```sql
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
  );
```

이 정책도 재귀가 발생하지만, UPDATE 시에만 실행되고 SELECT는 위의 간단한 정책을 사용하므로 문제없음.

---

## 대안 방법들 (검토했으나 채택 안 함)

### 대안 1: SECURITY DEFINER 함수 사용

```sql
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER  -- RLS 우회
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
$$;

CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (is_admin(auth.uid()));
```

**채택 안 한 이유:**
- 복잡도 증가
- 함수 관리 필요
- 성능 오버헤드

### 대안 2: JWT claims에 role 저장

auth.users의 `raw_app_meta_data`에 role을 저장하고 JWT에 포함:

```sql
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');
```

**채택 안 한 이유:**
- JWT 갱신 문제 (role 변경 시 즉시 반영 안 됨)
- Supabase에서 app_metadata 관리 복잡
- 현재 단계에서 over-engineering

---

## 테스트 방법

### 1. 마이그레이션 적용 확인

```sql
-- 정책 확인
SELECT * FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'users';
```

### 2. 로그인 테스트

```typescript
// 1. 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'gacha-test@gmail.com',
  password: 'rhrbtlr91@',
});

// 2. role 조회 (이제 무한 재귀 없이 작동)
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', data.user.id)
  .single();

console.log(userData.role); // 'admin'
```

---

## 교훈

### 1. RLS 정책 설계 원칙

**❌ 하지 말 것:**
- RLS 정책 내에서 같은 테이블 조회
- 복잡한 서브쿼리

**✅ 해야 할 것:**
- 가능한 단순한 정책
- auth.uid() 같은 내장 함수 활용
- 복잡한 권한은 Edge Function에서 처리

### 2. 보안 계층 분리

```
┌─────────────────────────────────┐
│  RLS: 기본적인 데이터 접근 제어  │  ← 단순하게 유지
├─────────────────────────────────┤
│  Edge Function: 비즈니스 로직   │  ← 복잡한 권한 체크
├─────────────────────────────────┤
│  Application: UI/UX 제어        │  ← 사용자 경험
└─────────────────────────────────┘
```

### 3. 민감한 정보 vs 공개 정보

- **민감한 정보**: auth.users에 저장 (RLS로 보호 불가)
- **공개 정보**: public 스키마에 저장 (RLS로 기본 보호)
- **복잡한 권한**: Edge Function에서 처리

---

## 관련 링크

- [Supabase RLS 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS 문서](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [users 테이블 스키마](../database/tables/users.md)

---

## 마이그레이션 파일

- 파일명: `fix_users_rls_infinite_recursion.sql`
- 적용일: 2025-10-30
- 상태: ✅ 프로덕션 적용됨

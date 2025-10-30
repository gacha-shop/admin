# Supabase RLS: shops 테이블 INSERT 권한 거부

> 발생일: 2025-10-30
> 해결 상태: ✅ 해결됨

## 문제 상황

관리자가 스토어 등록 모달에서 스토어 생성 시도 시 다음 에러 발생:

```
POST https://kabndipxpxxhwqljhsdv.supabase.co/functions/v1/admin-create-shop

{
    "error": "new row violates row-level security policy for table \"shops\""
}
```

### 요청 데이터 (payload)

```json
{
    "name": "애니메이트 잠실롯데점",
    "shop_type": "gacha",
    "description": "첫 데이터!!\n찾아가는길\n잠실역 2호선 > 롯데월드 어드벤처 정문 매표소 > 감성교복 > 애니메이트",
    "phone": "070-4131-7343",
    "website_url": "https://x.com/animate_lotte",
    "address_full": "서울 송파구 올림픽로 240 쇼핑몰동 B1층 29호",
    "postal_code": "05554",
    "region_level1": "서울시",
    "region_level2": "송파구",
    "region_level3": "잠실동",
    "latitude": 37.513731,
    "longitude": 127.103828,
    "is_24_hours": false,
    "gacha_machine_count": 15,
    "verification_status": "pending",
    "data_source": "admin_input",
    "thumbnail_url": "https://...",
    "admin_notes": "첫 테스트입니다."
}
```

### 발생 시점
- 로그인 성공 후
- 스토어 등록 모달에서 정보 입력
- "등록" 버튼 클릭
- Edge Function (`admin-create-shop`)에서 shops 테이블에 INSERT 시도

### 영향
- 관리자가 스토어 생성 불가
- Edge Function이 정상 동작하지만 DB INSERT 단계에서 차단

---

## 원인 분석

### shops 테이블의 RLS 설정 상태

shops 테이블은 RLS가 활성화되어 있었지만, **INSERT 정책이 없었음**:

```sql
-- RLS 활성화 확인
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- 기존 정책들 (SELECT만 있음)
1. "Public users can view verified shops" (SELECT)
2. "Users can view shops they favorited" (SELECT)
3. "Admins have full access" (모든 작업 - 하지만 제대로 작동 안 함)
```

### 문제의 핵심

초기 shops 테이블 생성 시 다음과 같은 RLS 정책을 만들었을 것으로 추정:

```sql
-- ❌ 이 정책이 있다고 생각했지만 실제로는 없었음
CREATE POLICY "Admins have full access"
  ON public.shops
  FOR ALL  -- SELECT, INSERT, UPDATE, DELETE 모두
  TO authenticated
  USING (...)
  WITH CHECK (...);
```

하지만 실제로는:
- **SELECT 정책만 존재**
- **INSERT, UPDATE, DELETE 정책이 누락**

### PostgreSQL RLS 동작 방식

RLS가 활성화된 테이블에서:
1. 명시적인 정책이 없으면 **모든 작업 거부** (기본값)
2. `FOR ALL`은 실제로 각 작업별 정책을 만들어야 함
3. INSERT는 `WITH CHECK` 절이 필요
4. UPDATE는 `USING`과 `WITH CHECK` 둘 다 필요

---

## 해결 방법

### 1. INSERT 정책 추가

```sql
-- 마이그레이션: add_shops_insert_policy

CREATE POLICY "Admins can insert shops"
  ON public.shops
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

### 2. UPDATE 정책 추가

```sql
CREATE POLICY "Admins can update shops"
  ON public.shops
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

### 3. DELETE 정책 추가 (소프트 삭제용)

```sql
CREATE POLICY "Admins can delete shops"
  ON public.shops
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

### 주의: users 테이블 조회는 왜 안전한가?

이전 문제([rls-users-infinite-recursion.md](./rls-users-infinite-recursion.md))에서 users 테이블의 RLS를 수정했기 때문:

```sql
-- users 테이블: 인증된 사용자는 모두 조회 가능
CREATE POLICY "Authenticated users can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);
```

따라서 shops RLS 정책 내에서 users 테이블을 조회해도:
- ✅ 무한 재귀 없음
- ✅ 정상 작동
- ✅ role 확인 가능

---

## 정책 비교

### INSERT vs UPDATE vs DELETE

| 작업 | USING 절 | WITH CHECK 절 | 설명 |
|------|----------|---------------|------|
| **SELECT** | ✅ 필수 | ❌ 불필요 | 어떤 행을 읽을 수 있는가? |
| **INSERT** | ❌ 불필요 | ✅ 필수 | 삽입할 새 행이 유효한가? |
| **UPDATE** | ✅ 필수 | ✅ 필수 | 어떤 행을 수정할 수 있고, 수정 후 행이 유효한가? |
| **DELETE** | ✅ 필수 | ❌ 불필요 | 어떤 행을 삭제할 수 있는가? |

### INSERT 정책의 WITH CHECK

```sql
CREATE POLICY "Admins can insert shops"
  FOR INSERT
  WITH CHECK (
    -- 삽입하려는 새 행이 이 조건을 만족해야 함
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

**의미:**
- "이 행을 삽입하려는 사람이 관리자인가?"
- 관리자가 아니면 INSERT 거부

---

## Edge Function과 RLS의 관계

### Edge Function 코드

```typescript
// admin-create-shop Edge Function

// 1. 인증 확인
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401 }
  );
}

// 2. 관리자 권한 확인 (Edge Function 레벨)
const { data: userData, error: userError } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single();

if (userError || userData?.role !== 'admin') {
  return new Response(
    JSON.stringify({ error: 'Forbidden: Admin access required' }),
    { status: 403 }
  );
}

// 3. shops 테이블에 INSERT (RLS 레벨에서도 체크)
const { data: shop, error: insertError } = await supabase
  .from('shops')
  .insert({
    name: body.name,
    // ...
  })
  .select()
  .single();
```

### 이중 체크의 이유

| 레벨 | 목적 | 장점 |
|------|------|------|
| **Edge Function** | 명시적인 권한 체크 | - 명확한 에러 메시지<br>- 빠른 실패<br>- 비즈니스 로직 |
| **RLS 정책** | 데이터베이스 레벨 보호 | - 최종 방어선<br>- 직접 DB 접근 방지<br>- 버그 대응 |

**왜 둘 다 필요한가?**
- Edge Function이 버그로 권한 체크를 우회하더라도
- RLS가 최종적으로 막아줌 (Defense in Depth)

---

## 테스트 방법

### 1. 정책 확인

```sql
-- shops 테이블의 모든 정책 확인
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'shops';
```

### 2. INSERT 테스트

```typescript
// 관리자로 로그인
const { data: { user } } = await supabase.auth.signInWithPassword({
  email: 'gacha-test@gmail.com',
  password: 'rhrbtlr91@',
});

// 스토어 생성 시도
const { data, error } = await supabase
  .from('shops')
  .insert({
    name: '테스트 가챠샵',
    shop_type: 'gacha',
    address_full: '서울시 강남구',
    latitude: 37.5,
    longitude: 127.0,
    region_level1: '서울시',
    verification_status: 'pending',
    data_source: 'admin_input',
  })
  .select()
  .single();

console.log(data); // 성공!
```

### 3. 일반 사용자로 테스트 (실패해야 함)

```typescript
// 일반 사용자로 로그인
const { data: { user } } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// 스토어 생성 시도 (실패해야 함)
const { data, error } = await supabase
  .from('shops')
  .insert({
    name: '테스트 가챠샵',
    // ...
  });

console.log(error); // RLS 정책 위반!
```

---

## 교훈

### 1. RLS 정책은 작업별로 명시적으로 정의

```sql
-- ❌ 이렇게 하면 안 됨 (막연한 기대)
CREATE POLICY "Admins have full access"
  FOR ALL
  ...

-- ✅ 각 작업별로 명시
CREATE POLICY "Admins can insert shops" FOR INSERT ...
CREATE POLICY "Admins can update shops" FOR UPDATE ...
CREATE POLICY "Admins can delete shops" FOR DELETE ...
CREATE POLICY "Admins can select shops" FOR SELECT ...
```

### 2. RLS 활성화 시 기본값은 "모든 작업 거부"

- RLS를 활성화하면 **모든 작업이 차단**됨
- 허용하려는 작업은 **명시적으로 정책 추가**
- 정책이 하나라도 true를 반환하면 허용 (OR 로직)

### 3. INSERT는 WITH CHECK, SELECT는 USING

| 작업 | 사용할 절 | 기억하는 법 |
|------|-----------|------------|
| SELECT | USING | "어떤 행을 **사용(USING)**할 수 있나?" |
| INSERT | WITH CHECK | "삽입할 행이 규칙에 맞는지 **확인(CHECK)**" |
| UPDATE | 둘 다 | "수정 전 **사용(USING)**할 수 있고,<br>수정 후 규칙에 맞는지 **확인(CHECK)**" |
| DELETE | USING | "어떤 행을 **사용(삭제)**할 수 있나?" |

### 4. 디버깅 팁

RLS 오류 시 확인할 것:
1. RLS가 활성화되어 있는가?
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```

2. 해당 작업(INSERT/UPDATE/DELETE)에 대한 정책이 있는가?
   ```sql
   SELECT policyname, cmd
   FROM pg_policies
   WHERE tablename = 'shops';
   ```

3. 정책이 현재 사용자에게 적용되는가?
   - `TO authenticated` vs `TO public` vs `TO anon`

---

## 관련 링크

- [Supabase RLS 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policy Documentation](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [shops 테이블 스키마](../database/tables/shops.md)
- [users RLS 무한 재귀 문제](./rls-users-infinite-recursion.md)

---

## 마이그레이션 파일

- 파일명: `add_shops_insert_policy.sql`
- 적용일: 2025-10-30
- 상태: ✅ 프로덕션 적용됨

## 추가된 정책 목록

1. `Admins can insert shops` - INSERT 권한
2. `Admins can update shops` - UPDATE 권한
3. `Admins can delete shops` - DELETE 권한 (소프트 삭제용)

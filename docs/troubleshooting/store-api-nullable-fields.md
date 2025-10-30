# 스토어 생성 API 설계: 위치 정보 필수 여부 문제

> 작성일: 2025-10-30

## 문제 상황

스토어 CRUD API 구현 전, 유저 앱과 어드민 앱의 요구사항이 다른 상황에 대한 설계 고민

### 요구사항

- **유저 앱**: 사용자 편의성을 위해 `address_full`(주소)만 입력받아 매장 제출
  - 일반 사용자가 위도, 경도를 직접 찾기 어려움
  - 간편한 제출 프로세스 필요

- **어드민 앱**: 완전한 데이터 검증을 위해 모든 위치 정보 필수
  - 유저가 제출한 데이터를 검증하면서 위치 정보 추가
  - 정확한 위도, 경도, 지역 정보 입력

### 현재 DB 스키마

```sql
-- shops 테이블의 위치 정보 컬럼
latitude      numeric(10,8) NOT NULL,  -- 위도
longitude     numeric(11,8) NOT NULL,  -- 경도
region_level1 varchar(50)   NOT NULL   -- 시/도
```

**문제**: 유저가 제출할 때 위도/경도를 모르는데, DB는 NOT NULL 제약조건이 걸려있음

---

## 검토한 대안들

### 1차 대안: 더미 값 사용 ❌

```typescript
// 유저 제출 시
{
  address_full: "서울 강남구 테헤란로 123",
  latitude: 1,    // 더미 값
  longitude: 1,   // 더미 값
  region_level1: "" // 빈 문자열
}
```

**장점:**
- DB 스키마 변경 불필요
- 빠르게 구현 가능

**단점:**
- ❌ 데이터 무결성 심각한 문제
- ❌ `lat: 1, long: 1`은 실제 좌표 (아프리카 기니만)
- ❌ 지도 쿼리 시 더미 값 필터링 추가 필요
- ❌ 인덱스 효율 저하
- ❌ 나중에 실제 값과 구분 어려움

**결론: 절대 비추천**

---

### 2차 대안: NULL 허용 ✅

```sql
-- 스키마 변경
ALTER TABLE shops
  ALTER COLUMN latitude DROP NOT NULL,
  ALTER COLUMN longitude DROP NOT NULL,
  ALTER COLUMN region_level1 DROP NOT NULL;

-- 검증된 매장은 위치 정보 필수 (CHECK 제약조건)
ALTER TABLE shops
  ADD CONSTRAINT check_verified_shops_location
  CHECK (
    verification_status != 'verified'
    OR (latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND region_level1 IS NOT NULL)
  );
```

**장점:**
- ✅ 데이터 무결성 유지 (NULL = "아직 모르는 값")
- ✅ 쿼리 명확: `WHERE latitude IS NOT NULL`
- ✅ `verification_status`와 자연스럽게 매칭
  - `pending`: NULL 허용 (유저 제출)
  - `verified`: NULL 불가 (어드민 검증 완료)
- ✅ 어드민 validation으로 품질 관리
- ✅ 향후 Geocoding API 도입 시 유연함

**단점:**
- 일부 쿼리에서 NULL 체크 필요
- 인덱스 조정 필요 (해결 가능)

**데이터 플로우:**
```typescript
// 1. 유저가 매장 제출
{
  address_full: "서울 강남구 테헤란로 123",
  latitude: null,
  longitude: null,
  region_level1: null,
  verification_status: 'pending',
  data_source: 'user_submit'
}

// 2. 어드민이 검증하면서 위치 정보 추가
UPDATE shops SET
  latitude = 37.5012345,
  longitude = 127.0398765,
  region_level1 = '서울특별시',
  verification_status = 'verified'
WHERE id = ...
```

---

### 3차 대안: API 분리 ✅✅

```typescript
// 유저용 API - 최소 정보만 요구
POST /api/shops/submit
{
  name: "홍대 가챠샵",
  address_full: "서울 마포구 ...",
  shop_type: "gacha",
  phone: "010-1234-5678"
  // 위치 정보 불필요
}

// 어드민용 API - 완전한 정보 요구
POST /api/admin/shops
{
  name: "홍대 가챠샵",
  address_full: "서울 마포구 ...",
  latitude: 37.5012345,      // 필수!
  longitude: 127.0398765,    // 필수!
  region_level1: "서울특별시", // 필수!
  shop_type: "gacha",
  verification_status: 'verified'
}
```

**장점:**
- ✅ 각 사용자 타입에 맞는 명확한 validation
- ✅ 유저/어드민의 요구사항이 다름을 명확히 표현
- ✅ 보안: 어드민 API는 권한 체크 추가
- ✅ 향후 확장성: 각각 독립적으로 발전 가능
- ✅ 에러 메시지 명확: 유저는 간단, 어드민은 상세

**단점:**
- 엔드포인트 증가 (하지만 자연스러움)
- 일부 로직 중복 가능 (공통 함수로 해결)

---

## 최종 결정: 2차 + 3차 조합 🎯

**채택 이유:**

### 1. 현실적인 데이터 플로우
```
유저 제출 (pending) → 어드민 검증 (verified)
NULL 허용          → 완전한 데이터
```

### 2. verification_status와 완벽한 매칭
- `pending`: 위치 정보 NULL 가능
- `verified`: 위치 정보 필수 (CHECK 제약조건으로 강제)

### 3. 앱에서는 verified만 표시
```sql
-- 이미 RLS 정책에 있음
WHERE verification_status = 'verified'
  AND latitude IS NOT NULL
  AND is_deleted = false
```

### 4. API 분리는 자연스러움
- 유저 앱 ≠ 어드민 앱
- 요구사항이 다름
- 권한 체크도 다름

---

## 구현 방안

### Step 1: DB 스키마 변경

```sql
-- 마이그레이션: make_location_fields_nullable

-- latitude, longitude, region_level1을 NULLABLE로 변경
ALTER TABLE shops
  ALTER COLUMN latitude DROP NOT NULL,
  ALTER COLUMN longitude DROP NOT NULL,
  ALTER COLUMN region_level1 DROP NOT NULL;

-- 검증된 매장은 위치 정보 필수 (CHECK 제약조건)
ALTER TABLE shops
  ADD CONSTRAINT check_verified_shops_location
  CHECK (
    verification_status != 'verified'
    OR (latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND region_level1 IS NOT NULL)
  );

-- 인덱스 재생성 (NULL 값 포함)
DROP INDEX IF EXISTS idx_shops_latitude;
DROP INDEX IF EXISTS idx_shops_longitude;

CREATE INDEX idx_shops_latitude
  ON shops(latitude)
  WHERE is_deleted = false AND latitude IS NOT NULL;

CREATE INDEX idx_shops_longitude
  ON shops(longitude)
  WHERE is_deleted = false AND longitude IS NOT NULL;
```

### Step 2: API 엔드포인트 구조

```typescript
// 1. 유저 제출 API (최소 정보)
POST /api/shops/submit
Body: {
  address_full: string (필수)
  name: string (필수)
  shop_type: 'gacha' | 'figure' | 'both' (필수)
  phone?: string
  description?: string
}
Response: {
  verification_status: 'pending' (자동)
  data_source: 'user_submit' (자동)
  created_by: user.id (자동)
}

// 2. 어드민 생성 API (완전한 정보)
POST /api/admin/shops
Body: {
  address_full: string (필수)
  name: string (필수)
  latitude: number (필수!)
  longitude: number (필수!)
  region_level1: string (필수!)
  shop_type: 'gacha' | 'figure' | 'both' (필수)
  ...
}
Response: {
  verification_status: 'verified' (자동)
  data_source: 'admin_input' (자동)
  created_by: admin.id (자동)
}

// 3. 어드민 검증 API (pending → verified)
PATCH /api/admin/shops/:id/verify
Body: {
  latitude: number (필수)
  longitude: number (필수)
  region_level1: string (필수)
  region_level2?: string
  region_level3?: string
}
Response: {
  verification_status: 'verified'
}
```

### Step 3: Validation 로직

```typescript
// 유저 제출 시 validation
const userSubmitSchema = z.object({
  address_full: z.string().min(1),
  name: z.string().min(1),
  shop_type: z.enum(['gacha', 'figure', 'both']),
  phone: z.string().optional(),
  // latitude, longitude, region_level1 없음
})

// 어드민 생성 시 validation
const adminCreateSchema = z.object({
  address_full: z.string().min(1),
  name: z.string().min(1),
  latitude: z.number().min(-90).max(90),  // 필수!
  longitude: z.number().min(-180).max(180), // 필수!
  region_level1: z.string().min(1), // 필수!
  shop_type: z.enum(['gacha', 'figure', 'both']),
  // ... 기타 필드
})
```

---

## 향후 확장 가능성

### Geocoding API 도입 시

```typescript
// 주소 → ��도/경도 자동 변환
import { KakaoMapAPI } from '@/lib/kakao-map'

const geocode = await KakaoMapAPI.geocode(address_full)

await supabase
  .from('shops')
  .update({
    latitude: geocode.lat,
    longitude: geocode.lng,
    region_level1: geocode.region.level1,
    region_level2: geocode.region.level2,
    region_level3: geocode.region.level3,
  })
  .eq('id', shopId)
```

### 자동 검증 파이프라인

```typescript
// 유저 제출 → Geocoding → 자동 검증
1. 유저가 address_full 입력
2. Geocoding API로 위치 정보 자동 추출
3. 신뢰도 높으면 자동 verified
4. 신뢰도 낮으면 pending (어드민 수동 검증)
```

---

## 참고 링크

- [Shops 테이블 스키마](../database/tables/shops.md)
- [데이터 검증 정책](../guides/data-validation.md)
- [API 설계 가이드](../guides/api-design.md)

---

## 관련 이슈

- 데이터 출처에 따른 validation 차이
- 위치 기반 검색 최적화
- 사용자 제출 매장 품질 관리

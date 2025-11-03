# Shop Images 테이블 스키마

> 상점별 다중 이미지를 관리하는 테이블

## 테이블 개요

- **테이블명**: `shop_images`
- **총 컬럼 수**: 11개
- **Row Level Security (RLS)**: 활성화됨
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `shop_id` → `shops(id)` (CASCADE DELETE)
- **연동 스토리지**: Supabase Storage 버킷 `shop-images` (Public)

---

## 컬럼 상세 설명

### 1. 기본 정보 (Core Fields)

| 컬럼명       | 타입        | 필수 | 기본값             | 설명                          |
| ------------ | ----------- | ---- | ------------------ | ----------------------------- |
| `id`         | uuid        | ✓    | uuid_generate_v4() | 이미지 고유 식별자 (기본키)   |
| `shop_id`    | uuid        | ✓    | -                  | 상점 ID (shops 테이블 참조)   |
| `created_at` | timestamptz | ✓    | now()              | 레코드 생성 시각              |
| `updated_at` | timestamptz | ✓    | now()              | 레코드 수정 시각 (자동 갱신)  |
| `created_by` | uuid        | -    | null               | 레코드 생성자 사용자 ID       |

### 2. 이미지 정보 (Image Data)

| 컬럼명            | 타입    | 필수 | 제약조건 | 설명                                                              |
| ----------------- | ------- | ---- | -------- | ----------------------------------------------------------------- |
| `image_path`      | text    | ✓    | -        | Supabase Storage 이미지 경로<br>예: `shops/{shopId}/image.jpg`    |
| `display_order`   | integer | ✓    | > 0      | 표시 순서 (1 = 대표 이미지)                                       |
| `alt_text`        | text    | -    | -        | 이미지 대체 텍스트 (접근성, SEO)                                  |

### 3. 메타데이터 (Metadata)

| 컬럼명       | 타입    | 필수 | 제약조건 | 설명                           |
| ------------ | ------- | ---- | -------- | ------------------------------ |
| `width`      | integer | -    | > 0      | 이미지 너비 (픽셀)             |
| `height`     | integer | -    | > 0      | 이미지 높이 (픽셀)             |
| `file_size`  | integer | -    | > 0      | 파일 크기 (바이트)             |

---

## 인덱스 목록

| 인덱스명                          | 대상 컬럼                      | 조건                  | 용도                           |
| --------------------------------- | ------------------------------ | --------------------- | ------------------------------ |
| `idx_shop_images_shop_id`         | shop_id, display_order         | -                     | 상점별 이미지 조회 및 정렬     |
| `idx_shop_images_display_order`   | display_order                  | display_order = 1     | 대표 이미지 빠른 조회          |
| `idx_shop_images_created_at`      | created_at DESC                | -                     | 최신 이미지 정렬               |

---

## 제약 조건 (Constraints)

### UNIQUE 제약조건

- **unique_shop_display_order**: `(shop_id, display_order)` 조합이 유일해야 함
  - 한 상점 내에서 동일한 display_order를 가진 이미지는 1개만 존재
  - 예: shop A의 이미지들은 1, 2, 3, ... 순서를 가지며 중복 불가

### CHECK 제약조건

1. **positive_display_order**: `display_order > 0`
2. **positive_dimensions**: `width > 0 AND height > 0` (NULL 허용)
3. **positive_file_size**: `file_size > 0` (NULL 허용)

### CASCADE DELETE

- `shop_id`가 참조하는 상점이 삭제되면, 해당 상점의 모든 이미지도 자동 삭제

---

## 트리거 (Triggers)

### `trigger_shop_images_updated_at`

- **함수**: `update_updated_at_column()`
- **시점**: BEFORE UPDATE
- **동작**: 레코드 수정 시 `updated_at` 컬럼을 자동으로 현재 시각으로 업데이트

---

## Row Level Security (RLS) 정책

### 1. "Public users can view shop images"

- **대상**: `anon`, `authenticated` 역할
- **작업**: SELECT
- **조건**: 연결된 상점이 검증된(verified) 상태이고 삭제되지 않은 경우
- **설명**: 비회원과 회원 모두 검증된 상점의 이미지만 조회 가능

```sql
EXISTS (
  SELECT 1 FROM public.shops
  WHERE shops.id = shop_images.shop_id
    AND shops.verification_status = 'verified'
    AND shops.is_deleted = false
)
```

### 2. "Admins have full access to shop images"

- **대상**: `authenticated` 역할 (role = 'admin')
- **작업**: ALL (SELECT, INSERT, UPDATE, DELETE)
- **조건**: JWT 토큰의 role이 'admin'
- **설명**: 관리자는 모든 이미지에 대한 모든 작업 가능

---

## Supabase Storage 설정

### 버킷 정보

- **버킷 ID**: `shop-images`
- **공개 여부**: Public (누구나 URL로 접근 가능)
- **파일 크기 제한**: 10MB
- **허용 파일 형식**:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
  - `image/gif`

### 파일 경로 구조

```
shop-images/
├── shops/
│   ├── {shop_id_1}/
│   │   ├── 1234567890_image1.jpg
│   │   ├── 1234567891_image2.png
│   │   └── ...
│   ├── {shop_id_2}/
│   │   └── ...
```

---

## 사용 예시

### 1. 상점의 모든 이미지 조회 (순서대로)

```sql
SELECT id, image_path, display_order, alt_text, width, height
FROM shop_images
WHERE shop_id = 'shop-uuid-here'
ORDER BY display_order ASC;
```

### 2. 대표 이미지만 조회

```sql
SELECT image_path, alt_text
FROM shop_images
WHERE shop_id = 'shop-uuid-here'
  AND display_order = 1
LIMIT 1;
```

### 3. 상점과 이미지 조인 조회

```sql
SELECT
  s.id,
  s.name,
  si.image_path,
  si.display_order,
  si.alt_text
FROM shops s
LEFT JOIN shop_images si ON s.id = si.shop_id
WHERE s.verification_status = 'verified'
  AND s.is_deleted = false
ORDER BY s.created_at DESC, si.display_order ASC;
```

### 4. 이미지 업로드 후 데이터 저장

```typescript
// 1. Supabase Storage에 파일 업로드
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('shop-images')
  .upload(`shops/${shopId}/${Date.now()}_${file.name}`, file)

// 2. shop_images 테이블에 레코드 생성
const { data, error } = await supabase
  .from('shop_images')
  .insert({
    shop_id: shopId,
    image_path: uploadData.path,
    display_order: 1, // 대표 이미지
    alt_text: '상점 전경',
    width: 1920,
    height: 1080,
    file_size: file.size
  })
```

### 5. 공개 URL 생성

```typescript
// Public bucket이므로 getPublicUrl 사용
const { data } = supabase.storage
  .from('shop-images')
  .getPublicUrl('shops/shop-uuid/image.jpg')

console.log(data.publicUrl)
// 출력: https://project-id.supabase.co/storage/v1/object/public/shop-images/shops/shop-uuid/image.jpg
```

### 6. 대표 이미지 변경 (display_order 업데이트)

```typescript
// 현재 대표 이미지(display_order=1)를 2로 변경
await supabase
  .from('shop_images')
  .update({ display_order: 2 })
  .eq('shop_id', shopId)
  .eq('display_order', 1)

// 새로운 이미지를 대표 이미지로 설정
await supabase
  .from('shop_images')
  .update({ display_order: 1 })
  .eq('id', newImageId)
```

---

## 주의사항

1. **display_order 관리**
   - display_order = 1이 항상 대표 이미지
   - 순서 변경 시 UNIQUE 제약조건 위반에 주의 (트랜잭션 사용 권장)

2. **파일 삭제**
   - DB에서 레코드 삭제 시, Supabase Storage의 실제 파일도 삭제 필요
   - CASCADE DELETE로 상점 삭제 시 관련 이미지 레코드도 자동 삭제되지만, Storage 파일은 수동 삭제 필요

3. **파일 크기 제한**
   - 버킷 설정: 10MB
   - 필요시 버킷 설정 변경 가능

4. **Public 버킷**
   - 누구나 URL로 직접 접근 가능
   - 민감한 이미지는 저장하지 말 것

5. **이미지 최적화 (TODO)**
   - 현재는 원본 이미지만 저장
   - 추후 썸네일/리사이즈 처리 별도 구현 필요

---

## 마이그레이션 히스토리

### 2025-01-12: shop_images 테이블 생성

- **배경**: shops 테이블의 `thumbnail_url`, `cover_image_url` 컬럼으로는 다중 이미지 지원 불가
- **변경사항**:
  - shop_images 테이블 생성
  - Supabase Storage 버킷 `shop-images` 생성 (public)
  - shops 테이블에서 image URL 컬럼 제거
- **목적**:
  - 상점당 여러 이미지 업로드 지원
  - display_order를 통한 대표 이미지 관리
  - 향후 이미지 최적화 처리 유연성 확보

---

## TODO

- [ ] 이미지 리사이즈/썸네일 생성 로직 구현
- [ ] Storage 파일 자동 삭제 트리거 구현 (레코드 삭제 시)
- [ ] 이미지 업로드 프로그레스 UI 구현
- [ ] 이미지 검증 (파일 형식, 크기, 해상도 등)
- [ ] 이미지 업로드 실패 시 롤백 처리

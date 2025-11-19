# Edge Functions 문서

> Supabase Edge Functions API 전체 목록 및 상세 설명

## 개요

- **총 Edge Functions 수**: 26개
- **프로젝트 ID**: `kabndipxpxxhwqljhsdv`
- **리전**: `ap-northeast-2` (Seoul)
- **Base URL**: `https://kabndipxpxxhwqljhsdv.supabase.co/functions/v1`
- **최종 업데이트**: 2025-11-19

---

## 인증 (Authentication)

모든 Edge Functions는 JWT 인증이 필요합니다 (`verify_jwt: true`).

**요청 헤더**:
```
Authorization: Bearer {ACCESS_TOKEN}
```

---

## Edge Functions 목록

### 1. 관리자 인증 (Admin Authentication)

#### 1.1 `admin-auth-signup`
- **버전**: 4
- **설명**: 관리자 회원가입 (이메일/비밀번호)
- **메소드**: POST
- **요청 본문**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123",
    "full_name": "홍길동",
    "role": "admin",  // "admin" 또는 "owner"
    "business_name": "가챠샵 강남점",  // owner인 경우 필수
    "business_license": "123-45-67890"  // owner인 경우 필수
  }
  ```
- **응답**:
  ```json
  {
    "user": { ... },
    "message": "Admin user created. Waiting for approval."
  }
  ```

#### 1.2 `admin-auth-signin`
- **버전**: 5
- **설명**: 관리자 로그인
- **메소드**: POST
- **요청 본문**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **응답**:
  ```json
  {
    "session": { ... },
    "user": { ... }
  }
  ```

---

### 2. 매장 관리 (Shop Management)

#### 2.1 `admin-shops-list`
- **버전**: 4
- **설명**: 매장 목록 조회 (관리자용)
- **메소드**: GET
- **쿼리 파라미터**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `verification_status`: 검증 상태 필터 (`pending`, `verified`, `rejected`)
  - `shop_type`: 매장 유형 필터 (`gacha`, `figure`, `both`)
  - `sido`: 시/도 필터
- **응답**:
  ```json
  {
    "data": [{ ... }],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "total_pages": 10
    }
  }
  ```

#### 2.2 `admin-shops-get`
- **버전**: 3
- **설명**: 특정 매장 상세 조회
- **메소드**: GET
- **쿼리 파라미터**: `id` (매장 UUID)

#### 2.3 `admin-shops-create`
- **버전**: 4
- **설명**: 새 매장 생성
- **메소드**: POST
- **요청 본문**:
  ```json
  {
    "name": "가챠샵 강남점",
    "shop_type": "gacha",
    "road_address": "서울특별시 강남구 테헤란로 123",
    "sido": "서울특별시",
    "sigungu": "강남구",
    "latitude": 37.5665,
    "longitude": 126.9780,
    "tag_ids": ["tag-uuid-1", "tag-uuid-2"],
    "phone": "02-1234-5678",
    "description": "강남역 근처 가챠 전문점",
    "gacha_machine_count": 20,
    "main_series": ["포켓몬", "디즈니"],
    "business_hours": {
      "mon": "10:00-22:00",
      "tue": "10:00-22:00"
    }
  }
  ```

#### 2.4 `admin-shops-update`
- **버전**: 3
- **설명**: 매장 정보 수정
- **메소드**: PUT
- **요청 본문**: (id 필수, 나머지는 선택)

#### 2.5 `admin-shops-delete`
- **버전**: 4
- **설명**: 매장 소프트 삭제
- **메소드**: DELETE
- **쿼리 파라미터**: `id` (매장 UUID)

---

### 3. 매장 오너 (Shop Owner)

#### 3.1 `owner-shops-get`
- **버전**: 2
- **설명**: 오너 본인 매장 조회
- **메소드**: GET
- **권한**: owner 역할만 가능

#### 3.2 `owner-shops-update`
- **버전**: 2
- **설명**: 오너 본인 매장 정보 수정
- **메소드**: PUT
- **권한**: owner 역할, 본인 소유 매장만 수정 가능

---

### 4. 태그 관리 (Tags Management)

#### 4.1 `admin-tags-list`
- **버전**: 3
- **설명**: 태그 목록 조회
- **메소드**: GET
- **응답**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "주차가능",
        "description": "주차 공간이 있는 매장",
        "shop_tags": [{ "count": 5 }]  // 사용 횟수
      }
    ]
  }
  ```

#### 4.2 `admin-tags-create`
- **버전**: 2
- **설명**: 새 태그 생성
- **메소드**: POST
- **요청 본문**:
  ```json
  {
    "name": "주차가능",
    "description": "주차 공간이 있는 매장"
  }
  ```

#### 4.3 `admin-tags-update`
- **버전**: 2
- **설명**: 태그 정보 수정
- **메소드**: PUT

#### 4.4 `admin-tags-delete`
- **버전**: 2
- **설명**: 태그 소프트 삭제
- **메소드**: DELETE
- **쿼리 파라미터**: `id` (태그 UUID)

---

### 5. 관리자 관리 (Admin Users Management)

#### 5.1 `admin-users-get-all`
- **버전**: 4
- **설명**: 모든 관리자 목록 조회 (슈퍼 관리자 전용)
- **메소드**: GET
- **권한**: super_admin 역할만 가능
- **쿼리 파라미터**:
  - `approval_status`: 승인 상태 필터
  - `role`: 역할 필터

#### 5.2 `admin-users-approve`
- **버전**: 3
- **설명**: 관리자 승인 처리
- **메소드**: POST
- **권한**: super_admin 역할만 가능
- **요청 본문**:
  ```json
  {
    "user_id": "uuid",
    "shop_ids": ["shop-uuid-1"]  // owner인 경우 소유 매장 지정
  }
  ```

#### 5.3 `admin-users-reject`
- **버전**: 2
- **설명**: 관리자 거부 처리
- **메소드**: POST
- **권한**: super_admin 역할만 가능
- **요청 본문**:
  ```json
  {
    "user_id": "uuid",
    "rejection_reason": "사업자 등록번호 불일치"
  }
  ```

---

### 6. 메뉴 관리 (Menus Management)

#### 6.1 `admin-menus-get-all`
- **버전**: 2
- **설명**: 모든 메뉴 목록 조회
- **메소드**: GET

#### 6.2 `admin-menus-get`
- **버전**: 3
- **설명**: 특정 메뉴 조회
- **메소드**: GET
- **쿼리 파라미터**: `id` (메뉴 UUID)

#### 6.3 `admin-menus-create`
- **버전**: 2
- **설명**: 새 메뉴 생성
- **메소드**: POST
- **요청 본문**:
  ```json
  {
    "code": "shops.management",
    "name": "매장 관리",
    "description": "매장 정보 관리",
    "parent_id": "parent-menu-uuid",
    "path": "/shops",
    "icon": "Store",
    "display_order": 1
  }
  ```

#### 6.4 `admin-menus-update`
- **버전**: 2
- **설명**: 메뉴 정보 수정
- **메소드**: PUT

#### 6.5 `admin-menus-delete`
- **버전**: 2
- **설명**: 메뉴 삭제
- **메소드**: DELETE
- **쿼리 파라미터**: `id` (메뉴 UUID)

#### 6.6 `admin-menu-permissions-update`
- **버전**: 2
- **설명**: 관리자 메뉴 권한 업데이트
- **메소드**: POST
- **요청 본문**:
  ```json
  {
    "admin_id": "admin-uuid",
    "menu_ids": ["menu-uuid-1", "menu-uuid-2"]
  }
  ```

---

### 7. 유저 제보 관리 (User Submissions)

#### 7.1 `admin-submissions-list`
- **버전**: 1
- **설명**: 유저 제보 목록 조회
- **메소드**: GET
- **쿼리 파라미터**:
  - `status`: 처리 상태 필터 (`pending`, `approved`, `rejected`)
  - `submission_type`: 제보 유형 필터 (`new`, `update`, `correction`)

#### 7.2 `admin-review-submission`
- **버전**: 1
- **설명**: 유저 제보 검토 및 승인/반려
- **메소드**: POST
- **요청 본문**:
  ```json
  {
    "submission_id": "uuid",
    "status": "approved",  // "approved" 또는 "rejected"
    "review_note": "검토 의견"
  }
  ```

---

### 8. 일반 유저용 (General Users)

#### 8.1 `general-shops-submit`
- **버전**: 1
- **설명**: 일반 유저가 매장 정보 제보
- **메소드**: POST
- **요청 본문**:
  ```json
  {
    "submission_type": "new",  // "new", "update", "correction"
    "shop_id": "uuid",  // update/correction인 경우 필수
    "submission_note": "제보 내용",
    "submitted_data": { ... }  // 매장 정보
  }
  ```

#### 8.2 `general-shops-list-my`
- **버전**: 1
- **설명**: 내가 제보한 매장 목록 조회
- **메소드**: GET

---

## 사용 예시

### 관리자 로그인 및 매장 조회

```typescript
// 1. 로그인
const loginResponse = await fetch(
  'https://kabndipxpxxhwqljhsdv.supabase.co/functions/v1/admin-auth-signin',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'password123'
    })
  }
);
const { session } = await loginResponse.json();

// 2. 매장 목록 조회
const shopsResponse = await fetch(
  'https://kabndipxpxxhwqljhsdv.supabase.co/functions/v1/admin-shops-list?page=1&limit=10',
  {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  }
);
const { data: shops } = await shopsResponse.json();
```

---

## 에러 처리

모든 Edge Functions는 다음과 같은 에러 형식을 반환합니다:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

**일반적인 HTTP 상태 코드**:
- `200 OK`: 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `500 Internal Server Error`: 서버 오류

---

## 관련 문서

- [Edge Functions Guide](../guides/edge-functions-guide.md) - Edge Functions 개발 가이드
- [Admin Authentication](../features/admin-authentication.md) - 관리자 인증 상세 설명
- [Tables Documentation](./tables/) - 데이터베이스 테이블 스키마

---

## 최근 변경 사항

### 2025-11-14: 메뉴 관리 Functions 추가
- `admin-menus-*` 시리즈 추가 (6개)
- `admin-menu-permissions-update` 추가
- 동적 메뉴 권한 제어 가능

### 2025-11-13: 유저 제보 Functions 추가
- `admin-submissions-list` 추가
- `admin-review-submission` 추가
- `general-shops-submit` 추가
- `general-shops-list-my` 추가

### 2025-11-12: 관리자 승인 시스템 Functions 추가
- `admin-users-get-all` 추가
- `admin-users-approve` 추가
- `admin-users-reject` 추가
- 매장 오너 승인 시 소유 매장 자동 연결

### 2025-11-01: 태그 관리 Functions 추가
- `admin-tags-*` 시리즈 추가 (4개)
- 매장 생성/수정 시 `tag_ids` 파라미터 지원

---

## 주의사항

1. **모든 Functions는 JWT 인증 필요**: 반드시 `Authorization` 헤더에 유효한 토큰 포함
2. **역할 기반 접근 제어**: 일부 Functions는 특정 역할(`super_admin`, `admin`, `owner`)만 사용 가능
3. **승인 상태 확인**: 관리자는 `approval_status = 'approved'`인 경우에만 대부분의 기능 사용 가능
4. **RLS 정책 적용**: Edge Functions는 데이터베이스 RLS 정책을 따름
5. **페이지네이션**: 목록 조회 Functions는 기본적으로 페이지네이션 지원

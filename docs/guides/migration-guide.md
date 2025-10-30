# 디렉토리 구조 마이그레이션 가이드

현재 프로젝트를 확장 가능한 구조로 개선하기 위한 단계별 마이그레이션 가이드입니다.

## 목표 구조

```
src/
  ├── main.tsx
  ├── App.tsx
  ├── App.css
  │
  ├── assets/                     # 정적 리소스
  │   ├── images/
  │   ├── icons/
  │   └── fonts/
  │
  ├── components/                 # 재사용 컴포넌트
  │   ├── layout/                 # 레이아웃 컴포넌트
  │   ├── ui/                     # shadcn/ui 컴포넌트
  │   └── common/                 # 공통 컴포넌트 (신규)
  │
  ├── features/                   # 기능별 모듈 (신규)
  │   ├── store/
  │   ├── user/
  │   └── product/
  │
  ├── pages/                      # 페이지 컴포넌트
  ├── hooks/                      # 공통 커스텀 훅 (신규)
  ├── services/                   # API 서비스 레이어 (신규)
  ├── stores/                     # 전역 상태 관리 (신규)
  ├── types/                      # 공통 타입 정의 (신규)
  ├── constants/                  # 상수 정의 (신규)
  ├── lib/                        # 유틸리티 함수
  └── router/                     # 라우팅 설정 (신규)
```

## Phase 1: 기본 디렉토리 생성 (즉시 가능)

### 1.1 새 디렉토리 생성

```bash
# 공통 컴포넌트
mkdir -p src/components/common

# 기능별 모듈
mkdir -p src/features/store/{components,hooks,api,types}
mkdir -p src/features/user/{components,hooks,api,types}
mkdir -p src/features/product/{components,hooks,api,types}

# 공통 레이어
mkdir -p src/hooks
mkdir -p src/services
mkdir -p src/stores
mkdir -p src/types
mkdir -p src/constants
mkdir -p src/router
```

### 1.2 기존 파일 이동

#### Store 관련 파일 이동
```bash
# components/store/StoreRegistrationModal.tsx → features/store/components/
mv src/components/store/StoreRegistrationModal.tsx src/features/store/components/
rmdir src/components/store
```

**파일 내 import 경로 수정 필요:**
```typescript
// Before
import { StoreRegistrationModal } from '@/components/store/StoreRegistrationModal'

// After
import { StoreRegistrationModal } from '@/features/store/components/StoreRegistrationModal'
```

## Phase 2: API 서비스 레이어 구축

### 2.1 API 클라이언트 설정

```bash
npm install axios
# 또는
npm install @tanstack/react-query  # 추천
```

**파일 생성: `src/services/api.ts`**
```typescript
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### 2.2 기능별 API 서비스 생성

**파일 생성: `src/features/store/api/storeApi.ts`**
```typescript
import { apiClient } from '@/services/api'
import type { Store, CreateStoreDto } from '../types/store.types'

export const storeApi = {
  getStores: async () => {
    const { data } = await apiClient.get<Store[]>('/stores')
    return data
  },

  getStore: async (id: string) => {
    const { data } = await apiClient.get<Store>(`/stores/${id}`)
    return data
  },

  createStore: async (dto: CreateStoreDto) => {
    const { data } = await apiClient.post<Store>('/stores', dto)
    return data
  },

  updateStore: async (id: string, dto: Partial<CreateStoreDto>) => {
    const { data } = await apiClient.patch<Store>(`/stores/${id}`, dto)
    return data
  },

  deleteStore: async (id: string) => {
    await apiClient.delete(`/stores/${id}`)
  },
}
```

## Phase 3: 타입 정의 체계화

### 3.1 공통 타입 정의

**파일 생성: `src/types/common.types.ts`**
```typescript
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export type Status = 'active' | 'inactive' | 'pending'

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}
```

**파일 생성: `src/types/api.types.ts`**
```typescript
export interface ApiError {
  message: string
  code: string
  statusCode: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}
```

### 3.2 기능별 타입 정의

**파일 생성: `src/features/store/types/store.types.ts`**
```typescript
import type { BaseEntity, Status } from '@/types/common.types'

export interface Store extends BaseEntity {
  name: string
  description: string
  status: Status
  ownerId: string
}

export interface CreateStoreDto {
  name: string
  description: string
}

export interface UpdateStoreDto extends Partial<CreateStoreDto> {}
```

## Phase 4: 상수 및 설정값 관리

### 4.1 라우트 상수

**파일 생성: `src/constants/routes.ts`**
```typescript
export const ROUTES = {
  DASHBOARD: '/',
  PRODUCTS: '/products',
  USERS: '/users',
  SETTINGS: '/settings',
  STORE_DETAIL: (id: string) => `/stores/${id}`,
} as const

export type RouteKey = keyof typeof ROUTES
```

**사용 예시:**
```typescript
import { ROUTES } from '@/constants/routes'

// Before
<Link to="/products">Products</Link>

// After
<Link to={ROUTES.PRODUCTS}>Products</Link>
```

### 4.2 API 엔드포인트 상수

**파일 생성: `src/constants/api.ts`**
```typescript
export const API_ENDPOINTS = {
  STORES: '/stores',
  USERS: '/users',
  PRODUCTS: '/products',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
} as const
```

### 4.3 앱 설정

**파일 생성: `src/constants/config.ts`**
```typescript
export const APP_CONFIG = {
  APP_NAME: 'Gacha Store Admin',
  API_TIMEOUT: 10000,
  ITEMS_PER_PAGE: 20,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const
```

## Phase 5: 커스텀 훅 구조화

### 5.1 공통 훅

**파일 생성: `src/hooks/useDebounce.ts`**
```typescript
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

**파일 생성: `src/hooks/useLocalStorage.ts`**
```typescript
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}
```

### 5.2 기능별 훅

**파일 생성: `src/features/store/hooks/useStoreManagement.ts`**
```typescript
import { useState } from 'react'
import { storeApi } from '../api/storeApi'
import type { Store, CreateStoreDto } from '../types/store.types'

export function useStoreManagement() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStores = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await storeApi.getStores()
      setStores(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stores')
    } finally {
      setLoading(false)
    }
  }

  const createStore = async (dto: CreateStoreDto) => {
    try {
      setLoading(true)
      setError(null)
      const newStore = await storeApi.createStore(dto)
      setStores((prev) => [...prev, newStore])
      return newStore
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create store')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    stores,
    loading,
    error,
    fetchStores,
    createStore,
  }
}
```

## Phase 6: 공통 컴포넌트 추가

### 6.1 에러 바운더리

**파일 생성: `src/components/common/ErrorBoundary.tsx`**
```typescript
import React, { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Something went wrong</h2>
              <p className="text-gray-600">{this.state.error?.message}</p>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

### 6.2 로딩 컴포넌트

**파일 생성: `src/components/common/Loading.tsx`**
```typescript
export function Loading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  )
}
```

### 6.3 빈 상태 컴포넌트

**파일 생성: `src/components/common/Empty.tsx`**
```typescript
interface EmptyProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function Empty({
  title = 'No data',
  description,
  action
}: EmptyProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  )
}
```

## Phase 7: 환경변수 설정

**파일 생성: `.env.example`**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=Gacha Store Admin
VITE_APP_ENV=development
```

**TypeScript 타입 정의: `src/vite-env.d.ts`**
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## 마이그레이션 체크리스트

### 즉시 실행 가능
- [ ] Phase 1: 디렉토리 구조 생성
- [ ] Phase 4: 상수 파일 생성 및 적용
- [ ] Phase 6: 공통 컴포넌트 추가

### API 연동 후
- [ ] Phase 2: API 서비스 레이어 구축
- [ ] Phase 3: 타입 정의 체계화
- [ ] Phase 5: 커스텀 훅 구조화

### 선택적 (프로젝트 규모에 따라)
- [ ] Phase 7: 환경변수 설정
- [ ] 라우터 설정 (React Router 사용 시)
- [ ] 상태 관리 (Zustand/Jotai 등)
- [ ] React Query 도입

## 주의사항

### Import 경로 별칭 설정
`tsconfig.json`에 경로 별칭이 설정되어 있는지 확인:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

`vite.config.ts`에도 동일하게 설정:

```typescript
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 점진적 마이그레이션
- 한 번에 모든 것을 바꾸지 말고 Phase별로 진행
- 각 Phase 완료 후 테스트 실행
- 필요하지 않은 Phase는 건너뛰어도 무방

### 파일 이동 시 주의
- 모든 import 경로 업데이트 필요
- TypeScript 컴파일 에러 확인
- ESLint 경고 해결

## 도움이 되는 도구

```bash
# import 경로 자동 수정 (VSCode)
# Command Palette → "Organize Imports"

# 사용하지 않는 import 자동 제거
npm run lint -- --fix
```

## 추가 리소스

- [React 프로젝트 구조 베스트 프랙티스](https://github.com/alan2207/bulletproof-react)
- [Vite 환경변수 설정](https://vitejs.dev/guide/env-and-mode.html)
- [TypeScript Path Mapping](https://www.typescriptlang.org/tsconfig#paths)

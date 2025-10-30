# Gacha Store Admin

가챠 스토어를 관리하는 어드민 인터페이스입니다.

## 기술 스택

- **React 19.1.1** with React Compiler enabled
- **TypeScript 5.9** (strict mode)
- **Vite 7.1** - Build tool and dev server
- **ESLint** - Code linting

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 린트

```bash
npm run lint
```

### 프로덕션 미리보기

```bash
npm run preview
```

## 주요 기능

- 스토어 관리
- 사용자 관리
- 제품 관리
- 설정

## 프로젝트 구조

```
src/
  ├── components/     # 재사용 가능한 컴포넌트
  │   ├── layout/    # 레이아웃 컴포넌트
  │   ├── ui/        # UI 컴포넌트 (shadcn/ui)
  │   └── store/     # 스토어 관련 컴포넌트
  ├── pages/         # 페이지 컴포넌트
  ├── lib/           # 유틸리티 함수
  └── assets/        # 정적 리소스
```

## 문서

프로젝트와 관련된 모든 문서는 [docs/](./docs/) 디렉토리에 있습니다.

### 개발 가이드

- [코딩 가이드라인](./docs/guides/code-guidelines.md) - 코딩 규칙 및 컨벤션
- [마이그레이션 가이드](./docs/guides/migration-guide.md) - 디렉토리 구조 마이그레이션
- [문서 구조 가이드](./docs/guides/documentation-structure.md) - 문서 작성 및 관리 규칙

### 스펙 및 요구사항

- [제품 스펙](./docs/specs/PRODUCT_SPEC.md) - 전체 제품 스펙

### 데이터베이스

- [Shops 테이블 스키마](./docs/database/tables/shops.md) - 상점 테이블 스키마

### 설정

- [MCP 설정 가이드](./docs/setup/MCP_SETUP.md) - Model Context Protocol 설정

## React Compiler

이 프로젝트는 React Compiler가 활성화되어 있습니다. 자세한 내용은 [React 공식 문서](https://react.dev/learn/react-compiler)를 참고하세요.

**참고:** React Compiler는 Vite 개발 및 빌드 성능에 영향을 줄 수 있습니다.

## ESLint 설정 확장

프로덕션 애플리케이션을 개발하는 경우, 타입 인식 린트 규칙을 활성화하는 것을 권장합니다:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      // 또는 더 엄격한 규칙을 원한다면
      tseslint.configs.strictTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

## 라이선스

MIT

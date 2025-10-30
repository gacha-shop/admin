# MCP Server 아키텍처 비교: npx vs HTTP

이 문서는 Supabase MCP 서버의 두 가지 연결 방식(npx 기반, HTTP 기반)의 내부 동작 원리와 차이점을 상세히 설명합니다.

## 목차

1. [npx 기반 MCP 서버 (stdio transport)](#1-npx-기반-mcp-서버-stdio-transport)
2. [HTTP 기반 MCP 서버](#2-http-기반-mcp-서버)
3. [핵심 차이점 비교](#핵심-차이점-비교)
4. [실제 코드 레벨 비교](#실제-코드-레벨-비교)
5. [결론](#결론)

---

## 1. npx 기반 MCP 서버 (stdio transport)

### 동작 흐름

```
[Claude Code]
    ↓ 1. npx 실행
[Child Process 생성]
    ↓ 2. @modelcontextprotocol/server-supabase 다운로드 & 실행
[MCP Server Process (Node.js)]
    ↓ 3. stdio로 양방향 통신 (JSON-RPC)
[Claude Code ↔ MCP Server]
    ↓ 4. MCP Server → Supabase API
[Supabase Database/Services]
```

### 상세 프로세스

#### 1단계: 프로세스 초기화

```javascript
// Claude Code 내부 (pseudocode)
const mcpProcess = spawn('npx', ['-y', '@modelcontextprotocol/server-supabase'], {
  env: {
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_KEY: 'your-anon-key'
  },
  stdio: ['pipe', 'pipe', 'pipe']  // stdin, stdout, stderr
});
```

#### 2단계: JSON-RPC 통신

```javascript
// Claude Code → MCP Server (stdin)
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "supabase_query",
    "arguments": {
      "table": "shops",
      "select": "*"
    }
  }
}

// MCP Server → Claude Code (stdout)
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      { "type": "text", "text": "[{...shop data...}]" }
    ]
  }
}
```

#### 3단계: MCP Server의 Supabase 호출

```javascript
// @modelcontextprotocol/server-supabase 내부
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Claude의 요청을 Supabase 쿼리로 변환
async function handleQuery(params) {
  const { data, error } = await supabase
    .from(params.table)
    .select(params.select);

  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
}
```

### 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────┐
│           Claude Code (Main Process)            │
│  - MCP Client 구현                               │
│  - stdin/stdout pipe 관리                        │
└────────────┬────────────────────────────────────┘
             │ spawn()
             ↓
┌─────────────────────────────────────────────────┐
│    Child Process (npx -y @mcp/server-supabase)  │
│  ┌───────────────────────────────────────────┐  │
│  │  MCP Server Implementation                 │  │
│  │  - JSON-RPC 2.0 프로토콜 파싱              │  │
│  │  - Tool 메서드 구현 (query, execute_sql)  │  │
│  │  - stdin에서 요청 수신                     │  │
│  │  - stdout으로 응답 전송                    │  │
│  └───────────────┬───────────────────────────┘  │
│                  │                               │
│  ┌───────────────┴───────────────────────────┐  │
│  │  Supabase JS Client                        │  │
│  │  - REST API 호출                           │  │
│  │  - 인증 헤더 자동 추가                     │  │
│  │  - PostgREST 프로토콜 사용                 │  │
│  └───────────────┬───────────────────────────┘  │
└──────────────────┼─────────────────────────────┘
                   │ HTTPS
                   ↓
┌─────────────────────────────────────────────────┐
│         Supabase Cloud (API Gateway)            │
│  - kong (API Gateway)                           │
│  - 인증 검증                                     │
│  - Rate limiting                                │
└────────────┬────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────┐
│         PostgREST / Storage / Functions         │
│  - PostgreSQL 쿼리 실행                          │
│  - RLS 정책 적용                                 │
└─────────────────────────────────────────────────┘
```

### 장점

- ✅ 직접 제어 가능
- ✅ 로컬에서 실행되어 빠른 응답
- ✅ 공식 문서화된 방식
- ✅ 환경 변수로 안전하게 인증 정보 관리
- ✅ 디버깅이 용이

### 단점

- ❌ Node.js와 npx 필요
- ❌ 초기 설정 필요 (환경 변수 구성)

---

## 2. HTTP 기반 MCP 서버

### 동작 흐름

```
[Claude Code]
    ↓ 1. HTTP 요청
[네트워크]
    ↓ 2. HTTPS
[Supabase MCP Gateway (mcp.supabase.com)]
    ↓ 3. 프록시/중계
[Supabase Database/Services]
```

### 상세 프로세스

#### 1단계: HTTP 클라이언트 요청

```javascript
// Claude Code 내부 (pseudocode)
async function callMCPTool(toolName, args) {
  const response = await fetch('https://mcp.supabase.com/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 인증 방식 불명확 - 이것이 문제!
      // 'Authorization': 'Bearer ???'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    })
  });

  return await response.json();
}
```

#### 2단계: 원격 MCP 게이트웨이

```javascript
// mcp.supabase.com 서버 (추측)
app.post('/mcp', async (req, res) => {
  // 어떻게 인증할까? 문제점:
  // 1. URL에 프로젝트 정보가 없음
  // 2. 헤더에 인증 정보가 없음
  // 3. 어느 Supabase 프로젝트에 연결할지 모름

  const { method, params } = req.body;

  // 추측: 세션 기반? 토큰 기반?
  const supabaseClient = createClientFor(???);

  // MCP 메서드 실행
  const result = await executeMCPMethod(method, params, supabaseClient);

  res.json({ jsonrpc: '2.0', result });
});
```

### 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────┐
│           Claude Code (Main Process)            │
│  - HTTP MCP Client                              │
│  - fetch() API 사용                              │
└────────────┬────────────────────────────────────┘
             │ HTTPS POST
             ↓
┌─────────────────────────────────────────────────┐
│              Internet / Network                 │
│  - DNS 조회                                      │
│  - TLS 핸드셰이크                                │
│  - 네트워크 지연 (latency)                       │
└────────────┬────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────┐
│      https://mcp.supabase.com (추측)            │
│  ┌───────────────────────────────────────────┐  │
│  │  MCP Gateway Service                       │  │
│  │  - HTTP 요청 수신                          │  │
│  │  - JSON-RPC 파싱                           │  │
│  │  - ??? 인증 처리 (불명확)                  │  │
│  │  - ??? 프로젝트 라우팅 (불명확)            │  │
│  └───────────────┬───────────────────────────┘  │
│                  │                               │
│  ┌───────────────┴───────────────────────────┐  │
│  │  Supabase Client (서버 측)                 │  │
│  │  - 어떤 프로젝트? (문제)                   │  │
│  │  - 어떤 키? (문제)                          │  │
│  └───────────────┬───────────────────────────┘  │
└──────────────────┼─────────────────────────────┘
                   │ HTTPS
                   ↓
┌─────────────────────────────────────────────────┐
│         Supabase Cloud (사용자 프로젝트)         │
│  - 어느 프로젝트로 라우팅? (불명확)              │
└─────────────────────────────────────────────────┘
```

### 장점

- ✅ 로컬 설치 불필요
- ✅ 설정이 간단 (URL만 지정)
- ✅ Supabase에서 관리하는 중앙 집중식 서비스

### 단점

- ❌ 네트워크 의존성 (인터넷 연결 필수)
- ❌ 응답 속도가 느릴 수 있음
- ❌ 현재 작동하지 않는 것으로 보임 (연결 실패)
- ❌ 인증 방식이 명확하지 않음
- ❌ 공식 문서에 없는 방식

---

## 핵심 차이점 비교

### 1. 프로세스 격리 (Process Isolation)

#### npx 방식

각 사용자마다 독립적인 MCP 서버 프로세스

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ User A      │  │ User B      │  │ User C      │
│ MCP Server  │  │ MCP Server  │  │ MCP Server  │
│ (Process 1) │  │ (Process 2) │  │ (Process 3) │
└─────────────┘  └─────────────┘  └─────────────┘
      ↓                ↓                ↓
 Supabase A      Supabase B      Supabase C
```

#### HTTP 방식

모든 사용자가 공유 서비스 사용

```
┌─────────────┐
│ User A, B, C│
│ (All Users) │
└──────┬──────┘
       ↓
┌─────────────┐
│ 공유 MCP    │
│ Gateway     │
└──────┬──────┘
       ↓
  ??? (프로젝트 구분 방법 불명확)
```

### 2. 인증 정보 전달

#### npx 방식

```javascript
// 환경 변수로 직접 주입 - 안전하고 명확
env: {
  SUPABASE_URL: "https://kabndipxpxxhwqljhsdv.supabase.co",
  SUPABASE_KEY: "eyJhbGc..."  // 프로세스 내부에만 존재
}

// MCP Server 내부에서 직접 사용
const supabase = createClient(
  process.env.SUPABASE_URL,  // ✅ 명확
  process.env.SUPABASE_KEY   // ✅ 안전
);
```

#### HTTP 방식

```javascript
// 설정에 인증 정보가 없음!
{
  "type": "http",
  "url": "https://mcp.supabase.com/mcp"
  // ❌ 어떻게 인증할까?
  // ❌ 어느 프로젝트에 연결할까?
}

// 가능한 시나리오들 (모두 추측):
// 1. OAuth 플로우? (로그인 필요?)
// 2. URL에 토큰 포함? (보안 위험)
// 3. 쿠키/세션? (복잡)
// 4. 별도 설정 파일? (문서 없음)
```

### 3. 데이터 흐름 및 지연시간

#### npx 방식 (로컬 프로세스)

```
요청 → 응답: ~50-200ms

Claude Code ─(1ms: IPC)→ MCP Server ─(50-150ms: HTTPS)→ Supabase
              ↑                          ↓
              └────────(1ms: IPC)────────┘

총 지연: ~50-200ms (주로 Supabase API 호출 시간)
```

#### HTTP 방식 (원격 서비스)

```
요청 → 응답: ~200-500ms+

Claude Code ─(50-100ms: 네트워크)→ MCP Gateway ─(50-150ms: HTTPS)→ Supabase
              ↑                                      ↓
              └──────────(50-100ms: 네트워크)────────┘

총 지연: ~200-500ms (네트워크 홉 추가)
```

### 4. 보안 및 격리

#### npx 방식

```
사용자 A의 프로세스:
┌─────────────────────────────────┐
│ env.SUPABASE_KEY = "key_A"      │
│ → Supabase Project A            │
└─────────────────────────────────┘

사용자 B의 프로세스:
┌─────────────────────────────────┐
│ env.SUPABASE_KEY = "key_B"      │
│ → Supabase Project B            │
└─────────────────────────────────┘

✅ 완전히 격리됨
✅ 키가 네트워크에 노출되지 않음
```

#### HTTP 방식

```
┌─────────────────────────────────┐
│ 공유 MCP Gateway                 │
│ - User A의 요청                  │
│ - User B의 요청                  │
│ → 어떻게 구분? 어떻게 인증?       │
└─────────────────────────────────┘

❌ 인증 메커니즘 불명확
❌ 키가 네트워크로 전송될 가능성
❌ 멀티테넌시 격리 방법 불명확
```

### 비교 요약 테이블

| 항목 | npx 기반 | HTTP 기반 |
|------|----------|-----------|
| **실행 위치** | 로컬 머신 | 원격 서버 |
| **통신 방식** | stdin/stdout | HTTP/HTTPS |
| **설치 필요** | Node.js, npx | 없음 |
| **인증** | 환경 변수 | URL 또는 별도 인증 |
| **속도** | 빠름 (~50-200ms) | 느림 (~200-500ms+) |
| **안정성** | 높음 (로컬) | 네트워크 의존적 |
| **공식 문서** | ✅ 있음 | ❌ 없음 |
| **현재 상태** | ✅ 권장됨 | ❌ 작동 안 함 |
| **보안** | 높음 (로컬 격리) | 불명확 |
| **디버깅** | 용이 | 어려움 |

---

## 실제 코드 레벨 비교

### npx 방식 - 내부 구현 (실제 코드)

```typescript
// @modelcontextprotocol/server-supabase 내부
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 1. Supabase 클라이언트 초기화
const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// 2. MCP 서버 생성
const server = new Server({
  name: 'supabase',
  version: '1.0.0'
});

// 3. Tool 등록
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'supabase_query',
      description: 'Query a Supabase table',
      inputSchema: {
        type: 'object',
        properties: {
          table: { type: 'string' },
          select: { type: 'string' }
        }
      }
    }
  ]
}));

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'supabase_query') {
    // 4. Supabase 쿼리 실행
    const { data, error } = await supabase
      .from(args.table)
      .select(args.select);

    return {
      content: [
        { type: 'text', text: JSON.stringify(data, null, 2) }
      ]
    };
  }
});

// 5. stdio transport로 통신 시작
const transport = new StdioServerTransport();
await server.connect(transport);
```

### HTTP 방식 - 추측 구현

```typescript
// mcp.supabase.com 서버 (실제 코드 없음, 추측)
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();

app.post('/mcp', async (req, res) => {
  const { method, params } = req.body;

  // ❌ 문제: 어떻게 사용자의 Supabase 프로젝트 정보를 얻을까?

  // 옵션 1: 헤더에서?
  const projectUrl = req.headers['x-supabase-url'];
  const projectKey = req.headers['x-supabase-key'];

  // 옵션 2: 세션에서?
  const session = await getSession(req);
  const projectUrl = session.supabaseUrl;

  // 옵션 3: DB에서 조회?
  const user = await authenticateUser(req);
  const config = await db.getSupabaseConfig(user.id);

  // ❌ 모두 추측일 뿐, 실제 구현 불명확

  const supabase = createClient(projectUrl, projectKey);

  // Tool 실행
  if (method === 'tools/call' && params.name === 'supabase_query') {
    const { data } = await supabase
      .from(params.arguments.table)
      .select(params.arguments.select);

    res.json({
      result: {
        content: [{ type: 'text', text: JSON.stringify(data) }]
      }
    });
  }
});

app.listen(443);
```

---

## 결론

### npx 방식이 명확한 이유

1. **투명한 아키텍처**: 모든 코드가 로컬에서 실행되고 제어 가능
2. **명확한 인증**: 환경 변수로 직접 주입
3. **표준 프로토콜**: JSON-RPC over stdio (MCP 표준)
4. **공식 지원**: `@modelcontextprotocol/server-supabase` 패키지 존재
5. **높은 성능**: 네트워크 홉 최소화로 낮은 지연시간
6. **강력한 보안**: 프로세스 격리로 완전한 멀티테넌시

### HTTP 방식의 문제점

1. **불명확한 인증**: 설정에 인증 정보가 없음
2. **문서 부재**: 공식 문서에 없는 실험적 방식
3. **추가 지연**: 네트워크 홉 증가로 응답 시간 증가
4. **보안 우려**: 인증 정보 전달 방법 불명확
5. **디버깅 어려움**: 원격 서비스로 문제 추적이 복잡
6. **연결 실패**: 현재 작동하지 않음

### 권장 사항

**현재 프로젝트에는 npx 기반 방식을 사용하세요.**

HTTP 방식이 작동하지 않는 이유는 **인증 및 프로젝트 라우팅 메커니즘이 구현되지 않았거나, 설정 방법이 문서화되지 않았기 때문**으로 추정됩니다. Supabase의 공식 MCP 서버 문서에도 npx 기반 방식만 언급되어 있습니다.

### 설정 방법

npx 기반 MCP 서버 설정 방법은 [MCP_SETUP.md](./MCP_SETUP.md)를 참조하세요.

---

## 참고 자료

- [Model Context Protocol Specification](https://github.com/modelcontextprotocol)
- [Supabase MCP Server (NPM)](https://www.npmjs.com/package/@modelcontextprotocol/server-supabase)
- [Supabase Documentation](https://supabase.com/docs)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)

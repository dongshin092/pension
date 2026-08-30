import { Pool, type QueryResultRow } from "pg";

/**
 * PostgreSQL 연결.
 * DATABASE_URL 이 설정돼 있으면 DB를 사용하고, 없으면 repo.ts 가
 * 파일 기반 목업 저장소(store.ts)로 자동 폴백한다.
 *
 * 예) DATABASE_URL=postgresql://postgres:비밀번호@localhost:5432/maeumsok
 */
const connectionString = process.env.DATABASE_URL;

declare global {
  // 개발 모드 HMR 에서 커넥션이 계속 늘어나지 않도록 전역에 보관
  var __pgPool: Pool | undefined;
}

export function hasDb() {
  return Boolean(connectionString);
}

export function getPool(): Pool {
  if (!connectionString) {
    throw new Error("DATABASE_URL 이 설정되지 않았습니다.");
  }
  if (!globalThis.__pgPool) {
    globalThis.__pgPool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return globalThis.__pgPool;
}

export async function query<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(sql, params);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T | undefined> {
  const rows = await query<T>(sql, params);
  return rows[0];
}

/** 트랜잭션 헬퍼 (예약 생성처럼 여러 테이블을 함께 쓸 때) */
export async function withTransaction<T>(
  fn: (client: import("pg").PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const out = await fn(client);
    await client.query("COMMIT");
    return out;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

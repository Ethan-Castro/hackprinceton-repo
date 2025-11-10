import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';

type NeonClient = ReturnType<typeof neon>;
type PostgresClient = ReturnType<typeof postgres>;

type ConnectionMode = 'pooled' | 'unpooled';

const POOLED_ENV_KEYS = ['DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_PRISMA_URL'] as const;
const UNPOOLED_ENV_KEYS = ['DATABASE_URL_UNPOOLED', 'POSTGRES_URL_NON_POOLING', 'POSTGRES_URL_NO_SSL'] as const;
const MISSING_ENV_ERROR =
  `Missing database connection string. Set one of ${[...POOLED_ENV_KEYS, ...UNPOOLED_ENV_KEYS].join(', ')} in your environment.`;

let neonClient: NeonClient | null = null;
let pgClient: PostgresClient | null = null;

function pickConnectionString(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

function resolveDatabaseUrl(mode: ConnectionMode): string {
  const pooled = pickConnectionString(POOLED_ENV_KEYS);
  const unpooled = pickConnectionString(UNPOOLED_ENV_KEYS);

  if (mode === 'unpooled') {
    if (unpooled) return unpooled;
    if (pooled) return pooled;
    throw new Error(MISSING_ENV_ERROR);
  }

  if (pooled) return pooled;
  if (unpooled) return unpooled;
  throw new Error(MISSING_ENV_ERROR);
}

export function getDatabaseUrl(): string {
  return resolveDatabaseUrl('pooled');
}

export function getNeonClient(): NeonClient {
  if (!neonClient) {
    neonClient = neon(getDatabaseUrl());
  }
  return neonClient;
}

export async function query<T = Record<string, unknown>>(
  sqlText: string,
  params: unknown[] = []
): Promise<T[]> {
  const client = getNeonClient();
  const result = await client.query(sqlText, params);
  // Handle different return types from neon client
  if (Array.isArray(result)) {
    return result as T[];
  }
  if (result && typeof result === 'object' && 'rows' in result) {
    return (result as { rows: T[] }).rows;
  }
  return result as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sqlText: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sqlText, params);
  return rows[0] ?? null;
}

export function getPostgresClient(): PostgresClient {
  if (!pgClient) {
    const url = resolveDatabaseUrl('unpooled');
    pgClient = postgres(url, {
      ssl: 'require',
      max: 1,
      idle_timeout: 10,
      connect_timeout: 10,
    });
  }
  return pgClient;
}

export async function queryWithPostgres<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...params: unknown[]
): Promise<T[]> {
  const client = getPostgresClient();
  // Call without type argument and cast result
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (client as any)(strings, ...params);
  return result as T[];
}

export async function withTransaction<T>(
  work: (sql: PostgresClient) => Promise<T>
): Promise<T> {
  const client = getPostgresClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (client as any).begin(work) as Promise<T>;
}

export async function closeDatabaseClients() {
  if (pgClient) {
    await pgClient.end({ timeout: 5 }).catch(() => undefined);
    pgClient = null;
  }
  neonClient = null;
}

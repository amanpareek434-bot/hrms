import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
}

export function getPool(): mysql.Pool {
  if (!global.__mysqlPool) {
    global.__mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "peoplehub_hrms",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
    });
  }
  return global.__mysqlPool;
}

type Param = string | number | boolean | null;

export async function query<T = unknown>(sql: string, params: (Param | undefined)[] = []): Promise<T[]> {
  const cleaned = params.map((p) => (p === undefined ? null : p)) as Param[];
  const [rows] = await getPool().execute(sql, cleaned);
  return rows as T[];
}

export async function exec(sql: string, params: (Param | undefined)[] = []) {
  const cleaned = params.map((p) => (p === undefined ? null : p)) as Param[];
  const [result] = await getPool().execute(sql, cleaned);
  return result as mysql.ResultSetHeader;
}

export function uid(prefix = ""): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

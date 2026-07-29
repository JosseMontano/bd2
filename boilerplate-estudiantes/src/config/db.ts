import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const requiredVariables = ['DB_HOST', 'DB_USER', 'DB_NAME'] as const;

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Falta la variable de entorno obligatoria: ${variable}`);
  }
}

const port = Number(process.env.DB_PORT ?? 3306);
const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT ?? 10);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error('DB_PORT debe ser un puerto válido.');
}

if (!Number.isInteger(connectionLimit) || connectionLimit <= 0) {
  throw new Error('DB_CONNECTION_LIMIT debe ser un entero mayor que cero.');
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit,
  queueLimit: 0,
  charset: 'utf8mb4'
});

export async function testDatabaseConnection(): Promise<void> {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

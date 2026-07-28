import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = ['DB_HOST', 'DB_USER', 'DB_NAME'] as const;

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Falta la variable de entorno obligatoria ${variable}`);
  }
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
  queueLimit: 0,
  charset: 'utf8mb4',
  decimalNumbers: true
});

export async function checkDatabaseConnection(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

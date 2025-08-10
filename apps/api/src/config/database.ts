import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct path
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Debug: Log environment variables
console.log('🔧 Database Config Debug:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_SSL_MODE:', process.env.DB_SSL_MODE);

// SSL configuration for Azure PostgreSQL
const getSSLConfig = () => {
  if (process.env.NODE_ENV === 'production' || process.env.DB_SSL_MODE === 'require') {
    const sslConfig: any = {
      rejectUnauthorized: false,
      sslmode: 'require'
    };
    
    // Add SSL CA certificate if provided
    if (process.env.DB_SSL_CA && fs.existsSync(process.env.DB_SSL_CA)) {
      sslConfig.ca = fs.readFileSync(process.env.DB_SSL_CA);
    }
    
    return sslConfig;
  }
  
  return false;
};

// Database configuration for Azure PostgreSQL
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'db-ai-ecommerce.postgres.database.azure.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'marketplace',
  user: process.env.DB_USER || 'sa_admin@db-ai-ecommerce.postgres.database.azure.com',
  password: process.env.DB_PASSWORD || 'MarTech!Friday789',
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  // Azure PostgreSQL specific settings
  application_name: 'dynamic-flow-api',
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to Azure PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
});

// Test connection function
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW(), version()');
    client.release();
    console.log('✅ Azure PostgreSQL connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Azure PostgreSQL connection test failed:', error);
    return false;
  }
}

// Get database client
export async function getClient() {
  return await pool.connect();
}

// Execute query with automatic client release
export async function executeQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Execute transaction
export async function executeTransaction<T = any>(
  queries: Array<{ query: string; params?: any[] }>
): Promise<T[][]> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const results: T[][] = [];
    for (const { query, params } of queries) {
      const result = await client.query(query, params);
      results.push(result.rows);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Health check function for Azure
export async function healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as timestamp, version() as version');
    client.release();
    
    return {
      status: 'healthy',
      timestamp: result.rows[0].timestamp,
      version: result.rows[0].version
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: 'unknown'
    };
  }
}

export default pool;

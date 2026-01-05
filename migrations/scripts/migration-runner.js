// eslint-disable-next-line @typescript-eslint/no-require-imports
require("../../envConfig.js")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs').promises;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
const { Pool } =  require('pg')


let pool
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    })
  }
  return pool
}
const sql = getPool()

// Migration table to track which migrations have been applied
const MIGRATIONS_TABLE = '__drizzle_migrations';

/**
 * Ensures the migration table exists
 */
async function ensureMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
                                                     id SERIAL PRIMARY KEY,
                                                     name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                             );
  `;await sql.query(query);
}

/**
 * Gets a list of already applied migrations
 */
async function getAppliedMigrations(){
  const result = await sql`
    SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY id;
  `;
  return result.rows.map((row) => row.name);
}

/**
 * Gets available migration files from the migrations folder
 */
async function getAvailableMigrationFiles(){
  const migrationsDir = path.join(process.cwd(), 'db/migrations/sql');
  try {
    const files = await fs.readdir(migrationsDir);
    return files.filter(file => file.endsWith('.sql')).sort(); // Sorting for consistent order
  } catch (error) {
    console.error('Error reading migrations directory:', error);
    return [];
  }
}

/**
 * Apply a specific migration
 */
async function applyMigration(migrationFile) {
  const migrationsDir = path.join(process.cwd(), 'db/migrations/sql');
  const filePath = path.join(migrationsDir, migrationFile);

  try {
    console.log(`Applying migration: ${migrationFile}`);
    const migrationSql = await fs.readFile(filePath, 'utf8');

    // Execute the migration SQL statement
    await sql.query(migrationSql); // Execute without transaction
    await sql`
      INSERT INTO ${MIGRATIONS_TABLE} (name)
      VALUES (${migrationFile});
    `; // Mark the migration as applied

    console.log(`Successfully applied migration: ${migrationFile}`);
  } catch (error) {
    console.error(`Failed to apply migration ${migrationFile}:`, error);
    throw error;
  }
}

/**
 * Runs all pending migrations
 */
async function runMigrations() {
  try {
    console.log('Ensuring migrations table exists...');
    await ensureMigrationsTable();

    const appliedMigrations = await getAppliedMigrations();
    const availableMigrations = await getAvailableMigrationFiles();

    // Filter out the migrations that have already been applied
    const pendingMigrations = availableMigrations.filter(
      (migration) => !appliedMigrations.includes(migration)
    );

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to apply.');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migrations.`);

    // Apply each pending migration
    for (const migration of pendingMigrations) {
      await applyMigration(migration);
    }

    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

module.exports = { runMigrations }

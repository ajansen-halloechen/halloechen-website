#!/usr/bin/env node
/**
 * Seed 16 random users for local development.
 *
 * Usage:  pnpm db:seed-users
 * Password for all seeded users: Password1!
 */
import 'dotenv/config';
import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';
import pg from 'pg';

const COUNT = 16;
const SHARED_PASSWORD = 'Password1!';
const scrypt = promisify(scryptCb);

const FIRST_NAMES = [
  'Anna',
  'Ben',
  'Clara',
  'David',
  'Elena',
  'Felix',
  'Greta',
  'Hans',
  'Ida',
  'Jonas',
  'Klara',
  'Leon',
  'Mila',
  'Noah',
  'Olivia',
  'Paul',
  'Rosa',
  'Sam',
  'Tina',
  'Uwe',
];

const LAST_NAMES = [
  'Becker',
  'Fischer',
  'Hoffmann',
  'Klein',
  'Meyer',
  'Neumann',
  'Richter',
  'Schmidt',
  'Schulz',
  'Wagner',
  'Weber',
  'Wolf',
];

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DB_HOST ?? 'localhost';
  const port = process.env.DB_PORT ?? '5432';
  const user = encodeURIComponent(process.env.DB_USER ?? 'postgres');
  const password = encodeURIComponent(process.env.DB_PASSWORD ?? 'postgres');
  const database = process.env.DB_NAME ?? 'local';

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function toBase64NoPad(buf) {
  return Buffer.from(buf).toString('base64').replace(/=+$/, '');
}

/** Same scrypt/PHC format as nuxt-auth-utils (Adonis Scrypt defaults). */
async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  });

  return `$scrypt$n=16384,r=8,p=1$${toBase64NoPad(salt)}$${toBase64NoPad(hash)}`;
}

function buildUser(index) {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const slug = `${firstName}.${lastName}.${index + 1}`
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '');

  return {
    email: `${slug}@seed.local`,
    firstName,
    lastName,
    phoneNumber: `+4930${String(10000000 + Math.floor(Math.random() * 89999999))}`,
  };
}

async function main() {
  const pool = new pg.Pool({ connectionString: getDatabaseUrl() });
  const passwordHash = await hashPassword(SHARED_PASSWORD);

  let created = 0;
  let skipped = 0;

  try {
    for (let i = 0; i < COUNT; i++) {
      const user = buildUser(i);
      const result = await pool.query(
        `INSERT INTO users (email, first_name, last_name, phone_number, role, password_hash)
         VALUES ($1, $2, $3, $4, 'user', $5)
         ON CONFLICT (email) DO NOTHING
         RETURNING email`,
        [
          user.email,
          user.firstName,
          user.lastName,
          user.phoneNumber,
          passwordHash,
        ],
      );

      if (result.rowCount === 0) {
        skipped += 1;
        console.log(`Skipped (exists): ${user.email}`);
      } else {
        created += 1;
        console.log(`Seeded: ${user.email}`);
      }
    }
  } finally {
    await pool.end();
  }

  console.log(
    `\nDone. Created ${created}, skipped ${skipped}. Password for all: ${SHARED_PASSWORD}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

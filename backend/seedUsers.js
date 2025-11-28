// backend/seedUsers.js

import bcrypt from 'bcryptjs';
import { pool } from './src/db.js';

const SALT_ROUNDS = 10;

async function seedUsers() {
  try {
    console.log('Checking existing users...');

    // Check kitne users already hain
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const count = Number(countResult.rows[0].count);

    if (count > 0) {
      console.log(`Users already exist (${count}), skipping seed.`);
      return;
    }

    console.log('No users found, seeding default users...');

    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin@123',
        role: 'admin',
      },
      {
        name: 'Normal User',
        email: 'user@example.com',
        password: 'User@123',
        role: 'user',
      },
      {
        name: 'Read Only User',
        email: 'readonly@example.com',
        password: 'ReadOnly@123',
        role: 'read-only',
      },
    ];

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
      await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        [u.name, u.email, hash, u.role]
      );
      console.log(`Seeded user: ${u.email}`);
    }

    console.log('Seeding completed ✅');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    // DB connection close
    await pool.end();
    console.log('DB connection closed.');
  }
}

seedUsers();
import dotenv from 'dotenv';

import { drizzle } from 'drizzle-orm/node-postgres';
import { seed } from 'drizzle-seed';
import { usersTable } from './schema';
import bcrypt from 'bcrypt';

dotenv.config({ path: ['.env.local', '.env'] });
async function main(): Promise<void> {
  const db = drizzle(process.env['DATABASE_URL'] || '');

  await seed(db, { users: usersTable }).refine((f) => ({
    users: {
      count: 3,
      columns: {
        email: f.valuesFromArray({
          values: [
            'user1@example.com',
            'user2@example.com',
            'user3@example.com',
          ],
        }),
        passwordHash: f.default({
          defaultValue: bcrypt.hashSync('password123', 10),
        }),
      },
    },
  }));
}

main().catch((error) => console.error('Seeding failed', error));

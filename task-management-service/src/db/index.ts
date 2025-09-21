import dotenv from 'dotenv';

import { drizzle } from 'drizzle-orm/node-postgres';

dotenv.config({ path: ['.env.local', '.env'] });

export const db = drizzle(process.env['DATABASE_URL'] || '');

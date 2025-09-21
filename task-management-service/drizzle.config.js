const dotenv = require('dotenv');
const { defineConfig } = require('drizzle-kit');

dotenv.config({ path: ['.env.local', '.env'] });

module.exports = defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

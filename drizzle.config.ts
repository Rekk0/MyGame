import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './electron/services/db/schema.ts',
  out: './electron/services/db/migrations'
})

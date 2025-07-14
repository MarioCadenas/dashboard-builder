
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  createUserPreferencesInputSchema,
  getUserPreferencesInputSchema,
  updateUserPreferencesInputSchema
} from './schema';
import { createUserPreferences } from './handlers/create_user_preferences';
import { getUserPreferences } from './handlers/get_user_preferences';
import { updateUserPreferences } from './handlers/update_user_preferences';
import { upsertUserTheme } from './handlers/upsert_user_theme';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Theme management endpoints
  createUserPreferences: publicProcedure
    .input(createUserPreferencesInputSchema)
    .mutation(({ input }) => createUserPreferences(input)),
    
  getUserPreferences: publicProcedure
    .input(getUserPreferencesInputSchema)
    .query(({ input }) => getUserPreferences(input)),
    
  updateUserPreferences: publicProcedure
    .input(updateUserPreferencesInputSchema)
    .mutation(({ input }) => updateUserPreferences(input)),
    
  upsertUserTheme: publicProcedure
    .input(updateUserPreferencesInputSchema)
    .mutation(({ input }) => upsertUserTheme(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();

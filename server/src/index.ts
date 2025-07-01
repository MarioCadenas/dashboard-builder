
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createDashboardInputSchema, 
  updateDashboardInputSchema,
  createDashboardComponentInputSchema,
  updateDashboardComponentInputSchema 
} from './schema';

// Import handlers
import { createDashboard } from './handlers/create_dashboard';
import { getDashboards } from './handlers/get_dashboards';
import { getDashboardById } from './handlers/get_dashboard_by_id';
import { updateDashboard } from './handlers/update_dashboard';
import { deleteDashboard } from './handlers/delete_dashboard';
import { createDashboardComponent } from './handlers/create_dashboard_component';
import { getDashboardComponents } from './handlers/get_dashboard_components';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Dashboard management endpoints
  createDashboard: publicProcedure
    .input(createDashboardInputSchema)
    .mutation(({ input }) => createDashboard(input)),

  getDashboards: publicProcedure
    .query(() => getDashboards()),

  getDashboardById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getDashboardById(input.id)),

  updateDashboard: publicProcedure
    .input(updateDashboardInputSchema)
    .mutation(({ input }) => updateDashboard(input)),

  deleteDashboard: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteDashboard(input.id)),

  // Dashboard component management endpoints
  createDashboardComponent: publicProcedure
    .input(createDashboardComponentInputSchema)
    .mutation(({ input }) => createDashboardComponent(input)),

  getDashboardComponents: publicProcedure
    .input(z.object({ dashboardId: z.number() }))
    .query(({ input }) => getDashboardComponents(input.dashboardId)),
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

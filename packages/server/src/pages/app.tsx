// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import { withPageErrorBoundary } from "@/src/lib/components/errors/PageErrorBoundary";
import Landing from "./landing";
import Upload from "./upload";
import History from "./history";
import LinkGenerated from "./link";
import Download from "./download";
import { z } from 'zod';
import { useAnalytics } from '../lib/hooks/use-analytics';

const rootRoute = createRootRoute({
  component: () => {
    useAnalytics();

    return (
      <>
        <Outlet />
        {/* <TanStackRouterDevtools /> */}
      </>
    )
  },
})

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    return withPageErrorBoundary(Upload)({});
  },
})

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/landing',
  component: function LandingPage() {
    return withPageErrorBoundary(Landing)({});
  },
})

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: function HistoryPage() {
    return withPageErrorBoundary(History)({});
  },
})

const linkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/link/$cid',
  component: function LinkPage() {
    return withPageErrorBoundary(LinkGenerated)({});
  },
  validateSearch: z.object({
    name: z.string(),
    size: z.string(),
    key: z.string(),
  }),
})

const downloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/download/$cid',
  component: function DownloadPage() {
    return withPageErrorBoundary(Download)({});
  },
  validateSearch: z.object({
    name: z.string().optional(),
    type: z.string().optional(),
  }),
})

const routeTree = rootRoute.addChildren([uploadRoute, landingRoute, historyRoute, linkRoute, downloadRoute])
const router = createRouter({
  routeTree,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router;
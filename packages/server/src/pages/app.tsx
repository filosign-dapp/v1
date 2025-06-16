// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import { withPageErrorBoundary } from "@/src/lib/components/errors/PageErrorBoundary";
import Home from "./home";
import Upload from "./upload";
import LinkGenerated from "./link";
import Download from "./download";
import { z } from 'zod';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    return withPageErrorBoundary(Upload)({});
  },
})

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/landing',
  component: function UploadPage() {
    return withPageErrorBoundary(Home)({});
  },
})

const linkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/link/$cid',
  component: function LinkPage() {
    return withPageErrorBoundary(LinkGenerated)({});
  },
  validateSearch: z.object({
    name: z.string().optional(),
    size: z.string().optional(),
    type: z.string().optional(),
    key: z.string().optional(),
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

const routeTree = rootRoute.addChildren([indexRoute, uploadRoute, linkRoute, downloadRoute])
const router = createRouter({
  routeTree,
})
  
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router;
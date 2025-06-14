// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import { withPageErrorBoundary } from "@/src/lib/components/errors/PageErrorBoundary";
import Home from "./home";
import Download from "./download";

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
    return withPageErrorBoundary(Home)({});
  },
})

const downloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/download/$cid',
  component: function DownloadPage() {
    return withPageErrorBoundary(Download)({});
  },
})

const routeTree = rootRoute.addChildren([indexRoute, downloadRoute])
const router = createRouter({
  routeTree,
})
  
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router;
import { Suspense, lazy } from "react";
import { Link, Redirect, Route, Switch, useLocation } from "wouter";
import { AppLayout } from "./app/AppLayout";
import { ErrorBoundary } from "@/shared/errors";

const DashboardModule = lazy(() => import("./modules/dashboard/DashboardModule"));
const CatalogModule = lazy(() => import("./modules/catalog/CatalogModule"));
const SettingsModule = lazy(() => import("./modules/settings/SettingsModule"));
const AdminModule = lazy(() => import("./modules/admin/AdminModule"));
const EnterpriseModule = lazy(() => import("./modules/enterprise/EnterpriseModule"));
const HistoryModule = lazy(() => import("./modules/history/HistoryModule"));

function LoadingRoute() {
  return <p data-testid="route-loading">Loading module...</p>;
}

function NotFoundRoute() {
  return (
    <section data-testid="global-not-found">
      <h2>Route not found</h2>
      <p>The route does not exist. Try one of these modules:</p>
      <ul>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link href="/catalog">Catalog</Link>
        </li>
        <li>
          <Link href="/settings">Settings</Link>
        </li>
        <li>
          <Link href="/admin">Admin</Link>
        </li>
        <li>
          <Link href="/enterprise">Enterprise</Link>
        </li>
      </ul>
    </section>
  );
}

function App() {
  const [location] = useLocation();

  return (
    <AppLayout>
      {/*
        Route-level boundary: catches render errors AND failed lazy-module imports thrown
        through Suspense, so one broken module shows a localized fallback instead of
        white-screening the shell. `resetKeys={[location]}` clears the error when the user
        navigates, so a transient failure doesn't trap them on a broken route.
      */}
      <ErrorBoundary resetKeys={[location]}>
        <Suspense fallback={<LoadingRoute />}>
          <Switch>
          <Route path="/">
            {/* Declarative redirect: renders null and navigates during render, so there is
                no "Redirecting..." flash of intermediate content. */}
            <Redirect
              to="/dashboard"
              replace
            />
          </Route>
          <Route path="/dashboard">
            <DashboardModule />
          </Route>
          <Route path="/catalog/*">
            <CatalogModule />
          </Route>
          <Route path="/catalog">
            <CatalogModule />
          </Route>
          <Route path="/settings/*">
            <SettingsModule />
          </Route>
          <Route path="/settings">
            <SettingsModule />
          </Route>
          <Route path="/admin/*">
            <AdminModule />
          </Route>
          <Route path="/admin">
            <AdminModule />
          </Route>
          <Route path="/enterprise/*">
            <EnterpriseModule />
          </Route>
          <Route path="/enterprise">
            <EnterpriseModule />
          </Route>
          <Route path="/history">
            <HistoryModule />
          </Route>
          <Route>
            <NotFoundRoute />
          </Route>
        </Switch>
        </Suspense>
      </ErrorBoundary>
    </AppLayout>
  );
}

export default App;

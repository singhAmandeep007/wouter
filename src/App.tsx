import { Suspense, lazy, useEffect } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { AppLayout } from "./app/AppLayout";

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

function RootRedirect() {
  const [, navigate] = useLocation();

  useEffect(() => {
    void navigate("/dashboard", { replace: true });
  }, [navigate]);

  return <p data-testid="root-redirecting">Redirecting to dashboard...</p>;
}

function App() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingRoute />}>
        <Switch>
          <Route path="/">
            <RootRedirect />
            {/* <DashboardModule /> */}
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
    </AppLayout>
  );
}

export default App;

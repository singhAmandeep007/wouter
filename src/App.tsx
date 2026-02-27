import { Suspense, lazy } from "react";
import { Link, Route, Switch } from "wouter";
import { AppLayout } from "./app/AppLayout";

const DashboardModule = lazy(() => import("./modules/dashboard/DashboardModule"));
const CatalogModule = lazy(() => import("./modules/catalog/CatalogModule"));
const SettingsModule = lazy(() => import("./modules/settings/SettingsModule"));
const HistoryModule = lazy(() => import("./modules/history/HistoryModule"));

function LoadingRoute() {
  return <p>Loading module...</p>;
}

function NotFoundRoute() {
  return (
    <section>
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
      </ul>
    </section>
  );
}

function App() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingRoute />}>
        <Switch>
          <Route path="/">
            <DashboardModule />
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

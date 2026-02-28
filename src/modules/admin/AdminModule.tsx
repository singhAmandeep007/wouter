import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
// NOTE: This one line will load entire vendor-analytics chunk as date-fns is part of that chunk. In a real app, we would likely want to split this further so that date-fns is in its own chunk and only loaded by the modules that need it.
// import { format } from "date-fns";
import { ActiveLink } from "../../shared/routing/ActiveLink";

function AdminDashboardPage() {
  // const date = format(new Date(), "MMMM do, yyyy H:mm:ss");
  // console.log("Admin dashboard rendered at", date);
  return (
    <section
      className="module-card"
      data-testid="admin-dashboard-page"
    >
      <h3>Admin Dashboard</h3>
      <p>Overview page for admin monitoring and quick actions.</p>
    </section>
  );
}

function AdminApiPage() {
  return (
    <section
      className="module-card"
      data-testid="admin-api-page"
    >
      <h3>Admin API</h3>
      <p>API management page with endpoints and access controls.</p>
    </section>
  );
}

function AdminChatbotPage() {
  return (
    <section
      className="module-card"
      data-testid="admin-chatbot-page"
    >
      <h3>Admin Chatbot</h3>
      <p>Chatbot operations page with logs and configuration controls.</p>
    </section>
  );
}

function AdminDefaultRedirect() {
  const [, navigate] = useLocation();

  useEffect(() => {
    void navigate("/admin/api", { replace: true });
  }, [navigate]);

  return <p data-testid="admin-redirecting">Redirecting to admin API...</p>;
}

function AdminNotFound() {
  return (
    <section
      className="module-card"
      data-testid="admin-not-found"
    >
      <h3>Admin route not found</h3>
      <p>Use one of the admin tabs above.</p>
    </section>
  );
}

function AdminModule() {
  return (
    <section data-testid="admin-module">
      <h2>Admin Module Routes</h2>
      <ul className="module-links">
        <li>
          <ActiveLink
            exact
            href="/admin/dashboard"
            testId="admin-tab-dashboard"
          >
            Dashboard
          </ActiveLink>
        </li>
        <li>
          <ActiveLink
            exact
            href="/admin/api"
            testId="admin-tab-api"
          >
            API
          </ActiveLink>
        </li>
        <li>
          <ActiveLink
            exact
            href="/admin/chatbot"
            testId="admin-tab-chatbot"
          >
            Chatbot
          </ActiveLink>
        </li>
      </ul>

      <Switch>
        <Route path="/admin">
          <AdminDefaultRedirect />
        </Route>
        <Route path="/admin/dashboard">
          <AdminDashboardPage />
        </Route>
        <Route path="/admin/api">
          <AdminApiPage />
        </Route>
        <Route path="/admin/chatbot">
          <AdminChatbotPage />
        </Route>
        <Route>
          <AdminNotFound />
        </Route>
      </Switch>
    </section>
  );
}

export default AdminModule;

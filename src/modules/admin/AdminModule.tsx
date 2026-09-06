import { Redirect, Route, Switch } from "wouter";
// NOTE: This one line would load the entire vendor-analytics chunk, as date-fns is part of
// that chunk. In a real app we would split date-fns into its own chunk loaded only where
// needed. (See docs/architecture and optimization-foundations for the chunking strategy.)
// import { format } from "date-fns";
import { Card, ModuleNav } from "@/shared/ui";

function AdminDashboardPage() {
  return (
    <Card testId="admin-dashboard-page">
      <h3>Admin Dashboard</h3>
      <p>Overview page for admin monitoring and quick actions.</p>
    </Card>
  );
}

function AdminApiPage() {
  return (
    <Card testId="admin-api-page">
      <h3>Admin API</h3>
      <p>API management page with endpoints and access controls.</p>
    </Card>
  );
}

function AdminChatbotPage() {
  return (
    <Card testId="admin-chatbot-page">
      <h3>Admin Chatbot</h3>
      <p>Chatbot operations page with logs and configuration controls.</p>
    </Card>
  );
}

function AdminNotFound() {
  return (
    <Card testId="admin-not-found">
      <h3>Admin route not found</h3>
      <p>Use one of the admin tabs above.</p>
    </Card>
  );
}

function AdminModule() {
  return (
    <section data-testid="admin-module">
      <h2>Admin Module Routes</h2>
      <ModuleNav
        items={[
          { href: "/admin/dashboard", label: "Dashboard", exact: true, testId: "admin-tab-dashboard" },
          { href: "/admin/api", label: "API", exact: true, testId: "admin-tab-api" },
          { href: "/admin/chatbot", label: "Chatbot", exact: true, testId: "admin-tab-chatbot" },
        ]}
      />

      <Switch>
        <Route path="/admin">
          <Redirect
            to="/admin/api"
            replace
          />
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

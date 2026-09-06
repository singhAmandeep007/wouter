import { Link } from "wouter";
import { useDashboardSummary } from "@/resources/dashboard";
import { Card, PageMessage } from "@/shared/ui";

function DashboardModule() {
  const { data: summary, error, isPending } = useDashboardSummary();

  if (error) {
    return (
      <PageMessage
        tone="error"
        testId="dashboard-error"
      >
        Failed to load dashboard: {error.message}
      </PageMessage>
    );
  }

  if (isPending) {
    return <PageMessage testId="dashboard-loading">Loading dashboard...</PageMessage>;
  }

  return (
    <Card testId="dashboard-module">
      <h2>Dashboard</h2>
      <p>Welcome back, {summary.profile.name}</p>
      <p>Open orders: {summary.openOrders}</p>
      <p>Revenue this month: ${summary.revenueMonth}</p>
      <h3>Low stock products</h3>
      <ul>
        {summary.lowStockProducts.map((product) => (
          <li key={product.id}>
            <Link href={`/catalog/product/${product.id}`}>{product.title}</Link> (stock: {product.stock})
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default DashboardModule;

import { Link } from "wouter";
import { useDashboardSummary } from "@/resources/dashboard";
import "./dashboard.css";

function DashboardModule() {
  const { data: summary, error, isPending } = useDashboardSummary();

  if (error) {
    return <p>Failed to load dashboard: {error.message}</p>;
  }

  if (isPending) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <section
      className="module-card"
      data-testid="dashboard-module"
    >
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
    </section>
  );
}

export default DashboardModule;

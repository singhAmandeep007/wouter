import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "../../shared/api/client";
import type { DashboardSummary } from "../../shared/api/types";
import "./dashboard.css";

function DashboardModule() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSummary()
      .then(setSummary)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return <p>Failed to load dashboard: {error}</p>;
  }

  if (!summary) {
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

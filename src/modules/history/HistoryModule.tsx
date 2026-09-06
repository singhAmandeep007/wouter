import { Link, useLocation } from "wouter";
import { Card } from "@/shared/ui";

function HistoryModule() {
  const [location, navigate] = useLocation();

  return (
    <Card testId="history-module">
      <h2>History / Navigation Demo</h2>
      <p>This route helps verify history integration with Wouter.</p>
      <p>Current path: {location}</p>
      <p>Browser history length: {window.history.length}</p>
      <div>
        <button
          data-testid="history-push-dashboard"
          onClick={() => navigate("/dashboard")}
          type="button"
        >
          Push: /dashboard
        </button>{" "}
        <button
          data-testid="history-push-catalog"
          onClick={() => navigate("/catalog")}
          type="button"
        >
          Push: /catalog
        </button>{" "}
        <button
          data-testid="history-push-deep"
          onClick={() => navigate("/settings/orders/o-5001/items/oi-1")}
          type="button"
        >
          Push deep route
        </button>
      </div>
      <p>
        <Link href="/does-not-exist">Try global not-found route</Link>
      </p>
    </Card>
  );
}

export default HistoryModule;

import { format } from "date-fns";
import { groupBy, orderBy, sumBy } from "lodash-es";
import { useEffect, useMemo, useRef, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { z } from "zod";
import { api } from "../../shared/api/client";
import { ActiveLink } from "../../shared/routing/ActiveLink";
import type { ChatbotTranscript, EnterpriseKpi, IntegrationStatus, RevenuePoint } from "../../shared/api/types";
import "./enterprise.css";

const kpiSchema = z.object({
  activeTenants: z.number().int().nonnegative(),
  apiRequestsPerMinute: z.number().int().nonnegative(),
  slaPercent: z.number().min(0).max(100),
  unresolvedIncidents: z.number().int().nonnegative(),
});

function EnterpriseDashboardPage() {
  const [kpi, setKpi] = useState<EnterpriseKpi | null>(null);

  useEffect(() => {
    void api.getEnterpriseKpi().then((payload) => {
      const parsed = kpiSchema.safeParse(payload);
      if (parsed.success) {
        setKpi(parsed.data);
      }
    });
  }, []);

  if (!kpi) {
    return <p data-testid="enterprise-dashboard-loading">Loading enterprise dashboard...</p>;
  }

  return (
    <section
      className="module-card"
      data-testid="enterprise-dashboard-page"
    >
      <h3>Enterprise Dashboard</h3>
      <div className="enterprise-grid">
        <div className="enterprise-metric">
          <span>Active Tenants</span>
          <strong>{kpi.activeTenants}</strong>
        </div>
        <div className="enterprise-metric">
          <span>API RPM</span>
          <strong>{kpi.apiRequestsPerMinute.toLocaleString()}</strong>
        </div>
        <div className="enterprise-metric">
          <span>SLA</span>
          <strong>{kpi.slaPercent}%</strong>
        </div>
        <div className="enterprise-metric">
          <span>Open Incidents</span>
          <strong>{kpi.unresolvedIncidents}</strong>
        </div>
      </div>
    </section>
  );
}

function EnterpriseAnalyticsPage() {
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    void api.getEnterpriseRevenue().then(setRevenue);
  }, []);

  useEffect(() => {
    if (revenue.length === 0 || !canvasRef.current) {
      return;
    }

    let disposed = false;
    let chart: { destroy: () => void } | null = null;

    async function renderChart() {
      const chartModule = await import("chart.js/auto");
      if (disposed || !canvasRef.current) {
        return;
      }

      const Chart = chartModule.default;
      chart = new Chart(canvasRef.current, {
        type: "line",
        data: {
          labels: revenue.map((entry) => entry.month),
          datasets: [
            {
              label: "Revenue",
              data: revenue.map((entry) => entry.amount),
              borderWidth: 2,
            },
          ],
        },
      });
    }

    void renderChart();

    return () => {
      disposed = true;
      if (chart) {
        chart.destroy();
      }
    };
  }, [revenue]);

  const totalRevenue = useMemo(() => sumBy(revenue, (entry: RevenuePoint) => entry.amount), [revenue]);

  return (
    <section
      className="module-card"
      data-testid="enterprise-analytics-page"
    >
      <h3>Enterprise Analytics</h3>
      <p>Total last 12 months: ${totalRevenue.toLocaleString()}</p>
      <canvas
        ref={canvasRef}
        height={180}
        data-testid="enterprise-revenue-chart"
      />
    </section>
  );
}

function EnterpriseIntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [transcripts, setTranscripts] = useState<ChatbotTranscript[]>([]);

  useEffect(() => {
    async function loadData() {
      const integrationData = await api.getEnterpriseIntegrations();
      setIntegrations(orderBy(integrationData, [(entry: IntegrationStatus) => entry.latencyMs], ["desc"]));

      const axiosModule = await import("axios");
      const transcriptResponse = await axiosModule.default.get<ChatbotTranscript[]>(
        "/api/enterprise/chatbot/transcripts"
      );
      setTranscripts(transcriptResponse.data);
    }

    void loadData();
  }, []);

  const transcriptsByChannel = useMemo<Record<string, ChatbotTranscript[]>>(
    () => groupBy(transcripts, (item: ChatbotTranscript) => item.channel),
    [transcripts],
  );

  return (
    <section
      className="module-card"
      data-testid="enterprise-integrations-page"
    >
      <h3>Enterprise Integrations</h3>
      <ul>
        {integrations.map((integration) => (
          <li key={integration.id}>
            {integration.name} ({integration.owner}) — {integration.health} — {integration.latencyMs}ms
          </li>
        ))}
      </ul>

      <h4>Chatbot traffic by channel</h4>
      <ul>
        {Object.entries(transcriptsByChannel).map(([channel, items]: [string, ChatbotTranscript[]]) => (
          <li key={channel}>
            {channel}: {items.length} conversations, {sumBy(items, (item: ChatbotTranscript) => item.tokens)} tokens
          </li>
        ))}
      </ul>
    </section>
  );
}

function EnterpriseContractsPage() {
  const [validatedAt, setValidatedAt] = useState<string>("");
  const [status, setStatus] = useState<string>("Validating...");

  useEffect(() => {
    void api.getEnterpriseKpi().then((payload) => {
      const result = kpiSchema.safeParse(payload);
      if (result.success) {
        setStatus("Contract valid");
        setValidatedAt(format(new Date(), "yyyy-MM-dd HH:mm:ss"));
      } else {
        setStatus("Contract invalid");
      }
    });
  }, []);

  return (
    <section
      className="module-card"
      data-testid="enterprise-contracts-page"
    >
      <h3>Enterprise API Contracts</h3>
      <p>Status: {status}</p>
      {validatedAt ? <p>Validated at: {validatedAt}</p> : null}
    </section>
  );
}

function EnterpriseDefaultRedirect() {
  const [, navigate] = useLocation();

  useEffect(() => {
    void navigate("/enterprise/dashboard", { replace: true });
  }, [navigate]);

  return <p data-testid="enterprise-redirecting">Redirecting to enterprise dashboard...</p>;
}

function EnterpriseNotFound() {
  return (
    <section
      className="module-card"
      data-testid="enterprise-not-found"
    >
      <h3>Enterprise route not found</h3>
      <p>Pick one of the enterprise routes above.</p>
    </section>
  );
}

function EnterpriseModule() {
  return (
    <section data-testid="enterprise-module">
      <h2>Enterprise Module Routes</h2>
      <ul className="module-links">
        <li>
          <ActiveLink
            exact
            href="/enterprise/dashboard"
            testId="enterprise-tab-dashboard"
          >
            Dashboard
          </ActiveLink>
        </li>
        <li>
          <ActiveLink
            exact
            href="/enterprise/analytics"
            testId="enterprise-tab-analytics"
          >
            Analytics
          </ActiveLink>
        </li>
        <li>
          <ActiveLink
            exact
            href="/enterprise/integrations"
            testId="enterprise-tab-integrations"
          >
            Integrations
          </ActiveLink>
        </li>
        <li>
          <ActiveLink
            exact
            href="/enterprise/contracts"
            testId="enterprise-tab-contracts"
          >
            Contracts
          </ActiveLink>
        </li>
      </ul>

      <Switch>
        <Route path="/enterprise">
          <EnterpriseDefaultRedirect />
        </Route>
        <Route path="/enterprise/dashboard">
          <EnterpriseDashboardPage />
        </Route>
        <Route path="/enterprise/analytics">
          <EnterpriseAnalyticsPage />
        </Route>
        <Route path="/enterprise/integrations">
          <EnterpriseIntegrationsPage />
        </Route>
        <Route path="/enterprise/contracts">
          <EnterpriseContractsPage />
        </Route>
        <Route>
          <EnterpriseNotFound />
        </Route>
      </Switch>
    </section>
  );
}

export default EnterpriseModule;

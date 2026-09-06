import { format } from "date-fns";
import { groupBy, orderBy, sumBy } from "lodash-es";
import { useEffect, useMemo, useRef } from "react";
import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import { Redirect, Route, Switch } from "wouter";
import {
  useEnterpriseIntegrations,
  useEnterpriseKpi,
  useEnterpriseRevenue,
  useEnterpriseTranscripts,
} from "@/resources/enterprise";
import type { ChatbotTranscript, IntegrationStatus, RevenuePoint } from "@/resources/enterprise";
import { ActiveLink } from "../../shared/routing/ActiveLink";
import "@xyflow/react/dist/style.css";
import "./enterprise.css";
import "./enterprise-flow.css";

const enterpriseFlowNodes = [
  { id: "e1", position: { x: 20, y: 80 }, data: { label: "Gateway" }, type: "input" },
  { id: "e2", position: { x: 220, y: 20 }, data: { label: "Tenant API" } },
  { id: "e3", position: { x: 220, y: 140 }, data: { label: "Chatbot API" } },
  { id: "e4", position: { x: 460, y: 80 }, data: { label: "Analytics Pipeline" } },
  { id: "e5", position: { x: 680, y: 80 }, data: { label: "Ops Dashboard" }, type: "output" },
];

const enterpriseFlowEdges = [
  { id: "ee1-2", source: "e1", target: "e2", animated: true },
  { id: "ee1-3", source: "e1", target: "e3", animated: true },
  { id: "ee2-4", source: "e2", target: "e4", animated: true },
  { id: "ee3-4", source: "e3", target: "e4", animated: true },
  { id: "ee4-5", source: "e4", target: "e5", animated: true },
];

function EnterpriseDashboardPage() {
  // Runtime zod validation now lives in enterpriseService.getKpi(); an invalid payload
  // rejects the query, so `kpi` is only set when the contract holds.
  const { data: kpi } = useEnterpriseKpi();

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
  const { data: revenue = [] } = useEnterpriseRevenue();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
  const { data: integrationData = [] } = useEnterpriseIntegrations();
  const { data: transcripts = [] } = useEnterpriseTranscripts();

  const integrations = useMemo(
    () => orderBy(integrationData, [(entry: IntegrationStatus) => entry.latencyMs], ["desc"]),
    [integrationData]
  );

  const transcriptsByChannel = useMemo<Record<string, ChatbotTranscript[]>>(
    () => groupBy(transcripts, (item: ChatbotTranscript) => item.channel),
    [transcripts]
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
  // Reuses the SAME cached KPI query as the dashboard tab (deduped by key). The zod
  // validation in the service is the contract check: success => valid, rejection => invalid.
  const kpiQuery = useEnterpriseKpi();

  const status = kpiQuery.isPending ? "Validating..." : kpiQuery.isError ? "Contract invalid" : "Contract valid";
  // `dataUpdatedAt` is a stable timestamp from the cache, so this doesn't churn per render.
  const validatedAt = kpiQuery.isSuccess ? format(new Date(kpiQuery.dataUpdatedAt), "yyyy-MM-dd HH:mm:ss") : "";

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

function EnterpriseWorkflowPage() {
  return (
    <section
      className="module-card"
      data-testid="enterprise-workflow-page"
    >
      <h3>Enterprise System Workflow</h3>
      <p>Topology view of enterprise request flow and analytics processing.</p>
      <div className="flow-surface enterprise-flow">
        <ReactFlow
          fitView
          nodes={enterpriseFlowNodes}
          edges={enterpriseFlowEdges}
        >
          <MiniMap />
          <Controls />
          <Background gap={16} />
        </ReactFlow>
      </div>
    </section>
  );
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
        <li>
          <ActiveLink
            exact
            href="/enterprise/workflow"
            testId="enterprise-tab-workflow"
          >
            Workflow
          </ActiveLink>
        </li>
      </ul>

      <Switch>
        <Route path="/enterprise">
          <Redirect
            to="/enterprise/dashboard"
            replace
          />
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
        <Route path="/enterprise/workflow">
          <EnterpriseWorkflowPage />
        </Route>
        <Route>
          <EnterpriseNotFound />
        </Route>
      </Switch>
    </section>
  );
}

export default EnterpriseModule;

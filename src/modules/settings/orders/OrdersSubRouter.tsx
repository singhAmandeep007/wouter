import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import { Link, Route, Switch } from "wouter";
import { useOrder, useOrders } from "@/resources/order";
import { Card, FlowSurface, ModuleNav, PageMessage } from "@/shared/ui";
import "@xyflow/react/dist/style.css";

const liveOrderNodes = [
  { id: "n1", position: { x: 10, y: 70 }, data: { label: "Order Received" }, type: "input" },
  { id: "n2", position: { x: 220, y: 70 }, data: { label: "Payment Confirmed" } },
  { id: "n3", position: { x: 440, y: 70 }, data: { label: "Packed" } },
  { id: "n4", position: { x: 640, y: 70 }, data: { label: "Shipped" }, type: "output" },
];

const liveOrderEdges = [
  { id: "e1-2", source: "n1", target: "n2", animated: true },
  { id: "e2-3", source: "n2", target: "n3", animated: true },
  { id: "e3-4", source: "n3", target: "n4", animated: true },
];

function OrdersDefault() {
  const { data: orders = [] } = useOrders();

  return (
    <Card testId="orders-list-page">
      <h3>Orders List (Default)</h3>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`/settings/orders/${order.id}`}>{order.id}</Link> - {order.status} - ${order.totalAmount}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function OrderDetails({ orderId }: { orderId: string }) {
  const { data: order } = useOrder(orderId);

  if (!order) {
    return <PageMessage testId="order-loading">Loading order...</PageMessage>;
  }

  return (
    <Card testId="order-details-page">
      <h3>Order {order.id}</h3>
      <p>Status: {order.status}</p>
      <p>Total: ${order.totalAmount}</p>

      <h4>Items</h4>
      <ul>
        {order.items.map((item) => (
          <li key={item.id}>
            <Link href={`/settings/orders/${order.id}/items/${item.id}`}>{item.title}</Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function OrderItemDetails({ orderId, itemId }: { orderId: string; itemId: string }) {
  const { data: order } = useOrder(orderId);

  const item = order?.items.find((entry) => entry.id === itemId);

  if (!order) {
    return <PageMessage testId="order-item-loading">Loading order item...</PageMessage>;
  }

  if (!item) {
    return (
      <PageMessage
        tone="error"
        testId="order-item-missing"
      >
        Order item not found.
      </PageMessage>
    );
  }

  return (
    <Card testId="order-item-details-page">
      <h3>Order Item Details</h3>
      <p>Order: {orderId}</p>
      <p>Item: {item.title}</p>
      <p>Quantity: {item.quantity}</p>
      <p>Unit Price: ${item.unitPrice}</p>
      <p>
        <Link href={`/settings/orders/${orderId}`}>Back to order</Link>
      </p>
    </Card>
  );
}

function OrdersNotFound() {
  return (
    <Card testId="orders-not-found">
      <h3>Orders sub-route not found</h3>
      <p>
        Return to <Link href="/settings/orders">orders list</Link>.
      </p>
    </Card>
  );
}

function LiveOrderFlowPage() {
  return (
    <Card testId="orders-live-page">
      <h3>Live Order Pipeline</h3>
      <p>Real-time order movement from intake to shipping.</p>
      <FlowSurface>
        <ReactFlow
          fitView
          nodes={liveOrderNodes}
          edges={liveOrderEdges}
        >
          <MiniMap />
          <Controls />
          <Background gap={16} />
        </ReactFlow>
      </FlowSurface>
    </Card>
  );
}

function OrdersSubRouter() {
  return (
    <section data-testid="orders-sub-router">
      <h3>Orders Sub Router</h3>
      <ModuleNav
        items={[
          { href: "/settings/orders", label: "/settings/orders", exact: true, testId: "orders-tab-list" },
          { href: "/settings/orders/o-5001", label: "/settings/orders/o-5001", exact: true, testId: "orders-tab-order" },
          {
            href: "/settings/orders/o-5001/items/oi-1",
            label: "/settings/orders/o-5001/items/oi-1",
            exact: true,
            testId: "orders-tab-item",
          },
          { href: "/settings/orders/live", label: "/settings/orders/live", exact: true, testId: "orders-tab-live" },
        ]}
      />

      <Switch>
        <Route path="/settings/orders">
          <OrdersDefault />
        </Route>
        <Route path="/settings/orders/live">
          <LiveOrderFlowPage />
        </Route>
        <Route path="/settings/orders/:orderId/items/:itemId">
          {(params) => (
            <OrderItemDetails
              orderId={params.orderId}
              itemId={params.itemId}
            />
          )}
        </Route>
        <Route path="/settings/orders/:orderId">{(params) => <OrderDetails orderId={params.orderId} />}</Route>
        <Route>
          <OrdersNotFound />
        </Route>
      </Switch>
    </section>
  );
}

export default OrdersSubRouter;

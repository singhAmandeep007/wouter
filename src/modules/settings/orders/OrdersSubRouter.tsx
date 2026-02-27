import { useEffect, useState } from "react";
import { Link, Route, Switch } from "wouter";
import { api } from "../../../shared/api/client";
import { ActiveLink } from "../../../shared/routing/ActiveLink";
import type { Order } from "../../../shared/api/types";

function OrdersDefault() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    void api.getOrders().then(setOrders);
  }, []);

  return (
    <section
      className="module-card"
      data-testid="orders-list-page"
    >
      <h3>Orders List (Default)</h3>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`/settings/orders/${order.id}`}>{order.id}</Link> - {order.status} - ${order.totalAmount}
          </li>
        ))}
      </ul>
    </section>
  );
}

function OrderDetails({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    void api.getOrderById(orderId).then(setOrder);
  }, [orderId]);

  if (!order) {
    return <p>Loading order...</p>;
  }

  return (
    <section
      className="module-card"
      data-testid="order-details-page"
    >
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
    </section>
  );
}

function OrderItemDetails({ orderId, itemId }: { orderId: string; itemId: string }) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    void api.getOrderById(orderId).then(setOrder);
  }, [orderId]);

  const item = order?.items.find((entry) => entry.id === itemId);

  if (!order) {
    return <p>Loading order item...</p>;
  }

  if (!item) {
    return <p>Order item not found.</p>;
  }

  return (
    <section
      className="module-card"
      data-testid="order-item-details-page"
    >
      <h3>Order Item Details</h3>
      <p>Order: {orderId}</p>
      <p>Item: {item.title}</p>
      <p>Quantity: {item.quantity}</p>
      <p>Unit Price: ${item.unitPrice}</p>
      <p>
        <Link href={`/settings/orders/${orderId}`}>Back to order</Link>
      </p>
    </section>
  );
}

function OrdersNotFound() {
  return (
    <section
      className="module-card"
      data-testid="orders-not-found"
    >
      <h3>Orders sub-route not found</h3>
      <p>
        Return to <Link href="/settings/orders">orders list</Link>.
      </p>
    </section>
  );
}

function OrdersSubRouter() {
  return (
    <section data-testid="orders-sub-router">
      <h3>Orders Sub Router</h3>
      <ul className="module-links">
        <li>
          <ActiveLink
            exact
            href="/settings/orders"
            testId="orders-tab-list"
          >
            /settings/orders
          </ActiveLink>
        </li>
        <li>
          <ActiveLink
            exact
            href="/settings/orders/o-5001"
            testId="orders-tab-order"
          >
            /settings/orders/o-5001
          </ActiveLink>
        </li>
        <li>
          <ActiveLink
            exact
            href="/settings/orders/o-5001/items/oi-1"
            testId="orders-tab-item"
          >
            /settings/orders/o-5001/items/oi-1
          </ActiveLink>
        </li>
      </ul>

      <Switch>
        <Route path="/settings/orders">
          <OrdersDefault />
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

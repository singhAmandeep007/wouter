import { useEffect, useState } from "react";
import { Link, Route, Switch } from "wouter";
import { api } from "../../../shared/api/client";
import type { Order } from "../../../shared/api/types";

function OrdersDefault() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    void api.getOrders().then(setOrders);
  }, []);

  return (
    <section className="module-card">
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
    <section className="module-card">
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
    <section className="module-card">
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
    <section className="module-card">
      <h3>Orders sub-route not found</h3>
      <p>
        Return to <Link href="/settings/orders">orders list</Link>.
      </p>
    </section>
  );
}

function OrdersSubRouter() {
  return (
    <section>
      <h3>Orders Sub Router</h3>
      <ul className="module-links">
        <li>
          <Link href="/settings/orders">/settings/orders</Link>
        </li>
        <li>
          <Link href="/settings/orders/o-5001">/settings/orders/o-5001</Link>
        </li>
        <li>
          <Link href="/settings/orders/o-5001/items/oi-1">/settings/orders/o-5001/items/oi-1</Link>
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

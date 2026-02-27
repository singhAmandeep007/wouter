import { Suspense, lazy, useEffect, useState } from "react";
import { Link, Route, Switch } from "wouter";
import { api } from "../../shared/api/client";
import type { PaymentMethod, UserProfile } from "../../shared/api/types";
import "./settings.css";

const OrdersSubRouter = lazy(() => import("./orders/OrdersSubRouter"));

function SettingsIndex() {
  return (
    <section className="module-card">
      <h2>Settings Home</h2>
      <p>Default settings route. Choose a nested route:</p>
      <ul className="module-links">
        <li>
          <Link href="/settings/profile">Profile</Link>
        </li>
        <li>
          <Link href="/settings/orders">Orders (sub-router)</Link>
        </li>
        <li>
          <Link href="/settings/payment">Payment</Link>
        </li>
      </ul>
    </section>
  );
}

function ProfileRoute() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    void api.getProfile().then(setProfile);
  }, []);

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <section className="module-card">
      <h2>Profile</h2>
      <p>Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
      <p>Loyalty: {profile.loyaltyTier}</p>
    </section>
  );
}

function PaymentRoute() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    void api.getPaymentMethods().then(setMethods);
  }, []);

  return (
    <section className="module-card">
      <h2>Payment Methods</h2>
      <ul>
        {methods.map((method) => (
          <li key={method.id}>
            {method.label} ({method.type}) {method.isDefault ? "- Default" : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SettingsNotFound() {
  return (
    <section className="module-card">
      <h2>Settings route not found</h2>
      <p>
        Go back to <Link href="/settings">settings home</Link>
      </p>
    </section>
  );
}

function SettingsModule() {
  return (
    <section>
      <h2>Settings Module Routes</h2>
      <Switch>
        <Route path="/settings">
          <SettingsIndex />
        </Route>
        <Route path="/settings/profile">
          <ProfileRoute />
        </Route>
        <Route path="/settings/payment">
          <PaymentRoute />
        </Route>
        <Route path="/settings/orders/*">
          <Suspense fallback={<p>Loading orders sub-router...</p>}>
            <OrdersSubRouter />
          </Suspense>
        </Route>
        <Route path="/settings/orders">
          <Suspense fallback={<p>Loading orders sub-router...</p>}>
            <OrdersSubRouter />
          </Suspense>
        </Route>
        <Route>
          <SettingsNotFound />
        </Route>
      </Switch>
    </section>
  );
}

export default SettingsModule;

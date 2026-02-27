import { Suspense, lazy, useEffect, useState } from "react";
import { Link, Route, Switch } from "wouter";
import { api } from "../../shared/api/client";
import { ActiveLink } from "../../shared/routing/ActiveLink";
import type { PaymentMethod, UserProfile } from "../../shared/api/types";
import "./settings.css";

const OrdersSubRouter = lazy(() => import("./orders/OrdersSubRouter"));

function SettingsIndex() {
  return (
    <section
      className="module-card"
      data-testid="settings-home-page"
    >
      <h2>Settings Home</h2>
      <p>Default settings route. Choose a nested route:</p>
      <ul className="module-links">
        <li>
          <ActiveLink
            exact
            href="/settings/profile"
            testId="settings-tab-profile"
          >
            Profile
          </ActiveLink>
        </li>
        <li>
          <ActiveLink
            href="/settings/orders"
            testId="settings-tab-orders"
          >
            Orders (sub-router)
          </ActiveLink>
        </li>
        <li>
          <ActiveLink
            exact
            href="/settings/payment"
            testId="settings-tab-payment"
          >
            Payment
          </ActiveLink>
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
    <section
      className="module-card"
      data-testid="settings-profile-page"
    >
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
    <section
      className="module-card"
      data-testid="settings-payment-page"
    >
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
    <section
      className="module-card"
      data-testid="settings-not-found"
    >
      <h2>Settings route not found</h2>
      <p>
        Go back to <Link href="/settings">settings home</Link>
      </p>
    </section>
  );
}

function SettingsModule() {
  return (
    <section data-testid="settings-module">
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

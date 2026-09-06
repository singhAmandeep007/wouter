import { Suspense, lazy, useState } from "react";
import { Link, Route, Switch } from "wouter";
import { useProfile, useUpdateProfile } from "@/resources/user-profile";
import { usePaymentMethods } from "@/resources/payment-method";
import { ActiveLink } from "../../shared/routing/ActiveLink";
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
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState("");

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  // Controlled input seeds from the loaded profile; empty until edited.
  const nameValue = name || profile.name;

  return (
    <section
      className="module-card"
      data-testid="settings-profile-page"
    >
      <h2>Profile</h2>
      <p>Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
      <p>Loyalty: {profile.loyaltyTier}</p>

      <form
        data-testid="profile-edit-form"
        onSubmit={(event) => {
          event.preventDefault();
          updateProfile.mutate({ name: nameValue });
        }}
      >
        <label>
          Display name{" "}
          <input
            data-testid="profile-name-input"
            value={nameValue}
            onChange={(event) => setName(event.target.value)}
          />
        </label>{" "}
        <button
          data-testid="profile-save-button"
          type="submit"
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? "Saving..." : "Save"}
        </button>
      </form>
    </section>
  );
}

function PaymentRoute() {
  const { data: methods = [] } = usePaymentMethods();

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

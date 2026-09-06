import { Suspense, lazy, useState } from "react";
import { Link, Route, Switch } from "wouter";
import { useProfile, useUpdateProfile } from "@/resources/user-profile";
import { usePaymentMethods } from "@/resources/payment-method";
import { Card, ModuleNav, PageMessage } from "@/shared/ui";

const OrdersSubRouter = lazy(() => import("./orders/OrdersSubRouter"));

function SettingsIndex() {
  return (
    <Card testId="settings-home-page">
      <h2>Settings Home</h2>
      <p>Default settings route. Choose a nested route:</p>
      <ModuleNav
        items={[
          { href: "/settings/profile", label: "Profile", exact: true, testId: "settings-tab-profile" },
          { href: "/settings/orders", label: "Orders (sub-router)", testId: "settings-tab-orders" },
          { href: "/settings/payment", label: "Payment", exact: true, testId: "settings-tab-payment" },
        ]}
      />
    </Card>
  );
}

function ProfileRoute() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState("");

  if (!profile) {
    return <PageMessage testId="settings-profile-loading">Loading profile...</PageMessage>;
  }

  // Controlled input seeds from the loaded profile; empty until edited.
  const nameValue = name || profile.name;

  return (
    <Card testId="settings-profile-page">
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
    </Card>
  );
}

function PaymentRoute() {
  const { data: methods = [] } = usePaymentMethods();

  return (
    <Card testId="settings-payment-page">
      <h2>Payment Methods</h2>
      <ul>
        {methods.map((method) => (
          <li key={method.id}>
            {method.label} ({method.type}) {method.isDefault ? "- Default" : ""}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function SettingsNotFound() {
  return (
    <Card testId="settings-not-found">
      <h2>Settings route not found</h2>
      <p>
        Go back to <Link href="/settings">settings home</Link>
      </p>
    </Card>
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
          <Suspense fallback={<PageMessage>Loading orders sub-router...</PageMessage>}>
            <OrdersSubRouter />
          </Suspense>
        </Route>
        <Route path="/settings/orders">
          <Suspense fallback={<PageMessage>Loading orders sub-router...</PageMessage>}>
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

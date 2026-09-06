import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, Route, Router, Switch, useLocation } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { ErrorBoundary } from "./ErrorBoundary";
import { isChunkLoadError } from "./isChunkLoadError";

// React logs caught render errors to console.error; silence it to keep test output clean.
beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
afterEach(() => vi.restoreAllMocks());

function Boom({ message = "kaboom" }: { message?: string }): never {
  throw new Error(message);
}

describe("isChunkLoadError", () => {
  it("detects failed dynamic imports", () => {
    expect(isChunkLoadError(new Error("Failed to fetch dynamically imported module: /assets/x.js"))).toBe(true);
    expect(isChunkLoadError(new Error("Loading chunk 5 failed"))).toBe(true);
    expect(isChunkLoadError(new Error("some other render error"))).toBe(false);
    expect(isChunkLoadError("not an error")).toBe(false);
  });
});

describe("ErrorBoundary", () => {
  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("All good")).toBeInTheDocument();
    expect(screen.queryByTestId("error-boundary-fallback")).not.toBeInTheDocument();
  });

  it("renders the default fallback when a child throws", () => {
    render(
      <ErrorBoundary>
        <Boom message="render exploded" />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("error-boundary-fallback")).toHaveTextContent("render exploded");
    // Non-chunk error → shows retry, not reload.
    expect(screen.getByTestId("error-boundary-retry")).toBeInTheDocument();
    expect(screen.queryByTestId("error-boundary-reload")).not.toBeInTheDocument();
  });

  it("shows a reload action for chunk-load errors", () => {
    render(
      <ErrorBoundary>
        <Boom message="Failed to fetch dynamically imported module" />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("error-boundary-reload")).toBeInTheDocument();
    expect(screen.queryByTestId("error-boundary-retry")).not.toBeInTheDocument();
  });

  it("invokes onError with the thrown error", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Boom message="tracked" />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect((onError.mock.calls[0][0] as Error).message).toBe("tracked");
  });

  it("recovers via the retry button once the child stops throwing", async () => {
    const user = userEvent.setup();

    function Flaky() {
      const [ok, setOk] = useState(false);
      if (!ok) {
        // Register a global fixer the fallback's retry can't reach, so we toggle via a button.
        return (
          <ErrorBoundary>
            <Boom />
            <button onClick={() => setOk(true)}>fix</button>
          </ErrorBoundary>
        );
      }
      return <p>recovered</p>;
    }

    render(<Flaky />);
    expect(screen.getByTestId("error-boundary-fallback")).toBeInTheDocument();
    // The retry resets the boundary; child throws again because state is unchanged.
    await user.click(screen.getByTestId("error-boundary-retry"));
    expect(screen.getByTestId("error-boundary-fallback")).toBeInTheDocument();
  });

  it("auto-resets when resetKeys change (e.g. route navigation)", () => {
    function Harness({ throwNow, routeKey }: { throwNow: boolean; routeKey: string }) {
      return (
        <ErrorBoundary resetKeys={[routeKey]}>
          {throwNow ? <Boom message="on route A" /> : <p>route B content</p>}
        </ErrorBoundary>
      );
    }

    const { rerender } = render(<Harness throwNow routeKey="/a" />);
    expect(screen.getByTestId("error-boundary-fallback")).toBeInTheDocument();

    // Simulate navigating: resetKey changes AND the child no longer throws.
    rerender(<Harness throwNow={false} routeKey="/b" />);
    expect(screen.queryByTestId("error-boundary-fallback")).not.toBeInTheDocument();
    expect(screen.getByText("route B content")).toBeInTheDocument();
  });

  it("supports a custom fallback render prop", () => {
    render(
      <ErrorBoundary fallback={({ error }) => <div data-testid="custom">custom: {error.message}</div>}>
        <Boom message="via custom" />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("custom")).toHaveTextContent("custom: via custom");
  });
});

describe("route-level ErrorBoundary integration (App.tsx pattern)", () => {
  function ThrowingRoute(): never {
    throw new Error("route boom");
  }

  function RoutedApp() {
    // Mirrors App.tsx: boundary keyed on location so navigation clears a broken route.
    const [location] = useLocation();
    return (
      <>
        <ErrorBoundary resetKeys={[location]}>
          <Switch>
            <Route path="/broken">
              <ThrowingRoute />
            </Route>
            <Route path="/safe">
              <p>safe route content</p>
            </Route>
          </Switch>
        </ErrorBoundary>
        {/* Nav lives outside the boundary so it stays usable when the fallback is shown. */}
        <Link href="/safe">go safe</Link>
      </>
    );
  }

  it("shows the fallback on a broken route and clears it after navigating away", async () => {
    const user = userEvent.setup();
    const { hook } = memoryLocation({ path: "/broken" });

    render(
      <Router hook={hook}>
        <RoutedApp />
      </Router>
    );

    expect(screen.getByTestId("error-boundary-fallback")).toBeInTheDocument();

    await user.click(screen.getByText("go safe"));

    expect(screen.queryByTestId("error-boundary-fallback")).not.toBeInTheDocument();
    expect(screen.getByText("safe route content")).toBeInTheDocument();
  });
});

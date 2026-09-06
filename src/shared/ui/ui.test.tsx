import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { Card } from "./Card";
import { PageMessage } from "./PageMessage";
import { ModuleNav } from "./ModuleNav";
import { cx } from "./cx";

describe("cx", () => {
  it("joins only truthy class names", () => {
    expect(cx("a", false, null, undefined, "b")).toBe("a b");
    expect(cx()).toBe("");
  });
});

describe("Card", () => {
  it("renders children under the given testId", () => {
    render(<Card testId="card">content</Card>);
    expect(screen.getByTestId("card")).toHaveTextContent("content");
  });

  it("merges a custom className", () => {
    render(
      <Card
        testId="card"
        className="extra"
      >
        x
      </Card>
    );
    expect(screen.getByTestId("card").className).toContain("extra");
  });
});

describe("PageMessage", () => {
  it("uses role=status for info tone", () => {
    render(<PageMessage testId="msg">Loading…</PageMessage>);
    expect(screen.getByTestId("msg")).toHaveAttribute("role", "status");
  });

  it("uses role=alert for error tone", () => {
    render(
      <PageMessage
        tone="error"
        testId="msg"
      >
        Boom
      </PageMessage>
    );
    expect(screen.getByTestId("msg")).toHaveAttribute("role", "alert");
  });
});

describe("ModuleNav", () => {
  it("renders each item as a link, resolving active state from the route", () => {
    renderWithProviders(
      <ModuleNav
        items={[
          { href: "/a", label: "A", exact: true, testId: "nav-a" },
          { href: "/b", label: "B", exact: true, testId: "nav-b" },
        ]}
      />,
      { route: "/a" }
    );

    expect(screen.getByTestId("nav-a")).toHaveAttribute("href", "/a");
    expect(screen.getByTestId("nav-b")).toHaveAttribute("href", "/b");
    // The active item carries an extra (hashed) class beyond the base link class.
    expect(screen.getByTestId("nav-a").className.split(" ").length).toBeGreaterThan(
      screen.getByTestId("nav-b").className.split(" ").length
    );
  });
});

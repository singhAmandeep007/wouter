import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { ActiveLink } from "./ActiveLink";

function renderAt(route: string, props: Parameters<typeof ActiveLink>[0]) {
  return renderWithProviders(<ActiveLink {...props} />, { route });
}

describe("ActiveLink", () => {
  it("marks an exact match active", () => {
    renderAt("/settings", { href: "/settings", exact: true, testId: "link", children: "Settings" });
    expect(screen.getByTestId("link")).toHaveClass("is-active");
  });

  it("does not mark a non-matching exact link active", () => {
    renderAt("/settings/profile", { href: "/settings", exact: true, testId: "link", children: "Settings" });
    expect(screen.getByTestId("link")).not.toHaveClass("is-active");
  });

  it("highlights a parent link on a child route in non-exact (prefix) mode", () => {
    renderAt("/settings/orders/o-1", { href: "/settings/orders", testId: "link", children: "Orders" });
    expect(screen.getByTestId("link")).toHaveClass("is-active");
  });

  it("does not treat a sibling path as a prefix match", () => {
    renderAt("/settings-advanced", { href: "/settings", testId: "link", children: "Settings" });
    expect(screen.getByTestId("link")).not.toHaveClass("is-active");
  });

  it("normalizes trailing slashes", () => {
    renderAt("/catalog/", { href: "/catalog", exact: true, testId: "link", children: "Catalog" });
    expect(screen.getByTestId("link")).toHaveClass("is-active");
  });

  it("ignores query string and hash when matching", () => {
    renderAt("/catalog?page=2#top", { href: "/catalog", exact: true, testId: "link", children: "Catalog" });
    expect(screen.getByTestId("link")).toHaveClass("is-active");
  });

  it("merges a custom className with the active class", () => {
    renderAt("/dashboard", {
      href: "/dashboard",
      exact: true,
      className: "sidebar-link",
      testId: "link",
      children: "Dashboard",
    });
    const link = screen.getByTestId("link");
    expect(link).toHaveClass("sidebar-link");
    expect(link).toHaveClass("is-active");
  });
});

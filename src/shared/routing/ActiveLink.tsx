import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";

type ActiveLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
  testId?: string;
};

function normalizePath(path: string) {
  const [pathWithoutQuery] = path.split(/[?#]/);

  if (!pathWithoutQuery || pathWithoutQuery === "/") {
    return "/";
  }

  return pathWithoutQuery.endsWith("/") ? pathWithoutQuery.slice(0, -1) : pathWithoutQuery;
}

function isRouteActive(location: string, href: string, exact: boolean) {
  const normalizedLocation = normalizePath(location);
  const normalizedHref = normalizePath(href);

  if (exact) {
    return normalizedLocation === normalizedHref;
  }

  return normalizedLocation === normalizedHref || normalizedLocation.startsWith(`${normalizedHref}/`);
}

export function ActiveLink({
  href,
  children,
  className = "",
  activeClassName = "is-active",
  exact = false,
  testId,
}: ActiveLinkProps) {
  const [location] = useLocation();
  const isActive = isRouteActive(location, href, exact);
  const mergedClassName = `${className} ${isActive ? activeClassName : ""}`.trim();

  return (
    <Link
      className={mergedClassName}
      // Stable, accessible active-state signal — independent of (now hashed) CSS-Module
      // class names. Screen readers announce the current page; tests assert on this
      // rather than a class name that changes when styles change.
      aria-current={isActive ? "page" : undefined}
      data-testid={testId}
      href={href}
    >
      {children}
    </Link>
  );
}

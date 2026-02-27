import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";

type ActiveLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
};

function isRouteActive(location: string, href: string, exact: boolean) {
  if (exact) {
    return location === href;
  }

  return location === href || location.startsWith(`${href}/`);
}

export function ActiveLink({
  href,
  children,
  className = "",
  activeClassName = "is-active",
  exact = false,
}: ActiveLinkProps) {
  const [location] = useLocation();
  const isActive = isRouteActive(location, href, exact);
  const mergedClassName = `${className} ${isActive ? activeClassName : ""}`.trim();

  return (
    <Link
      className={mergedClassName}
      href={href}
    >
      {children}
    </Link>
  );
}

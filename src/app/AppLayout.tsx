import { useLocation } from "wouter";
import { ActiveLink } from "../shared/routing/ActiveLink";
import "./layout.css";

type NavItem = {
  label: string;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Catalog", href: "/catalog" },
  { label: "Settings", href: "/settings" },
  { label: "Admin", href: "/admin" },
  { label: "History Demo", href: "/history" },
];

function SidebarLink({ href, label }: NavItem) {
  return (
    <li>
      <ActiveLink
        className="sidebar-link"
        href={href}
      >
        {label}
      </ActiveLink>
    </li>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="app-shell">
      <header className="navbar">
        <div>
          <h1>Wouter E-Commerce Demo</h1>
          <p className="subtitle">Modular routes, nested routes, lazy loading, mock APIs</p>
        </div>
        <div className="history-controls">
          <button
            onClick={() => window.history.back()}
            type="button"
          >
            Back
          </button>
          <button
            onClick={() => window.history.forward()}
            type="button"
          >
            Forward
          </button>
          <span>Current: {location}</span>
        </div>
      </header>

      <div className="content-shell">
        <aside className="sidebar">
          <h2>Navigation</h2>
          <ul>
            {NAV_ITEMS.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                label={item.label}
              />
            ))}
          </ul>
        </aside>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import type { UserRole } from "../types";

interface NavbarProps {
  onMenuToggle: () => void;
}

const ROLE_LINKS: Record<UserRole, { label: string; to: string }[]> = {
  communest_admin: [
    { label: "Home", to: "/" },
    { label: "Explore", to: "/explore" },
    { label: "About", to: "/about" },
    { label: "Admin", to: "/admin" },
  ],
  estate_admin: [
    { label: "Home", to: "/" },
    { label: "Explore", to: "/explore" },
    { label: "My Estate", to: "/my-estate" },
    { label: "About", to: "/about" },
  ],
  tenant: [
    { label: "Home", to: "/" },
    { label: "Explore", to: "/explore" },
    { label: "My Estate", to: "/my-estate" },
    { label: "About", to: "/about" },
  ],
  regular_user: [
    { label: "Home", to: "/" },
    { label: "Explore", to: "/explore" },
    { label: "My Estate", to: "/my-estate" },
    { label: "About", to: "/about" },
  ],
  outsider: [
    { label: "Home", to: "/" },
    { label: "Explore", to: "/explore" },
    { label: "About", to: "/about" },
  ],
};

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, isLoggedIn } = useUser();
  const navigate = useNavigate();

  const role: UserRole = user?.role ?? "outsider";
  const links = ROLE_LINKS[role];

  return (
    <nav
      className="site-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-16"
      style={{
        background: "rgba(7, 13, 26, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(30, 58, 95, 0.5)",
        boxShadow: "0 1px 0 rgba(59,130,246,0.06)",
      }}
    >
      {/* Left: menu toggle + site name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="btn-ghost p-2 rounded-lg"
          aria-label="Open menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Link
          to="/"
          className="text-xl font-bold"
          style={{
            letterSpacing: "-0.04em",
            background: "linear-gradient(90deg, #e2e8f0 0%, #93c5fd 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Communest
        </Link>
      </div>

      {/* Center: nav links (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Right: Client Area or Profile */}
      <div className="flex items-center gap-3">
        {isLoggedIn && user ? (
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
            aria-label="Profile"
          >
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover"
                style={{ border: "2px solid var(--accent)" }}
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{
                  background: "var(--primary)",
                  color: "#fff",
                  border: "2px solid var(--accent)",
                }}
              >
                {user.name.charAt(0)}
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={() => navigate("/sign-in")}
            className="btn-primary text-sm py-2 px-4"
          >
            Client Area
          </button>
        )}
      </div>
    </nav>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUser } from '../context/UserContext';
import type { UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_LINKS: Record<UserRole, { label: string; to: string }[]> = {
  communest_admin: [
    { label: 'Home', to: '/' },
    { label: 'Explore', to: '/explore' },
    { label: 'About', to: '/about' },
    { label: 'Admin', to: '/admin' },
  ],
  estate_admin: [
    { label: 'Home', to: '/' },
    { label: 'Explore', to: '/explore' },
    { label: 'My Estate', to: '/my-estate' },
    { label: 'About', to: '/about' },
  ],
  tenant: [
    { label: 'Home', to: '/' },
    { label: 'Explore', to: '/explore' },
    { label: 'My Estate', to: '/my-estate' },
    { label: 'About', to: '/about' },
  ],
  regular_user: [
    { label: 'Home', to: '/' },
    { label: 'Explore', to: '/explore' },
    { label: 'My Estate', to: '/my-estate' },
    { label: 'About', to: '/about' },
  ],
  outsider: [
    { label: 'Home', to: '/' },
    { label: 'Explore', to: '/explore' },
    { label: 'About', to: '/about' },
  ],
};

const ROLE_BADGE_LABELS: Record<UserRole, string> = {
  communest_admin: 'Communest Admin',
  estate_admin: 'Estate Admin',
  tenant: 'Tenant',
  regular_user: 'Regular User',
  outsider: 'Guest',
};

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  communest_admin: 'badge badge-blue',
  estate_admin: 'badge badge-green',
  tenant: 'badge badge-yellow',
  regular_user: 'badge badge-gray',
  outsider: 'badge badge-gray',
};

const SHOW_LIST_ESTATE: UserRole[] = ['regular_user', 'estate_admin'];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, isLoggedIn, logout } = useUser();
  const navigate = useNavigate();
  const role: UserRole = user?.role ?? 'outsider';
  const links = ROLE_LINKS[role];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleNav = (to: string) => {
    navigate(to);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/explore');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col w-72 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <span
            className="text-lg font-bold"
            style={{
              letterSpacing: '-0.04em',
              background: 'linear-gradient(90deg, #e2e8f0 0%, #93c5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Communest
          </span>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-accent-foreground'
                      : 'text-secondary-foreground hover:text-foreground'
                  }`
                }
                style={({ isActive }) =>
                  isActive ? { background: 'var(--primary)', color: '#fff' } : {}
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* List Your Estate — only for regular_user and estate_admin */}
            {SHOW_LIST_ESTATE.includes(role) && (
              <button
                onClick={() => handleNav('/list-your-estate')}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left mt-2"
                style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--accent)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                List Your Estate
              </button>
            )}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          {isLoggedIn && user ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleNav('/profile')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-muted"
                style={{ background: 'var(--secondary)' }}
              >
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ background: 'var(--primary)', color: '#fff' }}
                  >
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-semibold truncate max-w-32" style={{ color: 'var(--foreground)' }}>{user.name}</span>
                  <span className={ROLE_BADGE_CLASSES[role]}>{ROLE_BADGE_LABELS[role]}</span>
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="btn-ghost w-full text-left text-sm px-3 py-2 rounded-lg flex items-center gap-2"
                style={{ color: 'var(--danger)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNav('/sign-in')}
              className="btn-primary w-full justify-center"
            >
              Client Area
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

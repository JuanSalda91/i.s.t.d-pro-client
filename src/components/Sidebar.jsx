import { Link, useLocation } from 'react-router-dom';

// ── Styles ────────────────────────────────────────────────────────────────────
const navLinkClass = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150';

const activeStyle = {
  background: 'rgba(59,92,212,0.35)',
  borderLeft: '3px solid #3A96D4',
  color: '#ffffff',
  fontWeight: 600,
};

const handleMouseEnter = (e) => {
  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
  e.currentTarget.style.color = '#fff';
};
const handleMouseLeave = (e) => {
  e.currentTarget.style.background = 'transparent';
  e.currentTarget.style.color = '#a8c8e8';
};

// ── NavItem — declared OUTSIDE Sidebar so React doesn't recreate it ───────────
function NavItem({ to, icon, label, active }) {
  if (active) {
    return (
      <div className={navLinkClass} style={activeStyle}>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
        {label}
      </div>
    );
  }
  return (
    <Link
      to={to}
      className={navLinkClass}
      style={{ color: '#a8c8e8' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
      {label}
    </Link>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ user, logout }) {
  const { pathname } = useLocation();
  const isActive = (path) => pathname === path;

  return (
    <aside
      className="w-64 min-h-screen flex flex-col shadow-lg flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, #1a2f6b 0%, #0f1b3d 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>

      {/* ── Brand ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #3B5CD4, #3A96D4)' }}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div>
          <p className="text-white text-sm font-bold tracking-wide">I.S.T.D PRO</p>
          <p className="text-xs" style={{ color: '#7ea8d4' }}>Management Platform</p>
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1">

        <NavItem
          to="/"
          label="Dashboard"
          active={isActive('/')}
          icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />

        <p className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest"
          style={{ color: '#4a6d9c' }}>
          Sales
        </p>

        <NavItem
          to="/sales/new"
          label="New Sale"
          active={isActive('/sales/new')}
          icon="M12 4v16m8-8H4"
        />
        <NavItem
          to="/sales"
          label="All Sales"
          active={isActive('/sales')}
          icon="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
        <NavItem
          to="/invoices"
          label="Invoices"
          active={isActive('/invoices')}
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />

        <p className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest"
          style={{ color: '#4a6d9c' }}>
          Inventory
        </p>

        <NavItem
          to="/products/new"
          label="New Product"
          active={isActive('/products/new')}
          icon="M12 4v16m8-8H4"
        />
        <NavItem
          to="/products"
          label="All Products"
          active={isActive('/products')}
          icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </nav>

      {/* ── User + logout ─────────────────────────────────────────────────── */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3B5CD4, #3A96D4)' }}>
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <p className="text-xs truncate" style={{ color: '#a8c8e8' }}>{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
          style={{
            background: 'rgba(229,57,53,0.15)',
            border: '1px solid rgba(229,57,53,0.25)',
            color: '#ff8a80',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,57,53,0.28)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(229,57,53,0.15)'; }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
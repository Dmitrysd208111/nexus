import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Command,
  FileBarChart2,
  Layers3,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShoppingBag,
  Sun,
  Users,
  X,
} from 'lucide-react'
import { usePreferences } from '../features/preferences/store'
import { useWorkspace } from '../hooks/useWorkspace'
import { Avatar } from './Avatar'
import { Modal } from './Modal'
import { EmptyState } from './States'
const navigation = [
  { path: '/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/products', label: 'Products', icon: Box },
  { path: '/reports', label: 'Reports', icon: FileBarChart2 },
]
export function Layout() {
  const preferences = usePreferences()
  const { data } = useWorkspace()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [notifications, setNotifications] = useState(false)
  const [profile, setProfile] = useState(false)
  const [help, setHelp] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const pending = data?.orders.filter((o) => o.status === 'Pending').length ?? 0
  const lowStock = data?.products.filter((p) => p.stock < 10).length ?? 0
  const current = navigation.find((n) => location.pathname.startsWith(n.path))?.label ?? 'Settings'
  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme
    document.documentElement.dataset.compact = String(preferences.compact)
  }, [preferences.theme, preferences.compact])
  useEffect(() => {
    document.title = `${current} · NEXUS`
    window.scrollTo(0, 0)
  }, [current])
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
      if (e.key === 'Escape') {
        setSidebar(false)
        setNotifications(false)
        setProfile(false)
      }
    }
    const outside = (e: MouseEvent) => {
      if (!notificationRef.current?.contains(e.target as Node)) setNotifications(false)
      if (!profileRef.current?.contains(e.target as Node)) setProfile(false)
    }
    document.addEventListener('keydown', keydown)
    document.addEventListener('mousedown', outside)
    return () => {
      document.removeEventListener('keydown', keydown)
      document.removeEventListener('mousedown', outside)
    }
  }, [])
  const term = search.toLowerCase().trim()
  const results = [
    ...navigation
      .filter((n) => n.label.toLowerCase().includes(term))
      .map((n) => ({
        id: n.path,
        title: n.label,
        subtitle: 'Go to page',
        path: n.path,
        icon: n.icon,
      })),
    ...(term && data
      ? [
          ...data.customers
            .filter((c) => `${c.name} ${c.email} ${c.company}`.toLowerCase().includes(term))
            .slice(0, 5)
            .map((c) => ({
              id: c.id,
              title: c.name,
              subtitle: c.email,
              path: `/customers?record=${c.id}`,
              icon: Users,
            })),
          ...data.orders
            .filter((o) => o.id.toLowerCase().includes(term))
            .slice(0, 5)
            .map((o) => ({
              id: o.id,
              title: o.id,
              subtitle: `${o.status} · ${o.date}`,
              path: `/orders?record=${o.id}`,
              icon: ShoppingBag,
            })),
          ...data.products
            .filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(term))
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              title: p.name,
              subtitle: p.sku,
              path: `/products?record=${p.id}`,
              icon: Box,
            })),
        ]
      : []),
  ]
  function go(path: string) {
    navigate(path)
    setSidebar(false)
    setNotifications(false)
    setProfile(false)
    setSearchOpen(false)
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      {sidebar && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebar(false)}
        />
      )}
      <aside className={`sidebar ${sidebar ? 'open' : ''}`}>
        <NavLink className="brand" to="/overview" onClick={() => setSidebar(false)}>
          <span className="brand-mark">
            <Layers3 size={23} />
          </span>
          NEXUS<span className="brand-period">.</span>
        </NavLink>
        <button className="workspace-selector" onClick={() => go('/settings')}>
          <span className="workspace-icon">
            A<span />
          </span>
          <span>
            <strong>{preferences.workspace}</strong>
            <small>Pro workspace</small>
          </span>
          <ChevronDown size={14} />
        </button>
        <div className="nav-section-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebar(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.label === 'Orders' && pending > 0 && (
                  <span className="nav-count">{pending}</span>
                )}
                {item.label === 'Overview' && <span className="active-indicator" />}
              </NavLink>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="sidebar-note-icon">
              <Activity size={17} />
            </span>
            <strong>A connected view.</strong>
            <p>Your data. Your next move.</p>
            <NavLink to="/analytics" onClick={() => setSidebar(false)}>
              Explore analytics
              <ArrowRight size={13} />
            </NavLink>
          </div>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebar(false)}
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
          <button
            className="nav-item"
            onClick={() => {
              setHelp(true)
              setSidebar(false)
            }}
          >
            <CircleHelp size={18} />
            <span>Help & getting started</span>
            <span className="external-arrow">↗</span>
          </button>
          <div className="sidebar-profile">
            <Avatar name={preferences.name} />
            <div>
              <strong>{preferences.name}</strong>
              <span>{preferences.email}</span>
            </div>
            <button
              className="icon-button"
              aria-label="Sign out of demo"
              onClick={() => {
                preferences.set({ session: false })
                navigate('/login')
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setSidebar(true)}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb-home">
              <LayoutDashboard size={15} />
            </span>
            <ChevronRight size={13} />
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{current}</strong>
          </div>
          <div className="topbar-actions">
            <button
              aria-label="Search workspace"
              className="global-search"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} />
              <span>Search anything...</span>
              <kbd>
                <Command size={10} /> K
              </kbd>
            </button>
            <button
              className="icon-button theme-toggle"
              aria-label={`Switch to ${preferences.theme === 'light' ? 'dark' : 'light'} theme`}
              onClick={() =>
                preferences.set({ theme: preferences.theme === 'light' ? 'dark' : 'light' })
              }
            >
              {preferences.theme === 'light' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <div className="popover-anchor" ref={notificationRef}>
              <button
                className="icon-button notification-button"
                aria-label="Notifications"
                aria-expanded={notifications}
                onClick={() => {
                  setNotifications(!notifications)
                  setProfile(false)
                }}
              >
                <Bell size={19} />
                {preferences.digest && pending + lowStock > 0 && <i />}
              </button>
              {notifications && (
                <div className="header-popover notification-popover">
                  <div className="popover-heading">
                    <strong>Workspace digest</strong>
                    <span className="subtle-pill">Live</span>
                  </div>
                  {preferences.digest ? (
                    <>
                      <button onClick={() => go('/orders')}>
                        <span className="notification-icon">
                          <ShoppingBag size={18} />
                        </span>
                        <span>
                          <strong>{pending} orders awaiting payment</strong>
                          <small>Review pending orders in your workspace</small>
                        </span>
                        <ChevronRight size={14} />
                      </button>
                      <button onClick={() => go('/products')}>
                        <span className="notification-icon orange">
                          <Box size={18} />
                        </span>
                        <span>
                          <strong>{lowStock} products running low</strong>
                          <small>Stock levels below 10 units</small>
                        </span>
                        <ChevronRight size={14} />
                      </button>
                    </>
                  ) : (
                    <p className="popover-empty">
                      Business digest is turned off. Enable it in Settings.
                    </p>
                  )}
                  <div className="popover-footer">
                    <span className="status-dot" />
                    Based on your saved local data
                  </div>
                </div>
              )}
            </div>
            <span className="topbar-divider" />
            <div className="popover-anchor" ref={profileRef}>
              <button
                className="profile-button"
                aria-label="Profile menu"
                aria-expanded={profile}
                onClick={() => {
                  setProfile(!profile)
                  setNotifications(false)
                }}
              >
                <Avatar name={preferences.name} size="small" />
                <ChevronDown size={13} />
              </button>
              {profile && (
                <div className="header-popover profile-popover">
                  <div className="profile-menu-name">
                    <strong>{preferences.name}</strong>
                    <small>{preferences.email}</small>
                  </div>
                  <button onClick={() => go('/settings')}>
                    <Settings size={16} />
                    Manage profile
                  </button>
                  <button
                    onClick={() => {
                      preferences.set({ session: false })
                      go('/login')
                    }}
                  >
                    <LogOut size={16} />
                    Sign out of demo
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      {searchOpen && (
        <Modal
          title="Find your next insight"
          description="Search pages, customers, order IDs, and products. Ctrl / ⌘ K"
          onClose={() => setSearchOpen(false)}
        >
          <div className="command-search">
            <Search size={20} />
            <input
              aria-label="Search workspace"
              placeholder="Where would you like to go?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="icon-button"
                aria-label="Clear workspace search"
                onClick={() => setSearch('')}
              >
                <X size={15} />
              </button>
            )}
          </div>
          <div className="search-results">
            {results.map((result) => {
              const Icon = result.icon
              return (
                <button key={result.id} onClick={() => go(result.path)}>
                  <Icon size={18} />
                  <span>
                    <strong>{result.title}</strong>
                    <small>{result.subtitle}</small>
                  </span>
                  <ArrowRight size={15} />
                </button>
              )
            })}
            {!results.length && (
              <EmptyState
                title="No matches found"
                description="Try a name, order ID, product, or page name."
              />
            )}
          </div>
        </Modal>
      )}
      {help && (
        <Modal
          title="A little guidance goes a long way"
          description="Get the most out of your NEXUS demo."
          onClose={() => setHelp(false)}
        >
          <div className="help-list">
            <p>
              <Check size={18} />
              <span>
                <strong>Start with your overview.</strong> Every KPI and chart shares the selected
                period. Switch between 7, 30, 90 days or a custom range.
              </span>
            </p>
            <p>
              <Check size={18} />
              <span>
                <strong>Make it your own.</strong> Add and edit orders, customers, and products.
                Changes are saved in this browser and update linked analytics.
              </span>
            </p>
            <p>
              <Check size={18} />
              <span>
                <strong>Move faster.</strong> Use Ctrl / ⌘ K for workspace search, Tab to navigate,
                and Escape to close dialogs.
              </span>
            </p>
            <p>
              <Check size={18} />
              <span>
                <strong>Take your data with you.</strong> Export filtered or selected table rows, or
                head to Reports for ready-to-use CSV files.
              </span>
            </p>
          </div>
          <div className="info-banner small">
            <p>
              This demo uses a local mock API and IndexedDB. Demo login does not provide real
              security.
            </p>
          </div>
          <div className="modal-footer">
            <button className="button primary" onClick={() => setHelp(false)}>
              Got it
              <ArrowRight size={16} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

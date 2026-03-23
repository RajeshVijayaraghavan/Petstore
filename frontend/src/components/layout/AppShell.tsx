import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { ConnectionBanner } from '@/components/layout/ErrorBoundary'

const NAV_ITEMS = [
  { to: '/pets', label: '🐾 Pet Catalogue' },
  { to: '/inventory', label: '📦 Inventory' },
  { to: '/orders', label: '📋 Orders' },
] as const

const ADMIN_NAV_ITEMS = [
  { to: '/users', label: '👤 Users' },
] as const

export default function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = useAuthStore((s) => s.session)
  const sidebarOpen = useAuthStore((s) => s.sidebarOpen)
  const toggleSidebar = useAuthStore((s) => s.toggleSidebar)
  const logout = useAuthStore((s) => s.logout)

  const queryCache = queryClient.getQueryCache()
  const queries = queryCache.getAll()
  const hasNetworkError = queries.some(
    (q) =>
      q.state.status === 'error' &&
      q.state.error instanceof TypeError
  )

  const isActive = (path: string) => location.pathname.startsWith(path)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`
          flex flex-col bg-surface-container-low transition-[width] duration-200 ease-in-out
          ${sidebarOpen ? 'w-60' : 'w-16'}
        `}
      >
        {/* Header */}
        <div className="flex h-14 items-center gap-2 px-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-foreground/70 hover:bg-surface-container-high"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          {sidebarOpen && (
            <span className="truncate font-heading text-sm font-semibold tracking-tight">
              Petstore Console
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.to}
              to={item.to}
              label={item.label}
              active={isActive(item.to)}
              collapsed={!sidebarOpen}
            />
          ))}

          {session?.isAdmin &&
            ADMIN_NAV_ITEMS.map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                label={item.label}
                active={isActive(item.to)}
                collapsed={!sidebarOpen}
              />
            ))}

          {/* Spacer pushes logout to bottom */}
          <div className="flex-1" />

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className={`
              relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium
              text-foreground/70 transition-colors hover:bg-surface-container-high
              ${!sidebarOpen ? 'justify-center px-0' : ''}
            `}
          >
            <span className="shrink-0 text-base">🚪</span>
            {sidebarOpen && <span className="truncate">Logout</span>}
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {hasNetworkError && (
          <ConnectionBanner
            onRetry={() =>
              queryClient.refetchQueries({ type: 'active' })
            }
          />
        )}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function SidebarLink({
  to,
  label,
  active,
  collapsed,
}: {
  to: string
  label: string
  active: boolean
  collapsed: boolean
}) {
  return (
    <NavLink
      to={to}
      className={`
        relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors
        ${active ? 'bg-surface-container-high text-primary' : 'text-foreground/70 hover:bg-surface-container-high'}
        ${collapsed ? 'justify-center px-0' : ''}
      `}
    >
      {/* Active indicator pill — 4px wide, 24px tall, left-aligned */}
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary" />
      )}

      <span className="shrink-0 text-base">{label.split(' ')[0]}</span>
      {!collapsed && <span className="truncate">{label.slice(label.indexOf(' ') + 1)}</span>}
    </NavLink>
  )
}

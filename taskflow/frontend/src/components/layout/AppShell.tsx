import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  BookOpen,
  Columns3,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Plus,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '@/context/AuthContext'
import { useTaskDialog } from '@/context/TaskDialogContext'
import { Avatar } from '@/components/ui/Avatar'
import { Brand } from '@/components/ui/Brand'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { getErrorMessage } from '@/lib/errors'
import { cn, getDisplayName } from '@/lib/utils'

const NAV_ITEMS = [
  {
    to: '/app',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true,
    description: 'Your workspace at a glance',
  },
  {
    to: '/app/tasks',
    label: 'Tasks',
    icon: ListChecks,
    end: false,
    description: 'Everything you need to do',
  },
  {
    to: '/app/board',
    label: 'Board',
    icon: Columns3,
    end: false,
    description: 'Move work across statuses',
  },
  {
    to: '/app/projects',
    label: 'Projects',
    icon: FolderKanban,
    end: false,
    description: 'Group related work',
  },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1" aria-label="Workspace navigation">
      <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
        Workspace
      </p>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
              isActive
                ? 'bg-white/[0.09] font-semibold text-white'
                : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <span
                  className="absolute -left-3 h-5 w-[3px] rounded-r-full bg-brand-400"
                  aria-hidden="true"
                />
              ) : null}
              <item.icon
                className={cn(
                  'size-[18px] shrink-0',
                  isActive ? 'text-brand-300' : 'text-slate-500',
                )}
                aria-hidden="true"
              />
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarUserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      toast.success('Signed out')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error('Could not sign out', {
        description: getErrorMessage(error),
      })
    } finally {
      setLoggingOut(false)
    }
  }

  const name = getDisplayName(user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] p-2.5 text-left transition-colors hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
          aria-label="Open account menu"
        >
          <Avatar name={name} size="sm" tone="dark" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-semibold text-white">
              {name}
            </span>
            <span className="mt-0.5 block truncate text-[10px] text-slate-500">
              {user?.email ?? 'Personal workspace'}
            </span>
          </span>
          <span
            className="grid size-6 place-items-center rounded-md text-slate-500"
            aria-hidden="true"
          >
            <svg viewBox="0 0 16 16" className="size-3.5 fill-current">
              <circle cx="3" cy="8" r="1.4" />
              <circle cx="8" cy="8" r="1.4" />
              <circle cx="13" cy="8" r="1.4" />
            </svg>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="w-[230px]">
        <div className="px-2.5 py-2">
          <p className="truncate text-xs font-semibold text-ink">{name}</p>
          <p className="mt-0.5 truncate text-[11px] text-muted">
            {user?.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          icon={UserRound}
          onSelect={() => navigate('/app/profile')}
        >
          Profile & settings
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={BookOpen}
          onSelect={() => {
            window.open('/api/docs/', '_blank', 'noopener,noreferrer')
          }}
        >
          API documentation
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          icon={LogOut}
          destructive
          disabled={loggingOut}
          onSelect={() => {
            void handleLogout()
          }}
        >
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { openCreateTask } = useTaskDialog()

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-[76px] items-center justify-between px-5">
        <Brand variant="dark" to="/app" />
      </div>

      <div className="px-5 pb-5 pt-1">
        <Button
          className="w-full justify-start bg-brand-500 shadow-none hover:bg-brand-600"
          size="md"
          onClick={() => {
            openCreateTask()
            onNavigate?.()
          }}
        >
          <Plus className="size-4" aria-hidden="true" />
          New task
        </Button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-3">
        <SidebarNav onNavigate={onNavigate} />

        <div className="mt-7 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            A calmer rhythm
          </p>
          <p className="mt-1.5 text-[11px] leading-[1.7] text-slate-400">
            Capture the next clear action. Move it forward. Let the rest wait
            its turn.
          </p>
        </div>
      </div>

      <div className="border-t border-white/[0.06] p-3">
        <SidebarUserMenu />
      </div>
    </div>
  )
}

function MobileNav({ open, onOpenChange }: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-[70] bg-slate-950/55 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="sheet-content fixed inset-y-0 left-0 z-[80] w-[286px] max-w-[86vw] border-r border-white/10 shadow-float focus:outline-none">
          <DialogPrimitive.Title className="sr-only">
            Workspace navigation
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Navigate between dashboard, tasks, board and projects.
          </DialogPrimitive.Description>
          <DialogPrimitive.Close
            className="absolute right-3 top-4 z-10 grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="size-4" aria-hidden="true" />
          </DialogPrimitive.Close>
          <SidebarContent onNavigate={() => onOpenChange(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function getPageName(pathname: string) {
  if (pathname === '/app') return 'Dashboard'
  if (pathname.startsWith('/app/tasks/')) return 'Task details'
  if (pathname.startsWith('/app/tasks')) return 'Tasks'
  if (pathname.startsWith('/app/board')) return 'Board'
  if (pathname.startsWith('/app/projects/')) return 'Project details'
  if (pathname.startsWith('/app/projects')) return 'Projects'
  if (pathname.startsWith('/app/profile')) return 'Profile'
  return 'Workspace'
}

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { openCreateTask } = useTaskDialog()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="min-h-dvh bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink focus:shadow-float"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-white/5 lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur-md lg:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-slate-100 hover:text-ink"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
            <Brand to="/app" className="origin-left scale-95" />
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-1 hidden text-xs font-semibold text-muted sm:block">
              {getPageName(location.pathname)}
            </span>
            <Button
              size="icon"
              variant="primary"
              onClick={() => openCreateTask()}
              aria-label="Create a task"
            >
              <Plus className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </header>

        <main id="main-content" className="min-h-[calc(100dvh-4rem)] lg:min-h-dvh">
          <Outlet />
        </main>
      </div>

      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </div>
  )
}

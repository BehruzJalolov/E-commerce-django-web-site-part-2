import {
  ArrowRight,
  CalendarCheck2,
  Check,
  Columns3,
  FolderKanban,
  Gauge,
  KeyRound,
  Layers3,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { ProductPreview } from '@/components/landing/ProductPreview'
import { Brand } from '@/components/ui/Brand'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const FEATURES = [
  {
    icon: FolderKanban,
    title: 'A home for every project',
    description:
      'Group related work, set a clear outcome and keep progress visible without another spreadsheet.',
    visual: (
      <div className="space-y-2.5">
        {[
          { name: 'Website refresh', color: '#6366f1', progress: 72 },
          { name: 'Mobile app v2', color: '#0ea5e9', progress: 46 },
          { name: 'Q4 launch', color: '#f59e0b', progress: 28 },
        ].map((project) => (
          <div key={project.name}>
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </span>
              <span className="text-subtle">{project.progress}%</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${project.progress}%`,
                  backgroundColor: project.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Columns3,
    title: 'Flow that stays visible',
    description:
      'Move tasks across To Do, In Progress and Done. Drag on desktop, or use an accessible status control anywhere.',
    visual: (
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'To do', dot: 'bg-slate-400', tasks: 2 },
          { label: 'Doing', dot: 'bg-sky-500', tasks: 1 },
          { label: 'Done', dot: 'bg-emerald-500', tasks: 2 },
        ].map((column) => (
          <div key={column.label} className="rounded-lg bg-slate-50 p-2">
            <div className="flex items-center gap-1 text-[8px] font-bold text-muted">
              <span className={`size-1 rounded-full ${column.dot}`} />
              {column.label}
            </div>
            <div className="mt-2 space-y-1.5">
              {Array.from({ length: column.tasks }).map((_, index) => (
                <div
                  key={index}
                  className="rounded border border-line bg-white p-1.5 shadow-[0_1px_1px_rgb(16_24_40/0.03)]"
                >
                  <div className="h-1 w-4/5 rounded bg-slate-200" />
                  <div className="mt-1 h-1 w-3/5 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Gauge,
    title: 'Signal, not noise',
    description:
      'See completion, overdue work and project momentum calculated from your real records — never invented numbers.',
    visual: (
      <div className="flex h-[74px] items-end gap-1.5">
        {[42, 64, 52, 78, 60, 88, 56].map((height, index) => (
          <div key={index} className="flex flex-1 items-end gap-1">
            <span
              className="flex-1 rounded-t-sm bg-brand-100"
              style={{ height: `${height * 0.62}%` }}
            />
            <span
              className="flex-1 rounded-t-sm bg-brand-500"
              style={{ height: `${height}%` }}
            />
          </div>
        ))}
      </div>
    ),
  },
]

const WORKFLOW = [
  {
    step: '01',
    title: 'Capture the work',
    description:
      'Create projects for outcomes and tasks for the next clear action. Give each one a priority and a deadline.',
  },
  {
    step: '02',
    title: 'Find your focus',
    description:
      'Filter by project, priority or due date. Search instantly. Let the board show what is moving and what is stuck.',
  },
  {
    step: '03',
    title: 'Finish and reflect',
    description:
      'Complete tasks, reopen what needs another pass and watch the dashboard show real progress over time.',
  },
]

const SECURITY_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Ownership enforced server-side',
    description:
      'Every project and task query is scoped to the authenticated user — not hidden by the interface.',
  },
  {
    icon: KeyRound,
    title: 'Secure session authentication',
    description:
      'HTTP-only session cookies, CSRF protection and validated inputs protect each state-changing request.',
  },
  {
    icon: LockKeyhole,
    title: 'No shared shortcuts',
    description:
      'Changing an ID in a URL cannot reveal another person’s work. Access checks happen on every request.',
  },
]

export function LandingPage() {
  useDocumentTitle('Plan clearly. Finish calmly')

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/85 backdrop-blur-lg">
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <Brand showTagline />
          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Main navigation"
          >
            <a
              href="#features"
              className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
            >
              How it works
            </a>
            <a
              href="#security"
              className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
            >
              Security
            </a>
            <a
              href="/api/docs/"
              target="_blank"
              rel="noreferrer"
              className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
            >
              API docs
            </a>
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <Link
              to="/login"
              className="hidden rounded-lg px-3 py-2 text-[13px] font-semibold text-muted transition-colors hover:bg-slate-100 hover:text-ink sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-brand-600 px-3.5 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 sm:h-10 sm:px-4 sm:text-[13px]"
            >
              Start free
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-sidebar">
          <div
            className="landing-grid absolute inset-0 opacity-40"
            aria-hidden="true"
          />
          <div
            className="absolute -right-40 top-0 size-[600px] rounded-full bg-brand-500/[0.12] blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-64 left-1/4 size-[500px] rounded-full bg-sky-400/[0.06] blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto grid max-w-[1200px] items-center gap-16 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:pb-28 lg:pt-24">
            <div className="animate-rise-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold text-slate-300">
                <Sparkles
                  className="size-3.5 text-amber-300"
                  aria-hidden="true"
                />
                A calmer workspace for meaningful work
              </div>

              <h1 className="mt-7 max-w-[620px] text-balance font-display text-[44px] font-extrabold leading-[1.04] tracking-[-0.05em] text-white sm:text-[58px] xl:text-[64px]">
                Plan clearly.
                <br />
                <span className="text-brand-300">Finish calmly.</span>
              </h1>

              <p className="mt-6 max-w-[510px] text-[15px] leading-7 text-slate-400 sm:text-base">
                TaskFlow brings your projects, tasks and momentum into one
                focused place. Less time deciding what matters — more time
                moving it forward.
              </p>

              <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-400"
                >
                  Create your workspace
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
                >
                  Sign in
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-slate-400">
                {[
                  'Private workspace',
                  'No setup maze',
                  'Every control works',
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <span className="grid size-4 place-items-center rounded-full bg-white/[0.06] text-brand-300">
                      <Check className="size-2.5" aria-hidden="true" />
                    </span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="animate-rise-in [animation-delay:120ms]">
              <ProductPreview />
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-20 border-b border-line bg-canvas py-20 sm:py-24"
        >
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="eyebrow">Built around focus</p>
              <h2 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-[42px]">
                Everything you need. Nothing you don’t.
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted">
                A focused set of tools that work together, designed to reduce
                the distance between deciding and doing.
              </p>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className="group flex flex-col rounded-[22px] border border-line bg-surface p-6 shadow-card transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-1 hover:border-line-strong"
                >
                  <div className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <feature.icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-[17px] font-bold tracking-tight text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-muted">
                    {feature.description}
                  </p>
                  <div className="mt-auto pt-6">
                    <div className="rounded-xl border border-line bg-slate-50/70 p-3.5">
                      {feature.visual}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface py-20 sm:py-24">
          <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="eyebrow">Your next clear move</p>
              <h2 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-[40px]">
                Stop scanning everything. Start seeing what matters.
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-muted">
                The dashboard and task views are built around real records from
                your account. Search, filters, sorting and pagination work
                together — so the right task is always within reach.
              </p>

              <ul className="mt-7 space-y-4">
                {[
                  {
                    icon: Search,
                    text: 'Search across titles, descriptions and project names.',
                  },
                  {
                    icon: CalendarCheck2,
                    text: 'Surface overdue work and the next seven days of deadlines.',
                  },
                  {
                    icon: Target,
                    text: 'Filter by status, priority, project and due date at the same time.',
                  },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="flex items-start gap-3 text-[13px] leading-6 text-muted"
                  >
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                      <item.icon className="size-3.5" aria-hidden="true" />
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
              >
                Build your workspace
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="relative">
              <div
                className="absolute -inset-5 rounded-[2rem] bg-brand-50"
                aria-hidden="true"
              />
              <div className="relative rounded-2xl border border-line bg-canvas p-4 shadow-card sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                      Today
                    </p>
                    <p className="mt-1 font-display text-lg font-extrabold tracking-tight text-ink">
                      Your focus list
                    </p>
                  </div>
                  <span className="rounded-lg bg-brand-600 px-3 py-2 text-[10px] font-semibold text-white">
                    + Task
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    {
                      title: 'Finalize the homepage story',
                      project: 'Website refresh',
                      color: '#6366f1',
                      status: 'In progress',
                      tone: 'text-info bg-info-soft border-sky-200',
                    },
                    {
                      title: 'Review onboarding flow',
                      project: 'Mobile app v2',
                      color: '#0ea5e9',
                      status: 'To do',
                      tone: 'text-slate-600 bg-slate-50 border-slate-200',
                    },
                    {
                      title: 'Prepare launch notes',
                      project: 'Q4 launch',
                      color: '#f59e0b',
                      status: 'Due soon',
                      tone: 'text-warning bg-warning-soft border-amber-200',
                    },
                  ].map((task) => (
                    <div
                      key={task.title}
                      className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5"
                    >
                      <span className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-slate-200 text-transparent">
                        <Check className="size-2.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-ink">
                          {task.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted">
                          <span
                            className="size-1 rounded-full"
                            style={{ backgroundColor: task.color }}
                          />
                          {task.project}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${task.tone}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-line-strong bg-white/60 px-3.5 py-3">
                  <span className="flex items-center gap-2 text-[10px] font-medium text-muted">
                    <Layers3 className="size-3.5" aria-hidden="true" />
                    Three projects, one calm view.
                  </span>
                  <span className="text-[9px] font-semibold text-subtle">
                    Preview
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="workflow"
          className="scroll-mt-20 border-y border-line bg-canvas py-20 sm:py-24"
        >
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">A simple rhythm</p>
                <h2 className="mt-3 font-display text-[32px] font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-[40px]">
                  From first thought to finished.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-muted">
                No elaborate methodology to learn. Just a clear loop you can
                return to every day.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
              {WORKFLOW.map((step) => (
                <article key={step.step} className="bg-surface p-6 sm:p-7">
                  <span className="font-display text-xs font-extrabold tracking-[0.08em] text-brand-600">
                    {step.step}
                  </span>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-muted">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="security"
          className="scroll-mt-20 bg-surface py-20 sm:py-24"
        >
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <div className="grid size-12 place-items-center rounded-2xl bg-positive-soft text-positive ring-1 ring-emerald-100">
                  <ShieldCheck className="size-6" aria-hidden="true" />
                </div>
                <p className="eyebrow mt-6">Private by design</p>
                <h2 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-[40px]">
                  Your work stays yours.
                </h2>
                <p className="mt-4 text-[14px] leading-7 text-muted">
                  Authorization is part of the API, not a layer of frontend
                  decoration. Your workspace is isolated at the data layer.
                </p>
              </div>

              <div className="space-y-3">
                {SECURITY_ITEMS.map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-2xl border border-line bg-canvas p-5"
                  >
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-sm ring-1 ring-line">
                      <item.icon className="size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[12px] leading-6 text-muted">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-canvas pb-20 pt-4 sm:pb-24">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="relative overflow-hidden rounded-[28px] bg-sidebar px-6 py-14 text-center sm:px-12 sm:py-16">
              <div
                className="landing-grid absolute inset-0 opacity-30"
                aria-hidden="true"
              />
              <div
                className="absolute left-1/2 top-0 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative mx-auto max-w-xl">
                <div className="mx-auto grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-brand-300">
                  <UsersRound className="size-5" aria-hidden="true" />
                </div>
                <h2 className="mt-6 text-balance font-display text-[30px] font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-[38px]">
                  Make your next clear move.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Create a private workspace and bring your work into focus.
                </p>
                <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
                  <Link
                    to="/register"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
                  >
                    Create your workspace
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <Brand />
              <p className="mt-3 max-w-xs text-xs leading-6 text-muted">
                A focused workspace for projects, tasks and the progress that
                matters.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-subtle">
                Product
              </p>
              <ul className="mt-3 space-y-2 text-xs text-muted">
                <li>
                  <a href="#features" className="hover:text-ink">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#workflow" className="hover:text-ink">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#security" className="hover:text-ink">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-subtle">
                Account
              </p>
              <ul className="mt-3 space-y-2 text-xs text-muted">
                <li>
                  <Link to="/login" className="hover:text-ink">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-ink">
                    Create account
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-subtle">
                Developers
              </p>
              <ul className="mt-3 space-y-2 text-xs text-muted">
                <li>
                  <a
                    href="/api/docs/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ink"
                  >
                    API reference
                  </a>
                </li>
                <li>
                  <a
                    href="/api/schema/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ink"
                  >
                    OpenAPI schema
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-9 flex flex-col gap-2 border-t border-line pt-5 text-[10px] text-subtle sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} TaskFlow.</p>
            <p className="inline-flex items-center gap-1.5">
              <LockKeyhole className="size-3" aria-hidden="true" />
              Session-protected workspace
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

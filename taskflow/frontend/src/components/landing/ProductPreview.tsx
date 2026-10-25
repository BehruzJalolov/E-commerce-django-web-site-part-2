import { CheckCircle2, Circle, Columns3, FolderKanban, LayoutDashboard, ListChecks } from 'lucide-react'

const COLUMNS = [
  {
    title: 'To do',
    dot: 'bg-slate-400',
    tasks: [
      { title: 'Refine onboarding copy', project: 'Mobile app v2', color: '#0ea5e9' },
      { title: 'Review launch checklist', project: 'Q4 launch', color: '#f59e0b' },
    ],
  },
  {
    title: 'In progress',
    dot: 'bg-sky-500',
    tasks: [
      { title: 'Finalize homepage story', project: 'Website refresh', color: '#6366f1' },
    ],
  },
  {
    title: 'Done',
    dot: 'bg-emerald-500',
    tasks: [
      { title: 'QA the pricing page', project: 'Website refresh', color: '#6366f1' },
    ],
  },
]

export function ProductPreview() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-6 rounded-[2rem] bg-brand-500/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-[18px] border border-white/15 bg-surface shadow-float">
        <div className="flex h-9 items-center gap-2 border-b border-line bg-white px-3">
          <span className="flex gap-1" aria-hidden="true">
            <span className="size-1.5 rounded-full bg-slate-200" />
            <span className="size-1.5 rounded-full bg-slate-200" />
            <span className="size-1.5 rounded-full bg-slate-200" />
          </span>
          <span className="mx-auto rounded bg-slate-100 px-8 py-1 text-[8px] font-medium text-subtle">
            taskflow.app
          </span>
          <span className="size-4 rounded-full bg-brand-100" aria-hidden="true" />
        </div>

        <div
          role="img"
          aria-label="Illustrative preview of the TaskFlow workspace showing a sidebar, today's tasks and a Kanban board."
        >
          <div className="grid min-h-[390px] grid-cols-[86px_1fr]" aria-hidden="true">
            <aside className="flex flex-col bg-sidebar p-2.5">
              <div className="mb-5 flex items-center gap-1.5 px-1.5">
                <span className="grid size-5 place-items-center rounded-md bg-brand-500">
                  <CheckCircle2 className="size-3 text-white" />
                </span>
                <span className="font-display text-[9px] font-extrabold text-white">
                  TaskFlow
                </span>
              </div>
              <div className="space-y-1">
                {[
                  { label: 'Overview', icon: LayoutDashboard, active: false },
                  { label: 'Tasks', icon: ListChecks, active: false },
                  { label: 'Board', icon: Columns3, active: true },
                  { label: 'Projects', icon: FolderKanban, active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-1.5 rounded px-1.5 py-1 text-[7px] font-medium ${
                      item.active
                        ? 'bg-white/[0.09] text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    <item.icon className="size-2.5" />
                    {item.label}
                  </div>
                ))}
              </div>
              <div className="mt-auto flex items-center gap-1.5 border-t border-white/[0.07] pt-2">
                <span className="grid size-4 place-items-center rounded-full bg-white/10 text-[6px] font-bold text-white">
                  AM
                </span>
                <span className="text-[6px] text-slate-400">Alex Morgan</span>
              </div>
            </aside>

            <div className="min-w-0 bg-[#f6f7fb] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Tuesday, May 14
                  </p>
                  <p className="mt-1 font-display text-[15px] font-extrabold tracking-tight text-ink">
                    Good morning
                  </p>
                  <p className="mt-0.5 text-[7px] text-muted">
                    Here&apos;s the shape of your week.
                  </p>
                </div>
                <span className="rounded-md bg-brand-600 px-2.5 py-1.5 text-[7px] font-semibold text-white">
                  + New task
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="col-span-2 rounded-lg border border-line bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] font-bold uppercase tracking-wide text-muted">
                      This week
                    </span>
                    <span className="text-[6px] text-subtle">Activity</span>
                  </div>
                  <div className="mt-3 flex h-14 items-end gap-1.5">
                    {[38, 54, 46, 72, 60, 84, 48].map((height, index) => (
                      <div
                        key={index}
                        className="flex flex-1 items-end gap-0.5"
                      >
                        <span
                          className="flex-1 rounded-t-sm bg-brand-200"
                          style={{ height: `${height * 0.6}%` }}
                        />
                        <span
                          className="flex-1 rounded-t-sm bg-brand-500"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1.5 flex justify-between text-[5px] text-subtle">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                      <span key={`${day}-${index}`}>{day}</span>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-line bg-white p-3">
                  <p className="text-[7px] font-bold uppercase tracking-wide text-muted">
                    Momentum
                  </p>
                  <div className="relative mx-auto mt-3 grid size-16 place-items-center rounded-full border-[5px] border-slate-100 border-t-brand-500 border-r-brand-500">
                    <span className="font-display text-[13px] font-extrabold text-ink">
                      68%
                    </span>
                  </div>
                  <p className="mt-2 text-center text-[6px] text-subtle">
                    Completion
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {COLUMNS.map((column) => (
                  <div key={column.title} className="min-w-0">
                    <div className="mb-1.5 flex items-center gap-1 px-0.5">
                      <span
                        className={`size-1 rounded-full ${column.dot}`}
                      />
                      <span className="text-[7px] font-bold text-ink">
                        {column.title}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {column.tasks.map((task) => (
                        <div
                          key={task.title}
                          className="rounded-md border border-line bg-white p-2 shadow-[0_1px_1px_rgb(16_24_40/0.03)]"
                        >
                          <div className="mb-1 flex items-center gap-1">
                            <span
                              className="size-1 rounded-full"
                              style={{ backgroundColor: task.color }}
                            />
                            <span className="truncate text-[5px] text-muted">
                              {task.project}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-[6.5px] font-semibold leading-[1.5] text-ink">
                            {task.title}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1 border-t border-line/70 pt-1">
                            <Circle className="size-1.5 text-slate-300" />
                            <span className="text-[5px] text-subtle">
                              Shared project
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 shadow-float sm:flex">
        <span className="grid size-7 place-items-center rounded-full bg-positive-soft text-positive">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[9px] font-bold text-ink">Clarity, not clutter</p>
          <p className="text-[8px] text-muted">Every task has a home.</p>
        </div>
      </div>

      <p className="mt-4 text-center text-[10px] font-medium text-slate-500">
        An illustrative preview of the TaskFlow workspace.
      </p>
    </div>
  )
}

import { CircleCheck, LockKeyhole, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

import { Brand } from '@/components/ui/Brand'

const BENEFITS = [
  'See every project and deadline in one calm place.',
  'Move work from idea to done without losing context.',
  'Keep your workspace private with server-enforced access.',
]

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-surface lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,0.72fr)]">
      <aside className="relative hidden overflow-hidden bg-sidebar p-10 lg:flex lg:flex-col xl:p-14">
        <div
          className="landing-grid absolute inset-0 opacity-50"
          aria-hidden="true"
        />
        <div
          className="absolute -right-32 top-1/4 size-[420px] rounded-full bg-brand-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-40 -left-28 size-[360px] rounded-full bg-sky-500/[0.07] blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex h-full flex-col">
          <Brand variant="dark" showTagline />

          <div className="my-auto max-w-[470px] py-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold text-slate-300">
              <Sparkles className="size-3.5 text-amber-300" aria-hidden="true" />
              A calmer way to get important work done
            </div>
            <h1 className="mt-7 text-balance font-display text-[42px] font-extrabold leading-[1.08] tracking-[-0.045em] text-white xl:text-[48px]">
              A clear head is a competitive advantage.
            </h1>
            <p className="mt-5 text-[15px] leading-7 text-slate-400">
              TaskFlow brings projects, priorities and progress together so you
              can stop juggling and start finishing.
            </p>

            <ul className="mt-9 space-y-4">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-[13px] leading-6 text-slate-300"
                >
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-500/15 text-brand-300">
                    <CircleCheck className="size-3.5" aria-hidden="true" />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-brand-300">
                <LockKeyhole className="size-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  Private by design
                </p>
                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                  Your projects stay yours. Ownership is checked on the server
                  for every read and every change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-h-dvh flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 lg:hidden">
          <Brand />
          <span className="text-[11px] font-semibold text-muted">
            Plan. Focus. Finish.
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        <footer className="px-6 pb-6 text-center text-[11px] text-subtle">
          © {new Date().getFullYear()} TaskFlow. Built for focused work.
        </footer>
      </main>
    </div>
  )
}

import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
  title: string
  updated: string
  children: ReactNode
}

export default function LegalPage({ title, updated, children }: Props) {
  return (
    <main className="min-h-screen px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-lg font-extrabold tracking-[0.14em]"
          style={{ color: 'var(--accent-teal)' }}
        >
          СОЦИОНИКА
        </Link>

        <h1
          className="mt-8 text-[28px] font-bold sm:text-[36px]"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h1>
        <p
          className="mt-2 font-body text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Редакция от {updated}
        </p>

        <div
          className="mt-8 flex flex-col gap-6 font-body text-[15px] leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {children}
        </div>

        <nav className="mt-12 flex flex-wrap gap-5 text-sm">
          <Link href="/" style={{ color: 'var(--accent-teal)' }}>
            На главную
          </Link>
          <Link href="/privacy" style={{ color: 'var(--accent-teal)' }}>
            Политика конфиденциальности
          </Link>
          <Link href="/offer" style={{ color: 'var(--accent-teal)' }}>
            Оферта
          </Link>
        </nav>
      </div>
    </main>
  )
}

export function Section({
  heading,
  children,
}: {
  heading: string
  children: ReactNode
}) {
  return (
    <section>
      <h2
        className="text-lg font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        {heading}
      </h2>
      <div className="mt-2 flex flex-col gap-3">{children}</div>
    </section>
  )
}

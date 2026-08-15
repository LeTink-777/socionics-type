'use client'

import { motion } from 'framer-motion'
import {
  Briefcase,
  Heart,
  HeartHandshake,
  Lock,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import AxisChart from '@/components/AxisChart'
import PricingSlider from '@/components/PricingSlider'
import { useHydrated, useStoredData } from '@/lib/client-store'
import { TYPES, getType, type SocionicsType } from '@/lib/socionics'

type LockedCard = {
  icon: LucideIcon
  title: string
  body: string
  accent?: boolean
}

export default function ResultPage() {
  const hydrated = useHydrated()
  const data = useStoredData()

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <p className="font-body" style={{ color: 'var(--text-muted)' }}>
          Загружаем твой результат
        </p>
      </main>
    )
  }

  const type: SocionicsType | null = data ? getType(data.type) : null

  if (!data || !type) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-5 text-center">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Мы не нашли твой результат
        </h1>
        <p className="max-w-md font-body" style={{ color: 'var(--text-secondary)' }}>
          Похоже, тест ещё не пройден или данные не сохранились. Это займёт минуту.
        </p>
        <Link
          href="/"
          className="inline-flex min-h-[52px] items-center rounded-2xl px-7 font-bold text-white"
          style={{ backgroundColor: 'var(--accent-teal)' }}
        >
          Пройти тест
        </Link>
      </main>
    )
  }

  const locked: LockedCard[] = [
    {
      icon: MessageCircle,
      title: 'Как с тобой общаться',
      body: type.communication,
    },
    {
      icon: Heart,
      title: 'Ты в отношениях',
      body: type.relationship,
    },
    {
      icon: Briefcase,
      title: 'Твоя карьера и предназначение',
      body: type.career,
    },
  ]

  const partners = type.compatible
    .map((code) => TYPES[code])
    .filter(Boolean)

  return (
    <main className="min-h-screen pb-20">
      <header className="mx-auto max-w-4xl px-5 py-6 sm:px-8">
        <Link
          href="/"
          className="text-lg font-extrabold tracking-[0.14em]"
          style={{ color: 'var(--accent-teal)' }}
        >
          СОЦИОНИКА
        </Link>
      </header>

      <section className="mx-auto max-w-4xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="rounded-3xl border bg-white p-6 text-center sm:p-10"
          style={{
            borderColor: 'var(--border)',
            borderTop: '3px solid var(--accent-teal)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--text-muted)' }}
          >
            Твой соционический тип
          </p>

          <p
            className="mt-3 font-mono text-[56px] font-bold leading-none tracking-tight sm:text-[80px]"
            style={{ color: 'var(--accent-teal)' }}
          >
            {type.code}
          </p>

          <h1
            className="mt-3 text-2xl font-bold sm:text-[32px]"
            style={{ color: 'var(--text-primary)' }}
          >
            {type.name}
          </h1>

          <p
            className="mx-auto mt-3 max-w-xl font-body text-[16px] leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {type.tagline}
          </p>

          <div className="mt-8 text-left">
            <AxisChart answers={data.answers} />
          </div>
        </motion.div>
      </section>

      <section className="mx-auto mt-6 grid max-w-4xl gap-4 px-5 sm:px-8 md:grid-cols-2">
        <article
          className="rounded-2xl border bg-white p-5 sm:p-6"
          style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
        >
          <h2
            className="text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Твой психотип
          </h2>
          <p
            className="mt-3 font-body text-[15px] leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {type.description}
          </p>
        </article>

        <article
          className="rounded-2xl border bg-white p-5 sm:p-6"
          style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
        >
          <h2
            className="text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Твои сильные стороны
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {type.strengths.map((item) => (
              <li
                key={item}
                className="rounded-full px-3.5 py-2 text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--accent-teal-light)',
                  color: 'var(--accent-teal)',
                }}
              >
                {item}
              </li>
            ))}
          </ul>
          <p
            className="mt-4 font-body text-[14px]"
            style={{ color: 'var(--text-muted)' }}
          >
            Квадра: {type.quadra} · Роль: {type.role}
          </p>
        </article>
      </section>

      <div className="mx-auto mt-12 flex max-w-4xl items-center gap-4 px-5 sm:px-8">
        <span
          className="h-px flex-1"
          style={{ backgroundColor: 'var(--accent-teal)' }}
        />
        <span
          className="text-xs font-bold uppercase tracking-[0.16em] whitespace-nowrap"
          style={{ color: 'var(--accent-teal)' }}
        >
          Полный разбор закрыт
        </span>
        <span
          className="h-px flex-1"
          style={{ backgroundColor: 'var(--accent-teal)' }}
        />
      </div>

      <section className="relative mx-auto mt-6 max-w-4xl px-5 sm:px-8">
        <div className="grid gap-4 md:grid-cols-2" aria-hidden>
          {locked.map((card) => {
            const Icon = card.icon
            return (
              <article
                key={card.title}
                className="rounded-2xl border bg-white p-5 select-none sm:p-6"
                style={{
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--shadow)',
                  filter: 'blur(7px)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Icon size={18} style={{ color: 'var(--accent-teal)' }} />
                  <h2
                    className="text-lg font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {card.title}
                  </h2>
                </div>
                <p
                  className="mt-3 font-body text-[15px] leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {card.body}
                </p>
              </article>
            )
          })}

          <article
            className="rounded-2xl border-2 bg-white p-5 select-none sm:p-6"
            style={{
              borderColor: 'var(--accent-coral)',
              boxShadow: 'var(--shadow)',
              filter: 'blur(7px)',
            }}
          >
            <div className="flex items-center gap-2">
              <HeartHandshake size={18} style={{ color: 'var(--accent-coral)' }} />
              <h2
                className="text-lg font-bold"
                style={{ color: 'var(--accent-coral)' }}
              >
                Твой идеальный партнёр
              </h2>
            </div>
            <p
              className="mt-3 font-body text-[15px] leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {partners.map((partner) => `${partner.code} — ${partner.name}`).join(', ')}.
              Разбираем, почему рядом с ними ты не тратишь силы на объяснения.
            </p>
          </article>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5">
          <div
            className="pointer-events-auto w-full max-w-md rounded-3xl border bg-white p-6 text-center"
            style={{
              borderColor: 'var(--accent-teal)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <span
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: 'var(--accent-teal-light)' }}
            >
              <Lock size={20} style={{ color: 'var(--accent-teal)' }} aria-hidden />
            </span>
            <h2
              className="mt-4 text-lg font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Открой полный психологический портрет
            </h2>
            <p
              className="mt-2 font-body text-[15px]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Общение, отношения, карьера и идеальный партнёр
            </p>
            <a
              href="#pricing"
              className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl font-bold text-white"
              style={{ backgroundColor: 'var(--accent-teal)' }}
            >
              <Sparkles size={18} aria-hidden />
              Выбрать разбор
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-4xl px-5 sm:px-8">
        <PricingSlider type={data.type} email={data.email} />
      </section>

      <footer className="mx-auto mt-12 max-w-4xl px-5 sm:px-8">
        <nav className="flex flex-wrap gap-5 text-sm">
          <Link href="/privacy" style={{ color: 'var(--accent-teal)' }}>
            Политика конфиденциальности
          </Link>
          <Link href="/offer" style={{ color: 'var(--accent-teal)' }}>
            Оферта
          </Link>
        </nav>
      </footer>
    </main>
  )
}

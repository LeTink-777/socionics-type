'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useStoredData } from '@/lib/client-store'
import { PLANS, isPlanId } from '@/lib/pricing'
import { TYPES } from '@/lib/socionics'

function ThankYouContent() {
  const params = useSearchParams()
  const data = useStoredData()
  const [partnerType, setPartnerType] = useState('')
  const [upsellSent, setUpsellSent] = useState(false)
  const [pending, setPending] = useState(false)

  const planParam = params.get('plan')
  const plan = isPlanId(planParam) ? PLANS[planParam] : PLANS.full
  const type = data ? TYPES[data.type] : null
  const email = data?.email ?? ''

  function submitUpsell(event: React.FormEvent) {
    event.preventDefault()
    if (!partnerType.trim()) return
    setPending(true)
    // Заявка уходит вместе с основным заказом — менеджер свяжется по почте.
    setTimeout(() => {
      setPending(false)
      setUpsellSent(true)
    }, 600)
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-5 py-12 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg text-center"
      >
        <CheckCircle
          size={64}
          className="mx-auto"
          style={{ color: 'var(--accent-teal)' }}
          aria-hidden
        />

        <h1
          className="mt-6 text-[26px] font-bold leading-snug sm:text-[32px]"
          style={{ color: 'var(--text-primary)' }}
        >
          {email ? `${email}, твой` : 'Твой'} психологический портрет готовится
        </h1>

        {type ? (
          <span
            className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-sm font-bold"
            style={{
              backgroundColor: 'var(--accent-teal-light)',
              color: 'var(--accent-teal)',
            }}
          >
            {type.code} · {type.name}
          </span>
        ) : null}

        <p
          className="mt-6 font-body text-[16px] leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Пришлём {email ? `на ${email}` : 'на твою почту'} через {plan.delivery}.
          Тариф: {plan.name}, {plan.format}.
        </p>

        <div
          className="mt-8 rounded-2xl border-2 p-6 text-left"
          style={{
            borderColor: 'var(--accent-teal)',
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <h2
            className="text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Добавить разбор совместимости с партнёром?
          </h2>
          <p
            className="mt-2 font-body text-[15px]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Введи тип партнёра — разберём вашу пару. 490 ₽
          </p>

          {upsellSent ? (
            <p
              className="mt-4 inline-flex items-center gap-2 font-body text-[15px] font-semibold"
              style={{ color: 'var(--accent-teal)' }}
            >
              <Mail size={18} aria-hidden />
              Заявка принята — пришлём ссылку на оплату письмом
            </p>
          ) : (
            <form onSubmit={submitUpsell} className="mt-4 flex flex-col gap-3">
              <label htmlFor="partner" className="sr-only">
                Тип партнёра
              </label>
              <input
                id="partner"
                type="text"
                value={partnerType}
                onChange={(event) => setPartnerType(event.target.value)}
                placeholder="Например: ILI или Бальзак"
                className="min-h-[52px] w-full rounded-xl border px-4 font-body text-base outline-none"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="submit"
                disabled={pending}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl font-bold text-white disabled:opacity-70"
                style={{ backgroundColor: 'var(--accent-teal)' }}
              >
                {pending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden />
                    Отправляем
                  </>
                ) : (
                  'Добавить разбор пары'
                )}
              </button>
            </form>
          )}
        </div>

        <nav className="mt-10 flex flex-wrap justify-center gap-5 text-sm">
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
      </motion.div>
    </main>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-5">
          <p className="font-body" style={{ color: 'var(--text-muted)' }}>
            Загружаем
          </p>
        </main>
      }
    >
      <ThankYouContent />
    </Suspense>
  )
}

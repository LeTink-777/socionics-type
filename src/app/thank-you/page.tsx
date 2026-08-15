'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { readPendingOrder, useStoredData } from '@/lib/client-store'
import { PLANS, isPlanId } from '@/lib/pricing'
import { TYPES } from '@/lib/socionics'
import { generateResultSections } from '@/lib/result-sections'

function ThankYouContent() {
  const params = useSearchParams()
  const data = useStoredData()
  const [partnerType, setPartnerType] = useState('')
  const [upsellSent, setUpsellSent] = useState(false)
  const [pending, setPending] = useState(false)

  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [storedPlan, setStoredPlan] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    const order = readPendingOrder()
    if (order) {
      setPaymentId(order.paymentId)
      setStoredPlan(order.plan)
    }
  }, [])

  const planParam = params.get('plan')
  const planId = isPlanId(planParam)
    ? planParam
    : isPlanId(storedPlan)
      ? storedPlan
      : 'full'
  const plan = PLANS[planId]
  const type = data ? TYPES[data.type] : null
  const email = data?.email ?? ''

  // Тот же построитель, что использует PDF в письме — страница и вложение
  // всегда показывают одно и то же.
  const sections = useMemo(
    () => (data ? generateResultSections({ type: data.type }, planId) : []),
    [data, planId],
  )

  async function handleDownloadPDF() {
    if (!paymentId) {
      setDownloadError(
        'Не нашли номер платежа в этом браузере. Разбор отправлен тебе на почту.',
      )
      return
    }

    setDownloading(true)
    setDownloadError('')

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      })

      if (!response.ok) throw new Error(`PDF request failed with ${response.status}`)

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'tip-lichnosti.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      // Немедленный revoke в некоторых браузерах отменяет загрузку.
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
    } catch {
      setDownloadError('Не удалось скачать PDF. Он также отправлен тебе на почту.')
    } finally {
      setDownloading(false)
    }
  }

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
          Оплата прошла успешно!
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
          Твой психологический портрет открыт ниже. Копия отправлена{' '}
          {email ? `на ${email}` : 'на твою почту'}. Тариф: {plan.name}.
        </p>

        <div className="mt-8">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: 'var(--accent-teal)' }}
          >
            <Download size={18} aria-hidden />
            {downloading ? 'Готовим PDF…' : 'Скачать PDF'}
          </button>

          {downloadError ? (
            <p
              className="mt-3 text-sm"
              style={{ color: 'var(--accent-coral)' }}
              role="alert"
            >
              {downloadError}
            </p>
          ) : null}
        </div>

        {sections.length > 0 ? (
          <section className="mt-12 text-left" aria-label="Твой разбор">
            <ul className="grid gap-4">
              {sections.map((section) => (
                <li
                  key={section.title}
                  className="rounded-2xl border bg-white p-6"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <h2
                    className="text-[16px] font-bold"
                    style={{ color: 'var(--accent-teal)' }}
                  >
                    {section.title}
                  </h2>
                  <p
                    className="mt-2.5 font-body text-[15px] leading-relaxed whitespace-pre-line"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {section.content}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

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

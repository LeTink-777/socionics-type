'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  Clock,
  FileText,
  Loader2,
  RotateCcw,
  Shield,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { WINDOW_MS, claimSpot, timerStart, useSpots } from '@/lib/client-store'
import { PLANS, PLAN_ORDER, formatPrice } from '@/lib/pricing'

type Props = {
  type: string
  email: string
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export default function PricingSlider({ type, email }: Props) {
  const [index, setIndex] = useState(1)
  const [remaining, setRemaining] = useState<number | null>(null)
  const spots = useSpots()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const plan = PLANS[PLAN_ORDER[index]]

  // Таймер и счётчик мест живут в localStorage, чтобы не сбрасываться при
  // переходах между страницами внутри одной сессии.
  useEffect(() => {
    const start = timerStart()
    const tick = () => setRemaining(Math.max(0, start + WINDOW_MS - Date.now()))
    // Первый отсчёт — в кадре анимации, чтобы таймер не появлялся с задержкой
    // в секунду, но и не вызывал setState синхронно в теле эффекта.
    const frame = requestAnimationFrame(tick)
    const id = setInterval(tick, 1000)
    return () => {
      cancelAnimationFrame(frame)
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    claimSpot()
  }, [])

  const countdown = useMemo(() => {
    if (remaining === null) return null
    const totalSeconds = Math.floor(remaining / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }, [remaining])

  const badge =
    plan.id === 'expert' ? `Осталось ${spots} места` : plan.badge

  const badgeColor =
    plan.badgeTone === 'gold'
      ? 'var(--accent-gold)'
      : plan.badgeTone === 'coral'
        ? 'var(--accent-coral)'
        : 'var(--accent-teal)'

  const fillPercent = (index / (PLAN_ORDER.length - 1)) * 100
  const trackFill = `linear-gradient(90deg, var(--accent-teal) ${fillPercent}%, var(--border) ${fillPercent}%)`

  async function checkout() {
    setPending(true)
    setError('')

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan.id,
          userData: { type, email },
        }),
      })

      const data = (await response.json()) as {
        confirmationUrl?: string
        error?: string
      }

      if (!response.ok || !data.confirmationUrl) {
        setError(data.error ?? 'Не удалось создать платёж. Попробуй ещё раз.')
        setPending(false)
        return
      }

      window.location.href = data.confirmationUrl
    } catch {
      setError('Нет связи с сервером. Проверь интернет и попробуй снова.')
      setPending(false)
    }
  }

  return (
    <section
      id="pricing"
      className="rounded-3xl border bg-white p-5 sm:p-8"
      style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
    >
      <h2
        className="text-center text-2xl font-bold sm:text-[30px]"
        style={{ color: 'var(--text-primary)' }}
      >
        Выбери глубину разбора
      </h2>
      <p
        className="mt-2 text-center font-body text-[15px]"
        style={{ color: 'var(--text-secondary)' }}
      >
        Передвинь ползунок — состав разбора изменится
      </p>

      <div className="mt-8">
        <div className="flex justify-between px-1">
          {PLAN_ORDER.map((id, position) => (
            <button
              key={id}
              type="button"
              onClick={() => setIndex(position)}
              className="min-h-[44px] px-2 text-sm font-semibold transition-colors"
              style={{
                color:
                  position === index
                    ? 'var(--accent-teal)'
                    : 'var(--text-muted)',
              }}
            >
              {PLANS[id].name}
            </button>
          ))}
        </div>

        <input
          type="range"
          min={0}
          max={PLAN_ORDER.length - 1}
          step={1}
          value={index}
          onChange={(event) => setIndex(Number(event.target.value))}
          className="value-slider mt-1"
          style={{ ['--track-fill' as string]: trackFill }}
          aria-label="Глубина разбора"
          aria-valuetext={plan.name}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="mt-6 rounded-2xl border p-5 sm:p-6"
          style={{
            borderColor: 'var(--accent-teal)',
            backgroundColor: 'var(--accent-teal-light)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {plan.name}
            </h3>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: badgeColor }}
            >
              {badge}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span
              className="font-mono text-4xl font-bold"
              style={{ color: 'var(--accent-teal)' }}
            >
              {formatPrice(plan.price)} ₽
            </span>
            <span
              className="font-body text-lg line-through"
              style={{ color: 'var(--text-muted)' }}
            >
              {formatPrice(plan.oldPrice)} ₽
            </span>
          </div>

          <ul className="mt-4 flex flex-col gap-2">
            {plan.includes.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check
                  size={18}
                  className="mt-0.5 shrink-0"
                  style={{ color: 'var(--accent-teal)' }}
                  aria-hidden
                />
                <span
                  className="font-body text-[15px]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div
            className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-sm"
            style={{ borderColor: 'rgba(15,123,123,0.2)', color: 'var(--text-secondary)' }}
          >
            <span className="inline-flex items-center gap-1.5">
              <FileText size={16} style={{ color: 'var(--accent-teal)' }} aria-hidden />
              {plan.format}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={16} style={{ color: 'var(--accent-teal)' }} aria-hidden />
              {plan.delivery}
            </span>
          </div>

          {plan.id === 'full' && countdown ? (
            <p
              className="mt-4 font-mono text-sm font-bold"
              style={{ color: 'var(--accent-coral)' }}
            >
              Цена вырастет через {countdown}
            </p>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={checkout}
        disabled={pending}
        className="mt-5 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-white transition-transform duration-150 active:scale-[0.99] disabled:opacity-70"
        style={{
          backgroundColor: 'var(--accent-teal)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {pending ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden />
            Готовим оплату
          </>
        ) : (
          <>Получить {plan.name} за {formatPrice(plan.price)} ₽</>
        )}
      </button>

      {error ? (
        <p
          className="mt-3 text-center font-body text-sm"
          style={{ color: 'var(--accent-coral)' }}
        >
          {error}
        </p>
      ) : null}

      <div
        className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        <span className="inline-flex items-center gap-1.5">
          <Shield size={16} aria-hidden /> Оплата через ЮKassa
        </span>
        <span className="inline-flex items-center gap-1.5">
          <RotateCcw size={16} aria-hidden /> Возврат за 3 дня
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={16} aria-hidden /> 67 420 типирований выполнено
        </span>
      </div>
    </section>
  )
}

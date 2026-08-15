'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Brain,
  CheckSquare,
  Eye,
  Heart,
  Lightbulb,
  Moon,
  Shuffle,
  Sun,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import QuadrantGrid from '@/components/QuadrantGrid'
import {
  STORAGE_KEY,
  typeFromAnswers,
  type Answer,
  type Answers,
} from '@/lib/socionics'

type Option = { icon: LucideIcon; text: string }

type Question = {
  title: string
  a: Option
  b: Option
}

const QUESTIONS: Question[] = [
  {
    title: 'Как ты восстанавливаешь энергию?',
    a: { icon: Sun, text: 'В компании людей — общение заряжает меня' },
    b: { icon: Moon, text: 'В тишине и одиночестве — мне нужно побыть с собой' },
  },
  {
    title: 'Как ты принимаешь решения?',
    a: { icon: Brain, text: 'Через логику и факты — эмоции мешают думать' },
    b: {
      icon: Heart,
      text: 'Через ценности и чувства — важно как это отразится на людях',
    },
  },
  {
    title: 'Как ты воспринимаешь информацию?',
    a: { icon: Eye, text: 'Через детали и факты — вижу конкретику' },
    b: { icon: Lightbulb, text: 'Через образы и идеи — вижу суть и перспективу' },
  },
  {
    title: 'Как ты относишься к планам?',
    a: { icon: CheckSquare, text: 'Люблю порядок и чёткий план — хаос раздражает' },
    b: { icon: Shuffle, text: 'Предпочитаю гибкость — люблю действовать по ситуации' },
  },
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const slide = {
  initial: { opacity: 0, x: 48 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -48 },
}

export default function Quiz() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [selected, setSelected] = useState<Answer | null>(null)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [litQuadrant, setLitQuadrant] = useState(0)
  const [revealed, setRevealed] = useState<string | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach(clearTimeout)
    }
  }, [])

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay)
    timers.current.push(id)
  }, [])

  const choose = useCallback(
    (answer: Answer) => {
      if (selected) return
      setSelected(answer)

      // Небольшая пауза, чтобы пользователь увидел подсветку своего выбора,
      // прежде чем карточка уедет влево.
      schedule(() => {
        setAnswers((prev) => [...prev, answer])
        setSelected(null)
        setStep((prev) => prev + 1)
      }, 400)
    },
    [schedule, selected],
  )

  // Экран загрузки: квадранты загораются по очереди, затем вспыхивает код типа.
  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setLitQuadrant((prev) => (prev + 1) % 4)
    }, 260)
    return () => clearInterval(interval)
  }, [loading])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = email.trim()

    if (!EMAIL_PATTERN.test(trimmed)) {
      setError('Проверь адрес — кажется, в нём опечатка')
      return
    }

    if (answers.length !== 4) {
      setError('Ответь на все четыре вопроса')
      return
    }

    setError('')
    const typed = answers as Answers
    const type = typeFromAnswers(typed)

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ answers: typed, type, email: trimmed }),
      )
      if (!window.localStorage.getItem('socionics_timer_start')) {
        window.localStorage.setItem('socionics_timer_start', String(Date.now()))
      }
    } catch {
      // Приватный режим блокирует localStorage — результат всё равно покажем.
    }

    setLoading(true)
    schedule(() => setRevealed(type), 1200)
    schedule(() => router.push('/result'), 2000)
  }

  const total = QUESTIONS.length
  const answered = answers.length
  const progress = loading ? 100 : Math.round((answered / total) * 100)

  if (loading) {
    return (
      <div
        className="rounded-3xl border bg-white p-6 sm:p-10"
        style={{
          borderColor: 'var(--border)',
          borderTop: '3px solid var(--accent-teal)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <p
          className="text-center text-sm font-semibold uppercase tracking-[0.16em]"
          style={{ color: 'var(--accent-teal)' }}
        >
          Определяем твой тип
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <QuadrantGrid active={litQuadrant} revealedCode={revealed} compact />
        </div>
        <p
          className="mt-6 text-center text-[15px]"
          style={{ color: 'var(--text-secondary)' }}
        >
          Сверяем твои ответы с четырьмя дихотомиями Юнга
        </p>
      </div>
    )
  }

  return (
    <div
      id="quiz"
      className="overflow-hidden rounded-3xl border bg-white"
      style={{
        borderColor: 'var(--border)',
        borderTop: '3px solid var(--accent-teal)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <motion.div
          className="h-full"
          style={{ backgroundColor: 'var(--accent-teal)' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>

      <div className="p-5 sm:p-8">
        <AnimatePresence mode="wait">
          {step < total ? (
            <motion.div
              key={`q-${step}`}
              variants={slide}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: 'var(--accent-teal)' }}
              >
                Вопрос {step + 1} из {total}
              </p>
              <h2
                className="mt-3 text-[22px] font-bold leading-snug sm:text-[26px]"
                style={{ color: 'var(--text-primary)' }}
              >
                {QUESTIONS[step].title}
              </h2>

              <div className="mt-6 flex flex-col gap-3">
                {(['A', 'B'] as const).map((key) => {
                  const option = key === 'A' ? QUESTIONS[step].a : QUESTIONS[step].b
                  const Icon = option.icon
                  const isPicked = selected === key

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => choose(key)}
                      className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors duration-200 sm:px-5"
                      style={{
                        borderColor: isPicked
                          ? 'var(--accent-teal)'
                          : 'var(--border)',
                        backgroundColor: isPicked
                          ? 'var(--accent-teal)'
                          : 'var(--bg-card)',
                        color: isPicked ? '#ffffff' : 'var(--text-primary)',
                      }}
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: isPicked
                            ? 'rgba(255,255,255,0.18)'
                            : 'var(--accent-teal-light)',
                          color: isPicked ? '#ffffff' : 'var(--accent-teal)',
                        }}
                      >
                        <Icon size={20} aria-hidden />
                      </span>
                      <span className="font-body text-[15px] leading-snug sm:text-base">
                        {option.text}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="email"
              variants={slide}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
              onSubmit={submit}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: 'var(--accent-teal)' }}
              >
                Готово — 4 из 4
              </p>
              <h2
                className="mt-3 text-[22px] font-bold leading-snug sm:text-[26px]"
                style={{ color: 'var(--text-primary)' }}
              >
                Куда прислать полный разбор твоего типа?
              </h2>

              <label htmlFor="email" className="sr-only">
                Электронная почта
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (error) setError('')
                }}
                placeholder="твой@email.ru"
                className="mt-6 min-h-[56px] w-full rounded-2xl border px-4 font-body text-base outline-none"
                style={{
                  borderColor: error ? 'var(--accent-coral)' : 'var(--border)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              />

              {error ? (
                <p
                  className="mt-2 font-body text-sm"
                  style={{ color: 'var(--accent-coral)' }}
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                className="mt-4 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-white transition-transform duration-150 active:scale-[0.99]"
                style={{
                  backgroundColor: 'var(--accent-teal)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                Узнать свой тип
                <ArrowRight size={18} aria-hidden />
              </button>

              <p
                className="mt-3 text-center font-body text-[13px]"
                style={{ color: 'var(--text-muted)' }}
              >
                Результат покажем сразу на следующем экране
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

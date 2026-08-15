import { Brain, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import QuadrantGrid from '@/components/QuadrantGrid'
import Quiz from '@/components/Quiz'
import { FAQ } from '@/lib/seo'

const TRUST = [
  { icon: Users, text: '67 420 типирований пройдено' },
  { icon: Brain, text: 'Основано на теории Юнга' },
  { icon: Clock, text: 'Результат за 60 секунд' },
]

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div>
          <p
            className="text-lg font-extrabold tracking-[0.14em]"
            style={{ color: 'var(--accent-teal)' }}
          >
            СОЦИОНИКА
          </p>
          <p
            className="font-body text-[13px]"
            style={{ color: 'var(--text-muted)' }}
          >
            Типирование личности
          </p>
        </div>
        <Link
          href="#quiz"
          className="hidden min-h-[44px] items-center rounded-xl px-5 text-sm font-bold text-white sm:inline-flex"
          style={{ backgroundColor: 'var(--accent-teal)' }}
        >
          Пройти тест
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-12 pt-4 sm:px-8 sm:pt-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <h1
              className="text-[34px] font-extrabold leading-[1.08] tracking-[-0.02em] sm:text-[46px] lg:text-[58px]"
              style={{ color: 'var(--text-primary)' }}
            >
              Узнай свой психотип —
              <br />
              и наконец пойми
              <br />
              себя и других
            </h1>

            <p
              className="mt-5 max-w-xl font-body text-[17px] leading-relaxed sm:text-[18px]"
              style={{ color: 'var(--text-secondary)' }}
            >
              4 вопроса — и ты узнаешь свой соционический тип, как с тобой
              общаться и почему ты такой
            </p>

            <ul className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {TRUST.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="inline-flex items-center gap-2 font-body text-[15px]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Icon
                    size={16}
                    style={{ color: 'var(--accent-teal)' }}
                    aria-hidden
                  />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <QuadrantGrid />
            <p
              className="mt-4 text-center font-body text-[13px]"
              style={{ color: 'var(--text-muted)' }}
            >
              Четыре дихотомии, на которых строятся все 16 типов
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-5 pb-16 sm:px-8">
        <Quiz />
      </section>

      <section
        className="px-5 py-14 sm:px-8"
        style={{ backgroundColor: 'var(--bg-dark)' }}
      >
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-white sm:text-[32px]">
            Частые вопросы
          </h2>
          <div className="mt-8 flex flex-col gap-6">
            {FAQ.map((item) => (
              <div key={item.question}>
                <h3 className="text-[17px] font-semibold text-white">
                  {item.question}
                </h3>
                <p
                  className="mt-2 font-body text-[15px] leading-relaxed"
                  style={{ color: '#A9B4C6' }}
                >
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer
        className="px-5 py-10 sm:px-8"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="font-body text-[13px]"
            style={{ color: 'var(--text-muted)' }}
          >
            Евдокимов Даниил Владимирович, ИНН 381928138362. Самозанятый.
          </p>
          <nav className="flex gap-5 text-sm">
            <Link href="/privacy" style={{ color: 'var(--accent-teal)' }}>
              Политика конфиденциальности
            </Link>
            <Link href="/offer" style={{ color: 'var(--accent-teal)' }}>
              Оферта
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  )
}

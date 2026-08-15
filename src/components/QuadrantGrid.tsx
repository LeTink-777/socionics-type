'use client'

import { motion } from 'framer-motion'
import { Compass, Layers, Scale, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'

type Quadrant = {
  id: string
  icon: LucideIcon
  left: string
  right: string
  label: string
}

const QUADRANTS: Quadrant[] = [
  {
    id: 'attitude',
    icon: Compass,
    left: 'Экстраверт',
    right: 'Интроверт',
    label: 'Вертность',
  },
  {
    id: 'perceiving',
    icon: Sparkles,
    left: 'Интуит',
    right: 'Сенсорик',
    label: 'Восприятие',
  },
  {
    id: 'judging',
    icon: Scale,
    left: 'Логик',
    right: 'Этик',
    label: 'Решения',
  },
  {
    id: 'lifestyle',
    icon: Layers,
    left: 'Рационал',
    right: 'Иррационал',
    label: 'Ритм жизни',
  },
]

type Props = {
  /** Индекс подсвеченного квадранта: -1 — ничего не подсвечено. */
  active?: number
  /** Код типа, который «загорается» в центре после прохождения теста. */
  revealedCode?: string | null
  compact?: boolean
}

/**
 * Сигнатурный элемент: сетка 2×2 из четырёх дихотомий соционики.
 * На главной квадранты мягко пульсируют при наведении, на экране загрузки —
 * подсвечиваются по очереди, пока считается тип.
 */
export default function QuadrantGrid({
  active = -1,
  revealedCode = null,
  compact = false,
}: Props) {
  const [hovered, setHovered] = useState(-1)

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {QUADRANTS.map((quadrant, index) => {
          const Icon = quadrant.icon
          const isLit = hovered === index || active === index

          return (
            <motion.div
              key={quadrant.id}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(-1)}
              animate={{
                scale: isLit ? 1.03 : 1,
                borderColor: isLit ? 'var(--accent-teal)' : 'var(--border)',
                backgroundColor: isLit
                  ? 'var(--accent-teal-light)'
                  : 'var(--bg-card)',
              }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`rounded-2xl border bg-white ${
                compact ? 'p-3' : 'p-4 sm:p-5'
              }`}
              style={{ boxShadow: 'var(--shadow)' }}
            >
              <div className="flex items-center gap-2">
                <Icon
                  size={compact ? 16 : 18}
                  className="shrink-0"
                  style={{ color: 'var(--accent-teal)' }}
                  aria-hidden
                />
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {quadrant.label}
                </span>
              </div>

              <p
                className={`mt-3 font-semibold leading-snug ${
                  compact ? 'text-sm' : 'text-[15px] sm:text-base'
                }`}
                style={{ color: 'var(--text-primary)' }}
              >
                {quadrant.left}
              </p>
              <p
                className={`mt-0.5 leading-snug ${compact ? 'text-sm' : 'text-[15px] sm:text-base'}`}
                style={{ color: 'var(--text-muted)' }}
              >
                {quadrant.right}
              </p>
            </motion.div>
          )
        })}
      </div>

      {revealedCode ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span
            className="rounded-2xl px-5 py-3 font-mono text-3xl font-bold text-white sm:text-4xl"
            style={{
              backgroundColor: 'var(--accent-teal)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {revealedCode}
          </span>
        </motion.div>
      ) : null}
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { AXES, axisPositions, type Answers } from '@/lib/socionics'

type Props = { answers: Answers }

/**
 * Положение пользователя на каждой из четырёх осей.
 * На узких экранах блок прокручивается горизонтально, чтобы подписи полюсов
 * не переносились и шкала оставалась читаемой.
 */
export default function AxisChart({ answers }: Props) {
  const positions = axisPositions(answers)

  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <div className="flex min-w-[320px] flex-col gap-5">
        {AXES.map((axis, index) => {
          const position = positions[index]
          const leaningLeft = position < 50

          return (
            <div key={axis.id}>
              <div className="flex items-center justify-between gap-4">
                <span
                  className="text-[13px] font-semibold"
                  style={{
                    color: leaningLeft
                      ? 'var(--accent-teal)'
                      : 'var(--text-muted)',
                  }}
                >
                  {axis.left}
                </span>
                <span
                  className="font-body text-[12px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {axis.question}
                </span>
                <span
                  className="text-[13px] font-semibold"
                  style={{
                    color: leaningLeft
                      ? 'var(--text-muted)'
                      : 'var(--accent-teal)',
                  }}
                >
                  {axis.right}
                </span>
              </div>

              <div
                className="relative mt-2 h-1.5 w-full rounded-full"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <motion.span
                  className="absolute top-1/2 h-4 w-4 rounded-full border-[3px] border-white"
                  style={{
                    backgroundColor: 'var(--accent-teal)',
                    boxShadow: 'var(--shadow)',
                  }}
                  initial={{ left: '50%', y: '-50%' }}
                  animate={{ left: `${position}%`, y: '-50%' }}
                  transition={{
                    duration: 0.7,
                    ease: 'easeOut',
                    delay: 0.1 * index,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

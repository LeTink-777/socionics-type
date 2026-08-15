import { TYPES, getType } from '@/lib/socionics'
import { isPlanId, type PlanId } from '@/lib/pricing'
import type { PdfSection } from '@/lib/pdf-generator'

/**
 * Собирает разделы отчёта для PDF в письме, PDF по кнопке и открытого
 * результата на /thank-you — чтобы все три источника совпадали.
 *
 * Всё содержание берётся из описания типа в src/lib/socionics.ts, то есть из
 * того же справочника, который использует бесплатная страница результата.
 */

export type SocionicsInput = {
  type: string
}

/**
 * Базовый тариф открывает портрет и сильные стороны, полный и премиум —
 * общение, отношения, карьеру, слабое место и совместимость.
 */
function sectionCountForPlan(plan: PlanId): number {
  return plan === 'basic' ? 3 : 8
}

export function generateResultSections(
  input: SocionicsInput,
  plan: string | null | undefined,
): PdfSection[] {
  const type = getType(input.type)
  if (!type) return []

  const resolvedPlan: PlanId = isPlanId(plan) ? plan : 'full'

  const [dual, activator] = type.compatible
  const compatibleNames = [dual, activator]
    .map((code) => {
      const other = TYPES[code]
      return other ? `${code} (${other.name})` : code
    })
    .join(' и ')

  const all: PdfSection[] = [
    {
      title: `Ваш тип — ${type.code}. ${type.name}`,
      content: `${type.role}. ${type.tagline}\n\n${type.description}`,
    },
    {
      title: 'Сильные стороны',
      content: type.strengths.map((item, index) => `${index + 1}. ${item}`).join('\n'),
    },
    {
      title: 'Квадра',
      content: `Ваша квадра — ${type.quadra}. Это группа типов, с которыми у вас совпадают ценности и способ смотреть на мир, поэтому в такой компании вы устаёте заметно меньше.`,
    },
    {
      title: 'Как вы общаетесь',
      content: type.communication,
    },
    {
      title: 'Отношения',
      content: type.relationship,
    },
    {
      title: 'Карьера и работа',
      content: type.career,
    },
    {
      title: 'Слабое место',
      content: type.weakness,
    },
    {
      title: 'С кем вам легче всего',
      content: `Наиболее комфортные для вас типы — ${compatibleNames}. Первый закрывает то, что вам даётся тяжелее всего, второй заряжает и держит темп.`,
    },
  ]

  return all.slice(0, sectionCountForPlan(resolvedPlan))
}

/** Читает тип из metadata ЮKassa — там всё приходит строками. */
export function inputFromMetadata(
  metadata: Record<string, string>,
): SocionicsInput | null {
  const type = metadata.type
  if (!type || !(type in TYPES)) return null
  return { type }
}

/** Строка под заголовком отчёта: код и название типа. */
export function buildSubtitle(input: SocionicsInput): string {
  const type = getType(input.type)
  return type ? `${type.code} · ${type.name}` : input.type
}

export type PlanId = 'basic' | 'full' | 'expert'

export type Plan = {
  id: PlanId
  name: string
  price: number
  oldPrice: number
  includes: string[]
  format: string
  delivery: string
  badge: string
  badgeTone: 'teal' | 'gold' | 'coral'
  description: string
}

export const PLANS: Record<PlanId, Plan> = {
  basic: {
    id: 'basic',
    name: 'Базовый',
    price: 290,
    oldPrice: 890,
    includes: ['Полное описание твоего типа', 'Как с тобой общаться'],
    format: 'PDF, 6 страниц',
    delivery: '24 часа',
    badge: 'Осталось 12 мест',
    badgeTone: 'teal',
    description: 'Базовый соционический портрет',
  },
  full: {
    id: 'full',
    name: 'Полный',
    price: 590,
    oldPrice: 2490,
    includes: [
      'Всё из Базового',
      'Ты в отношениях',
      'Карьера и предназначение',
      'Совместимость с типами',
    ],
    format: 'PDF, 18 страниц',
    delivery: '12 часов',
    badge: 'ВЫБОР 76%',
    badgeTone: 'gold',
    description: 'Полный соционический портрет',
  },
  expert: {
    id: 'expert',
    name: 'Эксперт',
    price: 1290,
    oldPrice: 4900,
    includes: [
      'Всё из Полного',
      'Аудио разбор 15 минут',
      'Разбор твоей пары',
    ],
    format: 'PDF + аудио',
    delivery: '6 часов',
    badge: 'Осталось мест',
    badgeTone: 'coral',
    description: 'Соционический портрет Эксперт',
  },
}

export const PLAN_ORDER: PlanId[] = ['basic', 'full', 'expert']

export function isPlanId(value: unknown): value is PlanId {
  return value === 'basic' || value === 'full' || value === 'expert'
}

export function formatPrice(value: number): string {
  return value.toLocaleString('ru-RU')
}

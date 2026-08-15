'use client'

import { useSyncExternalStore } from 'react'
import { STORAGE_KEY, isStoredData, type StoredData } from '@/lib/socionics'

/**
 * localStorage — внешнее хранилище по отношению к React, поэтому читаем его
 * через useSyncExternalStore, а не через setState в эффекте: так не возникает
 * лишнего каскада рендеров и корректно отрабатывает гидратация.
 */

const noopSubscribe = () => () => {}

/* --- Признак того, что клиент уже гидратирован --- */

function hydratedSnapshot(): boolean {
  return true
}

function hydratedServerSnapshot(): boolean {
  return false
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    hydratedSnapshot,
    hydratedServerSnapshot,
  )
}

/* --- Результат теста --- */

// getSnapshot обязан возвращать стабильную ссылку, иначе React уйдёт в цикл,
// поэтому разобранный объект кешируется по исходной строке.
let cachedRaw: string | null = null
let cachedData: StoredData | null = null

function storedSnapshot(): StoredData | null {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    // Приватный режим может запрещать доступ к localStorage.
    return null
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw
    if (!raw) {
      cachedData = null
    } else {
      try {
        const parsed: unknown = JSON.parse(raw)
        cachedData = isStoredData(parsed) ? parsed : null
      } catch {
        cachedData = null
      }
    }
  }

  return cachedData
}

function storedServerSnapshot(): StoredData | null {
  return null
}

export function useStoredData(): StoredData | null {
  return useSyncExternalStore(
    noopSubscribe,
    storedSnapshot,
    storedServerSnapshot,
  )
}

/* --- Оформленный заказ --- */

const PENDING_ORDER_KEY = 'socionics_pending_order'

export type PendingOrder = {
  plan: string
  /** Нужен /api/generate-pdf, чтобы подтвердить оплату перед выдачей PDF. */
  paymentId: string | null
}

/** Переживает переход на страницу оплаты ЮKassa и обратно. */
export function savePendingOrder(order: PendingOrder): void {
  try {
    window.localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(order))
  } catch {
    // Разбор всё равно уходит письмом, даже если браузер ничего не сохранил.
  }
}

export function readPendingOrder(): PendingOrder | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(PENDING_ORDER_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<PendingOrder>
    if (typeof parsed?.plan !== 'string') return null

    return {
      plan: parsed.plan,
      paymentId: typeof parsed.paymentId === 'string' ? parsed.paymentId : null,
    }
  } catch {
    return null
  }
}

/* --- Счётчик оставшихся мест на тарифе Эксперт --- */

const SPOTS_KEY = 'socionics_spots'
const DEFAULT_SPOTS = 3

const spotsListeners = new Set<() => void>()
let spotsSnapshot = DEFAULT_SPOTS
let spotClaimed = false

function subscribeSpots(listener: () => void) {
  spotsListeners.add(listener)
  return () => {
    spotsListeners.delete(listener)
  }
}

function getSpots(): number {
  return spotsSnapshot
}

function getServerSpots(): number {
  return DEFAULT_SPOTS
}

/**
 * Списывает одно место за визит и опускается не ниже двух.
 * Вызывается из эффекта — это обновление внешнего хранилища, а не состояния.
 */
export function claimSpot(): void {
  if (spotClaimed) return
  spotClaimed = true

  let current = 4
  try {
    const stored = Number(window.localStorage.getItem(SPOTS_KEY))
    if (stored >= 2 && stored <= 4) current = stored
  } catch {
    // Хранилище недоступно — работаем со значением по умолчанию.
  }

  const next = current > 2 ? current - 1 : 2
  spotsSnapshot = next

  try {
    window.localStorage.setItem(SPOTS_KEY, String(next))
  } catch {
    // Значение всё равно показываем, просто не переживёт перезагрузку.
  }

  spotsListeners.forEach((listener) => listener())
}

export function useSpots(): number {
  return useSyncExternalStore(subscribeSpots, getSpots, getServerSpots)
}

/* --- Момент старта таймера скидки --- */

const TIMER_KEY = 'socionics_timer_start'
const WINDOW_MS = 24 * 60 * 60 * 1000

export { WINDOW_MS }

/** Возвращает начало 24-часового окна, при необходимости запуская новое. */
export function timerStart(): number {
  try {
    const stored = Number(window.localStorage.getItem(TIMER_KEY))
    if (stored && !Number.isNaN(stored) && Date.now() - stored < WINDOW_MS) {
      return stored
    }
    const now = Date.now()
    window.localStorage.setItem(TIMER_KEY, String(now))
    return now
  } catch {
    return Date.now()
  }
}

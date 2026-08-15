import { NextResponse } from 'next/server'
import { PLANS, isPlanId } from '@/lib/pricing'
import { createPayment, isPaymentsConfigured } from '@/lib/yukassa'
import { SITE_URL } from '@/lib/seo'
import { TYPES } from '@/lib/socionics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CheckoutBody = {
  plan?: unknown
  userData?: {
    type?: unknown
    email?: unknown
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function text(value: unknown, max = 200): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

/** Куда ЮKassa возвращает покупателя после оплаты. */
function originFrom(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return configured.replace(/\/$/, '')

  const host = request.headers.get('host')
  if (host && /^[a-z0-9.-]+$/i.test(host)) {
    return `https://${host.toLowerCase()}`
  }

  return SITE_URL
}

export async function POST(request: Request) {
  if (!isPaymentsConfigured()) {
    return NextResponse.json(
      { error: 'Оплата временно недоступна. Платёжный ключ не настроен.' },
      { status: 503 },
    )
  }

  let body: CheckoutBody
  try {
    body = (await request.json()) as CheckoutBody
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 })
  }

  if (!isPlanId(body.plan)) {
    return NextResponse.json({ error: 'Неизвестный тариф' }, { status: 400 })
  }

  const plan = PLANS[body.plan]
  const type = text(body.userData?.type, 8)
  const email = text(body.userData?.email, 200)

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: 'Проверь адрес электронной почты.' },
      { status: 422 },
    )
  }

  if (!(type in TYPES)) {
    return NextResponse.json(
      { error: 'Не нашли твой тип. Пройди тест заново.' },
      { status: 422 },
    )
  }

  const orderId = `SOC-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`

  // Сумма берётся из серверной таблицы тарифов, а не из запроса — иначе цену
  // мог бы выбрать сам покупатель.
  const amount = plan.price
  const typeName = TYPES[type].name
  const returnUrl = `${originFrom(request)}/thank-you?plan=${plan.id}&order=${orderId}`

  try {
    const payment = await createPayment(
      amount,
      orderId,
      `${plan.description}: ${type} ${typeName}`,
      returnUrl,
      { plan: plan.id, type, email },
    )

    console.log('[checkout] payment created', {
      orderId,
      paymentId: payment.id,
      plan: plan.id,
      amount,
      type,
    })

    return NextResponse.json({
      orderId,
      paymentId: payment.id,
      confirmationUrl: payment.confirmationUrl,
    })
  } catch (error) {
    console.error('[checkout] payment creation failed', {
      orderId,
      plan: plan.id,
      message: error instanceof Error ? error.message : 'unknown',
    })

    return NextResponse.json(
      { error: 'Не удалось создать платёж. Попробуй ещё раз.' },
      { status: 502 },
    )
  }
}

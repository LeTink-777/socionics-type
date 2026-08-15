import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Вебхук ЮKassa: уведомления о смене статуса платежа.
 *
 * Docs: https://yookassa.ru/developers/using-api/webhooks
 * Отвечаем 200 на любое корректное уведомление — иначе ЮKassa будет слать
 * повторы. Ошибки обработки логируем, но не превращаем в 500.
 */

type Notification = {
  type?: string
  event?: string
  object?: {
    id?: string
    status?: string
    paid?: boolean
    amount?: { value?: string; currency?: string }
    description?: string
    metadata?: Record<string, string>
  }
}

export async function POST(request: Request) {
  let notification: Notification

  try {
    notification = (await request.json()) as Notification
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 })
  }

  const payment = notification.object
  const event = notification.event

  if (!event || !payment?.id) {
    return NextResponse.json({ error: 'Некорректное уведомление' }, { status: 400 })
  }

  switch (event) {
    case 'payment.succeeded': {
      // Здесь будет постановка заказа в очередь на подготовку разбора,
      // как только появится база и почтовая рассылка.
      console.log('[webhook] payment succeeded', {
        paymentId: payment.id,
        orderId: payment.metadata?.orderId,
        plan: payment.metadata?.plan,
        type: payment.metadata?.type,
        email: payment.metadata?.email,
        amount: payment.amount?.value,
      })
      break
    }
    case 'payment.canceled': {
      console.log('[webhook] payment canceled', {
        paymentId: payment.id,
        orderId: payment.metadata?.orderId,
      })
      break
    }
    case 'refund.succeeded': {
      console.log('[webhook] refund succeeded', {
        paymentId: payment.id,
        orderId: payment.metadata?.orderId,
      })
      break
    }
    default: {
      console.log('[webhook] unhandled event', { event, paymentId: payment.id })
    }
  }

  return NextResponse.json({ received: true })
}

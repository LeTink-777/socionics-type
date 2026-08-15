import { NextResponse } from 'next/server'
import { generatePDF } from '@/lib/pdf-generator'
import { sendResultEmail } from '@/lib/email'
import {
  buildSubtitle,
  generateResultSections,
  inputFromMetadata,
} from '@/lib/result-sections'
import { clientIp, isYookassaAddress } from '@/lib/webhook-guard'
import { SITE_NAME } from '@/lib/site-name'

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
  const ip = clientIp(request)

  if (!isYookassaAddress(ip)) {
    console.warn('[webhook] уведомление с неизвестного адреса отклонено', { ip })
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

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
      console.log('[webhook] payment succeeded', {
        paymentId: payment.id,
        orderId: payment.metadata?.orderId,
        plan: payment.metadata?.plan,
        type: payment.metadata?.type,
        email: payment.metadata?.email,
        amount: payment.amount?.value,
      })

      await deliverReport(payment.metadata ?? {}, payment.id)
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

/**
 * Защита от повторной отправки одного и того же разбора.
 *
 * ЮKassa повторяет уведомление, пока не получит 200, поэтому доставка,
 * завершившаяся после медленного ответа, ушла бы покупателю дважды. Множество
 * живёт в памяти инстанса и покрывает только повторы, попавшие на тот же
 * прогретый процесс — надёжное решение это запись заказа в базе, которой у
 * проекта пока нет.
 */
const delivered = new Set<string>()

async function deliverReport(
  metadata: Record<string, string>,
  paymentId: string,
): Promise<void> {
  if (delivered.has(paymentId)) {
    console.log('[webhook] разбор уже отправлен, пропускаем', { paymentId })
    return
  }

  const email = metadata.email
  const input = inputFromMetadata(metadata)

  if (!email || !input) {
    console.error('[webhook] недостаточно данных для отправки разбора', {
      paymentId,
      hasEmail: Boolean(email),
      hasType: Boolean(input),
    })
    return
  }

  const subtitle = buildSubtitle(input)

  try {
    const sections = generateResultSections(input, metadata.plan)

    const pdfBuffer = await generatePDF({
      title: 'Ваш тип личности',
      userName: subtitle,
      sections,
      siteName: SITE_NAME,
    })

    await sendResultEmail({
      to: email,
      subject: `Ваш разбор типа ${input.type} готов`,
      userName: subtitle,
      resultHtml: sections
        .map(
          (section) =>
            `<h3 style="color:#0F7B7B;font-size:17px;margin:24px 0 8px;">${section.title}</h3>` +
            `<p style="font-size:15px;line-height:1.6;margin:0;white-space:pre-line;">${section.content}</p>`,
        )
        .join(''),
      pdfBuffer,
      fileName: 'tip-lichnosti.pdf',
      siteName: SITE_NAME,
    })

    delivered.add(paymentId)

    console.log('[webhook] разбор отправлен', { paymentId, to: email })
  } catch (error) {
    // Ошибку намеренно не пробрасываем: ответ всё равно 200. Ответ не-200
    // заставит ЮKassa повторять уведомление часами, а сбой здесь относится к
    // доставке, а не к платежу — деньги уже приняты в любом случае.
    console.error('[webhook] не удалось отправить разбор', {
      paymentId,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

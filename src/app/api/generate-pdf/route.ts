import { NextResponse } from 'next/server'
import { generatePDF } from '@/lib/pdf-generator'
import {
  buildSubtitle,
  generateResultSections,
  inputFromMetadata,
} from '@/lib/result-sections'
import { getPayment } from '@/lib/yukassa'
import { SITE_NAME } from '@/lib/site-name'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Формирует платный PDF для кнопки скачивания на /thank-you.
 *
 * Разбор и есть товар, поэтому запрос обязан подтвердить, что относится к
 * состоявшейся оплате: браузер присылает идентификатор платежа, полученный от
 * /api/checkout, а тип читается из metadata этого платежа, а не из тела
 * запроса. Без проверки эндпоинт отдавал бы платный разбор любому, кто
 * пришлёт код типа, а доверие к телу запроса позволило бы покупателю базового
 * тарифа получить полную версию.
 */
export async function POST(request: Request) {
  let body: { paymentId?: unknown }

  try {
    body = (await request.json()) as { paymentId?: unknown }
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос.' }, { status: 400 })
  }

  const paymentId = typeof body.paymentId === 'string' ? body.paymentId.trim() : ''

  if (!paymentId) {
    return NextResponse.json(
      { error: 'Не указан платёж. Открой страницу заказа заново.' },
      { status: 400 },
    )
  }

  let payment
  try {
    payment = await getPayment(paymentId)
  } catch (error) {
    console.error('[generate-pdf] не удалось проверить платёж', {
      paymentId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: 'Не удалось проверить оплату.' }, { status: 502 })
  }

  if (!payment || payment.status !== 'succeeded') {
    return NextResponse.json(
      { error: 'Оплата по этому заказу не найдена.' },
      { status: 403 },
    )
  }

  const input = inputFromMetadata(payment.metadata)

  if (!input) {
    return NextResponse.json({ error: 'В заказе нет типа личности.' }, { status: 422 })
  }

  const pdfBuffer = await generatePDF({
    title: 'Ваш тип личности',
    userName: buildSubtitle(input),
    sections: generateResultSections(input, payment.metadata.plan),
    siteName: SITE_NAME,
  })

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="tip-lichnosti.pdf"',
      'Content-Length': String(pdfBuffer.length),
      'Cache-Control': 'no-store',
    },
  })
}

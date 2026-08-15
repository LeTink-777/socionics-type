import 'server-only'
import { randomUUID } from 'node:crypto'

/**
 * Клиент ЮKassa поверх официального REST API (api.yookassa.ru/v3).
 *
 * Секретный ключ читается только на сервере и никогда не попадает в бандл.
 * Docs: https://yookassa.ru/developers/api#create_payment
 */

const API_URL = 'https://api.yookassa.ru/v3/payments'

export const SHOP_ID =
  process.env.NEXT_PUBLIC_YUKASSA_SHOP_ID || process.env.YUKASSA_SHOP_ID || ''

export function isPaymentsConfigured(): boolean {
  return Boolean(SHOP_ID && process.env.YUKASSA_SECRET_KEY)
}

export type CreatePaymentResult = {
  id: string
  status: string
  confirmationUrl: string
}

/**
 * Создаёт платёж и возвращает ссылку на страницу оплаты.
 *
 * Тело запроса намеренно не содержит payment_method_data: без него ЮKassa
 * показывает все подключённые магазину способы оплаты — карта, SberPay, СБП,
 * T-Pay, ЮMoney. Idempotence-Key защищает от двойного списания при ретрае.
 */
export async function createPayment(
  amount: number,
  orderId: string,
  description: string,
  returnUrl: string,
  metadata: Record<string, string> = {},
): Promise<CreatePaymentResult> {
  const secretKey = process.env.YUKASSA_SECRET_KEY

  if (!SHOP_ID || !secretKey) {
    throw new Error(
      'ЮKassa не настроена: задайте NEXT_PUBLIC_YUKASSA_SHOP_ID и YUKASSA_SECRET_KEY',
    )
  }

  const auth = Buffer.from(`${SHOP_ID}:${secretKey}`).toString('base64')

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Idempotence-Key': randomUUID(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: { value: amount.toFixed(2), currency: 'RUB' },
      capture: true,
      confirmation: { type: 'redirect', return_url: returnUrl },
      // ЮKassa обрезает описание на 128 символах.
      description: description.slice(0, 128),
      metadata: { orderId, ...metadata },
    }),
    cache: 'no-store',
  })

  const result = (await response.json()) as {
    id?: string
    status?: string
    confirmation?: { confirmation_url?: string }
    description?: string
    code?: string
  }

  if (!response.ok || !result.id || !result.confirmation?.confirmation_url) {
    // В лог уходят только код и статус — в ответе нет секретов, но и лишнего не пишем.
    console.error('[yukassa] createPayment failed', {
      httpStatus: response.status,
      code: result.code,
      description: result.description,
    })
    throw new Error('Платёжная система отклонила запрос')
  }

  return {
    id: result.id,
    status: result.status ?? 'pending',
    confirmationUrl: result.confirmation.confirmation_url,
  }
}

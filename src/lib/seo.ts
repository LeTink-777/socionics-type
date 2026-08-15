export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://socionics-type.vercel.app'

export const SITE_NAME = 'Соционика'

export const SEO_TITLE = 'Соционика — Узнай свой психотип за 60 секунд'

export const SEO_DESCRIPTION =
  'Бесплатное соционическое типирование онлайн. 4 вопроса — и ты узнаешь свой психотип, как с тобой общаться и кто твой идеальный партнёр.'

export const SEO_KEYWORDS = [
  'соционика',
  'соционика типы',
  'соционический тип',
  'типирование соционика',
  'соционика онлайн',
  'соционика тест',
  'соционика психотип',
  'соционика бесплатно',
  'соционика типы личности',
  'MBTI соционика',
  'интроверт экстраверт тест',
  'психотип личности',
  'соционика совместимость',
  'соционика отношения',
  'соционика карьера',
  'дон кихот соционика',
  'штирлиц соционика',
  'робеспьер соционика',
  'гюго соционика',
  'есенин соционика',
]

export const FAQ: readonly { question: string; answer: string }[] = [
  {
    question: 'Что такое соционика?',
    answer:
      'Соционика — система типологии личности, основанная на теории Юнга. Выделяет 16 типов по 4 дихотомиям: экстраверсия/интроверсия, логика/этика, сенсорика/интуиция, рациональность/иррациональность.',
  },
  {
    question: 'Чем соционика отличается от MBTI?',
    answer:
      'Соционика и MBTI основаны на одной теории Юнга, но соционика разработана советскими учёными и имеет свою систему названий и межтиповых отношений. Соционика делает акцент на взаимодействии типов.',
  },
  {
    question: 'Насколько точен онлайн-тест?',
    answer:
      'Краткий тест даёт ориентировочный результат. Для точного типирования важно читать полное описание типа и узнавать себя в нём. Наш разбор включает детальное описание для самопроверки.',
  },
  {
    question: 'Что такое дуал в соционике?',
    answer:
      'Дуал — идеальный партнёр в соционике, тип который дополняет тебя по всем функциям. С дуалом легко и комфортно — он интуитивно понимает твои потребности.',
  },
  {
    question: 'Как соционика помогает в отношениях?',
    answer:
      'Зная типы обоих партнёров, можно предсказать динамику отношений, понять источники конфликтов и научиться лучше понимать друг друга.',
  },
] as const

export function jsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SEO_DESCRIPTION,
        inLanguage: 'ru-RU',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#app`,
        name: 'Соционическое типирование онлайн',
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        url: SITE_URL,
        description: SEO_DESCRIPTION,
        inLanguage: 'ru-RU',
        offers: {
          '@type': 'Offer',
          price: '290',
          priceCurrency: 'RUB',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '2417',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: FAQ.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  }
}

import Anthropic from '@anthropic-ai/sdk'
import type { ProfileData, PostData } from './instagram'

export interface AnalysisReport {
  overallScore: number // 1-100
  engagementRate: number // percentage
  summary: string
  topPosts: Array<{ shortcode: string; caption: string; score: number; reason: string }>
  contentCategories: Array<{
    name: string
    postCount: number
    avgEngagement: number
    verdict: 'keep' | 'reduce' | 'increase'
  }>
  recommendations: Array<{
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
  }>
  bestPostingTimes: string[]
  contentMix: { images: number; videos: number; carousels: number }
  weakPoints: string[]
  strongPoints: string[]
}

function calculateEngagementRate(posts: PostData[], followers: number): number {
  if (followers === 0 || posts.length === 0) return 0
  const totalEngagement = posts.reduce((sum, p) => sum + p.likesCount + p.commentsCount, 0)
  return (totalEngagement / posts.length / followers) * 100
}

function calculateContentMix(posts: PostData[]): AnalysisReport['contentMix'] {
  return posts.reduce(
    (mix, p) => {
      if (p.mediaType === 'image') mix.images++
      else if (p.mediaType === 'video') mix.videos++
      else if (p.mediaType === 'carousel') mix.carousels++
      return mix
    },
    { images: 0, videos: 0, carousels: 0 },
  )
}

function getTopPosts(posts: PostData[], count: number) {
  return [...posts]
    .sort((a, b) => b.likesCount + b.commentsCount - (a.likesCount + a.commentsCount))
    .slice(0, count)
}

function getBestPostingTimes(posts: PostData[]): string[] {
  const hourBuckets: Record<number, { total: number; count: number }> = {}

  for (const post of posts) {
    const hour = new Date(post.timestamp).getHours()
    if (!hourBuckets[hour]) hourBuckets[hour] = { total: 0, count: 0 }
    hourBuckets[hour].total += post.likesCount + post.commentsCount
    hourBuckets[hour].count++
  }

  return Object.entries(hourBuckets)
    .map(([hour, data]) => ({ hour: Number(hour), avg: data.total / data.count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3)
    .map(({ hour }) => {
      const h = hour % 12 || 12
      const ampm = hour < 12 ? 'AM' : 'PM'
      return `${h}:00 ${ampm}`
    })
}

function buildFallbackReport(
  profile: ProfileData,
  posts: PostData[],
  engagementRate: number,
  contentMix: AnalysisReport['contentMix'],
  topPosts: PostData[],
  bestPostingTimes: string[],
): AnalysisReport {
  return {
    overallScore: 0,
    engagementRate: Math.round(engagementRate * 100) / 100,
    summary: 'No se pudo completar el analisis con IA. Se muestran solo las metricas calculadas.',
    topPosts: topPosts.map((p) => ({
      shortcode: p.shortcode,
      caption: p.caption.slice(0, 100),
      score: p.likesCount + p.commentsCount,
      reason: 'Mayor engagement total',
    })),
    contentCategories: [],
    recommendations: [
      {
        title: 'Analisis de IA no disponible',
        description:
          'El analisis con inteligencia artificial no pudo completarse. Intenta nuevamente mas tarde.',
        priority: 'high',
      },
    ],
    bestPostingTimes,
    contentMix,
    weakPoints: [],
    strongPoints: [],
  }
}

const SYSTEM_PROMPT = `Eres un experto en marketing digital y estrategia de contenido para Instagram.
Analizas cuentas de Instagram y generas reportes detallados de estrategia de contenido.
Siempre respondes en espanol. Eres directo, practico y orientado a resultados.

Debes responder UNICAMENTE con un objeto JSON valido (sin markdown, sin backticks, sin texto adicional) con esta estructura exacta:
{
  "overallScore": number (1-100, evaluacion general de la cuenta),
  "summary": string (resumen ejecutivo de 2-3 oraciones),
  "contentCategories": [
    {
      "name": string (nombre de la categoria: "educativo", "promocional", "personal", "entretenimiento", "inspiracional", "behind-the-scenes", etc),
      "postCount": number (cantidad de posts en esta categoria),
      "avgEngagement": number (engagement promedio de posts en esta categoria),
      "verdict": "keep" | "reduce" | "increase"
    }
  ],
  "recommendations": [
    {
      "title": string (titulo corto de la recomendacion),
      "description": string (descripcion detallada y accionable),
      "priority": "high" | "medium" | "low"
    }
  ],
  "topPostReasons": [
    {
      "shortcode": string,
      "reason": string (por que funciono bien este post)
    }
  ],
  "weakPoints": [string] (puntos debiles de la cuenta),
  "strongPoints": [string] (puntos fuertes de la cuenta)
}`

function buildUserPrompt(
  profile: ProfileData,
  posts: PostData[],
  engagementRate: number,
  contentMix: AnalysisReport['contentMix'],
): string {
  const postSummaries = posts.map((p) => ({
    shortcode: p.shortcode,
    caption: p.caption.slice(0, 200),
    likes: p.likesCount,
    comments: p.commentsCount,
    type: p.mediaType,
    date: p.timestamp,
    engagement: p.likesCount + p.commentsCount,
  }))

  return `Analiza esta cuenta de Instagram y genera un reporte de estrategia de contenido.

## Perfil
- Usuario: @${profile.username}
- Nombre: ${profile.fullName}
- Bio: ${profile.biography}
- Seguidores: ${profile.followersCount.toLocaleString()}
- Siguiendo: ${profile.followingCount.toLocaleString()}
- Total de posts: ${profile.postsCount}
- Categoria: ${profile.category ?? 'Sin categoria'}
- Verificado: ${profile.isVerified ? 'Si' : 'No'}

## Metricas calculadas
- Tasa de engagement: ${engagementRate.toFixed(2)}%
- Mix de contenido: ${contentMix.images} imagenes, ${contentMix.videos} videos, ${contentMix.carousels} carruseles

## Posts analizados (${posts.length} posts)
${JSON.stringify(postSummaries, null, 2)}

Clasifica cada post en categorias de contenido, evalua que funciona y que no, y genera recomendaciones accionables. Responde SOLO con el JSON.`
}

export async function analyzeAccount(
  profile: ProfileData,
  posts: PostData[],
  anthropicApiKey: string,
): Promise<AnalysisReport> {
  const engagementRate = calculateEngagementRate(posts, profile.followersCount)
  const contentMix = calculateContentMix(posts)
  const topPosts = getTopPosts(posts, 5)
  const bestPostingTimes = getBestPostingTimes(posts)

  let aiResult: {
    overallScore: number
    summary: string
    contentCategories: AnalysisReport['contentCategories']
    recommendations: AnalysisReport['recommendations']
    topPostReasons: Array<{ shortcode: string; reason: string }>
    weakPoints: string[]
    strongPoints: string[]
  }

  try {
    const client = new Anthropic({ apiKey: anthropicApiKey })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: buildUserPrompt(profile, posts, engagementRate, contentMix) },
      ],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    const content = textBlock?.text
    if (!content) {
      return buildFallbackReport(profile, posts, engagementRate, contentMix, topPosts, bestPostingTimes)
    }

    aiResult = JSON.parse(content)
  } catch (error) {
    console.error('Claude analysis failed:', error instanceof Error ? error.message : error)
    return buildFallbackReport(profile, posts, engagementRate, contentMix, topPosts, bestPostingTimes)
  }

  const reasonMap = new Map(
    (aiResult.topPostReasons ?? []).map((r) => [r.shortcode, r.reason]),
  )

  return {
    overallScore: aiResult.overallScore ?? 0,
    engagementRate: Math.round(engagementRate * 100) / 100,
    summary: aiResult.summary ?? '',
    topPosts: topPosts.map((p) => ({
      shortcode: p.shortcode,
      caption: p.caption.slice(0, 100),
      score: p.likesCount + p.commentsCount,
      reason: reasonMap.get(p.shortcode) ?? 'Alto engagement',
    })),
    contentCategories: aiResult.contentCategories ?? [],
    recommendations: aiResult.recommendations ?? [],
    bestPostingTimes,
    contentMix,
    weakPoints: aiResult.weakPoints ?? [],
    strongPoints: aiResult.strongPoints ?? [],
  }
}

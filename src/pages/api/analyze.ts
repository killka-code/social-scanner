import type { APIRoute } from 'astro'
import { fetchInstagramData } from '../../lib/instagram'
import { analyzeAccount } from '../../lib/analyzer'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { username } = body as { username?: string }

    if (!username?.trim()) {
      return new Response(JSON.stringify({ error: 'El username es requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const apifyToken = import.meta.env.APIFY_TOKEN
    const anthropicApiKey = import.meta.env.ANTHROPIC_API_KEY

    if (!apifyToken) {
      return new Response(JSON.stringify({ error: 'APIFY_TOKEN no configurado en el servidor.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!anthropicApiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY no configurado en el servidor.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const cleanUsername = username.replace(/^@/, '').trim()

    const result = await fetchInstagramData(cleanUsername, apifyToken)

    if ('error' in result) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { profile, posts } = result.data

    if (posts.length === 0) {
      return new Response(JSON.stringify({ error: 'Esta cuenta no tiene posts publicos para analizar.' }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const report = await analyzeAccount(profile, posts, anthropicApiKey)

    return new Response(
      JSON.stringify({
        report,
        profile: {
          username: profile.username,
          profilePicUrl: profile.profilePicUrl,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

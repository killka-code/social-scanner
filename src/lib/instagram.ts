export interface ProfileData {
  username: string
  fullName: string
  biography: string
  followersCount: number
  followingCount: number
  postsCount: number
  profilePicUrl: string
  isVerified: boolean
  isPrivate: boolean
  category: string | null
}

export interface PostData {
  id: string
  shortcode: string
  caption: string
  likesCount: number
  commentsCount: number
  mediaType: 'image' | 'video' | 'carousel'
  timestamp: string
  url: string
  thumbnailUrl: string
  videoViewCount?: number
}

export interface InstagramData {
  profile: ProfileData
  posts: PostData[]
}

function mapMediaType(type: string): PostData['mediaType'] {
  switch (type) {
    case 'Video':
      return 'video'
    case 'Sidecar':
      return 'carousel'
    case 'Image':
    default:
      return 'image'
  }
}

export async function fetchInstagramData(
  username: string,
  apifyToken: string,
): Promise<{ data: InstagramData } | { error: string }> {
  try {
    const actorId = 'apify~instagram-profile-scraper'
    const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${encodeURIComponent(apifyToken)}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: [username],
        resultsLimit: 30,
      }),
    })

    if (response.status === 401) {
      return { error: 'Token de Apify invalido. Verifica tu API token.' }
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return { error: `Apify API error: ${response.status} ${response.statusText}. ${text}` }
    }

    const items = await response.json()

    if (!Array.isArray(items) || items.length === 0) {
      return { error: 'No se encontro el perfil. Verifica el nombre de usuario.' }
    }

    const raw = items[0] as Record<string, unknown>

    if (raw.private) {
      return { error: 'Esta cuenta es privada. Solo se pueden analizar cuentas publicas.' }
    }

    const profile: ProfileData = {
      username: String(raw.username ?? username),
      fullName: String(raw.fullName ?? ''),
      biography: String(raw.biography ?? ''),
      followersCount: (raw.followersCount as number) ?? 0,
      followingCount: (raw.followsCount as number) ?? 0,
      postsCount: (raw.postsCount as number) ?? 0,
      profilePicUrl: String(raw.profilePicUrlHD ?? raw.profilePicUrl ?? ''),
      isVerified: Boolean(raw.verified),
      isPrivate: Boolean(raw.private),
      category: raw.businessCategoryName ? String(raw.businessCategoryName) : null,
    }

    const latestPosts = Array.isArray(raw.latestPosts) ? raw.latestPosts : []

    const posts: PostData[] = latestPosts.map((item: Record<string, unknown>) => {
      const mediaType = mapMediaType(String(item.type ?? 'Image'))

      const post: PostData = {
        id: String(item.id ?? ''),
        shortcode: String(item.shortCode ?? ''),
        caption: String(item.caption ?? ''),
        likesCount: (item.likesCount as number) ?? 0,
        commentsCount: (item.commentsCount as number) ?? 0,
        mediaType,
        timestamp: String(item.timestamp ?? new Date().toISOString()),
        url: String(item.url ?? `https://www.instagram.com/p/${item.shortCode ?? ''}/`),
        thumbnailUrl: String(item.displayUrl ?? ''),
      }

      if (mediaType === 'video' && typeof item.videoViewCount === 'number') {
        post.videoViewCount = item.videoViewCount
      }

      return post
    })

    return { data: { profile, posts } }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido al obtener datos de Instagram'
    return { error: message }
  }
}

import { defineEventHandler, createError } from 'h3'
import { getDatabase } from 'firebase-admin/database'
import { getApps } from 'firebase-admin/app'

function getBaseUrl(): string {
  const config = useRuntimeConfig()
  const url = (config.public?.baseUrl || process.env.BASE_URL || 'https://www.adoptazulia.org.ve')
    .replace(/\/$/, '')
  return url
}

function ensureFirebaseAdmin() {
  if (getApps().length === 0) {
    throw createError({ statusCode: 500, statusMessage: 'Firebase Admin not initialized' })
  }
  return getDatabase(getApps()[0])
}

function snapshotToArray(snapshot: any) {
  const items: any[] = []
  snapshot.forEach((childSnapshot: any) => {
    items.push({ id: childSnapshot.key, ...childSnapshot.val() })
  })
  return items
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildUrlNode(loc: string, changefreq: string, priority: string) {
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/mascotas', changefreq: 'daily', priority: '0.9' },
  { path: '/perdidas', changefreq: 'daily', priority: '0.9' },
  { path: '/publicar', changefreq: 'monthly', priority: '0.6' },
  { path: '/comunidad', changefreq: 'weekly', priority: '0.8' },
  { path: '/comunidad/eventos', changefreq: 'weekly', priority: '0.7' },
  { path: '/donaciones', changefreq: 'weekly', priority: '0.8' },
  { path: '/historias', changefreq: 'weekly', priority: '0.8' },
  { path: '/terminos', changefreq: 'yearly', priority: '0.3' },
  { path: '/privacidad', changefreq: 'yearly', priority: '0.3' },
]

export default defineEventHandler(async (event) => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

  // Static routes (always included)
  for (const route of staticRoutes) {
    xml += '\n' + buildUrlNode(`${getBaseUrl()}${route.path}`, route.changefreq, route.priority)
  }

  try {
    const db = ensureFirebaseAdmin()

    const [petsSnapshot, lostPetsSnapshot, noticiasSnapshot, storiesSnapshot] = await Promise.all([
      db.ref('pets').get(),
      db.ref('lost_pets').get(),
      db.ref('tablon/noticias').get(),
      db.ref('adoption_stories').get(),
    ])

    const pets = petsSnapshot.exists()
      ? snapshotToArray(petsSnapshot).filter((p) => !p.isTest)
      : []

    const lostPets = lostPetsSnapshot.exists()
      ? snapshotToArray(lostPetsSnapshot).filter((p) => p.status !== 'archived')
      : []

    const noticias = noticiasSnapshot.exists() ? snapshotToArray(noticiasSnapshot) : []

    const stories = storiesSnapshot.exists()
      ? snapshotToArray(storiesSnapshot).filter((s) => !s.isTest)
      : []

    for (const pet of pets) {
      if (pet.id) {
        xml += '\n' + buildUrlNode(`${getBaseUrl()}/mascotas/${pet.id}`, 'weekly', '0.9')
      }
    }

    for (const pet of lostPets) {
      if (pet.id) {
        xml += '\n' + buildUrlNode(`${getBaseUrl()}/perdidas/${pet.id}`, 'weekly', '0.9')
      }
    }

    for (const noticia of noticias) {
      if (noticia.id) {
        xml += '\n' + buildUrlNode(`${getBaseUrl()}/comunidad/noticias/${noticia.id}`, 'weekly', '0.7')
      }
    }

    for (const story of stories) {
      if (story.id) {
        xml += '\n' + buildUrlNode(`${getBaseUrl()}/historias/${story.id}`, 'weekly', '0.7')
      }
    }
  } catch (error) {
    console.error('[sitemap] Error fetching dynamic data, serving static routes only:', error)
  }

  xml += '\n</urlset>'

  event.node.res.setHeader('Content-Type', 'application/xml')
  event.node.res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=7200')
  return xml
})

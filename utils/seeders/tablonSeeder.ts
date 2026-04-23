import { pushData, deleteData, fetchData } from '~/utils/firebase'
import type { TablonNoticia, TablonEvento } from '~/composables/useTablon'

const NEWS_TITLES = [
  'Gran jornada de adopción en el Parque Vereda del Lago',
  'Nuevo refugio aliado se une a nuestra red',
  'Consejos para cuidar a tu mascota durante el calor marabino',
  'Historia de éxito: El reencuentro de Toby',
  'Campaña de esterilización gratuita este fin de semana',
  'Cómo identificar signos de deshidratación en perros',
  'Agradecimiento a nuestros donantes del mes de abril',
  'Buscamos voluntarios para limpieza de refugio local',
]

const NEWS_CONTENTS = [
  'Este sábado nos reuniremos todos para dar una segunda oportunidad a más de 20 peluditos que buscan un hogar responsable. ¡Te esperamos!',
  'Estamos felices de anunciar que el Refugio "Huellitas de Amor" ahora forma parte de nuestra plataforma, facilitando sus procesos de adopción.',
  'El sol de Maracaibo puede ser fuerte. Asegúrate de que tu mascota siempre tenga agua fresca y sombra disponible durante las horas pico.',
  'Después de 3 meses perdido, Toby volvió con su familia gracias a un reporte en nuestra sección de Mascotas Perdidas. ¡Sí se puede!',
  'Gracias al apoyo de la alcaldía, ofreceremos 50 cupos para esterilización de gatos y perros comunitarios en el sector Indio Mara.',
]

const EVENT_TITLES = [
  'Caminata Familiar "Patas por la Vida"',
  'Charla: Primeros Auxilios Veterinarios',
  'Taller de Entrenamiento Básico',
  'Recolección de Alimentos en Supermercado X',
  'Bingo Benéfico Pro-Fondos Operación Luna',
]

const LOCATIONS = [
  'Vereda del Lago, Etapa 2',
  'Auditorio de la Facultad de Veterinaria LUZ',
  'Plaza de la República',
  'Estacionamiento del CC Sambil',
  'Sede FundaPatas, San Francisco',
]

function generateRecentTimestamp(): number {
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
  return Math.floor(thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo))
}

function generateFutureTimestamp(): number {
  const now = Date.now()
  const thirtyDaysFuture = now + 30 * 24 * 60 * 60 * 1000
  return Math.floor(now + Math.random() * (thirtyDaysFuture - now))
}

export async function seedTablonData(newsCount: number = 5, eventsCount: number = 5): Promise<void> {
  console.log(`🌱 Seeding ${newsCount} news and ${eventsCount} events...`)

  const newsPromises = []
  for (let i = 0; i < newsCount; i++) {
    const noticia: any = {
      title: NEWS_TITLES[i % NEWS_TITLES.length],
      content: NEWS_CONTENTS[i % NEWS_CONTENTS.length],
      imageUrl: `https://placehold.co/800x400/059669/FFF?text=Noticia+${i+1}`,
      authorId: 'seed_admin',
      authorName: 'Admin Seeder',
      createdAt: generateRecentTimestamp(),
      isTest: true
    }
    newsPromises.push(pushData('tablon/noticias', noticia))
  }

  const eventPromises = []
  for (let i = 0; i < eventsCount; i++) {
    const evento: any = {
      title: EVENT_TITLES[i % EVENT_TITLES.length],
      description: 'Esta es una descripción de prueba para un evento comunitario en Zulia. Únete y apoya la causa animalista.',
      location: LOCATIONS[i % LOCATIONS.length],
      date: generateFutureTimestamp(),
      imageUrl: `https://placehold.co/800x400/D97706/FFF?text=Evento+${i+1}`,
      authorId: 'seed_admin',
      authorName: 'Admin Seeder',
      createdAt: Date.now(),
      isTest: true,
      attendees: {}
    }
    eventPromises.push(pushData('tablon/eventos', evento))
  }

  await Promise.all([...newsPromises, ...eventPromises])
  console.log('✅ Tablon seeding complete')
}

export async function clearTablonTestData(): Promise<void> {
  console.log('🧹 Clearing test tablon data...')
  
  const [noticias, eventos] = await Promise.all([
    fetchData<Record<string, any>>('tablon/noticias'),
    fetchData<Record<string, any>>('tablon/eventos')
  ])

  const deletePromises = []

  if (noticias) {
    Object.entries(noticias).forEach(([id, item]) => {
      if (item.isTest || item.authorId === 'seed_admin') {
        deletePromises.push(deleteData(`tablon/noticias/${id}`))
      }
    })
  }

  if (eventos) {
    Object.entries(eventos).forEach(([id, item]) => {
      if (item.isTest || item.authorId === 'seed_admin') {
        deletePromises.push(deleteData(`tablon/eventos/${id}`))
      }
    })
  }

  await Promise.all(deletePromises)
  console.log('✅ Tablon test data cleared')
}

export async function getTablonCounts(): Promise<{ news: number, events: number }> {
  const [noticias, eventos] = await Promise.all([
    fetchData<Record<string, any>>('tablon/noticias'),
    fetchData<Record<string, any>>('tablon/eventos')
  ])

  const news = noticias ? Object.values(noticias).filter(n => n.isTest || n.authorId === 'seed_admin').length : 0
  const events = eventos ? Object.values(eventos).filter(e => e.isTest || e.authorId === 'seed_admin').length : 0

  return { news, events }
}

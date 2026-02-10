// Helper to safely get runtime config
function safeGetBaseUrl(): string {
  try {
    const config = useRuntimeConfig()
    return config.public?.baseUrl || 'https://adopta-zulia.vercel.app'
  } catch {
    return 'https://adopta-zulia.vercel.app'
  }
}

export function useCanonicalUrl(path: string = '', baseUrl?: string) {
  if (!baseUrl) {
    baseUrl = safeGetBaseUrl()
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

export function useOgImage(imagePath?: string, baseUrl?: string) {
  if (!baseUrl) {
    baseUrl = safeGetBaseUrl()
  }

  if (!imagePath) {
    return `${baseUrl}/og.jpg`
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath
  }

  // If it's a relative path, prepend baseUrl
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${baseUrl}${cleanPath}`
}

export function useStructuredData(data: Record<string, any>) {
  return {
    type: 'application/ld+json',
    children: JSON.stringify(data),
  }
}

export function createOrganizationSchema() {
  const baseUrl = safeGetBaseUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Adopta Zulia',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      'Plataforma de adopción de mascotas en el estado Zulia, Venezuela. Ayudamos a encontrar hogares para mascotas que necesitan una familia.',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Spanish'],
    },
  }
}

export function createWebsiteSchema() {
  const baseUrl = safeGetBaseUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Adopta Zulia',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/mascotas?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

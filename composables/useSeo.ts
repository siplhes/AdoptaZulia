export function useCanonicalUrl(path: string = '') {
  const config = useRuntimeConfig()
  const baseUrl = config.public.baseUrl || 'https://adopta-zulia.vercel.app'
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

export function useOgImage(imagePath?: string) {
  const config = useRuntimeConfig()
  const baseUrl = config.public.baseUrl || 'https://adopta-zulia.vercel.app'
  
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
    children: JSON.stringify(data)
  }
}

export function createOrganizationSchema() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.baseUrl || 'https://adopta-zulia.vercel.app'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Adopta Zulia',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Plataforma de adopción de mascotas en el estado Zulia, Venezuela. Ayudamos a encontrar hogares para mascotas que necesitan una familia.',
    sameAs: [
      // Add your social media profiles here
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Spanish']
    }
  }
}

export function createWebsiteSchema() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.baseUrl || 'https://adopta-zulia.vercel.app'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Adopta Zulia',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/mascotas?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
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
      item: item.url
    }))
  }
}

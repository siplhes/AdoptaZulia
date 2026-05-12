import {
  getDatabase,
  ref,
  push,
  get,
  set,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database'
import type { Organization, OrganizationFilters } from '~/models/Organization'

export class OrganizationService {
  private db = getDatabase()
  private organizationsRef = ref(this.db, 'organizations')

  /**
   * Crea una nueva organización en la base de datos
   */
  async createOrganization(organization: Organization): Promise<string> {
    const newOrgRef = push(this.organizationsRef)
    const orgId = newOrgRef.key!

    // Añadir el ID a la organización
    const orgWithId = { 
      ...organization, 
      id: orgId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // Guardar en la base de datos
    await set(newOrgRef, orgWithId)

    return orgId
  }

  /**
   * Obtiene una organización por su ID
   */
  async getOrganizationById(id: string): Promise<Organization | null> {
    const orgRef = ref(this.db, `organizations/${id}`)
    const snapshot = await get(orgRef)

    if (snapshot.exists()) {
      return snapshot.val() as Organization
    }

    return null
  }

  /**
   * Obtiene una organización por su slug
   */
  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    console.log('Getting organization by slug:', slug, 'using fallback approach')
    // Always use the fallback approach to avoid index issues
    try {
      const allOrgs = await this.getAllOrganizations()
      const foundOrg = allOrgs.find((org) => org.slug === slug) || null
      console.log('Found organization:', foundOrg)
      return foundOrg
    } catch (error) {
      console.error('Error al obtener organización por slug:', error)
      return null
    }
  }

  /**
   * Actualiza una organización existente
   */
  async updateOrganization(id: string, updates: Partial<Organization>): Promise<void> {
    const orgRef = ref(this.db, `organizations/${id}`)
    await update(orgRef, { ...updates, updatedAt: Date.now() })
  }

  /**
   * Elimina una organización
   */
  async deleteOrganization(id: string): Promise<void> {
    const orgRef = ref(this.db, `organizations/${id}`)
    await remove(orgRef)
  }

  /**
   * Obtiene todas las organizaciones (excluye inactivas para vistas públicas)
   */
  async getAllOrganizations(): Promise<Organization[]> {
    const snapshot = await get(this.organizationsRef)

    if (snapshot.exists()) {
      const orgs: Organization[] = []
      snapshot.forEach((childSnapshot) => {
        const val = childSnapshot.val()
        const org = { id: childSnapshot.key, ...val } as Organization
        // Filter out inactive organizations for public views
        if (org.status !== 'inactive') {
          orgs.push(org)
        }
      })
      return orgs
    }

    return []
  }

  /**
   * Obtiene TODAS las organizaciones (incluyendo inactivas - para admin)
   */
  async getAllOrganizationsRaw(): Promise<Organization[]> {
    const snapshot = await get(this.organizationsRef)

    if (snapshot.exists()) {
      const orgs: Organization[] = []
      snapshot.forEach((childSnapshot) => {
        orgs.push({ id: childSnapshot.key, ...childSnapshot.val() } as Organization)
      })
      return orgs
    }

    return []
  }

  /**
   * Obtiene organizaciones por tipo
   */
  async getOrganizationsByType(type: 'protectora' | 'refugio' | 'fundacion'): Promise<Organization[]> {
    try {
      const orgsQuery = query(this.organizationsRef, orderByChild('type'), equalTo(type))
      const snapshot = await get(orgsQuery)

      if (snapshot.exists()) {
        const orgs: Organization[] = []
        snapshot.forEach((childSnapshot) => {
          orgs.push({ id: childSnapshot.key, ...childSnapshot.val() } as Organization)
        })
        return orgs.filter((org) => org.status !== 'inactive')
      }

      return []
    } catch (error) {
      console.error('Error al obtener organizaciones por tipo:', error)
      // Fallback: obtener todas y filtrar manualmente
      const allOrgs = await this.getAllOrganizations()
      return allOrgs.filter((org) => org.type === type)
    }
  }

  /**
   * Obtiene organizaciones por ciudad
   */
  async getOrganizationsByCity(city: string): Promise<Organization[]> {
    try {
      const orgsQuery = query(this.organizationsRef, orderByChild('city'), equalTo(city))
      const snapshot = await get(orgsQuery)

      if (snapshot.exists()) {
        const orgs: Organization[] = []
        snapshot.forEach((childSnapshot) => {
          orgs.push({ id: childSnapshot.key, ...childSnapshot.val() } as Organization)
        })
        return orgs.filter((org) => org.status !== 'inactive')
      }

      return []
    } catch (error) {
      console.error('Error al obtener organizaciones por ciudad:', error)
      // Fallback: obtener todas y filtrar manualmente
      const allOrgs = await this.getAllOrganizations()
      return allOrgs.filter((org) => org.city === city)
    }
  }

  /**
   * Obtiene organizaciones de un usuario (owner o admin)
   */
  async getOrganizationsByUserId(userId: string): Promise<Organization[]> {
    const allOrgs = await this.getAllOrganizationsRaw()
    
    return allOrgs.filter((org) => {
      return org.ownerId === userId || (org.admins && org.admins.includes(userId))
    })
  }

  /**
   * Filtrar organizaciones según criterios
   */
  async filterOrganizations(filters: OrganizationFilters): Promise<Organization[]> {
    const allOrgs = await this.getAllOrganizations()

    return allOrgs.filter((org) => {
      // Filtro por tipo
      if (filters.type && org.type !== filters.type) {
        return false
      }

      // Filtro por ciudad
      if (filters.city && org.city !== filters.city) {
        return false
      }

      // Filtro por estado
      if (filters.state && org.state !== filters.state) {
        return false
      }

      // Filtro por verificación
      if (filters.verified !== undefined && org.verified !== filters.verified) {
        return false
      }

      // Filtro por estado
      if (filters.status && org.status !== filters.status) {
        return false
      }

      return true
    })
  }

  /**
   * Buscar organizaciones por texto
   */
  async searchOrganizations(searchText: string): Promise<Organization[]> {
    const allOrgs = await this.getAllOrganizations()

    if (!searchText) return allOrgs

    const searchTerms = searchText.toLowerCase().split(' ')

    return allOrgs.filter((org) => {
      const orgName = org.name.toLowerCase()
      const orgDescription = org.description?.toLowerCase() || ''
      const orgCity = org.city?.toLowerCase() || ''
      const orgState = org.state?.toLowerCase() || ''

      return searchTerms.some(
        (term) =>
          orgName.includes(term) ||
          orgDescription.includes(term) ||
          orgCity.includes(term) ||
          orgState.includes(term)
      )
    })
  }

  /**
   * Verificar si un usuario es admin de una organización
   */
  async isOrganizationAdmin(orgId: string, userId: string): Promise<boolean> {
    const org = await this.getOrganizationById(orgId)
    
    if (!org) return false
    
    const isAdmin = org.admins?.includes(userId) ?? false
    return org.ownerId === userId || isAdmin
  }

  /**
   * Verificar si un usuario es miembro de una organización
   */
  async isOrganizationMember(orgId: string, userId: string): Promise<boolean> {
    const org = await this.getOrganizationById(orgId)
    
    if (!org) return false
    
    const isAdmin = org.admins?.includes(userId) ?? false
    const isMember = org.members?.includes(userId) ?? false
    return org.ownerId === userId || isAdmin || isMember
  }

  /**
   * Agregar admin a una organización
   */
  async addAdminToOrganization(orgId: string, userId: string): Promise<void> {
    const org = await this.getOrganizationById(orgId)
    
    if (!org) throw new Error('Organización no encontrada')
    
    const admins = org.admins || []
    if (!admins.includes(userId)) {
      admins.push(userId)
      await this.updateOrganization(orgId, { admins })
    }
  }

  /**
   * Agregar miembro a una organización
   */
  async addMemberToOrganization(orgId: string, userId: string): Promise<void> {
    const org = await this.getOrganizationById(orgId)
    
    if (!org) throw new Error('Organización no encontrada')
    
    const members = org.members || []
    if (!members.includes(userId)) {
      members.push(userId)
      await this.updateOrganization(orgId, { members })
    }
  }

  /**
   * Remover admin de una organización
   */
  async removeAdminFromOrganization(orgId: string, userId: string): Promise<void> {
    const org = await this.getOrganizationById(orgId)
    
    if (!org) throw new Error('Organización no encontrada')
    
    const admins = org.admins?.filter((id) => id !== userId) || []
    await this.updateOrganization(orgId, { admins })
  }

  /**
   * Remover miembro de una organización
   */
  async removeMemberFromOrganization(orgId: string, userId: string): Promise<void> {
    const org = await this.getOrganizationById(orgId)
    
    if (!org) throw new Error('Organización no encontrada')
    
    const members = org.members?.filter((id) => id !== userId) || []
    await this.updateOrganization(orgId, { members })
  }
}

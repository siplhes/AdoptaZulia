import { ref, computed, watch } from 'vue'
import {
  getDatabase,
  ref as dbRef,
  get,
  set,
  update,
  remove,
  query,
  orderByChild,
  push,
  equalTo,
  limitToFirst,
  startAfter
} from 'firebase/database'
import { useFirebaseApp } from 'vuefire'
import { useNotifications } from './useNotifications'
import { useSecureLogger } from './useSecureLogger'

// Interfaz para una solicitud de adopción
export interface Adoption {
  id: string
  petId: string
  userId: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  message?: string
  notes?: string
  createdAt: number
  updatedAt?: number
  pet?: any
  user?: {
    id: string
    name?: string
    email?: string
    phone?: string
    address?: string
    photoURL?: string
  }
}

  /**
   * Confirma una adopción y crea una verificación oficial.
   * - Marca la solicitud como 'completed'
   * - Actualiza la mascota a 'adopted' y registra `adoptedBy`
   * - Crea un registro en `adoptionVerifications`
   * - Añade entrada en `users/{adopterId}/verifiedAdoptions`
   * - Opcionalmente crea una historia de adopción verificada
   */
  

// Caché para los datos de mascotas y usuarios
interface DataCache {
  pets: Map<string, any>;
  users: Map<string, any>;
  adoptions: Map<string, Adoption>;
  lastFetch: {
    all: number | null;
    byOwner: Record<string, number>;
    byStatus: Record<string, number>;
  }
  pendingRequests: Set<string>; // Conjunto de IDs de peticiones en curso
}

export function useAdoptions() {
  const adoptions = ref<Adoption[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { createNotification } = useNotifications()
  const { error: logError, warn } = useSecureLogger()

  // Sistema de caché mejorado para reducir consultas repetidas
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  const cache: DataCache = {
    pets: new Map(),
    users: new Map(),
    adoptions: new Map(),
    lastFetch: {
      all: null,
      byOwner: {},
      byStatus: {}
    },
    pendingRequests: new Set()
  };
  // Comprueba si la caché ha expirado
  const isCacheExpired = (timestamp: number | null): boolean => {
    if (!timestamp) return true;
    return Date.now() - timestamp > CACHE_TTL;
  }

  // Nueva función para prefetch de datos relacionados
  async function prefetchRelatedData(petIds: string[] = [], userIds: string[] = []): Promise<void> {
    // Si no hay IDs para prefetch, salimos
    if (petIds.length === 0 && userIds.length === 0) return;

    // Filtramos sólo las IDs que no están en caché
    const uniquePetIds = Array.from(new Set(petIds)).filter(id => !cache.pets.has(id));
    const uniqueUserIds = Array.from(new Set(userIds)).filter(id => !cache.users.has(id));

    if (uniquePetIds.length === 0 && uniqueUserIds.length === 0) return;

    const firebaseApp = useFirebaseApp();
    const db = getDatabase(firebaseApp);

    // Preparamos las promesas para las peticiones
    const promises: Promise<any>[] = [];

    // Prefetch de mascotas (en lotes de 10 para no sobrecargar)
    for (let i = 0; i < uniquePetIds.length; i += 10) {
      const batch = uniquePetIds.slice(i, i + 10);
      const batchPromises = batch.map(async (petId) => {
        // Evitamos solicitudes duplicadas
        if (cache.pendingRequests.has(`pet-${petId}`)) return null;

        cache.pendingRequests.add(`pet-${petId}`);
        try {
          const petRef = dbRef(db, `pets/${petId}`);
          const snapshot = await get(petRef);

          if (snapshot.exists()) {
            const data = snapshot.val();
            cache.pets.set(petId, data);
            return { id: petId, data };
          }
        } finally {
          cache.pendingRequests.delete(`pet-${petId}`);
        }
        return null;
      });

      promises.push(...batchPromises);
    }

    // Prefetch de usuarios (en lotes de 10)
    for (let i = 0; i < uniqueUserIds.length; i += 10) {
      const batch = uniqueUserIds.slice(i, i + 10);
      const batchPromises = batch.map(async (userId) => {
        // Evitamos solicitudes duplicadas
        if (cache.pendingRequests.has(`user-${userId}`)) return null;

        cache.pendingRequests.add(`user-${userId}`);
        try {
          const userRef = dbRef(db, `users/${userId}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const data = snapshot.val();
            cache.users.set(userId, data);
            return { id: userId, data };
          }
        } finally {
          cache.pendingRequests.delete(`user-${userId}`);
        }
        return null;
      });

      promises.push(...batchPromises);
    }

    // Esperamos a que se completen todas las consultas
    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
  }

  /**
   * Obtiene todas las solicitudes de adopción
   */
  async function fetchAllAdoptions(page = 1, pageSize = 20): Promise<Adoption[]> {
    loading.value = true;
    error.value = null;

    try {
      // Comprobamos si podemos usar la caché
      if (!isCacheExpired(cache.lastFetch.all) && adoptions.value.length > 0) {
        const paginatedAdoptions = adoptions.value
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice((page - 1) * pageSize, page * pageSize);
        return paginatedAdoptions;
      }

      // Evitamos consultas duplicadas
      if (cache.pendingRequests.has('all-adoptions')) {
        // Esperamos a que se complete la consulta en curso
        while (cache.pendingRequests.has('all-adoptions')) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Si ya se completó la consulta, usamos los datos en caché
        if (!isCacheExpired(cache.lastFetch.all) && adoptions.value.length > 0) {
          const paginatedAdoptions = adoptions.value
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice((page - 1) * pageSize, page * pageSize);
          return paginatedAdoptions;
        }
      }

      cache.pendingRequests.add('all-adoptions');

      const firebaseApp = useFirebaseApp();
      const db = getDatabase(firebaseApp);
      const adoptionsRef = dbRef(db, 'adoptions');

      // Consulta ordenada por fecha de creación
      const adoptionsQuery = query(
        adoptionsRef,
        orderByChild('createdAt')
      );

      const snapshot = await get(adoptionsQuery);

      if (snapshot.exists()) {
        const adoptionsData: Adoption[] = [];
        const rawData = snapshot.val();
        const petIds: string[] = [];
        const userIds: string[] = [];

        // Convertimos los datos en un array y añadimos el ID
        for (const [id, data] of Object.entries(rawData)) {
          const adoptionData = data as any;
          const adoption: Adoption = {
            id,
            petId: adoptionData.petId,
            userId: adoptionData.userId,
            status: adoptionData.status || 'pending',
            message: adoptionData.message || '',
            notes: adoptionData.notes || '',
            createdAt: adoptionData.createdAt || Date.now(),
            updatedAt: adoptionData.updatedAt || adoptionData.createdAt || Date.now(),
          };

          // Recopilamos IDs para prefetch
          petIds.push(adoption.petId);
          userIds.push(adoption.userId);

          // Almacenar en la caché
          cache.adoptions.set(id, adoption);
          adoptionsData.push(adoption);
        }

        // Ordenamos por fecha de creación descendente
        adoptionsData.sort((a, b) => b.createdAt - a.createdAt);

        // Aplicamos paginación
        const paginatedAdoptions = adoptionsData.slice((page - 1) * pageSize, page * pageSize);

        // Iniciamos prefetch de datos relacionados para todas las adopciones
        // mientras solo enriquecemos los datos de la página actual
        prefetchRelatedData(petIds, userIds).catch(logError);

        // Enriquecemos los datos con información de mascotas y usuarios
        await enrichAdoptionsData(paginatedAdoptions);

        // Actualizar timestamp de la caché
        cache.lastFetch.all = Date.now();

        adoptions.value = adoptionsData;
        return paginatedAdoptions;
      } else {
        adoptions.value = [];
        return [];
      }
    } catch (err: any) {
      logError('Error al obtener adopciones:', err);
      error.value = 'Error al cargar adopciones. Por favor, intenta de nuevo.';
      return [];
    } finally {
      loading.value = false;
      cache.pendingRequests.delete('all-adoptions');
    }
  }

  /**
   * Enriquecer datos de adopciones con información de mascotas y usuarios
   */
  async function enrichAdoptionsData(adoptionsData: Adoption[]): Promise<void> {
    if (adoptionsData.length === 0) return;

    const firebaseApp = useFirebaseApp();
    const db = getDatabase(firebaseApp);

    // Filtrar solo las IDs que no están en caché
    const neededPetIds = adoptionsData
      .map((a) => a.petId)
      .filter((id) => !cache.pets.has(id));

    const neededUserIds = adoptionsData
      .map((a) => a.userId)
      .filter((id) => !cache.users.has(id));

    // Peticiones que realmente necesitamos hacer
    const petPromises = neededPetIds.length > 0
      ? neededPetIds.map(async (petId) => {
        // Evitamos consultas duplicadas
        if (cache.pendingRequests.has(`pet-${petId}`)) return null;

        cache.pendingRequests.add(`pet-${petId}`);
        try {
          const petRef = dbRef(db, `pets/${petId}`);
          const snapshot = await get(petRef);
          const data = snapshot.exists() ? snapshot.val() : null;

          // Guardar en caché
          if (data) cache.pets.set(petId, data);

          return { id: petId, data };
        } finally {
          cache.pendingRequests.delete(`pet-${petId}`);
        }
      })
      : [];

    const userPromises = neededUserIds.length > 0
      ? neededUserIds.map(async (userId) => {
        // Evitamos consultas duplicadas
        if (cache.pendingRequests.has(`user-${userId}`)) return null;

        cache.pendingRequests.add(`user-${userId}`);
        try {
          const userRef = dbRef(db, `users/${userId}`);
          const snapshot = await get(userRef);
          const data = snapshot.exists() ? snapshot.val() : null;

          // Guardar en caché
          if (data) cache.users.set(userId, data);

          return { id: userId, data };
        } finally {
          cache.pendingRequests.delete(`user-${userId}`);
        }
      })
      : [];

    // Si hay promesas que resolver, las resolvemos
    if (petPromises.length > 0 || userPromises.length > 0) {
      // Esperamos a que se resuelvan todas las promesas
      await Promise.all([
        Promise.all(petPromises),
        Promise.all(userPromises),
      ]);
    }

    // Enriquecemos los datos de adopciones usando la caché
    for (const adoption of adoptionsData) {
      const petData = cache.pets.get(adoption.petId);
      const userData = cache.users.get(adoption.userId);

      if (petData) {
        adoption.pet = {
          id: adoption.petId,
          name: petData.name || 'Sin nombre',
          species: petData.type || 'No especificado',
          breed: petData.breed || 'No especificado',
          age: petData.age || 'No especificado',
          gender: petData.gender || 'No especificado',
          size: petData.size || 'No especificado',
          description: petData.description || '',
          imageUrl: petData.image || '',
        };
      }

      if (userData) {
        // Normalizar/normalizar campos de usuario para cubrir distintas estructuras en la BD
        const userName = userData.displayName || userData.name || userData.userName || userData.fullName || ''
        const userEmail = userData.email || userData.mail || ''
        const userPhone = userData.phoneNumber || userData.phone || ''
        const userAddress = userData.address || userData.location || ''
        const userPhoto = userData.photoURL || userData.photo || userData.avatar || ''

        adoption.user = {
          id: adoption.userId,
          name: userName,
          email: userEmail,
          phone: userPhone,
          address: userAddress,
          photoURL: userPhoto
        };
      }
    }

    // Fallback adicional: si alguna adopción aún no tiene user, intentamos obtenerlo usando el composable de users
    // Esto ayuda en caso de inconsistencias en caché o paths diferentes en la BD
    for (const adoption of adoptionsData) {
      if (!adoption.user) {
        try {
          // Importamos y usamos useUsers para aprovechar su fetchUserById y mapeos
          const { fetchUserById } = await import('./useUsers').then(m => m.useUsers());
          const userProfile = await fetchUserById(adoption.userId);
          if (userProfile) {
            adoption.user = {
              id: adoption.userId,
              name: userProfile.displayName || userProfile.userName || userProfile.email || '',
              email: userProfile.email || '',
              phone: (userProfile.phone || userProfile.phoneNumber) || '',
              address: userProfile.address || '',
              photoURL: userProfile.photoURL || ''
            };
            // also cache it
            cache.users.set(adoption.userId, userProfile);
          } else {
            warn(`useAdoptions: no user data found for userId=${adoption.userId}`);
          }
        } catch (err) {
          warn(`useAdoptions: fallback fetchUserById failed for userId=${adoption.userId}`, err);
        }
      }
    }
  }

  /**
   * Obtiene las solicitudes de adopción para las mascotas de un propietario
   */
  async function fetchAdoptionsForOwner(ownerId: string, page = 1, pageSize = 20): Promise<Adoption[]> {
    loading.value = true;
    error.value = null;

    try {
      // Verificar caché
      if (
        cache.lastFetch.byOwner[ownerId] &&
        !isCacheExpired(cache.lastFetch.byOwner[ownerId])
      ) {
        // Filtrar las adopciones de la caché que pertenecen a este propietario
        const cachedOwnerAdoptions = Array.from(cache.adoptions.values())
          .filter(adoption => {
            const pet = cache.pets.get(adoption.petId);
            return pet && pet.userId === ownerId;
          })
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice((page - 1) * pageSize, page * pageSize);

        if (cachedOwnerAdoptions.length > 0) {
          return cachedOwnerAdoptions;
        }
      }

      // Evitamos consultas duplicadas
      const requestKey = `owner-adoptions-${ownerId}`;
      if (cache.pendingRequests.has(requestKey)) {
        // Esperamos a que se complete la consulta en curso
        while (cache.pendingRequests.has(requestKey)) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Verificamos de nuevo la caché
        if (
          cache.lastFetch.byOwner[ownerId] &&
          !isCacheExpired(cache.lastFetch.byOwner[ownerId])
        ) {
          const cachedOwnerAdoptions = Array.from(cache.adoptions.values())
            .filter(adoption => {
              const pet = cache.pets.get(adoption.petId);
              return pet && pet.userId === ownerId;
            })
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice((page - 1) * pageSize, page * pageSize);

          if (cachedOwnerAdoptions.length > 0) {
            return cachedOwnerAdoptions;
          }
        }
      }

      cache.pendingRequests.add(requestKey);

      const firebaseApp = useFirebaseApp();
      const db = getDatabase(firebaseApp);

      // Primero obtenemos todas las mascotas del propietario
      const petsRef = dbRef(db, 'pets');
      const petsQuery = query(petsRef, orderByChild('userId'), equalTo(ownerId));
      const petsSnapshot = await get(petsQuery);

      if (!petsSnapshot.exists()) {
        return [];
      }

      // Extraemos los IDs de las mascotas y los guardamos en caché
      const petIds: string[] = [];
      petsSnapshot.forEach((childSnapshot) => {
        const petId = childSnapshot.key as string;
        const petData = childSnapshot.val();

        // Actualizar caché de mascotas
        cache.pets.set(petId, petData);
        petIds.push(petId);
      });

      if (petIds.length === 0) {
        return [];
      }

      // Optimizamos la consulta de adopciones
      const adoptionsRef = dbRef(db, 'adoptions');
      const adoptionsQuery = query(
        adoptionsRef,
        orderByChild('createdAt')
      );

      const adoptionsSnapshot = await get(adoptionsQuery);

      if (!adoptionsSnapshot.exists()) {
        return [];
      }

      // Filtramos las adopciones que corresponden a las mascotas del propietario
      const ownerAdoptions: Adoption[] = [];
      const userIdsToFetch: string[] = [];

      adoptionsSnapshot.forEach((childSnapshot) => {
        const adoptionId = childSnapshot.key as string;
        const adoptionData = childSnapshot.val();

        if (petIds.includes(adoptionData.petId)) {
          const adoption = {
            id: adoptionId,
            ...adoptionData,
          } as Adoption;

          // Recopilamos IDs de usuarios para prefetch
          userIdsToFetch.push(adoption.userId);

          // Actualizar caché
          cache.adoptions.set(adoptionId, adoption);
          ownerAdoptions.push(adoption);
        }
      });

      // Ordenar por fecha de creación descendente
      ownerAdoptions.sort((a, b) => b.createdAt - a.createdAt);

      // Aplicar paginación
      const paginatedAdoptions = ownerAdoptions.slice((page - 1) * pageSize, page * pageSize);

      // Iniciamos prefetch de datos de usuario para todas las adopciones
      // mientras solo enriquecemos los datos de la página actual
      prefetchRelatedData([], userIdsToFetch).catch(logError);

      // Enriquecemos los datos con información de mascotas y usuarios
      if (paginatedAdoptions.length > 0) {
        await enrichAdoptionsData(paginatedAdoptions);
      }

      // Actualizar timestamp de caché
      cache.lastFetch.byOwner[ownerId] = Date.now();

      return paginatedAdoptions;
    } catch (err: any) {
      logError('Error al obtener solicitudes de adopción para el propietario:', err);
      error.value = 'Error al cargar solicitudes. Por favor, intenta de nuevo.';
      return [];
    } finally {
      loading.value = false;
      cache.pendingRequests.delete(`owner-adoptions-${ownerId}`);
    }
  }

  // Método para obtener solicitudes de adopción por estado
  async function fetchAdoptionsByStatus(
    status: 'pending' | 'approved' | 'rejected' | 'completed',
    page = 1,
    pageSize = 20
  ): Promise<Adoption[]> {
    loading.value = true;
    error.value = null;

    try {
      // Verificar caché por estado
      if (
        cache.lastFetch.byStatus[status] &&
        !isCacheExpired(cache.lastFetch.byStatus[status])
      ) {
        // Filtrar adopciones por estado desde la caché
        const cachedAdoptions = Array.from(cache.adoptions.values())
          .filter(adoption => adoption.status === status)
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice((page - 1) * pageSize, page * pageSize);

        if (cachedAdoptions.length > 0) {
          return cachedAdoptions;
        }
      }

      // Evitamos consultas duplicadas
      const requestKey = `status-adoptions-${status}`;
      if (cache.pendingRequests.has(requestKey)) {
        // Esperamos a que se complete la consulta en curso
        while (cache.pendingRequests.has(requestKey)) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Verificamos de nuevo la caché
        if (
          cache.lastFetch.byStatus[status] &&
          !isCacheExpired(cache.lastFetch.byStatus[status])
        ) {
          const cachedAdoptions = Array.from(cache.adoptions.values())
            .filter(adoption => adoption.status === status)
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice((page - 1) * pageSize, page * pageSize);

          if (cachedAdoptions.length > 0) {
            return cachedAdoptions;
          }
        }
      }

      cache.pendingRequests.add(requestKey);

      const firebaseApp = useFirebaseApp();
      const db = getDatabase(firebaseApp);
      const adoptionsRef = dbRef(db, 'adoptions');

      // Consultar adopciones por estado
      const adoptionsQuery = query(
        adoptionsRef,
        orderByChild('status'),
        equalTo(status)
      );

      const snapshot = await get(adoptionsQuery);

      if (snapshot.exists()) {
        const adoptionsData: Adoption[] = [];
        const petIds: string[] = [];
        const userIds: string[] = [];

        snapshot.forEach((childSnapshot) => {
          const adoptionId = childSnapshot.key as string;
          const adoptionData = childSnapshot.val();

          const adoption = {
            id: adoptionId,
            ...adoptionData
          } as Adoption;

          // Recopilamos IDs para prefetch
          petIds.push(adoption.petId);
          userIds.push(adoption.userId);

          // Actualizar caché
          cache.adoptions.set(adoptionId, adoption);
          adoptionsData.push(adoption);
        });

        // Ordenar por fecha de creación descendente
        adoptionsData.sort((a, b) => b.createdAt - a.createdAt);

        // Aplicar paginación
        const paginatedAdoptions = adoptionsData.slice((page - 1) * pageSize, page * pageSize);

        // Iniciamos prefetch de datos relacionados para todas las adopciones
        // mientras solo enriquecemos los datos de la página actual
        prefetchRelatedData(petIds, userIds).catch(logError);

        // Enriquecer datos de la página actual
        if (paginatedAdoptions.length > 0) {
          await enrichAdoptionsData(paginatedAdoptions);
        }

        // Actualizar timestamp de caché
        cache.lastFetch.byStatus[status] = Date.now();

        return paginatedAdoptions;
      } else {
        return [];
      }
    } catch (err: any) {
      logError(`Error al obtener adopciones con estado ${status}:`, err);
      error.value = 'Error al cargar solicitudes. Por favor, intenta de nuevo.';
      return [];
    } finally {
      loading.value = false;
      cache.pendingRequests.delete(`status-adoptions-${status}`);
    }
  }


  async function updateAdoptionStatus(
    adoptionId: string,
    status: 'pending' | 'approved' | 'rejected' | 'completed',
    notes?: string
  ): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      const firebaseApp = useFirebaseApp();
      const db = getDatabase(firebaseApp);
      const adoptionRef = dbRef(db, `adoptions/${adoptionId}`);

      const updateData: any = {
        status,
        updatedAt: Date.now()
      };
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      await update(adoptionRef, updateData);

      if (cache.adoptions.has(adoptionId)) {
        const adoption = cache.adoptions.get(adoptionId)!;
        adoption.status = status;
        adoption.updatedAt = updateData.updatedAt;
        if (notes !== undefined) {
          adoption.notes = notes;
        }
      }
      const statusMessages = {
        approved: 'Tu solicitud de adopción ha sido aprobada.',
        rejected: 'Tu solicitud de adopción ha sido rechazada.',
        completed: 'El proceso de adopción ha sido completado con éxito.',
        pending: 'Tu solicitud de adopción está pendiente de revisión.'
      };


      try {
        const adoption = cache.adoptions.get(adoptionId);
        if (adoption) {
          await createNotification(
            adoption.userId,
            {
              type: 'adoption_status',
              title: `Estado de adopción: ${status}`,
              message: statusMessages[status],
              data: {
                adoptionId,
                petId: adoption.petId
              },
              actionLink: `/mi-solicitud/${adoptionId}`,
              actionText: 'Ver mi solicitud',
              read: false,
              createdAt: Date.now()
            }
          );
        }
      } catch (notificationError) {
        console.error('Error al crear notificación:', notificationError);
        // No fallamos la función principal por un error en notificación
      }

      return true;
    } catch (err: any) {
      logError('Error al actualizar estado de adopción:', err);
      error.value = 'Error al actualizar estado. Por favor, intenta de nuevo.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Actualiza las notas de una solicitud de adopción
   */
  async function updateAdoptionNotes(adoptionId: string, notes: string): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      const firebaseApp = useFirebaseApp();
      const db = getDatabase(firebaseApp);
      const adoptionRef = dbRef(db, `adoptions/${adoptionId}`);

      // Actualizar en Firebase
      await update(adoptionRef, {
        notes,
        updatedAt: Date.now()
      });

      // Actualizar en caché local
      if (cache.adoptions.has(adoptionId)) {
        const adoption = cache.adoptions.get(adoptionId)!;
        adoption.notes = notes;
        adoption.updatedAt = Date.now();
      }

      return true;
    } catch (err: any) {
      console.error('Error al actualizar notas de adopción:', err);
      error.value = 'Error al actualizar notas. Por favor, intenta de nuevo.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Crea una nueva solicitud de adopción
   */
  async function createAdoptionRequest(petId: string, userId: string, message: string): Promise<string | null> {
    loading.value = true;
    error.value = null;

    try {
      const firebaseApp = useFirebaseApp();
      const db = getDatabase(firebaseApp);
      const adoptionsRef = dbRef(db, 'adoptions');

      // Comprobar si ya existe una solicitud para esta mascota y usuario
      const userAdoptionsQuery = query(
        adoptionsRef,
        orderByChild('userId'),
        equalTo(userId)
      );

      const userAdoptionsSnapshot = await get(userAdoptionsQuery);

      if (userAdoptionsSnapshot.exists()) {
        // Verificar si ya hay una solicitud para esta mascota
        let existingRequest = false;
        userAdoptionsSnapshot.forEach((childSnapshot) => {
          const adoptionData = childSnapshot.val();
          if (adoptionData.petId === petId && ['pending', 'approved'].includes(adoptionData.status)) {
            existingRequest = true;
          }
        });

        if (existingRequest) {
          error.value = 'Ya tienes una solicitud activa para esta mascota.';
          return null;
        }
      }

      // Crear nueva solicitud
      const newAdoption = {
        petId,
        userId,
        status: 'pending',
        message,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const newAdoptionRef = push(adoptionsRef);
      await set(newAdoptionRef, newAdoption);

      const adoptionId = newAdoptionRef.key;

      if (!adoptionId) {
        throw new Error('No se pudo crear la solicitud de adopción');
      }

      // Añadir a la caché
      const adoptionWithId = {
        id: adoptionId,
        ...newAdoption
      } as Adoption;

      cache.adoptions.set(adoptionId, adoptionWithId);

      // Enviar notificación al propietario de la mascota
      try {
        const petRef = dbRef(db, `pets/${petId}`);
        const petSnapshot = await get(petRef);

        if (petSnapshot.exists()) {
          const petData = petSnapshot.val();
          const ownerId = petData.userId;

          // Guardar en caché
          cache.pets.set(petId, petData);

          // Notificar al propietario
          await createNotification(
            ownerId,
            {
              type: 'new_adoption_request',
              title: 'Nueva solicitud de adopción',
              message: `Has recibido una nueva solicitud para adoptar a ${petData.name}.`,
              data: {
                adoptionId,
                petId
              },
              // El enlace debe llevar al propietario a la página de solicitudes
              // para la mascota (página espera el petId como parámetro de ruta).
              actionLink: `/adopciones/${petId}`,
              actionText: 'Ver solicitud',
              read: false,
              createdAt: Date.now()
            }
          );
        }
      } catch (notificationError) {
        console.error('Error al crear notificación:', notificationError);
        // No fallamos la función principal por un error en notificación
      }

      return adoptionId;
    } catch (err: any) {
      console.error('Error al crear solicitud de adopción:', err);
      error.value = 'Error al crear solicitud. Por favor, intenta de nuevo.';
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Elimina una solicitud de adopción
   */
  async function deleteAdoptionRequest(adoptionId: string): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      const firebaseApp = useFirebaseApp();
      const db = getDatabase(firebaseApp);
      const adoptionRef = dbRef(db, `adoptions/${adoptionId}`);

      // Obtener datos de la adopción antes de eliminarla
      const snapshot = await get(adoptionRef);
      if (!snapshot.exists()) {
        error.value = 'La solicitud de adopción no existe.';
        return false;
      }

      const adoptionData = snapshot.val();

      // Eliminar la solicitud
      await remove(adoptionRef);

      // Eliminar de la caché
      cache.adoptions.delete(adoptionId);

      // Notificar al propietario de la mascota
      try {
        const petRef = dbRef(db, `pets/${adoptionData.petId}`);
        const petSnapshot = await get(petRef);

        if (petSnapshot.exists()) {
          const petData = petSnapshot.val();
          const ownerId = petData.userId;

          // Notificar al propietario
          await createNotification(
            ownerId,
            {
              type: 'adoption_request_canceled',
              title: 'Solicitud de adopción cancelada',
              message: `Una solicitud para adoptar a ${petData.name} ha sido cancelada.`,
              data: {
                petId: adoptionData.petId
              },
              actionLink: `/mascotas/${adoptionData.petId}`,
              actionText: 'Ver mascota',
              read: false,
              createdAt: Date.now()
            }
          );
        }
      } catch (notificationError) {
        console.error('Error al crear notificación:', notificationError);
        // No fallamos la función principal por un error en notificación
      }

      return true;
    } catch (err: any) {
      console.error('Error al eliminar solicitud de adopción:', err);
      error.value = 'Error al eliminar solicitud. Por favor, intenta de nuevo.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Obtiene una solicitud de adopción por su ID
   */
  async function getAdoptionById(adoptionId: string): Promise<Adoption | null> {
    loading.value = true;
    error.value = null;

    try {
      // Verificar caché primero
      if (cache.adoptions.has(adoptionId)) {
        const cachedAdoption = cache.adoptions.get(adoptionId)!;

        // Si no tiene datos de mascota o usuario, intentamos enriquecerlos
        if (!cachedAdoption.pet || !cachedAdoption.user) {
          await enrichAdoptionsData([cachedAdoption]);
        }

        return cachedAdoption;
      }

      // Evitamos consultas duplicadas
      const requestKey = `adoption-${adoptionId}`;
      if (cache.pendingRequests.has(requestKey)) {
        // Esperamos a que se complete la consulta en curso
        while (cache.pendingRequests.has(requestKey)) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Verificar caché de nuevo
        if (cache.adoptions.has(adoptionId)) {
          return cache.adoptions.get(adoptionId)!;
        }
      }

      cache.pendingRequests.add(requestKey);

      const firebaseApp = useFirebaseApp();
      const db = getDatabase(firebaseApp);
      const adoptionRef = dbRef(db, `adoptions/${adoptionId}`);

      const snapshot = await get(adoptionRef);

      if (snapshot.exists()) {
        const adoptionData = snapshot.val();
        const adoption: Adoption = {
          id: adoptionId,
          ...adoptionData
        };

        // Añadir a caché
        cache.adoptions.set(adoptionId, adoption);

        // Enriquecer con datos de mascota y usuario
        await enrichAdoptionsData([adoption]);

        return adoption;
      } else {
        return null;
      }
    } catch (err: any) {
      console.error('Error al obtener adopción por ID:', err);
      error.value = 'Error al cargar datos de adopción. Por favor, intenta de nuevo.';
      return null;
    } finally {
      loading.value = false;
      cache.pendingRequests.delete(`adoption-${adoptionId}`);
    }
  }

  /**
   * Verifica si un usuario ha enviado una solicitud de adopción para una mascota específica
   * y devuelve información sobre la solicitud
   */
  async function checkAdoptionRequestForPet(petId: string, userId: string): Promise<{
    exists: boolean;
    adoptionId: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | null;
  }> {
    try {
      const firebaseApp = useFirebaseApp();
      const db = getDatabase(firebaseApp);
      const adoptionsRef = dbRef(db, 'adoptions');

      // Consulta filtrada por mascota y usuario
      const adoptionsQuery = query(
        adoptionsRef,
        orderByChild('userId'),
        equalTo(userId)
      );

      const snapshot = await get(adoptionsQuery);

      if (snapshot.exists()) {
        // Verificamos si alguna de las adopciones del usuario corresponde a esta mascota
        let adoptionId: string | null = null;
        let status: 'pending' | 'approved' | 'rejected' | 'completed' | null = null;

        snapshot.forEach((childSnapshot) => {
          const adoptionData = childSnapshot.val();
          if (adoptionData.petId === petId) {
            adoptionId = childSnapshot.key;
            status = adoptionData.status || 'pending';

            // Guardar en caché
            if (adoptionId) {
              cache.adoptions.set(adoptionId, {
                id: adoptionId,
                ...adoptionData
              });
            }

            // Salir del bucle cuando encontramos la coincidencia
            return true;
          }
          return false;
        });

        if (adoptionId) {
          return {
            exists: true,
            adoptionId,
            status
          };
        }
      }

      // No se encontró una solicitud para esta mascota y usuario
      return {
        exists: false,
        adoptionId: null,
        status: null
      };
    } catch (error) {
      console.error('Error al comprobar solicitud de adopción:', error);
      return {
        exists: false,
        adoptionId: null,
        status: null
      };
    }
  }

  /**
   * Obtiene las solicitudes de adopción realizadas por un usuario
   */
  async function fetchUserAdoptionRequests(userId: string, page = 1, pageSize = 20): Promise<Adoption[]> {
    loading.value = true;
    error.value = null;

    try {
      const requestKey = `user-adoptions-${userId}`;

      // Evitamos consultas duplicadas
      if (cache.pendingRequests.has(requestKey)) {
        // Esperamos a que se complete la consulta en curso
        while (cache.pendingRequests.has(requestKey)) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      cache.pendingRequests.add(requestKey);

      const firebaseApp = useFirebaseApp();
      const db = getDatabase(firebaseApp);
      const adoptionsRef = dbRef(db, 'adoptions');

      // Consulta adoptions donde userId es igual al proporcionado
      const userAdoptionsQuery = query(
        adoptionsRef,
        orderByChild('userId'),
        equalTo(userId)
      );

      const snapshot = await get(userAdoptionsQuery);

      if (snapshot.exists()) {
        const adoptionsData: Adoption[] = [];
        const petIds: string[] = [];

        snapshot.forEach((childSnapshot) => {
          const adoptionId = childSnapshot.key as string;
          const adoptionData = childSnapshot.val();

          const adoption = {
            id: adoptionId,
            ...adoptionData
          } as Adoption;

          // Añadir a caché
          cache.adoptions.set(adoptionId, adoption);
          adoptionsData.push(adoption);

          // Añadir petId para prefetch
          petIds.push(adoption.petId);
        });

        // Ordenar por fecha de creación descendente
        adoptionsData.sort((a, b) => b.createdAt - a.createdAt);

        // Aplicar paginación
        const paginatedAdoptions = adoptionsData.slice((page - 1) * pageSize, page * pageSize);

        // Iniciamos prefetch de datos de mascota para todas las adopciones
        // mientras solo enriquecemos los datos de la página actual
        prefetchRelatedData(petIds, []).catch(console.error);

        // Enriquecer datos de la página actual
        if (paginatedAdoptions.length > 0) {
          await enrichAdoptionsData(paginatedAdoptions);
        }

        return paginatedAdoptions;
      } else {
        return [];
      }
    } catch (err: any) {
      console.error('Error al obtener solicitudes de adopción del usuario:', err);
      error.value = 'Error al cargar tus solicitudes. Por favor, intenta de nuevo.';
      return [];
    } finally {
      loading.value = false;
      cache.pendingRequests.delete(`user-adoptions-${userId}`);
    }
  }

  /**
   * Busca adopciones por ID de mascota
   */
  async function findAdoptionsByPetId(petId: string): Promise<Adoption[]> {
    loading.value = true;
    error.value = null;

    try {
      const requestKey = `pet-adoptions-${petId}`;

      // Evitamos consultas duplicadas
      if (cache.pendingRequests.has(requestKey)) {
        // Esperamos a que se complete la consulta en curso
        while (cache.pendingRequests.has(requestKey)) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      cache.pendingRequests.add(requestKey);

      const firebaseApp = useFirebaseApp();
      const db = getDatabase(firebaseApp);
      const adoptionsRef = dbRef(db, 'adoptions');

      // Consulta adoptions donde petId es igual al proporcionado
      const petAdoptionsQuery = query(
        adoptionsRef,
        orderByChild('petId'),
        equalTo(petId)
      );

      const snapshot = await get(petAdoptionsQuery);

      if (snapshot.exists()) {
        const adoptionsData: Adoption[] = [];
        const userIds: string[] = [];

        snapshot.forEach((childSnapshot) => {
          const adoptionId = childSnapshot.key as string;
          const adoptionData = childSnapshot.val();

          const adoption = {
            id: adoptionId,
            ...adoptionData
          } as Adoption;

          // Añadir a caché
          cache.adoptions.set(adoptionId, adoption);
          adoptionsData.push(adoption);

          // Añadir userId para prefetch
          userIds.push(adoption.userId);
        });

        // Ordenar por fecha de creación descendente
        adoptionsData.sort((a, b) => b.createdAt - a.createdAt);

        // Iniciar prefetch de datos de usuario
        prefetchRelatedData([], userIds).catch(console.error);

        // Enriquecer datos
        if (adoptionsData.length > 0) {
          await enrichAdoptionsData(adoptionsData);
        }

        return adoptionsData;
      } else {
        return [];
      }
    } catch (err: any) {
      console.error('Error al obtener solicitudes de adopción para la mascota:', err);
      error.value = 'Error al cargar solicitudes. Por favor, intenta de nuevo.';
      return [];
    } finally {
      loading.value = false;
      cache.pendingRequests.delete(`pet-adoptions-${petId}`);
    }
  }

  /**
   * Comprueba si un usuario ya ha solicitado adoptar una mascota
   */
  async function hasUserRequestedAdoption(userId: string, petId: string): Promise<boolean> {
    try {
      const firebaseApp = useFirebaseApp();
      const db = getDatabase(firebaseApp);
      const adoptionsRef = dbRef(db, 'adoptions');

      // Consultamos adopciones por usuario
      const userAdoptionsQuery = query(
        adoptionsRef,
        orderByChild('userId'),
        equalTo(userId)
      );

      const snapshot = await get(userAdoptionsQuery);

      if (snapshot.exists()) {
        let hasRequested = false;

        snapshot.forEach((childSnapshot) => {
          const adoptionData = childSnapshot.val();
          // Si el usuario ya tiene una solicitud activa (pendiente o aprobada) para esta mascota
          if (adoptionData.petId === petId && ['pending', 'approved'].includes(adoptionData.status)) {
            hasRequested = true;
          }
        });

        return hasRequested;
      }

      return false;
    } catch (err: any) {
      console.error('Error al verificar solicitudes existentes:', err);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de adopción para un propietario
   */
  async function getOwnerAdoptionStats(ownerId: string): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
    total: number;
  }> {
    try {
      const ownerAdoptions = await fetchAdoptionsForOwner(ownerId, 1, 1000);

      const stats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
        total: ownerAdoptions.length
      };

      ownerAdoptions.forEach(adoption => {
        if (adoption.status === 'pending') stats.pending++;
        else if (adoption.status === 'approved') stats.approved++;
        else if (adoption.status === 'rejected') stats.rejected++;
        else if (adoption.status === 'completed') stats.completed++;
      });

      return stats;
    } catch (err: any) {
      console.error('Error al obtener estadísticas de adopción:', err);
      return {
        pending: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
        total: 0
      };
    }
  }

  /**
   * Confirma una adopción y crea una verificación oficial.
   * Este método ahora está dentro de useAdoptions para poder usar `loading`, `error` y `createNotification`.
   */
  async function confirmAdoptionAndVerify(
    adoptionId: string,
    verifierId?: string,
    createStory: boolean = false,
    storyData: Partial<any> = {}
  ): Promise<string | null> {
    loading.value = true;
    error.value = null;

    try {
      const firebaseApp = useFirebaseApp();
      const db = getDatabase(firebaseApp);

      const adoptionRef = dbRef(db, `adoptions/${adoptionId}`);
      const adoptionSnap = await get(adoptionRef);
      if (!adoptionSnap.exists()) {
        error.value = 'Solicitud de adopción no encontrada';
        return null;
      }

      const adoption = adoptionSnap.val();
      const petId = adoption.petId;
      const adopterId = adoption.userId;

      // 1) Actualizar solicitud a completed
      await update(adoptionRef, { status: 'completed', updatedAt: Date.now() });

      // 2) Actualizar mascota
      const petRef = dbRef(db, `pets/${petId}`);
      await update(petRef, {
        status: 'adopted',
        adoptedBy: adopterId,
        adoptionDate: Date.now(),
        updatedAt: Date.now(),
      });

      // 3) Crear verificación
      const verRef = push(dbRef(db, 'adoptionVerifications'));
      const verificationRecord = {
        adoptionId,
        petId,
        adopterId,
        verifierId: verifierId || null,
        verifiedAt: Date.now(),
        note: 'Verificado a través de AdoptaZulia'
      };
      await set(verRef, verificationRecord);
      const verificationId = verRef.key || null;

      // 4) Registrar en perfil de usuario
      if (verificationId) {
        const userVerRef = dbRef(db, `users/${adopterId}/verifiedAdoptions/${verificationId}`);
        await set(userVerRef, {
          verificationId,
          petId,
          adoptionId,
          verifiedAt: verificationRecord.verifiedAt,
        });
      }

      // 5) Opcional: crear historia verificada
      if (createStory) {
        // Creamos la historia solo si no existe ya una para esta mascota (petStories index)
        const petStoriesRef = dbRef(db, `petStories/${petId}`)
        const petStorySnap = await get(petStoriesRef)
        if (!petStorySnap.exists()) {
          const storiesRef = dbRef(db, 'adoption_stories')
          const newStoryKey = push(storiesRef).key
          const newStory = {
            petId,
            adoptionId,
            userId: adopterId,
            title: storyData.title || `Mi adopción de ${petId}`,
            content: storyData.content || '',
            images: storyData.images || [],
            featured: false,
            verified: true,
            verificationId: verificationId,
            likes: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }

          const updates: Record<string, any> = {}
          updates[`/adoption_stories/${newStoryKey}`] = newStory
          updates[`/petStories/${petId}`] = newStoryKey
          await update(dbRef(db, '/'), updates)
        }
      }

      // 6) Notificar al adoptante
      try {
        await createNotification(adopterId, {
          type: 'adoption_verified',
          title: 'Adopción confirmada',
          message: 'Tu adopción ha sido confirmada y verificada en AdoptaZulia.',
          data: { adoptionId, verificationId },
          actionLink: `/certificados/${adoptionId}`,
          actionText: 'Ver certificado',
          read: false,
          createdAt: Date.now(),
        });
      } catch (err) {
        console.warn('No se pudo enviar notificación de verificación', err);
      }

      return verificationId;
    } catch (err: any) {
      console.error('Error al confirmar y verificar adopción:', err);
      error.value = 'Error al confirmar adopción. Por favor, intenta de nuevo.';
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Exportar funciones y valores reactivos
  return {
    adoptions,
    loading,
    error,
    fetchAllAdoptions,
    enrichAdoptionsData,
    fetchAdoptionsForOwner,
    fetchAdoptionsByStatus,
    fetchUserAdoptionRequests,
    updateAdoptionStatus,
    updateAdoptionNotes,
    createAdoptionRequest,
    deleteAdoptionRequest,
    getAdoptionById,
    checkAdoptionRequestForPet,
    findAdoptionsByPetId,
    confirmAdoptionAndVerify,
    hasUserRequestedAdoption,
    getOwnerAdoptionStats
  }
}
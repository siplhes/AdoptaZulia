<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 text-sm text-slate-500">
            <NuxtLink to="/admin" class="hover:text-emerald-600">Panel</NuxtLink>
            <Icon name="heroicons:chevron-right" class="h-4 w-4" />
            <span>Herramientas de Prueba</span>
          </div>
          <h1 class="mt-2 text-3xl font-bold text-slate-800">🛠️ Zona de Pruebas y Debug</h1>
          <p class="mt-2 text-slate-600">
            Herramientas exclusivas para administradores. Maneja datos de prueba y verifica el
            sistema.
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-slate-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              currentTab === tab.id
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
              'flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
            ]"
            @click="currentTab = tab.id"
          >
            <Icon :name="tab.icon" class="h-5 w-5" />
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="min-h-[500px] rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <!-- Tab: Unit Tests -->
        <div v-if="currentTab === 'tests'" class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-slate-800">Ejecutar Pruebas Unitarias (Vitest)</h2>
            <button
              :disabled="testing"
              class="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              @click="runTests"
            >
              <Icon v-if="!testing" name="mdi:play" class="h-5 w-5" />
              <Icon v-else name="svg-spinners:ring-resize" class="h-5 w-5" />
              {{ testing ? 'Ejecutando...' : 'Correr Tests' }}
            </button>
          </div>

          <!-- Test Results Display -->
          <div
            class="h-96 overflow-y-auto rounded-lg bg-slate-900 p-4 font-mono text-sm text-slate-300"
          >
            <pre v-if="testOutput">{{ testOutput }}</pre>
            <div v-else class="flex h-full items-center justify-center text-slate-600">
              <p>Haz clic en "Correr Tests" para ver los resultados aquí.</p>
            </div>
          </div>
        </div>

        <!-- Tab: Notifications -->
        <div v-if="currentTab === 'notifications'" class="space-y-6">
          <h2 class="text-xl font-bold text-slate-800">Probador de Notificaciones</h2>

          <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
            <!-- Email Tester -->
            <div class="rounded-xl border border-slate-200 p-5">
              <h3 class="mb-4 flex items-center gap-2 font-semibold text-slate-700">
                <Icon name="mdi:email-outline" class="h-5 w-5 text-blue-500" />
                Enviar Correo de Prueba
              </h3>

              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-medium uppercase text-slate-500">
                    Destinatario
                  </label>
                  <input
                    v-model="emailForm.to"
                    type="email"
                    class="mt-1 w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium uppercase text-slate-500">Asunto</label>
                  <input
                    v-model="emailForm.subject"
                    type="text"
                    class="mt-1 w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Prueba desde admin"
                  />
                </div>
                <button
                  :disabled="emailSending"
                  class="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  @click="sendTestEmail"
                >
                  {{ emailSending ? 'Enviando...' : 'Enviar Email' }}
                </button>
              </div>
            </div>

            <!-- Toast Tester -->
            <div class="rounded-xl border border-slate-200 p-5">
              <h3 class="mb-4 flex items-center gap-2 font-semibold text-slate-700">
                <Icon name="mdi:bell-outline" class="h-5 w-5 text-amber-500" />
                Probar Toast / Notificación In-App
              </h3>

              <div class="grid grid-cols-2 gap-4">
                <button
                  class="rounded-md bg-green-100 px-4 py-2 text-green-700 hover:bg-green-200"
                  @click="toast.success('Operación exitosa', 'Éxito')"
                >
                  Success
                </button>
                <button
                  class="rounded-md bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
                  @click="toast.error('Algo salió mal', 'Error')"
                >
                  Error
                </button>
                <button
                  class="rounded-md bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200"
                  @click="toast.info('Información relevante', 'Info')"
                >
                  Info
                </button>
                <button
                  class="rounded-md bg-amber-100 px-4 py-2 text-amber-700 hover:bg-amber-200"
                  @click="toast.warning('Advertencia de sistema', 'Warning')"
                >
                  Warning
                </button>
              </div>

              <div class="mt-6 border-t border-slate-100 pt-6">
                <p class="mb-2 text-sm text-slate-500">Crear notificación persistente (DB):</p>
                <button
                  class="w-full rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-900"
                  @click="createTestInAppNotification"
                >
                  Generar en mi Inbox
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Data Seeding -->
        <div v-if="currentTab === 'data'" class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-slate-800">🌱 Generador de Datos de Prueba</h2>
            <button
              class="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
              @click="clearAllTestData"
            >
              <Icon name="mdi:delete" class="h-4 w-4" />
              Limpiar Todo (isTest)
            </button>
          </div>

          <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p class="text-sm text-amber-800">
              ⚠️ Todos los datos tienen
              <code class="rounded bg-amber-100 px-1">isTest: true</code>
              y solo son visibles para administradores.
            </p>
          </div>

          <!-- Seeders Grid -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <!-- Lost Pets -->
            <div class="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300">
              <div class="mb-2 flex items-center justify-between">
                <Icon name="mdi:paw" class="h-6 w-6 text-blue-500" />
                <span
                  class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800"
                >
                  {{ lostPetsCount }}
                </span>
              </div>
              <h3 class="mb-1 text-sm font-bold text-slate-800">Mascotas Perdidas</h3>
              <p class="mb-3 text-xs text-slate-500">Datos de Zulia</p>
              <div class="space-y-2">
                <input
                  v-model.number="amounts.lostPets"
                  type="number"
                  min="1"
                  max="100"
                  class="w-full rounded border px-2 py-1 text-xs"
                  placeholder="30"
                />
                <button
                  @click="runSeeder('lostPets')"
                  :disabled="seeding.lostPets"
                  class="w-full rounded bg-green-600 px-2 py-1.5 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {{ seeding.lostPets ? 'Creando...' : 'Crear' }}
                </button>
                <button
                  @click="clearSeeder('lostPets')"
                  :disabled="seeding.lostPets"
                  class="w-full rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                >
                  Limpiar
                </button>
              </div>
            </div>

            <!-- Pets (Adoption) -->
            <div class="rounded-xl border border-slate-200 p-4 transition hover:border-pink-300">
              <div class="mb-2 flex items-center justify-between">
                <Icon name="mdi:dog" class="h-6 w-6 text-pink-500" />
                <span
                  class="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-800"
                >
                  {{ petsCount }}
                </span>
              </div>
              <h3 class="mb-1 text-sm font-bold text-slate-800">En Adopción</h3>
              <p class="mb-3 text-xs text-slate-500">Mascotas Disponibles</p>
              <div class="space-y-2">
                <input
                  v-model.number="amounts.pets"
                  type="number"
                  min="1"
                  max="100"
                  class="w-full rounded border px-2 py-1 text-xs"
                  placeholder="30"
                />
                <button
                  @click="runSeeder('pets')"
                  :disabled="seeding.pets"
                  class="w-full rounded bg-green-600 px-2 py-1.5 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {{ seeding.pets ? 'Creando...' : 'Crear' }}
                </button>
                <button
                  @click="clearSeeder('pets')"
                  :disabled="seeding.pets"
                  class="w-full rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                >
                  Limpiar
                </button>
              </div>
            </div>

            <!-- Adoptions -->
            <div class="rounded-xl border border-slate-200 p-4 transition hover:border-purple-300">
              <div class="mb-2 flex items-center justify-between">
                <Icon name="mdi:home-heart" class="h-6 w-6 text-purple-500" />
                <span
                  class="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800"
                >
                  {{ adoptionsCount }}
                </span>
              </div>
              <h3 class="mb-1 text-sm font-bold text-slate-800">Adopciones</h3>
              <p class="mb-3 text-xs text-slate-500">Solicitudes</p>
              <div class="space-y-2">
                <input
                  v-model.number="amounts.adoptions"
                  type="number"
                  min="1"
                  max="100"
                  class="w-full rounded border px-2 py-1 text-xs"
                  placeholder="20"
                />
                <button
                  @click="runSeeder('adoptions')"
                  :disabled="seeding.adoptions"
                  class="w-full rounded bg-green-600 px-2 py-1.5 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {{ seeding.adoptions ? 'Creando...' : 'Crear' }}
                </button>
                <button
                  @click="clearSeeder('adoptions')"
                  :disabled="seeding.adoptions"
                  class="w-full rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                >
                  Limpiar
                </button>
              </div>
            </div>

            <!-- Users -->
            <div class="rounded-xl border border-slate-200 p-4 transition hover:border-yellow-300">
              <div class="mb-2 flex items-center justify-between">
                <Icon name="mdi:account-multiple" class="h-6 w-6 text-yellow-600" />
                <span
                  class="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800"
                >
                  {{ usersCount }}
                </span>
              </div>
              <h3 class="mb-1 text-sm font-bold text-slate-800">Usuarios</h3>
              <p class="mb-3 text-xs text-slate-500">Perfiles</p>
              <div class="space-y-2">
                <input
                  v-model.number="amounts.users"
                  type="number"
                  min="1"
                  max="50"
                  class="w-full rounded border px-2 py-1 text-xs"
                  placeholder="10"
                />
                <button
                  @click="runSeeder('users')"
                  :disabled="seeding.users"
                  class="w-full rounded bg-green-600 px-2 py-1.5 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {{ seeding.users ? 'Creando...' : 'Crear' }}
                </button>
                <button
                  @click="clearSeeder('users')"
                  :disabled="seeding.users"
                  class="w-full rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                >
                  Limpiar
                </button>
              </div>
            </div>

            <!-- Comments -->
            <div class="rounded-xl border border-slate-200 p-4 transition hover:border-green-300">
              <div class="mb-2 flex items-center justify-between">
                <Icon name="mdi:comment-text-multiple" class="h-6 w-6 text-green-600" />
                <span
                  class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800"
                >
                  {{ commentsCount }}
                </span>
              </div>
              <h3 class="mb-1 text-sm font-bold text-slate-800">Comentarios</h3>
              <p class="mb-3 text-xs text-slate-500">Valoraciones</p>
              <div class="space-y-2">
                <input
                  v-model.number="amounts.comments"
                  type="number"
                  min="1"
                  max="100"
                  class="w-full rounded border px-2 py-1 text-xs"
                  placeholder="30"
                />
                <button
                  @click="runSeeder('comments')"
                  :disabled="seeding.comments"
                  class="w-full rounded bg-green-600 px-2 py-1.5 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {{ seeding.comments ? 'Creando...' : 'Crear' }}
                </button>
                <button
                  @click="clearSeeder('comments')"
                  :disabled="seeding.comments"
                  class="w-full rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          <!-- Bulk Action -->
          <div class="flex gap-4 border-t pt-4">
            <button
              @click="seedAll"
              :disabled="seedingAll"
              class="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {{ seedingAll ? 'Creando Todo...' : '🚀 Crear Todo' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBaseEmailHtml } from '~/utils/emailTemplates'
import {
  seedLostPets as seedLostPetsFn,
  clearLostPetsTestData,
  getTestLostPetsCount,
} from '~/utils/seeders/lostPetsSeeder'
import {
  seedPets as seedPetsFn,
  clearPetsTestData,
  getTestPetsCount,
} from '~/utils/seeders/petsSeeder'
import {
  seedAdoptions as seedAdoptionsFn,
  clearAdoptionsTestData,
} from '~/utils/seeders/adoptionsSeeder'
import { seedUsers as seedUsersFn, clearUsersTestData } from '~/utils/seeders/usersSeeder'
import {
  seedPetComments as seedPetCommentsFn,
  clearPetCommentsTestData,
} from '~/utils/seeders/petCommentsSeeder'

definePageMeta({
  layout: 'admin',
  middleware: ['admin'], // Ensure admin access only
})

const tabs = [
  { id: 'tests', name: 'Tests Unitarios', icon: 'mdi:test-tube' },
  { id: 'notifications', name: 'Notificaciones', icon: 'mdi:bell-ring' },
  { id: 'data', name: 'Datos de Prueba', icon: 'mdi:database' },
]

const currentTab = ref('tests')
const toast = useToast()
const { sendEmail, createNotification } = useNotifications()
const { user } = useAuth()

// --- Logic: Tests ---
const testing = ref(false)
const testOutput = ref('')

const runTests = async () => {
  testing.value = true
  testOutput.value = 'Iniciando pruebas...\n'

  try {
    const res = await $fetch('/api/debug/run-tests', { method: 'POST' })
    if (res.success) {
      testOutput.value = res.rawOutput
      toast.success('Pruebas completadas exitosamente')
    } else {
      testOutput.value = `Error:\n${res.error}\n\nStderr:\n${res.errorOutput}`
      toast.error('Pruebas fallidas')
    }
  } catch (e) {
    testOutput.value = `Error de ejecución: ${e.message}`
    toast.error('Error al ejecutar pruebas')
  } finally {
    testing.value = false
  }
}

// --- Logic: Notifications ---
const emailForm = ref({ to: '', subject: '' })
const emailSending = ref(false)

const sendTestEmail = async () => {
  if (!emailForm.value.to) return toast.error('Ingresa un destinatario')

  emailSending.value = true
  try {
    await sendEmail(
      emailForm.value.to,
      emailForm.value.subject || 'Test Email',
      getBaseEmailHtml(
        'Correo de Prueba',
        '<p>Si ves este correo con el logo y colores de Adopta Zulia, ¡la plantilla está funcionando correctamente!</p><p>Este es un mensaje de prueba enviado desde el panel de administración.</p>',
        { text: 'Ir al Panel', url: 'https://adopta-zulia.vercel.app/admin' }
      )
    )
  } finally {
    emailSending.value = false
  }
}

const createTestInAppNotification = async () => {
  if (!user.value) return
  await createNotification(user.value.uid, {
    type: 'system',
    title: 'Notificación de Prueba',
    message: 'Esta es una notificación generada desde el panel de debug.',
    read: false,
    createdAt: Date.now(),
  })
  toast.success('Notificación creada')
}

// --- Logic: Data Seeding ---
const seedData = async (type, count) => {
  try {
    const res = await $fetch('/api/debug/seed', {
      method: 'POST',
      body: { type, count },
    })
    toast.success(`Se generaron ${count} items de tipo ${type}`)
  } catch (e) {
    toast.error('Error generando datos')
  }
}

// --- Seeder Logic ---
const amounts = ref({
  lostPets: 30,
  pets: 30,
  adoptions: 20,
  users: 10,
  comments: 30,
})

const seeding = ref({
  lostPets: false,
  pets: false,
  adoptions: false,
  users: false,
  comments: false,
})

const seedingAll = ref(false)

const lostPetsCount = ref(0)
const petsCount = ref(0)
const adoptionsCount = ref(0)
const usersCount = ref(0)
const commentsCount = ref(0)

async function refreshCounts() {
  try {
    lostPetsCount.value = await getTestLostPetsCount()
    petsCount.value = await getTestPetsCount()
  } catch (error) {
    console.error('Error refreshing counts:', error)
  }
}

async function runSeeder(type) {
  seeding.value[type] = true
  try {
    const amount = amounts.value[type]
    if (type === 'lostPets') {
      await seedLostPetsFn(amount)
      toast.success(`✅ ${amount} mascotas perdidas creadas (isTest: true)`)
    } else if (type === 'pets') {
      await seedPetsFn(amount)
      toast.success(`✅ ${amount} mascotas en adopción creadas (isTest: true)`)
    } else if (type === 'adoptions') {
      await seedAdoptionsFn(amount)
      toast.success(`✅ ${amount} solicitudes creadas (isTest: true)`)
    } else if (type === 'users') {
      await seedUsersFn(amount)
      toast.success(`✅ ${amount} usuarios creados (isTest: true)`)
    } else if (type === 'comments') {
      await seedPetCommentsFn(amount)
      toast.success(`✅ ${amount} comentarios creados (isTest: true)`)
    }
    await refreshCounts()
  } catch (error) {
    toast.error(`Error: ${error.message}`)
  } finally {
    seeding.value[type] = false
  }
}

async function clearSeeder(type) {
  seeding.value[type] = true
  try {
    if (type === 'lostPets') {
      await clearLostPetsTestData()
      toast.success('✅ Mascotas perdidas eliminadas')
    } else if (type === 'pets') {
      await clearPetsTestData()
      toast.success('✅ Mascotas en adopción eliminadas')
    } else if (type === 'adoptions') {
      await clearAdoptionsTestData()
      toast.success('✅ Solicitudes eliminadas')
    } else if (type === 'users') {
      await clearUsersTestData()
      toast.success('✅ Usuarios eliminados')
    } else if (type === 'comments') {
      await clearPetCommentsTestData()
      toast.success('✅ Comentarios eliminados')
    }
    await refreshCounts()
  } catch (error) {
    toast.error(`Error: ${error.message}`)
  } finally {
    seeding.value[type] = false
  }
}

async function seedAll() {
  seedingAll.value = true
  try {
    await seedLostPetsFn(amounts.value.lostPets)
    await seedPetsFn(amounts.value.pets)
    await seedAdoptionsFn(amounts.value.adoptions)
    await seedUsersFn(amounts.value.users)
    await seedPetCommentsFn(amounts.value.comments)
    toast.success('✅ Todos los datos creados con isTest: true')
    await refreshCounts()
  } catch (error) {
    toast.error(`Error: ${error.message}`)
  } finally {
    seedingAll.value = false
  }
}

async function clearAllTestData() {
  if (!confirm('¿Estás seguro? Esto borrará todos los datos marcados como isTest.')) return
  try {
    await clearLostPetsTestData()
    await clearPetsTestData()
    await clearAdoptionsTestData()
    await clearUsersTestData()
    await clearPetCommentsTestData()
    toast.success('✅ Todos los datos de prueba eliminados')
    await refreshCounts()
  } catch (e) {
    toast.error('Error limpiando datos')
  }
}

onMounted(() => {
  refreshCounts()
})
</script>

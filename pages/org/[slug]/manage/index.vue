<template>
  <div v-if="organization" class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Gestionar {{ organization.name }}</h1>
          <p class="text-gray-600">Panel de administración de la organización</p>
        </div>
        <NuxtLink
          :to="`/org/${organization.slug}`"
          class="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-gray-600 transition-colors hover:bg-white hover:text-emerald-600"
        >
          <Icon name="heroicons:arrow-left" class="h-5 w-5" />
          Ver perfil
        </NuxtLink>
      </div>

      <!-- Access Denied -->
      <div v-if="!hasAccess" class="rounded-2xl bg-white p-8 shadow-sm text-center">
        <Icon name="ph:lock-key" class="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Acceso denegado</h2>
        <p class="text-gray-600 mb-6">No tienes permisos para gestionar esta organización.</p>
        <NuxtLink to="/" class="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
          Volver al inicio
        </NuxtLink>
      </div>

      <!-- Management Panel -->
      <div v-else class="space-y-8">
        <!-- Tabs -->
        <div class="rounded-2xl bg-white p-4 shadow-sm">
          <div class="flex gap-2 overflow-x-auto">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap',
                activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              ]"
            >
              <Icon :name="tab.icon" class="mr-2 h-4 w-4" />
              {{ tab.name }}
            </button>
          </div>
        </div>

        <!-- Dashboard Tab -->
        <div v-if="activeTab === 'dashboard'" class="space-y-6">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="rounded-2xl bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div class="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Icon name="ph:paw-print" class="h-6 w-6 text-emerald-600" />
                </div>
                <span class="text-sm font-medium text-emerald-600">Total</span>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ organizationPets.length }}</p>
              <p class="text-sm text-gray-500 mt-1">Mascotas</p>
            </div>

            <div class="rounded-2xl bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div class="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Icon name="ph:users" class="h-6 w-6 text-blue-600" />
                </div>
                <span class="text-sm font-medium text-blue-600">Activos</span>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ organization.volunteers?.filter(v => v.status === 'active').length || 0 }}</p>
              <p class="text-sm text-gray-500 mt-1">Voluntarios</p>
            </div>

            <div class="rounded-2xl bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div class="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Icon name="ph:star" class="h-6 w-6 text-amber-600" />
                </div>
                <span class="text-sm font-medium text-amber-600">Promedio</span>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ averageRating.toFixed(1) }}</p>
              <p class="text-sm text-gray-500 mt-1">Calificación</p>
            </div>

            <div class="rounded-2xl bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div class="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Icon name="ph:calendar" class="h-6 w-6 text-purple-600" />
                </div>
                <span class="text-sm font-medium text-purple-600">Próximos</span>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ organizationEvents.length }}</p>
              <p class="text-sm text-gray-500 mt-1">Eventos</p>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Actividad Reciente</h2>
            <div class="space-y-4">
              <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                <div class="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Icon name="ph:paw-print" class="h-5 w-5 text-emerald-600" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ organizationPets.length }} mascotas vinculadas</p>
                  <p class="text-sm text-gray-500">Mascotas activas en la organización</p>
                </div>
              </div>
              <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Icon name="ph:users" class="h-5 w-5 text-blue-600" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ organization.volunteers?.length || 0 }} voluntarios registrados</p>
                  <p class="text-sm text-gray-500">Miembros del equipo</p>
                </div>
              </div>
              <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                <div class="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Icon name="ph:star" class="h-5 w-5 text-amber-600" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ organization.reviews?.length || 0 }} reseñas recibidas</p>
                  <p class="text-sm text-gray-500">Opiniones de la comunidad</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Moderators Tab -->
        <div v-if="activeTab === 'moderators'" class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Gestionar Moderadores</h2>
          
          <!-- Add Moderator -->
          <div class="mb-6 rounded-xl border border-gray-200 p-4">
            <h3 class="font-semibold text-gray-900 mb-4">Agregar moderador</h3>
            <div class="flex gap-4">
              <input
                v-model="newModeratorEmail"
                type="email"
                placeholder="Correo electrónico del usuario"
                class="flex-1 rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
              <button
                @click="addModerator"
                :disabled="!newModeratorEmail || addingModerator"
                class="rounded-xl bg-emerald-600 px-6 py-2 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {{ addingModerator ? 'Agregando...' : 'Agregar' }}
              </button>
            </div>
          </div>

          <!-- Current Moderators -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-4">Moderadores actuales</h3>
            <div v-if="organization.admins && organization.admins.length > 0" class="space-y-3">
              <div
                v-for="adminId in organization.admins"
                :key="adminId"
                class="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Icon name="ph:user" class="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ adminId }}</p>
                    <p class="text-sm text-gray-500">ID: {{ adminId }}</p>
                  </div>
                </div>
                <button
                  @click="removeModerator(adminId)"
                  class="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-200 transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
            <p v-else class="text-gray-500 italic">No hay moderadores agregados.</p>
          </div>
        </div>

        <!-- Pets Tab -->
        <div v-if="activeTab === 'pets'" class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Gestionar Mascotas</h2>
          
          <!-- Add New Pet -->
          <div class="mb-6">
            <NuxtLink
              :to="`/publicar?org=${organization.id}`"
              class="inline-flex items-center rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition-colors hover:bg-emerald-700"
            >
              <Icon name="ph:plus" class="mr-2 h-5 w-5" />
              Publicar nueva mascota
            </NuxtLink>
          </div>

          <!-- Link Existing Pet -->
          <div class="mb-6 rounded-xl border border-gray-200 p-4">
            <h3 class="font-semibold text-gray-900 mb-4">Vincular mascota existente</h3>
            <div class="flex gap-4">
              <input
                v-model="petIdToLink"
                type="text"
                placeholder="ID de la mascota"
                class="flex-1 rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
              <button
                @click="linkPet"
                :disabled="!petIdToLink || linkingPet"
                class="rounded-xl bg-emerald-600 px-6 py-2 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {{ linkingPet ? 'Vinculando...' : 'Vincular' }}
              </button>
            </div>
          </div>

          <!-- Organization Pets -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-4">Mascotas de la organización</h3>
            <div v-if="organizationPets.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="pet in organizationPets"
                :key="pet.id"
                class="rounded-xl border border-gray-200 overflow-hidden"
              >
                <img v-if="pet.image" :src="pet.image" :alt="pet.name" class="w-full h-48 object-cover" />
                <div v-else class="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <Icon name="ph:paw-print" class="h-12 w-12 text-gray-400" />
                </div>
                <div class="p-4">
                  <h4 class="font-bold text-gray-900">{{ pet.name }}</h4>
                  <p class="text-sm text-gray-500">{{ pet.type }} - {{ pet.breed || 'Sin raza' }}</p>
                  <div class="mt-2 flex gap-2">
                    <NuxtLink
                      :to="`/mascotas/${pet.id}`"
                      class="flex-1 rounded-lg bg-emerald-100 px-3 py-1 text-center text-sm font-medium text-emerald-600 hover:bg-emerald-200 transition-colors"
                    >
                      Ver
                    </NuxtLink>
                    <button
                      @click="unlinkPet(pet.id!)"
                      class="rounded-lg bg-red-100 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-200 transition-colors"
                    >
                      Desvincular
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-gray-500 italic">No hay mascotas vinculadas a la organización.</p>
          </div>
        </div>

        <!-- Volunteers Tab -->
        <div v-if="activeTab === 'volunteers'" class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Gestionar Voluntarios</h2>
          
          <!-- Add Volunteer -->
          <div class="mb-6 rounded-xl border border-gray-200 p-4">
            <h3 class="font-semibold text-gray-900 mb-4">Registrar voluntario</h3>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  v-model="newVolunteer.name"
                  type="text"
                  placeholder="Nombre completo"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
                <input
                  v-model="newVolunteer.email"
                  type="email"
                  placeholder="Correo electrónico"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  v-model="newVolunteer.phone"
                  type="tel"
                  placeholder="Teléfono (opcional)"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
                <input
                  v-model="newVolunteer.availability"
                  type="text"
                  placeholder="Disponibilidad (ej: fines de semana)"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>
              <input
                v-model="newVolunteer.skills"
                type="text"
                placeholder="Habilidades (separadas por comas)"
                class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
              <button
                @click="addVolunteer"
                :disabled="!newVolunteer.name || !newVolunteer.email || addingVolunteer"
                class="rounded-xl bg-emerald-600 px-6 py-2 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {{ addingVolunteer ? 'Registrando...' : 'Registrar voluntario' }}
              </button>
            </div>
          </div>

          <!-- Current Volunteers -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-4">Voluntarios registrados</h3>
            <div v-if="organization.volunteers && organization.volunteers.length > 0" class="space-y-3">
              <div
                v-for="(volunteer, index) in organization.volunteers"
                :key="index"
                class="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Icon name="ph:user" class="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ volunteer.name }}</p>
                    <p class="text-sm text-gray-500">{{ volunteer.email }}</p>
                    <p v-if="volunteer.skills" class="text-xs text-gray-400">Habilidades: {{ volunteer.skills.join(', ') }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      volunteer.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 
                      volunteer.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'
                    ]"
                  >
                    {{ volunteer.status === 'active' ? 'Activo' : volunteer.status === 'pending' ? 'Pendiente' : 'Inactivo' }}
                  </span>
                  <button
                    @click="removeVolunteer(index)"
                    class="rounded-lg bg-red-100 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-200 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
            <p v-else class="text-gray-500 italic">No hay voluntarios registrados.</p>
          </div>
        </div>

        <!-- Donation Links Tab -->
        <div v-if="activeTab === 'donations'" class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Links de Donación</h2>
          
          <!-- Add Donation Link -->
          <div class="mb-6 rounded-xl border border-gray-200 p-4">
            <h3 class="font-semibold text-gray-900 mb-4">Agregar link de donación</h3>
            <div class="space-y-4">
              <input
                v-model="newDonationLink.name"
                type="text"
                placeholder="Nombre (ej: PayPal, Zelle)"
                class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
              <input
                v-model="newDonationLink.url"
                type="url"
                placeholder="URL de donación"
                class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
              <textarea
                v-model="newDonationLink.description"
                placeholder="Descripción (opcional)"
                rows="2"
                class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
              <button
                @click="addDonationLink"
                :disabled="!newDonationLink.name || !newDonationLink.url || addingDonationLink"
                class="rounded-xl bg-emerald-600 px-6 py-2 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {{ addingDonationLink ? 'Agregando...' : 'Agregar' }}
              </button>
            </div>
          </div>

          <!-- Current Donation Links -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-4">Links de donación actuales</h3>
            <div v-if="organization.donationLinks && organization.donationLinks.length > 0" class="space-y-3">
              <div
                v-for="(link, index) in organization.donationLinks"
                :key="index"
                class="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <p class="font-medium text-gray-900">{{ link.name }}</p>
                  <p v-if="link.description" class="text-sm text-gray-500">{{ link.description }}</p>
                  <a :href="link.url" target="_blank" class="text-sm text-emerald-600 hover:underline">{{ link.url }}</a>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="toggleDonationLink(index)"
                    :class="[
                      'rounded-lg px-3 py-1 text-sm font-medium transition-colors',
                      link.active ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    ]"
                  >
                    {{ link.active ? 'Activo' : 'Inactivo' }}
                  </button>
                  <button
                    @click="removeDonationLink(index)"
                    class="rounded-lg bg-red-100 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-200 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
            <p v-else class="text-gray-500 italic">No hay links de donación agregados.</p>
          </div>

          <!-- Donation Goals -->
          <div class="mt-8">
            <h3 class="font-semibold text-gray-900 mb-4">Metas de recaudación</h3>
            <div v-if="organization.donationGoals && organization.donationGoals.length > 0" class="space-y-4">
              <div
                v-for="(goal, index) in organization.donationGoals.filter(g => g.active)"
                :key="index"
                class="rounded-lg border border-gray-200 p-4"
              >
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <p class="font-medium text-gray-900">{{ goal.title }}</p>
                    <p v-if="goal.description" class="text-sm text-gray-500">{{ goal.description }}</p>
                  </div>
                  <button
                    @click="removeDonationGoal(index)"
                    class="rounded-lg bg-red-100 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-200 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
                <div class="mb-2">
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">Progreso</span>
                    <span class="font-medium text-emerald-600">{{ goal.currency || '$' }}{{ goal.currentAmount.toLocaleString() }} / {{ goal.currency || '$' }}{{ goal.targetAmount.toLocaleString() }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div
                      class="bg-emerald-600 h-3 rounded-full transition-all"
                      :style="{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }"
                    />
                  </div>
                  <p class="text-xs text-gray-500 mt-1">{{ Math.round((goal.currentAmount / goal.targetAmount) * 100) }}% completado</p>
                </div>
                <div class="flex gap-2">
                  <input
                    v-model="goal.currentAmount"
                    type="number"
                    placeholder="Actualizar monto"
                    class="flex-1 rounded-lg border border-gray-200 px-3 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                  />
                  <button
                    @click="updateDonationGoal(index, goal.currentAmount)"
                    class="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-600 hover:bg-emerald-200 transition-colors"
                  >
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
            <p v-else class="text-gray-500 italic">No hay metas de recaudación activas.</p>
          </div>

          <!-- Add Donation Goal -->
          <div class="mt-8 rounded-xl border border-gray-200 p-4">
            <h3 class="font-semibold text-gray-900 mb-4">Crear nueva meta de recaudación</h3>
            <div class="space-y-4">
              <input
                v-model="newDonationGoal.title"
                type="text"
                placeholder="Título (ej: Comida para mascotas)"
                class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
              <textarea
                v-model="newDonationGoal.description"
                placeholder="Descripción (opcional)"
                rows="2"
                class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  v-model="newDonationGoal.targetAmount"
                  type="number"
                  placeholder="Monto objetivo"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
                <input
                  v-model="newDonationGoal.currency"
                  type="text"
                  placeholder="Moneda (ej: $, €, Bs)"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>
              <button
                @click="addDonationGoal"
                :disabled="!newDonationGoal.title || !newDonationGoal.targetAmount || addingDonationGoal"
                class="rounded-xl bg-emerald-600 px-6 py-2 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {{ addingDonationGoal ? 'Creando...' : 'Crear meta' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Reviews Tab -->
        <div v-if="activeTab === 'reviews'" class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Reseñas y Testimonios</h2>
          
          <!-- Add Review -->
          <div class="mb-6 rounded-xl border border-gray-200 p-4">
            <h3 class="font-semibold text-gray-900 mb-4">Agregar reseña (como administrador)</h3>
            <div class="space-y-4">
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">Calificación</label>
                <div class="flex gap-2">
                  <button
                    v-for="star in 5"
                    :key="star"
                    @click="newReview.rating = star"
                    :class="[
                      'h-10 w-10 rounded-lg transition-colors',
                      star <= newReview.rating ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-400'
                    ]"
                  >
                    <Icon name="ph:star-fill" class="h-6 w-6" />
                  </button>
                </div>
              </div>
              <textarea
                v-model="newReview.comment"
                placeholder="Comentario de la reseña"
                rows="3"
                class="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
              <button
                @click="addReview"
                :disabled="!newReview.comment || addingReview"
                class="rounded-xl bg-emerald-600 px-6 py-2 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {{ addingReview ? 'Agregando...' : 'Agregar reseña' }}
              </button>
            </div>
          </div>

          <!-- Current Reviews -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-4">Reseñas recibidas</h3>
            <div v-if="organization.reviews && organization.reviews.length > 0" class="space-y-4">
              <div
                v-for="(review, index) in organization.reviews"
                :key="index"
                class="rounded-lg border border-gray-200 p-4"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Icon name="ph:user" class="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ review.userName }}</p>
                      <div class="flex gap-1">
                        <Icon
                          v-for="star in 5"
                          :key="star"
                          name="ph:star-fill"
                          :class="['h-4 w-4', star <= review.rating ? 'text-amber-400' : 'text-gray-300']"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    @click="removeReview(index)"
                    class="rounded-lg bg-red-100 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-200 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
                <p class="text-gray-600">{{ review.comment }}</p>
                <p v-if="review.createdAt" class="text-xs text-gray-400 mt-2">{{ formatDate(review.createdAt) }}</p>
              </div>
            </div>
            <p v-else class="text-gray-500 italic">No hay reseñas aún.</p>
          </div>
        </div>

        <!-- News/Events Tab -->
        <div v-if="activeTab === 'news'" class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Noticias y Eventos</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <NuxtLink
              to="/admin/comunidad/nuevo-evento"
              class="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-6 text-gray-600 transition-colors hover:border-emerald-500 hover:text-emerald-600"
            >
              <Icon name="ph:calendar-plus" class="h-8 w-8" />
              <div class="text-left">
                <p class="font-semibold">Crear evento</p>
                <p class="text-sm">Publicar un nuevo evento</p>
              </div>
            </NuxtLink>
            <div
              class="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-6 text-gray-400"
            >
              <Icon name="ph:newspaper" class="h-8 w-8" />
              <div class="text-left">
                <p class="font-semibold">Crear noticia</p>
                <p class="text-sm">Próximamente</p>
              </div>
            </div>
          </div>

          <!-- Organization Events -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-4">Eventos de la organización</h3>
            <div v-if="organizationEvents.length > 0" class="space-y-4">
              <div
                v-for="event in organizationEvents"
                :key="event.id"
                class="rounded-lg border border-gray-200 p-4"
              >
                <div class="flex items-start gap-4">
                  <img v-if="event.imageUrl" :src="event.imageUrl" :alt="event.title" class="w-20 h-20 object-cover rounded-lg" />
                  <div class="flex-1">
                    <h4 class="font-bold text-gray-900">{{ event.title }}</h4>
                    <p class="text-sm text-gray-500">{{ formatDate(event.date) }}</p>
                    <p class="text-sm text-gray-600 mt-1">{{ event.location }}</p>
                  </div>
                  <NuxtLink
                    :to="`/comunidad/eventos/${event.id}`"
                    class="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-600 hover:bg-emerald-200 transition-colors"
                  >
                    Ver
                  </NuxtLink>
                </div>
              </div>
            </div>
            <p v-else class="text-gray-500 italic">No hay eventos publicados por la organización.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else-if="loading" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
      <p class="text-gray-600">Cargando organización...</p>
    </div>
  </div>

  <!-- Not Found State -->
  <div v-else class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center p-8">
      <Icon name="ph:warning-circle" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Organización no encontrada</h1>
      <p class="text-gray-600 mb-6">La organización que buscas no existe o ha sido eliminada.</p>
      <NuxtLink to="/" class="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
        Volver al inicio
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { OrganizationService } from '~/services/OrganizationService'
import { PetService } from '~/services/PetService'
import type { Organization, DonationLink } from '~/models/Organization'
import type { Pet } from '~/models/Pet'
import { useAuth } from '~/composables/useAuth'
import { useTablon, type TablonEvento } from '~/composables/useTablon'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const organizationService = new OrganizationService()
const petService = new PetService()
const { user } = useAuth()
const { fetchEventos } = useTablon()

const organization = ref<Organization | null>(null)
const loading = ref(true)
const activeTab = ref('dashboard')

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: 'ph:chart-bar' },
  { id: 'moderators', name: 'Moderadores', icon: 'ph:users' },
  { id: 'pets', name: 'Mascotas', icon: 'ph:paw-print' },
  { id: 'volunteers', name: 'Voluntarios', icon: 'ph:hand-heart' },
  { id: 'donations', name: 'Donaciones', icon: 'ph:heart' },
  { id: 'reviews', name: 'Reseñas', icon: 'ph:star' },
  { id: 'news', name: 'Noticias/Eventos', icon: 'ph:newspaper' },
]

// Moderators
const newModeratorEmail = ref('')
const addingModerator = ref(false)

// Pets
const petIdToLink = ref('')
const linkingPet = ref(false)
const organizationPets = ref<Pet[]>([])

// Donation Links
const newDonationLink = ref<Partial<DonationLink>>({
  name: '',
  url: '',
  description: '',
  active: true,
})
const addingDonationLink = ref(false)

// Events
const organizationEvents = ref<TablonEvento[]>([])

// Volunteers
const newVolunteer = ref({
  name: '',
  email: '',
  phone: '',
  skills: '',
  availability: '',
})
const addingVolunteer = ref(false)

// Reviews
const newReview = ref({
  rating: 5,
  comment: '',
})
const addingReview = ref(false)

// Donation Goals
const newDonationGoal = ref({
  title: '',
  description: '',
  targetAmount: 0,
  currency: '$',
})
const addingDonationGoal = ref(false)

const hasAccess = computed(() => {
  if (!user.value || !organization.value) return false
  return organization.value.ownerId === user.value.uid || 
         (organization.value.admins && organization.value.admins.includes(user.value.uid))
})

const averageRating = computed(() => {
  if (!organization.value?.reviews || organization.value.reviews.length === 0) return 0
  const total = organization.value.reviews.reduce((sum, review) => sum + review.rating, 0)
  return total / organization.value.reviews.length
})

onMounted(async () => {
  const slug = route.params.slug as string
  
  try {
    const org = await organizationService.getOrganizationBySlug(slug)
    organization.value = org
    
    if (org) {
      // Load organization pets
      await loadOrganizationPets(org.id!)
      
      // Load organization events
      await loadOrganizationEvents()
    }
  } catch (error) {
    console.error('Error al cargar organización:', error)
  } finally {
    loading.value = false
  }
})

async function loadOrganizationPets(orgId: string) {
  try {
    const allPets = await petService.getAllPets()
    // Filter pets that belong to this organization
    // This assumes pets have an organizationId field - we may need to add this
    organizationPets.value = allPets.filter(pet => (pet as any).organizationId === orgId)
  } catch (error) {
    console.error('Error al cargar mascotas:', error)
  }
}

async function loadOrganizationEvents() {
  try {
    const allEvents = await fetchEventos()
    // Filter events created by this organization's owner or admins
    if (organization.value) {
      const creatorIds = [organization.value.ownerId, ...(organization.value.admins || [])].filter(Boolean)
      organizationEvents.value = allEvents.filter(event => 
        creatorIds.includes(event.authorId)
      )
    }
  } catch (error) {
    console.error('Error al cargar eventos:', error)
  }
}

async function addModerator() {
  if (!newModeratorEmail.value || !organization.value?.id) return
  
  addingModerator.value = true
  try {
    // Here you would need to find the user ID by email
    // For now, we'll use the email as a placeholder
    // In production, you'd need a UserService to get user by email
    const admins = organization.value.admins || []
    if (!admins.includes(newModeratorEmail.value)) {
      admins.push(newModeratorEmail.value)
      await organizationService.updateOrganization(organization.value.id, { admins })
      organization.value.admins = admins
      newModeratorEmail.value = ''
    }
  } catch (error) {
    console.error('Error al agregar moderador:', error)
    alert('Error al agregar moderador')
  } finally {
    addingModerator.value = false
  }
}

async function removeModerator(adminId: string) {
  if (!organization.value?.id) return
  
  try {
    const admins = (organization.value.admins || []).filter(id => id !== adminId)
    await organizationService.updateOrganization(organization.value.id, { admins })
    organization.value.admins = admins
  } catch (error) {
    console.error('Error al remover moderador:', error)
    alert('Error al remover moderador')
  }
}

async function linkPet() {
  if (!petIdToLink.value || !organization.value?.id) return
  
  linkingPet.value = true
  try {
    // Update the pet to add organizationId
    await petService.updatePet(petIdToLink.value, { organizationId: organization.value.id } as any)
    await loadOrganizationPets(organization.value.id)
    petIdToLink.value = ''
  } catch (error) {
    console.error('Error al vincular mascota:', error)
    alert('Error al vincular mascota')
  } finally {
    linkingPet.value = false
  }
}

async function unlinkPet(petId: string) {
  if (!organization.value?.id) return
  
  try {
    await petService.updatePet(petId, { organizationId: null } as any)
    await loadOrganizationPets(organization.value.id)
  } catch (error) {
    console.error('Error al desvincular mascota:', error)
    alert('Error al desvincular mascota')
  }
}

async function addDonationLink() {
  if (!newDonationLink.value.name || !newDonationLink.value.url || !organization.value?.id) return
  
  addingDonationLink.value = true
  try {
    const donationLinks = organization.value.donationLinks || []
    donationLinks.push({
      ...newDonationLink.value,
      id: Date.now().toString(),
      active: true,
    } as DonationLink)
    await organizationService.updateOrganization(organization.value.id, { donationLinks })
    organization.value.donationLinks = donationLinks
    newDonationLink.value = { name: '', url: '', description: '', active: true }
  } catch (error) {
    console.error('Error al agregar link de donación:', error)
    alert('Error al agregar link de donación')
  } finally {
    addingDonationLink.value = false
  }
}

async function toggleDonationLink(index: number) {
  if (!organization.value?.id || !organization.value.donationLinks) return
  
  try {
    const donationLinks = [...organization.value.donationLinks]
    if (donationLinks[index]) {
      donationLinks[index].active = !donationLinks[index].active
    }
    await organizationService.updateOrganization(organization.value.id, { donationLinks })
    organization.value.donationLinks = donationLinks
  } catch (error) {
    console.error('Error al actualizar link de donación:', error)
    alert('Error al actualizar link de donación')
  }
}

async function removeDonationLink(index: number) {
  if (!organization.value?.id || !organization.value.donationLinks) return
  
  try {
    const donationLinks = organization.value.donationLinks.filter((_, i) => i !== index)
    await organizationService.updateOrganization(organization.value.id, { donationLinks })
    organization.value.donationLinks = donationLinks
  } catch (error) {
    console.error('Error al eliminar link de donación:', error)
    alert('Error al eliminar link de donación')
  }
}

function formatDate(date: number) {
  return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es })
}

async function addVolunteer() {
  if (!newVolunteer.value.name || !newVolunteer.value.email || !organization.value?.id) return
  
  addingVolunteer.value = true
  try {
    const volunteers = organization.value.volunteers || []
    volunteers.push({
      ...newVolunteer.value,
      id: Date.now().toString(),
      userId: Date.now().toString(), // Temporary - should be actual user ID
      skills: newVolunteer.value.skills.split(',').map(s => s.trim()).filter(Boolean),
      status: 'pending',
      joinedAt: Date.now(),
    })
    await organizationService.updateOrganization(organization.value.id, { volunteers })
    organization.value.volunteers = volunteers
    newVolunteer.value = { name: '', email: '', phone: '', skills: '', availability: '' }
  } catch (error) {
    console.error('Error al agregar voluntario:', error)
    alert('Error al agregar voluntario')
  } finally {
    addingVolunteer.value = false
  }
}

async function removeVolunteer(index: number) {
  if (!organization.value?.id || !organization.value.volunteers) return
  
  try {
    const volunteers = organization.value.volunteers.filter((_, i) => i !== index)
    await organizationService.updateOrganization(organization.value.id, { volunteers })
    organization.value.volunteers = volunteers
  } catch (error) {
    console.error('Error al remover voluntario:', error)
    alert('Error al remover voluntario')
  }
}

async function addDonationGoal() {
  if (!newDonationGoal.value.title || !newDonationGoal.value.targetAmount || !organization.value?.id) return
  
  addingDonationGoal.value = true
  try {
    const donationGoals = organization.value.donationGoals || []
    donationGoals.push({
      ...newDonationGoal.value,
      id: Date.now().toString(),
      currentAmount: 0,
      active: true,
      createdAt: Date.now(),
    })
    await organizationService.updateOrganization(organization.value.id, { donationGoals })
    organization.value.donationGoals = donationGoals
    newDonationGoal.value = { title: '', description: '', targetAmount: 0, currency: '$' }
  } catch (error) {
    console.error('Error al agregar meta de donación:', error)
    alert('Error al agregar meta de donación')
  } finally {
    addingDonationGoal.value = false
  }
}

async function updateDonationGoal(index: number, newAmount: number) {
  if (!organization.value?.id || !organization.value.donationGoals) return
  
  try {
    const donationGoals = [...organization.value.donationGoals]
    donationGoals[index].currentAmount = newAmount
    await organizationService.updateOrganization(organization.value.id, { donationGoals })
    organization.value.donationGoals = donationGoals
  } catch (error) {
    console.error('Error al actualizar meta de donación:', error)
    alert('Error al actualizar meta de donación')
  }
}

async function removeDonationGoal(index: number) {
  if (!organization.value?.id || !organization.value.donationGoals) return
  
  try {
    const donationGoals = organization.value.donationGoals.filter((_, i) => i !== index)
    await organizationService.updateOrganization(organization.value.id, { donationGoals })
    organization.value.donationGoals = donationGoals
  } catch (error) {
    console.error('Error al eliminar meta de donación:', error)
    alert('Error al eliminar meta de donación')
  }
}

async function addReview() {
  if (!newReview.value.comment || !user.value || !organization.value?.id) return
  
  addingReview.value = true
  try {
    const reviews = organization.value.reviews || []
    reviews.push({
      id: Date.now().toString(),
      userId: user.value.uid,
      userName: user.value.displayName || 'Administrador',
      rating: newReview.value.rating,
      comment: newReview.value.comment,
      createdAt: Date.now(),
    })
    await organizationService.updateOrganization(organization.value.id, { reviews })
    organization.value.reviews = reviews
    newReview.value = { rating: 5, comment: '' }
  } catch (error) {
    console.error('Error al agregar reseña:', error)
    alert('Error al agregar reseña')
  } finally {
    addingReview.value = false
  }
}

async function removeReview(index: number) {
  if (!organization.value?.id || !organization.value.reviews) return
  
  try {
    const reviews = organization.value.reviews.filter((_, i) => i !== index)
    await organizationService.updateOrganization(organization.value.id, { reviews })
    organization.value.reviews = reviews
  } catch (error) {
    console.error('Error al eliminar reseña:', error)
    alert('Error al eliminar reseña')
  }
}

useHead({
  title: computed(() => organization.value ? `Gestionar ${organization.value.name} | Adopta Zulia` : 'Gestionar Organización | Adopta Zulia'),
})
</script>

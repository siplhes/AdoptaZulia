<template>
  <div class="min-h-screen bg-amber-50 pb-24 pt-6 md:pb-12">
    <div class="container mx-auto max-w-6xl px-4">
      <!-- Back Navigation -->
      <button
        class="mb-6 inline-flex items-center font-medium text-emerald-600 transition-colors hover:text-emerald-700"
        @click="goBack"
      >
        <Icon name="heroicons:arrow-left" class="mr-1 h-5 w-5" />
        <span>Volver</span>
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="flex h-64 items-center justify-center">
        <div
          class="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"
        />
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="mb-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 shadow-sm"
      >
        <div class="flex">
          <Icon name="heroicons:exclamation-triangle" class="mr-3 h-6 w-6 text-red-500" />
          <p class="font-medium text-red-700">{{ error }}</p>
        </div>
      </div>

      <!-- Not Found -->
      <div
        v-else-if="!pet"
        class="mb-6 rounded-xl border-l-4 border-yellow-500 bg-yellow-50 p-4 shadow-sm"
      >
        <div class="flex">
          <Icon name="heroicons:exclamation-triangle" class="mr-3 h-6 w-6 text-yellow-500" />
          <p class="font-medium text-yellow-700">No se ha encontrado la mascota</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Left Column: Gallery & Details -->
        <div class="space-y-8 lg:col-span-2">
          <!-- Mobile Gallery (Swipeable) -->
          <div class="-mx-4 lg:hidden">
            <div class="scrollbar-hide flex snap-x snap-mandatory gap-1 overflow-x-auto px-4 pb-4">
              <div
                v-for="(photo, index) in pet.photos && pet.photos.length > 0
                  ? pet.photos
                  : []"
                :key="index"
                class="relative h-80 w-[90vw] shrink-0 snap-center overflow-hidden rounded-2xl shadow-sm"
              >
                <NuxtImg
                  :src="photo"
                  :alt="pet.name"
                  class="h-full w-full object-cover"
                  @click="openImageModal(photo)"
                />
                <span
                  class="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm"
                >
                  {{ index + 1 }} /
                  {{ pet.photos && pet.photos.length > 0 ? pet.photos.length : 0 }}
                </span>
              </div>
            </div>
          </div>

          <!-- Desktop Gallery -->
          <div
            class="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-sm lg:block"
          >
            <div
              class="group relative mb-2 h-[500px] w-full cursor-zoom-in overflow-hidden rounded-xl"
              @click="openImageModal(currentPhoto || (pet.photos && pet.photos[0]))"
            >
              <NuxtImg
                :src="currentPhoto || (pet.photos && pet.photos[0])"
                :alt="pet.name"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                class="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/10 group-hover:opacity-100"
              >
                <Icon
                  name="heroicons:magnifying-glass-plus"
                  class="h-12 w-12 text-white drop-shadow-lg"
                />
              </div>
            </div>
            <div
              v-if="pet.photos && pet.photos.length > 1"
              class="grid grid-cols-6 gap-2 px-1 pb-1"
            >
              <button
                v-for="(photo, index) in pet.photos"
                :key="index"
                class="h-20 overflow-hidden rounded-lg border-2 transition-all"
                :class="
                  currentPhoto === photo
                    ? 'border-emerald-500 ring-2 ring-emerald-200'
                    : 'border-transparent hover:border-gray-200'
                "
                @click="currentPhoto = photo"
              >
                <NuxtImg :src="photo" class="h-full w-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Header Info (Mobile & Desktop) -->
          <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div class="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 class="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">{{ pet.name }}</h1>
                <div class="flex items-center text-sm text-gray-500 md:text-base">
                  <Icon name="heroicons:map-pin" class="mr-1 h-5 w-5 text-emerald-600" />
                  <span class="mr-4">{{ pet.location }}</span>
                  <Icon name="heroicons:calendar" class="mr-1 h-5 w-5 text-emerald-600" />
                  <span>{{ formatDate(pet.createdAt) }}</span>
                </div>
              </div>

              <div class="flex gap-2">
                <span
                  v-if="pet.urgent"
                  class="flex animate-pulse items-center rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700"
                >
                  <Icon name="heroicons:exclamation-triangle" class="mr-1 h-4 w-4" />
                  Urgente
                </span>
                <span
                  class="flex items-center rounded-full px-3 py-1 text-sm font-bold"
                  :class="
                    pet.gender === 'macho'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-pink-100 text-pink-700'
                  "
                >
                  <Icon
                    :name="pet.gender === 'macho' ? 'mdi:gender-male' : 'mdi:gender-female'"
                    class="mr-1 h-4 w-4"
                  />
                  {{ pet.gender === 'macho' ? 'Macho' : 'Hembra' }}
                </span>
              </div>
            </div>

            <!-- Attributes Grid -->
            <div
              class="grid grid-cols-2 gap-4 border-b border-t border-gray-100 py-6 md:grid-cols-4"
            >
              <div class="rounded-xl bg-amber-50/50 p-3 text-center">
                <span class="mb-1 block text-xs uppercase tracking-wider text-gray-500">
                  Especie
                </span>
                <span class="font-bold text-gray-900">{{ formatType(pet.type) }}</span>
              </div>
              <div class="rounded-xl bg-amber-50/50 p-3 text-center">
                <span class="mb-1 block text-xs uppercase tracking-wider text-gray-500">Raza</span>
                <span class="font-bold text-gray-900">{{ pet.breed || 'Mestizo' }}</span>
              </div>
              <div class="rounded-xl bg-amber-50/50 p-3 text-center">
                <span class="mb-1 block text-xs uppercase tracking-wider text-gray-500">Edad</span>
                <span class="font-bold text-gray-900">{{ pet.age }}</span>
              </div>
              <div class="rounded-xl bg-amber-50/50 p-3 text-center">
                <span class="mb-1 block text-xs uppercase tracking-wider text-gray-500">
                  Tamaño
                </span>
                <span class="font-bold text-gray-900">{{ formatSize(pet.size) }}</span>
              </div>
            </div>

            <!-- Description -->
            <div class="mt-8">
              <h2 class="mb-4 flex items-center text-xl font-bold text-gray-900">
                <Icon name="heroicons:sparkles" class="mr-2 h-6 w-6 text-emerald-500" />
                Conoce a {{ pet.name }}
              </h2>
              <p class="whitespace-pre-line leading-relaxed text-gray-700">{{ pet.description }}</p>
            </div>

            <!-- Health -->
            <div v-if="pet.healthDescription || pet.healthStatus" class="mt-8">
              <h2 class="mb-4 flex items-center text-xl font-bold text-gray-900">
                <Icon name="heroicons:heart" class="mr-2 h-6 w-6 text-rose-500" />
                Salud
              </h2>

              <div v-if="pet.healthStatus" class="mb-4">
                <div class="mb-1 flex justify-between text-sm font-medium">
                  <span>Estado General</span>
                  <span :class="getHealthColorText(pet.healthStatus)">
                    {{ getHealthLabel(pet.healthStatus) }}
                  </span>
                </div>
                <div class="h-2.5 w-full rounded-full bg-gray-100">
                  <div
                    class="h-2.5 rounded-full transition-all duration-1000"
                    :class="getHealthColor(pet.healthStatus)"
                    :style="{ width: `${pet.healthStatus}%` }"
                  />
                </div>
              </div>

              <p class="rounded-xl border border-rose-100 bg-rose-50 p-4 text-gray-700">
                {{ pet.healthDescription }}
              </p>

              <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div class="flex items-center rounded-lg bg-gray-50 p-3">
                  <Icon
                    :name="pet.vaccinated ? 'heroicons:check-circle' : 'heroicons:x-circle'"
                    class="mr-3 h-5 w-5"
                    :class="pet.vaccinated ? 'text-green-500' : 'text-gray-400'"
                  />
                  <div>
                    <span class="block text-sm font-medium text-gray-900">Vacunado</span>
                    <span v-if="pet.vaccineInfo" class="text-xs text-gray-500">
                      {{ pet.vaccineInfo }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center rounded-lg bg-gray-50 p-3">
                  <Icon
                    :name="pet.neutered ? 'heroicons:check-circle' : 'heroicons:x-circle'"
                    class="mr-3 h-5 w-5"
                    :class="pet.neutered ? 'text-green-500' : 'text-gray-400'"
                  />
                  <div>
                    <span class="block text-sm font-medium text-gray-900">Esterilizado</span>
                    <span v-if="pet.neuterDate" class="text-xs text-gray-500">
                      {{ pet.neuterDate }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Adoption Requirements (Desktop View mainly, but inline for all) -->
            <div v-if="hasAdoptionRequirements" class="mt-8 border-t border-gray-100 pt-8">
              <h2 class="mb-4 flex items-center text-xl font-bold text-gray-900">
                <Icon
                  name="heroicons:clipboard-document-check"
                  class="mr-2 h-6 w-6 text-amber-500"
                />
                Requisitos
              </h2>
              <ul class="space-y-3">
                <li v-if="pet.adoptionRequirements" class="flex items-start">
                  <Icon name="heroicons:check" class="mr-2 mt-0.5 h-5 w-5 text-emerald-500" />
                  <span class="text-gray-700">{{ pet.adoptionRequirements }}</span>
                </li>
                <li v-if="pet.requiresContract" class="flex items-center">
                  <Icon name="heroicons:document-text" class="mr-2 h-5 w-5 text-gray-400" />
                  <span class="text-gray-700">Contrato de adopción requerido</span>
                </li>
                <li v-if="pet.adoptionFee && pet.adoptionFee > 0" class="flex items-center">
                  <Icon name="heroicons:currency-dollar" class="mr-2 h-5 w-5 text-gray-400" />
                  <span class="text-gray-700">
                    Tasa de adopción:
                    <strong>${{ pet.adoptionFee }}</strong>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Right Column: Actions & Status (Sticky on Desktop) -->
        <div class="lg:col-span-1">
          <div class="sticky top-6 space-y-6">
            <!-- Adoption Status Card -->
            <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
              <div class="mb-6 text-center">
                <div
                  v-if="pet.status === 'adopted'"
                  class="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                >
                  <Icon name="heroicons:home" class="h-8 w-8" />
                </div>
                <div
                  v-else
                  class="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600"
                >
                  <Icon name="heroicons:heart" class="h-8 w-8" />
                </div>

                <h3 class="text-xl font-bold text-gray-900">
                  {{
                    pet.status === 'adopted'
                      ? '¡Adoptado!'
                      : pet.urgent
                        ? 'Adopción Urgente'
                        : 'En Adopción'
                  }}
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  {{
                    pet.status === 'adopted'
                      ? 'Esta mascota ya tiene un hogar feliz.'
                      : '¿Te gustaría darle un hogar?'
                  }}
                </p>
              </div>

              <!-- Application Status Block -->
              <div
                v-if="hasApplied"
                class="mb-6 rounded-xl border-l-4 p-4"
                :class="{
                  'border-yellow-400 bg-yellow-50': adoptionStatus === 'pending',
                  'border-emerald-500 bg-emerald-50': adoptionStatus === 'approved',
                  'border-red-500 bg-red-50': adoptionStatus === 'rejected',
                }"
              >
                <h4
                  class="mb-1 text-sm font-bold"
                  :class="{
                    'text-yellow-800': adoptionStatus === 'pending',
                    'text-emerald-800': adoptionStatus === 'approved',
                    'text-red-800': adoptionStatus === 'rejected',
                  }"
                >
                  {{
                    adoptionStatus === 'pending'
                      ? 'Solicitud en Revisión'
                      : adoptionStatus === 'approved'
                        ? 'Solicitud Aprobada'
                        : 'Solicitud Rechazada'
                  }}
                </h4>
                <p class="text-xs text-gray-600">
                  {{
                    adoptionStatus === 'pending'
                      ? 'El dueño está revisando tu perfil.'
                      : adoptionStatus === 'approved'
                        ? '¡Contacta al dueño para coordinar!'
                        : 'Lo sentimos, no fue aceptada.'
                  }}
                </p>
              </div>

              <!-- Desktop Actions -->
              <div class="hidden flex-col gap-3 lg:flex">
                <template v-if="!isOwner">
                  <button
                    v-if="canAdopt && !hasApplied && pet.status !== 'adopted'"
                    class="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-200 transition-transform hover:bg-emerald-700 active:scale-95"
                    @click="openAdoptionModal"
                  >
                    Solicitar Adopción
                  </button>

                  <template v-if="adoptionStatus === 'approved'">
                    <button
                      class="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 font-bold text-white hover:bg-green-600"
                      @click="contactWhatsapp"
                    >
                      <Icon name="heroicons:chat-bubble-oval-left" class="h-5 w-5" />
                      WhatsApp
                    </button>
                    <button
                      class="w-full rounded-xl border-2 border-emerald-600 bg-white py-3 font-bold text-emerald-700 hover:bg-emerald-50"
                      @click="contactOwner"
                    >
                      Ver Contacto
                    </button>
                  </template>
                </template>

                <!-- Owner Actions -->
                <template v-if="isOwner">
                  <NuxtLink
                    to="/mis-publicaciones"
                    class="w-full rounded-xl bg-emerald-100 py-3 text-center font-semibold text-emerald-800 hover:bg-emerald-200"
                  >
                    Gestionar mis posts
                  </NuxtLink>

                  <!-- Hide actions for test pets UNLESS admin (owner) -->
                  <!-- Since 'isOwner' is true for 'adoptazulia' user (admin), we can show the buttons but kept the strict check before -->
                  <!-- Now we allow interaction for testing flow -->
                  <div v-if="!pet.isTest || isOwner" class="grid grid-cols-2 gap-2">
                    <button
                      class="rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                      @click="editPet"
                    >
                      Editar
                    </button>
                    <button
                      class="rounded-lg bg-red-50 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                      @click="deletePet"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div
                    v-if="pet.isTest"
                    class="mt-2 rounded-lg border border-amber-100 bg-amber-50 p-2 text-center text-xs text-amber-700"
                  >
                    🧪 Mascota de Prueba (Modo Debug)
                  </div>
                </template>

                <div class="flex flex-col gap-3 border-t border-gray-100 pt-4">
                  <!-- Generate Poster Button -->
                  <button
                    v-if="imageGenerationEnabled"
                    class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-500 py-3 font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="generatingImage"
                    @click="generatePoster"
                  >
                    <template v-if="generatingImage">
                      <Icon name="heroicons:arrow-path" class="h-5 w-5 animate-spin" />
                      Generando {{ imageProgress }}%
                    </template>
                    <template v-else>
                      <Icon name="heroicons:sparkles" class="h-5 w-5" />
                      Generar Poster
                    </template>
                  </button>

                  <!-- Favorite and Share -->
                  <div class="flex gap-2">
                    <button
                      class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 transition-colors hover:bg-gray-50"
                      :class="
                        isFavorite ? 'border-red-100 bg-red-50 text-red-500' : 'text-gray-500'
                      "
                      @click="toggleFavorite"
                    >
                      <Icon
                        :name="isFavorite ? 'heroicons:heart-solid' : 'heroicons:heart'"
                        class="h-5 w-5"
                      />
                      {{ isFavorite ? 'Favorito' : 'Guardar' }}
                    </button>
                    <button
                      class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-gray-500 transition-colors hover:bg-gray-50"
                      @click="sharePet"
                    >
                      <Icon name="heroicons:share" class="h-5 w-5" />
                      Compartir
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Info Card (Desktop Sticky) -->
            <div
              v-if="shouldShowContact"
              class="hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:block"
            >
              <h3 class="mb-4 flex items-center font-bold text-gray-900">
                <Icon name="heroicons:user-circle" class="mr-2 h-5 w-5 text-emerald-600" />
                Contacto
              </h3>
              <div class="space-y-4">
                <div class="flex items-center rounded-xl bg-gray-50 p-3">
                  <div
                    class="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600"
                  >
                    {{ pet.contact.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-900">{{ pet.contact.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatContactType(pet.contact.type) }}</p>
                  </div>
                </div>
                <div class="space-y-2">
                  <a
                    :href="`tel:${pet.contact.phone}`"
                    class="flex items-center text-sm text-gray-600 hover:text-emerald-600"
                  >
                    <Icon name="heroicons:phone" class="mr-3 h-4 w-4 text-gray-400" />
                    {{ pet.contact.phone }}
                  </a>
                  <a
                    :href="`mailto:${pet.contact.email}`"
                    class="flex items-center text-sm text-gray-600 hover:text-emerald-600"
                  >
                    <Icon name="heroicons:envelope" class="mr-3 h-4 w-4 text-gray-400" />
                    {{ pet.contact.email }}
                  </a>
                </div>
              </div>
            </div>

            <!-- Owner Dashboard (Desktop) -->
            <div
              v-if="isOwner && ownerAdoptions.length > 0"
              class="hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:block"
            >
              <h3 class="mb-4 font-bold text-gray-900">Solicitudes ({{ ownerAdoptionCount }})</h3>
              <button
                class="w-full rounded-lg bg-blue-50 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                @click="viewAdoptionRequests"
              >
                Ver todas las solicitudes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Sticky Action Bar -->
    <div
      class="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-gray-200 bg-white bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden"
    >
      <button
        class="rounded-full bg-gray-100 p-3 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500"
        @click="toggleFavorite"
      >
        <Icon
          :name="isFavorite ? 'heroicons:heart-solid' : 'heroicons:heart'"
          class="h-6 w-6"
          :class="{ 'text-red-500': isFavorite }"
        />
      </button>

      <template v-if="!isOwner">
        <button
          v-if="canAdopt && !hasApplied && pet?.status !== 'adopted'"
          class="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200"
          @click="openAdoptionModal"
        >
          Solicitar Adopción
        </button>
        <button
          v-else-if="adoptionStatus === 'approved'"
          class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-bold text-white shadow-lg shadow-green-200"
          @click="contactWhatsapp"
        >
          <Icon name="heroicons:chat-bubble-oval-left" class="h-5 w-5" />
          Contactar WhatsApp
        </button>
        <button
          v-else-if="pet?.status === 'adopted'"
          disabled
          class="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-400"
        >
          Ya Adoptado
        </button>
        <button
          v-else
          class="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200"
          @click="viewUserAdoption"
        >
          Ver Mi Solicitud
        </button>
      </template>

      <template v-if="isOwner">
        <button
          class="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white"
          @click="viewAdoptionRequests"
        >
          Solicitudes ({{ ownerAdoptionCount }})
        </button>
      </template>
    </div>

    <!-- Modals (Image, Adoption, etc.) - Preserving existing functionality -->
    <!-- Adoption Modal -->
    <div
      v-if="showAdoptionModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all"
      >
        <div class="flex items-center justify-between bg-emerald-600 px-6 py-4">
          <h3 class="flex items-center text-lg font-bold text-white">
            <Icon name="heroicons:home-modern" class="mr-2 h-6 w-6" />
            Solicitar Adopción
          </h3>
          <button
            class="text-white/80 transition-colors hover:text-white"
            @click="closeAdoptionModal"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>

        <div class="p-6">
          <div
            class="mb-4 flex items-start rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <Icon name="heroicons:information-circle" class="mr-2 mt-0.5 h-5 w-5 flex-shrink-0" />
            <p>
              Estás enviando una solicitud para adoptar a
              <strong>{{ pet.name }}</strong>
              . El dueño recibirá tu perfil y contactará contigo si es compatible.
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                Mensaje para el dueño
              </label>
              <textarea
                v-model="adoptionMessage"
                rows="4"
                class="w-full rounded-xl border-gray-300 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Cuéntale por qué quieres adoptar a esta mascota, tu experiencia previa, dónde vivirá, etc."
              />
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              class="rounded-xl border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              @click="closeAdoptionModal"
            >
              Cancelar
            </button>
            <button
              class="flex items-center rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white shadow-lg shadow-emerald-200 transition-transform hover:bg-emerald-700 active:scale-95"
              @click="submitAdoption"
            >
              <Icon name="heroicons:paper-airplane" class="mr-2 h-5 w-5" />
              Enviar Solicitud
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      @click="closeImageModal"
    >
      <button
        class="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <Icon name="heroicons:x-mark" class="h-6 w-6" />
      </button>
      <img
        :src="modalImage"
        class="max-h-[85vh] max-w-full rounded-lg object-contain"
        @click.stop
      />
    </div>
    <!-- Share Modal -->
    <ShareModal
      v-model:isOpen="showShareModal"
      title="Compartir Mascota"
      :description="`Ayuda a ${pet?.name} a encontrar un hogar.`"
      :shareData="{
        title: `Adopta a ${pet?.name}`,
        text: `Conoce a ${pet?.name}, busca un hogar en ${pet?.location}.`,
        url: shareUrl
      }"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdoptions } from '~/composables/useAdoptions'
import { formatShortDate } from '~/utils/dateFormatter'
import ShareModal from '~/components/common/ShareModal.vue'

// Props & Route
const route = useRoute()
const router = useRouter()
const petId = route.params.id

// Composables
const { fetchPetById, isPetFavorite, addFavorite, removeFavorite } = usePets()
const { getAdoptionByPetAndUser, fetchAdoptionsForOwner, createAdoptionRequest } = useAdoptions()
const { user, isAuthenticated, isAdmin } = useAuth()
const { isFeatureEnabled } = useFeatures()
const {
  generatePetImage,
  generating: generatingImage,
  progress: imageProgress,
  isEnabled: imageGenEnabled,
} = useImageGen2()

// State
const pet = ref(null)
const loading = ref(true)
const error = ref(null)
const currentPhoto = ref(null)
const showImageModal = ref(false)
const modalImage = ref('')
const adoptionStatus = ref(null) // 'pending', 'approved', 'rejected', 'none'
const isFavorite = ref(false)
const ownerAdoptions = ref([])
const loadingOwnerAdoptions = ref(false)
const showAdoptionModal = ref(false)
const adoptionMessage = ref('')
const showShareModal = ref(false)
const shareUrl = ref('')

// Features
const favoritesEnabled = isFeatureEnabled('favorites')
const adoptionEnabled = isFeatureEnabled('adoption')
const imageGenerationEnabled = computed(
  () => isFeatureEnabled('imageGeneration') || imageGenEnabled.value
)

function sharePet() {
  shareUrl.value = window.location.href
  showShareModal.value = true
}

// Computed
const isOwner = computed(() => {
  return (
    isAuthenticated.value &&
    user.value &&
    pet.value &&
    (pet.value.userId === user.value.uid || isAdmin.value)
  )
})

const canAdopt = computed(() => {
  return isAuthenticated.value && !isOwner.value && adoptionEnabled
})

const hasApplied = computed(() => {
  return adoptionStatus.value && adoptionStatus.value !== 'none'
})

const shouldShowContact = computed(() => {
  return (
    isOwner.value || pet.value?.status === 'adopted' || adoptionStatus.value === 'approved' // Removed pending per typical privacy rules
  )
})

const hasAdoptionRequirements = computed(() => {
  return (
    pet.value &&
    (pet.value.adoptionRequirements || pet.value.requiresContract || pet.value.adoptionFee > 0)
  )
})

const ownerAdoptionCount = computed(() => ownerAdoptions.value.length)

// SEO Meta Tags
useSeoMeta({
  title: computed(() =>
    pet.value
      ? `${pet.value.name} en adopción | Adopta Zulia`
      : 'Mascota en adopción | Adopta Zulia'
  ),
  description: computed(() =>
    pet.value
      ? `Conoce a ${pet.value.name}, un ${pet.value.type} de raza ${pet.value.breed || 'mestiza'} que busca hogar en ${pet.value.location}. ${pet.value.description?.substring(0, 100)}...`
      : 'Detalles de mascota en adopción'
  ),
  ogTitle: computed(() =>
    pet.value ? `Adopta a ${pet.value.name} - Adopta Zulia` : 'Mascota en adopción'
  ),
  ogDescription: computed(() =>
    pet.value
      ? `Ayuda a ${pet.value.name} a encontrar un hogar. ${pet.value.description?.substring(0, 100)}...`
      : 'Ayuda a esta mascota a encontrar un hogar'
  ),
  ogImage: computed(() => useOgImage(pet.value?.image || pet.value?.photos?.[0])),
  ogUrl: computed(() => useCanonicalUrl(`/mascotas/${petId}`)),
  twitterTitle: computed(() => (pet.value ? `Adopta a ${pet.value.name}` : 'Mascota en adopción')),
  twitterDescription: computed(() =>
    pet.value ? `${pet.value.name} busca un hogar en ${pet.value.location}.` : 'Mascota busca hogar'
  ),
  twitterImage: computed(() => useOgImage(pet.value?.image || pet.value?.photos?.[0])),
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: computed(() => useCanonicalUrl(`/mascotas/${petId}`)),
    },
  ],
  script: [
    // Structured Data for the Pet
    computed(() => {
      if (!pet.value) return {}
      return useStructuredData({
        '@context': 'https://schema.org',
        '@type': 'Product', // Often used for pets/products but waiting for a better Schema
        name: pet.value.name,
        image: pet.value.image ? [useOgImage(pet.value.image)] : [],
        description: pet.value.description,
        category: pet.value.type,
        offers: {
          '@type': 'Offer',
          price: pet.value.adoptionFee || 0,
          priceCurrency: 'USD',
          availability:
            pet.value.status === 'adopted'
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
        },
      })
    }),
    useStructuredData(
      createBreadcrumbSchema([
        { name: 'Inicio', url: useCanonicalUrl('/') },
        { name: 'Mascotas', url: useCanonicalUrl('/mascotas') },
        { name: pet.value?.name || 'Detalle', url: useCanonicalUrl(`/mascotas/${petId}`) },
      ])
    ),
  ],
})

// Life Cycle
onMounted(async () => {
  try {
    const fetchedPet = await fetchPetById(petId)
    if (!fetchedPet) {
      error.value = 'Mascota no encontrada'
      return
    }
    pet.value = fetchedPet

    // Check favorite
    if (isAuthenticated.value) {
      isFavorite.value = await isPetFavorite(petId, user.value.uid)

      // Check application status
      if (!isOwner.value) {
        const adoption = await getAdoptionByPetAndUser(petId, user.value.uid)
        adoptionStatus.value = adoption ? adoption.status : 'none'
      } else {
        // Load owner adoptions
        loadingOwnerAdoptions.value = true
        ownerAdoptions.value = await fetchAdoptionsForOwner(user.value.uid)
        // Filter specifically for this pet if the API returns all
        ownerAdoptions.value = ownerAdoptions.value.filter((a) => a.petId === petId)
        loadingOwnerAdoptions.value = false
      }
    }
  } catch (e) {
    console.error(e)
    error.value = 'Error cargando la mascota: ' + e.message
  } finally {
    loading.value = false
  }
})

// Actions & Helpers
const goBack = () => router.back()
const openImageModal = (img) => {
  modalImage.value = img
  showImageModal.value = true
}
const closeImageModal = () => (showImageModal.value = false)

const formatDate = (ts) => formatShortDate(ts)
const formatType = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : '')
const formatSize = (s) => s // Map if needed
const getHealthLabel = (val) => {
  if (val > 80) return 'Excelente'
  if (val > 50) return 'Bueno'
  return 'Requiere Atención'
}
const getHealthColor = (val) => {
  if (val > 80) return 'bg-green-500'
  if (val > 50) return 'bg-yellow-500'
  return 'bg-red-500'
}
const getHealthColorText = (val) => {
  if (val > 80) return 'text-green-600'
  if (val > 50) return 'text-yellow-600'
  return 'text-red-600'
}
const formatContactType = (t) => (t === 'organization' ? 'Organización / Refugio' : 'Particular')

// Action Buttons
const openAdoptionModal = () => {
  if (!isAuthenticated.value) {
    router.push('/login?redirect=' + route.fullPath)
    return
  }
  showAdoptionModal.value = true
}

const closeAdoptionModal = () => {
  showAdoptionModal.value = false
  adoptionMessage.value = ''
}

const submitAdoption = async () => {
  if (!adoptionMessage.value.trim()) {
    alert('Por favor escribe un mensaje para el dueño')
    return
  }

  try {
    const success = await createAdoptionRequest(petId, user.value.uid, adoptionMessage.value)
    if (success) {
      adoptionStatus.value = 'pending'
      closeAdoptionModal()
      // Show success toast or alert
      alert('¡Solicitud enviada con éxito!')
    }
  } catch (e) {
    console.error(e)
    alert('Error al enviar la solicitud')
  }
}

const toggleFavorite = async () => {
  if (!isAuthenticated.value) return router.push('/login')

  try {
    if (isFavorite.value) {
      await removeFavorite(petId, user.value.uid)
      isFavorite.value = false
    } else {
      await addFavorite(petId, user.value.uid)
      isFavorite.value = true
    }
  } catch (e) {
    console.error(e)
  }
}



const generatePoster = async () => {
  if (!pet.value) return

  try {
    const imageUrl = pet.value.photos?.[0] || pet.value.image
    await generatePetImage(pet.value.name, imageUrl, petId, { autoDownload: true })
  } catch (e) {
    console.error('Error generating poster:', e)
    alert('Error al generar la imagen. Por favor, intenta de nuevo.')
  }
}

const contactWhatsapp = () => {
  const phone = pet.value.contact.phone.replace(/\D/g, '')
  const text = `Hola, estoy interesado en adoptar a ${pet.value.name} que vi en AdoptaZulia.`
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
}

const contactOwner = () => {
  // Logic to reveal contact or scroll to section
  const contactSection =
    document.querySelector('.sticky') || document.querySelector('.lg\\:col-span-1')
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const viewUserAdoption = () => {
  // View my application
  // Logic to find adoption ID and navigate?
  // For now we assume we just show status
  alert(
    'Ya has enviado una solicitud. Estado: ' +
      (adoptionStatus.value === 'pending' ? 'Pendiente' : adoptionStatus.value)
  )
}

const viewAdoptionRequests = () => {
  router.push(`/adopciones/${petId}`)
}

const editPet = () => {
  router.push(`/publicar/editar/${petId}`)
}
const deletePet = async () => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return
  
  try {
    // Assuming usePets exposes a deletePet function
    // We need to verify if usePets has deletePet or if we need to implement it
    const { deletePet: deletePetAction } = usePets()
    const success = await deletePetAction(petId)
    
    if (success) {
      router.push('/mascotas')
    } else {
      alert('Error al eliminar la mascota')
    }
  } catch (e) {
    console.error(e)
    alert('Error al eliminar: ' + e.message)
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

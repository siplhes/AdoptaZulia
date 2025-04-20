<template>
  <div class="min-h-screen bg-amber-50 py-6 md:py-12">
    <div class="container mx-auto px-4">
      <!-- Navegación de regreso -->
      <button
        class="mb-6 inline-flex items-center text-emerald-600 hover:text-emerald-700"
        @click="goBack"
      >
        <Icon name="heroicons:arrow-left" class="mr-1 h-4 w-4" />
        <span>Volver a mascotas</span>
      </button>

      <div v-if="loading" class="flex h-64 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-700" />
      </div>

      <div v-else-if="error" class="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-red-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="!pet" class="mb-6 border-l-4 border-yellow-500 bg-yellow-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-yellow-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">No se ha encontrado la mascota</p>
          </div>
        </div>
      </div>

      <div v-else class="overflow-hidden rounded-lg bg-white shadow-lg">
        <div class="grid grid-cols-1 lg:grid-cols-3">
          <!-- Galería de fotos (1/3) -->
          <div class="p-4 lg:col-span-1 lg:p-6">
            <div class="mb-4">
              <!-- Foto principal -->
              <NuxtImg
                :src="currentPhoto || pet.image"
                :alt="pet.name"
                class="h-[33rem] w-full rounded-lg object-none lg:h-96"
                sizes="sm:100vw md:80vw lg:33vw"
                placeholder
                @error="handleImageError"
              />
            </div>

            <!-- Miniaturas de fotos -->
            <div
              v-if="pet.photos && pet.photos.length > 1"
              class="grid grid-cols-4 gap-2"
            >
              <div
                v-for="(photo, index) in pet.photos"
                :key="index"
                class="h-32 cursor-pointer overflow-hidden rounded-md md:h-20"
                :class="{ 'ring-2 ring-emerald-500': currentPhoto === photo }"
                @click="currentPhoto = photo"
              >
                <NuxtImg
                  :src="photo"
                  :alt="`Foto ${index + 1} de ${pet.name}`"
                  class="h-full w-full object-cover"
                  sizes="sm:35vw md:25vw lg:8vw"
                  placeholder
                  @error="handleImageError"
                />
              </div>
            </div>
            <!-- Mensaje de mascota adoptada -->
            <div v-if="pet.status === 'adopted'" class="rounded-lg bg-blue-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <Icon name="heroicons:check-circle" class="h-5 w-5 text-blue-500" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-blue-700">
                    Esta mascota ya ha sido adoptada
                  </p>
                  <p class="mt-1 text-xs text-blue-600">
                    ¡Esta mascota ya encontró un hogar! Te invitamos a explorar otras
                    mascotas disponibles.
                  </p>
                </div>
              </div>
            </div>
            <!-- Estado de urgente si aplica -->
            <div v-if="pet.status !== 'adopted'">
              <div
                v-if="pet.urgent"
                class="mt-4 rounded border-l-4 border-red-500 bg-red-100 p-3"
              >
                <div class="flex">
                  <div class="flex-shrink-0">
                    <Icon name="heroicons:exclamation-circle" class="h-5 w-5 text-red-500" />
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-red-700">Adopción urgente</p>
                    <p class="mt-1 text-xs text-red-600">
                      Esta mascota necesita encontrar un hogar con urgencia.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <!-- Botones de acción -->
            <div class="mt-6">
              <!-- Versión móvil (botones con íconos) -->
              <div class="flex flex-wrap gap-2 lg:hidden">
              <!-- Botones para usuarios no propietarios -->
              <div v-if="!isOwner" class="flex flex-wrap gap-2">
                <button
                v-if="canAdopt && !hasApplied && pet.status !== 'adopted'"
                class="flex items-center justify-center rounded-full bg-emerald-600 p-2 text-white hover:bg-emerald-700"
                @click="openAdoptionModal"
                >Adoptar a {{ pet.name }}
                <Icon name="heroicons:heart" class="h-6 w-6" />
                </button>

                <button
                v-if="hasApplied"
                class="flex items-center justify-center rounded-full bg-blue-600 p-3 text-white hover:bg-blue-700"
                @click="viewUserAdoption"
                >
                <Icon name="heroicons:document-text" class="h-6 w-6" />
                </button>

                <button
                v-if="adoptionStatus === 'approved'"
                class="flex items-center justify-center rounded-full bg-amber-600 p-3 text-white hover:bg-amber-700"
                @click="contactOwner"
                >
                <Icon name="heroicons:phone" class="h-6 w-6" />
                </button>

                <button
                v-if="adoptionStatus === 'approved'"
                class="flex items-center justify-center rounded-full bg-green-600 p-3 text-white hover:bg-green-700"
                @click="contactWhatsapp"
                >
                <Icon name="heroicons:chat-bubble-left-right" class="h-6 w-6" />
                </button>
              </div>

              <!-- Botones para propietarios -->
              <div v-if="isOwner" class="flex flex-wrap gap-2">
                <button
                class="flex items-center justify-center rounded-full bg-blue-600 p-3 text-white hover:bg-blue-700"
                @click="viewAdoptionRequests"
                >
                <Icon name="heroicons:document-text" class="h-6 w-6" />
                </button>

                <NuxtLink
                to="/mis-publicaciones"
                class="flex items-center justify-center rounded-full bg-purple-600 p-3 text-white hover:bg-purple-700"
                >
                <Icon name="heroicons:photo" class="h-6 w-6" />
                </NuxtLink>

                <button
                class="flex items-center justify-center rounded-full bg-amber-600 p-3 text-white hover:bg-amber-700"
                @click="editPet"
                >
                <Icon name="heroicons:pencil-square" class="h-6 w-6" />
                </button>

                <button
                class="flex items-center justify-center rounded-full bg-red-600 p-3 text-white hover:bg-red-700"
                @click="deletePet"
                >
                <Icon name="heroicons:trash" class="h-6 w-6" />
                </button>
              </div>

              <!-- Botones comunes -->
              <div class="flex flex-wrap gap-2">
                <button
                class="flex items-center justify-center rounded-full border border-gray-300 bg-white p-3 text-gray-700 hover:bg-gray-50"
                @click="sharePet"
                >
                <Icon name="heroicons:share" class="h-6 w-6" />
                </button>

                <button
                class="flex items-center justify-center rounded-full border p-3"
                :class="[
                  isFavorite
                  ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                ]"
                @click="toggleFavorite"
                >
                <Icon
                  :name="isFavorite ? 'heroicons:heart' : 'mdi:heart-outline'"
                  class="h-6 w-6"
                  :class="{ 'text-red-500': isFavorite }"
                />
                </button>

                <button
                class="flex items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 p-3 text-emerald-700 hover:bg-emerald-100"
                :disabled="generatingImage"
                @click="generateShareImage"
                >
                <Icon :name="generatingImage ? 'heroicons:arrow-path' : 'heroicons:photo'" class="h-6 w-6" :class="{ 'animate-spin': generatingImage }" />
                </button>
              </div>
              </div>

              <!-- Versión desktop (botones con texto) -->
              <div class="hidden space-y-2 lg:block">
              <!-- Botones para usuarios no propietarios -->
              <div v-if="!isOwner" class="flex flex-wrap gap-2">
                <button
                v-if="canAdopt && !hasApplied && pet.status !== 'adopted'"
                class="flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                @click="openAdoptionModal"
                >
                <Icon name="heroicons:heart" class="h-5 w-5" />
                <span>Solicitar adopción</span>
                </button>

                <button
                v-if="hasApplied"
                class="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                @click="viewUserAdoption"
                >
                <Icon name="heroicons:document-text" class="h-5 w-5" />
                <span>Ver mi solicitud</span>
                </button>

                <button
                v-if="adoptionStatus === 'approved'"
                class="flex items-center justify-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
                @click="contactOwner"
                >
                <Icon name="heroicons:phone" class="h-5 w-5" />
                <span>Llamar</span>
                </button>

                <button
                v-if="adoptionStatus === 'approved'"
                class="flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                @click="contactWhatsapp"
                >
                <Icon name="heroicons:chat-bubble-left-right" class="h-5 w-5" />
                <span>WhatsApp</span>
                </button>
              </div>

              <!-- Botones para propietarios -->
              <div v-if="isOwner" class="flex flex-wrap gap-2">
                <button
                class="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                @click="viewAdoptionRequests"
                >
                <Icon name="heroicons:document-text" class="h-5 w-5" />
                <span>Ver solicitudes</span>
                </button>

                <NuxtLink
                to="/mis-publicaciones"
                class="flex items-center justify-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                >
                <Icon name="heroicons:photo" class="h-5 w-5" />
                <span>Mis publicaciones</span>
                </NuxtLink>

                <button
                class="flex items-center justify-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
                @click="editPet"
                >
                <Icon name="heroicons:pencil-square" class="h-5 w-5" />
                <span>Editar</span>
                </button>

                <button
                class="flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                @click="deletePet"
                >
                <Icon name="heroicons:trash" class="h-5 w-5" />
                <span>Eliminar</span>
                </button>
              </div>

              <!-- Botones comunes -->
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                class="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                @click="sharePet"
                >
                <Icon name="heroicons:share" class="h-5 w-5" />
                <span>Compartir</span>
                </button>

                <button
                class="flex items-center justify-center gap-2 rounded-md border px-4 py-2"
                :class="[
                  isFavorite
                  ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                ]"
                @click="toggleFavorite"
                >
                <Icon
                  :name="isFavorite ? 'heroicons:heart' : 'mdi:heart-outline'"
                  class="h-5 w-5"
                  :class="{ 'text-red-500': isFavorite }"
                />
                <span>{{ isFavorite ? 'En favoritos' : 'Añadir a favoritos' }}</span>
                </button>

                <button
                class="flex items-center justify-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-700 hover:bg-emerald-100"
                :disabled="generatingImage"
                @click="generateShareImage"
                >
                <Icon :name="generatingImage ? 'heroicons:arrow-path' : 'heroicons:photo'" class="h-5 w-5" :class="{ 'animate-spin': generatingImage }" />
                <span>{{ generatingImage ? 'Generando...' : 'Generar imagen' }}</span>
                </button>
              </div>
              </div>
            </div>
          </div>
          <div class="border-gray-100 p-4 lg:col-span-2 lg:border-l lg:p-6">
            <div
              v-if="hasApplied"
              class="mb-4 rounded-lg border-l-4 p-4"
              :class="{
                'border-yellow-500 bg-yellow-50': adoptionStatus === 'pending',
                'border-blue-500 bg-blue-50': adoptionStatus === 'approved',
                'border-red-500 bg-red-50': adoptionStatus === 'rejected',
              }"
            >
              <div class="flex">
                <div class="flex-shrink-0">
                  <Icon
                    :name="
                      adoptionStatus === 'pending'
                        ? 'heroicons:clock'
                        : adoptionStatus === 'approved'
                        ? 'heroicons:check-circle'
                        : 'heroicons:x-circle'
                    "
                    class="h-5 w-5"
                    :class="{
                      'text-yellow-500': adoptionStatus === 'pending',
                      'text-blue-500': adoptionStatus === 'approved',
                      'text-red-500': adoptionStatus === 'rejected',
                    }"
                  />
                </div>
                <div class="ml-3">
                  <p
                    class="text-sm font-medium"
                    :class="{
                      'text-yellow-700': adoptionStatus === 'pending',
                      'text-blue-700': adoptionStatus === 'approved',
                      'text-red-700': adoptionStatus === 'rejected',
                    }"
                  >
                    {{
                      adoptionStatus === "pending"
                        ? "Tu solicitud de adopción está en revisión"
                        : adoptionStatus === "approved"
                        ? "Solicitud aprobada - Puedes contactar al propietario"
                        : "Tu solicitud de adopción ha sido rechazada"
                    }}
                  </p>
                </div>
              </div>
            </div>

            <div class="mb-6">
              <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h1 class="text-3xl font-bold text-emerald-800">
                  {{ pet.name }}
                </h1>
                <span
                  :class="[
                    'rounded-full px-3 py-1 text-sm font-medium',
                    pet.gender === 'macho'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-pink-100 text-pink-800',
                  ]"
                >
                  {{ pet.gender === "macho" ? "Macho" : "Hembra" }}
                </span>
              </div>
              <div class="mb-4 flex items-center text-gray-500">
                <Icon name="heroicons:map-pin" class="mr-1 h-4 w-4" />
                <span class="text-sm">{{ pet.location }}</span>
                <span class="mx-2">•</span>
                <Icon name="heroicons:calendar" class="mr-1 h-4 w-4" />
                <span class="text-sm">Publicado {{ formatDate(pet.createdAt) }}</span>
              </div>

              <div class="mb-6 grid grid-cols-2 gap-y-3 sm:grid-cols-3">
                <div>
                  <p class="text-sm text-gray-500">Tipo</p>
                  <p class="font-medium">{{ formatType(pet.type) }}</p>
                </div>

                <div>
                  <p class="text-sm text-gray-500">Raza</p>
                  <p class="font-medium">
                    {{ pet.breed || "No especificada" }}
                  </p>
                </div>

                <div>
                  <p class="text-sm text-gray-500">Edad</p>
                  <p class="font-medium">{{ pet.age }}</p>
                </div>

                <div>
                  <p class="text-sm text-gray-500">Tamaño</p>
                  <p class="font-medium">{{ formatSize(pet.size) }}</p>
                </div>

                <div>
                  <p class="text-sm text-gray-500">Vacunado</p>
                  <p class="font-medium">
                    {{ pet.vaccinated ? "Sí" : "No" }}
                    <span
                      v-if="pet.vaccinated && pet.vaccineInfo"
                      class="text-sm text-gray-500"
                    >
                      ({{ pet.vaccineInfo }})
                    </span>
                  </p>
                </div>

                <div>
                  <p class="text-sm text-gray-500">Esterilizado</p>
                  <p class="font-medium">
                    {{ pet.neutered ? "Sí" : "No" }}
                    <span
                      v-if="pet.neutered && pet.neuterDate"
                      class="text-sm text-gray-500"
                    >
                      ({{ pet.neuterDate }})
                    </span>
                  </p>
                </div>

                <div v-if="pet.microchipped">
                  <p class="text-sm text-gray-500">Microchip</p>
                  <p class="font-medium">
                    Sí
                    <span v-if="pet.chipNumber" class="text-sm text-gray-500">
                      ({{ pet.chipNumber }})
                    </span>
                  </p>
                </div>
              </div>

              <div class="mb-6">
                <h2 class="mb-2 text-xl font-semibold text-emerald-800">
                  Sobre {{ pet.name }}
                </h2>
                <p class="text-gray-700">{{ pet.description }}</p>
              </div>

              <div v-if="pet.healthDescription" class="mb-6">
                <h2 class="mb-2 text-xl font-semibold text-emerald-800">
                  Estado de salud
                </h2>
                <div class="mb-3 flex items-center">
                  <div class="h-2.5 w-full rounded-full bg-gray-200">
                    <div
                      class="h-2.5 rounded-full"
                      :class="getHealthColor(pet.healthStatus)"
                      :style="{ width: `${pet.healthStatus}%` }"
                    />
                  </div>
                  <span class="ml-4 text-sm font-medium">
                    {{ getHealthLabel(pet.healthStatus) }}
                  </span>
                </div>
                <p class="text-gray-700">{{ pet.healthDescription }}</p>
              </div>

              <!-- Vacunas -->
              <div
                v-if="pet.vaccinated && pet.vaccines && pet.vaccines.length > 0"
                class="mb-6"
              >
                <h2 class="mb-2 text-xl font-semibold text-emerald-800">Vacunas</h2>
                <ul class="space-y-2">
                  <li
                    v-for="(vaccine, index) in pet.vaccines"
                    :key="index"
                    class="flex items-center"
                  >
                    <Icon name="heroicons:check-circle" class="mr-2 h-5 w-5 text-green-500" />
                    <span>{{ vaccine.name }}</span>
                    <span v-if="vaccine.date" class="ml-2 text-sm text-gray-500">
                      ({{ formatShortDate(vaccine.date) }})
                    </span>
                  </li>
                </ul>
              </div>

              <!-- Historial médico -->
              <div
                v-if="pet.medicalRecords && pet.medicalRecords.length > 0"
                class="mb-6"
              >
                <h2 class="mb-2 text-xl font-semibold text-emerald-800">
                  Historial médico
                </h2>
                <div class="space-y-3">
                  <div
                    v-for="(record, index) in pet.medicalRecords"
                    :key="index"
                    class="rounded-lg border border-gray-200 p-3"
                  >
                    <div class="flex items-start justify-between">
                      <h3 class="font-medium">{{ record.title }}</h3>
                      <span class="text-sm text-gray-500">{{
                        formatShortDate(record.date)
                      }}</span>
                    </div>
                    <p class="mt-1 text-sm text-gray-700">
                      {{ record.description }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Requisitos para adopción -->
              <div
                v-if="
                  pet.adoptionRequirements ||
                  pet.requiresContract ||
                  pet.requiresFollowUp ||
                  (pet.adoptionFee && pet.adoptionFee > 0)
                "
                class="mb-6"
              >
                <h2 class="mb-2 text-xl font-semibold text-emerald-800">
                  Requisitos para adoptar
                </h2>
                <div class="rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <div v-if="pet.adoptionRequirements" class="mb-3">
                    <p class="text-gray-700">{{ pet.adoptionRequirements }}</p>
                  </div>

                  <div
                    v-if="pet.requiresContract || pet.requiresFollowUp"
                    class="mb-3 space-y-2"
                  >
                    <div v-if="pet.requiresContract" class="flex items-center">
                      <Icon name="heroicons:check-circle" class="mr-2 h-5 w-5 text-emerald-600" />
                      <span class="text-gray-700">Requiere contrato de adopción</span>
                    </div>

                    <div v-if="pet.requiresFollowUp" class="flex items-center">
                      <Icon name="heroicons:check-circle" class="mr-2 h-5 w-5 text-emerald-600" />
                      <span class="text-gray-700">
                        Requiere seguimiento post-adopción
                        <span v-if="pet.followUpDetails" class="text-sm text-gray-500">
                          ({{ pet.followUpDetails }})
                        </span>
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="pet.adoptionFee && pet.adoptionFee > 0"
                    class="mt-3 border-t border-amber-100 pt-3"
                  >
                    <p class="text-gray-700">
                      <span class="font-medium">Tasa de adopción:</span>
                      ${{ pet.adoptionFee }}
                    </p>
                    <p v-if="pet.feeDetails" class="mt-1 text-sm text-gray-700">
                      {{ pet.feeDetails }}
                    </p>
                    <p v-else class="mt-1 text-xs text-gray-500">
                      Esta tasa ayuda a cubrir gastos veterinarios y de cuidado.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información de contacto -->
         
              <div
                v-if="adoptionStatus === 'approved' || !pet.status === 'adopted' "
                class="rounded-lg bg-gray-50 p-4"
              >
                <h2 class="mb-2 text-xl font-semibold text-emerald-800">
                  Información de contacto
                </h2>
                <div class="flex items-start">
                  <Icon name="heroicons:user" class="mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <p class="font-medium">{{ pet.contact.name }}</p>
                    <p class="text-sm text-gray-500">
                      {{ formatContactType(pet.contact.type) }}
                    </p>
                  </div>
                </div>

                <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div class="flex items-center">
                    <Icon name="heroicons:phone" class="mr-3 h-5 w-5 text-gray-400" />
                    <a
                      :href="`tel:${pet.contact.phone}`"
                      class="text-emerald-600 hover:text-emerald-800"
                    >
                      {{ pet.contact.phone }}
                    </a>
                  </div>

                  <div class="flex items-center">
                    <Icon name="heroicons:envelope" class="mr-3 h-5 w-5 text-gray-400" />
                    <a
                      :href="`mailto:${pet.contact.email}`"
                      class="text-emerald-600 hover:text-emerald-800"
                    >
                      {{ pet.contact.email }}
                    </a>
                  </div>
                </div>

                <!-- Método preferido de contacto -->
                <div v-if="pet.contact.preferredMethod" class="mt-3">
                  <p class="text-sm text-gray-700">
                    <span class="font-medium">Contacto preferido:</span>
                    <span class="ml-1">{{
                      formatPreferredMethod(pet.contact.preferredMethod)
                    }}</span>
                  </p>
                </div>

                <!-- Notas adicionales de contacto -->
                <div v-if="pet.contact.notes" class="mt-3">
                  <p class="text-sm font-medium text-gray-700">Notas adicionales:</p>
                  <p class="mt-1 text-sm text-gray-600">{{ pet.contact.notes }}</p>
                </div>
              </div>
         
            <!-- Mensaje para usuarios sin solicitud o con solicitud pendiente -->
            <div
              v-else-if="!isOwner && adoptionStatus !== 'approved'"
              class="rounded-lg bg-amber-50 p-4"
            >
              <h2 class="mb-2 text-xl font-semibold text-emerald-800">
                Información de contacto
              </h2>
              <p class="text-amber-700">
                <span v-if="adoptionStatus === 'pending'">
                    Por temas de seguridad y privacidad, para acceder a la información de contacto del publicador, debes enviar
                  una solicitud de adopción.
                </span>
                <span v-else-if="adoptionStatus === 'rejected'">
                  Tu solicitud de adopción fue rechazada. Si crees que ha sido un error,
                  por favor comunícate con nosotros.
                </span>
                <span v-else>
                  Por temas de seguridad y privacidad, para acceder a la información de contacto del publicador, debes enviar
                  una solicitud de adopción.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de solicitud de adopción -->
      <div
        v-if="showAdoptionModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Solicitud de adopción</h3>
            <button class="text-gray-400 hover:text-gray-500" @click="closeAdoptionModal">
              <Icon name="heroicons:x-mark" class="h-5 w-5" />
            </button>
          </div>

          <div class="mb-6 border-l-4 border-emerald-500 bg-emerald-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <Icon
                  name="heroicons:information-circle"
                  class="h-5 w-5 text-emerald-500"
                />
              </div>
              <div class="ml-3">
                <p class="text-sm text-emerald-700">
                  Estás solicitando adoptar a
                  <span class="font-semibold">{{ pet?.name }}</span
                  >. Al enviar esta solicitud, el propietario recibirá tu mensaje y podrá
                  ponerse en contacto contigo. La información de contacto solo estará
                  disponible si tu solicitud es aprobada.
                </p>
              </div>
            </div>
          </div>

          <form @submit.prevent="submitAdoptionRequest">
            <div class="mb-6">
              <label
                for="adoption-message"
                class="mb-1 block text-sm font-medium text-gray-700"
              >
                Mensaje para el propietario <span class="text-red-500">*</span>
              </label>
              <textarea
                id="adoption-message"
                v-model="adoptionMessage"
                rows="5"
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="Cuéntanos por qué quieres adoptar a esta mascota, tu experiencia con mascotas, y cualquier otra información relevante que pueda ayudar al propietario a conocerte mejor."
                required
              />
            </div>

            <div class="mt-8 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
                @click="closeAdoptionModal"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="flex items-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-white shadow-sm hover:bg-emerald-700"
                :disabled="submittingAdoption"
              >
                <span v-if="submittingAdoption">
                  <Icon name="heroicons:arrow-path" class="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </span>
                <span v-else>
                  <Icon name="heroicons:heart" class="mr-2 h-4 w-4" />
                  Enviar solicitud
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Mascotas similares -->
      <div v-if="pet && similarPets.length > 0" class="mt-12">
        <h2 class="mb-6 text-2xl font-bold text-emerald-800">
          También te pueden interesar
        </h2>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          <PetCard
            v-for="similarPet in similarPets"
            :key="similarPet.id"
            :pet="similarPet"
          />
        </div>
      </div>

      <!-- Sistema de comentarios -->
      <div v-if="pet" class="mt-12">
        <PetComments :pet-id="petId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePets } from "~/composables/usePets";
import { useAuth } from "~/composables/useAuth";
import { useAdoptions } from "~/composables/useAdoptions";
import { useImageGen2 } from "~/composables/useImageGen2";
import {
  getDatabase,
  ref as dbRef,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { useFirebaseApp } from "vuefire";

// Obtener el ID de la mascota de la URL
const route = useRoute();
const router = useRouter();
const petId = route.params.id;

// Usar el composable de mascotas
const { fetchPetById, loading, error, pet } = usePets();
const { fetchSimilarPets } = usePets();

// Usar el composable de adopciones
const { createAdoptionRequest } = useAdoptions();

// Estado para la galería de fotos
const currentPhoto = ref(null);

// Estado para favoritos
const isFavorite = ref(false);

// Mascotas similares
const similarPets = ref([]);

// Información de autenticación
const { user, isAuthenticated } = useAuth();

// Estado para la solicitud de adopción
const userAdoption = ref(null);
const hasApplied = ref(false);
const adoptionStatus = ref(null);
const loadingAdoption = ref(false);

// Estado para el modal de adopción
const showAdoptionModal = ref(false);
const adoptionMessage = ref("");
const submittingAdoption = ref(false);

// Estado para solicitudes de adopción del propietario
const ownerAdoptionCount = ref(0);

// Estado para generar imagen compartible
const generatingImage = ref(false);

// Verificar si el usuario actual es el propietario de la mascota
const isOwner = computed(() => {
  if (!isAuthenticated.value || !user.value || !pet.value || !pet.value.userId)
    return false;
  return user.value?.uid === pet.value.userId;
});

// Verificar si el usuario puede adoptar (está autenticado y no es el propietario)
const canAdopt = computed(() => {
  return isAuthenticated.value && !isOwner.value;
});

// Obtener texto del estado de la solicitud
const getStatusText = computed(() => {
  switch (adoptionStatus.value) {
    case "pending":
      return "Solicitud en revisión";
    case "rejected":
      return "Solicitud rechazada";
    default:
      return "Estado desconocido";
  }
});

// Función para abrir el modal de adopción
const openAdoptionModal = () => {
  if (!isAuthenticated.value) {
    // Guardar la URL actual para redirigir después del login
    const currentPath = route.fullPath;
    // Redireccionar al login si no está autenticado
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    return;
  }
  showAdoptionModal.value = true;
};

// Función para cerrar el modal de adopción
const closeAdoptionModal = () => {
  showAdoptionModal.value = false;
  adoptionMessage.value = "";
};

// Función para enviar la solicitud de adopción
const submitAdoptionRequest = async () => {
  if (!adoptionMessage.value.trim() || !isAuthenticated.value) return;

  submittingAdoption.value = true;

  try {
    // Crear objeto de solicitud de adopción
    const adoptionData = {
      petId: petId,
      userId: user.value.uid,
      message: adoptionMessage.value.trim(),
    };

    // Enviar solicitud
    const adoptionId = await createAdoptionRequest(
      adoptionData.petId,
      adoptionData.userId,
      adoptionData.message
    );

    if (adoptionId) {
      // Actualizar estado local
      hasApplied.value = true;
      adoptionStatus.value = "pending";

      // Actualizar el objeto userAdoption con la nueva solicitud
      userAdoption.value = {
        id: adoptionId,
        petId: adoptionData.petId,
        userId: adoptionData.userId,
        message: adoptionData.message,
        status: "pending",
        createdAt: Date.now(),
      };
      alert(
        "Tu solicitud de adopción ha sido enviada con éxito. El propietario revisará tu solicitud y te contactará si es aprobada."
      );
    } else {
      alert(
        "Ha ocurrido un error al enviar la solicitud. Por favor, inténtalo de nuevo."
      );
    }

    // Cerrar modal
    closeAdoptionModal();
  } catch (err) {
    console.error("Error al enviar la solicitud de adopción:", err);
    alert("Error al enviar la solicitud. Por favor, inténtalo de nuevo.");
  } finally {
    submittingAdoption.value = false;
  }
};

// Función para verificar si el usuario ya ha enviado una solicitud
const checkUserAdoption = async () => {
  if (!isAuthenticated.value || !user.value || !petId) return;

  loadingAdoption.value = true;

  try {
    const { checkAdoptionRequestForPet, getAdoptionById } = useAdoptions();
    const result = await checkAdoptionRequestForPet(petId, user.value.uid);

    if (result.exists && result.adoptionId) {
      // Si existe una solicitud, obtener sus detalles
      userAdoption.value = await getAdoptionById(result.adoptionId);

      hasApplied.value = true;
      adoptionStatus.value = result.status || "pending";
    } else {
      hasApplied.value = false;
      adoptionStatus.value = null;
      userAdoption.value = null;
    }
  } catch (err) {
    console.error("Error al verificar solicitud de adopción:", err);
  } finally {
    loadingAdoption.value = false;
  }
};

// Función para verificar solicitudes de adopción del propietario
const checkOwnerAdoptions = async () => {
  if (!isOwner.value || !petId) return;

  try {
    const firebaseApp = useFirebaseApp();
    const db = getDatabase(firebaseApp);
    const adoptionsRef = dbRef(db, "adoptions");

    // Consultar adopciones por mascota de manera más eficiente
    const adoptionQuery = query(adoptionsRef, orderByChild("petId"), equalTo(petId));

    const snapshot = await get(adoptionQuery);

    if (snapshot.exists()) {
      const adoptions = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data,
      }));
      ownerAdoptionCount.value = adoptions.length;
    } else {
      ownerAdoptionCount.value = 0;
    }
  } catch (err) {
    console.error("Error al verificar solicitudes de adopción del propietario:", err);
    ownerAdoptionCount.value = 0;
  }
};

// Función para verificar si la imagen es válida
const handleImageError = (event) => {
  // Establece una imagen de placeholder si la carga falla
  event.target.src = "/placeholder.webp?height=300&width=400";
};

// Función para eliminar una mascota
const deletePet = async () => {
  if (!confirm("¿Estás seguro de que quieres eliminar esta mascota?")) return;

  try {
    const { deletePet } = usePets();
    await deletePet(petId);

    // Redirigir a la página de mascotas
    router.push("/mascotas");
  } catch (err) {
    console.error("Error al eliminar la mascota:", err);
    alert("Error al eliminar la mascota. Por favor, inténtalo de nuevo.");
  }
};

// Función para editar una mascota
const editPet = () => {
  router.push(`/publicar/editar/${petId}`);
};

// Función para ver solicitudes de adopción
const viewAdoptionRequests = () => {
  router.push(`/adopciones/${petId}`);
};

// Función para ver la solicitud enviada
const viewUserAdoption = () => {
  if (userAdoption.value?.id) {
    router.push(`/mi-solicitud/${userAdoption.value.id}`);
  }
};

onMounted(async () => {
  // Cargar los datos de la mascota
  const petData = await fetchPetById(petId);

  if (petData) {
    // Establecer la foto actual a la foto principal
    currentPhoto.value = petData.image;

    // Comprobar si está en favoritos
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    isFavorite.value = favorites.includes(petId);

    // Cargar mascotas similares
    similarPets.value = await fetchSimilarPets(petData, 4);

    // Verificar si el usuario ya ha enviado una solicitud de adopción
    if (isAuthenticated.value) {
      await checkUserAdoption();
    }

    // Verificar solicitudes de adopción del propietario
    if (isOwner.value) {
      await checkOwnerAdoptions();
    }
  }
  // Establecer el título de la página
  useHead({
    title: pet.value
      ? `Adopta a ${pet.value.name} | Adopta Zulia`
      : "Mascota no encontrada",
    meta: [
      {
        name: "description",
        content: pet.value
          ? `Conoce a ${pet.value.name}, una mascota en adopción. ${pet.value.description}`
          : "Mascota no encontrada",
      },
      {
        property: "og:title",
        content: pet.value ? `Adopta a ${pet.value.name}` : "Mascota no encontrada",
      },
      {
        property: "og:description",
        content: pet.value
          ? `Conoce a ${pet.value.name}, una mascota en adopción. ${pet.value.description}`
          : "Mascota no encontrada",
      },
      {
        property: "og:image",
        content: pet.value ? pet.value.image : "/placeholder.webp?height=300&width=400",
      },
      {
        property: "og:url",
        content: window.location.href,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: "Adopta un amigo",
      },
      {
        property: "twitter:card",
        content: "summary_large_image",
      },
      {
        property: "twitter:title",
        content: pet.value ? `Adopta a ${pet.value.name}` : "Mascota no encontrada",
      },
      {
        property: "twitter:description",
        content: pet.value
          ? `Conoce a ${pet.value.name}, una mascota en adopción. ${pet.value.description}`
          : "Mascota no encontrada",
      },
      {
        property: "twitter:image",
        content: pet.value ? pet.value.image : "/placeholder.webp?height=300&width=400",
      },
      {
        property: "twitter:url",
        content: window.location.href,
      },
      {
        property: "twitter:site",
        content: "@adoptazulia",
      },
      {
        property: "twitter:creator",
        content: "@adoptazulia",
      },
      {
        property: "twitter:image:alt",
        content: pet.value ? `Adopta a ${pet.value.name}` : "Mascota no encontrada",
      },
      {
        property: "twitter:image:width",
        content: "1200",
      },
      {
        property: "twitter:image:height",
        content: "630",
      },
      {
        property: "twitter:label1",
        content: "Adopción",
      },
      {
        property: "twitter:data1",
        content: pet.value ? `Adopta a ${pet.value.name}` : "Mascota no encontrada",
      },
    ],
  });
});

// Volver atrás
const goBack = () => {
  router.back();
};

// Alternar estado de favorito
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;

  // Guardar en localStorage
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (isFavorite.value) {
    if (!favorites.includes(petId)) {
      favorites.push(petId);
    }
  } else {
    const index = favorites.indexOf(petId);
    if (index !== -1) {
      favorites.splice(index, 1);
    }
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
};

// Contactar al propietario
const contactOwner = () => {
  if (pet.value && pet.value.contact) {
    const phoneNumber = pet.value.contact.phone;
    window.open(`tel:${phoneNumber}`);
  }
};

// Contactar al propietario via WhatsApp
const contactWhatsapp = () => {
  if (pet.value && pet.value.contact && pet.value.contact.phone) {
    let phoneNumber = pet.value.contact.phone.toString().trim();

    // Eliminar el código de país si ya está presente
    if (phoneNumber.startsWith("+58")) {
      phoneNumber = phoneNumber.substring(3);
    } else if (phoneNumber.startsWith("58")) {
      phoneNumber = phoneNumber.substring(2);
    }

    // Eliminar el 0 inicial si existe
    if (phoneNumber.startsWith("0")) {
      phoneNumber = phoneNumber.substring(1);
    }

    // Asegurar que no hay espacios ni caracteres especiales
    phoneNumber = phoneNumber.replace(/[^0-9]/g, "");

    // Abrir WhatsApp con el número procesado
    window.open(`https://wa.me/58${phoneNumber}`);
  }
};

// Compartir mascota
const sharePet = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Adopta a ${pet.value.name}`,
        text: `¡Mira a ${pet.value.name}, está buscando un hogar!`,
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error compartiendo:", error);
    }
  } else {
    // Fallback para navegadores que no soportan Web Share API
    navigator.clipboard.writeText(window.location.href);
    alert("¡Enlace copiado al portapapeles!");
  }
};

// Generar imagen compartible con la implementación alternativa
const generateShareImage = async () => {
  if (!pet.value) return;
  generatingImage.value = true;
  try {
    const { generatePetImage } = useImageGen2();
    
    // Obtener la imagen actual (la que se muestra o la principal)
    const imageUrl = currentPhoto.value || pet.value.image;
    
    console.log("DEBUG - Generando imagen para mascota:", pet.value.name);
    console.log("DEBUG - URL de imagen que se enviará:", imageUrl);
    
    // Verificar si la URL es válida antes de continuar
    if (!imageUrl || imageUrl === 'undefined' || imageUrl === 'null') {
      throw new Error("URL de imagen no válida");
    }
    
    // Si la imagen es un placeholder, buscar otra imagen disponible
    if (imageUrl.includes('placeholder')) {
      console.log("DEBUG - Detectada imagen placeholder, buscando alternativa");
      // Intentar usar otra foto de la galería si está disponible
      if (pet.value.photos && pet.value.photos.length > 0) {
        const alternativeImage = pet.value.photos.find(photo => !photo.includes('placeholder'));
        if (alternativeImage) {
          console.log("DEBUG - Usando imagen alternativa:", alternativeImage);
          await generatePetImage(
            pet.value.name, 
            alternativeImage, 
            petId,
            {
              backgroundColor: '#f5f5f4',
              downloadFilename: `adopta-a-${pet.value.name.toLowerCase().replace(/\s+/g, '-')}.png`
            }
          );
          return;
        }
      }
    }
    
    // Generar la imagen con el nuevo método
    const result = await generatePetImage(
      pet.value.name, 
      imageUrl, 
      petId,
      {
        backgroundColor: '#f5f5f4',
        downloadFilename: `adopta-a-${pet.value.name.toLowerCase().replace(/\s+/g, '-')}.png`
      }
    );
    
    if (!result) {
      throw new Error("No se pudo generar la imagen");
    }
    
  } catch (error) {
    console.error("Error generando la imagen compartible:", error);
    alert("Error al generar la imagen. Por favor, intenta de nuevo más tarde.");
  } finally {
    generatingImage.value = false;
  }
};

// Formatear tipo de mascota
const formatType = (type) => {
  switch (type) {
    case "perro":
      return "Perro";
    case "gato":
      return "Gato";
    case "ave":
      return "Ave";
    case "conejo":
      return "Conejo";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

// Formatear tamaño
const formatSize = (size) => {
  switch (size) {
    case "pequeño":
      return "Pequeño";
    case "mediano":
      return "Mediano";
    case "grande":
      return "Grande";
    default:
      return "Desconocido";
  }
};

// Formatear tipo de contacto
const formatContactType = (type) => {
  switch (type) {
    case "particular":
      return "Particular";
    case "protectora":
      return "Protectora/Refugio";
    case "veterinario":
      return "Clínica Veterinaria";
    default:
      return type;
  }
};

// Formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return "Fecha desconocida";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "hoy";
  } else if (diffDays === 1) {
    return "ayer";
  } else if (diffDays < 7) {
    return `hace ${diffDays} días`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `hace ${months} ${months === 1 ? "mes" : "meses"}`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `hace ${years} ${years === 1 ? "año" : "años"}`;
  }
};

const formatShortDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Obtener la etiqueta del nivel de salud
const getHealthLabel = (healthStatus) => {
  if (healthStatus >= 90) return "Excelente";
  if (healthStatus >= 70) return "Bueno";
  if (healthStatus >= 50) return "Regular";
  if (healthStatus >= 30) return "En tratamiento";
  return "Necesidades especiales";
};

// Obtener el color del nivel de salud
const getHealthColor = (healthStatus) => {
  if (healthStatus >= 90) return "bg-green-500";
  if (healthStatus >= 70) return "bg-green-400";
  if (healthStatus >= 50) return "bg-yellow-400";
  if (healthStatus >= 30) return "bg-amber-500";
  return "bg-red-500";
};

// Formatear método de contacto preferido
const formatPreferredMethod = (method) => {
  switch (method) {
    case "phone":
      return "Teléfono";
    case "email":
      return "Correo electrónico";
    default:
      return method;
  }
};
</script>

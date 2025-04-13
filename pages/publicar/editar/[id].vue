<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <h1 class="mb-2 text-3xl font-bold text-emerald-800">Editar mascota en adopción</h1>
      <p class="mb-6 text-gray-600">
        Actualiza la información de tu mascota para encontrarle un hogar ideal.
      </p>

      <!-- Estado de carga -->
      <div v-if="initialLoading" class="flex h-64 items-center justify-center">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-700" />
      </div>

      <!-- Error de carga -->
      <div
        v-else-if="loadError"
        class="mb-8 rounded-lg border border-red-200 bg-red-50 p-6 shadow-md"
      >
        <div class="flex flex-col items-center justify-between sm:flex-row">
          <div class="mb-4 sm:mb-0">
            <h2 class="mb-1 text-xl font-semibold text-red-800">Error al cargar los datos</h2>
            <p class="text-gray-600">
              {{ loadError }}
            </p>
          </div>
          <button
            class="rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700"
            @click="router.push('/mascotas')"
          >
            Volver a mascotas
          </button>
        </div>
      </div>

      <!-- Estado no autorizado -->
      <div
        v-else-if="!isAuthorized"
        class="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-md"
      >
        <div class="flex flex-col items-center justify-between sm:flex-row">
          <div class="mb-4 sm:mb-0">
            <h2 class="mb-1 text-xl font-semibold text-amber-800">No estás autorizado</h2>
            <p class="text-gray-600">Solo el creador de esta publicación puede editarla.</p>
          </div>
          <button
            class="rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700"
            @click="router.push('/mascotas')"
          >
            Volver a mascotas
          </button>
        </div>
      </div>

      <!-- Formulario de edición -->
      <form v-else class="rounded-lg bg-white p-6 shadow-md" @submit.prevent="updateForm">
        <!-- Error general -->
        <div
          v-if="error"
          class="relative mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          {{ error }}
        </div>

        <!-- Tabs de navegación para secciones -->
        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              type="button"
              class="px-1 py-3 text-sm font-medium"
              :class="
                activeTab === 'info'
                  ? 'border-b-2 border-emerald-500 text-emerald-600'
                  : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
              "
              @click="activeTab = 'info'"
            >
              Información básica
            </button>
            <button
              type="button"
              class="px-1 py-3 text-sm font-medium"
              :class="
                activeTab === 'health'
                  ? 'border-b-2 border-emerald-500 text-emerald-600'
                  : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
              "
              @click="activeTab = 'health'"
            >
              Salud
            </button>
            <button
              type="button"
              class="px-1 py-3 text-sm font-medium"
              :class="
                activeTab === 'photos'
                  ? 'border-b-2 border-emerald-500 text-emerald-600'
                  : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
              "
              @click="activeTab = 'photos'"
            >
              Fotos
            </button>
            <button
              type="button"
              class="px-1 py-3 text-sm font-medium"
              :class="
                activeTab === 'contact'
                  ? 'border-b-2 border-emerald-500 text-emerald-600'
                  : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
              "
              @click="activeTab = 'contact'"
            >
              Contacto
            </button>
            <button
              type="button"
              class="px-1 py-3 text-sm font-medium"
              :class="
                activeTab === 'adoption'
                  ? 'border-b-2 border-emerald-500 text-emerald-600'
                  : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
              "
              @click="activeTab = 'adoption'"
            >
              Adopción
            </button>
          </nav>
        </div>

        <!-- Sección: Información básica -->
        <div v-if="activeTab === 'info'" class="space-y-6">
          <h2 class="text-xl font-semibold text-emerald-800">Información básica</h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Nombre -->
            <div>
              <label for="name" class="mb-1 block text-sm font-medium text-gray-700">
                Nombre de la mascota *
              </label>
              <input
                id="name"
                v-model="petData.name"
                type="text"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
            </div>

            <!-- Tipo de mascota -->
            <div>
              <label for="type" class="mb-1 block text-sm font-medium text-gray-700">
                Tipo de mascota *
              </label>
              <select
                id="type"
                v-model="petData.typeValue"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                @change="updateTypeLabel"
              >
                <option value="" disabled>Seleccionar tipo</option>
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="ave">Ave</option>
                <option value="conejo">Conejo</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <!-- Raza -->
            <div>
              <label for="breed" class="mb-1 block text-sm font-medium text-gray-700">Raza</label>
              <input
                id="breed"
                v-model="petData.breed"
                type="text"
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
            </div>

            <!-- Género -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Género *</label>
              <div class="flex space-x-4">
                <label class="inline-flex items-center">
                  <input
                    v-model="petData.gender"
                    type="radio"
                    value="macho"
                    class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    required
                  >
                  <span class="ml-2 text-gray-700">Macho</span>
                </label>
                <label class="inline-flex items-center">
                  <input
                    v-model="petData.gender"
                    type="radio"
                    value="hembra"
                    class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  >
                  <span class="ml-2 text-gray-700">Hembra</span>
                </label>
              </div>
            </div>

            <!-- Edad -->
            <div>
              <label for="age" class="mb-1 block text-sm font-medium text-gray-700">
                Edad aproximada *
              </label>
              <input
                id="age"
                v-model="petData.age"
                type="text"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="Por ejemplo: 2 años, 6 meses..."
              >
            </div>

            <!-- Rango de edad -->
            <div>
              <label for="age-range" class="mb-1 block text-sm font-medium text-gray-700">
                Rango de edad *
              </label>
              <select
                id="age-range"
                v-model="petData.ageValue"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
                <option value="" disabled>Seleccionar rango</option>
                <option value="cachorro">Cachorro</option>
                <option value="joven">Joven</option>
                <option value="adulto">Adulto</option>
                <option value="senior">Senior</option>
              </select>
            </div>

            <!-- Tamaño -->
            <div>
              <label for="size" class="mb-1 block text-sm font-medium text-gray-700">
                Tamaño *
              </label>
              <select
                id="size"
                v-model="petData.sizeValue"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                @change="updateSizeLabel"
              >
                <option value="" disabled>Seleccionar tamaño</option>
                <option value="pequeño">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            <!-- Ubicación -->
            <div>
              <label for="location" class="mb-1 block text-sm font-medium text-gray-700">
                Ubicación *
              </label>
              <input
                id="location"
                v-model="petData.location"
                type="text"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="Ciudad o municipio"
              >
            </div>
          </div>

          <!-- Descripción -->
          <div class="mt-6">
            <label for="description" class="mb-1 block text-sm font-medium text-gray-700">
              Descripción *
            </label>
            <textarea
              id="description"
              v-model="petData.description"
              rows="4"
              required
              maxlength="500"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Describe la personalidad, hábitos, por qué está en adopción y cualquier otra información relevante..."
            />
            <p class="mt-1 text-sm text-gray-500">
              {{ petData.description.length }}/500 caracteres
            </p>
          </div>
        </div>

        <!-- Sección: Salud -->
        <div v-if="activeTab === 'health'" class="space-y-6">
          <h2 class="text-xl font-semibold text-emerald-800">Información de salud</h2>

          <!-- Características de salud -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label class="flex items-center">
                <input
                  v-model="petData.vaccinated"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                >
                <span class="ml-2 text-gray-700">Vacunado</span>
              </label>

              <div v-if="petData.vaccinated" class="mt-2">
                <label for="vaccine-info" class="text-xs text-gray-500">Detalles de vacunas</label>
                <input
                  id="vaccine-info"
                  v-model="petData.vaccineInfo"
                  type="text"
                  class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                  placeholder="Especificar vacunas aplicadas..."
                >
              </div>
            </div>

            <div>
              <label class="flex items-center">
                <input
                  v-model="petData.neutered"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                >
                <span class="ml-2 text-gray-700">Esterilizado</span>
              </label>

              <div v-if="petData.neutered" class="mt-2">
                <label for="neuter-date" class="text-xs text-gray-500">Fecha aproximada</label>
                <input
                  id="neuter-date"
                  v-model="petData.neuterDate"
                  type="text"
                  class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                  placeholder="¿Cuándo fue esterilizado?"
                >
              </div>
            </div>

            <div>
              <label class="flex items-center">
                <input
                  v-model="petData.microchipped"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                >
                <span class="ml-2 text-gray-700">Microchip</span>
              </label>

              <div v-if="petData.microchipped" class="mt-2">
                <label for="chip-number" class="text-xs text-gray-500">
                  Número de chip (opcional)
                </label>
                <input
                  id="chip-number"
                  v-model="petData.chipNumber"
                  type="text"
                  class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                  placeholder="Número identificador"
                >
              </div>
            </div>
          </div>

          <!-- Estado de salud -->
          <div class="mt-6">
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Estado de salud general
            </label>
            <div class="flex items-center">
              <input
                v-model.number="petData.healthStatus"
                type="range"
                min="0"
                max="100"
                step="10"
                class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
              >
              <span class="ml-3 text-sm text-gray-700">{{ petData.healthStatus }}%</span>
            </div>
            <div class="mt-1 flex justify-between text-xs text-gray-500">
              <span>Necesita cuidados</span>
              <span>Excelente</span>
            </div>
          </div>

          <!-- Descripción de salud -->
          <div class="mt-4">
            <label for="health-description" class="mb-1 block text-sm font-medium text-gray-700">
              Detalles sobre la salud
            </label>
            <textarea
              id="health-description"
              v-model="petData.healthDescription"
              rows="3"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Detalles sobre el estado de salud, condiciones especiales, medicación, alergias, etc."
              maxlength="300"
            />
            <p class="mt-1 text-sm text-gray-500">
              {{ petData.healthDescription ? petData.healthDescription.length : 0 }}/300 caracteres
            </p>
          </div>

          <!-- Historial médico -->
          <div class="mt-4">
            <label for="medical-history" class="mb-1 block text-sm font-medium text-gray-700">
              Historial médico
            </label>
            <textarea
              id="medical-history"
              v-model="petData.medicalHistory"
              rows="3"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Operaciones, tratamientos previos, enfermedades anteriores, etc."
              maxlength="300"
            />
          </div>
        </div>

        <!-- Sección: Fotos -->
        <div v-if="activeTab === 'photos'" class="space-y-6">
          <h2 class="text-xl font-semibold text-emerald-800">Fotos de la mascota</h2>

          <div class="mb-4 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
            Las fotos de alta calidad aumentan las posibilidades de adopción. Incluye varias fotos
            de diferentes ángulos donde se vea claramente a la mascota.
          </div>

          <!-- Imagen principal actual -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Foto principal actual
            </label>
            <div class="relative mb-4 inline-block">
              <img
                :src="petData.image"
                alt="Imagen principal"
                class="h-48 w-48 rounded-lg border-2 border-gray-200 object-cover"
                @error="handleImageError"
              >
              <div class="mt-2 text-sm text-gray-500">
                Mantén la imagen actual o sube una nueva abajo
              </div>
            </div>
          </div>

          <!-- Nueva imagen principal (opcional) -->
          <div class="mb-6">
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Nueva foto principal (opcional)
            </label>
            <div class="flex items-center">
              <div
                class="mr-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300"
                :class="{ 'border-solid border-emerald-500': mainImagePreview }"
              >
                <img
                  v-if="mainImagePreview"
                  :src="mainImagePreview"
                  alt="Vista previa"
                  class="h-full w-full object-cover"
                >
                <PlusIcon v-else class="h-8 w-8 text-gray-300" />
              </div>
              <div>
                <input
                  ref="mainImageInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleMainImageChange"
                >
                <button
                  type="button"
                  class="rounded-md bg-emerald-100 px-4 py-2 text-emerald-700 hover:bg-emerald-200"
                  @click="$refs.mainImageInput.click()"
                >
                  Seleccionar nueva imagen
                </button>
                <p class="mt-1 text-xs text-gray-500">Formato: JPG, PNG. Max: 5MB</p>
              </div>
            </div>
          </div>

          <!-- Fotos adicionales actuales -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Fotos adicionales actuales
            </label>
            <div
              v-if="petData.photos && petData.photos.length > 1"
              class="mb-4 flex flex-wrap gap-4"
            >
              <div
                v-for="(photo, index) in petData.photos.slice(1)"
                :key="'current-' + index"
                class="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-gray-200"
              >
                <img
                  :src="photo"
                  alt="Foto adicional"
                  class="h-full w-full object-cover"
                  @error="handleImageError"
                >
                <button
                  type="button"
                  class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                  @click="removeCurrentAdditionalImage(index)"
                >
                  ×
                </button>
              </div>
            </div>
            <p v-else class="mb-4 text-sm text-gray-500">
              No hay fotos adicionales. Te recomendamos agregar más fotos para aumentar las
              posibilidades de adopción.
            </p>
          </div>

          <!-- Nuevas fotos adicionales -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Nuevas fotos adicionales (opcional)
            </label>
            <div class="flex flex-wrap gap-4">
              <div
                v-for="(preview, index) in additionalImagePreviews"
                :key="'new-' + index"
                class="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-solid border-emerald-500"
              >
                <img :src="preview" alt="Vista previa" class="h-full w-full object-cover" >
                <button
                  type="button"
                  class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                  @click="removeAdditionalImage(index)"
                >
                  ×
                </button>
              </div>

              <div
                v-if="
                  additionalImagePreviews.length +
                    (petData.photos ? petData.photos.slice(1).length : 0) <
                  5
                "
                class="flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-300"
                @click="$refs.additionalImagesInput.click()"
              >
                <PlusIcon class="h-8 w-8 text-gray-300" />
              </div>

              <input
                ref="additionalImagesInput"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleAdditionalImagesChange"
              >
            </div>
            <p class="mt-2 text-sm text-gray-500">
              Puedes tener hasta 5 fotos adicionales en total. Las mascotas con múltiples fotos
              reciben más solicitudes de adopción.
            </p>
          </div>
        </div>

        <!-- Sección: Contacto -->
        <div v-if="activeTab === 'contact'" class="space-y-6">
          <h2 class="text-xl font-semibold text-emerald-800">Información de contacto</h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Nombre de contacto -->
            <div>
              <label for="contact-name" class="mb-1 block text-sm font-medium text-gray-700">
                Nombre de contacto *
              </label>
              <input
                id="contact-name"
                v-model="petData.contact.name"
                type="text"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
            </div>

            <!-- Tipo de contacto -->
            <div>
              <label for="contact-type" class="mb-1 block text-sm font-medium text-gray-700">
                Tipo de contacto *
              </label>
              <select
                id="contact-type"
                v-model="petData.contact.type"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
                <option value="" disabled>Seleccionar tipo</option>
                <option value="particular">Particular</option>
                <option value="protectora">Protectora/Refugio</option>
                <option value="veterinario">Clínica Veterinaria</option>
              </select>
            </div>

            <!-- Email de contacto -->
            <div>
              <label for="contact-email" class="mb-1 block text-sm font-medium text-gray-700">
                Email de contacto *
              </label>
              <input
                id="contact-email"
                v-model="petData.contact.email"
                type="email"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
            </div>

            <!-- Teléfono de contacto -->
            <div>
              <label for="contact-phone" class="mb-1 block text-sm font-medium text-gray-700">
                Teléfono de contacto *
              </label>
              <input
                id="contact-phone"
                v-model="petData.contact.phone"
                type="tel"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
            </div>
          </div>

          <!-- Información adicional de contacto -->
          <div>
            <label for="contact-notes" class="mb-1 block text-sm font-medium text-gray-700">
              Información adicional de contacto
            </label>
            <textarea
              id="contact-notes"
              v-model="petData.contact.notes"
              rows="3"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Horarios de contacto, formas de contacto preferidas, etc."
            />
          </div>

          <!-- Preferencia de contacto -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">
              Método de contacto preferido
            </label>
            <div class="flex flex-wrap gap-4">
              <label class="inline-flex items-center">
                <input
                  v-model="petData.contact.preferredMethod"
                  type="radio"
                  value="email"
                  class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                >
                <span class="ml-2 text-gray-700">Email</span>
              </label>
              <label class="inline-flex items-center">
                <input
                  v-model="petData.contact.preferredMethod"
                  type="radio"
                  value="phone"
                  class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                >
                <span class="ml-2 text-gray-700">Teléfono</span>
              </label>
              <label class="inline-flex items-center">
                <input
                  v-model="petData.contact.preferredMethod"
                  type="radio"
                  value="whatsapp"
                  class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                >
                <span class="ml-2 text-gray-700">WhatsApp</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Sección: Adopción -->
        <div v-if="activeTab === 'adoption'" class="space-y-6">
          <h2 class="text-xl font-semibold text-emerald-800">Información de adopción</h2>

          <!-- Estado de adopción -->
          <div class="mb-4">
            <label for="status" class="mb-1 block text-sm font-medium text-gray-700">
              Estado de adopción *
            </label>
            <select
              id="status"
              v-model="petData.status"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
            >
              <option value="available">Disponible para adopción</option>
              <option value="pending">En proceso de adopción</option>
              <option value="adopted">Adoptado</option>
              <option value="temp_unavailable">Temporalmente no disponible</option>
            </select>

            <!-- Sección condicional para mascotas adoptadas -->
            <div
              v-if="petData.status === 'adopted'"
              class="mt-4 rounded-md border border-emerald-100 bg-emerald-50 p-4"
            >
              <h3 class="mb-2 text-sm font-medium text-emerald-800">Datos de la adopción</h3>

              <div class="space-y-3">
                <div>
                  <label for="adoption-date" class="block text-xs text-gray-700">
                    Fecha de adopción
                  </label>
                  <input
                    id="adoption-date"
                    v-model="petData.adoptionDate"
                    type="date"
                    class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                  >
                </div>

                <div>
                  <label for="adopter-name" class="block text-xs text-gray-700">
                    Nombre del adoptante
                  </label>
                  <input
                    id="adopter-name"
                    v-model="petData.adopterName"
                    type="text"
                    class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                    placeholder="Nombre de quien adoptó a la mascota"
                  >
                </div>

                <div>
                  <label for="adoption-notes" class="block text-xs text-gray-700">
                    Notas sobre la adopción
                  </label>
                  <textarea
                    id="adoption-notes"
                    v-model="petData.adoptionNotes"
                    rows="2"
                    class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                    placeholder="Información adicional sobre la adopción"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Urgencia -->
          <div class="mb-4">
            <label class="flex items-center">
              <input
                v-model="petData.urgent"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              >
              <span class="ml-2 font-medium text-gray-700">Adopción urgente</span>
            </label>
            <p v-if="petData.urgent" class="ml-6 mt-1 text-sm text-gray-600">
              Marcar como urgente hará que la mascota aparezca destacada en los listados. Reserva
              esta opción para casos realmente urgentes.
            </p>
          </div>

          <!-- Motivo de urgencia -->
          <div v-if="petData.urgent" class="mb-4">
            <label for="urgent-reason" class="mb-1 block text-sm font-medium text-gray-700">
              Motivo de urgencia
            </label>
            <select
              id="urgent-reason"
              v-model="petData.urgentReason"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
            >
              <option value="">Seleccionar motivo</option>
              <option value="health">Problemas de salud</option>
              <option value="shelter">Saturación de refugio</option>
              <option value="time">Plazo límite</option>
              <option value="safety">Situación de riesgo</option>
              <option value="other">Otro motivo</option>
            </select>

            <textarea
              v-if="petData.urgentReason === 'other'"
              v-model="petData.urgentReasonDetails"
              rows="2"
              class="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Especifica el motivo de urgencia"
            />
          </div>

          <!-- Requisitos para la adopción -->
          <div class="mb-4">
            <label for="adoption-requirements" class="mb-1 block text-sm font-medium text-gray-700">
              Requisitos para la adopción
            </label>
            <textarea
              id="adoption-requirements"
              v-model="petData.adoptionRequirements"
              rows="3"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Requisitos que debe cumplir el adoptante (experiencia previa, tipo de vivienda, presencia de otros animales, etc.)"
            />
          </div>

          <!-- Cuota de adopción -->
          <div class="mb-4">
            <label for="adoption-fee" class="mb-1 block text-sm font-medium text-gray-700">
              Cuota de adopción (opcional)
            </label>
            <div class="flex items-center">
              <span
                class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500"
              >
                $
              </span>
              <input
                id="adoption-fee"
                v-model.number="petData.adoptionFee"
                type="number"
                min="0"
                step="0.01"
                class="w-full rounded-r-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="0.00"
              >
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Si solicitas una cuota de adopción, especifica qué incluye (vacunas, castración,
              etc.).
            </p>
          </div>

          <!-- Detalles de cuota de adopción -->
          <div v-if="petData.adoptionFee > 0" class="mb-4">
            <label for="fee-details" class="mb-1 block text-sm font-medium text-gray-700">
              ¿Qué incluye la cuota de adopción?
            </label>
            <textarea
              id="fee-details"
              v-model="petData.feeDetails"
              rows="2"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Ej: Vacunas, esterilización, microchip, etc."
            />
          </div>

          <!-- Contrato de adopción -->
          <div class="mb-4">
            <label class="flex items-center">
              <input
                v-model="petData.requiresContract"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              >
              <span class="ml-2 text-gray-700">Requiere contrato de adopción</span>
            </label>
          </div>

          <!-- Seguimiento post-adopción -->
          <div class="mb-4">
            <label class="flex items-center">
              <input
                v-model="petData.requiresFollowUp"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              >
              <span class="ml-2 text-gray-700">Requiere seguimiento post-adopción</span>
            </label>

            <div v-if="petData.requiresFollowUp" class="ml-6 mt-2">
              <label for="follow-up-details" class="text-xs text-gray-500">
                Detalles del seguimiento
              </label>
              <textarea
                id="follow-up-details"
                v-model="petData.followUpDetails"
                rows="2"
                class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                placeholder="Frecuencia y tipo de seguimiento requerido"
              />
            </div>
          </div>
        </div>

        <!-- Botones de acción siempre visibles abajo -->
        <div class="mt-8 flex justify-between border-t border-gray-200 pt-6">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
            @click="router.back()"
          >
            Cancelar
          </button>

          <div class="space-x-2">
            <button
              v-if="petData.status !== 'adopted'"
              type="button"
              class="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-700 hover:bg-emerald-100"
              @click="previewMode = !previewMode"
            >
              <EyeIcon v-if="!previewMode" class="mr-1 inline-block h-4 w-4" />
              <EyeOffIcon v-else class="mr-1 inline-block h-4 w-4" />
              {{ previewMode ? 'Ocultar vista previa' : 'Vista previa' }}
            </button>

            <button
              type="submit"
              class="rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center">
                <svg
                  class="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Actualizando...
              </span>
              <span v-else>Guardar cambios</span>
            </button>
          </div>
        </div>

        <!-- Vista previa -->
        <div v-if="previewMode" class="mt-8 border-t border-gray-200 pt-6">
          <h2 class="mb-4 text-xl font-semibold text-emerald-800">
            Vista previa de la publicación
          </h2>

          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div class="flex flex-col md:flex-row">
              <div class="mb-4 md:mb-0 md:mr-6 md:w-1/3">
                <img
                  :src="mainImagePreview || petData.image"
                  alt="Foto principal"
                  class="h-64 w-full rounded-lg object-cover shadow-sm"
                  @error="handleImageError"
                >

                <div class="mt-2 flex flex-wrap gap-2">
                  <img
                    v-for="(photo, index) in previewPhotos.slice(0, 4)"
                    :key="index"
                    :src="photo"
                    alt="Foto adicional"
                    class="h-16 w-16 rounded-md object-cover"
                    @error="handleImageError"
                  >
                </div>
              </div>

              <div class="md:w-2/3">
                <div class="flex items-center justify-between">
                  <h3 class="text-2xl font-bold text-gray-800">{{ petData.name }}</h3>
                  <div
                    v-if="petData.urgent"
                    class="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800"
                  >
                    URGENTE
                  </div>
                </div>

                <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                  <span>{{ petData.type }}</span>
                  <span>{{ petData.gender === 'macho' ? 'Macho' : 'Hembra' }}</span>
                  <span>{{ petData.age }}</span>
                  <span>{{ petData.size }}</span>
                  <span>{{ petData.location }}</span>
                </div>

                <div class="mt-4">
                  <h4 class="font-medium text-gray-800">Descripción</h4>
                  <p class="mt-1 text-gray-600">{{ petData.description }}</p>
                </div>

                <div class="mt-4 flex flex-wrap gap-2">
                  <span
                    v-if="petData.vaccinated"
                    class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800"
                  >
                    Vacunado
                  </span>
                  <span
                    v-if="petData.neutered"
                    class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800"
                  >
                    Esterilizado
                  </span>
                  <span
                    v-if="petData.microchipped"
                    class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800"
                  >
                    Microchip
                  </span>
                </div>

                <div class="mt-4">
                  <h4 class="font-medium text-gray-800">Contactar con</h4>
                  <p class="mt-1 text-gray-600">
                    {{ petData.contact.name }} ({{
                      petData.contact.type === 'particular'
                        ? 'Particular'
                        : petData.contact.type === 'protectora'
                          ? 'Protectora/Refugio'
                          : 'Clínica Veterinaria'
                    }})
                  </p>
                  <p class="text-gray-600">
                    {{ petData.contact.email }} / {{ petData.contact.phone }}
                  </p>
                </div>

                <div v-if="petData.adoptionRequirements" class="mt-4">
                  <h4 class="font-medium text-gray-800">Requisitos para adopción</h4>
                  <p class="mt-1 text-gray-600">{{ petData.adoptionRequirements }}</p>
                </div>

                <div v-if="petData.adoptionFee > 0" class="mt-4">
                  <h4 class="font-medium text-gray-800">Cuota de adopción</h4>
                  <p class="mt-1 text-gray-600">
                    ${{ petData.adoptionFee }} - {{ petData.feeDetails }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PlusIcon, EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { usePets } from '~/composables/usePets'
import { useS3 } from '~/composables/useS3'

// Router y route
const route = useRoute()
const router = useRouter()
const petId = route.params.id

// Composables
const { user, isLoggedIn } = useAuth()
const { fetchPetById, updatePet, loading, error } = usePets()

// Estado inicial de carga
const initialLoading = ref(true)
const loadError = ref(null)
const isAuthorized = ref(false)
const activeTab = ref('info')
const previewMode = ref(false)

// Referencias para el input de archivos
const mainImageInput = ref(null)
const additionalImagesInput = ref(null)

// Estados para previews de imágenes
const mainImagePreview = ref('')
const mainImageFile = ref(null)
const additionalImagePreviews = ref([])
const additionalImageFiles = ref([])

// Datos de la mascota
const petData = reactive({
  name: '',
  type: '',
  typeValue: '',
  breed: '',
  age: '',
  ageValue: '',
  gender: '',
  size: '',
  sizeValue: '',
  location: '',
  description: '',
  urgent: false,
  urgentReason: '',
  urgentReasonDetails: '',
  vaccinated: false,
  vaccineInfo: '',
  neutered: false,
  neuterDate: '',
  microchipped: false,
  chipNumber: '',
  healthStatus: 80,
  healthDescription: '',
  medicalHistory: '',
  adoptionRequirements: '',
  adoptionFee: 0,
  feeDetails: '',
  requiresContract: false,
  requiresFollowUp: false,
  followUpDetails: '',
  contact: {
    name: '',
    email: '',
    phone: '',
    type: '',
    notes: '',
    preferredMethod: 'email',
  },
  image: '', // URL de la imagen principal
  photos: [], // URLs de fotos adicionales
  createdAt: '',
  userId: '',
  status: 'available',
  adoptionDate: '',
  adopterName: '',
  adoptionNotes: '',
})

// Fotos para la vista previa
const previewPhotos = computed(() => {
  const currentPhotos = petData.photos ? petData.photos.slice(1) : []
  const newPhotoPreviews = additionalImagePreviews.value
  return [...currentPhotos, ...newPhotoPreviews]
})

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    // Verificar si el usuario está autenticado
    if (!isLoggedIn) {
      loadError.value = 'Debes iniciar sesión para editar una mascota'
      initialLoading.value = false
      return
    }

    // Cargar datos de la mascota
    const pet = await fetchPetById(petId)

    if (!pet) {
      loadError.value = 'No se encontró la mascota solicitada'
      initialLoading.value = false
      return
    }

    // Verificar si el usuario actual es el propietario
    isAuthorized.value = pet.userId === user.value?.uid

    if (!isAuthorized.value) {
      loadError.value = 'No estás autorizado para editar esta mascota'
      initialLoading.value = false
      return
    }

    // Cargar los datos de la mascota en el formulario
    Object.assign(petData, pet)

    // Inicializar campos que podrían no existir en versiones antiguas
    if (!petData.contact.preferredMethod) {
      petData.contact.preferredMethod = 'email'
    }

    if (!petData.contact.notes) {
      petData.contact.notes = ''
    }

    initialLoading.value = false
  } catch (err) {
    console.error('Error al cargar datos de la mascota:', err)
    loadError.value = 'Error al cargar los datos. Inténtalo de nuevo.'
    initialLoading.value = false
  }
})

// Manejo de la imagen principal
const handleMainImageChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validación de tamaño (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen es demasiado grande. El tamaño máximo es 5MB.')
    return
  }

  // Validación de tipo (solo imágenes)
  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten archivos de imagen.')
    return
  }

  mainImageFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    mainImagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Manejo de imágenes adicionales
const handleAdditionalImagesChange = (event) => {
  const files = Array.from(event.target.files)
  if (!files.length) return

  // Calcular cuántos slots disponibles quedan
  const currentAdditionalPhotos = petData.photos ? petData.photos.slice(1).length : 0
  const remainingSlots = 5 - currentAdditionalPhotos - additionalImagePreviews.value.length

  if (remainingSlots <= 0) {
    alert('Ya has alcanzado el límite de 5 fotos adicionales.')
    return
  }

  const filesToProcess = files.slice(0, remainingSlots)

  filesToProcess.forEach((file) => {
    // Validación de tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(`La imagen ${file.name} es demasiado grande. El tamaño máximo es 5MB.`)
      return
    }

    // Validación de tipo (solo imágenes)
    if (!file.type.startsWith('image/')) {
      alert(`El archivo ${file.name} no es una imagen.`)
      return
    }

    additionalImageFiles.value.push(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      additionalImagePreviews.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

// Eliminar una imagen adicional actual
const removeCurrentAdditionalImage = (index) => {
  if (petData.photos) {
    // El índice es +1 porque estamos trabajando con las fotos adicionales (sin la principal)
    petData.photos.splice(index + 1, 1)
  }
}

// Eliminar una nueva imagen adicional
const removeAdditionalImage = (index) => {
  additionalImagePreviews.value.splice(index, 1)
  additionalImageFiles.value.splice(index, 1)
}

// Función para manejar error al cargar imagen
const handleImageError = (event) => {
  event.target.src = '/placeholder.webp'
}

// Actualizar las etiquetas basadas en los valores seleccionados
const updateTypeLabel = () => {
  switch (petData.typeValue) {
    case 'perro':
      petData.type = 'Perro'
      break
    case 'gato':
      petData.type = 'Gato'
      break
    case 'ave':
      petData.type = 'Ave'
      break
    case 'conejo':
      petData.type = 'Conejo'
      break
    case 'otro':
      petData.type = 'Otro'
      break
    default:
      petData.type = ''
  }
}

const updateSizeLabel = () => {
  switch (petData.sizeValue) {
    case 'pequeño':
      petData.size = 'Pequeño'
      break
    case 'mediano':
      petData.size = 'Mediano'
      break
    case 'grande':
      petData.size = 'Grande'
      break
    default:
      petData.size = ''
  }
}

// Subir imágenes nuevas a AWS S3
const uploadNewImages = async () => {
  const { uploadFile } = useS3()
  const userId = user.value?.uid || 'anonymous'
  const timestamp = Date.now()
  const results = { mainImageUrl: null, additionalImageUrls: [] }

  // Subir imagen principal si hay una nueva
  if (mainImageFile.value) {
    const fileExtension = mainImageFile.value.name.split('.').pop()
    const mainImageName = `main_${timestamp}.${fileExtension}`

    // Subir imagen principal con optimización
    results.mainImageUrl = await uploadFile(
      mainImageFile.value,
      `pets/${userId}/${petId}`,
      mainImageName,
      {
        // Opciones de optimización personalizadas para la imagen principal (mejor calidad)
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        quality: 0.85
      }
    )
  }

  // Subir imágenes adicionales nuevas
  if (additionalImageFiles.value.length > 0) {
    for (let i = 0; i < additionalImageFiles.value.length; i++) {
      const file = additionalImageFiles.value[i]
      const fileName = `additional_${timestamp}_${i}.${file.name.split('.').pop()}`

      // Subir imagen adicional con optimización
      const url = await uploadFile(
        file, 
        `pets/${userId}/${petId}`, 
        fileName,
        {
          // Las imágenes adicionales pueden tener menor calidad para ahorrar espacio
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1000,
          quality: 0.8
        }
      )
      results.additionalImageUrls.push(url)
    }
  }

  return results
}

// Guardar cambios de la mascota
const updateForm = async () => {
  try {
    // Preparar objeto con actualizaciones
    const updates = { ...petData }

    // Si pasó a "adoptado", añadir la fecha de adopción si no tiene
    if (updates.status === 'adopted' && !updates.adoptionDate) {
      updates.adoptionDate = new Date().toISOString().split('T')[0]
    }

    // Subir imágenes nuevas si las hay
    if (mainImageFile.value || additionalImageFiles.value.length > 0) {
      const { mainImageUrl, additionalImageUrls } = await uploadNewImages()

      // Actualizar imagen principal si hay una nueva
      if (mainImageUrl) {
        updates.image = mainImageUrl

        // Actualizar también en el array de fotos si existe
        if (updates.photos && updates.photos.length > 0) {
          updates.photos[0] = mainImageUrl
        } else {
          updates.photos = [mainImageUrl]
        }
      }

      // Añadir nuevas imágenes adicionales si hay
      if (additionalImageUrls.length > 0) {
        if (!updates.photos) updates.photos = [updates.image]
        updates.photos = [...updates.photos, ...additionalImageUrls]
      }
    }

    // Actualizar la mascota en la base de datos
    await updatePet(petId, updates)

    // Mostrar mensaje de éxito
    alert('Mascota actualizada correctamente')

    // Redirigir a la página de detalle de la mascota
    router.push(`/mascotas/${petId}`)
  } catch (err) {
    console.error('Error al actualizar mascota:', err)
    error.value = 'Error al actualizar la mascota. Por favor, inténtalo de nuevo.'
  }
}
</script>

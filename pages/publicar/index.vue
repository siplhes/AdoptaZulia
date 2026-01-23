<template>
  <div class="min-h-screen bg-amber-50 py-8">
    <div class="container mx-auto px-4">
      <h1 class="mb-2 text-3xl font-bold text-emerald-800">Publicar mascota</h1>
      <p class="mb-6 text-gray-600">
        Ayuda a una mascota a encontrar un hogar completando el formulario.
      </p>

      <!-- Estado de usuario no autenticado -->
      <div
        v-if="!isAuthenticated"
        class="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-md"
      >
        <div class="flex flex-col items-center justify-between sm:flex-row">
          <div class="mb-4 sm:mb-0">
            <h2 class="mb-1 text-xl font-semibold text-emerald-800">
              Necesitas una cuenta para publicar
            </h2>
            <p class="text-gray-600">
              Inicia sesión o regístrate para publicar una mascota en adopción.
            </p>
          </div>
          <div class="flex space-x-4">
            <NuxtLink
              to="/login"
              class="rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700"
            >
              Iniciar sesión
            </NuxtLink>

          </div>
        </div>
      </div>

      <!-- Formulario de publicación (wizard por pasos) -->
      <form v-else class="rounded-lg bg-white p-6 shadow-md" @submit.prevent="submitForm">
        <!-- Barra de progreso -->
        <div class="mb-6">
          <div class="mb-2 flex items-center justify-between text-sm text-gray-600">
            <div class="font-medium">Paso {{ currentStep }} de {{ steps.length }}</div>
            <div class="font-medium text-emerald-700">{{ steps[currentStep-1].title }}</div>
          </div>
          <div class="h-2 w-full rounded-full bg-gray-200">
            <div :style="{ width: `${Math.round((currentStep/steps.length)*100)}%` }" class="h-2 rounded-full bg-emerald-600 transition-all duration-300" />
          </div>
          
          <!-- Indicador de campos requeridos en el paso actual -->
          <div class="mt-3 flex gap-2">
            <span v-for="(step, index) in steps" :key="index" class="flex items-center gap-1 text-xs">
              <span
                class="flex h-5 w-5 items-center justify-center rounded-full text-white text-xs font-medium"
                :class="currentStep > index + 1 ? 'bg-emerald-600' : currentStep === index + 1 ? 'bg-emerald-500' : 'bg-gray-300'"
              >
                {{ index + 1 }}
              </span>
            </span>
          </div>
        </div>
        <!-- Error general -->
        <div
          v-if="error"
          role="alert"
          aria-live="assertive"
          class="relative mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          <div class="flex gap-3">
            <Icon name="mdi:alert-circle" class="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{{ error }}</span>
          </div>
        </div>

        <!-- Información útil según el paso actual -->
        <div
          v-if="currentStep === 1"
          class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4"
          role="note"
        >
          <div class="flex gap-3">
            <Icon name="mdi:information" class="h-5 w-5 flex-shrink-0 text-blue-700 mt-0.5" />
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-1">Información básica sobre la mascota</p>
              <p>Completa todos los campos requeridos marcados con <span class="text-red-500">*</span> para continuar.</p>
            </div>
          </div>
        </div>

        <div
          v-if="currentStep === 2"
          class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4"
          role="note"
        >
          <div class="flex gap-3">
            <Icon name="mdi:information" class="h-5 w-5 flex-shrink-0 text-blue-700 mt-0.5" />
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-1">Fotos de la mascota</p>
              <p>Sube al menos una foto principal de buena calidad. Las fotos adicionales ayudan a los potenciales adoptantes.</p>
            </div>
          </div>
        </div>

        <div
          v-if="currentStep === 3"
          class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4"
          role="note"
        >
          <div class="flex gap-3">
            <Icon name="mdi:information" class="h-5 w-5 flex-shrink-0 text-blue-700 mt-0.5" />
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-1">Información de contacto</p>
              <p>Los potenciales adoptantes usarán estos datos para contactarte. Asegúrate de que sean correctos.</p>
            </div>
          </div>
        </div>

        <div v-show="currentStep === 1" class="mb-8">
          <h2 class="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-emerald-800">
            Información básica
          </h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Nombre -->
            <div>
              <label for="name" class="mb-1 block text-sm font-medium text-gray-700">
                Nombre de la mascota <span class="text-red-500">*</span>
              </label>
              <input
                  id="name"
                  ref="nameInput"
                  v-model="petData.name"
                  type="text"
                  required
                  :aria-invalid="invalidFields.name ? 'true' : 'false'"
                  class="w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-emerald-500"
                  :class="invalidFields.name ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'"
                >
              <p v-if="invalidFields.name" class="mt-1 text-sm text-red-600">{{ fieldErrors.name }}</p>
            </div>

            <!-- Tipo de mascota -->
            <div>
              <label for="type" class="mb-1 block text-sm font-medium text-gray-700">
                Tipo de mascota <span class="text-red-500">*</span>
              </label>
              <select
                id="type"
                ref="typeInput"
                v-model="petData.typeValue"
                required
                :aria-invalid="invalidFields.typeValue ? 'true' : 'false'"
                class="w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-emerald-500"
                :class="invalidFields.typeValue ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'"
                @change="updateTypeLabel"
              >
                <option value="" disabled>Seleccionar tipo</option>
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="ave">Ave</option>
                <option value="conejo">Conejo</option>
                <option value="otro">Otro</option>
              </select>
              <p v-if="invalidFields.typeValue" class="mt-1 text-sm text-red-600">{{ fieldErrors.typeValue }}</p>
            </div>

            <!-- Raza -->
            <div>
              <label for="breed" class="mb-1 block text-sm font-medium text-gray-700">Raza</label>
              <input
                id="breed"
                v-model="petData.breed"
                type="text"
                :aria-invalid="invalidFields.breed ? 'true' : 'false'"
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              >
            </div>

            <!-- Género -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Género <span class="text-red-500">*</span></label>
              <div class="flex space-x-4" role="radiogroup" aria-labelledby="gender-label">
                <label class="inline-flex items-center">
                  <input
                    v-model="petData.gender"
                    type="radio"
                    value="macho"
                    class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    required
                    ref="genderInput"
                    :aria-invalid="invalidFields.gender ? 'true' : 'false'"
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
              <p v-if="invalidFields.gender" class="mt-1 text-sm text-red-600">{{ fieldErrors.gender }}</p>
            </div>

            <!-- Edad -->
            <div>
              <label for="age" class="mb-1 block text-sm font-medium text-gray-700">
                Edad aproximada <span class="text-red-500">*</span>
              </label>
              <input
                id="age"
                ref="ageInput"
                v-model="petData.age"
                type="text"
                required
                :aria-invalid="invalidFields.age ? 'true' : 'false'"
                class="w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-emerald-500"
                :class="invalidFields.age ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'"
                placeholder="Por ejemplo: 2 años, 6 meses..."
              >
              <p v-if="invalidFields.age" class="mt-1 text-sm text-red-600">{{ fieldErrors.age }}</p>
            </div>

            <!-- Rango de edad -->
            <div>
              <label for="age-range" class="mb-1 block text-sm font-medium text-gray-700">
                Rango de edad <span class="text-red-500">*</span>
              </label>
              <select
                id="age-range"
                ref="ageRangeInput"
                v-model="petData.ageValue"
                required
                :aria-invalid="invalidFields.ageValue ? 'true' : 'false'"
                class="w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-emerald-500"
                :class="invalidFields.ageValue ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'"
              >
                <option value="" disabled>Seleccionar rango</option>
                <option value="cachorro">Cachorro</option>
                <option value="joven">Joven</option>
                <option value="adulto">Adulto</option>
                <option value="senior">Senior</option>
              </select>
              <p v-if="invalidFields.ageValue" class="mt-1 text-sm text-red-600">{{ fieldErrors.ageValue }}</p>
            </div>

            <!-- Tamaño -->
            <div>
              <label for="size" class="mb-1 block text-sm font-medium text-gray-700">
                Tamaño <span class="text-red-500">*</span>
              </label>
              <select
                id="size"
                ref="sizeInput"
                v-model="petData.sizeValue"
                required
                :aria-invalid="invalidFields.sizeValue ? 'true' : 'false'"
                class="w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-emerald-500"
                :class="invalidFields.sizeValue ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'"
                @change="updateSizeLabel"
              >
                <option value="" disabled>Seleccionar tamaño</option>
                <option value="pequeño">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
              <p v-if="invalidFields.sizeValue" class="mt-1 text-sm text-red-600">{{ fieldErrors.sizeValue }}</p>
            </div>

            <!-- Ubicación -->
            <div>
              <label for="location" class="mb-1 block text-sm font-medium text-gray-700">
                Ubicación <span class="text-red-500">*</span>
              </label>
              <input
                id="location"
                ref="locationInput"
                v-model="petData.location"
                type="text"
                required
                :aria-invalid="invalidFields.location ? 'true' : 'false'"
                class="w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-emerald-500"
                :class="invalidFields.location ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'"
                placeholder="Ciudad o municipio"
              >
              <p v-if="invalidFields.location" class="mt-1 text-sm text-red-600">{{ fieldErrors.location }}</p>
            </div>
          </div>

          <!-- Descripción -->
          <div class="mt-6">
            <label for="description" class="mb-1 block text-sm font-medium text-gray-700">
              Descripción <span class="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              ref="descriptionInput"
              v-model="petData.description"
              rows="4"
              required
              :aria-invalid="invalidFields.description ? 'true' : 'false'"
              class="w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-emerald-500"
              :class="invalidFields.description ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'"
              placeholder="Describe la personalidad, hábitos, por qué está en adopción y cualquier otra información relevante..."
            />
            <div class="mt-1 flex justify-between">
              <p v-if="invalidFields.description" class="text-sm text-red-600">{{ fieldErrors.description }}</p>
              <p :class="petData.description.length > 450 ? 'text-orange-600' : 'text-gray-500'" class="text-sm">
                {{ petData.description.length }}/500 caracteres
              </p>
            </div>
          </div>

          <!-- Características de salud -->
          <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
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
                <label for="vaccine-info" class="text-xs text-gray-500">Detalles de vacunación</label>
                <input
                  id="vaccine-info"
                  v-model="petData.vaccineInfo"
                  type="text"
                  class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                  placeholder="Tipo de vacunas recibidas"
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
                <label for="chip-number" class="text-xs text-gray-500">Número de chip</label>
                <input
                  id="chip-number"
                  v-model="petData.chipNumber"
                  type="text"
                  class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                  placeholder="Número de identificación"
                >
              </div>
            </div>
          </div>

          <!-- Estado de salud -->
          <div class="mt-6">
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Estado de salud general
            </label>
            <input
              v-model.number="petData.healthStatus"
              type="range"
              min="0"
              max="100"
              step="10"
              class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
            >
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
              rows="2"
              class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              placeholder="Detalles sobre el estado de salud, condiciones especiales, medicación, etc."
            />
          </div>
        </div>

        <!-- Sección de fotos -->
        <div v-show="currentStep === 2" class="mb-8">
          <h2 class="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-emerald-800">
            Fotos
          </h2>

          <!-- Imagen principal -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700">Foto principal <span class="text-red-500">*</span></label>
            <div class="flex items-center">
              <div
                class="mr-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-2"
                :class="invalidFields.mainImage ? 'border-red-400 bg-red-50' : mainImagePreview ? 'border-solid border-emerald-500' : 'border-dashed border-gray-300'"
              >
                <NuxtImg
                  v-if="mainImagePreview"
                  :src="mainImagePreview"
                  alt="Vista previa"
                  class="h-full w-full object-cover"
                  loading="lazy"
                  sizes="96px"
                  placeholder
                />
                <Icon v-else name="mdi:plus" class="h-8 w-8 text-gray-300" />
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
                  class="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                  @click="$refs.mainImageInput.click()"
                >
                  Seleccionar imagen
                </button>
                <p v-if="invalidFields.mainImage" class="mt-1 text-sm text-red-600">{{ fieldErrors.mainImage }}</p>
                <p class="mt-1 text-xs text-gray-500">Formato: JPG, PNG. Max: 5MB</p>
              </div>
            </div>
          </div>

          <!-- Fotos adicionales -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Fotos adicionales (opcional)
            </label>
            <div class="flex flex-wrap gap-4">
              <div
                v-for="(preview, index) in additionalImagePreviews"
                :key="index"
                class="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-solid border-emerald-500"
              >
                <NuxtImg 
                  :src="preview" 
                  alt="Vista previa" 
                  class="h-full w-full object-cover"  
                  loading="lazy"
                  sizes="96px"
                  placeholder
                />
                <button
                  type="button"
                  class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                  @click="removeAdditionalImage(index)"
                />
              </div>

              <div
                v-if="additionalImagePreviews.length < 5"
                class="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300"
                @click="$refs.additionalImagesInput.click()"
              >
                <Icon name="mdi:plus" class="h-8 w-8 text-gray-300" />
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
            <p class="mt-1 text-xs text-gray-500">Puedes añadir hasta 5 fotos adicionales</p>
          </div>
        </div>

        <!-- Sección de contacto -->
        <div v-show="currentStep === 3" class="mb-8">
          <h2 class="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-emerald-800">
            Información de contacto
          </h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Nombre de contacto -->
            <div>
              <label for="contact-name" class="mb-1 block text-sm font-medium text-gray-700">
                Nombre de contacto <span class="text-red-500">*</span>
              </label>
              <input
                id="contact-name"
                ref="contactNameInput"
                v-model="petData.contact.name"
                type="text"
                required
                :aria-invalid="invalidFields.contactName ? 'true' : 'false'"
                class="w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-emerald-500"
                :class="invalidFields.contactName ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'"
              >
              <p v-if="invalidFields.contactName" class="mt-1 text-sm text-red-600">{{ fieldErrors.contactName }}</p>
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
                Email de contacto <span class="text-red-500">*</span>
              </label>
              <input
                id="contact-email"
                ref="contactEmailInput"
                v-model="petData.contact.email"
                type="email"
                required
                :aria-invalid="invalidFields.contactEmail ? 'true' : 'false'"
                class="w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-emerald-500"
                :class="invalidFields.contactEmail ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'"
              >
              <p v-if="invalidFields.contactEmail" class="mt-1 text-sm text-red-600">{{ fieldErrors.contactEmail }}</p>
            </div>

            <!-- Teléfono de contacto -->
            <div>
              <label for="contact-phone" class="mb-1 block text-sm font-medium text-gray-700">
                Teléfono de contacto <span class="text-red-500">*</span>
              </label>
              <input
                id="contact-phone"
                ref="contactPhoneInput"
                v-model="petData.contact.phone"
                type="tel"
                required
                :aria-invalid="invalidFields.contactPhone ? 'true' : 'false'"
                class="w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-emerald-500"
                :class="invalidFields.contactPhone ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'"
              >
              <p v-if="invalidFields.contactPhone" class="mt-1 text-sm text-red-600">{{ fieldErrors.contactPhone }}</p>
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
          <div class="mt-4">
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

        <!-- Sección de adopción -->
        <div v-show="currentStep === 4" class="mb-8">
          <h2 class="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-emerald-800">
            Información de adopción
          </h2>

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
            <p v-if="petData.urgent" class="ml-6 mt-1 text-xs text-gray-500">
              Marcar como urgente hará que la mascota aparezca destacada en los listados.
            </p>
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
              placeholder="Requisitos que debe cumplir el adoptante (opcional)"
            />
          </div>
          
          <!-- Cuota de adopción -->
  

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

        <!-- Botones de acción del wizard -->
        <div class="flex justify-between">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
            @click="onCancel"
          >
            Cancelar
          </button>

          <div class="flex space-x-4">
            <button
              v-if="currentStep > 1"
              type="button"
              class="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
              @click="prevStep"
            >
              Atrás
            </button>

            <button
              v-if="currentStep < steps.length"
              type="button"
              class="rounded-lg border border-emerald-600 px-6 py-2 text-emerald-600 hover:bg-emerald-50"
              @click="nextStep"
            >
              Siguiente
            </button>

            <div v-else class="flex items-center gap-4">
              <button
                type="button"
                class="rounded-lg border border-emerald-600 px-6 py-2 text-emerald-600 hover:bg-emerald-50"
                :disabled="loading"
                @click="saveAsDraft"
              >
                Guardar borrador
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
                  Publicando...
                </span>
                <span v-else>Publicar</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
    
    <!-- Modal para mensajes -->
    <ModalAlert
      :show="showModal"
      :type="modalType"
      :title="modalTitle"
      :message="modalMessage"
      :confirm-button-text="modalConfirmText"
      @confirm="closeModal"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { usePets } from '~/composables/usePets'
import { useS3 } from '~/composables/useS3'
import ModalAlert from '~/components/common/ModalAlert.vue'

// Router
const router = useRouter()

// Composables
const { user, isAuthenticated } = useAuth()
const { createPet, loading, error } = usePets()

// Referencias para el input de archivos
const mainImageInput = ref(null)
const additionalImagesInput = ref(null)

// Estados para previews de imágenes
const mainImagePreview = ref('')
const mainImageFile = ref(null)
const additionalImagePreviews = ref([])
const additionalImageFiles = ref([])

// Invalid fields map for accessibility and aria-invalid
const invalidFields = reactive({
  name: false,
  typeValue: false,
  gender: false,
  age: false,
  ageValue: false,
  sizeValue: false,
  location: false,
  description: false,
  contactName: false,
  contactEmail: false,
  contactPhone: false,
  mainImage: false
})

// Field error messages
const fieldErrors = reactive({
  name: '',
  typeValue: '',
  gender: '',
  age: '',
  ageValue: '',
  sizeValue: '',
  location: '',
  description: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  mainImage: ''
})

// Wizard: pasos y estado
const steps = [
  { title: 'Datos básicos' },
  { title: 'Fotos & Salud' },
  { title: 'Contacto' },
  { title: 'Adopción' }
]
const currentStep = ref(1)

const validateStep = () => {
  // Reset invalid fields map
  for (const k in invalidFields) {
    invalidFields[k] = false
    fieldErrors[k] = ''
  }

  const errors = []

  if (currentStep.value === 1) {
    if (!petData.name) {
      errors.push({ field: 'name', msg: 'Nombre de la mascota es obligatorio.' })
      fieldErrors.name = 'Campo requerido'
    }
    if (!petData.typeValue) {
      errors.push({ field: 'typeValue', msg: 'Selecciona el tipo de mascota.' })
      fieldErrors.typeValue = 'Campo requerido'
    }
    if (!petData.gender) {
      errors.push({ field: 'gender', msg: 'Selecciona el género.' })
      fieldErrors.gender = 'Campo requerido'
    }
    if (!petData.age) {
      errors.push({ field: 'age', msg: 'Indica la edad aproximada.' })
      fieldErrors.age = 'Campo requerido'
    }
    if (!petData.ageValue) {
      errors.push({ field: 'ageValue', msg: 'Selecciona un rango de edad.' })
      fieldErrors.ageValue = 'Campo requerido'
    }
    if (!petData.sizeValue) {
      errors.push({ field: 'sizeValue', msg: 'Selecciona el tamaño.' })
      fieldErrors.sizeValue = 'Campo requerido'
    }
    if (!petData.location) {
      errors.push({ field: 'location', msg: 'Indica la ubicación (ciudad o municipio).' })
      fieldErrors.location = 'Campo requerido'
    }
    if (!(petData.description || '').trim() || petData.description.trim().length < 10) {
      errors.push({ field: 'description', msg: 'Describe la mascota con al menos 10 caracteres.' })
      fieldErrors.description = 'Se requieren mínimo 10 caracteres'
    }
  }

  if (currentStep.value === 2) {
    if (!mainImagePreview.value && !mainImageFile.value) {
      errors.push({ field: 'mainImage', msg: 'Sube al menos una foto principal.' })
      fieldErrors.mainImage = 'Campo requerido'
    }
  }

  if (currentStep.value === 3) {
    if (!petData.contact.name) {
      errors.push({ field: 'contactName', msg: 'Nombre de contacto obligatorio.' })
      fieldErrors.contactName = 'Campo requerido'
    }
    if (!petData.contact.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(petData.contact.email)) {
      errors.push({ field: 'contactEmail', msg: 'Proporciona un email válido.' })
      fieldErrors.contactEmail = 'Email inválido'
    }
    if (!petData.contact.phone || !/^[0-9()+\-\s]{6,20}$/.test(petData.contact.phone)) {
      errors.push({ field: 'contactPhone', msg: 'Proporciona un teléfono válido (6-20 dígitos).' })
      fieldErrors.contactPhone = 'Teléfono inválido'
    }
  }

  if (errors.length > 0) {
    // Mark invalid fields
    errors.forEach(e => {
      invalidFields[e.field] = true
    })

    // Build message list
    const list = errors.map(e => `• ${e.msg}`).join('\n')
    showModalAlert('warning', 'Completa todos los campos requeridos', `Por favor, corrige los siguientes campos:\n${list}`)

    // Focus first invalid field
    const first = errors[0].field
    setTimeout(() => {
      focusField(first)
    }, 50)

    return false
  }

  return true
}

const nextStep = () => {
  if (currentStep.value >= steps.length) return
  if (validateStep()) {
    currentStep.value += 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value -= 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const onCancel = () => {
  // Confirmación simple antes de cancelar para usuarios poco técnicos
  if (confirm('¿Seguro que deseas cancelar la publicación? Los datos no guardados se perderán.')) {
    router.back()
  }
}

// Accessibility helpers: focus fields by name
const focusField = (field) => {
  try {
    switch (field) {
      case 'name':
        nameInput.value?.focus()
        break
      case 'typeValue':
        typeInput.value?.focus()
        break
      case 'gender':
        genderInput.value?.focus()
        break
      case 'age':
        ageInput.value?.focus()
        break
      case 'ageValue':
        ageRangeInput.value?.focus()
        break
      case 'sizeValue':
        sizeInput.value?.focus()
        break
      case 'location':
        locationInput.value?.focus()
        break
      case 'description':
        descriptionInput.value?.focus()
        break
      case 'contactName':
        contactNameInput.value?.focus()
        break
      case 'contactEmail':
        contactEmailInput.value?.focus()
        break
      case 'contactPhone':
        contactPhoneInput.value?.focus()
        break
      case 'mainImage':
        mainImageInput.value?.focus()
        break
      default:
        // nothing
    }
  } catch (e) {
    // ignore
  }
}

// Refs proxy for template refs
const nameInput = ref(null)
const typeInput = ref(null)
const genderInput = ref(null)
const ageInput = ref(null)
const ageRangeInput = ref(null)
const sizeInput = ref(null)
const locationInput = ref(null)
const descriptionInput = ref(null)
const contactNameInput = ref(null)
const contactEmailInput = ref(null)
const contactPhoneInput = ref(null)

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
  urgentReason: '', // Motivo de urgencia
  urgentReasonDetails: '', // Detalles adicionales sobre la urgencia
  vaccinated: false,
  vaccineInfo: '', // Detalles de vacunación
  neutered: false,
  neuterDate: '', // Fecha de esterilización
  microchipped: false,
  chipNumber: '', // Número de microchip
  healthStatus: 80,
  healthDescription: '',
  medicalHistory: '', // Historial médico
  adoptionRequirements: '',
  adoptionFee: 0,
  feeDetails: '', // Detalles de la cuota de adopción
  requiresContract: false, // Contrato de adopción
  requiresFollowUp: false, // Seguimiento post-adopción
  followUpDetails: '', // Detalles del seguimiento post-adopción
  contact: {
    name: '',
    email: '',
    phone: '',
    type: '',
    notes: '', // Información adicional de contacto
    preferredMethod: 'email', // Método de contacto preferido (email por defecto)
  },
  image: '', // URL de la imagen principal
  photos: [], // URLs de fotos adicionales
  createdAt: '',
  userId: '',
  status: 'available', // Por defecto, estado disponible
})

// Precarga datos de contacto del usuario actual
onMounted(() => {
  if (user.value) {
    petData.contact.name = user.value.displayName || ''
    petData.contact.email = user.value.email || ''
    petData.userId = user.value.uid
  }

  useHead({
    title: 'Publicar Mascota en Adopción | Adopta Zulia',
    meta: [
      {
        name: 'description',
        content: 'Publica una mascota en adopción y encuentra un hogar para ella.'
      }
    ]
  })

  loading.value = false;
})

// Manejo de la imagen principal
const handleMainImageChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validación de tamaño (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showModalAlert('error', 'Imagen demasiado grande', 'La imagen es demasiado grande. El tamaño máximo es 5MB.')
    return
  }

  // Validación de tipo (solo imágenes)
  if (!file.type.startsWith('image/')) {
    showModalAlert('error', 'Tipo de archivo no válido', 'Solo se permiten archivos de imagen.')
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

  // Limita el número total de imágenes a 5
  const remainingSlots = 5 - additionalImagePreviews.value.length
  const filesToProcess = files.slice(0, remainingSlots)

  filesToProcess.forEach((file) => {
    // Validación de tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showModalAlert('error', 'Imagen demasiado grande', `La imagen ${file.name} es demasiado grande. El tamaño máximo es 5MB.`)
      return
    }

    // Validación de tipo (solo imágenes)
    if (!file.type.startsWith('image/')) {
      showModalAlert('error', 'Tipo de archivo no válido', `El archivo ${file.name} no es una imagen.`)
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

// Eliminar una imagen adicional
const removeAdditionalImage = (index) => {
  additionalImagePreviews.value.splice(index, 1)
  additionalImageFiles.value.splice(index, 1)
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
    case 'tortuga':
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

// Subir imágenes a AWS S3
const uploadImages = async () => {
  const { uploadFile } = useS3()
  const userId = user.value?.uid || 'anonymous'

  // Subir imagen principal
  if (!mainImageFile.value) {
    throw new Error('Se requiere una imagen principal')
  }

  // Obtener la extensión del archivo
  const fileExtension = mainImageFile.value.name.split('.').pop()
  const mainImageName = `main.${fileExtension}`

  // Subir la imagen principal a S3 con optimización
  // La optimización está habilitada por defecto en el composable useS3
  const mainImageUrl = await uploadFile(
    mainImageFile.value, 
    `pets/${userId}`, 
    mainImageName,
    {
      // Opciones de optimización personalizadas para la imagen principal (mejor calidad)
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      quality: 0.85
    }
  )

  // Subir imágenes adicionales
  const additionalImageUrls = []
  for (let i = 0; i < additionalImageFiles.value.length; i++) {
    const file = additionalImageFiles.value[i]
    const fileName = `additional_${i}.${file.name.split('.').pop()}`

    // Subir imagen adicional con optimización
    const url = await uploadFile(
      file, 
      `pets/${userId}`, 
      fileName,
      {
        // Las imágenes adicionales pueden tener menor calidad para ahorrar espacio
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1000,
        quality: 0.8
      }
    )
    additionalImageUrls.push(url)
  }

  return {
    mainImageUrl,
    additionalImageUrls,
  }
}

// Guardar como borrador (a implementar)
const saveAsDraft = async () => {
  // Esta función se implementará más adelante
  showModalAlert('info', 'Función no disponible', 'Esta función no está implementada todavía')
}

// Enviar formulario
const submitForm = async () => {
  try {
    // Verificar campos incompletos
    const incompleteFields = getIncompleteFieldsSummary()
    if (incompleteFields.length > 0) {
      const fieldsList = incompleteFields.map(f => `• ${f}`).join('\n')
      showModalAlert(
        'warning',
        'Completa todos los campos requeridos',
        `Faltan los siguientes campos:\n\n${fieldsList}\n\nRevisa cada sección del formulario.`
      )
      return
    }

    // Sanitizar datos antes de enviar
    sanitizePetData()

    // Validar imagen principal
    if (!mainImageFile.value && !mainImagePreview.value) {
      invalidFields.mainImage = true
      showModalAlert('warning', 'Imagen requerida', 'Debes subir al menos una imagen principal')
      focusField('mainImage')
      return
    }

    // Subir imágenes
    const { mainImageUrl, additionalImageUrls } = await uploadImages()

    // Preparar datos para guardar
    const petToSave = {
      ...petData,
      image: mainImageUrl,
      photos:
        additionalImageUrls.length > 0 ? [mainImageUrl, ...additionalImageUrls] : [mainImageUrl],
      createdAt: new Date().toISOString(),
      userId: user.value?.uid || null,
      status: 'available', // Estado por defecto: disponible
    }

    // Crear la mascota en la base de datos
    const petId = await createPet(petToSave)

    // Mostrar mensaje de éxito
    showModalAlert('success', '¡Publicación exitosa!', 'Mascota publicada correctamente', 'Ver mascota')
    
    // Establecer un callback para redirigir después de cerrar el modal
    modalCallback.value = () => router.push(`/mascotas/${petId}`)
  } catch (err) {
    console.error('Error al publicar mascota:', err)
    error.value = 'Error al publicar la mascota. Por favor, inténtalo de nuevo.'
    showModalAlert('error', 'Error', 'Error al publicar la mascota. Por favor, inténtalo de nuevo.')
  }
}

// Estados para el modal
const showModal = ref(false)
const modalType = ref('info')
const modalTitle = ref('')
const modalMessage = ref('')
const modalConfirmText = ref('Aceptar')
const modalCallback = ref(null)

// Función para obtener un resumen de campos incompletos
const getIncompleteFieldsSummary = () => {
  const incomplete = []

  // Step 1 validations
  if (!petData.name) incomplete.push('Nombre de la mascota')
  if (!petData.typeValue) incomplete.push('Tipo de mascota')
  if (!petData.gender) incomplete.push('Género')
  if (!petData.age) incomplete.push('Edad aproximada')
  if (!petData.ageValue) incomplete.push('Rango de edad')
  if (!petData.sizeValue) incomplete.push('Tamaño')
  if (!petData.location) incomplete.push('Ubicación')
  if (!(petData.description || '').trim() || petData.description.trim().length < 10) incomplete.push('Descripción')

  // Step 2 validations
  if (!mainImagePreview.value && !mainImageFile.value) incomplete.push('Foto principal')

  // Step 3 validations
  if (!petData.contact.name) incomplete.push('Nombre de contacto')
  if (!petData.contact.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(petData.contact.email)) incomplete.push('Email de contacto válido')
  if (!petData.contact.phone || !/^[0-9()+\-\s]{6,20}$/.test(petData.contact.phone)) incomplete.push('Teléfono de contacto válido')

  return incomplete
}

// Cerrar el modal
const closeModal = () => {
  showModal.value = false
  if (modalCallback.value) {
    modalCallback.value()
    modalCallback.value = null
  }
}

// Mostrar alerta en el modal
const showModalAlert = (type, title, message, confirmText = 'Aceptar') => {
  modalType.value = type
  modalTitle.value = title
  modalMessage.value = message
  modalConfirmText.value = confirmText
  showModal.value = true
}

// Sanitización básica de los datos del formulario
const sanitizePetData = () => {
  // Trim all string fields and limit lengths
  const trim = (v, max = 1000) => (typeof v === 'string' ? v.trim().slice(0, max) : v)

  petData.name = trim(petData.name, 80)
  petData.type = trim(petData.type, 30)
  petData.typeValue = trim(petData.typeValue, 30)
  petData.breed = trim(petData.breed, 50)
  petData.age = trim(petData.age, 30)
  petData.ageValue = trim(petData.ageValue, 30)
  petData.size = trim(petData.size, 30)
  petData.sizeValue = trim(petData.sizeValue, 30)
  petData.location = trim(petData.location, 100)
  petData.description = trim(petData.description, 1000)
  petData.vaccineInfo = trim(petData.vaccineInfo, 200)
  petData.neuterDate = trim(petData.neuterDate, 50)
  petData.chipNumber = trim(petData.chipNumber, 80)
  petData.healthDescription = trim(petData.healthDescription, 500)
  petData.adoptionRequirements = trim(petData.adoptionRequirements, 500)
  petData.feeDetails = trim(petData.feeDetails, 300)
  petData.followUpDetails = trim(petData.followUpDetails, 300)

  // Contact sanitization
  petData.contact.name = trim(petData.contact.name, 80)
  petData.contact.email = trim(petData.contact.email, 120)
  petData.contact.phone = (petData.contact.phone || '').toString().trim().slice(0, 30)
  petData.contact.notes = trim(petData.contact.notes, 500)
}
</script>

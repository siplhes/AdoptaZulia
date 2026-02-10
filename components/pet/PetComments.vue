<template>
  <div class="mt-8 rounded-lg bg-white p-6 shadow-sm">
    <h2 class="mb-6 text-xl font-semibold text-emerald-800">Comentarios y opiniones</h2>

    <!-- Formulario para agregar un comentario -->
    <div v-if="isAuthenticated" class="mb-8 border-b pb-6">
      <h3 class="mb-3 font-medium text-gray-700">Deja tu comentario</h3>

      <!-- Entrada de calificación -->
      <div class="mb-4">
        <div class="flex items-center">
          <span class="mr-3 text-sm text-gray-600">Calificación:</span>
          <div class="flex">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="text-2xl focus:outline-none"
              :class="star <= newRating ? 'text-amber-400' : 'text-gray-300'"
              @click="newRating = star"
            >
              ★
            </button>
          </div>
        </div>
      </div>

      <!-- Campo de texto para el comentario -->
      <div class="mb-4">
        <textarea
          v-model="newCommentText"
          rows="3"
          class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
          placeholder="Comparte tu experiencia o impresión sobre esta mascota..."
        />
      </div>

      <!-- Botones de acción -->
      <div class="flex justify-end">
        <button
          type="button"
          class="mr-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          :disabled="loading"
          @click="clearForm"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-70"
          :disabled="!canSubmit || loading"
          @click="submitComment"
        >
          <span v-if="loading">
            <svg
              class="-ml-1 mr-2 inline-block h-4 w-4 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
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
            Enviando...
          </span>
          <span v-else>Publicar comentario</span>
        </button>
      </div>
    </div>

    <!-- Solicitud de inicio de sesión si no está autenticado -->
    <div v-else class="mb-6 rounded-lg bg-amber-50 p-4">
      <p class="text-amber-800">
        <span class="font-medium">Inicia sesión</span>
        para dejar tu comentario sobre esta mascota.
      </p>
      <NuxtLink
        to="/login"
        class="mt-2 inline-block font-medium text-emerald-600 hover:text-emerald-800"
      >
        Iniciar sesión
      </NuxtLink>
    </div>

    <!-- Listado de comentarios -->
    <div>
      <div v-if="loading && !comments.length" class="py-8 text-center">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em]"
        />
        <p class="mt-2 text-gray-500">Cargando comentarios...</p>
      </div>

      <div v-else-if="error" class="py-4 text-red-600">
        {{ error }}
      </div>

      <div v-else-if="!comments.length" class="py-4 text-gray-500">
        Aún no hay comentarios. ¡Sé el primero en comentar!
      </div>

      <div v-else>
        <h3 class="mb-4 font-medium text-gray-700">
          {{ comments.length }} comentario{{ comments.length !== 1 ? 's' : '' }}
        </h3>

        <ul class="space-y-6">
          <li
            v-for="comment in comments"
            :key="comment.id"
            class="border-b border-gray-100 pb-6 last:border-b-0"
          >
            <div class="flex items-start">
              <!-- Avatar del usuario -->
              <div class="mr-3 flex-shrink-0">
                <div
                  v-if="comment.user?.photoURL"
                  class="h-10 w-10 rounded-full bg-cover bg-center"
                  :style="`background-image: url(${comment.user.photoURL})`"
                />
                <div
                  v-else
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100"
                >
                  <span class="font-semibold text-emerald-600">
                    {{ comment.user?.displayName?.charAt(0).toUpperCase() || 'U' }}
                  </span>
                </div>
              </div>

              <!-- Contenido del comentario -->
              <div class="flex-1">
                <div class="mb-1 flex items-center">
                  <h4 class="font-medium text-gray-800">
                    {{ comment.user?.displayName || 'Usuario' }}
                  </h4>

                  <!-- Acciones si es el propietario del comentario -->
                  <div v-if="user?.uid === comment.userId" class="ml-auto flex space-x-2">
                    <button
                      class="text-gray-400 hover:text-emerald-600"
                      @click="editComment(comment)"
                    >
                      <span class="sr-only">Editar</span>
                      <Icon name="heroicons:pencil-square" size="16px" />
                    </button>
                    <button
                      class="text-gray-400 hover:text-red-600"
                      @click="confirmDelete(comment.id)"
                    >
                      <span class="sr-only">Eliminar</span>
                      <Icon name="heroicons:trash" size="16px" />
                    </button>
                  </div>
                </div>

                <!-- Calificación en estrellas -->
                <div v-if="comment.rating" class="mb-1 flex text-amber-400">
                  <span
                    v-for="star in 5"
                    :key="star"
                    :class="star <= comment.rating ? 'text-amber-400' : 'text-gray-300'"
                  >
                    ★
                  </span>
                </div>

                <!-- Texto del comentario -->
                <p class="text-gray-700">
                  {{ comment.content }}
                </p>

                <!-- Fecha del comentario -->
                <p class="mt-1 text-xs text-gray-500">
                  {{ formatDate(comment.createdAt) }}
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Diálogo de confirmación para eliminar -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 class="mb-4 text-lg font-medium text-gray-900">Confirmar eliminación</h3>
        <p class="mb-6 text-gray-600">
          ¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            @click="showDeleteConfirm = false"
          >
            Cancelar
          </button>
          <button
            class="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
            @click="deleteSelectedComment"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { usePetComments } from '~/composables/usePetComments'
import { formatDateTime } from '~/utils/dateFormatter'

const props = defineProps({
  petId: {
    type: String,
    required: true,
  },
})

// Composables
const { user, isAuthenticated } = useAuth()
const { comments, loading, error, fetchPetComments, createComment, updateComment, deleteComment } =
  usePetComments()

// Estado local
const newCommentText = ref('')
const newRating = ref(0)
const editingCommentId = ref(null)
const showDeleteConfirm = ref(false)
const commentToDelete = ref(null)

// Métodos
const submitComment = async () => {
  if (!isAuthenticated.value || !canSubmit.value) return

  try {
    if (editingCommentId.value) {
      // Actualizar comentario existente
      await updateComment(editingCommentId.value, {
        content: newCommentText.value,
        rating: newRating.value,
      })
    } else {
      // Crear nuevo comentario
      await createComment({
        petId: props.petId,
        userId: user.value.uid,
        content: newCommentText.value,
        rating: newRating.value,
      })
    }

    // Limpiar formulario
    clearForm()

    // Recargar comentarios
    await fetchPetComments(props.petId)
  } catch (err) {
    console.error('Error al procesar comentario:', err)
  }
}

const clearForm = () => {
  newCommentText.value = ''
  newRating.value = 0
  editingCommentId.value = null
}

const editComment = (comment) => {
  newCommentText.value = comment.content
  newRating.value = comment.rating || 0
  editingCommentId.value = comment.id

  // Scroll al formulario
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const confirmDelete = (id) => {
  commentToDelete.value = id
  showDeleteConfirm.value = true
}

const deleteSelectedComment = async () => {
  if (!commentToDelete.value) return

  try {
    await deleteComment(commentToDelete.value)
    showDeleteConfirm.value = false
    commentToDelete.value = null

    // Recargar comentarios
    await fetchPetComments(props.petId)
  } catch (err) {
    console.error('Error al eliminar comentario:', err)
  }
}

const formatDate = (timestamp) => formatDateTime(timestamp)

// Computed
const canSubmit = computed(() => {
  return newCommentText.value.trim().length > 0
})

// Cargar comentarios al montar el componente
onMounted(async () => {
  await fetchPetComments(props.petId)
})
</script>

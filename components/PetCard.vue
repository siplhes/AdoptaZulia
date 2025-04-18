<template>
  <div
    class="overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg relative pet-card"
    :class="{
      'border-2 border-emerald-500': hasActiveAdoptionRequest,
      'hover:scale-102 transform': variant === 'B', // Add subtle scaling effect for variant B
      'opacity-85': pet.status === 'adopted', // Reducir ligeramente la opacidad para mascotas adoptadas
    }"
  >
    <!-- Badge de urgente con mejor contraste para accesibilidad -->
    <div
      v-if="pet.urgent && pet.status !== 'adopted'"
      class="absolute right-2 top-2 z-10 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white"
      role="status"
      aria-live="polite"
    >
      {{ variant === "A" ? "URGENTE" : "¡NECESITA HOGAR YA!" }}
    </div>

    <!-- Badge de adoptado mejorado -->
    <div
      v-if="pet.status === 'adopted'"
      class="absolute inset-0 bg-black bg-opacity-60 z-10 flex items-center justify-center transition-opacity duration-300"
    >
      <div
        class="bg-white px-4 py-3 rounded-md font-bold text-emerald-700 transform transition-transform duration-300 flex flex-col items-center"
      >
        <span class="text-xl">ADOPTADO</span>
        <span class="text-xs mt-1">¡Ya encontró un hogar!</span>
      </div>
    </div>

    <!-- Contenedor de imagen con carga progresiva -->
    <div class="relative h-[24rem] overflow-hidden">
      <div
        v-if="imageLoading"
        class="absolute inset-0 flex items-center justify-center bg-gray-100"
      >
        <div
          class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"
        />
      </div>

      <NuxtImg
        :src="pet.image || '/placeholder.webp'"
        :alt="pet.name"
        class="h-full w-full object-cover transition-transform duration-300"
        :class="{
          'hover:scale-105': variant === 'A',
          'hover:scale-110': variant === 'B',
        }"
        loading="lazy"
        sizes="sm:100vw md:50vw lg:33vw xl:25vw"
        placeholder
        :quality="70"
        format="webp"
        @error="onImageError"
        @load="imageLoading = false"
      />

      <!-- Botón de favorito con feedback táctil -->
      <button
        type="button"
        class="absolute flex justify-center items-center left-2 top-2 rounded-full bg-white p-1.5 shadow-md transition-colors hover:bg-amber-50 active:scale-95 z-10"
        :class="{ 'text-red-500': isFavorite, 'text-gray-400': !isFavorite }"
        :aria-label="`Agregar ${pet.name} a favoritos`"
        :aria-pressed="isFavorite"
        @click.stop="toggleFavorite"
      
      > 
        <Icon
          :name="isFavorite ? 'heroicons:heart-solid' : 'heroicons:heart'"
          class="h-7 w-7"
        aria-label="Agregar a favoritos"
        data-balloon-pos="up"
        />

      </button>

      <!-- Tiempo desde publicación con mejor visibilidad -->
      <div
        v-if="timeAgo"
        class="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1"
      >
        {{ timeAgo }}
      </div>
    </div>

    <!-- Contenido principal optimizado -->
    <div class="p-4">
      <div class="flex items-start justify-between">
        <h3
          class="mb-1 text-lg font-semibold text-emerald-800 truncate"
          :title="pet.name"
          :aria-label="`Nombre de la mascota: ${pet.name}`"
          data-balloon-pos="up"
        >
          {{ pet.name }}
        </h3>
        <span
          :class="[
            'rounded-full px-2 py-1 text-xs font-medium',
            pet.gender === 'macho'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-pink-100 text-pink-800',
          ]"
          role="status"
        >
          {{ pet.gender === "macho" ? "Macho" : "Hembra" }}
        </span>
      </div>

      <p class="mb-3 text-sm text-gray-600 truncate" :title="pet.breed">
        {{ pet.breed || "Raza desconocida" }}
      </p>

      <div class="mb-2 flex items-center gap-2 text-sm text-gray-500">
        <Icon name="heroicons:map-pin" class="h-4 w-4 flex-shrink-0" />
        <span class="truncate" :title="pet.location">{{
          pet.location || "Ubicación desconocida"
        }}</span>
      </div>

      <div class="flex items-center gap-2 text-sm text-gray-500">
        <Icon name="heroicons:clock" class="h-4 w-4 flex-shrink-0" />
        <span>{{ formatAge(pet.age) }}</span>
      </div>

      <hr class="my-3 border-gray-100" >

      <!-- Indicadores de características -->
      <div class="mb-4 flex flex-wrap gap-2">
        <div
          v-if="pet.vaccinated"
          class="flex items-center rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
        >
          <Icon name="heroicons:check" class="mr-1 h-3 w-3" />
          Vacunas
        </div>
        <div
          v-if="pet.neutered"
          class="flex items-center rounded bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700"
        >
          <Icon name="heroicons:check" class="mr-1 h-3 w-3" />
          {{ pet.gender === "macho" ? "Castrado" : "Esterilizada" }}
        </div>
        <div
          v-if="pet.size"
          class="flex items-center rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
        >
          <Icon name="mdi:ruler" class="mr-1 h-3 w-3" />
          {{
            pet.size === "small"
              ? "Pequeño"
              : pet.size === "medium"
              ? "Mediano"
              : "Grande"
          }}
        </div>
      </div>

      <!-- Botón CTA con diseño variable según test A/B -->
      <NuxtLink
        :to="`/mascotas/${pet.id}`"
        class="mt-2 block w-full rounded-md py-2 text-center text-sm font-medium shadow transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
        :class="[
          pet.status === 'adopted'
            ? 'bg-gray-400 text-white cursor-default'
            : variant === 'A'
            ? 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500'
            : 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400',
        ]"
        @click="recordClick"
      >
        {{
          pet.status === "adopted"
            ? "Mascota adoptada"
            : variant === "A"
            ? "Ver detalles"
            : "¡Conóceme!"
        }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Pet } from "~/models/Pet";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const { getTestVariant, recordImpression, recordClick } = useABTesting();
const variant = computed(() => getTestVariant("petCardLayout"));

const props = defineProps<{
  pet: Pet;
  isFavorite?: boolean;
  hasActiveAdoptionRequest?: boolean;
}>();

const imageLoading = ref(true);
const timeAgo = computed(() => {
  if (!props.pet.createdAt) return null;
  return formatDistanceToNow(new Date(props.pet.createdAt), {
    addSuffix: true,
    locale: es,
  });
});

const emit = defineEmits(["toggleFavorite"]);

function toggleFavorite(e: Event) {
  e.stopPropagation();
  emit("toggleFavorite", props.pet.id);
}

function onImageError() {
  imageLoading.value = false;
}

function formatAge(age: string | number) {
  if (!age) return "Edad desconocida";

  // Handle string values like "1 mes"
  if (typeof age === "string") {
    return age;
  }

  // Handle numeric values (months)
  const ageInMonths = age;

  if (ageInMonths < 1) {
    return "Menos de 1 mes";
  } else if (ageInMonths < 12) {
    return `${ageInMonths} ${ageInMonths === 1 ? "mes" : "meses"}`;
  } else {
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;

    let result = `${years} ${years === 1 ? "año" : "años"}`;
    if (months > 0) {
      result += ` y ${months} ${months === 1 ? "mes" : "meses"}`;
    }

    return result;
  }
}

onMounted(() => {
  // Record impression for A/B testing when the component mounts
  recordImpression("petCardLayout");
});
</script>

<style scoped>
.pet-card {
  will-change: transform, box-shadow;
  backface-visibility: hidden;
}

/* Add subtle animation for variant B */
:deep(.variant-b) .pet-card:hover {
  transform: translateY(-5px);
}
</style>

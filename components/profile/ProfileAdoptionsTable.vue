<template>
  <div>
    <!-- Private Section Header -->
    <div
      class="mb-6 flex items-start rounded-xl border p-4"
      :class="isReceived ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'"
    >
      <Icon
        name="heroicons:lock-closed"
        class="mr-3 mt-0.5 h-5 w-5"
        :class="isReceived ? 'text-amber-600' : 'text-blue-600'"
      />
      <div>
        <h4 class="text-sm font-bold" :class="isReceived ? 'text-amber-800' : 'text-blue-800'">
          Sección Privada
        </h4>
        <p class="mt-1 text-xs" :class="isReceived ? 'text-amber-700' : 'text-blue-700'">
          {{
            isReceived
              ? 'Solo tú puedes ver estas solicitudes recibidas para tus mascotas.'
              : 'Solo tú puedes ver las solicitudes que has enviado.'
          }}
        </p>
      </div>
    </div>

    <!-- Table Container -->
    <div
      v-if="adoptions.length > 0"
      class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50 font-medium text-gray-500">
            <tr>
              <th class="px-6 py-4">Mascota</th>
              <th v-if="isReceived" class="px-6 py-4">Solicitante</th>
              <th class="px-6 py-4">{{ isReceived ? 'Fecha' : 'Fecha Envío' }}</th>
              <th class="px-6 py-4">Estado</th>
              <th class="px-6 py-4 text-right">{{ isReceived ? 'Acción' : 'Detalle' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="adoption in adoptions"
              :key="adoption.id"
              class="transition-colors hover:bg-gray-50/50"
            >
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <NuxtImg
                    :src="adoption.pet?.imageUrl || adoption.pet?.image || '/placeholder.webp'"
                    class="mr-3 h-10 w-10 rounded-lg bg-gray-200 object-cover"
                  />
                  <span class="font-medium text-gray-900">
                    {{ adoption.pet?.name || 'Mascota' }}
                  </span>
                </div>
              </td>
              <td v-if="isReceived" class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-medium text-gray-900">
                    {{ adoption.user?.name || 'Usuario' }}
                  </span>
                  <span class="text-xs text-gray-500">{{ adoption.user?.email }}</span>
                </div>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-gray-500">
                {{ formatDate(adoption.createdAt) }}
              </td>
              <td class="px-6 py-4">
                <span :class="statusBadge(adoption.status)">
                  {{ statusLabel(adoption.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <NuxtLink
                  :to="isReceived ? '/perfil' : `/mi-solicitud/${adoption.id}`"
                  class="inline-flex items-center text-sm font-medium"
                  :class="isReceived ? 'text-emerald-600 hover:text-emerald-800' : 'text-blue-600 hover:text-blue-800'"
                >
                  {{ isReceived ? 'Gestionar' : 'Ver estado' }}
                  <Icon
                    :name="isReceived ? 'heroicons:arrow-right' : 'heroicons:arrow-top-right-on-square'"
                    class="ml-1 h-3 w-3"
                  />
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20"
    >
      <Icon
        :name="isReceived ? 'heroicons:inbox' : 'heroicons:paper-airplane'"
        class="mb-3 h-12 w-12 text-gray-300"
      />
      <p class="text-gray-500">
        {{
          isReceived
            ? 'No tienes solicitudes pendientes.'
            : 'No has enviado ninguna solicitud aún.'
        }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  adoptions: {
    type: Array,
    required: true,
  },
  type: {
    type: String,
    default: 'received', // 'received' or 'sent'
  },
})

const isReceived = computed(() => props.type === 'received')

const formatDate = (ts) => {
  if (!ts) return 'fecha desconocida'
  try {
    return new Date(ts).toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric' 
    })
  } catch {
    return 'fecha desconocida'
  }
}

const statusBadge = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium'
    case 'approved':
      return 'bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-medium'
    case 'rejected':
      return 'bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium'
    case 'completed':
      return 'bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium'
    default:
      return 'bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium'
  }
}

const statusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    completed: 'Completada',
  }
  return labels[status] || status
}
</script>

<template>
  <div class="min-h-screen bg-amber-50">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-emerald-700 text-white">
      <div class="absolute inset-0 z-0">
        <NuxtImg
          src="/img4.webp"
          width="1600"
          height="600"
          alt="Mascotas rescatadas"
          loading="lazy"
          class="h-full w-full object-cover opacity-20"
        />
      </div>
      <div class="container relative z-10 mx-auto px-4 py-16 md:py-24">
        <div class="max-w-3xl">
          <h1 class="mb-6 text-4xl font-bold md:text-5xl">Tu donación puede salvar vidas</h1>
          <p class="mb-8 text-xl text-emerald-100 md:text-2xl">
            Ayúdanos a continuar nuestra misión de rescatar y encontrar hogares para mascotas
            abandonadas.
          </p>
        </div>
      </div>

      <!-- Wave divider -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="#fffbeb">
          <path
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          />
        </svg>
      </div>
    </section>

    <div class="container mx-auto px-4 py-12">
      <!-- Impact Stats -->
      <section class="mb-16">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div
            class="transform rounded-lg bg-white p-8 text-center shadow-md transition-transform hover:scale-105"
          >
            <div
              class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
            >
              <Icon name="mdi:paw" class="h-10 w-10 text-emerald-600" />
            </div>
            <h3 class="mb-2 text-3xl font-bold text-emerald-800">{{ siteStats.totalPets || 1240 }}</h3>
            <p class="text-gray-600">Mascotas registradas</p>
          </div>

          <div
            class="transform rounded-lg bg-white p-8 text-center shadow-md transition-transform hover:scale-105"
          >
            <div
              class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
            >
              <Icon name="mdi:home" class="h-10 w-10 text-emerald-600" />
            </div>
            <h3 class="mb-2 text-3xl font-bold text-emerald-800">{{ siteStats.totalAdoptions || "Aun no hay" }}</h3>
            <p class="text-gray-600">Adopciones exitosas</p>
          </div>
        </div>
      </section>

      <section class="mb-16">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-3 justify-center items-center">
       <!--En Especie-->
          <div
            class="transform rounded-lg bg-white p-8 text-center shadow-md transition-transform hover:scale-105"
          >
            <h1 class="mb-4 text-xl font-semibold">Donacion en especie</h1>
            <p class="mb-4 text-gray-600">Realiza una donación de alimentos, medicinas o suministros para nuestras mascotas y para los refugios del estado.</p>
            <NuxtLink to="/donaciones/especie" class="p-6">
              <div class="mx-auto bg-emerald-600 text-[#fefffa] p-4 hover:bg-emerald-700 rounded-xl max-w-xs items-center flex justify-center">
                <span class="ml-2"> Mas detalles</span>
       
                <Icon name="mdi:chevron-down" class="h-5 w-5 text-amber-50 transition-transform" />
              </div>
            </NuxtLink>
          </div>
                  <!--PayPal-->
          <div
            class="transform rounded-lg bg-white p-8 text-center shadow-md transition-transform hover:scale-105"
          >
            <h1 class="mb-4 text-xl font-semibold">PayPal</h1>
            <p class="mb-4 text-gray-600">Realiza una donación segura mediante PayPal</p>
            <div id="paypal-checkout" class="mx-auto max-w-xs"/>
          </div>
          <!--Patreon-->
          <NuxtLink to="https://patreon.com/AdoptaZulia">
            <div
              class="transform rounded-lg bg-white p-8 text-center shadow-md transition-transform hover:scale-105"
            >
              <h1 class="mb-4 text-xl font-semibold">Patreon</h1>
                   <p class="mb-4 text-gray-600">Apadrina a AdoptaZulia y todas las mascotas que ayudamos.</p>
              <NuxtImg src="/patreon.webp" alt="Patreon" class="mx-auto" loading="lazy"/>
            </div>
          </NuxtLink>

          <!--Ko-fi-->
          <NuxtLink to="https://ko-fi.com/adoptazulia">
            <div
              class="transform rounded-lg bg-white p-8 text-center shadow-md transition-transform hover:scale-105"
            >
              <h1 class="mb-4 text-xl font-semibold">Ko-fi</h1>
                     <p class="mb-4 text-gray-600">Compranos un cafe, para poder seguir brindando la ayuda que tanto merecen.</p>
              <NuxtImg src="/kofi.webp" alt="Ko-fi" class="mx-auto" loading="lazy"/>
            </div>
          </NuxtLink>

  

   


        </div>
      </section>

      <!-- FAQ Section -->
      <section class="mb-16">
        <h2 class="mb-4 text-center text-3xl font-bold text-emerald-800 md:text-4xl">
          Preguntas frecuentes
        </h2>
        <p class="mx-auto mb-12 max-w-3xl text-center text-gray-600">
          Respuestas a las preguntas más comunes sobre donaciones y cómo ayudar.
        </p>

        <div class="mx-auto max-w-3xl space-y-4">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="overflow-hidden rounded-lg border border-gray-200"
          >
            <button
              class="flex w-full items-center justify-between bg-white p-4 text-left transition-colors hover:bg-gray-50"
              @click="toggleFaq(index)"
            >
              <span class="font-medium text-emerald-800">{{ faq.question }}</span>
              <Icon
                name="mdi:chevron-down"
                class="h-5 w-5 text-emerald-600 transition-transform"
                :class="{ 'rotate-180 transform': openFaq === index }"
              />
            </button>
            <div v-show="openFaq === index" class="border-t border-gray-200 bg-gray-50 p-4">
              <p class="text-gray-700">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="overflow-hidden rounded-2xl bg-emerald-700">
        <div class="p-8 text-center md:p-12">
          <h2 class="mb-4 text-3xl font-bold text-white md:text-4xl">Cada donación cuenta</h2>
          <p class="mx-auto mb-8 max-w-3xl text-emerald-100">
            Juntos podemos hacer la diferencia en la vida de miles de mascotas abandonadas. Tu apoyo
            es fundamental para continuar nuestra labor.
          </p>
          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#donate"
              class="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-lg font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <Icon name="mdi:heart" class="mr-2 h-5 w-5" />
              Donar ahora
            </a>
            <a
              href="/contacto"
              class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              <Icon name="mdi:message-circle" class="mr-2 h-5 w-5" />
              Contactar
            </a>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStats } from '~/composables/useStats'

// Estadísticas de impacto
const siteStats = ref({
  totalPets: 0,
  totalAdoptions: 0,
  totalUsers: 0
})

// One-time donation
const selectedAmount = ref(25)
const customAmount = ref('')
const donorInfo = ref({
  name: '',
  email: '',
  message: '',
  anonymous: false,
})

const finalAmount = computed(() => {
  if (customAmount.value) {
    return parseFloat(customAmount.value)
  }
  return selectedAmount.value
})


// Testimonials
const testimonials = [
  {
    name: 'Carlos Rodríguez',
    type: 'Donante mensual',
    image: '/placeholder.webp?height=100&width=100',
    quote:
      'Me encanta saber que mi contribución mensual ayuda a tantas mascotas necesitadas. El equipo de AdoptaPet siempre me mantiene informado sobre cómo se utilizan mis donaciones.',
  },
  {
    name: 'Laura Martínez',
    type: 'Donante puntual',
    image: '/placeholder.webp?height=100&width=100',
    quote:
      'Después de donar, recibí un correo electrónico detallado sobre cómo mi donación había ayudado a un perro llamado Max a recibir tratamiento veterinario. ¡Increíble transparencia!',
  },
]

// FAQs
const faqs = [
  {
    question: '¿Cómo se utilizan mis donaciones?',
    answer:
      'Tus donaciones se destinan principalmente a alimentación, atención veterinaria, medicamentos, mantenimiento de refugios temporales y gastos de transporte para el rescate de animales. Publicamos informes trimestrales detallando el uso de los fondos en nuestra sección de transparencia.',
  },
  {
    question: '¿Las donaciones son deducibles de impuestos?',
    answer:
      'Sí, AdoptaPet es una organización sin ánimo de lucro registrada oficialmente, por lo que tus donaciones pueden ser deducibles de impuestos según la legislación fiscal vigente. Te enviaremos un certificado de donación que podrás utilizar en tu declaración de la renta.',
  },
  {
    question: '¿Puedo cancelar mi donación mensual en cualquier momento?',
    answer:
      'Por supuesto. Puedes cancelar tu donación mensual en cualquier momento desde tu perfil en nuestra web o contactando con nuestro equipo de atención al donante. No hay compromisos de permanencia ni penalizaciones por cancelación.',
  },
  {
    question: '¿Qué tipo de donaciones en especie aceptáis?',
    answer:
      'Aceptamos alimentos para mascotas, mantas, camas, juguetes, medicamentos (con receta veterinaria), productos de limpieza y cualquier otro material que pueda ser útil para el cuidado de los animales. Contacta con nosotros antes de realizar la donación para coordinar la entrega.',
  },
  {
    question: '¿Puedo elegir a qué mascota específica ayudar con mi donación?',
    answer:
      'Sí, ofrecemos la opción de apadrinar a una mascota específica. En este caso, tu donación se destinará principalmente a cubrir los gastos de esa mascota en particular. Recibirás actualizaciones periódicas sobre su estado y evolución.',
  },
]

const openFaq = ref(null)
const paypalButtonRendered = ref(false)

const toggleFaq = (index) => {
  if (openFaq.value === index) {
    openFaq.value = null
  } else {
    openFaq.value = index
  }
}

// Mejorado: Configuración del botón de PayPal
onMounted(async () => {
  // Cargar estadísticas
  try {
    const { fetchPublicStats, stats } = useStats()
    await fetchPublicStats()
    siteStats.value = {
      totalPets: stats.value.totalPets,
      totalAdoptions: stats.value.totalAdoptions,
      totalUsers: stats.value.totalUsers
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  }

  // Solo renderizar el botón si no se ha renderizado ya
  if (!paypalButtonRendered.value) {
    usePaypalButton({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'donate',
      },
      // Configurar el botón para procesar donaciones
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: finalAmount.value.toString(),
                currency_code: 'USD',
                breakdown: {
                  item_total: {
                    currency_code: 'USD',
                    value: finalAmount.value.toString(),
                  },
                },
              },
              description: 'Donación para AdoptaZulia',
              items: [
                {
                  name: 'Donación para mascotas',
                  quantity: '1',
                  unit_amount: {
                    currency_code: 'USD',
                    value: finalAmount.value.toString(),
                  },
                  category: 'DONATION',
                },
              ],
            },
          ],
        })
      },
      // Manejar la aprobación del pago
      onApprove: async (data, actions) => {
        try {
          const details = await actions.order.capture()

          // Mostrar mensaje de agradecimiento
          alert(
            `¡Gracias por tu donación de $${finalAmount.value}! Tu apoyo ayudará a nuestras mascotas.`
          )
        } catch (error) {
          console.error('Error al procesar la donación:', error)
          alert('Hubo un problema al procesar tu donación. Por favor, intenta nuevamente.')
        }
      },
      // Manejar cancelaciones
      onCancel: () => {
      },
      // Manejar errores
      onError: (err) => {
        console.error('Error en el proceso de PayPal:', err)
        alert('Ocurrió un error durante el proceso de donación. Por favor, intenta más tarde.')
      },
    }).then(() => {
      paypalButtonRendered.value = true
    })
  }
  useHead({
    title: 'Donaciones - Adopta Zulia',
    meta: [
      {
        name: 'description',
        content:
          'Conviértete en un héroe para nuestras mascotas. Descubre cómo puedes ayudar con donaciones únicas o mensuales.',
      },
    ],

  })
})
</script>

<style scoped>
/* Estilos específicos para la página de donaciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animación para los acordeones de FAQ */
.rotate-enter-active,
.rotate-leave-active {
  transition: transform 0.3s ease;
}

.rotate-enter-from,
.rotate-leave-to {
  transform: rotate(0deg);
}
</style>

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
          <h1 class="mb-6 text-4xl font-bold md:text-5xl">
            Tu donación puede salvar vidas
          </h1>
          <p class="mb-8 text-xl text-emerald-100 md:text-2xl">
            Ayúdanos a continuar nuestra misión de rescatar y encontrar hogares para
            mascotas abandonadas.
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
            <h3 class="mb-2 text-3xl font-bold text-emerald-800">
              {{ siteStats.totalPets || 1240 }}
            </h3>
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
            <h3 class="mb-2 text-3xl font-bold text-emerald-800">
              {{ siteStats.totalAdoptions || "Aun no hay" }}
            </h3>
            <p class="text-gray-600">Adopciones exitosas</p>
          </div>
        </div>
      </section>

      <section class="mb-16">
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
          
          <!-- Columna Izquierda: Aportes Económicos -->
          <div class="space-y-8">
            <div class="text-left">
              <h2 class="mb-2 flex items-center gap-3 text-3xl font-bold text-emerald-800">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Icon name="mdi:cash-multiple" class="h-6 w-6" />
                </div>
                Aporte Económico
              </h2>
              <p class="text-gray-600">
                Tu donación monetaria nos permite cubrir gastos veterinarios urgentes, comprar alimento y mantener nuestras instalaciones.
              </p>
            </div>

            <!-- Opciones Agrupadas -->
            <div class="grid gap-4 sm:grid-cols-1">
              <!-- PayPal (Destacado) -->
              <div class="rounded-2xl border-2 border-emerald-100 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md">
                <div class="mb-4 flex items-center justify-between">
                  <h3 class="text-xl font-bold text-gray-800">Donar con PayPal</h3>
                  <Icon name="logos:paypal" class="h-6" />
                </div>
                <p class="mb-6 text-sm text-gray-500">
                  Seguro, rápido y puedes usar tu tarjeta de crédito o saldo PayPal.
                </p>
                <NuxtLink
                  to="https://paypal.me/adoptazulia?country.x=VE&locale.x=en_US"
                  target="_blank"
                  class="flex w-full items-center justify-center rounded-xl bg-[#0070BA] py-3 font-bold text-white transition-colors hover:bg-[#005ea6]"
                >
                  Ir a PayPal
                  <Icon name="mdi:arrow-top-right" class="ml-2 h-4 w-4" />
                </NuxtLink>
              </div>

              <!-- Otras Plataformas (Patreon & Ko-fi) -->
              <div class="grid gap-4 sm:grid-cols-2">
                <!-- Patreon -->
                <NuxtLink 
                  to="https://patreon.com/AdoptaZulia"
                  target="_blank"
                  class="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-red-100 hover:bg-red-50"
                >
                  <div>
                    <Icon name="logos:patreon" class="mb-3 h-6 w-6" />
                    <h3 class="font-bold text-gray-800">Ser Padrino</h3>
                    <p class="mt-1 text-xs text-gray-500 group-hover:text-gray-700">Donación recurrente mensual</p>
                  </div>
                  <div class="mt-4 text-right">
                    <span class="text-sm font-semibold text-red-500 group-hover:underline">Ver niveles →</span>
                  </div>
                </NuxtLink>

                <!-- Ko-fi -->
                <NuxtLink 
                  to="https://ko-fi.com/adoptazulia"
                  target="_blank"
                  class="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-sky-100 hover:bg-sky-50"
                >
                  <div>
                    <Icon name="simple-icons:kofi" class="mb-3 h-6 w-6 text-[#29abe0]" />
                    <h3 class="font-bold text-gray-800">Invítanos un Café</h3>
                    <p class="mt-1 text-xs text-gray-500 group-hover:text-gray-700">Micro-donaciones puntuales</p>
                  </div>
                  <div class="mt-4 text-right">
                    <span class="text-sm font-semibold text-[#29abe0] group-hover:underline">Donar $5 →</span>
                  </div>
                </NuxtLink>
              </div>
            </div>
            
            <!-- Confianza / Testimonio -->
            <div class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              <div class="flex items-start gap-3">
                <Icon name="mdi:format-quote-open" class="h-6 w-6 flex-shrink-0 text-amber-500" />
                <p class="italic">"Después de donar, recibí un correo detallado sobre cómo mi aporte ayudó a Max a recibir su tratamiento. ¡Increíble transparencia!" — <span class="font-bold not-italic">Laura M.</span></p>
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Aportes en Especie -->
          <div class="flex flex-col rounded-3xl bg-emerald-50 p-8 lg:p-10">
            <div class="mb-6">
               <h2 class="mb-2 flex items-center gap-3 text-3xl font-bold text-emerald-800">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-600">
                  <Icon name="mdi:package-variant-closed" class="h-6 w-6" />
                </div>
                Donación en Especie
              </h2>
              <p class="text-emerald-900/80">
                ¿Prefieres donar insumos? Aceptamos alimentos, medicinas y materiales para nuestros refugios aliados.
              </p>
            </div>

            <div class="mb-8 flex-grow">
              <h3 class="mb-4 text-lg font-bold text-emerald-800">Lo que más necesitamos:</h3>
              <ul class="space-y-3">
                <li class="flex items-center gap-3 rounded-lg bg-white/50 p-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Icon name="mdi:bone" class="h-4 w-4" />
                  </div>
                  <span class="font-medium text-emerald-900">Alimento (Perro y Gato)</span>
                </li>
                 <li class="flex items-center gap-3 rounded-lg bg-white/50 p-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Icon name="mdi:pill" class="h-4 w-4" />
                  </div>
                  <span class="font-medium text-emerald-900">Medicamentos y Vitaminas</span>
                </li>
                 <li class="flex items-center gap-3 rounded-lg bg-white/50 p-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Icon name="mdi:home-roof" class="h-4 w-4" />
                  </div>
                  <span class="font-medium text-emerald-900">Artículos de Limpieza</span>
                </li>
              </ul>
            </div>

            <NuxtLink 
              to="/donaciones/especie"
              class="group flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-xl"
            >
              Ver info de entrega
              <Icon name="mdi:arrow-right" class="transition-transform group-hover:translate-x-1" />
            </NuxtLink>
            
            <p class="mt-4 text-center text-xs text-emerald-800/60">
              * Coordinamos recogidas en zona de Maracaibo/San Francisco
            </p>
          </div>

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
            <div
              v-show="openFaq === index"
              class="border-t border-gray-200 bg-gray-50 p-4"
            >
              <p class="text-gray-700">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="overflow-hidden rounded-2xl bg-emerald-700">
        <div class="p-8 text-center md:p-12">
          <h2 class="mb-4 text-3xl font-bold text-white md:text-4xl">
            Cada donación cuenta
          </h2>
          <p class="mx-auto mb-8 max-w-3xl text-emerald-100">
            Juntos podemos hacer la diferencia en la vida de miles de mascotas
            abandonadas. Tu apoyo es fundamental para continuar nuestra labor.
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
import { ref, computed, onMounted } from "vue";
import { useStats } from "~/composables/useStats";

// Estadísticas de impacto
const siteStats = ref({
  totalPets: 0,
  totalAdoptions: 0,
  totalUsers: 0,
});

// One-time donation
const selectedAmount = ref(25);
const customAmount = ref("");
const donorInfo = ref({
  name: "",
  email: "",
  message: "",
  anonymous: false,
});

const finalAmount = computed(() => {
  if (customAmount.value) {
    return parseFloat(customAmount.value);
  }
  return selectedAmount.value;
});

// Testimonials
const testimonials = [
  {
    name: "Carlos Rodríguez",
    type: "Donante mensual",
    image: "/placeholder.webp?height=100&width=100",
    quote:
      "Me encanta saber que mi contribución mensual ayuda a tantas mascotas necesitadas. El equipo de AdoptaPet siempre me mantiene informado sobre cómo se utilizan mis donaciones.",
  },
  {
    name: "Laura Martínez",
    type: "Donante puntual",
    image: "/placeholder.webp?height=100&width=100",
    quote:
      "Después de donar, recibí un correo electrónico detallado sobre cómo mi donación había ayudado a un perro llamado Max a recibir tratamiento veterinario. ¡Increíble transparencia!",
  },
];

// FAQs
const faqs = [
  {
    question: "¿Cómo se utilizan mis donaciones?",
    answer:
      "Tus donaciones se destinan principalmente a alimentación, atención veterinaria, medicamentos, mantenimiento de refugios temporales para el rescate de animales. Estas donaciones seran repartidas a diversos refugios de animales del estado, por ejemplo: ASODEPA.",
  },
  {
    question: "¿Qué tipo de donaciones en especie aceptáis?",
    answer:
      "Aceptamos alimentos para mascotas, mantas, camas, juguetes, medicamentos (con receta veterinaria), productos de limpieza y cualquier otro material que pueda ser útil para el cuidado de los animales. Contacta con nosotros antes de realizar la donación para coordinar la entrega.",
  },
  {
    question: "¿Puedo elegir a qué mascota específica ayudar con mi donación?",
    answer:
      "Sí, ofrecemos la opción de apadrinar a una mascota específica. En este caso, tu donación se destinará principalmente a cubrir los gastos de esa mascota en particular. Recibirás actualizaciones periódicas sobre su estado y evolución.",
  },
];

const openFaq = ref(null);
const paypalButtonRendered = ref(false);

const toggleFaq = (index) => {
  if (openFaq.value === index) {
    openFaq.value = null;
  } else {
    openFaq.value = index;
  }
};

// Mejorado: Configuración del botón de PayPal
onMounted(async () => {
  // Cargar estadísticas
  try {
    const { fetchPublicStats, stats } = useStats();
    await fetchPublicStats();
    siteStats.value = {
      totalPets: stats.value.totalPets,
      totalAdoptions: stats.value.totalAdoptions,
      totalUsers: stats.value.totalUsers,
    };
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }

  // Solo renderizar el botón si no se ha renderizado ya
  if (!paypalButtonRendered.value) {
    usePaypalButton({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "donate",
      },
      // Configurar el botón para procesar donaciones
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: finalAmount.value.toString(),
                currency_code: "USD",
                breakdown: {
                  item_total: {
                    currency_code: "USD",
                    value: finalAmount.value.toString(),
                  },
                },
              },
              description: "Donación para AdoptaZulia",
              items: [
                {
                  name: "Donación para mascotas",
                  quantity: "1",
                  unit_amount: {
                    currency_code: "USD",
                    value: finalAmount.value.toString(),
                  },
                  category: "DONATION",
                },
              ],
            },
          ],
        });
      },
      // Manejar la aprobación del pago
      onApprove: async (data, actions) => {
        try {
          const details = await actions.order.capture();

          // Mostrar mensaje de agradecimiento
          alert(
            `¡Gracias por tu donación de $${finalAmount.value}! Tu apoyo ayudará a nuestras mascotas.`
          );
        } catch (error) {
          console.error("Error al procesar la donación:", error);
          alert(
            "Hubo un problema al procesar tu donación. Por favor, intenta nuevamente."
          );
        }
      },
      // Manejar cancelaciones
      onCancel: () => {},
      // Manejar errores
      onError: (err) => {
        console.error("Error en el proceso de PayPal:", err);
        alert(
          "Ocurrió un error durante el proceso de donación. Por favor, intenta más tarde."
        );
      },
    }).then(() => {
      paypalButtonRendered.value = true;
    });
  }

  });

  const canonicalUrl = useCanonicalUrl('/donaciones')
  const ogImage = useOgImage('/og.jpg')

  useSeoMeta({
    title: 'Donaciones | Adopta Zulia',
    description: 'Tu ayuda salva vidas. Apoya nuestra misión de rescatar y cuidar mascotas en Zulia con donaciones económicas o en especie.',
    ogTitle: 'Haz una Donación - Adopta Zulia',
    ogDescription: 'Tu aporte transforma vidas. Ayúdanos a seguir rescatando, rehabilitando y encontrando hogares para mascotas en Zulia.',
    ogImage,
    ogImageAlt: 'Ayuda a las mascotas de Zulia',
    ogUrl: canonicalUrl,
    ogType: 'website',
    twitterTitle: 'Donaciones - Adopta Zulia',
    twitterDescription: 'Apoya nuestra misión de rescate animal en el estado Zulia.',
    twitterImage: ogImage,
    twitterCard: 'summary_large_image',
  })

  useHead({
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl,
      }
    ],
    script: [
      useStructuredData(createBreadcrumbSchema([
        { name: 'Inicio', url: useCanonicalUrl('/') },
        { name: 'Donaciones', url: canonicalUrl }
      ])),
    ]
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

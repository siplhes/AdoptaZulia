<script setup lang="ts">
//...
</script>
<template>
  <footer class="bg-emerald-700 pt-12 text-[#FEFFFA]">
    <div class="container mx-auto px-8">
      <div class="relative flex flex-wrap">
        <div
          class="-mx-4 -mt-4 flex flex-col flex-wrap items-center py-4 pl-4 pr-8 md:flex-col md:flex-nowrap lg:w-1/3 lg:items-start"
        >
          <NuxtLink class="-ml-6" to="/">
            <div to="/" class="inline-flex items-center font-serif text-3xl">
              <h6 class="inline-flex items-center font-serif text-3xl">Adopta Zulia</h6>
            </div>
          </NuxtLink>
          <p class="mt-2 w-full text-center lg:text-left">
            Dedicados a rescatar a los animales que mas nos necesitan
          </p>
          <div class="mt-6 inline-flex space-x-3">
            <div class="flex flex-wrap space-x-4">
              <NuxtLink
                href="https://www.facebook.com/"
                aria-label="facebook"
                external
                target="_blank"
              >
                <Icon name="logos:facebook" class="text-2xl" size="28px" />
              </NuxtLink>
              <NuxtLink href="https://twitter.com/" aria-label="twitter" external target="_blank">
                <Icon name="logos:twitter" class="text-2xl" size="28px" />
              </NuxtLink>
              <NuxtLink href="https://discord.gg/" aria-label="discord" external target="_blank">
                <Icon name="logos:discord-icon" class="text-2xl" size="28px" />
              </NuxtLink>
              <NuxtLink
                href="https://www.youtube.com/"
                aria-label="youtube"
                external
                target="_blank"
              >
                <Icon name="logos:youtube-icon" class="text-2xl" size="28px" />
              </NuxtLink>
            </div>
          </div>
          <div class="my-6 text-center">
            <NuxtLink to="/">+1 234 567-890</NuxtLink>
            <br />
            <NuxtLink to="/">adoptazulia@gmail.com</NuxtLink>
          </div>
        </div>
        <div
          class="flex w-full flex-col items-center p-4 sm:w-1/2 md:w-1/3 md:flex-1 lg:items-start"
        >
          <h2 class="text-primary-600 dark:text-primary-200 text-xl font-bold">General</h2>
          <ul class="text-center lg:mt-2 lg:text-left">
            <li class="mb-4">
              <NuxtLink to="/" class="hover:text-primary-600 dark:text-primary-200">FAQ</NuxtLink>
            </li>
            <li class="mb-4">
              <NuxtLink to="/" class="hover:text-primary-600 dark:text-primary-200">News</NuxtLink>
            </li>
            <li class="mb-4">
              <NuxtLink to="/" class="hover:text-primary-600 dark:text-primary-200">
                Careers
              </NuxtLink>
            </li>
            <li class="mb-4">
              <NuxtLink to="/" class="hover:text-primary-600 dark:text-primary-200">
                Contact Us
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div
          class="flex w-full flex-col items-center p-4 sm:w-1/2 md:w-1/3 md:flex-1 lg:items-start"
        >
          <h2 class="text-primary-600 dark:text-primary-200 text-xl font-bold">Enlaces</h2>
          <ul class="text-center lg:mt-2 lg:text-left">
            <li class="mb-4">
              <NuxtLink to="/mascotas" class="hover:text-primary-600 dark:text-primary-200">
                Adopta
              </NuxtLink>
            </li>
            <li class="mb-4">
              <NuxtLink to="/donaciones" class="hover:text-primary-600 dark:text-primary-200">
                Dona
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div class="flex w-full flex-col items-center p-4 md:w-1/3">
          <h2 class="text-primary-600 dark:text-primary-200 text-xl font-bold">Gallery</h2>
          <div class="-mx-2 flex flex-wrap items-center lg:mt-2">
            <div class="w-1/2 p-2 sm:w-4/12">
              <div class="block overflow-hidden rounded-xl hover:opacity-75">
                <NuxtImg
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixid=MnwyMDkyMnwwfDF8c2VhcmNofDF8fHBldHxlbnwwfHx8fDE2MzA0NjI1MjM&amp;ixlib=rb-1.2.1q=85&amp;fm=jpg&amp;crop=faces&amp;cs=srgb&amp;w=300&amp;h=250&amp;fit=crop"
                  class="w-full"
                />
              </div>
            </div>
            <div class="w-1/2 p-2 sm:w-4/12">
              <div class="block overflow-hidden rounded-xl hover:opacity-75">
                <NuxtImg
                  src="https://images.unsplash.com/photo-1491485880348-85d48a9e5312?ixid=MnwyMDkyMnwwfDF8c2VhcmNofDE1fHxjYXR8ZW58MHx8fHwxNjMwNDY3NzE4&amp;ixlib=rb-1.2.1q=85&amp;fm=jpg&amp;crop=faces&amp;cs=srgb&amp;w=300&amp;h=250&amp;fit=crop"
                  class="w-full"
                />
              </div>
            </div>
            <div class="w-1/2 p-2 sm:w-4/12">
              <div class="block overflow-hidden rounded-xl hover:opacity-75">
                <NuxtImg
                  src="https://images.unsplash.com/photo-1591946614720-90a587da4a36?ixid=MnwyMDkyMnwwfDF8c2VhcmNofDIzfHxwZXR8ZW58MHx8fHwxNjMwNDYyNTIz&amp;ixlib=rb-1.2.1q=85&amp;fm=jpg&amp;crop=faces&amp;cs=srgb&amp;w=300&amp;h=250&amp;fit=crop"
                  class="w-full"
                />
              </div>
            </div>
            <div class="w-1/2 p-2 sm:w-4/12">
              <div class="block overflow-hidden rounded-xl hover:opacity-75">
                <NuxtImg
                  src="https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixid=MnwyMDkyMnwwfDF8c2VhcmNofDI3fHxjYXR8ZW58MHx8fHwxNjMwNDY3NzE4&amp;ixlib=rb-1.2.1q=85&amp;fm=jpg&amp;crop=faces&amp;cs=srgb&amp;w=300&amp;h=250&amp;fit=crop"
                  class="w-full"
                />
              </div>
            </div>
            <div class="w-1/2 p-2 sm:w-4/12">
              <div class="block overflow-hidden rounded-xl hover:opacity-75">
                <NuxtImg
                  src="https://images.unsplash.com/photo-1524511751214-b0a384dd9afe?ixid=MnwyMDkyMnwwfDF8c2VhcmNofDI4fHxwZXR8ZW58MHx8fHwxNjMwNDYyNTIz&amp;ixlib=rb-1.2.1q=85&amp;fm=jpg&amp;crop=faces&amp;cs=srgb&amp;w=300&amp;h=250&amp;fit=crop"
                  class="w-full"
                />
              </div>
            </div>
            <div class="w-1/2 p-2 sm:w-4/12">
              <div class="block overflow-hidden rounded-xl hover:opacity-75">
                <NuxtImg
                  src="https://images.unsplash.com/photo-1591561582301-7ce6588cc286?ixid=MnwyMDkyMnwwfDF8c2VhcmNofDMwfHxyYWJiaXR8ZW58MHx8fHwxNjMwNDY3NjUw&amp;ixlib=rb-1.2.1q=85&amp;fm=jpg&amp;crop=faces&amp;cs=srgb&amp;w=300&amp;h=250&amp;fit=crop"
                  class="w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col sm:w-full md:items-center">
          <hr class="mb-4 opacity-25" />
          <p class="text-l p-4 sm:text-center">
            &copy; 2025. Todos los derechos reservados - Adopta Zulia | Hecho con por Siplhes
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
<style scoped></style>

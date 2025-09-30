<template>
  <footer class="py-6 sm:py-8 mt-8 bg-gray-100 mt-auto border-t">
    <div class="container mx-auto px-4 sm:px-6">
      <div class="flex flex-col lg:flex-row justify-between items-start">
        <!-- Gauche : Info -->
        <div class="w-full mb-6 sm:mb-8 text-center sm:text-left border-b sm:border-none pb-6 sm:pb-0 px-0 sm:px-8">
          <div class="flex justify-center sm:justify-start items-center">
            <span class="font-bold text-lg">EasyQuickTrack</span>
          </div>
          <p class="mt-2 text-sm sm:text-base">La solution moderne pour raccourcir vos liens et analyser leur
            performance en temps réel.</p>

          <!-- Liens sociaux -->
          <ul role="list" class="flex justify-center sm:justify-start space-x-4">
            <SocialCustomLink />
          </ul>
          <p class="text-xs sm:text-sm mt-3 sm:mt-2">
            © {{ new Date().getFullYear() }} EasyQuickTrack. Tous droits réservés.
          </p>
        </div>

        <!-- Droit : Navigation -->
        <div class="w-full mt-4 sm:mt-0">
          <div class="grid grid-cols-2 gap-6 sm:gap-8 sm:grid-cols-4 px-6">
            <div v-for="section in navSections" :key="section.title" class="mb-4 sm:mb-0">
              <h3 class="text-xs sm:text-sm font-semibold mb-2 uppercase">{{ section.title }}</h3>
              <ul class="space-y-1 text-xs sm:text-sm">
                <li v-for="link in section.links" :key="link.name">
                  <component :is="link.disabled ? 'span' : link.external ? 'a' : NuxtLink"
                    :href="!link.disabled && link.external ? link.to : undefined"
                    :to="!link.disabled ? link.to : undefined"
                    :target="!link.disabled && link.external ? '_blank' : undefined"
                    :class="[link.disabled ? 'not-link' : 'hover:text-primary-600', 'py-1 block']"
                    :title="link.disabled ? `${link.name} est temporairement indisponible` : undefined">
                    {{ link.name }}
                  </component>
                </li>
              </ul>
            </div>
          </div>

          <!-- Copyright -->
          <div
            class="flex flex-col sm:flex-row items-center border-t mt-4 pt-4 justify-center md:justify-end sm:justify-around text-center">
            <p class="font-mono text-xs sm:text-sm flex items-center">
              par
              <span
                class="mx-1 sm:mx-2 inline-flex items-center gap-2 px-2 py-1 rounded-full bg-transparent text-xs font-bold p-1 inline-block border border-textClr hover:bg-blue-100 hover:text-primary-600 transition-all">
                <!-- Logo PGS -->
                <div
                  class="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 overflow-hidden border border-gray-300">
                  <img :src="sharedFiles.paths.logo.pgs" alt="PGS" class="w-4 h-4 object-contain" />
                </div>

                <!-- Marque -->
                <a :href="footerData?.brandUrl" target="_blank">{{ footerData?.brand }}</a>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { useSharedFiles } from '~/stores/sharedFiles';

const sharedFiles = useSharedFiles();

// Sections de navigation 
const navSections: any[] = [
  {
    title: "Produit",
    links: [
      { name: "Tarif", to: "/pricing" },
      { name: "À propos", to: "/about", disabled: true, },
      { name: "API", to: "", disabled: true, }
    ]
  },
  {
    title: "Support",
    links: [
      { name: "Contact", to: "/contact" },
      { name: "Mentions légales", to: "/legal" },
      { name: "Confidentialité", to: "/privacy" }
    ]
  },
]

// Récupérer les données du footer depuis le store
type FooterData = { brand: string; brandUrl: string }
const { data: footerData, pending, error } = await useAsyncData<FooterData>(
  'footerData',
  () => sharedFiles.getFooterData()
)
</script>

<style scoped>
.not-link {
  @apply cursor-not-allowed opacity-40;
}
</style>
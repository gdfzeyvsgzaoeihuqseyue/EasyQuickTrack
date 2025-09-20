<template>
 <main class="font-body">
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-textClr p-4">
      <ErrorPage :error="errorData" class="flex-grow" />
    </div>

    <!-- Footer -->
    <footer class="py-4 border-t bg-WtBAct text-center">
      <div class="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto w-full gap-4 px-4">
        <!-- Logos Desktop -->
        <div class="flex-shrink-0 items-center justify-center mx-4 hidden lg:block">
          <img :src="sharedFiles.paths.logo.dc" alt="Logo" class="h-12 w-auto dark:hidden" />
          <img :src="sharedFiles.paths.logo.dw" alt="Logo" class="h-12 w-auto hidden dark:block" />
        </div>

        <!-- Logos Mobiles -->
        <div class="sm:hidden flex-shrink-0 flex items-center mx-4">
          <img :src="sharedFiles.paths.logo.mc" alt="Logo" class="h-12 w-auto dark:hidden" />
          <img :src="sharedFiles.paths.logo.mw" alt="Logo" class="h-12 w-auto hidden dark:block" />
        </div>

        <div>
          <p>© {{ new Date().getFullYear() }} EasyQuickTrack. Tous droits réservés.</p>
        </div>

        <!-- Liens sociaux -->
        <ul role="list" class="flex justify-center sm:justify-start space-x-4">
          <SocialCustomLink />
        </ul>
      </div>
    </footer>
  </main>
</template>

<script setup>
import ErrorPage from '~/components/ErrorPage.vue'
import { useSharedFiles } from '~/stores/sharedFiles'

const sharedFiles = useSharedFiles()

const props = defineProps({
  error: Object,
})

const errorData = computed(() => {
  const { statusCode } = props.error
  let title = "Oups ! Une erreur est survenue"
  let message = "Désolé, une erreur inattendue est survenue. Veuillez réessayer plus tard."
  let image = sharedFiles.paths.general.error500

  if (statusCode === 404) {
    title = "Oups ! Page introuvable"
    message = "Désolé, la page que vous recherchez semble s'être perdue dans l'espace numérique. Il est possible qu'elle ait été déplacée, supprimée, ou que l'adresse soit incorrecte."
    image = sharedFiles.paths.general.error404
  } else if (statusCode === 403) {
    title = "Accès interdit"
    message = "Vous n'avez pas l'autorisation d'accéder à cette page."
    image = sharedFiles.paths.general.error403
  } else if (statusCode === 500) {
    title = "Erreur interne du serveur"
    message = "Une erreur interne est survenue. Nos équipes travaillent à la corriger."
    image = sharedFiles.paths.general.error500
  }

  return { statusCode, title, message, image }
})

useHead({
  title: computed(() => `Erreur ${errorData.value.statusCode}`)
})

definePageMeta({
  layout: false,
})
</script>

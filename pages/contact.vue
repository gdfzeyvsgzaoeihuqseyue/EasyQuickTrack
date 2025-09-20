<template>
  <div class="py-12">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">
          Contactez-nous
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Une question ? Un besoin spécifique ? Notre équipe est là pour vous aider.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Formulaire de contact -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>

          <form @submit.prevent="submitForm" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input v-model="form.firstName" type="text" required
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input v-model="form.lastName" type="text" required
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input v-model="form.email" type="email" required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sujet
              </label>
              <select v-model="form.subject" required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                <option value="">Sélectionnez un sujet</option>
                <option value="support">Support technique</option>
                <option value="billing">Facturation</option>
                <option value="feature">Demande de fonctionnalité</option>
                <option value="partnership">Partenariat</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea v-model="form.message" required rows="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                placeholder="Décrivez votre demande en détail..."></textarea>
            </div>

            <button type="submit" :disabled="submitting"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="submitting" class="flex items-center justify-center">
                <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Envoi en cours...
              </span>
              <span v-else>Envoyer le message</span>
            </button>
          </form>
        </div>

        <!-- Informations de contact -->
        <div class="space-y-8">
          <div class="card p-8">
            <h3 class="text-xl font-bold text-gray-900 mb-6">Autres moyens de nous contacter</h3>

            <div class="space-y-6">
              <div class="flex items-start">
                <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <IconMail class="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">Email</h4>
                  <p class="text-gray-600">contact@EasyQuickTrack.com</p>
                  <p class="text-sm text-gray-500 mt-1">Réponse sous 24h</p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <IconMessage class="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">Chat en direct</h4>
                  <p class="text-gray-600">Disponible sur le site</p>
                  <p class="text-sm text-gray-500 mt-1">Lun-Ven, 9h-18h</p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <IconMapPin class="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">Bureau</h4>
                  <p class="text-gray-600">123 Rue de la Tech<br>75001 Paris, France</p>
                  <p class="text-sm text-gray-500 mt-1">Uniquement sur rendez-vous</p>
                </div>
              </div>


              <div class="flex items-start">
                <div class="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <IconSocial class="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">Suivez-nous</h4>
                  <!-- Liens sociaux -->
                  <ul role="list" class="flex justify-center sm:justify-start space-x-4">
                    <SocialLink />
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="card p-8">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Centre d'aide</h3>
            <p class="text-gray-600 mb-6">
              Consultez notre base de connaissances pour trouver des réponses rapides aux questions courantes.
            </p>
            <NuxtLink to="/help" class="btn-secondary inline-block">
              Accéder au centre d'aide
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Notification -->
  <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
    @close="closeNotification" />
</template>

<script setup>
import { ref } from 'vue';
import { IconBrandFacebook, IconBrandLinkedin, IconBrandX, IconLoader2, IconMail, IconMapPin, IconMessage, IconSocial } from '@tabler/icons-vue';

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  message: ''
});

const submitting = ref(false);

// État pour la notification flottante
const notificationMessage = ref('');
const notificationType = ref('success'); // 'success' ou 'error' ou 'info'
const showNotification = ref(false);
let notificationTimeout = null;

// Fonction pour afficher la notification flottante
const showFloatingNotification = (message, type = 'success') => {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;

  notificationTimeout = setTimeout(() => {
    closeNotification();
  }, 3000); // La notification disparaît après 3 secondes
};

const closeNotification = () => {
  showNotification.value = false;
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
};

const submitForm = async () => {
  submitting.value = true;

  try {
    // Simulation d'envoi de formulaire
    await new Promise(resolve => setTimeout(resolve, 2000));

    showFloatingNotification('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.', 'success');

    // Réinitialiser le formulaire
    Object.keys(form.value).forEach(key => {
      form.value[key] = '';
    });
  } catch (error) {
    // Gérer les erreurs de soumission 
    console.error('Erreur lors de l\'envoi du message:', error);
    showFloatingNotification('Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.', 'error');
  } finally {
    submitting.value = false;
  }
};

useSeoMeta({
  title: 'Contact',
  description: 'Contactez l\'équipe EasyQuickTrack pour toutes vos questions sur notre service de raccourcissement d\'URLs.',
});
</script>

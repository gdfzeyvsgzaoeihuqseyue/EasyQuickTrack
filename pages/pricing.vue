<template>
  <div class="py-12">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">
          Tarifs simples et transparents
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Choisissez le plan qui convient le mieux à vos besoins. Commencez gratuitement, évoluez quand vous le souhaitez.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <!-- Plan Gratuit -->
        <div class="card p-8 relative">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Gratuit</h3>
            <div class="text-4xl font-bold text-gray-900 mb-1">0€</div>
            <p class="text-gray-500 mb-6">par mois</p>
            
            <ul class="text-left space-y-4 mb-8">
              <li class="flex items-start">
                <IconCheck class="w-5 h-5 text-success-500 mr-3 mt-0.5" />
                <span class="text-gray-700">100 liens par mois</span>
              </li>
              <li class="flex items-start">
                <IconCheck class="w-5 h-5 text-success-500 mr-3 mt-0.5" />
                <span class="text-gray-700">Analyses de base</span>
              </li>
              <li class="flex items-start">
                <IconCheck class="w-5 h-5 text-success-500 mr-3 mt-0.5" />
                <span class="text-gray-700">Support communautaire</span>
              </li>
            </ul>
            
            <button class="w-full btn-secondary">
              Commencer gratuitement
            </button>
          </div>
        </div>

        <!-- Plan Pro -->
        <div class="card p-8 relative border-2 border-primary-500 shadow-2xl">
          <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span class="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              Populaire
            </span>
          </div>
          
          <div class="text-center">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
            <div class="text-4xl font-bold text-gray-900 mb-1">19€</div>
            <p class="text-gray-500 mb-6">par mois</p>
            
            <ul class="text-left space-y-4 mb-8">
              <li class="flex items-start">
                <IconCheck class="w-5 h-5 text-success-500 mr-3 mt-0.5" />
                <span class="text-gray-700">10,000 liens par mois</span>
              </li>
              <li class="flex items-start">
                <IconCheck class="w-5 h-5 text-success-500 mr-3 mt-0.5" />
                <span class="text-gray-700">Analyses avancées</span>
              </li>
              <li class="flex items-start">
                <IconCheck class="w-5 h-5 text-success-500 mr-3 mt-0.5" />
                <span class="text-gray-700">Liens personnalisés</span>
              </li>
              <li class="flex items-start">
                <IconCheck class="w-5 h-5 text-success-500 mr-3 mt-0.5" />
                <span class="text-gray-700">Support prioritaire</span>
              </li>
            </ul>
            
            <button class="w-full btn-primary">
              Choisir Pro
            </button>
          </div>
        </div>

        <!-- Plan Enterprise -->
        <div class="card p-8 relative">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
            <div class="text-4xl font-bold text-gray-900 mb-1">99€</div>
            <p class="text-gray-500 mb-6">par mois</p>
            
            <ul class="text-left space-y-4 mb-8">
              <li class="flex items-start">
                <IconCheck class="w-5 h-5 text-success-500 mr-3 mt-0.5" />
                <span class="text-gray-700">Liens illimités</span>
              </li>
              <li class="flex items-start">
                <IconCheck class="w-5 h-5 text-success-500 mr-3 mt-0.5" />
                <span class="text-gray-700">API complète</span>
              </li>
              <li class="flex items-start">
                <IconCheck class="w-5 h-5 text-success-500 mr-3 mt-0.5" />
                <span class="text-gray-700">Domaine personnalisé</span>
              </li>
              <li class="flex items-start">
                <IconCheck class="w-5 h-5 text-success-500 mr-3 mt-0.5" />
                <span class="text-gray-700">Support dédié</span>
              </li>
            </ul>
            
            <button class="w-full btn-secondary">
              Nous contacter
            </button>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="mt-20">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
          Questions fréquentes
        </h2>
        
        <div class="max-w-3xl mx-auto space-y-6">
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Puis-je changer de plan à tout moment ?
            </h3>
            <p class="text-gray-600">
              Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.
            </p>
          </div>
          
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Y a-t-il des frais cachés ?
            </h3>
            <p class="text-gray-600">
              Non, nos tarifs sont transparents. Vous ne payez que ce qui est affiché, sans frais cachés.
            </p>
          </div>
          
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Que se passe-t-il si je dépasse ma limite ?
            </h3>
            <p class="text-gray-600">
              Nous vous avertirons avant d'atteindre votre limite. Vous pourrez upgrader votre plan ou attendre le mois suivant.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IconCheck } from '@tabler/icons-vue'

useSeoMeta({
  title: 'Tarifs',
  description: 'Découvrez nos plans tarifaires flexibles pour tous vos besoins de raccourcissement d\'URLs.',
})
</script>
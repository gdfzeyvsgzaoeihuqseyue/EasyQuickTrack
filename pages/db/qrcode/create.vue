<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Générateur de QR Code</h1>
        <p class="text-gray-600">Créez des QR codes personnalisés pour vos liens ou URLs</p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- Générateur principal -->
        <div class="xl:col-span-2">
          <QRCodeGenerator />
        </div>

        <!-- Sidebar avec informations et historique -->
        <div class="space-y-6">
          <!-- Niveaux de correction d'erreur -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Niveaux de correction</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Faible (L)</span>
                <span class="text-sm text-gray-600">~7% d'erreur</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Moyen (M)</span>
                <span class="text-sm text-gray-600">~15% d'erreur</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Élevé (Q)</span>
                <span class="text-sm text-gray-600">~25% d'erreur</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Très élevé (H)</span>
                <span class="text-sm text-gray-600">~30% d'erreur</span>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-4">
              Un niveau plus élevé permet une meilleure récupération en cas de dommage, mais rend le QR code plus dense.
            </p>
          </div>

          <!-- Conseils d'utilisation -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Conseils d'utilisation</h3>
            <div class="space-y-3 text-sm text-gray-600">
              <div class="flex items-start">
                <span class="w-2 h-2 bg-primary-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                <span>Utilisez un contraste élevé pour une meilleure lisibilité</span>
              </div>
              <div class="flex items-start">
                <span class="w-2 h-2 bg-success-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                <span>Testez toujours vos QR codes avant impression</span>
              </div>
              <div class="flex items-start">
                <span class="w-2 h-2 bg-warning-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                <span>Gardez une marge suffisante autour du code</span>
              </div>
              <div class="flex items-start">
                <span class="w-2 h-2 bg-purple-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                <span>Les logos ne doivent pas dépasser 30% de la taille</span>
              </div>
              <div class="flex items-start">
                <span class="w-2 h-2 bg-gray-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                <span>Formats multiples supportés (PNG, JPEG, SVG, WebP)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QRCodeGenerator } from '@/components/qrcode'

definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'QR Code',
  description: 'Créez des QR codes personnalisés pour vos liens courts et URLs avec des options avancées.',
  robots: 'noindex, nofollow'
})
</script>

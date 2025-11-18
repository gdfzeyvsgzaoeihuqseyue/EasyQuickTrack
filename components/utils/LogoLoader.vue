<template>
  <div 
    class="logo-loader-inline" 
    :class="[
      { 'fullscreen': fullscreen },
      `size-${size}`
    ]"
  >
    <div class="logo-wrapper">
      <svg 
        viewBox="0 0 1080 1080" 
        xmlns="http://www.w3.org/2000/svg"
        class="animated-logo"
      >
        <!-- Éclair principal -->
        <path 
          class="lightning"
          d="M 540 50 
             L 450 450 
             L 600 450 
             L 480 1030 
             L 700 550 
             L 520 550 
             L 650 200 
             Z"
          fill="#8B5CF6"
        />
        
        <!-- Effet de lueur intérieure -->
        <path 
          class="lightning-glow"
          d="M 540 80 
             L 470 450 
             L 580 450 
             L 500 980 
             L 680 550 
             L 540 550 
             L 630 230 
             Z"
          fill="#A78BFA"
          opacity="0.6"
        />
      </svg>
      
      <!-- Effet d'éclairs autour -->
      <div class="spark spark-1"></div>
      <div class="spark spark-2"></div>
      <div class="spark spark-3"></div>
      <div class="spark spark-4"></div>
    </div>
    
    <p v-if="showText" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  fullscreen: {
    type: Boolean,
    default: false
  },
  showText: {
    type: Boolean,
    default: true
  },
  text: {
    type: String,
    default: 'Chargement...'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

defineEmits(['loaded'])
</script>

<style scoped>
/* Version inline (par défaut) */
.logo-loader-inline {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: 200px;
}

/* Version fullscreen (optionnelle) */
.logo-loader-inline.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  z-index: 9999;
  padding: 0;
  min-height: 100vh;
}

.logo-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.animated-logo {
  width: 80px;
  height: 80px;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.6));
}

/* Tailles personnalisables */
.logo-loader-inline.size-sm .animated-logo {
  width: 50px;
  height: 50px;
}

.logo-loader-inline.size-md .animated-logo {
  width: 80px;
  height: 80px;
}

.logo-loader-inline.size-lg .animated-logo {
  width: 120px;
  height: 120px;
}

.logo-loader-inline.fullscreen .animated-logo {
  width: 200px;
  height: 200px;
}

/* Animation de l'éclair principal */
.lightning {
  animation: 
    strikeDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
    pulse 1.5s ease-in-out 0.6s infinite;
}

@keyframes strikeDown {
  0% {
    transform: translateY(-100%) scale(0.3);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
}

/* Animation de la lueur */
.lightning-glow {
  animation: 
    glowPulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards,
    glowContinuous 1.5s ease-in-out 0.7s infinite;
}

@keyframes glowPulse {
  0% {
    transform: translateY(-100%) scale(0.3);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
}

@keyframes glowContinuous {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

/* Étincelles autour */
.spark {
  position: absolute;
  width: 4px;
  height: 12px;
  background: linear-gradient(180deg, #8B5CF6, transparent);
  border-radius: 2px;
  opacity: 0;
}

.spark-1 {
  top: 20%;
  left: 10%;
  animation: sparkFlash 2s ease-in-out 0.8s infinite;
}

.spark-2 {
  top: 30%;
  right: 15%;
  animation: sparkFlash 2s ease-in-out 1.2s infinite;
}

.spark-3 {
  bottom: 35%;
  left: 15%;
  animation: sparkFlash 2s ease-in-out 1.6s infinite;
}

.spark-4 {
  bottom: 25%;
  right: 10%;
  animation: sparkFlash 2s ease-in-out 2s infinite;
}

@keyframes sparkFlash {
  0%, 90%, 100% {
    opacity: 0;
    transform: translateY(0) scale(1);
  }
  5% {
    opacity: 1;
    transform: translateY(-3px) scale(1.2);
  }
  10% {
    opacity: 0;
    transform: translateY(-6px) scale(0.8);
  }
}

/* Texte de chargement */
.loading-text {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  animation: fadeInOut 1.5s ease-in-out infinite;
}

.logo-loader-inline.fullscreen .loading-text {
  font-size: 1.125rem;
  margin-top: 2rem;
  color: #a78bfa;
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* Animation de sortie */
.logo-loader-inline.fade-out {
  animation: fadeOut 0.4s ease-out forwards;
}

@keyframes fadeOut {
  to {
    opacity: 0;
  }
}
</style>

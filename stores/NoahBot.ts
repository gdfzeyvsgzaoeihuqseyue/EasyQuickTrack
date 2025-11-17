import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ChatMessage, ChatbotConfig } from '@/types';
import { usePageContext } from '@/composables/usePageContext';

export const useChatbotStore = defineStore('chatbot', () => {
  // État local
  const messages = ref<ChatMessage[]>([]);
  const isOpen = ref(false);
  const isLoading = ref(false);
  const sessionId = ref<string>('');
  const contextPage = ref<string>('');

  const config = ref<ChatbotConfig>({
    agent: 'auto',
    enableImageGeneration: true,
    enableWebSearch: true,
    enableCodeInterpreter: true,
    temperature: 0.7,
    maxTokens: 2048,
  });

  const { capturePageContext, isContextRelevant } = usePageContext();

  // Générer un ID de session unique
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Initialiser une nouvelle conversation
  const initConversation = (page?: string) => {
    if (!sessionId.value) {
      sessionId.value = generateSessionId();
      contextPage.value = page || window.location.pathname;

      // Charger l'historique depuis localStorage
      loadConversationHistory();
    }
  };

  // Charger l'historique depuis localStorage
  const loadConversationHistory = () => {
    try {
      const saved = localStorage.getItem(`noah_conversation_${contextPage.value}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messages && Array.isArray(parsed.messages)) {
          messages.value = parsed.messages.slice(-50); // Limiter à 50 messages
        }
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  };

  // Sauvegarder l'historique dans localStorage
  const saveConversationHistory = () => {
    try {
      const data = {
        sessionId: sessionId.value,
        messages: messages.value.slice(-50), // Limiter à 50 messages
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`noah_conversation_${contextPage.value}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  };

  // Détecter l'agent approprié selon le contenu
  const detectBestAgent = (content: string): 'mistral' | 'gemini' => {
    const lowerContent = content.toLowerCase();

    // Génération d'images (Mistral)
    const imageKeywords = [
      'génère une image', 'crée une image', 'dessine', 'génération d\'image',
      'créer une image', 'generate image', 'draw', 'illustration visuelle'
    ];

    // Recherche web approfondie (Gemini meilleur)
    const webSearchKeywords = [
      'recherche', 'cherche sur internet', 'trouve sur le web',
      'actualités', 'dernières infos', 'quoi de neuf'
    ];

    const hasImageKeyword = imageKeywords.some(kw => lowerContent.includes(kw));
    const hasWebSearchKeyword = webSearchKeywords.some(kw => lowerContent.includes(kw));

    // Si demande explicite de génération d'image, utiliser Mistral
    if (hasImageKeyword) {
      return 'mistral';
    }

    // Si demande de recherche web, privilégier Gemini
    if (hasWebSearchKeyword) {
      return 'gemini';
    }

    // Par défaut, utiliser Mistral
    return 'mistral';
  };

  // Envoyer un message
  const sendMessage = async (content: string, forcedAgent?: 'mistral' | 'gemini') => {
    if (!sessionId.value) {
      initConversation();
    }

    // Ajouter le message utilisateur
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    messages.value.push(userMessage);
    isLoading.value = true;

    try {
      // Déterminer l'agent à utiliser
      let selectedAgent: 'mistral' | 'gemini';

      if (forcedAgent) {
        selectedAgent = forcedAgent;
      } else if (config.value.agent === 'auto') {
        selectedAgent = detectBestAgent(content);
        console.log(`Mode Auto: Agent sélectionné = ${selectedAgent}`);
      } else {
        selectedAgent = config.value.agent as 'mistral' | 'gemini';
        console.log(`Mode Manuel: Agent sélectionné = ${selectedAgent}`);
      }

      // Capturer le contexte de page si pertinent
      let pageContext = null;
      if (isContextRelevant(content)) {
        pageContext = capturePageContext();
        console.log('Contexte de page capturé:', pageContext);
      }

      const endpoint = selectedAgent === 'gemini'
        ? '/api/chatbot/gemini'
        : '/api/chatbot/mistral';

      console.log(`Envoi vers endpoint: ${endpoint}`);

      const response = await $fetch(endpoint, {
        method: 'POST',
        body: {
          messages: messages.value.map(m => ({
            role: m.role,
            content: m.content,
          })),
          config: config.value,
          sessionId: sessionId.value,
          contextPage: contextPage.value,
          pageContext: pageContext,
        },
      });

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.content,
        agent: selectedAgent,
        metadata: response.metadata,
        images: response.images,
        timestamp: new Date().toISOString(),
      };

      messages.value.push(assistantMessage);

      // Sauvegarder dans localStorage
      saveConversationHistory();

      // Optionnel: sauvegarder dans PGS API si nécessaire plus tard
      await saveConversationToPGSAPI();

      return assistantMessage;
    } catch (error: any) {
      console.error('Error sending message:', error);

      // Message d'erreur plus détaillé
      let errorContent = 'Désolé, une erreur est survenue. Veuillez réessayer.';

      if (error.statusCode === 429) {
        errorContent = 'Limite de requêtes atteinte. Veuillez patienter quelques instants.';
      } else if (error.statusCode === 500) {
        errorContent = 'Erreur de connexion avec le service IA. Veuillez vérifier votre configuration API.';
      } else if (error.message) {
        errorContent = `Erreur: ${error.message}`;
      }

      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: errorContent,
        agent: 'system',
        timestamp: new Date().toISOString(),
      };

      messages.value.push(errorMessage);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // Régénérer un message
  const regenerateMessage = async (messageId: string) => {
    const messageIndex = messages.value.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const messageToRegenerate = messages.value[messageIndex];

    // Récupérer le compteur actuel
    const currentRegenerationCount = messageToRegenerate.metadata?.regeneration_count || 0;

    // Trouver le message utilisateur précédent
    let userMessageIndex = messageIndex - 1;
    while (userMessageIndex >= 0 && messages.value[userMessageIndex].role !== 'user') {
      userMessageIndex--;
    }

    if (userMessageIndex < 0) return;

    const userMessage = messages.value[userMessageIndex];

    // Supprimer le message à régénérer et tous les suivants
    messages.value = messages.value.slice(0, messageIndex);

    // Envoyer le message avec le même agent si disponible
    const forcedAgent = messageToRegenerate.agent as 'mistral' | 'gemini' | undefined;
    const newMessage = await sendMessage(userMessage.content, forcedAgent);

    // Incrémenter le compteur de régénération sur le nouveau message
    if (newMessage) {
      if (!newMessage.metadata) {
        newMessage.metadata = {};
      }
      newMessage.metadata.regeneration_count = currentRegenerationCount + 1;

      // Mettre à jour dans le tableau
      const lastIndex = messages.value.length - 1;
      if (lastIndex >= 0 && messages.value[lastIndex].id === newMessage.id) {
        messages.value[lastIndex] = newMessage;
      }

      // Sauvegarder
      saveConversationHistory();
    }
  };

  // Modifier un message utilisateur
  const editMessage = async (messageId: string, newContent: string) => {
    const messageIndex = messages.value.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const originalMessage = messages.value[messageIndex];

    // Incrémenter le compteur de modification
    const editCount = (originalMessage.metadata?.edit_count || 0) + 1;

    // Supprimer ce message et tous les suivants
    messages.value = messages.value.slice(0, messageIndex);

    // Créer le nouveau message avec le compteur
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: newContent,
      timestamp: new Date().toISOString(),
      metadata: {
        edit_count: editCount
      }
    };

    messages.value.push(userMessage);

    // Sauvegarder avant d'envoyer
    saveConversationHistory();

    // Envoyer le nouveau message
    await sendMessage(newContent);
  };

  // Copier un message
  const copyMessage = async (messageId: string) => {
    const message = messages.value.find(m => m.id === messageId);
    if (!message) return;

    try {
      await navigator.clipboard.writeText(message.content);
      return true;
    } catch (error) {
      console.error('Failed to copy message:', error);
      return false;
    }
  };

  // Sauvegarder la conversation
  const saveConversationToPGSAPI = async () => {
    const config = useRuntimeConfig();
    const pgsBaseAPI = config.public.pgsBaseAPI;

    // Vérifier la config et le nombre de messages
    if (!pgsBaseAPI) return; // Pas d'API configurée
    if (!messages.value || messages.value.length <= 2) return; // Moins de 3 messages, on ne sauvegarde pas

    try {
      await $fetch(`${pgsBaseAPI}/chatbot/conversations`, {
        method: 'POST',
        body: {
          session_id: sessionId.value,
          context_page: contextPage.value,
          messages: messages.value,
        },
      });
    } catch (error) {
      console.warn('Failed to save conversation to PGS API:', error);
    }
  };

  // Toggle chatbot
  const toggleChatbot = () => {
    isOpen.value = !isOpen.value;
  };

  // Réinitialiser la conversation
  const resetConversation = () => {
    messages.value = [];
    sessionId.value = '';
    contextPage.value = '';

    // Effacer localStorage
    try {
      localStorage.removeItem(`noah_conversation_${contextPage.value}`);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  };

  return {
    messages,
    isOpen,
    isLoading,
    sessionId,
    config,
    initConversation,
    sendMessage,
    regenerateMessage,
    editMessage,
    copyMessage,
    toggleChatbot,
    resetConversation,
  };
});

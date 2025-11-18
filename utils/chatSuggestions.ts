export interface ChatSuggestion {
  text: string;
  category: 'general' | 'tools' | 'seo' | 'support' | 'technical';
}

export const chatSuggestions: ChatSuggestion[] = [
  // Général
  { text: 'Qu’est-ce qu’EasyQuickTrack ?', category: 'general' },
  { text: 'Quels outils propose EasyQuickTrack ?', category: 'general' },
  { text: 'Pro Gestion Soft gère-t-elle d’autres plateformes ?', category: 'general' },
  { text: 'EasyQuickTrack est-il gratuit ?', category: 'general' },

  // Outils et fonctionnalités
  { text: 'Comment raccourcir une URL ?', category: 'tools' },
  { text: 'Comment générer un QR Code ?', category: 'tools' },
  { text: 'Comment suivre les statistiques de mes liens ?', category: 'tools' },
  { text: 'Comment analyser la performance d’un site ?', category: 'tools' },
  { text: 'Comment créer un sitemap avec EasyQuickTrack ?', category: 'tools' },
  { text: 'Comment configurer un fichier robots.txt ?', category: 'tools' },
  { text: 'Comment extraire des contacts à partir d’une page web ?', category: 'tools' },

  // SEO
  { text: 'Comment optimiser mon SEO avec les outils d’EasyQuickTrack ?', category: 'seo' },
  { text: 'À quoi sert le fichier robots.txt ?', category: 'seo' },
  { text: 'Pourquoi utiliser un sitemap ?', category: 'seo' },
  { text: 'Comment vérifier la vitesse de mon site ?', category: 'seo' },

  // Support
  { text: 'J’ai un problème pour accéder à un outil', category: 'support' },
  { text: 'Comment contacter l’équipe EasyQuickTrack ?', category: 'support' },
  { text: 'Où trouver la documentation ?', category: 'support' },
  { text: 'Comment signaler un bug ?', category: 'support' },

  // Technique
  { text: 'Disposez-vous d’une API pour raccourcir les URLs ?', category: 'technical' },
  { text: 'Comment intégrer EasyQuickTrack dans mon application ?', category: 'technical' },
  { text: 'Puis-je automatiser la création de QR Codes ?', category: 'technical' },
  { text: 'Comment sécurisez-vous les données analysées ?', category: 'technical' }
];

/**
 * Retourne un nombre aléatoire de suggestions (par défaut 3)
 */
export function getRandomSuggestions(count: number = 3): string[] {
  const shuffled = [...chatSuggestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(s => s.text);
}

/**
 * Retourne des suggestions par catégorie
 */
export function getSuggestionsByCategory(category: ChatSuggestion['category'], count: number = 3): string[] {
  const filtered = chatSuggestions.filter(s => s.category === category);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(s => s.text);
}

export interface ChatSuggestion {
  text: string;
  category: 'general' | 'candidate' | 'recruiter' | 'support' | 'technical';
}

export const chatSuggestions: ChatSuggestion[] = [
  // Suggestions générales
  { text: 'Qu’est-ce que SuitOps HIRE ?', category: 'general' },
  { text: 'Quelle est la mission de SuitOps HIRE ?', category: 'general' },
  { text: 'Pro Gestion Soft gère-t-elle d’autres plateformes RH ?', category: 'general' },


  // Recruteurs
  { text: 'En quoi HIRE peut aider mon entreprise ?', category: 'recruiter' },
  { text: 'Comment créer un compte recruteur ?', category: 'recruiter' },
  { text: 'Comment publier une offre d’emploi ?', category: 'recruiter' },
  { text: 'Comment gérer les candidatures ?', category: 'recruiter' },
  { text: 'Puis-je organiser des entretiens directement sur la plateforme ?', category: 'recruiter' },
  { text: 'SuitOps HIRE permet-il le tri automatique des CV ?', category: 'recruiter' },
  { text: 'Puis-je personnaliser le processus de recrutement ?', category: 'recruiter' },
  { text: 'Comment fonctionne le tableau de bord recruteur ?', category: 'recruiter' },
  { text: 'SuitOps HIRE est-il compatible avec SuitOps RH ?', category: 'recruiter' },

  // Suggestions de support
  { text: 'J’ai un problème pour me connecter à mon compte HIRE', category: 'support' },
  { text: 'Comment contacter l’équipe d’assistance ?', category: 'support' },
  { text: 'Proposez-vous une formation à l’utilisation de HIRE ?', category: 'support' },
  { text: 'Où trouver la documentation utilisateur ?', category: 'support' },
  { text: 'Comment signaler un bug ou une erreur sur une offre ?', category: 'support' },

  // Suggestions techniques
  { text: 'Comment intégrer HIRE à mon site carrière ?', category: 'technical' },
  { text: 'Disposez-vous d’une API pour la gestion des candidatures ?', category: 'technical' },
  { text: 'Comment automatiser l’envoi d’emails aux candidats ?', category: 'technical' },
  { text: 'Puis-je connecter HIRE à mes outils RH existants ?', category: 'technical' },
  { text: 'Afficher les dernières actualités sur le recrutement digital en Afrique', category: 'technical' },

  // Suggestions côté candidats
  { text: 'Comment créer mon profil candidat ?', category: 'candidate' },
  { text: 'Comment postuler à une offre sur SuitOps HIRE ?', category: 'candidate' },
  { text: 'Puis-je importer mon CV ou mon profil LinkedIn ?', category: 'candidate' },
  { text: 'Comment suivre l’évolution de ma candidature ?', category: 'candidate' },
  { text: 'Comment modifier ou supprimer ma candidature ?', category: 'candidate' },
  { text: 'Puis-je recevoir des alertes d’emploi selon mon profil ?', category: 'candidate' },
  { text: 'Est-ce que les recruteurs voient toutes mes informations personnelles ?', category: 'candidate' },
  { text: 'Comment préparer un entretien via la plateforme ?', category: 'candidate' },
  { text: 'Que faire si je ne reçois pas de réponse à ma candidature ?', category: 'candidate' },
  { text: 'Comment mettre en valeur mes compétences sur mon profil ?', category: 'candidate' },
  { text: 'Puis-je enregistrer des offres pour plus tard ?', category: 'candidate' },
  { text: 'Comment savoir si mon CV a été consulté ?', category: 'candidate' },
  { text: 'Y a-t-il des tests ou évaluations sur SuitOps HIRE ?', category: 'candidate' },
  { text: 'Comment garantir la confidentialité de mes données ?', category: 'candidate' },
  { text: 'Puis-je être recommandé à une entreprise ?', category: 'candidate' },
  { text: 'Comment contacter un recruteur via SuitOps HIRE ?', category: 'candidate' },
  { text: 'Comment participer à des campagnes de recrutement ?', category: 'candidate' },
  { text: 'Est-ce que HIRE est gratuit pour les candidats ?', category: 'candidate' },
  { text: 'Puis-je accéder à mes anciennes candidatures ?', category: 'candidate' },
  { text: 'Comment supprimer mon compte candidat ?', category: 'candidate' }

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

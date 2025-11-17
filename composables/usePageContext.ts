import type { PageContext } from '@/types';

export const usePageContext = () => {
  /**
   * Extrait le contenu textuel de la page courante
   */
  const capturePageContext = (): PageContext | null => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return null;
    }

    try {
      // Capturer les informations de base
      const url = window.location.href;
      const title = document.title;
      
      // Meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      const description = metaDescription?.getAttribute('content') || '';

      // Extraire le texte principal (exclure scripts, styles, nav, footer)
      const mainContent = document.querySelector('main') || document.body;
      const clone = mainContent.cloneNode(true) as HTMLElement;

      // Supprimer les éléments non pertinents
      const selectorsToRemove = [
        'script', 'style', 'nav',
        'footer', 'header',
        '.nav', '.footer', '.header',
        '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]'
      ];

      selectorsToRemove.forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove());
      });

      // Extraire le texte
      let content = clone.innerText || clone.textContent || '';
      
      // Nettoyer les espaces multiples et lignes vides
      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      // Limiter à 2000 caractères pour éviter les tokens excessifs
      if (content.length > 2000) {
        content = content.substring(0, 2000) + '...';
      }

      return {
        url,
        title,
        description,
        content
      };
    } catch (error) {
      console.error('Error capturing page context:', error);
      return null;
    }
  };

  /**
   * Détermine si le contexte de page est pertinent pour la question
   */
  const isContextRelevant = (question: string): boolean => {
    const relevantKeywords = [
      'cette page',
      'cette section',
      'ce contenu',
      'ici',
      'sur cette page',
      'page actuelle',
      'ce que je vois',
      'résume',
      'résumer',
      'explique',
      'expliquer',
      'qu\'est-ce que',
      'c\'est quoi'
    ];

    const lowerQuestion = question.toLowerCase();
    return relevantKeywords.some(keyword => lowerQuestion.includes(keyword));
  };

  return {
    capturePageContext,
    isContextRelevant
  };
};

import { H3Event } from 'h3';
import type { GeminiAPIResponse, ThinkingStep, WebSearchResult } from '@/types';
import { buildSystemInstruction } from '@/server/utils/chatbotConfig';

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  const { messages, config: chatConfig, pageContext } = body;

  console.log('🚀 [Gemini] Requête reçue');
  console.log('📝 [Gemini] Nombre de messages:', messages?.length);

  const MODEL_ID = 'gemini-2.5-flash';
  const GENERATE_CONTENT_API = 'generateContent';
  const contents = [];

  const systemInstruction = buildSystemInstruction(pageContext);

  for (const msg of messages) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  }

  const tools: any[] = [];

  if (chatConfig?.enableWebSearch) {
    tools.push({ googleSearch: {} });
    console.log('🔍 [Gemini] Recherche web activée');
  }

  if (chatConfig?.enableCodeInterpreter) {
    tools.push({ codeExecution: {} });
    console.log('💻 [Gemini] Interpréteur de code activé');
  }

  tools.push({ urlContext: {} });

  const requestBody: any = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: chatConfig?.temperature || 0.7,
      maxOutputTokens: chatConfig?.maxTokens || 2048,
      topP: 0.95,
      topK: 40,
    },
    tools: tools,
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ]
  };

  try {
    if (!config.geminiApiKey) {
      console.error('❌ [Gemini] GEMINI_API_KEY non configurée!');
      throw createError({
        statusCode: 500,
        message: 'La clé API Gemini n\'est pas configurée',
      });
    }

    console.log('🌐 [Gemini] Envoi de la requête à Gemini API...');

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${config.geminiApiKey}`;

    const response = await $fetch<GeminiAPIResponse>(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    console.log('✅ [Gemini] Réponse reçue');

    let textContent = '';
    const images: string[] = [];
    const thinkingSteps: ThinkingStep[] = [];
    const toolsUsed: string[] = [];
    const webSearchResults: WebSearchResult[] = [];
    let toolsExecuted: any[] = [];

    // Vérifier que candidates existe avant d'y accéder
    if (response.candidates && response.candidates.length > 0 && response.candidates[0]?.content?.parts) {
      console.log('💬 [Gemini] Traitement des parts de contenu...');

      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          textContent += part.text;
          console.log('📝 [Gemini] Texte ajouté:', part.text.substring(0, 50) + '...');
        }

        if (part.executableCode) {
          toolsUsed.push('code_interpreter');
          console.log('🔧 [Gemini] Code exécutable détecté:', part.executableCode.language);

          thinkingSteps.push({
            step: thinkingSteps.length + 1,
            description: 'Exécution de code',
            type: 'code_execution',
            data: {
              language: part.executableCode.language,
              code: part.executableCode.code
            },
            timestamp: new Date().toISOString()
          });
        }

        if (part.codeExecutionResult) {
          console.log('✅ [Gemini] Résultat d\'exécution:', part.codeExecutionResult.outcome);

          toolsExecuted.push({
            name: 'code_execution',
            status: part.codeExecutionResult.outcome === 'OUTCOME_OK' ? 'success' : 'failed',
            result: part.codeExecutionResult
          });
        }
      }
    } else {
      console.warn('⚠️ [Gemini] Aucun contenu dans la réponse');
    }

    // Vérifier que candidates[0] existe avant d'accéder à groundingMetadata
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata) {
      console.log('🔍 [Gemini] Métadonnées de grounding détectées');

      if (groundingMetadata.webSearchQueries && groundingMetadata.webSearchQueries.length > 0) {
        toolsUsed.push('web_search');
        console.log('🌐 [Gemini] Requêtes web:', groundingMetadata.webSearchQueries.length);

        groundingMetadata.webSearchQueries.forEach(query => {
          console.log('🔎 [Gemini] Recherche:', query);
          thinkingSteps.push({
            step: thinkingSteps.length + 1,
            description: `Recherche web: ${query}`,
            type: 'web_search',
            data: query,
            timestamp: new Date().toISOString()
          });
        });
      }

      if (groundingMetadata.groundingChunks && groundingMetadata.groundingChunks.length > 0) {
        console.log('📚 [Gemini] Sources web trouvées:', groundingMetadata.groundingChunks.length);

        groundingMetadata.groundingChunks.forEach(chunk => {
          if (chunk.web) {
            console.log('🔗 [Gemini] Source:', chunk.web.title, '-', chunk.web.uri);
            webSearchResults.push({
              title: chunk.web.title || '',
              url: chunk.web.uri || '',
              snippet: ''
            });
          }
        });

        toolsExecuted.push({
          name: 'web_search',
          status: 'success',
          result: groundingMetadata.groundingChunks
        });
      }
    }

    const usage = response.usageMetadata ? {
      prompt_tokens: response.usageMetadata.promptTokenCount,
      completion_tokens: response.usageMetadata.candidatesTokenCount,
      total_tokens: response.usageMetadata.totalTokenCount
    } : undefined;

    const result = {
      content: textContent || 'Désolé, je n\'ai pas pu générer une réponse.',
      agent: 'gemini',
      images: images,
      metadata: {
        model: MODEL_ID,
        tools_used: [...new Set(toolsUsed)],
        thinking_steps: thinkingSteps,
        web_search_results: webSearchResults,
        tools_executed: toolsExecuted,
        finish_reason: response.candidates?.[0]?.finishReason,
        safety_ratings: response.candidates?.[0]?.safetyRatings,
        usage: usage,
      },
    };

    console.log('🎉 [Gemini] Réponse traitée avec succès');
    console.log('📝 [Gemini] Contenu final length:', textContent.length);
    console.log('🔧 [Gemini] Outils utilisés:', toolsUsed);

    return result;

  } catch (error: any) {
    console.error('❌ [Gemini API Error]:', error);
    console.error('❌ [Gemini] Error message:', error.message);
    console.error('❌ [Gemini] Error status:', error.statusCode);
    console.error('❌ [Gemini] Error data:', JSON.stringify(error.data, null, 2));

    const errorMessage = error.data?.error?.message || error.message || 'Erreur inconnue';

    throw createError({
      statusCode: error.statusCode || 500,
      message: 'Erreur lors de la communication avec Gemini AI',
      data: errorMessage,
    });
  }
});

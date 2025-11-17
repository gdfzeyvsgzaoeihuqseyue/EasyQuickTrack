import { H3Event } from 'h3';
import type { MistralConversationResponse, ThinkingStep, WebSearchResult } from '@/types';
import { buildSystemInstruction } from '@/server/utils/chatbotConfig';

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  const { messages, config: chatConfig, pageContext } = body;

  console.log('🚀 [Mistral] Requête reçue');
  console.log('📝 [Mistral] Nombre de messages:', messages?.length);

  const systemPrompt = buildSystemInstruction(pageContext);

  const mistralMessages = messages.map((msg: any) => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content,
  }));

  const tools: any[] = [];
  
  if (chatConfig?.enableWebSearch) {
    tools.push({ type: 'web_search' });
  }
  
  if (chatConfig?.enableCodeInterpreter) {
    tools.push({ type: 'code_interpreter' });
  }
  
  if (chatConfig?.enableImageGeneration) {
    tools.push({ type: 'image_generation' });
  }

  const requestBody = {
    model: 'mistral-large-latest',
    inputs: mistralMessages,
    tools: tools,
    instructions: systemPrompt,
    completion_args: {
      temperature: chatConfig?.temperature || 0.7,
      max_tokens: chatConfig?.maxTokens || 2048,
      top_p: 1,
    },
    stream: false,
  };

  try {
    if (!config.mistralApiKey) {
      console.error('❌ [Mistral] MISTRAL_API_KEY non configurée!');
      throw createError({
        statusCode: 500,
        message: 'La clé API Mistral n\'est pas configurée',
      });
    }

    console.log('🌐 [Mistral] Envoi de la requête à Mistral API...');

    const response = await $fetch<any>('https://api.mistral.ai/v1/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': config.mistralApiKey,
      },
      body: requestBody,
    });

    console.log('✅ [Mistral] Réponse reçue');

    let content = '';
    const images: string[] = [];
    const thinkingSteps: ThinkingStep[] = [];
    const toolsUsed: string[] = [];
    const webSearchResults: WebSearchResult[] = [];
    let toolsExecuted: any[] = [];

    if (response.outputs && response.outputs.length > 0) {
      response.outputs.forEach((output: any) => {
        if (output.type === 'tool.execution') {
          console.log('🔧 [Mistral] Tool execution détecté:', output.name);
          
          if (output.name === 'image_generation') {
            toolsUsed.push('image_generation');
            
            try {
              const args = JSON.parse(output.arguments || '{}');
              thinkingSteps.push({
                step: thinkingSteps.length + 1,
                description: `Génération d'image: ${args.prompt || 'image'}`,
                type: 'image_generation',
                data: args.prompt,
                timestamp: new Date().toISOString()
              });
            } catch (e) {
              console.warn('Impossible de parser les arguments du tool');
            }

            toolsExecuted.push({
              name: 'image_generation',
              status: 'success',
              result: output
            });
          }

          if (output.name === 'web_search') {
            toolsUsed.push('web_search');
            
            try {
              const args = JSON.parse(output.arguments || '{}');
              thinkingSteps.push({
                step: thinkingSteps.length + 1,
                description: `Recherche web: ${args.query || 'recherche'}`,
                type: 'web_search',
                data: args.query,
                timestamp: new Date().toISOString()
              });
            } catch (e) {
              console.warn('Impossible de parser les arguments du tool');
            }

            toolsExecuted.push({
              name: 'web_search',
              status: 'success',
              result: output
            });
          }

          if (output.name === 'code_interpreter') {
            toolsUsed.push('code_interpreter');
            
            thinkingSteps.push({
              step: thinkingSteps.length + 1,
              description: 'Exécution de code',
              type: 'code_execution',
              data: output.arguments,
              timestamp: new Date().toISOString()
            });

            toolsExecuted.push({
              name: 'code_interpreter',
              status: 'success',
              result: output
            });
          }
        }

        if (output.type === 'message.output') {
          if (typeof output.content === 'string') {
            content += output.content;
            console.log('💬 [Mistral] Contenu texte ajouté (string)');
          } else if (Array.isArray(output.content)) {
            console.log('💬 [Mistral] Contenu structuré détecté (array)');
            
            output.content.forEach((item: any) => {
              if (item.type === 'text' && item.text) {
                content += item.text;
                console.log('📝 [Mistral] Texte ajouté:', item.text.substring(0, 50) + '...');
              }
              
              if (item.type === 'tool_file' && item.tool === 'image_generation') {
                const imageUrl = `/api/files/${item.file_id}`;
                images.push(imageUrl);
                console.log('🖼️ [Mistral] Image générée détectée:', item.file_id);
                console.log('🔗 [Mistral] URL proxy:', imageUrl);
              }
            });
          }
        }
      });
    } else {
      console.warn('⚠️ [Mistral] Aucun output dans la réponse');
    }

    const result = {
      content: content || 'Désolé, je n\'ai pas pu générer une réponse.',
      agent: 'mistral',
      images: images,
      metadata: {
        model: 'mistral-large-latest',
        tools_used: [...new Set(toolsUsed)],
        thinking_steps: thinkingSteps,
        web_search_results: webSearchResults,
        tools_executed: toolsExecuted,
        usage: response.usage,
      },
    };

    console.log('🎉 [Mistral] Réponse traitée avec succès');
    console.log('📝 [Mistral] Contenu final length:', content.length);
    console.log('🖼️ [Mistral] Images générées:', images.length);
    
    return result;

  } catch (error: any) {
    console.error('❌ [Mistral API Error]:', error);
    console.error('❌ [Mistral] Error message:', error.message);
    console.error('❌ [Mistral] Error status:', error.statusCode);
    console.error('❌ [Mistral] Error data:', JSON.stringify(error.data, null, 2));

    throw createError({
      statusCode: error.statusCode || 500,
      message: 'Erreur lors de la communication avec Mistral AI',
      data: error.data || error.message,
    });
  }
});

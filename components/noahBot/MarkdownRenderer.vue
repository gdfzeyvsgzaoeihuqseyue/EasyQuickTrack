<template>
  <div class="markdown-content prose prose-sm max-w-none">
    <div ref="contentRef" v-html="sanitizedHtml"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/common';
import 'highlight.js/styles/github-dark.css';
import { IconCopy, IconCheck, IconDownload } from '@tabler/icons-vue';
import { h, render } from 'vue';

interface Props {
  content: string;
}

const props = defineProps<Props>();
const contentRef = ref<HTMLElement | null>(null);

const configureMarked = () => {
  const renderer = new marked.Renderer();

  renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
    const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
    const displayLang = lang || 'text';

    let highlightedCode = '';
    if (lang && hljs.getLanguage(lang)) {
      try {
        highlightedCode = hljs.highlight(text, { language: lang }).value;
      } catch (err) {
        console.error('Highlight error for language', lang, ':', err);
        highlightedCode = hljs.highlightAuto(text).value;
      }
    } else {
      highlightedCode = hljs.highlightAuto(text).value;
    }

    // Convertir le nom du langage pour une meilleure lisibilité
    const formattedLang = displayLang.charAt(0).toLowerCase() + displayLang.slice(1);

    return `
      <div class="code-block-wrapper relative group" data-code-id="${codeId}">
        <div class="code-language-label">${formattedLang}</div> <pre class="code-block-content"><code class="hljs language-${displayLang}">${highlightedCode}</code></pre>
        <div class="code-block-actions"></div>
      </div>
    `;
  };

  marked.setOptions({
    breaks: true,
    gfm: true,
    renderer: renderer
  });
};

onMounted(async () => {
  configureMarked();
  await nextTick();
  attachCodeBlockActions();
});

// Attacher les actions aux blocs de code
const attachCodeBlockActions = () => {
  if (!contentRef.value) return;

  const codeBlocks = contentRef.value.querySelectorAll('.code-block-wrapper');

  codeBlocks.forEach((block) => {
    const codeElement = block.querySelector('code');
    const actionsContainer = block.querySelector('.code-block-actions');

    if (!codeElement || !actionsContainer) return;

    const codeText = codeElement.textContent || '';

    // Créer les boutons avec Vue
    const ButtonsComponent = {
      setup() {
        const copied = ref(false);

        const copyCode = async () => {
          try {
            await navigator.clipboard.writeText(codeText);
            copied.value = true;
            setTimeout(() => {
              copied.value = false;
            }, 2000);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        };

        const downloadCode = () => {
          // Détecter le langage du code depuis la classe du code element
          const codeElement = block.querySelector('code');
          let fileExtension = 'txt';
          let mimeType = 'text/plain';

          // Récupérer le langage depuis les classes du code
          if (codeElement) {
            const classes = codeElement.className.split(' ');
            const langClass = classes.find(c => c.startsWith('language-'));
            if (langClass) {
              const lang = langClass.replace('language-', '');

              // Mapping des langages vers extensions et types MIME
              const langMapping: Record<string, { ext: string; mime: string }> = {
                'javascript': { ext: 'js', mime: 'text/javascript' },
                'typescript': { ext: 'ts', mime: 'text/typescript' },
                'html': { ext: 'html', mime: 'text/html' },
                'css': { ext: 'css', mime: 'text/css' },
                'python': { ext: 'py', mime: 'text/x-python' },
                'java': { ext: 'java', mime: 'text/x-java' },
                'json': { ext: 'json', mime: 'application/json' },
                'xml': { ext: 'xml', mime: 'application/xml' },
                'sql': { ext: 'sql', mime: 'application/sql' },
                'php': { ext: 'php', mime: 'text/x-php' },
                'ruby': { ext: 'rb', mime: 'text/x-ruby' },
                'go': { ext: 'go', mime: 'text/x-go' },
                'rust': { ext: 'rs', mime: 'text/x-rust' },
                'swift': { ext: 'swift', mime: 'text/x-swift' },
                'kotlin': { ext: 'kt', mime: 'text/x-kotlin' },
                'shell': { ext: 'sh', mime: 'text/x-shellscript' },
                'bash': { ext: 'sh', mime: 'text/x-shellscript' },
                'markdown': { ext: 'md', mime: 'text/markdown' },
                'yaml': { ext: 'yaml', mime: 'text/yaml' },
                'vue': { ext: 'vue', mime: 'text/x-vue' },
                'jsx': { ext: 'jsx', mime: 'text/jsx' },
                'tsx': { ext: 'tsx', mime: 'text/tsx' },
              };

              if (langMapping[lang]) {
                fileExtension = langMapping[lang].ext;
                mimeType = langMapping[lang].mime;
              }
            }
          }

          const blob = new Blob([codeText], { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `noah-${fileExtension}-${Date.now()}.${fileExtension}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };

        return () => h('div', {
          class: 'absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity'
        }, [
          h('button', {
            onClick: copyCode,
            class: `px-3 py-1 rounded text-xs flex items-center space-x-1 transition ${copied.value ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`,
            title: 'Copier le code'
          }, [
            copied.value
              ? h(IconCheck, { class: 'w-3 h-3' })
              : h(IconCopy, { class: 'w-3 h-3' }),
            h('span', {}, copied.value ? 'Copié!' : 'Copier')
          ]),
          h('button', {
            onClick: downloadCode,
            class: 'bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs flex items-center space-x-1 transition',
            title: 'Télécharger le code'
          }, [
            h(IconDownload, { class: 'w-3 h-3' }),
            h('span', {}, 'Télécharger')
          ])
        ]);
      }
    };

    render(h(ButtonsComponent), actionsContainer as Element);
  });
};

// Convertir et nettoyer le HTML
const sanitizedHtml = computed(() => {
  try {
    const rawHtml = marked(props.content) as string;
    return DOMPurify.sanitize(rawHtml, {
      ADD_ATTR: ['target', 'rel', 'class', 'data-code-id'],
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'em', 'u', 'del',
        'ul', 'ol', 'li',
        'a', 'code', 'pre',
        'blockquote',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span'
      ]
    });
  } catch (error) {
    console.error('Markdown rendering error:', error);
    return `<p>${props.content}</p>`;
  }
});
</script>

<style scoped>
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4) {
  @apply font-bold mt-4 mb-2;
}

.markdown-content :deep(h1) {
  @apply text-xl;
}

.markdown-content :deep(h2) {
  @apply text-lg;
}

.markdown-content :deep(h3) {
  @apply text-base;
}

.markdown-content :deep(p) {
  @apply mb-3;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  @apply ml-4 mb-3;
}

.markdown-content :deep(ul) {
  @apply list-disc;
}

.markdown-content :deep(ol) {
  @apply list-decimal;
}

.markdown-content :deep(li) {
  @apply mb-1;
}

.markdown-content :deep(a) {
  @apply text-blue-600 hover:text-blue-800 underline;
}

.markdown-content :deep(code) {
  @apply bg-gray-100 px-1 py-0.5 rounded text-sm font-mono;
}

.markdown-content :deep(.code-block-wrapper) {
  @apply relative mb-3 overflow-hidden;
}

.markdown-content :deep(.code-block-content) {
  @apply bg-gray-900 text-white p-4 rounded-lg overflow-x-auto;
  max-width: 100%;
}

.markdown-content :deep(.code-block-content code) {
  @apply bg-transparent p-0 text-sm font-mono block;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.markdown-content :deep(blockquote) {
  @apply border-l-4 border-gray-300 pl-4 italic my-3;
}

.markdown-content :deep(table) {
  @apply w-full border-collapse mb-3;
  overflow-x: auto;
  display: block;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  @apply border border-gray-300 px-3 py-2 text-left;
}

.markdown-content :deep(th) {
  @apply bg-gray-100 font-semibold;
}

.markdown-content :deep(strong) {
  @apply font-bold;
}

.markdown-content :deep(em) {
  @apply italic;
}

.markdown-content :deep(.code-language-label) {
  @apply absolute top-2 left-2 bg-gray-700 text-white text-xs px-3 py-1 rounded;
  z-index: 10;
  font-family: 'Roboto Mono', monospace;
}

/* Ajustement pour le positionnement des boutons afin qu'ils ne se superposent pas au label */
.markdown-content :deep(.code-block-actions) {
  position: absolute;
  top: 0;
  right: 0;
  padding-top: 6px;
  padding-right: 6px;
  display: flex;
  gap: 8px;
  z-index: 11;
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Assurez-vous que les boutons apparaissent au survol du wrapper */
.markdown-content :deep(.code-block-wrapper:hover .code-block-actions) {
  opacity: 1;
}

/* Ajustement du padding-top pour le code-block-content pour laisser de la place au label */
.markdown-content :deep(.code-block-content) {
  padding-top: 35px;
}
</style>

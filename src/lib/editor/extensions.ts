import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import FileHandler from '@tiptap/extension-file-handler';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import { createLowlight } from 'lowlight';

// 注册常用编程语言用于语法高亮
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import php from 'highlight.js/lib/languages/php';
import java from 'highlight.js/lib/languages/java';

// 创建lowlight实例
const lowlight = createLowlight();

// 注册语言
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('bash', bash);
lowlight.register('sql', sql);
lowlight.register('json', json);
lowlight.register('xml', xml);
lowlight.register('css', css);
lowlight.register('php', php);
lowlight.register('java', java);

// 创建扩展配置函数
export function createEditorExtensions(options?: {
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
}) {
  return [
    StarterKit.configure({
      // 禁用默认的CodeBlock，使用带语法高亮的版本
      codeBlock: false,
      // 配置 dropcursor（避免重复注册）
      dropcursor: {
        color: '#64748b', // slate-500
        width: 2
      }
    }),
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'plaintext',
      HTMLAttributes: {
        class: 'hljs rounded-md bg-muted p-4 font-mono text-sm'
      },
      exitOnTripleEnter: true,
      exitOnArrowDown: true
    }),
    Image.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-md shadow-sm',
        loading: 'lazy'
      }
    }),
    FileHandler.configure({
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      onDrop: (editor, files, pos) => {
        if (!files?.length || !options?.onImageUpload) return;
        files.forEach(async (file) => {
          if (file.type?.startsWith('image/')) {
            try {
              const url = await options.onImageUpload!(file);
              // @ts-ignore runtime check
              if (!(editor as any)?.isDestroyed) {
                editor
                  .chain()
                  .insertContentAt(pos, {
                    type: 'image',
                    attrs: { src: url, alt: file.name }
                  })
                  .focus()
                  .run();
              }
            } catch (error) {
              console.error('Image upload failed (drop):', error);
            }
          }
        });
      },
      onPaste: (editor, files) => {
        if (!files?.length || !options?.onImageUpload) return;
        files.forEach(async (file) => {
          if (file.type?.startsWith('image/')) {
            try {
              const url = await options.onImageUpload!(file);
              // @ts-ignore runtime check
              if (!(editor as any)?.isDestroyed) {
                editor
                  .chain()
                  .focus()
                  .setImage({ src: url, alt: file.name })
                  .run();
              }
            } catch (error) {
              console.error('Image upload failed (paste):', error);
            }
          }
        });
      }
    }),
    Placeholder.configure({
      placeholder: options?.placeholder || '开始输入内容...'
    })
  ];
}

// 导出支持的编程语言列表
export const SUPPORTED_LANGUAGES = [
  { value: 'plaintext', label: '纯文本' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'bash', label: 'Bash/Shell' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML/HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'php', label: 'PHP' },
  { value: 'java', label: 'Java' }
];

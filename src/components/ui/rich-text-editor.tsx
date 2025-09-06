'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
// toast imported but not used - removing
// import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createEditorExtensions } from '@/lib/editor/extensions';
import { uploadImage } from '@/lib/editor/upload-image';
import { RichTextToolbar } from './rich-text-toolbar';

interface RichTextEditorProps {
  content?: string;
  placeholder?: string;
  editable?: boolean;
  showToolbar?: boolean;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
  onChange?: (content: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface RichTextEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

export const RichTextEditor = forwardRef<
  RichTextEditorRef,
  RichTextEditorProps
>(
  (
    {
      content = '',
      placeholder = '开始输入内容...',
      editable = true,
      showToolbar = true,
      minHeight = '200px',
      maxHeight,
      className,
      onChange,
      onFocus,
      onBlur
    },
    ref
  ) => {
    // 内部状态管理（用于非受控模式）
    const [internalContent, setInternalContent] = useState(content || '');

    // 确定是否为受控模式
    const isControlled = onChange !== undefined;

    // 保护机制：记录上一次的内容，防止意外清空
    const lastContentRef = useRef<string>('');

    // 图片上传处理函数（使用useCallback防止重新创建）
    const handleImageUpload = useCallback(
      async (file: File): Promise<string> => {
        try {
          // Debug: Starting image upload
          const url = await uploadImage(file);
          // Debug: Image uploaded successfully

          // 临时移除toast测试是否影响
          // toast.success('图片上传成功');

          return url;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : '图片上传失败';
          // Debug: Image upload failed

          // 临时移除toast测试是否影响
          // toast.error(message);

          throw error;
        }
      },
      []
    ); // 空依赖数组，因为uploadImage和toast都是稳定的

    // 调试日志
    // Debug: RichTextEditor render

    // 创建编辑器实例
    const editor = useEditor(
      {
        extensions: createEditorExtensions({
          placeholder,
          onImageUpload: handleImageUpload
        }),
        content: content,
        editable,
        immediatelyRender: false, // 重要: 避免SSR问题
        onUpdate: ({ editor }) => {
          const html = editor.getHTML();
          // Debug: Editor onUpdate

          // 保护机制：检查是否意外清空
          if (
            html === '<p></p>' &&
            lastContentRef.current &&
            lastContentRef.current !== '<p></p>'
          ) {
            // Debug: Detected unexpected content clearing, attempting to restore
            // 可以选择恢复内容或者忽略这次更新
            return;
          }

          lastContentRef.current = html;

          if (isControlled) {
            // 受控模式：调用外部onChange
            onChange?.(html);
          } else {
            // 非受控模式：更新内部状态
            // Debug: Setting internal content
            setInternalContent(html);
          }
        },
        onFocus: () => {
          onFocus?.();
        },
        onBlur: () => {
          onBlur?.();
        },
        editorProps: {
          attributes: {
            class: cn(
              'prose prose-sm prose-stone dark:prose-invert max-w-none',
              'min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2',
              'text-base outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:shadow-sm',
              '[&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-4',
              '[&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5',
              '[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4',
              '[&_ul]:list-disc [&_ul]:ml-6',
              '[&_ol]:list-decimal [&_ol]:ml-6',
              '[&_li]:mb-1',
              '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4',
              '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3',
              '[&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2',
              '[&_p]:mb-3',
              '[&_hr]:my-6 [&_hr]:border-border'
            ),
            style: `min-height: ${minHeight}; ${maxHeight ? `max-height: ${maxHeight};` : ''} overflow-y: auto;`
          }
        }
      },
      [
        placeholder,
        handleImageUpload
        // 移除 editable - 通过useEffect动态更新，避免重建编辑器
        // 移除 internalContent - 防止循环依赖
        // 移除 onChange, onFocus, onBlur - 这些函数不应该触发重建
        // 移除 isControlled - 由onChange是否存在决定，不需要单独依赖
      ]
    );

    // 调试useEditor重建
    // Debug: useEditor created/updated

    // 动态更新editable状态，避免重建编辑器
    useEffect(() => {
      if (editor && editor.isEditable !== editable) {
        // Debug: Updating editable
        editor.setEditable(editable);
      }
    }, [editor, editable]);

    // 同步外部content变化（受控模式）
    useEffect(() => {
      if (isControlled && editor && content !== editor.getHTML()) {
        // Debug: Syncing external content
        editor.commands.setContent(content);
      }
    }, [content, editor, isControlled]);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      getContent: () => editor?.getHTML() || '',
      setContent: (content: string) => {
        editor?.commands.setContent(content);
        // 在非受控模式下，也需要更新内部状态
        if (!isControlled) {
          setInternalContent(content);
        }
      },
      focus: () => {
        editor?.commands.focus();
      },
      blur: () => {
        editor?.commands.blur();
      },
      clear: () => {
        editor?.commands.clearContent();
        // 在非受控模式下，也需要清空内部状态
        if (!isControlled) {
          setInternalContent('');
        }
      }
    }));

    if (!editor) {
      return (
        <div
          className={cn(
            'border-input min-h-[200px] w-full rounded-md border bg-transparent px-3 py-2',
            'text-muted-foreground flex items-center justify-center',
            className
          )}
        >
          加载编辑器中...
        </div>
      );
    }

    return (
      <div className={cn('w-full', className)}>
        {showToolbar && editable && (
          <RichTextToolbar editor={editor} className='mb-2' />
        )}
        <div
          className={cn(
            'border-input relative rounded-md border',
            'focus-within:ring-ring focus-within:ring-2 focus-within:ring-offset-2',
            !editable && 'bg-muted/50'
          )}
        >
          <EditorContent editor={editor} className='rich-text-content' />
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

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

    // 增强保护：记录最后一次确认的内容状态
    const confirmedContentRef = useRef<string>(content || '');
    const contentSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 图片上传处理函数 - 使用useRef保持引用稳定，避免编辑器重建
    const imageUploadRef = useRef<((file: File) => Promise<string>) | null>(
      null
    );

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

    // 更新ref以保持最新的处理函数
    imageUploadRef.current = handleImageUpload;

    // 调试日志
    // Debug: RichTextEditor render

    // 创建编辑器实例
    const editor = useEditor(
      {
        extensions: createEditorExtensions({
          placeholder,
          onImageUpload: (file: File) => imageUploadRef.current!(file)
        }),
        content: content,
        editable,
        immediatelyRender: false, // 重要: 避免SSR问题
        onUpdate: ({ editor }) => {
          const html = editor.getHTML();
          // Debug: Editor onUpdate

          // 增强保护机制：检查是否意外清空
          const isEmptyContent = html === '<p></p>' || html === '';
          const hasValidPreviousContent =
            confirmedContentRef.current &&
            confirmedContentRef.current !== '<p></p>' &&
            confirmedContentRef.current !== '';

          if (isEmptyContent && hasValidPreviousContent) {
            // Debug: Detected unexpected content clearing, attempting to restore
            console.warn(
              '[RichTextEditor] Detected content loss, attempting restore'
            );

            // 延迟恢复内容，避免与其他状态更新冲突
            if (contentSyncTimeoutRef.current) {
              clearTimeout(contentSyncTimeoutRef.current);
            }
            contentSyncTimeoutRef.current = setTimeout(() => {
              if (editor && !editor.isDestroyed) {
                editor.commands.setContent(confirmedContentRef.current);
                console.log('[RichTextEditor] Content restored successfully');
              }
            }, 100);
            return;
          }

          // 记录有效内容
          if (!isEmptyContent) {
            confirmedContentRef.current = html;
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
        placeholder
        // 移除 handleImageUpload - 防止回调变化导致编辑器重建
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

        // 清除任何待处理的恢复操作
        if (contentSyncTimeoutRef.current) {
          clearTimeout(contentSyncTimeoutRef.current);
          contentSyncTimeoutRef.current = null;
        }

        editor.commands.setContent(content);
        confirmedContentRef.current = content;
      }
    }, [content, editor, isControlled]);

    // 组件卸载时清理定时器
    useEffect(() => {
      return () => {
        if (contentSyncTimeoutRef.current) {
          clearTimeout(contentSyncTimeoutRef.current);
        }
      };
    }, []);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      getContent: () => editor?.getHTML() || '',
      setContent: (content: string) => {
        if (contentSyncTimeoutRef.current) {
          clearTimeout(contentSyncTimeoutRef.current);
          contentSyncTimeoutRef.current = null;
        }
        editor?.commands.setContent(content);
        confirmedContentRef.current = content;
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
        if (contentSyncTimeoutRef.current) {
          clearTimeout(contentSyncTimeoutRef.current);
          contentSyncTimeoutRef.current = null;
        }
        editor?.commands.clearContent();
        confirmedContentRef.current = '';
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

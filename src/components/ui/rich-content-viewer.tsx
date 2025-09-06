'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { createEditorExtensions } from '@/lib/editor/extensions';
import { cn } from '@/lib/utils';

interface RichContentViewerProps {
  content: string;
  className?: string;
}

export function RichContentViewer({
  content,
  className
}: RichContentViewerProps) {
  const editor = useEditor({
    extensions: createEditorExtensions(),
    content,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm prose-stone dark:prose-invert max-w-none',
          'w-full bg-transparent p-3 text-base outline-none',
          '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:shadow-sm',
          '[&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-4 [&_pre]:overflow-x-auto',
          '[&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic',
          '[&_ul]:list-disc [&_ul]:ml-6',
          '[&_ol]:list-decimal [&_ol]:ml-6',
          '[&_li]:mb-1',
          '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-foreground',
          '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-foreground',
          '[&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-foreground',
          '[&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-foreground',
          '[&_hr]:my-6 [&_hr]:border-border',
          '[&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/30 [&_a]:underline-offset-4',
          '[&_a:hover]:decoration-primary',
          '[&_table]:border-collapse [&_table]:border [&_table]:border-border',
          '[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-2 [&_th]:font-semibold',
          '[&_td]:border [&_td]:border-border [&_td]:p-2'
        )
      }
    }
  });

  if (!editor) {
    return (
      <div className={cn('text-muted-foreground w-full p-3', className)}>
        加载内容中...
      </div>
    );
  }

  // 如果没有内容，显示占位文本
  if (!content || content === '<p></p>' || content.trim() === '') {
    return (
      <div
        className={cn(
          'text-muted-foreground w-full p-3 text-center italic',
          className
        )}
      >
        暂无内容
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <EditorContent editor={editor} className='rich-content-viewer' />
    </div>
  );
}

'use client';

import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link,
  Image,
  Code2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SUPPORTED_LANGUAGES } from '@/lib/editor/extensions';
import { uploadImage } from '@/lib/editor/upload-image';

interface RichTextToolbarProps {
  editor: Editor;
  className?: string;
}

export function RichTextToolbar({ editor, className }: RichTextToolbarProps) {
  // 工具栏按钮组件
  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <Button
      type='button'
      variant={isActive ? 'default' : 'ghost'}
      size='sm'
      onClick={onClick}
      disabled={disabled}
      title={title}
      className='h-8 w-8 p-0'
    >
      {children}
    </Button>
  );

  // 插入图片
  const insertImage = () => {
    // 创建文件输入元素并附加到DOM，确保在所有浏览器中可靠触发change事件
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.top = '-9999px';
    // 允许重复选择同一文件
    input.value = '';
    document.body.appendChild(input);

    const handleChange = async () => {
      const file = input.files?.[0];
      // 清理DOM
      input.removeEventListener('change', handleChange);
      document.body.removeChild(input);

      if (!file) return;

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
      }

      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('图片文件大小不能超过5MB！');
        return;
      }

      try {
        // 上传图片
        const url = await uploadImage(file);

        // 编辑器可能在异步期间被重建或销毁，这里做保护
        if ((editor as any)?.isDestroyed) return;

        // 插入图片
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } catch (error) {
        console.error('图片上传失败:', error);
        const errorMessage =
          error instanceof Error ? error.message : '图片上传失败，请重试';
        alert(errorMessage);
      }
    };

    input.addEventListener('change', handleChange, { once: true });
    input.click();
  };

  // 插入链接
  const insertLink = () => {
    // 检查是否已有选中的文本
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    const url = window.prompt('请输入链接URL:', 'https://');
    if (url) {
      if (selectedText) {
        // 如果有选中文本，直接添加链接
        editor.chain().focus().setLink({ href: url }).run();
      } else {
        // 如果没有选中文本，插入链接文本
        const linkText = window.prompt('请输入链接文本:', url);
        if (linkText) {
          editor
            .chain()
            .focus()
            .insertContent(`<a href="${url}">${linkText}</a>`)
            .run();
        }
      }
    }
  };

  // 设置代码块语言
  const setCodeBlockLanguage = (language: string) => {
    if (editor.isActive('codeBlock')) {
      editor.chain().focus().updateAttributes('codeBlock', { language }).run();
    } else {
      editor.chain().focus().toggleCodeBlock({ language }).run();
    }
  };

  // 获取当前代码块语言
  const getCurrentLanguage = () => {
    const attrs = editor.getAttributes('codeBlock');
    return attrs.language || 'plaintext';
  };

  return (
    <div
      className={cn(
        'border-input bg-background flex flex-wrap items-center gap-1 rounded-md border p-2',
        className
      )}
    >
      {/* 历史操作 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title='撤销 (Ctrl+Z)'
      >
        <Undo className='h-4 w-4' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title='重做 (Ctrl+Y)'
      >
        <Redo className='h-4 w-4' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-1 h-6' />

      {/* 文本格式 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title='加粗 (Ctrl+B)'
      >
        <Bold className='h-4 w-4' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title='斜体 (Ctrl+I)'
      >
        <Italic className='h-4 w-4' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title='删除线'
      >
        <Strikethrough className='h-4 w-4' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title='行内代码 (Ctrl+E)'
      >
        <Code className='h-4 w-4' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-1 h-6' />

      {/* 标题 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title='标题1'
      >
        <Heading1 className='h-4 w-4' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title='标题2'
      >
        <Heading2 className='h-4 w-4' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title='标题3'
      >
        <Heading3 className='h-4 w-4' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-1 h-6' />

      {/* 列表 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title='无序列表'
      >
        <List className='h-4 w-4' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title='有序列表'
      >
        <ListOrdered className='h-4 w-4' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-1 h-6' />

      {/* 引用 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title='引用块'
      >
        <Quote className='h-4 w-4' />
      </ToolbarButton>

      {/* 代码块 */}
      <div className='flex items-center gap-1'>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title='代码块 (Ctrl+Alt+C)'
        >
          <Code2 className='h-4 w-4' />
        </ToolbarButton>

        {editor.isActive('codeBlock') && (
          <Select
            value={getCurrentLanguage()}
            onValueChange={setCodeBlockLanguage}
          >
            <SelectTrigger className='h-8 w-[110px] text-xs'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem
                  key={lang.value}
                  value={lang.value}
                  className='text-xs'
                >
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Separator orientation='vertical' className='mx-1 h-6' />

      {/* 插入内容 */}
      <ToolbarButton
        onClick={insertLink}
        isActive={editor.isActive('link')}
        title='插入链接'
      >
        <Link className='h-4 w-4' />
      </ToolbarButton>
      <ToolbarButton onClick={insertImage} title='插入图片'>
        <Image className='h-4 w-4' />
      </ToolbarButton>
    </div>
  );
}

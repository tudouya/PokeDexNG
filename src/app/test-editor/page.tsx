'use client';

import { useState } from 'react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { RichContentViewer } from '@/components/ui/rich-content-viewer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function TestEditorPage() {
  const [content, setContent] = useState(
    '<p>欢迎使用Tiptap富文本编辑器！</p><p>您可以：</p><ul><li>插入图片（拖拽或粘贴）</li><li>添加代码块（支持语法高亮）</li><li>使用各种格式（<strong>加粗</strong>、<em>斜体</em>等）</li></ul>'
  );
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <div className='container mx-auto space-y-6 p-6'>
      <div>
        <h1 className='text-3xl font-bold'>Tiptap富文本编辑器测试</h1>
        <p className='text-muted-foreground mt-2'>
          测试富文本编辑器的各项功能，包括图片上传、代码高亮等
        </p>
      </div>

      <div className='flex gap-2'>
        <Button
          variant={!previewMode ? 'default' : 'outline'}
          onClick={() => setPreviewMode(false)}
        >
          编辑模式
        </Button>
        <Button
          variant={previewMode ? 'default' : 'outline'}
          onClick={() => setPreviewMode(true)}
        >
          预览模式
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* 编辑器区域 */}
        <Card>
          <CardHeader>
            <CardTitle>编辑器</CardTitle>
            <CardDescription>
              尝试各种功能：输入文字、插入图片、添加代码块等
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!previewMode ? (
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder='开始编写内容...'
                minHeight='400px'
              />
            ) : (
              <RichContentViewer content={content} />
            )}
          </CardContent>
        </Card>

        {/* 实时预览区域 */}
        <Card>
          <CardHeader>
            <CardTitle>实时预览</CardTitle>
            <CardDescription>
              查看渲染效果，这是最终用户看到的样式
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='min-h-[400px] rounded-md border p-4'>
              <RichContentViewer content={content} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>功能测试清单</CardTitle>
          <CardDescription>验证以下功能是否正常工作</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3'>
            <div>
              <h4 className='mb-2 font-medium'>基础格式化</h4>
              <ul className='text-muted-foreground space-y-1'>
                <li>
                  • <strong>粗体</strong> (Ctrl+B)
                </li>
                <li>
                  • <em>斜体</em> (Ctrl+I)
                </li>
                <li>
                  • <del>删除线</del>
                </li>
                <li>• 标题 (H1、H2、H3)</li>
                <li>• 有序/无序列表</li>
                <li>• 引用块</li>
                <li>
                  • <code>行内代码</code> (Ctrl+E)
                </li>
              </ul>
            </div>
            <div>
              <h4 className='mb-2 font-medium'>图片功能 🖼️</h4>
              <ul className='text-muted-foreground space-y-1'>
                <li>• 📁 点击图片按钮选择文件</li>
                <li>• 🖱️ 直接拖拽图片到编辑器</li>
                <li>• 📋 Ctrl+V 粘贴截图</li>
                <li>• 🔄 自动压缩优化</li>
                <li>• ⚡ 支持 JPG/PNG/GIF/WebP</li>
                <li>• 📏 最大5MB限制</li>
              </ul>
            </div>
            <div>
              <h4 className='mb-2 font-medium'>代码功能 💻</h4>
              <ul className='text-muted-foreground space-y-1'>
                <li>• 代码块 (Ctrl+Alt+C)</li>
                <li>• 🎨 语法高亮支持:</li>
                <li>&nbsp;&nbsp;- JavaScript/TypeScript</li>
                <li>&nbsp;&nbsp;- Python, Java, PHP</li>
                <li>&nbsp;&nbsp;- SQL, JSON, XML</li>
                <li>&nbsp;&nbsp;- CSS, Bash</li>
                <li>• 🔧 动态语言选择</li>
              </ul>
            </div>
          </div>

          <Separator className='my-4' />

          <div>
            <h4 className='mb-2 font-medium'>🎯 快速测试步骤</h4>
            <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
              <div className='bg-muted/50 rounded-md p-3'>
                <p className='mb-2 font-medium'>1. 测试图片上传</p>
                <ul className='text-muted-foreground space-y-1'>
                  <li>• 点击工具栏中的 📷 图片按钮</li>
                  <li>• 选择一张图片文件上传</li>
                  <li>• 观察上传进度和结果</li>
                </ul>
              </div>
              <div className='bg-muted/50 rounded-md p-3'>
                <p className='mb-2 font-medium'>2. 测试代码高亮</p>
                <ul className='text-muted-foreground space-y-1'>
                  <li>• 点击工具栏中的 💻 代码块按钮</li>
                  <li>• 输入一些代码（如JS/Python）</li>
                  <li>• 选择对应的编程语言</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HTML源码</CardTitle>
          <CardDescription>当前编辑器内容的HTML代码</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className='bg-muted overflow-auto rounded-md p-4 text-xs'>
            <code>{content}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

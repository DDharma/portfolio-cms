'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExt from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { Mark, mergeAttributes } from '@tiptap/core'
import { Bold, Italic, Code, Heading1, Heading2, List, ListOrdered, Trash2, Plus, Code2, X, Image as ImageIcon } from 'lucide-react'

const lowlight = createLowlight(common)
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface CustomStyle {
  id: string
  name: string
  css_rules: string
  description?: string
  category?: string
}

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
  enableCustomClasses?: boolean
  availableClasses?: CustomStyle[]
  onAddClass?: (className: string) => void
  label?: string
  error?: string
  enableImageUpload?: boolean
}

// Custom Tiptap Mark for preserving <span class="...">
const CustomClass = Mark.create({
  name: 'customClass',
  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) return {}
          return { class: attributes.class }
        },
      },
    }
  },
  parseHTML() {
    return [{ tag: 'span[class]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0]
  },
})

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text here...',
  disabled = false,
  maxLength = 5000,
  enableCustomClasses = false,
  availableClasses = [],
  onAddClass,
  label,
  error,
  enableImageUpload = false,
}: RichTextEditorProps) {
  const [showClassPicker, setShowClassPicker] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [characterCount, setCharacterCount] = useState(0)
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [htmlContent, setHtmlContent] = useState(value)
  const [activeCustomClass, setActiveCustomClass] = useState<string | null>(null)
  const [imagePanel, setImagePanel] = useState<'closed' | 'upload' | 'url'>('closed')
  const [imageUrl, setImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      ImageExt.configure({ allowBase64: true }),
      CustomClass,
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
      setCharacterCount(editor.getText().length)
      const attrs = editor.getAttributes('customClass')
      setActiveCustomClass(attrs.class || null)
    },
    onSelectionUpdate: ({ editor }) => {
      // Update character count on selection change
      setCharacterCount(editor.getText().length)
      const attrs = editor.getAttributes('customClass')
      setActiveCustomClass(attrs.class || null)
    },
  })

  // Sync external value changes
  useEffect(() => {
    if (editor && value && !editor.isEmpty && editor.getHTML() !== value) {
      editor.commands.setContent(value)
      setCharacterCount(editor.getText().length)
    }
    setHtmlContent(value)
  }, [editor, value])

  const applyClassToSelection = (className: string) => {
    if (!editor) return

    const { from, to } = editor.state.selection
    if (from === to) {
      alert('Please select text first to apply a style')
      return
    }

    // Apply custom class mark to selected text
    editor
      .chain()
      .focus()
      .setMark('customClass', { class: className })
      .run()

    setShowClassPicker(false)
    setSelectedClass('')
  }

  const removeCustomClass = () => {
    editor?.chain().focus().unsetMark('customClass').run()
    setActiveCustomClass(null)
  }

  const handleAddCustomStyle = () => {
    if (selectedClass && onAddClass) {
      onAddClass(selectedClass)
      setSelectedClass('')
      setShowClassPicker(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!editor) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run()
        setImagePanel('closed')
      }
    } catch (error) {
      console.error('Image upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageUrlInsert = () => {
    if (!editor || !imageUrl) return
    editor.chain().focus().setImage({ src: imageUrl }).run()
    setImageUrl('')
    setImagePanel('closed')
  }

  if (!editor) {
    return <div className="rounded-lg border border-white/10 bg-white/5 p-4">Loading editor...</div>
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-white">{label}</label>}

      {/* Mode Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsHtmlMode(false)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            !isHtmlMode
              ? 'bg-white/10 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Visual
        </button>
        <button
          type="button"
          onClick={() => setIsHtmlMode(true)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            isHtmlMode
              ? 'bg-white/10 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Code2 className="h-4 w-4 inline mr-1" />
          HTML
        </button>
      </div>

      {/* Toolbar */}
      {!isHtmlMode && (
      <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-zinc-950 p-2">
        {/* Basic formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          disabled={disabled}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          disabled={disabled}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          disabled={disabled}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          disabled={disabled}
          title="Code Block"
        >
          <Code2 className="h-4 w-4" />
        </ToolbarButton>

        <div className="h-6 w-px bg-white/[0.1]" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          disabled={disabled}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          disabled={disabled}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>

        <div className="h-6 w-px bg-white/[0.1]" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          disabled={disabled}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          disabled={disabled}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        {/* Custom classes */}
        {enableCustomClasses && availableClasses.length > 0 && (
          <>
            <div className="h-6 w-px bg-white/[0.1]" />
            <div className="relative">
              <ToolbarButton
                onClick={() => setShowClassPicker(!showClassPicker)}
                active={showClassPicker}
                disabled={disabled}
                title="Apply custom style"
              >
                <span className="text-xs font-medium">Style</span>
              </ToolbarButton>

              {showClassPicker && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-white/[0.2] bg-zinc-900 p-3 shadow-lg">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-white">Select a style:</label>
                    <select
                      value={selectedClass}
                      onChange={e => setSelectedClass(e.target.value)}
                      className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white focus:border-white/20 focus:outline-none"
                    >
                      <option value="">Choose a style...</option>
                      {availableClasses.map(style => (
                        <option key={style.id} value={style.name}>
                          {style.name} ({style.category})
                        </option>
                      ))}
                    </select>

                    {selectedClass && (
                      <Button
                        type="button"
                        size="sm"
                        className="w-full"
                        onClick={() => applyClassToSelection(selectedClass)}
                        disabled={disabled}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Apply Style
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Clear formatting */}
        <div className="h-6 w-px bg-white/10" />
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          disabled={disabled}
          title="Clear formatting"
        >
          <Trash2 className="h-4 w-4" />
        </ToolbarButton>

        {/* Image upload */}
        {enableImageUpload && (
          <>
            <div className="h-6 w-px bg-white/10" />
            <div className="relative">
              <ToolbarButton
                onClick={() => setImagePanel(imagePanel === 'closed' ? 'upload' : 'closed')}
                active={imagePanel !== 'closed'}
                disabled={disabled}
                title="Insert image"
              >
                <ImageIcon className="h-4 w-4" />
              </ToolbarButton>

              {imagePanel !== 'closed' && (
                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-white/[0.2] bg-zinc-900 p-4 shadow-lg">
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setImagePanel('upload')}
                      className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        imagePanel === 'upload'
                          ? 'bg-white/10 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImagePanel('url')}
                      className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        imagePanel === 'url'
                          ? 'bg-white/10 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      URL
                    </button>
                  </div>

                  {imagePanel === 'upload' && (
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || disabled}
                      >
                        {isUploading ? 'Uploading...' : 'Choose Image'}
                      </Button>
                    </div>
                  )}

                  {imagePanel === 'url' && (
                    <div className="space-y-2">
                      <input
                        type="url"
                        placeholder="Paste image URL"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleImageUrlInsert()
                        }}
                        className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none"
                        disabled={disabled}
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="w-full"
                        onClick={handleImageUrlInsert}
                        disabled={!imageUrl || disabled}
                      >
                        Insert Image
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Active class indicator with remove */}
        {enableCustomClasses && activeCustomClass && (
          <>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-1 rounded px-2 py-1 bg-indigo-500/20 border border-indigo-500/30">
              <span className="text-xs text-indigo-300 font-mono">{activeCustomClass}</span>
              <button
                type="button"
                onClick={removeCustomClass}
                className="text-indigo-300 hover:text-white ml-1"
                title={`Remove .${activeCustomClass} style`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </>
        )}
      </div>
      )}

      {/* Scoped CSS to show custom-class spans visually in editor */}
      {!isHtmlMode && enableCustomClasses && (
        <style>{`
          .custom-editor .ProseMirror span[class] {
            border-bottom: 2px dashed rgba(99, 102, 241, 0.5);
          }
        `}</style>
      )}

      {/* Visual Editor */}
      {!isHtmlMode && (
      <div
        className={`
          custom-editor relative rounded-lg border bg-white/5 focus-within:border-white/20 focus-within:bg-white/8
          transition-all duration-200
          ${error ? 'border-red-500/50' : 'border-white/10'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <EditorContent
          editor={editor}
          className="prose prose-invert max-w-none p-4 text-white outline-none"
          style={{
            fontSize: '14px',
            minHeight: '200px',
          }}
        />
        {editor.isEmpty && (
          <div className="pointer-events-none absolute left-4 top-4 text-sm text-zinc-500">{placeholder}</div>
        )}
      </div>
      )}

      {/* HTML Editor */}
      {isHtmlMode && (
      <textarea
        value={htmlContent}
        onChange={(e) => {
          const newHtml = e.target.value
          setHtmlContent(newHtml)
          onChange(newHtml)
          if (editor) {
            editor.commands.setContent(newHtml)
          }
        }}
        disabled={disabled}
        className={`
          w-full rounded-lg border bg-white/5 p-4 text-white outline-none font-mono text-sm
          focus:border-white/20 focus:bg-white/8 transition-all duration-200
          ${error ? 'border-red-500/50' : 'border-white/10'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          minHeight: '200px',
          resize: 'vertical',
        }}
        placeholder={placeholder}
      />
      )}

      {/* Character count and error */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>
          {characterCount} / {maxLength} characters
        </span>
        {error && <span className="text-red-400">{error}</span>}
      </div>

      {characterCount > maxLength && (
        <div className="text-xs text-red-400">Character limit exceeded by {characterCount - maxLength} characters</div>
      )}
    </div>
  )
}

/**
 * Toolbar button component
 */
function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        rounded p-2 transition-colors duration-200
        ${
          active
            ? 'bg-white/[0.1] text-white'
            : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        focus:outline-none focus:ring-2 focus:ring-white/[0.2]
      `}
    >
      {children}
    </button>
  )
}

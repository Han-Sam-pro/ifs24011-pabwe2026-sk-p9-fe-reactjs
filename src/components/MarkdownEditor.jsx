import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

export const TOOLBAR_ITEMS = [
  ['heading', 'bold', 'italic', 'strike'],
  ['hr', 'quote'],
  ['ul', 'ol', 'task', 'indent', 'outdent'],
  ['table', 'image', 'link'],
  ['code', 'codeblock'],
]

// Wrapper Toast UI Editor: mode Markdown dengan pratinjau simultan (vertical)
// dan dapat dialihkan ke WYSIWYG. Editor dibuat ulang saat tema berubah.
export default function MarkdownEditor({ value, onChange, dark = false, height = '100%', placeholder = 'Tulis artikel Anda di sini...' }) {
  const containerRef = useRef(null)
  const editorRef = useRef(null)
  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const editor = new Editor({
      el: containerRef.current,
      initialValue: valueRef.current,
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      height,
      placeholder,
      theme: dark ? 'dark' : 'light',
      usageStatistics: false,
      hideModeSwitch: false,
      toolbarItems: TOOLBAR_ITEMS,
      events: {
        change: () => {
          valueRef.current = editor.getMarkdown()
          onChangeRef.current(valueRef.current)
        },
      },
    })
    editorRef.current = editor
    // Elemen internal Toast UI tanpa nama aksesibel (pelanggaran axe "label"/"button-name").
    containerRef.current.querySelectorAll('.toastui-editor-pseudo-clipboard').forEach((el) => {
      el.setAttribute('aria-label', 'Clipboard editor Markdown')
      el.setAttribute('tabindex', '-1')
    })
    containerRef.current.querySelectorAll('.toastui-editor-toolbar-icons.more').forEach((el) => {
      el.setAttribute('aria-label', 'Alat lainnya')
    })
    return () => editor.destroy()
  }, [dark, height, placeholder])

  useEffect(() => {
    if (value !== valueRef.current) {
      valueRef.current = value
      editorRef.current.setMarkdown(value, false)
    }
  }, [value])

  return <div ref={containerRef} className="h-full" data-testid="markdown-editor" />
}

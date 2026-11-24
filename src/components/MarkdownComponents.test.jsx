import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const editors = []
const viewers = []

vi.mock('@toast-ui/editor', () => ({
  default: class FakeEditor {
    constructor(options) {
      this.options = options
      this.markdown = options.initialValue
      this.setMarkdown = vi.fn((md) => {
        this.markdown = md
      })
      this.destroy = vi.fn()
      const clip = document.createElement('textarea')
      clip.className = 'toastui-editor-pseudo-clipboard'
      options.el.appendChild(clip)
      const more = document.createElement('button')
      more.className = 'toastui-editor-toolbar-icons more'
      options.el.appendChild(more)
      editors.push(this)
    }
    getMarkdown() {
      return this.markdown
    }
  },
}))

vi.mock('@toast-ui/editor/viewer', () => ({
  default: class FakeViewer {
    constructor(options) {
      this.options = options
      this.destroy = vi.fn()
      viewers.push(this)
    }
  },
}))

const { default: MarkdownEditor, TOOLBAR_ITEMS } = await import('./MarkdownEditor')
const { default: MarkdownViewer } = await import('./MarkdownViewer')

describe('MarkdownEditor', () => {
  it('membuat editor dan meneruskan perubahan', () => {
    editors.length = 0
    const onChange = vi.fn()
    const { rerender, unmount } = render(<MarkdownEditor value="# Halo" onChange={onChange} />)
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    const editor = editors[0]
    expect(editor.options.initialValue).toBe('# Halo')
    expect(editor.options.theme).toBe('light')
    expect(editor.options.previewStyle).toBe('vertical')
    expect(editor.options.toolbarItems).toBe(TOOLBAR_ITEMS)
    expect(document.querySelector('.toastui-editor-pseudo-clipboard')).toHaveAttribute('aria-label', 'Clipboard editor Markdown')
    expect(document.querySelector('.toastui-editor-toolbar-icons.more')).toHaveAttribute('aria-label', 'Alat lainnya')

    editor.markdown = '# Halo dunia'
    editor.options.events.change()
    expect(onChange).toHaveBeenCalledWith('# Halo dunia')

    // nilai sama dengan editor -> tidak setMarkdown
    rerender(<MarkdownEditor value="# Halo dunia" onChange={onChange} />)
    expect(editor.setMarkdown).not.toHaveBeenCalled()

    // nilai dari luar (mis. AI generator) -> setMarkdown
    rerender(<MarkdownEditor value="Konten AI" onChange={onChange} />)
    expect(editor.setMarkdown).toHaveBeenCalledWith('Konten AI', false)

    // ganti tema -> editor dibuat ulang dengan nilai terakhir
    rerender(<MarkdownEditor value="Konten AI" onChange={onChange} dark />)
    expect(editor.destroy).toHaveBeenCalled()
    expect(editors[1].options.theme).toBe('dark')
    expect(editors[1].options.initialValue).toBe('Konten AI')
    unmount()
    expect(editors[1].destroy).toHaveBeenCalled()
  })
})

describe('MarkdownViewer', () => {
  it('merender konten dan membuat ulang saat konten berubah', () => {
    viewers.length = 0
    const { rerender, unmount } = render(<MarkdownViewer content="**tebal**" className="x" />)
    expect(screen.getByTestId('markdown-viewer')).toHaveClass('x')
    expect(viewers[0].options.initialValue).toBe('**tebal**')
    expect(viewers[0].options.theme).toBe('light')
    rerender(<MarkdownViewer content="baru" dark />)
    expect(viewers[0].destroy).toHaveBeenCalled()
    expect(viewers[1].options.theme).toBe('dark')
    unmount()
    expect(viewers[1].destroy).toHaveBeenCalled()
  })
})

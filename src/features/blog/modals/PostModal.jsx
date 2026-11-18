import { useState } from 'react'
import { IconDeviceFloppy, IconLoader2, IconX } from '@tabler/icons-react'
import MarkdownEditor from '../../../components/MarkdownEditor'
import { countWords, showError } from '../../../helpers/toolsHelper'

export const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/15 dark:border-slate-700 dark:bg-slate-950'

// Modal layar penuh penulisan artikel dengan Toast UI Editor.
export default function PostModal({ initial, onClose, onSave, isDark }) {
  const isEdit = Boolean(initial?.id)
  const [form, setForm] = useState({
    title: initial?.title || '',
    category: initial?.category || 'Umum',
    excerpt: initial?.excerpt || '',
    cover_image_path: initial?.cover_image_path || '',
    content: initial?.content || '',
    is_published: Boolean(initial?.is_published),
  })
  const [saving, setSaving] = useState(false)

  const setField = (name) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) {
      showError('Judul dan konten artikel wajib diisi.', 'Data Belum Lengkap')
      return
    }
    setSaving(true)
    try {
      await onSave(form)
    } catch (error) {
      setSaving(false)
      showError(error.message, 'Gagal Menyimpan')
    }
  }

  const words = countWords(form.content)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-labelledby="post-modal-title">
      <div className="flex h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <header className="flex items-center justify-between bg-brand px-6 py-4 text-white">
          <div>
            <h2 id="post-modal-title" className="text-lg font-bold">
              {isEdit ? 'Edit Artikel' : 'Tambah Artikel'}
            </h2>
            <p className="text-xs text-white/75">Tulis dengan Markdown — pratinjau tampil berdampingan.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-lg p-1.5 hover:bg-white/20">
            <IconX size={22} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6 lg:flex-row">
          <aside className="space-y-4 lg:w-80 lg:shrink-0">
            <div className="space-y-1.5">
              <label htmlFor="post-title" className="text-sm font-medium">Judul</label>
              <input id="post-title" className={inputClass} value={form.title} onChange={setField('title')} placeholder="Judul artikel yang menarik" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="post-category" className="text-sm font-medium">Kategori</label>
              <select id="post-category" className={inputClass} value={form.category} onChange={setField('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="post-excerpt" className="text-sm font-medium">Ringkasan (excerpt)</label>
              <textarea id="post-excerpt" rows={4} className={inputClass} value={form.excerpt} onChange={setField('excerpt')} placeholder="1-2 kalimat pemikat pembaca" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="post-cover" className="text-sm font-medium">URL Gambar Sampul</label>
              <input id="post-cover" className={inputClass} value={form.cover_image_path} onChange={setField('cover_image_path')} placeholder="https://..." />
            </div>
            <label htmlFor="post-published" className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <span>
                <span className="block text-sm font-medium">Terbitkan sekarang</span>
                <span className="text-xs text-slate-500">{form.is_published ? 'Tampil di halaman publik' : 'Disimpan sebagai draf'}</span>
              </span>
              <input id="post-published" type="checkbox" className="h-5 w-5 accent-[var(--accent)]" checked={form.is_published} onChange={setField('is_published')} />
            </label>
          </aside>
          <section className="flex min-h-[420px] flex-1 flex-col">
            <span className="mb-1.5 text-sm font-medium">Konten (Markdown)</span>
            <div className="min-h-0 flex-1">
              <MarkdownEditor value={form.content} onChange={(content) => setForm((f) => ({ ...f, content }))} dark={isDark} />
            </div>
          </section>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-100 px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400" data-testid="word-count">
            {words} kata · ±{Math.max(1, Math.ceil(words / 200))} menit baca
          </span>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-700">
              Batal
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
              {saving ? <IconLoader2 size={18} className="animate-spin" /> : <IconDeviceFloppy size={18} />}
              Simpan
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

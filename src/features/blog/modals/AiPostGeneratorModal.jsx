import { useState } from 'react'
import { IconAlertTriangle, IconExternalLink, IconLoader2, IconRefresh, IconSparkles, IconWand, IconWorldSearch, IconX } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { generateWithAi } from '../api/blogApi'
import { showError } from '../../../helpers/toolsHelper'
import { CATEGORIES } from './PostModal'

const TONES = ['Informatif', 'Santai', 'Formal', 'Persuasif', 'Inspiratif']

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/15 dark:border-slate-700 dark:bg-slate-950'

// Modal layar penuh AI Blog Generator dengan opsi penelusuran mesin pencari.
export default function AiPostGeneratorModal({ onClose, onApply, isDark }) {
  const [form, setForm] = useState({ topic: '', category: '', tone: 'Informatif', keywords: '', include_web_search: true, max_sources: 5 })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const setField = (name) => (event) => {
    const { type, checked, value } = event.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }))
  }

  async function handleGenerate() {
    if (form.topic.trim().length < 3) {
      showError('Topik minimal 3 karakter.', 'Topik Belum Diisi')
      return
    }
    setLoading(true)
    try {
      const data = await generateWithAi({ ...form, topic: form.topic.trim() })
      setResult(data)
    } catch (error) {
      showError(error.message, 'AI Gagal Membuat Artikel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">
      <div className="flex h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <header className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-brand px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <IconSparkles size={26} />
            <div>
              <h2 id="ai-modal-title" className="text-lg font-bold">AI Blog Generator</h2>
              <p className="text-xs text-white/75">Draf artikel lengkap berbasis fakta terkini dari mesin pencari.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-lg p-1.5 hover:bg-white/20">
            <IconX size={22} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6 lg:flex-row">
          <aside className="space-y-4 lg:w-96 lg:shrink-0">
            <div className="space-y-1.5">
              <label htmlFor="ai-topic" className="text-sm font-medium">Topik Artikel</label>
              <textarea id="ai-topic" rows={3} className={inputClass} value={form.topic} onChange={setField('topic')} placeholder="Contoh: Dampak AI generatif terhadap dunia pendidikan Indonesia" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="ai-category" className="text-sm font-medium">Kategori</label>
                <select id="ai-category" className={inputClass} value={form.category} onChange={setField('category')}>
                  <option value="">Otomatis</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ai-tone" className="text-sm font-medium">Gaya Bahasa</label>
                <select id="ai-tone" className={inputClass} value={form.tone} onChange={setField('tone')}>
                  {TONES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ai-keywords" className="text-sm font-medium">Kata Kunci (opsional)</label>
              <input id="ai-keywords" className={inputClass} value={form.keywords} onChange={setField('keywords')} placeholder="pisahkan dengan koma" />
            </div>
            <label htmlFor="ai-web-search" className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <span className="flex gap-2">
                <IconWorldSearch size={22} className="mt-0.5 text-brand" />
                <span>
                  <span className="block text-sm font-medium">Penelusuran Mesin Pencari</span>
                  <span className="text-xs text-slate-500">Sertakan fakta & referensi web terkini</span>
                </span>
              </span>
              <input id="ai-web-search" type="checkbox" className="mt-1 h-5 w-5 accent-[var(--accent)]" checked={form.include_web_search} onChange={setField('include_web_search')} />
            </label>
            {form.include_web_search && (
              <div className="space-y-1.5">
                <label htmlFor="ai-max-sources" className="text-sm font-medium">Jumlah Sumber</label>
                <input id="ai-max-sources" type="number" min={1} max={10} className={inputClass} value={form.max_sources} onChange={setField('max_sources')} />
              </div>
            )}
            <button type="button" onClick={handleGenerate} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
              {loading ? <IconLoader2 size={18} className="animate-spin" /> : result ? <IconRefresh size={18} /> : <IconWand size={18} />}
              {loading ? 'Sedang menulis...' : result ? 'Generate Ulang' : 'Generate Artikel'}
            </button>
          </aside>

          <section className="min-h-[300px] flex-1 rounded-2xl border border-slate-200 p-5 dark:border-slate-700" aria-live="polite">
            {loading ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500" data-testid="ai-loading">
                <IconLoader2 size={36} className="animate-spin text-brand" />
                <p className="text-sm">Menelusuri mesin pencari dan menyusun artikel...</p>
              </div>
            ) : result ? (
              <div className="space-y-5">
                {result.search_warning && (
                  <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                    <IconAlertTriangle size={18} className="shrink-0" /> {result.search_warning}
                  </div>
                )}
                <div className="space-y-2">
                  <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">{result.category}</span>
                  <h3 className="font-serif text-3xl font-bold">{result.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{result.excerpt}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <MarkdownViewer content={result.content} dark={isDark} />
                </div>
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold">
                    <IconWorldSearch size={18} /> Sumber Rujukan Mesin Pencari ({result.sources.length})
                  </h4>
                  {result.sources.length === 0 ? (
                    <p className="text-sm text-slate-500">Tidak ada sumber web yang digunakan.</p>
                  ) : (
                    <ol className="space-y-2">
                      {result.sources.map((s, i) => (
                        <li key={s.url} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                          <a href={s.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-semibold text-brand hover:underline">
                            [{i + 1}] {s.title || s.url} <IconExternalLink size={14} />
                          </a>
                          <p className="mt-1 line-clamp-2 text-slate-500">{s.snippet}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-500">
                <IconSparkles size={40} className="text-brand" />
                <p className="font-semibold">Pratinjau artikel AI akan tampil di sini</p>
                <p className="text-sm">Isi topik lalu klik “Generate Artikel”.</p>
              </div>
            )}
          </section>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-100 px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-700">
            Batal
          </button>
          <button
            type="button"
            disabled={!result || loading}
            onClick={() => onApply({ title: result.title, category: result.category, excerpt: result.excerpt, content: result.content, is_published: false })}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconWand size={18} /> Terapkan ke Editor
          </button>
        </footer>
      </div>
    </div>
  )
}

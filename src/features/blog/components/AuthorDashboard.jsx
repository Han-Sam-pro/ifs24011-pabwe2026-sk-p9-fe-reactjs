import { useCallback, useEffect, useState } from 'react'
import { IconDotsVertical, IconEdit, IconExternalLink, IconPlus, IconSearch, IconSparkles, IconTrash } from '@tabler/icons-react'
import PostStats from './PostStats'
import PostModal from '../modals/PostModal'
import AiPostGeneratorModal from '../modals/AiPostGeneratorModal'
import useInput from '../../../hooks/useInput'
import { createPost, deletePost, getMyPosts, getStats, togglePublish, updatePost } from '../api/blogApi'
import { categoryClass, confirmAction, formatDate, readingTimeLabel, showError, showSuccess } from '../../../helpers/toolsHelper'

// Ruang kerja penulis (full width): statistik, tabel artikel, editor & AI.
export default function AuthorDashboard({ user, onNavigate, isDark }) {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [keyword, onKeywordChange] = useInput('')
  const [menuId, setMenuId] = useState(null)
  const [editing, setEditing] = useState(null) // null = tertutup, {} = baru, {id..} = edit
  const [showAi, setShowAi] = useState(false)

  const load = useCallback(async () => {
    try {
      const [list, summary] = await Promise.all([getMyPosts(), getStats()])
      setPosts(list)
      setStats(summary)
    } catch (error) {
      showError(error.message, 'Gagal Memuat Artikel')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleSave(form) {
    if (editing.id) {
      await updatePost(editing.id, form)
      showSuccess('Artikel diperbarui')
    } else {
      await createPost(form)
      showSuccess('Artikel dibuat')
    }
    setEditing(null)
    await load()
  }

  async function handleToggle(post) {
    try {
      const updated = await togglePublish(post.id)
      setPosts((list) => list.map((p) => (p.id === post.id ? updated : p)))
      setStats((s) => ({ ...s, published: s.published + (updated.is_published ? 1 : -1), draft: s.draft + (updated.is_published ? -1 : 1) }))
    } catch (error) {
      showError(error.message)
    }
  }

  async function handleDelete(post) {
    setMenuId(null)
    if (!(await confirmAction('Hapus artikel?', `"${post.title}" akan dihapus permanen.`, 'Ya, hapus'))) return
    try {
      await deletePost(post.id)
      showSuccess('Artikel dihapus')
      await load()
    } catch (error) {
      showError(error.message)
    }
  }

  function handleApplyAi(draft) {
    setShowAi(false)
    setEditing(draft)
  }

  const kw = keyword.trim().toLowerCase()
  const visible = posts.filter((p) => !kw || p.title.toLowerCase().includes(kw) || p.category.toLowerCase().includes(kw))

  return (
    <div className="w-full space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">Workspace Penulis</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Halo, {user.name} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400">Kelola seluruh artikel Anda di satu tempat.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setShowAi(true)} className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand/15">
            <IconSparkles size={18} /> AI Generator
          </button>
          <button type="button" onClick={() => setEditing({})} className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 hover:brightness-110">
            <IconPlus size={18} /> Tambah Artikel
          </button>
        </div>
      </div>

      <PostStats stats={stats} />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <h2 className="text-lg font-bold">Artikel Saya</h2>
          <label className="relative block w-full sm:w-80">
            <span className="sr-only">Cari artikel saya</span>
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="search" value={keyword} onChange={onKeywordChange} placeholder="Cari judul atau kategori..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-950" />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Waktu Baca</th>
                <th className="px-4 py-3">Diperbarui</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Memuat artikel...</td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    {posts.length === 0 ? 'Belum ada artikel. Mulai tulis artikel pertama Anda!' : 'Tidak ada artikel yang cocok.'}
                  </td>
                </tr>
              ) : (
                visible.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{post.title}</p>
                      <p className="text-xs text-slate-400">/{post.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryClass(post.category)}`}>{post.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input type="checkbox" role="switch" className="peer sr-only" checked={post.is_published} onChange={() => handleToggle(post)} aria-label={`Status publikasi ${post.title}`} />
                        <span className="relative h-6 w-11 rounded-full bg-slate-300 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:bg-emerald-500 peer-checked:after:translate-x-5 dark:bg-slate-600" />
                        <span className={`text-xs font-semibold ${post.is_published ? 'text-emerald-600' : 'text-amber-600'}`}>{post.is_published ? 'Terbit' : 'Draf'}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{readingTimeLabel(post.reading_time)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(post.updated_at)}</td>
                    <td className="relative px-4 py-3 text-right">
                      <button type="button" onClick={() => setMenuId(menuId === post.id ? null : post.id)} aria-label={`Menu ${post.title}`} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <IconDotsVertical size={18} />
                      </button>
                      {menuId === post.id && (
                        <>
                          <div className="fixed inset-0 z-10" data-testid="menu-backdrop" onClick={() => setMenuId(null)} />
                          <div role="menu" className="absolute right-4 top-11 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl dark:border-slate-700 dark:bg-slate-900">
                            {post.is_published && (
                              <button type="button" role="menuitem" onClick={() => onNavigate(`/posts/${post.slug}`)} className="flex w-full items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <IconExternalLink size={16} /> Lihat
                              </button>
                            )}
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setMenuId(null)
                                setEditing(post)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <IconEdit size={16} /> Edit
                            </button>
                            <button type="button" role="menuitem" onClick={() => handleDelete(post)} className="flex w-full items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                              <IconTrash size={16} /> Hapus
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <PostModal initial={editing} onClose={() => setEditing(null)} onSave={handleSave} isDark={isDark} />}
      {showAi && <AiPostGeneratorModal onClose={() => setShowAi(false)} onApply={handleApplyAi} isDark={isDark} />}
    </div>
  )
}

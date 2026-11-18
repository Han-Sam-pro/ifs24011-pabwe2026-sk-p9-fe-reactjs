import { useEffect, useState } from 'react'
import { IconArrowLeft, IconCircleCheck, IconFileText, IconSearch, IconUsers } from '@tabler/icons-react'
import useInput from '../../../hooks/useInput'
import { getAllPosts, getUserPosts, getUsers } from '../api/adminApi'
import { categoryClass, formatDate, showError } from '../../../helpers/toolsHelper'

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}>
        <Icon size={24} />
      </span>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-3xl font-extrabold tracking-tight">{value}</p>
      </div>
    </div>
  )
}

function StatusBadge({ published }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'}`}>
      {published ? 'Terbit' : 'Draf'}
    </span>
  )
}

export function PostsTable({ posts, onNavigate, showAuthor = true }) {
  if (posts.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-slate-500">Belum ada artikel.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">Judul</th>
            {showAuthor && <th className="px-4 py-3">Penulis</th>}
            <th className="px-4 py-3">Kategori</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Dibuat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {posts.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 font-semibold">
                {p.is_published ? (
                  <button type="button" onClick={() => onNavigate(`/posts/${p.slug}`)} className="text-left hover:text-brand hover:underline">
                    {p.title}
                  </button>
                ) : (
                  p.title
                )}
              </td>
              {showAuthor && <td className="px-4 py-3">{p.author?.name || '-'}</td>}
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryClass(p.category)}`}>{p.category}</span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge published={p.is_published} />
              </td>
              <td className="px-4 py-3 text-slate-500">{formatDate(p.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Panel administrasi (full width): monitoring pengguna & seluruh artikel.
export default function AdminDashboard({ onNavigate }) {
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('users')
  const [keyword, onKeywordChange] = useInput('')
  const [selected, setSelected] = useState(null) // { user, posts }

  useEffect(() => {
    Promise.all([getUsers(), getAllPosts()])
      .then(([u, p]) => {
        setUsers(u)
        setPosts(p)
      })
      .catch((error) => showError(error.message, 'Gagal Memuat Data Admin'))
      .finally(() => setLoading(false))
  }, [])

  async function openUser(user) {
    try {
      const list = await getUserPosts(user.id)
      setSelected({ user, posts: list })
    } catch (error) {
      showError(error.message)
    }
  }

  const kw = keyword.trim().toLowerCase()
  const filteredUsers = users.filter((u) => !kw || `${u.name} ${u.username} ${u.email}`.toLowerCase().includes(kw))
  const filteredPosts = posts.filter((p) => !kw || `${p.title} ${p.category} ${p.author?.name}`.toLowerCase().includes(kw))
  const totalPublished = posts.filter((p) => p.is_published).length

  const tabClass = (name) =>
    `rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === name ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`

  return (
    <div className="w-full space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      <div>
        <p className="text-sm font-medium text-brand">Admin Panel</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Monitoring Sistem</h1>
        <p className="text-slate-500 dark:text-slate-400">Pantau seluruh pengguna dan arsip artikel Delcom Blog.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={IconUsers} label="Total Pengguna" value={users.length} tone="bg-brand/10 text-brand" />
        <SummaryCard icon={IconFileText} label="Total Artikel" value={posts.length} tone="bg-sky-500/10 text-sky-600" />
        <SummaryCard icon={IconCircleCheck} label="Artikel Terbit" value={totalPublished} tone="bg-emerald-500/10 text-emerald-600" />
      </div>

      {selected ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
            <button type="button" onClick={() => setSelected(null)} aria-label="Kembali ke daftar pengguna" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
              <IconArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-bold">
              Artikel milik {selected.user.name} <span className="text-sm font-normal text-slate-500">@{selected.user.username}</span>
            </h2>
          </div>
          <PostsTable posts={selected.posts} onNavigate={onNavigate} showAuthor={false} />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <div className="flex gap-2" role="tablist">
              <button type="button" role="tab" aria-selected={tab === 'users'} className={tabClass('users')} onClick={() => setTab('users')}>
                Pengguna
              </button>
              <button type="button" role="tab" aria-selected={tab === 'posts'} className={tabClass('posts')} onClick={() => setTab('posts')}>
                Semua Artikel
              </button>
            </div>
            <label className="relative block w-full sm:w-80">
              <span className="sr-only">Cari</span>
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="search" value={keyword} onChange={onKeywordChange} placeholder="Cari..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-950" />
            </label>
          </div>

          {loading ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">Memuat data...</p>
          ) : tab === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Total Artikel</th>
                    <th className="px-4 py-3">Terbit</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 text-slate-500">#{u.id}</td>
                      <td className="px-4 py-3 font-semibold">{u.name}</td>
                      <td className="px-4 py-3">@{u.username}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.role === 'admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300'}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">{u.total_posts}</td>
                      <td className="px-4 py-3">{u.published_posts}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => openUser(u)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:border-brand hover:text-brand dark:border-slate-700">
                          Lihat Artikel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <PostsTable posts={filteredPosts} onNavigate={onNavigate} />
          )}
        </div>
      )}
    </div>
  )
}

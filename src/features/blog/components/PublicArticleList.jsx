import { useEffect, useState } from 'react'
import { IconClock, IconPencilPlus, IconSearch, IconSparkles, IconUser } from '@tabler/icons-react'
import useInput from '../../../hooks/useInput'
import { getCategories, getPublicPosts } from '../api/blogApi'
import { categoryClass, formatDate, readingTimeLabel } from '../../../helpers/toolsHelper'

export const SEARCH_DEBOUNCE_MS = 300

export function ArticleCard({ post, onOpen }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <button type="button" onClick={() => onOpen(post.slug)} className="block text-left" aria-label={`Baca ${post.title}`}>
        {post.cover_image_path ? (
          <img src={post.cover_image_path} alt={post.title} className="aspect-[16/9] w-full object-cover" loading="lazy" />
        ) : (
          <div className="grid aspect-[16/9] w-full place-items-center bg-gradient-to-br from-brand/80 to-brand/30 font-serif text-5xl font-bold text-white/90">
            {post.title.charAt(0)}
          </div>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between text-xs">
          <span className={`rounded-full px-2.5 py-1 font-semibold ${categoryClass(post.category)}`}>{post.category}</span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <IconClock size={14} /> {readingTimeLabel(post.reading_time)}
          </span>
        </div>
        <h3 className="font-serif text-xl font-bold leading-snug">
          <button type="button" onClick={() => onOpen(post.slug)} className="text-left group-hover:text-brand">
            {post.title}
          </button>
        </h3>
        <p className="line-clamp-3 flex-1 text-sm text-slate-600 dark:text-slate-400">{post.excerpt || 'Tidak ada ringkasan.'}</p>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <IconUser size={14} /> {post.author?.name || 'Anonim'}
          </span>
          <span>{formatDate(post.published_at)}</span>
        </div>
      </div>
    </article>
  )
}

// Beranda galeri artikel publik dengan live search dan filter pill kategori.
export default function PublicArticleList({ user, onNavigate, onLoginClick }) {
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('Semua')
  const [keyword, onKeywordChange] = useInput('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    let active = true
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await getPublicPosts({ q: keyword, category })
        if (active) {
          setPosts(data)
          setError('')
        }
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [keyword, category])

  const openPost = (slug) => onNavigate(`/posts/${slug}`)

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-16 sm:px-6">
      <section className="relative my-8 overflow-hidden rounded-3xl bg-brand px-6 py-14 text-white sm:px-12">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-black/10" />
        <div className="relative max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <IconSparkles size={14} /> Didukung AI + Mesin Pencari
          </span>
          <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">Wawasan segar dari para penulis Delcom.</h1>
          <p className="text-white/80">Baca artikel teknologi, pendidikan, bisnis, hingga gaya hidup — atau mulai tulis gagasanmu sendiri.</p>
          <button
            type="button"
            onClick={() => (user ? onNavigate('/author') : onLoginClick())}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand shadow-lg hover:bg-slate-50"
          >
            <IconPencilPlus size={18} /> Mulai Menulis
          </button>
        </div>
      </section>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter kategori">
          {['Semua', ...categories].map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                category === c
                  ? 'bg-brand text-white shadow-md shadow-brand/30'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:w-96">
          <span className="sr-only">Cari artikel</span>
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={keyword}
            onChange={onKeywordChange}
            placeholder="Cari artikel..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/15 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{error}</div>}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="loading">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-20 text-center text-slate-500 dark:border-slate-700">
          <p className="text-lg font-semibold">Belum ada artikel</p>
          <p className="text-sm">Coba kata kunci atau kategori lain.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <ArticleCard key={post.id} post={post} onOpen={openPost} />
          ))}
        </div>
      )}
    </div>
  )
}

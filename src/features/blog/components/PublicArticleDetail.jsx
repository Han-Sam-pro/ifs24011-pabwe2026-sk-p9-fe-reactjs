import { useEffect, useState } from 'react'
import { IconArrowLeft, IconCalendar, IconClock, IconUser } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { getPublicPost } from '../api/blogApi'
import { categoryClass, formatDate, readingTimeLabel } from '../../../helpers/toolsHelper'

// Halaman baca artikel publik (full width).
export default function PublicArticleDetail({ slug, onNavigate, isDark }) {
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setPost(null)
    setError('')
    getPublicPost(slug)
      .then((data) => active && setPost(data))
      .catch((err) => active && setError(err.message))
    return () => {
      active = false
    }
  }, [slug])

  const back = (
    <button type="button" onClick={() => onNavigate('/')} className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand">
      <IconArrowLeft size={16} /> Kembali ke beranda
    </button>
  )

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-4 px-4 py-16 text-center sm:px-6">
        <h1 className="text-3xl font-extrabold">Artikel tidak ditemukan</h1>
        <p className="text-slate-500">{error}</p>
        {back}
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-4 px-4 py-10 sm:px-6" data-testid="loading">
        <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    )
  }

  return (
    <article className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6">
      {back}
      <header className="mt-6 space-y-5">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${categoryClass(post.category)}`}>{post.category}</span>
        <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="text-lg text-slate-600 dark:text-slate-400">{post.excerpt}</p>}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <IconUser size={16} /> {post.author?.name || 'Anonim'}
          </span>
          <span className="flex items-center gap-1.5">
            <IconCalendar size={16} /> {formatDate(post.published_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <IconClock size={16} /> {readingTimeLabel(post.reading_time)}
          </span>
        </div>
      </header>
      {post.cover_image_path && <img src={post.cover_image_path} alt={post.title} className="mt-8 max-h-[520px] w-full rounded-3xl object-cover" />}
      <div className="article-body mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 dark:border-slate-800 dark:bg-slate-900">
        <MarkdownViewer content={post.content} dark={isDark} />
      </div>
    </article>
  )
}

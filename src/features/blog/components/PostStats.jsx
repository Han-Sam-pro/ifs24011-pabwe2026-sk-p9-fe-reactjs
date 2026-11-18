import { IconCircleCheck, IconFileText, IconPencil } from '@tabler/icons-react'

const CARDS = [
  { key: 'total', label: 'Total Artikel', icon: IconFileText, tone: 'bg-brand/10 text-brand' },
  { key: 'published', label: 'Total Terbit', icon: IconCircleCheck, tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { key: 'draft', label: 'Belum Selesai (Draf)', icon: IconPencil, tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
]

// 3 kartu statistik artikel penulis.
export default function PostStats({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CARDS.map(({ key, label, icon: Icon, tone }) => (
        <div key={key} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" data-testid={`stat-${key}`}>
          <span className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}>
            <Icon size={24} />
          </span>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-3xl font-extrabold tracking-tight">{stats?.[key] ?? 0}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

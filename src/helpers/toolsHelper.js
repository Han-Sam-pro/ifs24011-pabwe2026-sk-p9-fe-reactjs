import Swal from 'sweetalert2'

export function showSuccess(title, text = '') {
  return Swal.fire({ icon: 'success', title, text, timer: 1600, showConfirmButton: false })
}

export function showError(text, title = 'Terjadi Kesalahan') {
  return Swal.fire({ icon: 'error', title, text, confirmButtonColor: '#4f46e5' })
}

export async function confirmAction(title, text, confirmButtonText = 'Ya, lanjutkan') {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Batal',
    confirmButtonColor: '#e11d48',
    reverseButtons: true,
  })
  return result.isConfirmed
}

export function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function readingTimeLabel(minutes) {
  return `${minutes || 1} menit baca`
}

export function countWords(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length
}

const CATEGORY_COLORS = {
  Teknologi: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  Pendidikan: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  'Gaya Hidup': 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
  Bisnis: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  Opini: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
}

export function categoryClass(category) {
  return CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300'
}

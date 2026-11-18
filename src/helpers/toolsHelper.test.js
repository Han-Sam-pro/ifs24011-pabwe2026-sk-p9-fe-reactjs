import { describe, it, expect } from 'vitest'
import Swal from 'sweetalert2'
import { categoryClass, confirmAction, countWords, formatDate, readingTimeLabel, showError, showSuccess } from './toolsHelper'

describe('toolsHelper', () => {
  it('showSuccess & showError memanggil SweetAlert2', () => {
    showSuccess('Berhasil')
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: 'success', title: 'Berhasil', text: '' }))
    showSuccess('Ok', 'detail')
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'detail' }))
    showError('gagal')
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: 'error', title: 'Terjadi Kesalahan', text: 'gagal' }))
    showError('gagal', 'Judul')
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Judul' }))
  })

  it('confirmAction mengembalikan isConfirmed', async () => {
    expect(await confirmAction('Hapus?', 'yakin')).toBe(true)
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ confirmButtonText: 'Ya, lanjutkan', showCancelButton: true }))
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    expect(await confirmAction('Hapus?', 'yakin', 'Hapus')).toBe(false)
  })

  it('formatDate', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate('bukan tanggal')).toBe('-')
    expect(formatDate('2026-01-15T10:00:00Z')).toContain('2026')
  })

  it('readingTimeLabel & countWords', () => {
    expect(readingTimeLabel(5)).toBe('5 menit baca')
    expect(readingTimeLabel(0)).toBe('1 menit baca')
    expect(countWords(null)).toBe(0)
    expect(countWords('   ')).toBe(0)
    expect(countWords(' satu dua\n tiga ')).toBe(3)
  })

  it('categoryClass', () => {
    expect(categoryClass('Teknologi')).toContain('sky')
    expect(categoryClass('Umum')).toContain('slate')
  })
})

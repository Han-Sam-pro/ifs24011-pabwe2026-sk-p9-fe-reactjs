import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Swal from 'sweetalert2'
import AiPostGeneratorModal from './AiPostGeneratorModal'
import { generateWithAi } from '../api/blogApi'

vi.mock('../api/blogApi', () => ({ generateWithAi: vi.fn() }))
vi.mock('../../../components/MarkdownViewer', () => ({ default: ({ content }) => <div data-testid="viewer">{content}</div> }))

const result = {
  title: 'Tren AI 2026',
  category: 'Teknologi',
  excerpt: 'Ringkasan AI',
  content: '## Isi\n\nFakta [1]',
  sources: [
    { title: 'Sumber A', url: 'https://a.example', snippet: 'cuplikan a' },
    { title: '', url: 'https://b.example', snippet: '' },
  ],
  web_search_used: true,
  search_warning: '',
}

describe('AiPostGeneratorModal', () => {
  it('validasi topik', async () => {
    const user = userEvent.setup()
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={vi.fn()} />)
    await user.click(screen.getByText('Generate Artikel'))
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Topik Belum Diisi' }))
    expect(generateWithAi).not.toHaveBeenCalled()
    expect(screen.getByText('Terapkan ke Editor').closest('button')).toBeDisabled()
  })

  it('menghasilkan artikel dengan sumber web lalu menerapkan ke editor', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    let resolve
    generateWithAi.mockReturnValue(new Promise((r) => (resolve = r)))
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={onApply} isDark />)

    await user.type(screen.getByLabelText('Topik Artikel'), '  Tren AI  ')
    await user.selectOptions(screen.getByLabelText('Kategori'), 'Teknologi')
    await user.selectOptions(screen.getByLabelText('Gaya Bahasa'), 'Santai')
    await user.type(screen.getByLabelText('Kata Kunci (opsional)'), 'llm')
    await user.clear(screen.getByLabelText('Jumlah Sumber'))
    await user.type(screen.getByLabelText('Jumlah Sumber'), '3')
    await user.click(screen.getByText('Generate Artikel'))

    expect(screen.getByTestId('ai-loading')).toBeInTheDocument()
    expect(screen.getByText('Sedang menulis...')).toBeInTheDocument()
    resolve(result)

    expect(await screen.findByText('Tren AI 2026')).toBeInTheDocument()
    expect(generateWithAi).toHaveBeenCalledWith({ topic: 'Tren AI', category: 'Teknologi', tone: 'Santai', keywords: 'llm', include_web_search: true, max_sources: 3 })
    expect(screen.getByText(/Sumber Rujukan Mesin Pencari \(2\)/)).toBeInTheDocument()
    expect(screen.getByText(/Sumber A/).closest('a')).toHaveAttribute('href', 'https://a.example')
    expect(screen.getByText(/\[2\] https:\/\/b.example/)).toBeInTheDocument()
    expect(screen.getByText('Generate Ulang')).toBeInTheDocument()

    await user.click(screen.getByText('Terapkan ke Editor'))
    expect(onApply).toHaveBeenCalledWith({ title: 'Tren AI 2026', category: 'Teknologi', excerpt: 'Ringkasan AI', content: '## Isi\n\nFakta [1]', is_published: false })
  })

  it('tanpa web search: menampilkan peringatan & tanpa sumber', async () => {
    const user = userEvent.setup()
    generateWithAi.mockResolvedValue({ ...result, sources: [], search_warning: 'Penelusuran gagal' })
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={vi.fn()} />)
    await user.click(screen.getByLabelText(/Penelusuran Mesin Pencari/))
    expect(screen.queryByLabelText('Jumlah Sumber')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('Topik Artikel'), 'Topik apa saja')
    await user.click(screen.getByText('Generate Artikel'))
    expect(await screen.findByText('Penelusuran gagal')).toBeInTheDocument()
    expect(screen.getByText('Tidak ada sumber web yang digunakan.')).toBeInTheDocument()
    expect(generateWithAi).toHaveBeenCalledWith(expect.objectContaining({ include_web_search: false }))
  })

  it('menampilkan error AI dan dapat ditutup', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    generateWithAi.mockRejectedValue(new Error('layanan AI tidak dapat dihubungi'))
    render(<AiPostGeneratorModal onClose={onClose} onApply={vi.fn()} />)
    await user.type(screen.getByLabelText('Topik Artikel'), 'Topik')
    await user.click(screen.getByText('Generate Artikel'))
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'layanan AI tidak dapat dihubungi' })))
    expect(screen.getByText('Generate Artikel')).toBeInTheDocument()
    await user.click(screen.getByText('Batal'))
    await user.click(screen.getByLabelText('Tutup'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})

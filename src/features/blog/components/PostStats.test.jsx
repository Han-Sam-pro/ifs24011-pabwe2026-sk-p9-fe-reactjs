import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostStats from './PostStats'

describe('PostStats', () => {
  it('menampilkan 3 kartu statistik', () => {
    render(<PostStats stats={{ total: 10, published: 7, draft: 3 }} />)
    expect(screen.getByTestId('stat-total')).toHaveTextContent('10')
    expect(screen.getByTestId('stat-published')).toHaveTextContent('7')
    expect(screen.getByTestId('stat-draft')).toHaveTextContent('3')
  })

  it('menampilkan 0 saat stats belum tersedia', () => {
    render(<PostStats stats={null} />)
    expect(screen.getByTestId('stat-total')).toHaveTextContent('0')
  })
})

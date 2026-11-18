import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useTheme, { ACCENT_KEY, ACCENTS, THEME_KEY } from './useTheme'

describe('useTheme', () => {
  it('default terang & indigo, dapat di-toggle', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    expect(result.current.accent).toBe('indigo')
    act(() => result.current.toggleTheme())
    expect(result.current.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')
  })

  it('membaca preferensi tersimpan dan mengganti aksen', () => {
    localStorage.setItem(THEME_KEY, 'dark')
    localStorage.setItem(ACCENT_KEY, 'sky')
    const { result } = renderHook(() => useTheme())
    expect(result.current.isDark).toBe(true)
    expect(result.current.accent).toBe('sky')
    act(() => result.current.cycleAccent()) // sky -> indigo (berputar)
    expect(result.current.accent).toBe('indigo')
    expect(document.documentElement.style.getPropertyValue('--accent')).toBe(ACCENTS.indigo)
    act(() => result.current.setAccent('rose'))
    expect(result.current.accent).toBe('rose')
    act(() => result.current.setAccent('tidak-ada'))
    expect(result.current.accent).toBe('rose')
  })

  it('aksen tersimpan yang tidak valid diabaikan', () => {
    localStorage.setItem(ACCENT_KEY, 'ungu-aneh')
    const { result } = renderHook(() => useTheme())
    expect(result.current.accent).toBe('indigo')
  })
})

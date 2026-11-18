import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useInput from './useInput'

describe('useInput', () => {
  it('menerima event maupun nilai langsung', () => {
    const { result } = renderHook(() => useInput('awal'))
    expect(result.current[0]).toBe('awal')
    act(() => result.current[1]({ target: { value: 'dari event' } }))
    expect(result.current[0]).toBe('dari event')
    act(() => result.current[1]('langsung'))
    expect(result.current[0]).toBe('langsung')
    act(() => result.current[2]('reset'))
    expect(result.current[0]).toBe('reset')
  })

  it('nilai awal default string kosong', () => {
    const { result } = renderHook(() => useInput())
    expect(result.current[0]).toBe('')
  })
})

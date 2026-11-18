import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// SweetAlert2 dimock global: setiap dialog langsung "dikonfirmasi".
vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn(() => Promise.resolve({ isConfirmed: true })) },
}))

// ---- Polyfill JSDOM untuk Toast UI Editor / ProseMirror ----
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
window.HTMLCanvasElement.prototype.getContext = () => null
if (!document.createRange().getClientRects) {
  Range.prototype.getClientRects = () => []
  Range.prototype.getBoundingClientRect = () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 })
}
if (!window.getSelection) {
  window.getSelection = () => ({ removeAllRanges: () => {}, addRange: () => {}, rangeCount: 0 })
}
window.scrollTo = () => {}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.clearAllMocks()
})

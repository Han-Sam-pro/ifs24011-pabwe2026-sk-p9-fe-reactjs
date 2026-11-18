import { useEffect, useRef } from 'react'
import Viewer from '@toast-ui/editor/viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'

// Wrapper Toast UI Viewer untuk merender konten Markdown artikel.
export default function MarkdownViewer({ content, dark = false, className = '' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const viewer = new Viewer({
      el: containerRef.current,
      initialValue: content,
      theme: dark ? 'dark' : 'light',
      usageStatistics: false,
    })
    return () => viewer.destroy()
  }, [content, dark])

  return <div ref={containerRef} className={className} data-testid="markdown-viewer" />
}

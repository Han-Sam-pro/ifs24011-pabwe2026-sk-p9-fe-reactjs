import { useCallback, useEffect, useState } from 'react'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail'
import AuthorDashboard from './features/blog/components/AuthorDashboard'
import AdminDashboard from './features/admin/components/AdminDashboard'
import AuthPage from './features/auth/components/AuthPage'
import AuthModal from './features/auth/modals/AuthModal'
import { logout } from './features/auth/api/authApi'
import { AUTH_EXPIRED_EVENT, clearSession, getUser, setSession } from './helpers/apiHelper'
import { confirmAction } from './helpers/toolsHelper'
import useTheme from './hooks/useTheme'

// Mengubah pathname peramban menjadi rute SPA.
export function parseRoute(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/' || path === '/public') return { name: 'public', path: '/' }
  const detail = path.match(/^\/posts\/([^/]+)$/)
  if (detail) return { name: 'detail', path, slug: decodeURIComponent(detail[1]) }
  if (['/author', '/admin', '/login', '/register'].includes(path)) return { name: path.slice(1), path }
  return { name: 'notfound', path }
}

// Menentukan redirect berdasarkan hak akses rute.
export function resolveRedirect(route, user) {
  if ((route.name === 'author' || route.name === 'admin') && !user) return '/login'
  if (route.name === 'admin' && user.role !== 'admin') return '/author'
  if ((route.name === 'login' || route.name === 'register') && user) return user.role === 'admin' ? '/admin' : '/author'
  return null
}

export default function App() {
  const [pathname, setPathname] = useState(window.location.pathname)
  const [user, setUser] = useState(getUser)
  const [showLogin, setShowLogin] = useState(false)
  const { isDark, toggleTheme, cycleAccent } = useTheme()

  const navigate = useCallback((to, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', to)
    setPathname(to)
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    const onExpired = () => setUser(null)
    window.addEventListener('popstate', onPopState)
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)
    return () => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
    }
  }, [])

  const route = parseRoute(pathname)
  const redirect = resolveRedirect(route, user)

  useEffect(() => {
    if (redirect) navigate(redirect, true)
  }, [redirect, navigate])

  function handleLogin({ token, user: loggedIn }) {
    setSession(token, loggedIn)
    setUser(loggedIn)
    setShowLogin(false)
    navigate(loggedIn.role === 'admin' ? '/admin' : '/author')
  }

  async function handleLogout() {
    if (!(await confirmAction('Keluar dari akun?', 'Sesi Anda akan diakhiri.', 'Ya, keluar'))) return
    await logout().catch(() => null)
    clearSession()
    setUser(null)
    navigate('/')
  }

  if (redirect) return null

  if (route.name === 'login' || route.name === 'register') {
    return <AuthPage mode={route.name} onLogin={handleLogin} onNavigate={navigate} />
  }

  let page
  switch (route.name) {
    case 'public':
      page = <PublicArticleList user={user} onNavigate={navigate} onLoginClick={() => setShowLogin(true)} />
      break
    case 'detail':
      page = <PublicArticleDetail slug={route.slug} onNavigate={navigate} isDark={isDark} />
      break
    case 'author':
      page = <AuthorDashboard user={user} onNavigate={navigate} isDark={isDark} />
      break
    case 'admin':
      page = <AdminDashboard onNavigate={navigate} />
      break
    default:
      page = (
        <div className="mx-auto max-w-xl space-y-4 px-4 py-24 text-center">
          <p className="text-7xl font-extrabold text-brand">404</p>
          <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
          <button type="button" onClick={() => navigate('/')} className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white">
            Kembali ke Beranda
          </button>
        </div>
      )
  }

  return (
    <div className="min-h-screen">
      <StickyNavbar
        user={user}
        currentPath={route.path}
        onNavigate={navigate}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onCycleAccent={cycleAccent}
      />
      <main>{page}</main>
      {showLogin && <AuthModal onClose={() => setShowLogin(false)} onLogin={handleLogin} onNavigate={navigate} />}
    </div>
  )
}

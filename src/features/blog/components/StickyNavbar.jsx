import { IconLayoutDashboard, IconLogin2, IconLogout, IconMoon, IconNotebook, IconPalette, IconShieldLock, IconSun, IconUserPlus } from '@tabler/icons-react'

function NavLink({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? 'bg-brand/10 text-brand' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      {Icon && <Icon size={18} />}
      <span className="hidden sm:inline">{children}</span>
    </button>
  )
}

// Navbar atas sticky (tanpa sidebar) untuk seluruh halaman.
export default function StickyNavbar({ user, currentPath, onNavigate, onLoginClick, onLogout, isDark, onToggleTheme, onCycleAccent }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-2 px-4 sm:px-6">
        <button type="button" onClick={() => onNavigate('/')} className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
            <IconNotebook size={20} />
          </span>
          <span>
            Delcom<span className="text-brand">Blog</span>
          </span>
        </button>

        <div className="flex items-center gap-1">
          <NavLink active={currentPath === '/'} onClick={() => onNavigate('/')}>
            Beranda
          </NavLink>
          {user && (
            <NavLink active={currentPath === '/author'} onClick={() => onNavigate('/author')} icon={IconLayoutDashboard}>
              Workspace
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink active={currentPath === '/admin'} onClick={() => onNavigate('/admin')} icon={IconShieldLock}>
              Admin
            </NavLink>
          )}

          <button type="button" onClick={onCycleAccent} title="Ganti warna aksen" aria-label="Ganti warna aksen" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <IconPalette size={18} />
          </button>
          <button type="button" onClick={onToggleTheme} title="Ganti tema" aria-label="Ganti tema" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>

          {user ? (
            <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-800">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/15 text-sm font-bold uppercase text-brand" title={user.name}>
                {user.name.charAt(0)}
              </span>
              <span className="hidden text-sm font-medium md:inline">{user.name}</span>
              <button type="button" onClick={onLogout} aria-label="Keluar" title="Keluar" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                <IconLogout size={18} />
              </button>
            </div>
          ) : (
            <div className="ml-1 flex items-center gap-2">
              <button type="button" onClick={onLoginClick} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                <IconLogin2 size={18} /> Masuk
              </button>
              <button type="button" onClick={() => onNavigate('/register')} className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:brightness-110">
                <IconUserPlus size={18} /> <span className="hidden sm:inline">Daftar</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

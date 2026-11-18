import { useState } from 'react'
import { IconArrowLeft, IconLoader2, IconLogin2, IconNotebook, IconUserPlus } from '@tabler/icons-react'
import useInput from '../../../hooks/useInput'
import { login, register } from '../api/authApi'
import { showError, showSuccess } from '../../../helpers/toolsHelper'

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15 dark:border-slate-700 dark:bg-slate-900'

function Field({ id, label, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
    </div>
  )
}

function SubmitButton({ id, loading, icon: Icon, children }) {
  return (
    <button
      id={id}
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <IconLoader2 size={18} className="animate-spin" /> : <Icon size={18} />}
      {children}
    </button>
  )
}

// Form login dipakai bersama oleh halaman /login dan AuthModal.
export function LoginForm({ onLogin, onSwitchToRegister }) {
  const [username, onUsernameChange] = useInput('')
  const [password, onPasswordChange] = useInput('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const data = await login(username.trim(), password)
      onLogin(data)
    } catch (error) {
      setLoading(false)
      showError(error.message, 'Login Gagal')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field id="login-username" label="Username atau Email">
        <input id="login-username" className={inputClass} value={username} onChange={onUsernameChange} required autoComplete="username" placeholder="contoh: budi" />
      </Field>
      <Field id="login-password" label="Password">
        <input id="login-password" type="password" className={inputClass} value={password} onChange={onPasswordChange} required autoComplete="current-password" placeholder="••••••••" />
      </Field>
      <SubmitButton id="login-submit" loading={loading} icon={IconLogin2}>
        Masuk
      </SubmitButton>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Belum punya akun?{' '}
        <button type="button" onClick={onSwitchToRegister} className="font-semibold text-brand hover:underline">
          Daftar sebagai penulis
        </button>
      </p>
    </form>
  )
}

export function RegisterForm({ onRegistered, onSwitchToLogin }) {
  const [name, onNameChange] = useInput('')
  const [username, onUsernameChange] = useInput('')
  const [email, onEmailChange] = useInput('')
  const [password, onPasswordChange] = useInput('')
  const [confirm, onConfirmChange] = useInput('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!/^[a-zA-Z0-9]{3,50}$/.test(username.trim())) {
      showError('Username 3-50 karakter dan hanya boleh huruf/angka.', 'Data Tidak Valid')
      return
    }
    if (password.length < 6) {
      showError('Password minimal 6 karakter.', 'Data Tidak Valid')
      return
    }
    if (password !== confirm) {
      showError('Konfirmasi password tidak sama.', 'Data Tidak Valid')
      return
    }
    setLoading(true)
    try {
      await register({ name: name.trim(), username: username.trim(), email: email.trim(), password })
      showSuccess('Registrasi Berhasil', 'Silakan login dengan akun baru Anda.')
      onRegistered()
    } catch (error) {
      setLoading(false)
      showError(error.message, 'Registrasi Gagal')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field id="register-name" label="Nama Lengkap">
        <input id="register-name" className={inputClass} value={name} onChange={onNameChange} required minLength={2} placeholder="Budi Santoso" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="register-username" label="Username">
          <input id="register-username" className={inputClass} value={username} onChange={onUsernameChange} required placeholder="budi" />
        </Field>
        <Field id="register-email" label="Email">
          <input id="register-email" type="email" className={inputClass} value={email} onChange={onEmailChange} required placeholder="budi@email.com" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="register-password" label="Password">
          <input id="register-password" type="password" className={inputClass} value={password} onChange={onPasswordChange} required placeholder="Min. 6 karakter" />
        </Field>
        <Field id="register-confirm" label="Konfirmasi Password">
          <input id="register-confirm" type="password" className={inputClass} value={confirm} onChange={onConfirmChange} required placeholder="Ulangi password" />
        </Field>
      </div>
      <SubmitButton id="register-submit" loading={loading} icon={IconUserPlus}>
        Daftar
      </SubmitButton>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Sudah punya akun?{' '}
        <button type="button" onClick={onSwitchToLogin} className="font-semibold text-brand hover:underline">
          Masuk
        </button>
      </p>
    </form>
  )
}

// Halaman login (/login) dan registrasi (/register) mandiri.
export default function AuthPage({ mode, onLogin, onNavigate }) {
  const isLogin = mode === 'login'
  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-5/12 flex-col justify-between overflow-hidden bg-brand p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-black/10" />
        <div className="relative flex items-center gap-2 text-xl font-extrabold">
          <IconNotebook size={28} /> Delcom Blog
        </div>
        <div className="relative space-y-4">
          <h2 className="font-serif text-4xl font-bold leading-tight">Tulis gagasanmu, bagikan ke dunia.</h2>
          <p className="text-white/80">Editor Markdown modern, AI Content Generator yang terhubung dengan mesin pencari, dan statistik tulisan dalam satu ruang kerja.</p>
        </div>
        <p className="relative text-sm text-white/60">© {new Date().getFullYear()} Delcom Blog</p>
      </aside>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <button type="button" onClick={() => onNavigate('/')} className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand">
            <IconArrowLeft size={16} /> Kembali ke beranda
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{isLogin ? 'Selamat datang kembali' : 'Buat akun penulis'}</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              {isLogin ? 'Masuk untuk mengelola artikel Anda.' : 'Daftar gratis dan mulai menulis artikel pertama Anda.'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {isLogin ? (
              <LoginForm onLogin={onLogin} onSwitchToRegister={() => onNavigate('/register')} />
            ) : (
              <RegisterForm onRegistered={() => onNavigate('/login')} onSwitchToLogin={() => onNavigate('/login')} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

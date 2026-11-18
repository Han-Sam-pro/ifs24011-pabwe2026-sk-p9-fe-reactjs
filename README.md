# Delcom Blog — Frontend (ReactJS SPA + Vite + Tailwind CSS)

Single Page Application multi-tier (Publik, Penulis, Admin) yang mengonsumsi REST API
backend Golang Gin. Editor artikel memakai **Toast UI Editor** (Markdown + pratinjau
berdampingan) dan dilengkapi **AI Blog Generator** dengan opsi penelusuran mesin pencari.

## Menjalankan (port 5174)

```bash
npm install
npm run dev
```

Buka `http://localhost:5174`. Vite me-reverse proxy `/api` ke `http://localhost:8081`,
jadi jalankan backend terlebih dahulu.

## Pengujian (100% coverage)

```bash
npm test
```

Threshold coverage 100% (statements, branches, functions, lines) diatur di `vite.config.js`.
`src/main.jsx` (bootstrap ReactDOM) dan `src/setupTests.js` dikecualikan dari perhitungan.

## Build & Deploy Statis

```bash
npm run build      # hasil di dist/
```

Set `VITE_API_BASE_URL` (lihat `.env.example`) ke URL backend saat build untuk hosting statis.
Fallback SPA sudah disiapkan: `public/_redirects` (Netlify) dan `vercel.json` (Vercel).

## Rute SPA

| Path | Komponen | Akses |
|---|---|---|
| `/`, `/public` | PublicArticleList | Publik |
| `/posts/:slug` | PublicArticleDetail | Publik |
| `/author` | AuthorDashboard | Penulis (login) |
| `/admin` | AdminDashboard | Admin |
| `/login` | AuthPage (`mode="login"`, input `#login-username`, `#login-password`, `#login-submit`) | Publik |
| `/register` | AuthPage (`mode="register"`) | Publik |

Navigasi memakai `history.pushState` + event `popstate`, sehingga refresh tetap di rute yang sama.
Tamu yang membuka `/author`/`/admin` diarahkan ke `/login`; member yang membuka `/admin` diarahkan ke `/author`.

## Struktur

```
src/
├── App.jsx                       routing SPA, guard rute, sesi login
├── components/MarkdownEditor.jsx Toast UI Editor wrapper
├── components/MarkdownViewer.jsx Toast UI Viewer wrapper
├── helpers/apiHelper.js          fetch terpusat + Bearer token + respons standar
├── helpers/toolsHelper.js        SweetAlert2 & format tanggal
├── hooks/useInput.js, useTheme.js (dark/light + warna aksen)
└── features/
    ├── auth/   api, AuthPage (login/register), AuthModal
    ├── blog/   api, StickyNavbar, PublicArticleList, PublicArticleDetail,
    │           AuthorDashboard, PostStats, PostModal, AiPostGeneratorModal
    └── admin/  api, AdminDashboard
```

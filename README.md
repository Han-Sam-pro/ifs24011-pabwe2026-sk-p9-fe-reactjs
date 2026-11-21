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

## Deploy ke Hosting Delcom (terpisah dari backend)

Frontend dan backend dideploy sebagai **dua website**:

| Website | Isi |
|---|---|
| `https://ifs24011-pabwe2026-sk-p9-be-golang-gin.s1if.cloud` | Backend REST API (Golang Gin) |
| `https://ifs24011-pabwe2026-sk-p9-fe-reactjs.s1if.cloud` | Frontend SPA (hasil `npm run build`) |

1. `.env.production` (ikut di-commit, bukan rahasia) berisi
   `VITE_API_BASE_URL=https://ifs24011-pabwe2026-sk-p9-be-golang-gin.s1if.cloud`.
   `npm run build` otomatis memakainya. Jika dashboard Delcom frontend punya tab `.env`,
   isi variabel yang sama di sana (nilai dashboard menimpa file).
2. Variabel harus diawali `VITE_` dan dibaca **saat build**, jadi setelah mengubahnya website harus di-build/deploy ulang.
3. SPA fallback (agar refresh `/author`, `/posts/:slug` tidak 404). Jika Delcom memakai Nginx, pastikan ada:

   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
4. Backend sudah mengizinkan CORS dari origin mana pun (header `Authorization` didukung), jadi tidak perlu konfigurasi tambahan di backend.

## CI/CD Jenkins

`Jenkinsfile` di root repo menjalankan:

1. **Checkout** (`alpine:3.21`)
2. **Install Dependencies**: `npm ci` (`node:24-alpine`, cache volume `cicd-npm-cache`)
3. **Test**: `npm test` (Vitest + coverage, threshold 100%)
4. **Build Application**: `npm run build` → `dist/` (memakai `.env.production`)
5. **Trivy Security Scan**: `package-lock.json`, severity HIGH/CRITICAL, exit-code 1
6. **Package Application**: `git archive` source code (tanpa `.env`, `node_modules`, `dist`, `coverage`)
7. **Publish Application** & **Deploy Application**: sama dengan pipeline backend
   (butuh `URL_REDEPLOY`, `URL_PROGRESS`, `DEPLOY_TOKEN`, `WEBSITE_ID` di job Jenkins).

Node.js minimal 22.22 / 24.15 (syarat jsdom & Vitest), karena itu dipakai image `node:24-alpine`.

## Menjalankan di hosting Node.js (`npm start`)

`npm start` = `vite build` lalu `vite preview` di `0.0.0.0:$PORT` (default 4173), lengkap dengan
SPA fallback (refresh `/author`, `/posts/:slug` tidak 404). Dipakai jika hosting (mis. Delcom
`nodejs-reactjs`) menjalankan aplikasi dengan `npm start`.

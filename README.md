# GameVault — Local Setup (XAMPP + MySQL)

## Prerequisites
- Node.js 18+
- XAMPP (Apache + MySQL running)

## Setup Steps

### 1. Start XAMPP
Pastikan **MySQL** sudah running di XAMPP Control Panel (port 3306).

### 2. Buat Database di phpMyAdmin
Buka `http://localhost/phpmyadmin` → klik **New** → buat database bernama `gamevault` → klik **Create**.

### 3. Install Dependencies
```bash
npm install
```

### 4. Konfigurasi Environment
Copy `.env.example` menjadi `.env.local` dan sesuaikan:
```bash
cp .env.example .env.local
```

Edit `.env.local` jika XAMPP MySQL kamu pakai password:
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=       # kosongkan jika tidak ada password
MYSQL_DATABASE=gamevault

JWT_SECRET=ganti-dengan-string-random-panjang
JWT_REFRESH_SECRET=ganti-dengan-string-random-lain
```

### 5. Inisialisasi Tabel Database
Jalankan server dulu, lalu buka URL ini di browser:
```
http://localhost:3000/api/init-db?secret=ganti-dengan-string-random-panjang
```
> Nilai `secret` harus sama dengan `JWT_SECRET` di `.env.local`

### 6. Build & Run
```bash
npm run build && npm run start
```

Atau untuk development:
```bash
npm run dev
```

Buka `http://localhost:3000`

---

## Struktur Database (auto-dibuat)
- `users` — akun pengguna
- `games` — koleksi game per user
- `refresh_tokens` — token autentikasi

## Troubleshooting
- **ECONNREFUSED** → MySQL XAMPP belum jalan, cek XAMPP Control Panel
- **Unknown database 'gamevault'** → Buat database dulu di phpMyAdmin
- **Access denied** → Cek MYSQL_USER dan MYSQL_PASSWORD di `.env.local`

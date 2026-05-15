/**
 * scripts/backup-db.js
 * Backup otomatis database MySQL ke folder aman di luar htdocs.
 *
 * Jalankan manual: node scripts/backup-db.js
 * Jadwalkan: Tambahkan ke Windows Task Scheduler dengan interval harian.
 *
 * Pastikan mysqldump tersedia di PATH (biasanya sudah ada di instalasi XAMPP).
 * Tambahkan ke PATH: C:\xampp\mysql\bin
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// ── Konfigurasi ───────────────────────────────────────────────────────────────
const DB_URL = process.env.DATABASE_URL || "";
// Parse mysql://user:pass@host:port/dbname
const urlMatch = DB_URL.match(/mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
  console.error("❌ DATABASE_URL tidak valid atau tidak ditemukan di .env");
  process.exit(1);
}
const [, DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME] = urlMatch;

// Folder backup AMAN — di luar htdocs!
// Ganti ke path yang sesuai di environment kamu.
const BACKUP_DIR = process.env.BACKUP_DIR || "D:/backup-private/si-koperasi";

// ── Buat folder jika belum ada ────────────────────────────────────────────────
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Folder backup dibuat: ${BACKUP_DIR}`);
}

// ── Generate nama file dengan timestamp ──────────────────────────────────────
const now = new Date();
const ts = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
const filename = `${DB_NAME}_${ts}.sql`;
const filePath = path.join(BACKUP_DIR, filename);

// ── Jalankan mysqldump ────────────────────────────────────────────────────────
const passArg = DB_PASS ? `-p"${DB_PASS}"` : "";
const cmd = `mysqldump -h ${DB_HOST} -P ${DB_PORT} -u "${DB_USER}" ${passArg} "${DB_NAME}" > "${filePath}"`;

try {
  console.log(`🔄 Backup database "${DB_NAME}" dimulai...`);
  execSync(cmd, { shell: true, stdio: "inherit" });
  const stat = fs.statSync(filePath);
  const sizeKb = (stat.size / 1024).toFixed(1);
  console.log(`✅ Backup selesai: ${filePath} (${sizeKb} KB)`);
} catch (err) {
  console.error("❌ Backup gagal:", err.message);
  process.exit(1);
}

// ── Hapus backup lama (> 30 hari) ────────────────────────────────────────────
const RETENTION_DAYS = 30;
const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".sql"));
let deleted = 0;
for (const f of files) {
  const fp = path.join(BACKUP_DIR, f);
  const mtime = fs.statSync(fp).mtimeMs;
  if (mtime < cutoff) {
    fs.unlinkSync(fp);
    deleted++;
  }
}
if (deleted > 0) {
  console.log(`🗑️  ${deleted} file backup lama dihapus (> ${RETENTION_DAYS} hari)`);
}

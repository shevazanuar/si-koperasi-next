/**
 * Audit Trail Helper
 * Mencatat setiap aksi penting ke tabel audit_log.
 *
 * Jalankan SQL berikut di database terlebih dahulu:
 *
 * CREATE TABLE IF NOT EXISTS audit_log (
 *   id          INT AUTO_INCREMENT PRIMARY KEY,
 *   user_id     INT,
 *   username    VARCHAR(100),
 *   aksi        VARCHAR(100) NOT NULL,
 *   tabel       VARCHAR(100),
 *   record_id   INT,
 *   before_data JSON,
 *   after_data  JSON,
 *   ip_address  VARCHAR(45),
 *   keterangan  TEXT,
 *   created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
 * );
 */

import prisma from "@/lib/prisma";

/**
 * @typedef {Object} AuditLogParams
 * @property {number|null}  userId     - ID user yang melakukan aksi
 * @property {string|null}  username   - Username/NIK pelaku
 * @property {string}       aksi       - Nama aksi (e.g. "APPROVE_PINJAMAN")
 * @property {string|null}  tabel      - Nama tabel yang terpengaruh
 * @property {number|null}  recordId   - ID record yang terpengaruh
 * @property {object|null}  beforeData - Data sebelum perubahan
 * @property {object|null}  afterData  - Data sesudah perubahan
 * @property {string|null}  ipAddress  - IP address klien
 * @property {string|null}  keterangan - Catatan tambahan
 */

/**
 * Simpan audit log ke database.
 * Tidak akan throw error agar tidak mengganggu flow utama.
 *
 * @param {AuditLogParams} params
 */
export async function writeAuditLog({
  userId = null,
  username = null,
  aksi,
  tabel = null,
  recordId = null,
  beforeData = null,
  afterData = null,
  ipAddress = null,
  keterangan = null,
}) {
  try {
    await prisma.$executeRaw`
      INSERT INTO audit_log
        (user_id, username, aksi, tabel, record_id, before_data, after_data, ip_address, keterangan)
      VALUES
        (${userId}, ${username}, ${aksi}, ${tabel}, ${recordId},
         ${beforeData ? JSON.stringify(beforeData) : null},
         ${afterData  ? JSON.stringify(afterData)  : null},
         ${ipAddress}, ${keterangan})
    `;
  } catch (err) {
    // Audit log gagal tidak boleh crash aplikasi
    console.error("[AuditLog] Gagal menyimpan log:", err?.message);
  }
}

// ─── Konstanta Aksi ──────────────────────────────────────────────────────────
export const AUDIT_AKSI = {
  // Auth
  LOGIN_SUCCESS:       "LOGIN_SUCCESS",
  LOGIN_FAILED:        "LOGIN_FAILED",
  LOGOUT:              "LOGOUT",
  RESET_PASSWORD:      "RESET_PASSWORD",
  CHANGE_PASSWORD:     "CHANGE_PASSWORD",

  // Anggota
  TAMBAH_ANGGOTA:      "TAMBAH_ANGGOTA",
  EDIT_ANGGOTA:        "EDIT_ANGGOTA",
  HAPUS_ANGGOTA:       "HAPUS_ANGGOTA",

  // Simpanan
  TAMBAH_SIMPANAN:     "TAMBAH_SIMPANAN",
  HAPUS_SIMPANAN:      "HAPUS_SIMPANAN",
  TAMBAH_PENARIKAN:    "TAMBAH_PENARIKAN",

  // Pinjaman
  TAMBAH_PINJAMAN:     "TAMBAH_PINJAMAN",
  APPROVE_PINJAMAN:    "APPROVE_PINJAMAN",
  TOLAK_PINJAMAN:      "TOLAK_PINJAMAN",
  BAYAR_CICILAN:       "BAYAR_CICILAN",

  // Konfigurasi
  EDIT_CONFIG:         "EDIT_CONFIG",

  // Penjualan & Master Barang
  TAMBAH_PENJUALAN:    "TAMBAH_PENJUALAN",
  BATAL_PENJUALAN:     "BATAL_PENJUALAN",
  TAMBAH_BARANG:       "TAMBAH_BARANG",
  EDIT_BARANG:         "EDIT_BARANG",
  HAPUS_BARANG:        "HAPUS_BARANG",
  UPDATE_STOK_BARANG:  "UPDATE_STOK_BARANG",
};

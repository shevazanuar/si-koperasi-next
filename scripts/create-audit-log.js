const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT,
      username    VARCHAR(100),
      aksi        VARCHAR(100) NOT NULL,
      tabel       VARCHAR(100),
      record_id   INT,
      before_data JSON,
      after_data  JSON,
      ip_address  VARCHAR(45),
      keterangan  TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_aksi (aksi),
      INDEX idx_created_at (created_at)
    )
  `);
  console.log("✓ Tabel audit_log berhasil dibuat (atau sudah ada)");
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e.message); process.exit(1); });

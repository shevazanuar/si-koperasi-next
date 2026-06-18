/**
 * prisma/seed.js
 * Data seed berdasarkan data aktual dari database (db_dump).
 *
 * Jalankan: node prisma/seed.js
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database dengan data aktual...\n");

  const seedDataPath = path.join(__dirname, "seed_data.json");
  if (!fs.existsSync(seedDataPath)) {
    console.error("❌ File seed_data.json tidak ditemukan!");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(seedDataPath, "utf-8"));

  // 1. Profile
  if (data.profile && data.profile.length > 0) {
    console.log(`Mengembalikan ${data.profile.length} data profile...`);
    for (const p of data.profile) {
      await prisma.profile.upsert({
        where: { id: p.id },
        update: p,
        create: p,
      });
    }
  }

  // 2. Level
  if (data.level && data.level.length > 0) {
    console.log(`Mengembalikan ${data.level.length} data level...`);
    for (const l of data.level) {
      await prisma.level.upsert({
        where: { id: l.id },
        update: l,
        create: l,
      });
    }
  }

  // 3. Users (Admin, dll)
  // KARENA PASSWORD DI DATABASE SUDAH DIENKRIPSI (BCRYPT), KITA TIDAK BISA MELIHAT PASSWORD ASLINYA.
  // SEBAGAI SOLUSI, KITA AKAN MERESET PASSWORD MEREKA DI SINI MENJADI PASSWORD BARU YANG BISA ANDA GUNAKAN.
  if (data.users && data.users.length > 0) {
    console.log(`Mengembalikan ${data.users.length} data users...`);
    
    // Set password default untuk admin dan strong (jika ada)
    const adminPassword = await bcrypt.hash("Admin@123!!", 12);
    const strongPassword = await bcrypt.hash("Strong@123!!", 12);
    const defaultPassword = await bcrypt.hash("Password123!", 12);

    for (const u of data.users) {
      let pwd = u.password;
      let plainTextReminder = "tidak diubah";
      
      // Reset password untuk akun tertentu agar user bisa login
      if (u.username === "admin") {
        pwd = adminPassword;
        plainTextReminder = "Admin@123!!";
      } else if (u.username === "strong") {
        pwd = strongPassword;
        plainTextReminder = "Strong@123!!";
      } else if (u.password.startsWith("$2b$") || u.password.startsWith("$2a$")) {
        // Jika sudah bcrypt dan bukan admin/strong, biarkan saja
      } else {
        // Jika masih MD5 atau kosong
        pwd = defaultPassword;
        plainTextReminder = "Password123!";
      }

      const userData = { ...u, password: pwd };
      
      await prisma.users.upsert({
        where: { id: u.id },
        update: userData,
        create: userData,
      });

      if (plainTextReminder !== "tidak diubah") {
        console.log(`  - Username '${u.username}' password direset menjadi: ${plainTextReminder}`);
      }
    }
  }

  // 4. Level Anggota
  if (data.level_anggota && data.level_anggota.length > 0) {
    console.log(`Mengembalikan ${data.level_anggota.length} data level_anggota...`);
    for (const la of data.level_anggota) {
      await prisma.level_anggota.upsert({
        where: { id: la.id },
        update: la,
        create: la,
      });
    }
  }

  // 5. Jenis Simpanan
  if (data.jenis_simpanan && data.jenis_simpanan.length > 0) {
    console.log(`Mengembalikan ${data.jenis_simpanan.length} data jenis_simpanan...`);
    for (const js of data.jenis_simpanan) {
      await prisma.jenis_simpanan.upsert({
        where: { id: js.id },
        update: js,
        create: js,
      });
    }
  }

  // 6. Jenis Pinjaman
  if (data.jenis_pinjaman && data.jenis_pinjaman.length > 0) {
    console.log(`Mengembalikan ${data.jenis_pinjaman.length} data jenis_pinjaman...`);
    for (const jp of data.jenis_pinjaman) {
      await prisma.jenis_pinjaman.upsert({
        where: { id: jp.id },
        update: jp,
        create: jp,
      });
    }
  }

  // 7. Anggota
  if (data.anggota && data.anggota.length > 0) {
    console.log(`Mengembalikan ${data.anggota.length} data anggota (ini mungkin butuh beberapa saat)...`);
    
    // Gunakan createMany dengan skipDuplicates untuk optimasi bulk insert
    await prisma.anggota.createMany({
      data: data.anggota,
      skipDuplicates: true,
    });
    
    console.log("  Password anggota tetap mengikuti data enkripsi di database lama.");
  }

  console.log("\n✅ Seeding dengan data aktual selesai!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Seed error:", e.message);
    process.exit(1);
  });

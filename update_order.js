const fs = require('fs');
const path = require('path');

const dir = 'C:\\\\xampp\\\\htdocs\\\\kuliah\\\\si-koperasi-next\\\\src';

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && (filePath.endsWith('.js') || filePath.endsWith('.jsx'))) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

let modifiedCount = 0;

walkSync(dir, function(filePath, stat) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace asc with desc in standard orderBy patterns
  content = content.replace(/orderBy:\s*\{\s*id:\s*['"]asc['"]\s*\}/g, 'orderBy: { id: "desc" }');
  content = content.replace(/orderBy:\s*\{\s*kode:\s*['"]asc['"]\s*\}/g, 'orderBy: { kode: "desc" }');
  content = content.replace(/orderBy:\s*\{\s*kategpinj_id:\s*['"]asc['"]\s*\}/g, 'orderBy: { kategpinj_id: "desc" }');
  content = content.replace(/orderBy:\s*\{\s*nama_kategori:\s*['"]asc['"]\s*\}/g, 'orderBy: { nama_kategori: "desc" }');
  content = content.replace(/orderBy:\s*\{\s*tanggal_penjualan:\s*['"]asc['"]\s*\}/g, 'orderBy: { tanggal_penjualan: "desc" }');
  content = content.replace(/orderBy:\s*\{\s*tanggal_pembelian:\s*['"]asc['"]\s*\}/g, 'orderBy: { tanggal_pembelian: "desc" }');
  content = content.replace(/orderBy:\s*\{\s*created_at:\s*['"]asc['"]\s*\}/g, 'orderBy: { created_at: "desc" }');
  
  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log('Modified explicit orderBy in:', path.basename(filePath));
    modifiedCount++;
  }
});

// Also search for some pages that don't have orderBy, and append them
const pagesToModify = [
  'src/app/dashboard/anggota/page.jsx',
  'src/app/dashboard/aset-tetap/page.jsx',
  'src/app/dashboard/aset-lancar/page.jsx',
  'src/app/dashboard/kas/page.jsx',
  'src/app/dashboard/akun-bank/page.jsx',
  'src/app/dashboard/mutasi/page.jsx',
  'src/app/dashboard/biaya/page.jsx',
  'src/app/dashboard/informasi/page.jsx',
  'src/app/dashboard/pinjaman/page.jsx',
  'src/app/dashboard/simpanan/page.jsx',
  'src/app/dashboard/penjualan/page.jsx',
  'src/app/dashboard/master/barang/page.jsx'
];

let addedCount = 0;
pagesToModify.forEach(relPath => {
  const p = path.join('C:\\\\xampp\\\\htdocs\\\\kuliah\\\\si-koperasi-next', relPath);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    let original = content;
    
    // Find prisma.xxx.findMany({ 
    // If it doesn't have orderBy, we might want to add orderBy: { id: 'desc' }
    // But it's tricky. Let's just do a manual replace for common patterns:
    content = content.replace(/(prisma\.\w+\.findMany\(\{\s*)(?![^}]*orderBy)/g, '$1orderBy: { id: "desc" },\n        ');
    
    if (original !== content) {
      fs.writeFileSync(p, content);
      console.log('Added orderBy desc to:', path.basename(p));
      addedCount++;
    }
  }
});

console.log('Total files modified explicitly:', modifiedCount);
console.log('Total files where orderBy desc was added:', addedCount);

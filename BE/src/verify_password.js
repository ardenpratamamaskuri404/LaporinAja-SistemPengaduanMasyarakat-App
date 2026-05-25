const bcrypt = require('bcryptjs');

// Hash yang ada di database_schema.sql
const storedHash = '$2a$10$wEIfL/A0uDqTf2zJ9iE.f.hD1oQc/1DXY5M8Cg/t5k8P1hWl.rX/.';

// Password yang akan dicoba login
const testPassword = 'password123';

async function verify() {
  console.log('=== Verifikasi Password ===');
  console.log('Hash di DB:', storedHash);
  console.log('Password test:', testPassword);
  
  const isMatch = await bcrypt.compare(testPassword, storedHash);
  console.log('Cocok?:', isMatch);
  
  if (!isMatch) {
    // Coba generate hash baru untuk password123 agar bisa dibandingkan
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(testPassword, salt);
    console.log('\n--- Hash TIDAK cocok! ---');
    console.log('Hash baru untuk "password123":', newHash);
    console.log('Gunakan hash ini di database_schema.sql');
  } else {
    console.log('\n--- BERHASIL! Password cocok. Login akan berfungsi. ---');
  }
}

verify();

/**
 * Location Normalizer - LaporinAja
 * Normalizes city (kota) names to match administrative filters (e.g. "Jakarta Selatan", "Jakarta Barat", "Depok").
 */
const normalizeKota = (kota, kecamatan, alamat) => {
  const fullText = `${kota || ''} ${kecamatan || ''} ${alamat || ''}`.toLowerCase();

  // 1. Jakarta Selatan
  const jakselKeywords = [
    'setiabudi', 'tebet', 'mampang prapatan', 'kebayoran baru', 'kebayoran lama', 
    'pesanggrahan', 'cilandak', 'pasar minggu', 'pancoran', 'jagakarsa', 'jakarta selatan', 'jaksel'
  ];
  if (jakselKeywords.some(k => fullText.includes(k))) {
    return 'Jakarta Selatan';
  }

  // 2. Jakarta Barat
  const jakbarKeywords = [
    'cengkareng', 'grogol petamburan', 'kalideres', 'kebon jeruk', 'kembangan', 
    'palmerah', 'taman sari', 'tambora', 'jakarta barat', 'jakbar'
  ];
  if (jakbarKeywords.some(k => fullText.includes(k))) {
    return 'Jakarta Barat';
  }

  // 3. Jakarta Pusat
  const jakpusKeywords = [
    'cempaka putih', 'gambir', 'johar baru', 'kemayoran', 'menteng', 
    'sawah besar', 'senen', 'tanah abang', 'jakarta pusat', 'jakpus'
  ];
  if (jakpusKeywords.some(k => fullText.includes(k))) {
    return 'Jakarta Pusat';
  }

  // 4. Jakarta Timur
  const jaktimKeywords = [
    'cakung', 'cipayung', 'ciracas', 'duren sawit', 'jatinegara', 
    'kramat jati', 'makasar', 'pasar rebo', 'pulo gadung', 'matraman', 'jakarta timur', 'jaktim'
  ];
  if (jaktimKeywords.some(k => fullText.includes(k))) {
    return 'Jakarta Timur';
  }

  // 5. Jakarta Utara
  const jakutKeywords = [
    'cilincing', 'kelapa gading', 'koja', 'pademangan', 'penjaringan', 
    'tanjung priok', 'jakarta utara', 'jakut'
  ];
  if (jakutKeywords.some(k => fullText.includes(k))) {
    return 'Jakarta Utara';
  }

  // 6. Depok
  const depokKeywords = ['depok', 'tapos', 'cimanggis', 'sawangan', 'limo', 'pancoran mas', 'sukmajaya'];
  if (depokKeywords.some(k => fullText.includes(k))) {
    return 'Depok';
  }

  // 7. Bogor
  if (fullText.includes('bogor')) {
    return 'Bogor';
  }

  // 8. Subang
  if (fullText.includes('subang')) {
    return 'subang';
  }

  // 9. Tangerang Selatan
  const tangselKeywords = ['tangerang selatan', 'tangsel', 'serpong', 'ciputat', 'pamulang', 'pondok aren', 'setu'];
  if (tangselKeywords.some(k => fullText.includes(k))) {
    return 'tangerang selatan';
  }

  // 10. Bekasi
  if (fullText.includes('bekasi')) {
    return 'Bekasi';
  }

  // 11. Bandung
  if (fullText.includes('bandung')) {
    return 'Bandung';
  }

  // Fallback cleanup
  if (kota) {
    let cleanKota = kota.replace(/kecamatan\s+/i, '').replace(/kota\s+/i, '').trim();
    // Capitalize first letter of each word
    cleanKota = cleanKota.replace(/\b\w/g, c => c.toUpperCase());
    return cleanKota;
  }

  return null;
};

module.exports = {
  normalizeKota
};

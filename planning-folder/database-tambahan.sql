CREATE TABLE IF NOT EXISTS `laporanselesaifoto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `url` VARCHAR(255) NOT NULL,
  `laporanId` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `LaporanSelesaiFoto_laporanId_fkey` (`laporanId`),
  CONSTRAINT `LaporanSelesaiFoto_laporanId_fkey` 
    FOREIGN KEY (`laporanId`) 
    REFERENCES `laporan` (`id`) 
    ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `LaporanSelesaiFoto` (`url`, `laporanId`)
SELECT `foto_selesai`, `id` 
FROM `Laporan` 
WHERE `foto_selesai` IS NOT NULL;

ALTER TABLE `Laporan` DROP COLUMN `foto_selesai`;
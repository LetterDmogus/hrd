# Sistem Analitik SDM Berbasis AI untuk Prediksi Turnover, Analisis Produktivitas, dan Rekomendasi Pelatihan

Nama aplikasi: KnowHR
Target: Admin HR (membutuhkan 1 admin HR dan 1 admin TI)
User : Manager/Atasan (melihat laporan analytical)

## Role

- SuperAdmin (mengelola semua data, mengelola data AI)
- Admin TI (mengelola data karyawan, data pelatihan, data evaluasi)
- HR (menginput data karyawan, data pelatihan, data evaluasi, melihat laporan analytical)
- Manager/Atasan (melihat laporan analytical)

## Teknologi

- Frontend: Vue.js 3 (Tailwind CSS)
- Backend: Fastify.js + Drizzle ORM
- Database: PostgreSQL + Redis
- AI: Model AI (prediksi turnover, analisis produktivitas, rekomendasi pelatihan)
- Dashboard: Dashboard interaktif untuk visualisasi data
- Deployment: Docker + Docker Compose
- Documentation: Swagger/OpenAPI
- Authentication: JWT
- Cache: Redis
- Error Handling: Custom Error Handling
- File Upload: Multer
- Charts: Chart.js

## Cara Kerja

- HR memasukkan data karyawan.
- Data kehadiran, KPI, pelatihan, dan evaluasi diperbarui secara berkala.
- AI memproses seluruh data untuk menghasilkan:
  - Prediksi risiko resign.
  - Analisis produktivitas.
  - Identifikasi kesenjangan kompetensi.
- Dashboard diperbarui secara real-time.
- Manajemen meninjau hasil analisis.
- Sistem memberikan rekomendasi tindakan, seperti pelatihan, promosi, atau redistribusi beban kerja.
- HR menjalankan tindak lanjut dan memantau dampaknya pada periode berikutnya.

## Data yang Dianalisis

- Lama bekerja
- Gaji
- Kenaikan gaji
- Frekuensi lembur
- Kehadiran
- Keterlambatan
- Cuti
- Hasil evaluasi
- Jumlah pelatihan
- Riwayat promosi
- Hasil survei kepuasan
- Usia
- Divisi
- Beban kerja
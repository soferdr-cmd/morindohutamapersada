const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint khusus untuk memicu pembuatan/reset tabel pertama kali
app.get('/api/setup', async (req, res) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_pelanggan VARCHAR(255) NOT NULL,
        kategori_pelanggan VARCHAR(100),
        no_telepon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS kpi_targets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        divisi VARCHAR(100),
        indikator VARCHAR(255),
        target VARCHAR(100),
        realisasi VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS daily_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tanggal DATE,
        customer_id INT,
        kategori_pekerjaan VARCHAR(100),
        status_pekerjaan VARCHAR(50),
        uraian_kegiatan TEXT,
        kendala TEXT,
        tindak_lanjut TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    res.json({ message: "✅ Berhasil! Semua tabel siap digunakan." });
  } catch (error) {
    console.error("Error Setup Database:", error);
    res.status(500).json({ error: "Gagal membuat tabel", detail: error.message });
  }
});

// Endpoint untuk cek status server (hanya memastikan server hidup)
app.get('/api/ping', (req, res) => {
  res.json({ message: "Server hidup dan berjalan normal! 🚀" });
});

// Export app untuk Vercel Serverless
module.exports = app;

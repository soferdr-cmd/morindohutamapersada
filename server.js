const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Endpoint Setup Database
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

// Endpoint Ping
app.get('/api/ping', (req, res) => {
  res.json({ message: "Server hidup dan berjalan normal! 🚀" });
});

// --- API CUSTOMERS ---
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { nama_pelanggan, kategori_pelanggan, no_telepon } = req.body;
    const [result] = await db.query(
      'INSERT INTO customers (nama_pelanggan, kategori_pelanggan, no_telepon) VALUES (?, ?, ?)',
      [nama_pelanggan, kategori_pelanggan, no_telepon]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API DAILY LOGS ---
app.get('/api/daily-logs', async (req, res) => {
  try {
    const query = `
      SELECT l.*, c.nama_pelanggan 
      FROM daily_logs l 
      LEFT JOIN customers c ON l.customer_id = c.id 
      ORDER BY l.tanggal DESC, l.id DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/daily-logs', async (req, res) => {
  try {
    const { tanggal, customer_id, kategori_pekerjaan, status_pekerjaan, uraian_kegiatan, kendala, tindak_lanjut } = req.body;
    const [result] = await db.query(
      'INSERT INTO daily_logs (tanggal, customer_id, kategori_pekerjaan, status_pekerjaan, uraian_kegiatan, kendala, tindak_lanjut) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [tanggal, customer_id || null, kategori_pekerjaan, status_pekerjaan, uraian_kegiatan, kendala, tindak_lanjut]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;

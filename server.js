const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sajikan file statis dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// ==================== 1. CUSTOMERS API ====================
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  const { nama_pelanggan, kategori_pelanggan, no_telepon } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO customers (nama_pelanggan, kategori_pelanggan, no_telepon) VALUES (?, ?, ?)',
      [nama_pelanggan, kategori_pelanggan, no_telepon]
    );
    res.json({ id: result.insertId, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== 2. DAILY LOGS API ====================
app.get('/api/daily-logs', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT daily_logs.*, customers.nama_pelanggan 
      FROM daily_logs 
      LEFT JOIN customers ON daily_logs.customer_id = customers.id 
      ORDER BY daily_logs.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/daily-logs', async (req, res) => {
  const { tanggal, customer_id, kategori_pekerjaan, status_pekerjaan, uraian_kegiatan, kendala, tindak_lanjut } = req.body;
  try {
    await db.query(
      `INSERT INTO daily_logs (tanggal, customer_id, kategori_pekerjaan, status_pekerjaan, uraian_kegiatan, kendala, tindak_lanjut) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tanggal, customer_id, kategori_pekerjaan, status_pekerjaan, uraian_kegiatan, kendala, tindak_lanjut]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== 3. KPI TARGETS API ====================
app.get('/api/kpi-targets', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM kpi_targets ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/kpi-targets', async (req, res) => {
  const { divisi, indikator, target, realisasi, status } = req.body;
  try {
    await db.query(
      'INSERT INTO kpi_targets (divisi, indikator, target, realisasi, status) VALUES (?, ?, ?, ?, ?)',
      [divisi, indikator, target, realisasi, status]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== 4. ORDERS & INVOICE API ====================
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT orders.*, customers.nama_pelanggan, customers.no_telepon 
      FROM orders 
      LEFT JOIN customers ON orders.customer_id = customers.id 
      ORDER BY orders.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT orders.*, customers.nama_pelanggan, customers.no_telepon 
      FROM orders 
      LEFT JOIN customers ON orders.customer_id = customers.id 
      WHERE orders.id = ?
    `, [orderId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const { customer_id, jenis_layanan, total_harga } = req.body;
  
  try {
    // Memastikan kolom jenis_layanan ikut tersimpan ke database
    await db.query(
      'INSERT INTO orders (customer_id, jenis_layanan, total_harga) VALUES (?, ?, ?)',
      [customer_id, jenis_layanan, total_harga]
    );
    
    res.status(201).json({ success: true, message: 'Order berhasil disimpan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menyimpan order ke database' });
  }
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

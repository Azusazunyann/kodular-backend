const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Otomatis konek ke MySQL bawaan Railway
const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

// Otomatis bikin tabel users kalau belum ada di database
pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(50) NOT NULL,
        telp VARCHAR(20) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        pass VARCHAR(50) NOT NULL
    )
`, (err) => {
    if (err) console.error("Gagal buat tabel:", err);
    else console.log("Database & Tabel Users Siap!");
});

// Fitur Daftar
app.post('/daftar', (req, res) => {
    const { nama, telp, username, pass } = req.body;
    if (!nama || !telp || !username || !pass) return res.send("Data tidak boleh kosong");

    pool.query(
        'INSERT INTO users (nama, telp, username, pass) VALUES (?, ?, ?, ?)',
        [nama, telp, username, pass],
        (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.send("Username sudah terdaftar");
                return res.send("Gagal daftar");
            }
            res.send("Berhasil daftar");
        }
    );
});

// Fitur Login
app.post('/login', (req, res) => {
    const { username, pass } = req.body;
    pool.query(
        'SELECT * FROM users WHERE username = ? AND pass = ?',
        [username, pass],
        (err, results) => {
            if (err) return res.send("Error database");
            if (results.length > 0) {
                res.send("Berhasil login!");
            } else {
                res.send("Username & Password Anda Salah!");
            }
        }
    );
});

app.listen(port, () => console.log(`Server ON di port ${port}`));

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const config = require('../config.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database(config.database.dataPath);

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, hostname TEXT, timestamp TEXT, content TEXT, filename TEXT, mimetype)");
});

const storage = multer.memoryStorage();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('screenshot'), (req, res) => {
  const { username, hostname, timestamp, content } = req.body;
  console.log(upload)
  console.log(req.file)

  const stmt = db.prepare("INSERT INTO data (username, hostname, timestamp, content, filename, mimetype) VALUES (?, ?, ?, ?, ?, ?)");

  const errors = [];

  if (!content) {
    errors.push('Content is required.');
    return res.status(400).json({ errors: errors });
  }

  const file = req.file;

  stmt.run(username, hostname, timestamp, content, file.filename, file.mimetype, function (err) {
    if (err) {
      errors.push(err.message);
      return res.status(500).json({ errors: errors });
    }
    res.status(201).json({ message: 'Data inserted successfully' });
  });

  stmt.finalize();
});

router.get('/', (req, res) => {
  db.all("SELECT * FROM data", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

router.get('/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../uploads', filename);

  res.sendFile(filepath, (err) => {
    if (err) {
      res.status(404).send('File not found');
    }
  });
});

module.exports = router;

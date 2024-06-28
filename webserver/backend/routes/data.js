const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const config = require('../config.js');

const db = new sqlite3.Database(config.database.dataPath);

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT)");
});

router.post('/', (req, res) => {
  const value = req.body.value;
  if (!value) {
    return res.status(400).send('value is required');
  }

  const stmt = db.prepare("INSERT INTO data (value) VALUES (?)");
  stmt.run(value, function(err) {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(201).send({ id: this.lastID });
  });
  stmt.finalize();
});

router.get('/', (req, res) => {
  db.all("SELECT * FROM data", (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(200).send(rows);
  });
});

module.exports = router;

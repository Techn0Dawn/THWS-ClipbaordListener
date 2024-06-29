const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const config = require('../config.js');
const multer  = require('multer');

const db = new sqlite3.Database(config.database.dataPath);

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, hostname TEXT, timestamp TEXT, content TEXT, img TEXT)");
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/',upload.single('screenshot'), (req, res) => {
  const values = req.body;
  console.log(values);
//  const img = req.file.buffer;
//  console.log(img);

  const stmt = db.prepare("INSERT INTO data (username, hostname, timestamp, content, img) VALUES (?, ?, ?, ?, ?)");

  db.serialize(() => {
    const errors = [];
      const { username, hostname, timestamp, content, img } = values;

      if (!content) {
        errors.push('Content is required for value: ' + JSON.stringify(value));
        return;
      }

      stmt.run(username, hostname, timestamp, content, img, function(err) {
        if (err) {
          errors.push(err.message);
        }
      });

    stmt.finalize((err) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      if (errors.length > 0) {
        return res.status(400).send(errors.join('; '));
      }
      res.status(201).send({ message: 'All rows inserted successfully' });
    });
  });
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

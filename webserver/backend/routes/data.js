const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const config = require('../config.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database(config.database.dataPath);

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS actions (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, hostname TEXT, timestamp TEXT, content TEXT, actiontype TEXT)");
  db.run(`CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY AUTOINCREMENT, action_id INTEGER, filename TEXT, mime_type TEXT, FOREIGN KEY (action_id) REFERENCES actions(id))`);
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST endpoint to save action and files
router.post('/', upload.any(), (req, res) => {
  const { username, hostname, timestamp, content, action_type } = req.body;

  // Insert action metadata into the actions table
  db.run(
    `INSERT INTO actions (username, hostname, timestamp, content, actiontype) VALUES (?, ?, ?, ?, ?)`,
    [username, hostname, timestamp, content, action_type],
    function(err) {
      if (err) {
        console.error('Error inserting into actions table', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      const actionId = this.lastID;
      const fileSavePromises = [];

      
      req.files.forEach(file => {

        if(file.fieldname == "screenshot") {

        console.log(file)
        const filename = file.originalname;
        const formattedTimestamp = timestamp.replace(/[-: ]/g, '');
        const storingName = `${formattedTimestamp}_${filename}`;
        const mimeType = file.mimetype;
        const base64String = file.buffer.toString();
        const buffer = Buffer.from(base64String, 'base64');
        const filePath = path.join(__dirname, '../uploads', storingName);
        fs.writeFileSync(filePath, buffer);
        
        const fileSavePromise = new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO data (action_id, filename, mime_type) VALUES (?, ?, ?)`,
            [actionId, storingName, mimeType],
            function(err) {
              if (err) {
                console.error('Error inserting into files table', err);
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });
      
        fileSavePromises.push(fileSavePromise);
        
    }

    else {
      console.log("no text uploaded");
      console.log(file)
        const filename = file.originalname;
        const formattedTimestamp = timestamp.replace(/[-: ]/g, '');
        const storingName = `${formattedTimestamp}_${filename}`;
        const mimeType = file.mimetype;
        const buffer = file.buffer;
        const filePath = path.join(__dirname, '../uploads', storingName);
        fs.writeFileSync(filePath, buffer);
        
        const fileSavePromise = new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO data (action_id, filename, mime_type) VALUES (?, ?, ?)`,
            [actionId, storingName, mimeType],
            function(err) {
              if (err) {
                console.error('Error inserting into files table', err);
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });
      
        fileSavePromises.push(fileSavePromise);

    }});

      Promise.all(fileSavePromises)
        .then(() => res.status(200).json({ message: 'Data received successfully' }))
        .catch(err => res.status(500).json({ message: 'Internal server error' }));
    }
  );
});

// GET endpoint to retrieve actions and their associated files
router.get('/', (req, res) => {
  db.all(`SELECT * FROM actions`, (err, actions) => {
      if (err) {
          console.error('Error retrieving actions from database', err);
          return res.status(500).json({ message: 'Internal server error' });
      }

      let actionPromises = actions.map(action => {
          return new Promise((resolve, reject) => {
              db.all(`SELECT * FROM data WHERE action_id = ?`, [action.id], (err, files) => {
                  if (err) {
                      console.error('Error retrieving files from database', err);
                      reject(err);
                  } else {
                      resolve({
                          ...action,
                          files: files
                      });
                  }
              });
          });
      });

      Promise.all(actionPromises)
          .then(results => res.status(200).json(results))
          .catch(err => res.status(500).json({ message: 'Internal server error' }));
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

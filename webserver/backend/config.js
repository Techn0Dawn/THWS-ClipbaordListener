const path = require('path');

const config = {
    server: {
      port: process.env.SERVER_PORT || 8080
    },
    database: {
      dataPath: process.env.DATA_DB_PATH || path.resolve('data.db'),
    }
  };
  

module.exports = config;
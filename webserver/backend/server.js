const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const config = require('./config.js');
const cors = require('cors')

const app = express();
const port = config.server.port;

app.use(bodyParser.json());
app.use(cors());
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

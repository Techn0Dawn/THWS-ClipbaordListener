const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const config = require('./config.js');
const cors = require('cors')

const app = express();
express.json();
const port = config.server.port;

app.use(bodyParser.json());
app.use(cors());
app.use('/', routes);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

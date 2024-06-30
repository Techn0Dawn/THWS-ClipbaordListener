const express = require('express');
const dataRoutes = require('./data');
const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.json({ limit: '50mb' }));
router.use('/data', dataRoutes);

module.exports = router;

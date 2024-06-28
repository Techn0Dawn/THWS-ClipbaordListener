const express = require('express');
const dataRoutes = require('./data');

const router = express.Router();

router.use('/data', dataRoutes);

module.exports = router;

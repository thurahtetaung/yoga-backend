// src/routes/syncRoutes.js
const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

// Ensure we're accessing the correct controller methods
router.post('/upload', syncController.uploadData);
router.get('/download', syncController.downloadData);

module.exports = router;
// src/routes/syncRoutes.js
const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

router.post('/upload', syncController.uploadData);
router.get('/download', syncController.downloadData);
router.post('/delete-all', syncController.deleteAll);

module.exports = router;
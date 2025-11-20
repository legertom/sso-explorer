const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const apiController = require('../controllers/apiController');

// Auth Routes
router.get('/auth/clever', authController.login);
router.get('/auth/clever/callback', authController.callback);
router.get('/auth/logout', authController.logout);

// API Routes
router.get('/api/me', apiController.getMe);

module.exports = router;

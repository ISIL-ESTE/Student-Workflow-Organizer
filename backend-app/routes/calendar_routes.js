const express = require('express');
const base = require('./base_controller');
const calendarModel = require('../models/calendar/calendar_model');
const authController = require('../controllers/auth_controllers/auth_controller');
const router = express.Router();

router.post('/', base.createOne(calendarModel));
router.get('/:id', base.getOne(calendarModel));

router.patch('/:id', base.updateOne(calendarModel));
router.delete('/:id', base.deleteOne(calendarModel));

router.use(authController.restrictTo('ADMIN', 'SUPER_ADMIN'));

router.get('/', base.getAll(calendarModel));

module.exports = router;

const express = require('express');

const {
  getAllTours,
  updateTour,
  getTour,
  postTour,
  deleteTour,
  aliasTopTours
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

// router.param('id', checkId);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router
  .route('/')
  .get(protect, getAllTours)
  .post(postTour);

router
  .route(`/:id`)
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;

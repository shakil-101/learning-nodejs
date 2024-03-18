const express = require('express');

const {
  getAllTours,
  updateTour,
  getTour,
  postTour,
  deleteTour,
  aliasTopTours
} = require('../controllers/tourController');
const { protect } = require('../controllers/authController');

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
  .delete(deleteTour);

module.exports = router;

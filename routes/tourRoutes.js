const express = require('express');

const {
  getAllTours,
  updateTour,
  getTour,
  postTour,
  deleteTour
} = require('../controllers/tourController');

const router = express.Router();

// router.param('id', checkId);

router
  .route('/')
  .get(getAllTours)
  .post(postTour);

router
  .route(`/:id`)
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;

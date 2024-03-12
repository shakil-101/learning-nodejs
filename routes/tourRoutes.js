const express = require('express');

const {
  getAllTours,
  postTour,
  getTour,
  patchTour,
  checkId,
  checkBody
} = require('../controllers/tourController');

const router = express.Router();

router.param('id', checkId);

router
  .route('/')
  .get(getAllTours)
  .post(checkBody, postTour);

router
  .route(`/:id`)
  .get(getTour)
  .patch(patchTour);

module.exports = router;

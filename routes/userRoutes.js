const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  patchUser
} = require('../controllers/userController');

const router = express.Router();

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(patchUser);

module.exports = router;

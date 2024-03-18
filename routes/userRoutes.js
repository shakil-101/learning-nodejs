const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  patchUser
} = require('../controllers/userController');

const {
  signup,
  login,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.route('/forgetPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);
router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(patchUser);

module.exports = router;

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
  resetPassword,
  protect,
  updatePassword
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgetPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updateMyPassword', protect, updatePassword);

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(patchUser);

module.exports = router;

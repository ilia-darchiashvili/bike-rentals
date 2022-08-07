const express = require('express');
const { check } = require('express-validator');

const bikesControllers = require('../controllers/bikes-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:bid', bikesControllers.getBikeById);

router.get('/', bikesControllers.getBikes);

router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('model')
      .not()
      .isEmpty(),
    check('color')
      .not()
      .isEmpty(),
    check('address')
      .not()
      .isEmpty()
  ],
  bikesControllers.createBike
);

router.patch(
  '/:bid',
  fileUpload.single('image'),
  [
    check('model')
      .not()
      .isEmpty(),
    check('color')
      .not()
      .isEmpty(),
    check('address')
      .not()
      .isEmpty()
  ],
  bikesControllers.updateBike
);

router.delete('/:bid', bikesControllers.deleteBike);

router.patch(
  '/:bid/reserve',
  bikesControllers.reserveBike
);

router.patch(
  '/:bid/cancel_reserve',
  bikesControllers.cancelReserveBike
);

module.exports = router;

const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Bike = require('../models/bike');
const User = require('../models/user');

const getBikeById = async (req, res, next) => {
  const bikeId = req.params.bid;

  let bike;
  try {
    bike = await Bike.findById(bikeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a bike.',
      500
    );
    return next(error);
  }

  if (!bike) {
    const error = new HttpError(
      'Could not find bike for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ bike: bike.toObject({ getters: true }) });
};

const getBikes = async (req, res, next) => {
  let bikes;
  try {
    bikes = await Bike.find({});
  } catch (err) {
    const error = new HttpError(
      'Fetching bikes failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ bikes: bikes.map(bike => bike.toObject({ getters: true })) });
};

const createBike = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { model, color, address, rating, isAvailable } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdBike = new Bike({
    model,
    color,
    address,
    location: coordinates,
    rating,
    isAvailable,
    image: req.file?.path,
    reservations: []
  });

  try {
    await createdBike.save();
  } catch (err) {
    const error = new HttpError(
      'Creating bike failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ bike: createdBike });
};

const updateBike = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { model, color, address, rating, isAvailable } = req.body;
  const bikeId = req.params.bid;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  let bike;
  try {
    bike = await Bike.findById(bikeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update bike.',
      500
    );
    return next(error);
  }

  bike.model = model;
  bike.color = color;
  bike.address = address;
  bike.location = coordinates;
  bike.rating = rating;
  bike.isAvailable = isAvailable;
  if (req.file?.path) {
    bike.image = req.file.path;
  }

  try {
    await bike.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update bike.',
      500
    );
    return next(error);
  }

  res.status(200).json({ bike: bike.toObject({ getters: true }) });
};

const deleteBike = async (req, res, next) => {
  const bikeId = req.params.bid;

  let bike;
  try {
    bike = await Bike.findById(bikeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete bike.',
      500
    );
    return next(error);
  }

  if (!bike) {
    const error = new HttpError('Could not find bike for this id.', 404);
    return next(error);
  }

  const imagePath = bike.image;

  try {
    await bike.remove();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete bike.',
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, err => {
    console.log(err);
  });

  res.status(200).json({ message: 'Deleted bike.' });
};

const reserveBike = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { from, to, userId } = req.body;
  const bikeId = req.params.bid;

  let bike;
  try {
    bike = await Bike.findById(bikeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update bike.',
      500
    );
    return next(error);
  }

  if (!bike) {
    const error = new HttpError('Could not find bike for this id.', 404);
    return next(error);
  }

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Reservation failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }
  
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    bike.reservations.push({userId, from, to, userEmail: user.email});
    await bike.save({ session: sess });
    user.reservedBikes.push(bike);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not reserve bike.',
      500
    );
    return next(error);
  }

  res.status(200).json({ reservations: bike.reservations });
}

const cancelReserveBike = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { reservationId, userId } = req.body;
  const bikeId = req.params.bid;

  let bike;
  try {
    bike = await Bike.findById(bikeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find bike.',
      500
    );
    return next(error);
  }

  if (!bike) {
    const error = new HttpError('Could not find bike for this id.', 404);
    return next(error);
  }

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Cancel reservation failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }
  
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    bike.reservations = bike.reservations.filter(reservation => reservation._id != reservationId);
    await bike.save({ session: sess });
    if (!!user.reservedBikes && user.reservedBikes.length > 0) {
      let reservationIndex = -1;
      user.reservedBikes.forEach((reservedBike, index) => {
        if (reservedBike._id == bikeId && !!reservedBike.reservations && reservedBike.reservations.length > 0) {
          reservedBike.reservations.some(reservation => {
            if (reservation._id == reservationId) {
              return reservationIndex = index;
            }
          })
        }
      });
      console.log("reservationIndex is: ", reservationIndex);
      if (reservationIndex !== -1) {
        user.reservedBikes.splice(reservationIndex, 1);
      }
      await user.save({ session: sess });
    }
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not cancel reservation.',
      500
    );
    return next(error);
  }

  res.status(200).json({ reservations: bike.reservations });
}

exports.getBikeById = getBikeById;
exports.getBikes = getBikes;
exports.createBike = createBike;
exports.updateBike = updateBike;
exports.deleteBike = deleteBike;
exports.reserveBike = reserveBike;
exports.cancelReserveBike = cancelReserveBike;
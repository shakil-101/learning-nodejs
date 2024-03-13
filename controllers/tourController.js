const { json } = require('express');
const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    const queryFields = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryFields[el]);
    // advance query
    let queryString = JSON.stringify(queryFields);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      match => `$${match}`
    );

    const query = Tour.find(JSON.parse(queryString));
    const tours = await query;

    res.status(200).json({
      message: 'Success',
      results: tours.length,
      data: tours
    });
  } catch (err) {
    res.status(404).json({
      message: 'Items Not Found'
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({ message: 'Success', data: tour });
  } catch (err) {
    res.status(404).json({ status: 'Failed', message: 'Item Not Found' });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ message: 'Success', data: tour });
  } catch (err) {
    res.status(404).json({ status: 'Failed', message: 'Item Not Found' });
  }
};

exports.postTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      message: 'New Item created',
      data: newTour
    });
  } catch (err) {
    res.status(400).json({ status: 'Failed', message: 'Error' });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      message: 'Item Deleted'
    });
  } catch (err) {
    res.status(400).json({ status: 'Failed', message: 'Error' });
  }
};

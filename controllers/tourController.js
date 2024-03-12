const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkId = (req, res, next, val) => {
  console.log('param id is :', val);

  if (parseInt(req.params.id) > tours.length) {
    res.status(404).json({ status: 'Fail', message: 'invalid Id' });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res
      .status(404)
      .json({ status: 'Failed', message: 'Name 7 Price fields are required' });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    message: 'Hello server',
    results: tours.length,
    requestedAt: req.requestTime,
    data: tours
  });
};

exports.getTour = (req, res) => {
  const id = parseInt(req.params.id);
  const tour = tours.find(item => item.id === id);

  res.status(200).json({ message: 'Success', data: tour });
};

exports.patchTour = (req, res) => {
  const id = parseInt(req.params.id);
  const tour = tours.find(item => item.id === id);

  res.status(200).json({ message: 'Success', data: tour });
};

exports.postTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        message: 'New Item created',
        data: newTour
      });
    }
  );
};

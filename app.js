const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

// ===== middlewares
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// ===== route handlers

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`)
);

const getAllTours = (req, res) => {
  res.status(200).json({
    message: 'Hello server',
    results: tours.length,
    requestedAt: req.requestTime,
    data: tours
  });
};
const getAllUsers = (req, res) => {
  res.status(200).json({
    message: 'Hello server',
    results: users.length,
    requestedAt: req.requestTime,
    data: users
  });
};

const getTour = (req, res) => {
  const id = parseInt(req.params.id);
  const tour = tours.find(item => item.id === id);

  if (tour) {
    res.status(200).json({ message: 'Success', data: tour });
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
};

const getUser = (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(item => item.id == id);

  if (user) {
    res.status(200).json({ message: 'Success', data: user });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const patchTour = (req, res) => {
  const id = parseInt(req.params.id);
  const tour = tours.find(item => item.id === id);

  if (tour) {
    res.status(200).json({ message: 'Success', data: tour });
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
};
const patchUser = (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(item => item.id === id);

  if (user) {
    res.status(200).json({ message: 'User patched', data: user });
  } else {
    res.status(404).json({ message: 'user not found' });
  }
};

const postTour = (req, res) => {
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
const createUser = (req, res) => {
  const newId = users[users.length - 1].id + 1;
  const newUser = Object.assign({ id: newId }, req.body);

  users.push(newUser);
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    err => {
      res.status(201).json({
        message: 'New user created',
        data: newUser
      });
    }
  );
};
// ======== routes
app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(postTour);

app
  .route(`/api/v1/tours/:id`)
  .get(getTour)
  .patch(patchTour);

app
  .route('/api/v1/users')
  .get(getAllUsers)
  .post(createUser);

app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(patchUser);

// ==== listener
const port = 5000;
app.listen(port, () => {
  console.log(`App running on ${port}`);
});

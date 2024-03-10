const express = require('express');

const fs = require('fs');

const app = express();
app.use(express.json());

// ======== tour data
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// ========= get tours
app.get('/api/v1/tours', (req, res) => {
  res
    .status(200)
    .json({ message: 'Hello server', results: tours.length, data: tours });
});

// ========= post a tour
app.post('/api/v1/tour', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours)
    // err => {
    //   res.status(201).json({ status: 'success', data: newTour });
    // }
  );
});

const port = 5000;
app.listen(port, () => {
  console.log(`App running on ${port}`);
});

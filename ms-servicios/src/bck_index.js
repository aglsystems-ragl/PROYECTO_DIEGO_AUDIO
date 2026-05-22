const express = require('express');
const serviciosController = require('./controllers/serviciosController');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use(serviciosController);

app.listen(3000, () => {
  console.log('Microservicio SERVICIOS ejecutándose en el puerto 3000');
});

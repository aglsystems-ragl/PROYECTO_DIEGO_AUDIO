

const express = require('express');
const clientesController = require('./controllers/clientesController');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use(clientesController);

app.listen(3001, () => {
  console.log('Microservicio CLIENTES ejecutándose en el puerto 3001');
});



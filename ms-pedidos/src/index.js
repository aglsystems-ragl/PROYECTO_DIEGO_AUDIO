const express = require('express');
const pedidosController = require('./controllers/pedidosController');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use(pedidosController);

app.listen(3002, () => {
  console.log('Microservicio PEDIDOS ejecutándose en el puerto 3002');
});
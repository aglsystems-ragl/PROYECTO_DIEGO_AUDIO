const express = require('express');
const pagosController = require('./controllers/pagosController');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Servir PDFs generados
app.use('/facturas', express.static(path.join(__dirname, 'facturas')));

app.use(pagosController);

app.listen(3003, () => {
  console.log('Microservicio PAGOS ejecutándose en el puerto 3003');
});
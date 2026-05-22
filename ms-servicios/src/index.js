const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

//middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

//importar rutas
const serviciosRoutes = require('./controllers/serviciosController');

//usar rutas
app.use(serviciosRoutes);

//puerto
app.listen(3000, () => {
  console.log('Microservicio SERVICIOS ejecutándose en el puerto 3000');
});

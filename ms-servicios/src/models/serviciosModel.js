const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'db_servicios',
  user: 'root',
  password: 'Audio2026@',
  database: 'diegoAudio_db'
});

// Obtener todos los servicios
async function obtenerServicios() {
  const [rows] = await connection.query('SELECT * FROM servicios');
  return rows;
}

// Obtener servicio por ID
async function obtenerServicioPorId(id) {
  const [rows] = await connection.query(
    'SELECT * FROM servicios WHERE id = ?',
    [id]
  );
  return rows[0];
}

// Crear servicio
async function crearServicio(nombre, precio, descripcion) {
  const [result] = await connection.query(
    'INSERT INTO servicios (nombre, precio, descripcion) VALUES (?, ?, ?)',
    [nombre, precio, descripcion]
  );
  return result;
}

// Editar servicio
async function editarServicio(id, nombre, precio, descripcion) {
  const [result] = await connection.query(
    'UPDATE servicios SET nombre = ?, precio = ?, descripcion = ? WHERE id = ?',
    [nombre, precio, descripcion, id]
  );
  return result;
}

// Eliminar servicio
async function eliminarServicio(id) {
  const [result] = await connection.query(
    'DELETE FROM servicios WHERE id = ?',
    [id]
  );
  return result;
}

module.exports = {
  obtenerServicios,
  obtenerServicioPorId,
  crearServicio,
  editarServicio,
  eliminarServicio
};

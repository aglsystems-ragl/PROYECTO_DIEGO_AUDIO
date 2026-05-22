const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'db_clientes',
  user: 'root',
  password: 'Audio2026@',
  database: 'diegoAudio_clientes_db'
});

// Obtener todos los clientes
async function obtenerClientes() {
  const [rows] = await connection.query('SELECT * FROM clientes');
  return rows;
}

// Obtener cliente por ID
async function obtenerClientePorId(id) {
  const [rows] = await connection.query(
    'SELECT * FROM clientes WHERE id = ?',
    [id]
  );
  return rows[0];
}

// Validar cliente por email y password
async function validarCliente(email, password) {
  const [rows] = await connection.query(
    'SELECT * FROM clientes WHERE email = ? AND password = ?',
    [email, password]
  );
  return rows[0];
}

// Crear cliente
async function crearCliente(tipo_documento, numero_documento, nombre, direccion, telefono, email, password) {
  const [result] = await connection.query(
    `INSERT INTO clientes 
    (tipo_documento, numero_documento, nombre, direccion, telefono, email, password)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [tipo_documento, numero_documento, nombre, direccion, telefono, email, password]
  );
  return result;
}

// Editar cliente
async function editarCliente(id, tipo_documento, numero_documento, nombre, direccion, telefono, email, password) {
  const [result] = await connection.query(
    `UPDATE clientes
     SET tipo_documento = ?, numero_documento = ?, nombre = ?, direccion = ?, telefono = ?, email = ?, password = ?
     WHERE id = ?`,
    [tipo_documento, numero_documento, nombre, direccion, telefono, email, password, id]
  );
  return result;
}

// Eliminar cliente
async function eliminarCliente(id) {
  const [result] = await connection.query(
    'DELETE FROM clientes WHERE id = ?',
    [id]
  );
  return result;
}

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  validarCliente,
  crearCliente,
  editarCliente,
  eliminarCliente
};

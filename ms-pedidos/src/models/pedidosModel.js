//var/www/backend/Proy_Diego_Arenas_Audio/pedidos/src/models/pedidosModel.js

const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'db_pedidos',
  user: 'root',
  password: 'Audio2026@',
  database: 'diegoAudio_pedidos_db'
});

// Aquí se define la regla de negocio numero 7, que consiste en que el pedido guarda el estado general del negocio.
async function obtenerPedidos() {
  const [rows] = await connection.query('SELECT * FROM pedidos ORDER BY id DESC');
  return rows;
}

async function obtenerPedidoPorId(id) {
  const [rows] = await connection.query(
    'SELECT * FROM pedidos WHERE id = ?',
    [id]
  );
  return rows[0];
}

async function crearPedido(
  id_cliente,
  nombre_cliente,
  email_cliente,
  servicios_seleccionados,
  precio_total,
  estado_pedido = 'En proceso'
) {
  const [result] = await connection.query(
    `INSERT INTO pedidos
    (id_cliente, nombre_cliente, email_cliente, servicios_seleccionados, precio_total, estado_pedido)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id_cliente,
      nombre_cliente,
      email_cliente,
      servicios_seleccionados,
      precio_total,
      estado_pedido
    ]
  );
  return result;
}
// Hasta aqui llega el codigo de la regla de negocio numero 7.

// Aquí se define la regla de negocio numero 8, que consiste en que un pedido confirmado no se puede editar.
async function editarPedido(id, id_cliente, nombre_cliente, email_cliente, servicios_seleccionados, precio_total) {
  const [result] = await connection.query(
    `UPDATE pedidos
     SET id_cliente = ?, nombre_cliente = ?, email_cliente = ?, servicios_seleccionados = ?, precio_total = ?
     WHERE id = ?`,
    [
      id_cliente,
      nombre_cliente,
      email_cliente,
      servicios_seleccionados,
      precio_total,
      id
    ]
  );
  return result;
}
// Hasta aqui llega el codigo de la regla de negocio numero 8.

// Aquí cambiamos solo el estado del pedido
async function actualizarEstadoPedido(id, estado_pedido) {
  const [result] = await connection.query(
    'UPDATE pedidos SET estado_pedido = ? WHERE id = ?',
    [estado_pedido, id]
  );
  return result;
}

// Aquí se define la regla de negocio numero 9, que consiste en que el pedido no debe eliminarse si ya forma parte del historial de pagos.
async function eliminarPedido(id) {
  const [result] = await connection.query(
    'DELETE FROM pedidos WHERE id = ?',
    [id]
  );
  return result;
}
// Hasta aqui llega el codigo de la regla de negocio numero 9.

module.exports = {
  obtenerPedidos,
  obtenerPedidoPorId,
  crearPedido,
  editarPedido,
  actualizarEstadoPedido,
  eliminarPedido
};

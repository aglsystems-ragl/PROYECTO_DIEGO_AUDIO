//var/www/backend/Proy_Diego_Arenas_Audio/pagos/src/models/pagosModel.js
const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'db_pagos',
  user: 'root',
  password: 'Audio2026@',
  database: 'diegoAudio_pagos_db'
});

// Aquí se define la regla de negocio numero 11, que consiste en conservar y consultar la trazabilidad de los pagos.
// Obtenemos todos los pagos
async function obtenerPagos() {
  const [rows] = await connection.query('SELECT * FROM pagos ORDER BY id DESC');
  return rows;
}

// Buscamos un pago por id
async function obtenerPagoPorId(id) {
  const [rows] = await connection.query(
    'SELECT * FROM pagos WHERE id = ?',
    [id]
  );
  return rows[0];
}

// Obtenemos todos los pagos de un pedido
async function obtenerPagosPorPedido(id_pedido) {
  const [rows] = await connection.query(
    'SELECT * FROM pagos WHERE id_pedido = ? ORDER BY id DESC',
    [id_pedido]
  );
  return rows;
}

// Contamos cuántos intentos de pago ha tenido un pedido
async function contarPagosPorPedido(id_pedido) {
  const [rows] = await connection.query(
    'SELECT COUNT(*) AS total FROM pagos WHERE id_pedido = ?',
    [id_pedido]
  );
  return rows[0].total;
}

// Obtenemos el último pago registrado de un pedido
async function obtenerUltimoPagoPorPedido(id_pedido) {
  const [rows] = await connection.query(
    'SELECT * FROM pagos WHERE id_pedido = ? ORDER BY id DESC LIMIT 1',
    [id_pedido]
  );
  return rows[0] || null;
}
// Hasta aqui llega el codigo de la regla de negocio numero 11.

// Aquí se define la regla de negocio numero 2, que consiste en validar que solo exista un pago exitoso final por pedido.
async function existePagoPagadoPorPedido(id_pedido, excluirId = null) {
  let query = `
    SELECT COUNT(*) AS total
    FROM pagos
    WHERE id_pedido = ?
      AND estado = 'pagado'
  `;

  const params = [id_pedido];

  if (excluirId) {
    query += ' AND id <> ?';
    params.push(excluirId);
  }

  const [rows] = await connection.query(query, params);
  return rows[0].total > 0;
}
// Hasta aqui llega el codigo de la regla de negocio numero 2.

// Aquí se define la regla de negocio numero 6, que consiste en que cada intento de pago crea un nuevo registro.
// Guardamos un pago nuevo
async function crearPago(id_pedido, nombre_cliente, email_cliente, detalle_servicios, total_pago, metodo_pago, estado, ruta_comprobante) {
  const [result] = await connection.query(
    `INSERT INTO pagos
    (id_pedido, nombre_cliente, email_cliente, detalle_servicios, total_pago, metodo_pago, estado, ruta_comprobante)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_pedido, nombre_cliente, email_cliente, detalle_servicios, total_pago, metodo_pago, estado, ruta_comprobante]
  );
  return result;
}
// Hasta aqui llega el codigo de la regla de negocio numero 6.

// Actualizamos la referencia del pago
async function actualizarReferenciaPago(id, referencia_pago) {
  const [result] = await connection.query(
    'UPDATE pagos SET referencia_pago = ? WHERE id = ?',
    [referencia_pago, id]
  );
  return result;
}

// Guardamos la ruta del comprobante
async function actualizarRutaComprobante(id, ruta_comprobante) {
  const [result] = await connection.query(
    'UPDATE pagos SET ruta_comprobante = ? WHERE id = ?',
    [ruta_comprobante, id]
  );
  return result;
}

// Aquí cambiamos el estado del pago
async function actualizarEstadoPago(id, estado) {
  const [result] = await connection.query(
    'UPDATE pagos SET estado = ? WHERE id = ?',
    [estado, id]
  );
  return result;
}

// Eliminamos un pago
async function eliminarPago(id) {
  const [result] = await connection.query(
    'DELETE FROM pagos WHERE id = ?',
    [id]
  );
  return result;
}

module.exports = {
  obtenerPagos,
  obtenerPagoPorId,
  obtenerPagosPorPedido,
  contarPagosPorPedido,
  obtenerUltimoPagoPorPedido,
  existePagoPagadoPorPedido,
  crearPago,
  actualizarReferenciaPago,
  actualizarRutaComprobante,
  actualizarEstadoPago,
  eliminarPago
};

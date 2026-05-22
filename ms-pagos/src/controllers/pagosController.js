//var/www/backend/Proy_Diego_Arenas_Audio/pagos/src/controllers/pagosController.js

const { Router } = require('express');
const router = Router();
const pagosModel = require('../models/pagosModel');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const URL_PEDIDOS = 'http://talleraudio_pedidos:3002/api/pedidos';

// Aqui se define la regla de negocio numero 11, que consiste en conservar y exponer la trazabilidad de pagos.
function parseDetalleServiciosSeguro(detalleServicios) {
  let detalle;

  try {
    detalle = JSON.parse(detalleServicios);
  } catch (error) {
    detalle = detalleServicios;
  }

  return detalle;
}
// Hasta aqui llega el codigo de la regla de negocio numero 11.

// Aqui se define la regla de negocio numero 16, que consiste en que cada pago debe tener referencia unica y comprobante propio.
function generarReferenciaPago(metodo_pago, idPago) {
  let prefijo = 'PAG';

  if (metodo_pago === 'Nequi') {
    prefijo = 'NEQ';
  } else if (metodo_pago === 'Transferencia bancaria') {
    prefijo = 'TRF';
  } else if (metodo_pago === 'Tarjeta de credito') {
    prefijo = 'TDC';
  }

  const consecutivo = String(idPago).padStart(6, '0');
  return `${prefijo}-${consecutivo}`;
}
// Hasta aqui llega el codigo de la regla de negocio numero 16.

// Aqui se define la regla de negocio numero 7, que consiste en que el pedido guarda el estado general del negocio y el pago guarda el detalle transaccional.
function convertirEstadoPagoAPedido(estadoPago) {
  const estado = String(estadoPago || '').trim().toLowerCase();

  if (estado === 'pagado') return 'Confirmado';

  // Aqui se define la regla de negocio numero 5, que consiste en que un pago rechazado o cancelado no cierra el pedido y el pedido permanece en "En proceso".
  if (estado === 'pendiente') return 'En proceso';
  if (estado === 'rechazado') return 'En proceso';
  if (estado === 'cancelado') return 'En proceso';
  // Hasta aqui llega el codigo de la regla de negocio numero 5.

  return null;
}
// Hasta aqui llega el codigo de la regla de negocio numero 7.

function normalizarEstadoPago(estadoPago) {
  const estado = String(estadoPago || '').trim().toLowerCase();

  if (estado === 'pendiente') return 'pendiente';
  if (estado === 'pagado') return 'pagado';
  if (estado === 'rechazado') return 'rechazado';
  if (estado === 'cancelado') return 'cancelado';

  return null;
}

// Aqui se define la regla de negocio numero 10, que consiste en que el backend valida siempre las reglas criticas antes de registrar pagos o modificar pedidos.
function pedidoBloqueadoParaNuevoPago(pedido) {
  const estadoPedido = String(pedido?.estado_pedido || '').trim().toLowerCase();

  if (estadoPedido === 'confirmado') return true;
  if (estadoPedido === 'cancelado') return true;

  return false;
}
// Hasta aqui llega el codigo de la regla de negocio numero 10.

// Aqui se define la regla de negocio numero 15, que consiste en que el backend es quien realmente impone la validacion de las reglas.
async function sincronizarEstadoPedido(idPedido, estadoPago) {
  const estadoPedido = convertirEstadoPagoAPedido(estadoPago);

  if (!estadoPedido) {
    throw new Error('Estado de pago no valido para sincronizar pedido');
  }

  const respuesta = await fetch(`${URL_PEDIDOS}/${idPedido}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado_pedido: estadoPedido })
  });

  const data = await respuesta.json();

  if (!respuesta.ok || data.error) {
    throw new Error(data.error || 'No fue posible actualizar el estado del pedido');
  }

  return data;
}
// Hasta aqui llega el codigo de la regla de negocio numero 15.

// Aqui se define la regla de negocio numero 11, que consiste en conservar y exponer la trazabilidad de intentos de pago.
router.get('/api/pagos', async (req, res) => {
  try {
    const pagos = await pagosModel.obtenerPagos();

    if (!pagos || !Array.isArray(pagos)) {
      console.error('ERROR: pagos no es un arreglo valido:', pagos);
      return res.status(500).json({ error: 'Error interno: datos invalidos al obtener pagos' });
    }

    const pagosFormateados = pagos.map(pago => ({
      ...pago,
      detalle_servicios: parseDetalleServiciosSeguro(pago.detalle_servicios)
    }));

    res.status(200).json(pagosFormateados);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ error: 'Error del servidor al obtener los pagos' });
  }
});

router.get('/api/pagos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await pagosModel.obtenerPagoPorId(id);

    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    pago.detalle_servicios = parseDetalleServiciosSeguro(pago.detalle_servicios);

    res.status(200).json(pago);
  } catch (error) {
    console.error('Error al obtener pago por ID:', error);
    res.status(500).json({ error: 'Error del servidor al obtener el pago' });
  }
});

router.get('/api/pagos/pedido/:id_pedido', async (req, res) => {
  try {
    const { id_pedido } = req.params;
    const pagos = await pagosModel.obtenerPagosPorPedido(id_pedido);

    if (!pagos || !Array.isArray(pagos)) {
      return res.status(500).json({ error: 'Error interno: historial de pagos invalido' });
    }

    const pagosFormateados = pagos.map(pago => ({
      ...pago,
      detalle_servicios: parseDetalleServiciosSeguro(pago.detalle_servicios)
    }));

    res.status(200).json(pagosFormateados);
  } catch (error) {
    console.error('Error al obtener pagos por pedido:', error);
    res.status(500).json({ error: 'Error del servidor al obtener el historial del pedido' });
  }
});
// Hasta aqui llega el codigo de la regla de negocio numero 11.

// Aqui se define la regla de negocio numero 1, que consiste en permitir multiples intentos de pago sobre un mismo pedido.
// Aqui se define la regla de negocio numero 6, que consiste en que cada intento de pago crea un nuevo registro en la tabla pagos.
router.post('/api/pagos', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'No se enviaron datos en el body de la peticion'
      });
    }

    const {
      id_pedido,
      metodo_pago,
      estado
    } = req.body;

    const estadoLimpio = normalizarEstadoPago(estado);

    if (!id_pedido || !metodo_pago || !estadoLimpio) {
      return res.status(400).json({
        error: 'Debe enviar id_pedido, metodo_pago y un estado valido'
      });
    }

    // Aqui se define la regla de negocio numero 10, que consiste en validar desde backend que el pedido exista antes de registrar un pago.
    const respuestaPedido = await fetch(`${URL_PEDIDOS}/${id_pedido}`);
    const pedido = await respuestaPedido.json();

    if (!respuestaPedido.ok || pedido.error) {
      return res.status(404).json({ error: 'Pedido no encontrado en microservicio PEDIDOS' });
    }
    // Hasta aqui llega el codigo de la regla de negocio numero 10.

    // Aqui se define la regla de negocio numero 3, que consiste en que si ya existe un pago exitoso para ese pedido no se permiten mas pagos nuevos.
    if (pedidoBloqueadoParaNuevoPago(pedido)) {
      return res.status(409).json({
        error: 'El pedido ya esta confirmado o cancelado y no admite nuevos pagos'
      });
    }

    const yaExistePagoPagado = await pagosModel.existePagoPagadoPorPedido(pedido.id);

    if (yaExistePagoPagado) {
      return res.status(409).json({
        error: 'El pedido ya tiene un pago exitoso y no admite nuevos pagos'
      });
    }
    // Hasta aqui llega el codigo de la regla de negocio numero 3.

    const carpetaFacturas = path.join(__dirname, '..', 'facturas');
    if (!fs.existsSync(carpetaFacturas)) {
      fs.mkdirSync(carpetaFacturas, { recursive: true });
    }

    const detalleServiciosTexto = JSON.stringify(pedido.servicios_seleccionados);

    const resultado = await pagosModel.crearPago(
      pedido.id,
      pedido.nombre_cliente,
      pedido.email_cliente,
      detalleServiciosTexto,
      pedido.precio_total,
      metodo_pago,
      estadoLimpio,
      ''
    );

    const idPago = resultado.insertId;

    const referencia_pago = generarReferenciaPago(metodo_pago, idPago);
    await pagosModel.actualizarReferenciaPago(idPago, referencia_pago);

    const nombreArchivo = estadoLimpio === 'pagado'
      ? `factura_pago_${idPago}.pdf`
      : `comprobante_${estadoLimpio}_${idPago}.pdf`;

    const rutaArchivo = path.join(carpetaFacturas, nombreArchivo);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(rutaArchivo));

    doc.fontSize(22).text('DIEGO ARENAS AUDIO', { align: 'center' });
    doc.moveDown(0.5);

    if (estadoLimpio === 'pagado') {
      doc.fontSize(16).text('FACTURA DE PAGO', { align: 'center' });
    } else {
      doc.fontSize(16).text(`COMPROBANTE DE PAGO - ESTADO: ${estadoLimpio.toUpperCase()}`, { align: 'center' });
    }

    doc.moveDown();

    doc.fontSize(12).text(`Pago No.: ${idPago}`);
    doc.text(`Referencia de pago: ${referencia_pago}`);
    doc.text(`Pedido No.: ${pedido.id}`);
    doc.text(`Fecha: ${new Date().toLocaleString('es-CO')}`);

    doc.moveDown();
    doc.text(`Cliente: ${pedido.nombre_cliente}`);
    doc.text(`Email: ${pedido.email_cliente}`);

    doc.moveDown();
    doc.text('Servicios contratados:', { underline: true });
    doc.moveDown(0.5);

    if (Array.isArray(pedido.servicios_seleccionados)) {
      pedido.servicios_seleccionados.forEach((servicio, index) => {
        doc.text(`${index + 1}. ${servicio.nombre} - $${Number(servicio.precio).toLocaleString('es-CO')}`);
      });
    }

    doc.moveDown();
    doc.text(`Metodo de pago: ${metodo_pago}`);
    doc.text(`Estado del pago: ${estadoLimpio}`);
    doc.text(`Valor total: $${Number(pedido.precio_total).toLocaleString('es-CO')}`);

    doc.moveDown();
    if (estadoLimpio === 'pagado') {
      doc.text('Gracias por confiar en Diego Arenas Audio.', { align: 'center' });
    } else {
      doc.text(`El pago fue registrado con estado "${estadoLimpio}".`, { align: 'center' });
    }

    doc.end();

    await pagosModel.actualizarRutaComprobante(idPago, `/facturas/${nombreArchivo}`);

    // Aqui se define la regla de negocio numero 13, que consiste en que el primer pago exitoso cierra el ciclo de cobro del pedido.
    await sincronizarEstadoPedido(pedido.id, estadoLimpio);
    // Hasta aqui llega el codigo de la regla de negocio numero 13.

    const cantidadIntentos = await pagosModel.contarPagosPorPedido(pedido.id);

    res.status(201).json({
      mensaje: 'Pago registrado correctamente',
      id: idPago,
      referencia_pago,
      estado: estadoLimpio,
      comprobante: `/facturas/${nombreArchivo}`,
      numero_intento: cantidadIntentos
    });

  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ error: 'Error del servidor al registrar el pago' });
  }
});
// Hasta aqui llega el codigo de las reglas de negocio numero 1 y 6.

// Aqui se define la regla de negocio numero 2, que consiste en que solo puede existir un pago exitoso final para confirmar el pedido.
router.put('/api/pagos/:id/estado', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'No se enviaron datos en el body de la peticion' });
    }

    const { id } = req.params;
    const { estado } = req.body;

    const estadoLimpio = normalizarEstadoPago(estado);

    if (!estadoLimpio) {
      return res.status(400).json({
        error: 'El estado debe ser pendiente, pagado, rechazado o cancelado'
      });
    }

    const pago = await pagosModel.obtenerPagoPorId(id);

    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Aqui se define la regla de negocio numero 13, que consiste en que un pago exitoso final no debe volver a degradarse a otro estado.
    if (String(pago.estado).trim().toLowerCase() === 'pagado' && estadoLimpio !== 'pagado') {
      return res.status(409).json({
        error: 'Un pago ya confirmado no puede cambiarse a otro estado'
      });
    }
    // Hasta aqui llega el codigo de la regla de negocio numero 13.

    if (estadoLimpio === 'pagado') {
      const existeOtroPagoPagado = await pagosModel.existePagoPagadoPorPedido(pago.id_pedido, pago.id);

      if (existeOtroPagoPagado) {
        return res.status(409).json({
          error: 'El pedido ya tiene otro pago exitoso. No se puede marcar este pago como pagado'
        });
      }
    }
    // Hasta aqui llega el codigo de la regla de negocio numero 2.

    const resultado = await pagosModel.actualizarEstadoPago(id, estadoLimpio);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Aqui se define la regla de negocio numero 5, que consiste en que un pago rechazado mantiene el pedido en "En proceso" si no existe un pago exitoso.
    const existePagoPagado = await pagosModel.existePagoPagadoPorPedido(pago.id_pedido);

    if (existePagoPagado) {
      await sincronizarEstadoPedido(pago.id_pedido, 'pagado');
    } else {
      await sincronizarEstadoPedido(pago.id_pedido, estadoLimpio);
    }
    // Hasta aqui llega el codigo de la regla de negocio numero 5.

    res.status(200).json({
      mensaje: 'Estado del pago actualizado con exito',
      id,
      estado: estadoLimpio
    });
  } catch (error) {
    console.error('Error al actualizar estado del pago:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar el estado del pago' });
  }
});

// Aqui se define la regla de negocio numero 11, que consiste en conservar la trazabilidad y evitar perder pagos importantes.
router.delete('/api/pagos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pago = await pagosModel.obtenerPagoPorId(id);

    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    if (String(pago.estado).trim().toLowerCase() === 'pagado') {
      return res.status(409).json({
        error: 'No se puede eliminar un pago exitoso porque hace parte del historial final del pedido'
      });
    }

    const resultado = await pagosModel.eliminarPago(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    const existePagoPagado = await pagosModel.existePagoPagadoPorPedido(pago.id_pedido);

    if (existePagoPagado) {
      await sincronizarEstadoPedido(pago.id_pedido, 'pagado');
    } else {
      await sincronizarEstadoPedido(pago.id_pedido, 'pendiente');
    }

    res.status(200).json({ mensaje: 'Pago eliminado con exito' });
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    res.status(500).json({ error: 'Error del servidor al eliminar el pago' });
  }
});
// Hasta aqui llega el codigo de la regla de negocio numero 11.

module.exports = router;
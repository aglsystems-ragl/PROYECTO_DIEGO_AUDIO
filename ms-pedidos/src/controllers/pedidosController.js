//var/www/backend/Proy_Diego_Arenas_Audio/pedidos/src/controllers/pedidosController.js
const { Router } = require('express');
const router = Router();
const pedidosModel = require('../models/pedidosModel');

// URLs de otros microservicios
const URL_SERVICIOS = 'http://servicios:3000/api/servicios';
const URL_CLIENTES = 'http://clientes:3001/api/clientes';
const URL_PAGOS = 'http://pagos:3003/api/pagos';

// Dejamos el estado limpio por si llega en minúsculas o con espacios
function normalizarEstadoPedido(estado) {
  const valor = String(estado || '').trim().toLowerCase();

  if (valor === 'en proceso') return 'En proceso';
  if (valor === 'confirmado') return 'Confirmado';
  if (valor === 'rechazado') return 'Rechazado';

  return null;
}

// Aquí se define la regla de negocio numero 11, que consiste en consultar y exponer la trazabilidad de pagos desde el pedido.
async function obtenerResumenPagosPedido(idPedido) {
  try {
    const respuesta = await fetch(URL_PAGOS);
    const pagos = await respuesta.json();

    if (!respuesta.ok || !Array.isArray(pagos)) {
      return {
        cantidad_intentos_pago: 0,
        ultimo_estado_pago: null,
        ultimo_pago_id: null
      };
    }

    const historial = pagos
      .filter(pago => Number(pago.id_pedido) === Number(idPedido))
      .sort((a, b) => Number(b.id) - Number(a.id));

    return {
      cantidad_intentos_pago: historial.length,
      ultimo_estado_pago: historial.length > 0 ? historial[0].estado : null,
      ultimo_pago_id: historial.length > 0 ? historial[0].id : null
    };
  } catch (error) {
    return {
      cantidad_intentos_pago: 0,
      ultimo_estado_pago: null,
      ultimo_pago_id: null
    };
  }
}
// Hasta aqui llega el codigo de la regla de negocio numero 11.

// Obtener todos los pedidos
router.get('/api/pedidos', async (req, res) => {
  try {
    const pedidos = await pedidosModel.obtenerPedidos();

    const pedidosFormateados = await Promise.all(
      pedidos.map(async pedido => {
        const resumenPagos = await obtenerResumenPagosPedido(pedido.id);

        return {
          ...pedido,
          servicios_seleccionados: JSON.parse(pedido.servicios_seleccionados),
          ...resumenPagos
        };
      })
    );

    res.status(200).json(pedidosFormateados);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error del servidor al obtener los pedidos' });
  }
});

// Obtener un pedido por ID
router.get('/api/pedidos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await pedidosModel.obtenerPedidoPorId(id);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const resumenPagos = await obtenerResumenPagosPedido(id);

    pedido.servicios_seleccionados = JSON.parse(pedido.servicios_seleccionados);

    res.status(200).json({
      ...pedido,
      ...resumenPagos
    });
  } catch (error) {
    console.error('Error al obtener pedido por ID:', error);
    res.status(500).json({ error: 'Error del servidor al obtener el pedido' });
  }
});

// Crear pedido
router.post('/api/pedidos', async (req, res) => {
  try {
    const { id_cliente, servicios } = req.body;

    if (!id_cliente || !servicios || !Array.isArray(servicios) || servicios.length === 0) {
      return res.status(400).json({
        error: 'Debe enviar id_cliente y un arreglo de servicios'
      });
    }

    const respuestaCliente = await fetch(`${URL_CLIENTES}/${id_cliente}`);
    const cliente = await respuestaCliente.json();

    if (!respuestaCliente.ok || cliente.error) {
      return res.status(404).json({ error: 'Cliente no encontrado en microservicio CLIENTES' });
    }

    let total = 0;
    const detalleServicios = [];

    for (const idServicio of servicios) {
      const respuestaServicio = await fetch(`${URL_SERVICIOS}/${idServicio}`);
      const servicio = await respuestaServicio.json();

      if (!respuestaServicio.ok || servicio.error) {
        return res.status(404).json({
          error: `Servicio con ID ${idServicio} no encontrado en microservicio SERVICIOS`
        });
      }

      total += parseFloat(servicio.precio);

      detalleServicios.push({
        id: servicio.id,
        nombre: servicio.nombre,
        precio: servicio.precio,
        descripcion: servicio.descripcion
      });
    }

    const estadoInicial = 'En proceso';

    const resultado = await pedidosModel.crearPedido(
      cliente.id,
      cliente.nombre,
      cliente.email,
      JSON.stringify(detalleServicios),
      total,
      estadoInicial
    );

    res.status(201).json({
      mensaje: 'Pedido creado con éxito',
      id: resultado.insertId,
      pedido: {
        id: resultado.insertId,
        id_cliente: cliente.id,
        nombre_cliente: cliente.nombre,
        email_cliente: cliente.email,
        servicios_seleccionados: detalleServicios,
        precio_total: total,
        estado_pedido: estadoInicial,
        cantidad_intentos_pago: 0,
        ultimo_estado_pago: null
      }
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: 'Error del servidor al crear el pedido' });
  }
});

// Aquí se define la regla de negocio numero 8, que consiste en que un pedido confirmado no se puede editar.
router.put('/api/pedidos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_cliente, servicios } = req.body;

    if (!id_cliente || !servicios || !Array.isArray(servicios) || servicios.length === 0) {
      return res.status(400).json({
        error: 'Debe enviar id_cliente y un arreglo de servicios'
      });
    }

    const pedidoActual = await pedidosModel.obtenerPedidoPorId(id);

    if (!pedidoActual) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (String(pedidoActual.estado_pedido).trim().toLowerCase() === 'confirmado') {
      return res.status(409).json({
        error: 'Un pedido confirmado no puede editarse'
      });
    }

    const respuestaCliente = await fetch(`${URL_CLIENTES}/${id_cliente}`);
    const cliente = await respuestaCliente.json();

    if (!respuestaCliente.ok || cliente.error) {
      return res.status(404).json({ error: 'Cliente no encontrado en microservicio CLIENTES' });
    }

    let total = 0;
    const detalleServicios = [];

    for (const idServicio of servicios) {
      const respuestaServicio = await fetch(`${URL_SERVICIOS}/${idServicio}`);
      const servicio = await respuestaServicio.json();

      if (!respuestaServicio.ok || servicio.error) {
        return res.status(404).json({
          error: `Servicio con ID ${idServicio} no encontrado en microservicio SERVICIOS`
        });
      }

      total += parseFloat(servicio.precio);

      detalleServicios.push({
        id: servicio.id,
        nombre: servicio.nombre,
        precio: servicio.precio,
        descripcion: servicio.descripcion
      });
    }

    const resultado = await pedidosModel.editarPedido(
      id,
      cliente.id,
      cliente.nombre,
      cliente.email,
      JSON.stringify(detalleServicios),
      total
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.status(200).json({
      mensaje: 'Pedido actualizado con éxito'
    });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar el pedido' });
  }
});
// Hasta aqui llega el codigo de la regla de negocio numero 8.

// Aquí se define la regla de negocio numero 7, que consiste en que el pedido guarda el estado general del negocio.
router.put('/api/pedidos/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_pedido } = req.body;

    const estadoLimpio = normalizarEstadoPedido(estado_pedido);

    if (!estadoLimpio) {
      return res.status(400).json({
        error: 'El estado_pedido debe ser En proceso, Confirmado o Rechazado'
      });
    }

    const resultado = await pedidosModel.actualizarEstadoPedido(id, estadoLimpio);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.status(200).json({
      mensaje: 'Estado del pedido actualizado con éxito',
      id,
      estado_pedido: estadoLimpio
    });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar el estado del pedido' });
  }
});
// Hasta aqui llega el codigo de la regla de negocio numero 7.

// Aquí se define la regla de negocio numero 9, que consiste en que un pedido con historial de pagos no debe eliminarse para no perder trazabilidad.
router.delete('/api/pedidos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pedidoActual = await pedidosModel.obtenerPedidoPorId(id);

    if (!pedidoActual) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const resumenPagos = await obtenerResumenPagosPedido(id);

    if (resumenPagos.cantidad_intentos_pago > 0) {
      return res.status(409).json({
        error: 'No se puede eliminar un pedido que ya tiene historial de pagos'
      });
    }

    const resultado = await pedidosModel.eliminarPedido(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.status(200).json({ mensaje: 'Pedido eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    res.status(500).json({ error: 'Error del servidor al eliminar el pedido' });
  }
});
// Hasta aqui llega el codigo de la regla de negocio numero 9.

module.exports = router;
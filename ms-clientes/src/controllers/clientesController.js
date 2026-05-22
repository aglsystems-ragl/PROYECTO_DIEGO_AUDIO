const { Router } = require('express');
const router = Router();
const clientesModel = require('../models/clientesModel');

// Obtener todos los clientes
router.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await clientesModel.obtenerClientes();
    res.status(200).json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error del servidor al obtener los clientes' });
  }
});

// Obtener un cliente por ID
router.get('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await clientesModel.obtenerClientePorId(id);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.status(200).json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente por ID:', error);
    res.status(500).json({ error: 'Error del servidor al obtener el cliente' });
  }
});

// Validar cliente por email y password
router.get('/api/clientes/login/:email/:password', async (req, res) => {
  try {
    const { email, password } = req.params;
    const cliente = await clientesModel.validarCliente(email, password);

    if (!cliente) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    res.status(200).json({
      mensaje: 'Cliente autenticado correctamente',
      cliente
    });
  } catch (error) {
    console.error('Error al validar cliente:', error);
    res.status(500).json({ error: 'Error del servidor al validar el cliente' });
  }
});

// Crear cliente
router.post('/api/clientes', async (req, res) => {
  try {
    const {
      tipo_documento,
      numero_documento,
      nombre,
      direccion,
      telefono,
      email,
      password
    } = req.body;

    if (
      !tipo_documento ||
      !numero_documento ||
      !nombre ||
      !direccion ||
      !telefono ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        error: 'Debe enviar tipo_documento, numero_documento, nombre, direccion, telefono, email y password'
      });
    }

    const resultado = await clientesModel.crearCliente(
      tipo_documento,
      numero_documento,
      nombre,
      direccion,
      telefono,
      email,
      password
    );

    res.status(201).json({
      mensaje: 'Cliente creado con éxito',
      id: resultado.insertId
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error del servidor al crear el cliente' });
  }
});

// Editar cliente
router.put('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tipo_documento,
      numero_documento,
      nombre,
      direccion,
      telefono,
      email,
      password
    } = req.body;

    if (
      !tipo_documento ||
      !numero_documento ||
      !nombre ||
      !direccion ||
      !telefono ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        error: 'Debe enviar tipo_documento, numero_documento, nombre, direccion, telefono, email y password'
      });
    }

    const resultado = await clientesModel.editarCliente(
      id,
      tipo_documento,
      numero_documento,
      nombre,
      direccion,
      telefono,
      email,
      password
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.status(200).json({ mensaje: 'Cliente actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar el cliente' });
  }
});

// Eliminar cliente
router.delete('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await clientesModel.eliminarCliente(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.status(200).json({ mensaje: 'Cliente eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error del servidor al eliminar el cliente' });
  }
});

module.exports = router;
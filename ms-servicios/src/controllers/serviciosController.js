const { Router } = require('express');
const router = Router();
const serviciosModel = require('../models/serviciosModel');

// Obtener todos los servicios
router.get('/api/servicios', async (req, res) => {
  try {
    const servicios = await serviciosModel.obtenerServicios();
    res.status(200).json(servicios);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ error: 'Error del servidor al obtener los servicios' });
  }
});

// Obtener un servicio por ID
router.get('/api/servicios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await serviciosModel.obtenerServicioPorId(id);

    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.status(200).json(servicio);
  } catch (error) {
    console.error('Error al obtener servicio por ID:', error);
    res.status(500).json({ error: 'Error del servidor al obtener el servicio' });
  }
});

// Crear un servicio
router.post('/api/servicios', async (req, res) => {
  try {
    const { nombre, precio, descripcion } = req.body;

    if (!nombre || precio === undefined || !descripcion) {
      return res.status(400).json({
        error: 'Debe enviar nombre, precio y descripcion'
      });
    }

    const resultado = await serviciosModel.crearServicio(nombre, precio, descripcion);

    res.status(201).json({
      mensaje: 'Servicio creado con éxito',
      id: resultado.insertId
    });
  } catch (error) {
    console.error('Error al insertar servicio:', error);
    res.status(500).json({ error: 'Error del servidor al insertar el servicio' });
  }
});

// Editar un servicio
router.put('/api/servicios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, descripcion } = req.body;

    if (!nombre || precio === undefined || !descripcion) {
      return res.status(400).json({
        error: 'Debe enviar nombre, precio y descripcion'
      });
    }

    const resultado = await serviciosModel.editarServicio(id, nombre, precio, descripcion);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.status(200).json({ mensaje: 'Servicio actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar el servicio' });
  }
});

// Eliminar un servicio
router.delete('/api/servicios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await serviciosModel.eliminarServicio(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.status(200).json({ mensaje: 'Servicio eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({ error: 'Error del servidor al eliminar el servicio' });
  }
});

module.exports = router;
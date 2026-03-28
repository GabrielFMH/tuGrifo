const express = require('express');
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /precios:
 *   get:
 *     summary: Lista todos los reportes de precios
 *     tags: [Precio Reporte]
 *     parameters:
 *       - in: query
 *         name: id_grifo
 *         schema:
 *           type: string
 *       - in: query
 *         name: id_combustible
 *         schema:
 *           type: string
 *       - in: query
 *         name: es_verificado
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de reportes
 *   post:
 *     summary: Crea un nuevo reporte de precio
 *     tags: [Precio Reporte]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_grifo:
 *                 type: string
 *               id_combustible:
 *                 type: string
 *               precio:
 *                 type: number
 *     responses:
 *       201:
 *         description: Reporte creado
 */

/**
 * @swagger
 * /precios/{id}:
 *   get:
 *     summary: Obtiene un reporte por ID
 *     tags: [Precio Reporte]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reporte encontrado
 *       404:
 *         description: Reporte no encontrado
 *   put:
 *     summary: Actualiza un reporte
 *     tags: [Precio Reporte]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reporte actualizado
 *   delete:
 *     summary: Elimina un reporte
 *     tags: [Precio Reporte]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Reporte eliminado
 */

/**
 * GET /precios - Obtener todos los reportes de precios
 */
router.get('/', async (req, res) => {
  try {
    const { id_grifo, id_combustible, id_usuario, es_verificado } = req.query;
    
    let query = supabase
      .from('precio_reporte')
      .select('*')
      .order('fecha_reporte', { ascending: false });

    if (id_grifo) {
      query = query.eq('id_grifo', id_grifo);
    }

    if (id_combustible) {
      query = query.eq('id_combustible', id_combustible);
    }

    if (id_usuario) {
      query = query.eq('id_usuario', id_usuario);
    }

    if (es_verificado !== undefined) {
      query = query.eq('es_verificado', es_verificado === 'true');
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /precios/:id - Obtener un reporte por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('precio_reporte')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /precios - Crear nuevo reporte de precio
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { id_grifo, id_combustible, precio } = req.body;
    const id_usuario = req.user.id;

    const { data, error } = await supabase
      .from('precio_reporte')
      .insert([{
        id_grifo,
        id_combustible,
        id_usuario,
        precio,
        fecha_reporte: new Date().toISOString(),
        es_verificado: false
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /precios/:id - Actualizar reporte de precio
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { precio, es_verificado } = req.body;

    const updates = {};
    if (precio !== undefined) updates.precio = precio;
    if (es_verificado !== undefined) updates.es_verificado = es_verificado;

    const { data, error } = await supabase
      .from('precio_reporte')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /precios/:id - Eliminar reporte de precio
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('precio_reporte')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
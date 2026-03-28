const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

/**
 * @swagger
 * /combustibles:
 *   get:
 *     summary: Lista todos los tipos de combustible
 *     tags: [Combustibles]
 *     responses:
 *       200:
 *         description: Lista de combustibles
 *   post:
 *     summary: Crea un nuevo tipo de combustible
 *     tags: [Combustibles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Combustible creado
 */

/**
 * @swagger
 * /combustibles/{id}:
 *   get:
 *     summary: Obtiene un tipo de combustible por ID
 *     tags: [Combustibles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Combustible encontrado
 *       404:
 *         description: Combustible no encontrado
 *   put:
 *     summary: Actualiza un tipo de combustible
 *     tags: [Combustibles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Combustible actualizado
 *   delete:
 *     summary: Elimina un tipo de combustible
 *     tags: [Combustibles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Combustible eliminado
 */

/**
 * GET /combustibles - Obtener todos los tipos de combustible
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('combustible')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /combustibles/:id - Obtener un tipo de combustible por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('combustible')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Combustible no encontrado' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /combustibles - Crear nuevo tipo de combustible
 */
router.post('/', async (req, res) => {
  try {
    const { nombre } = req.body;

    const { data, error } = await supabase
      .from('combustible')
      .insert([{ nombre }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /combustibles/:id - Actualizar tipo de combustible
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const updates = {};
    if (nombre) updates.nombre = nombre;

    const { data, error } = await supabase
      .from('combustible')
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
 * DELETE /combustibles/:id - Eliminar tipo de combustible
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('combustible')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
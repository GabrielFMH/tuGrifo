const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

/**
 * @swagger
 * /grifos:
 *   get:
 *     summary: Lista todos los grifos
 *     tags: [Grifos]
 *     parameters:
 *       - in: query
 *         name: distrito
 *         schema:
 *           type: string
 *       - in: query
 *         name: empresa_bandera
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de grifos
 *   post:
 *     summary: Crea un nuevo grifo
 *     tags: [Grifos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               direccion:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               empresa_bandera:
 *                 type: string
 *               distrito:
 *                 type: string
 *     responses:
 *       201:
 *         description: Grifo creado
 */

/**
 * @swagger
 * /grifos/{id}:
 *   get:
 *     summary: Obtiene un grifo por ID
 *     tags: [Grifos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Grifo encontrado
 *       404:
 *         description: Grifo no encontrado
 *   put:
 *     summary: Actualiza un grifo
 *     tags: [Grifos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Grifo actualizado
 *   delete:
 *     summary: Elimina un grifo
 *     tags: [Grifos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Grifo eliminado
 */

/**
 * GET /grifos - Obtener todos los grifos
 */
router.get('/', async (req, res) => {
  try {
    const { distrito, empresa_bandera } = req.query;
    
    let query = supabase
      .from('grifo')
      .select('*')
      .order('nombre', { ascending: true });

    if (distrito) {
      query = query.ilike('distrito', `%${distrito}%`);
    }

    if (empresa_bandera) {
      query = query.ilike('empresa_bandera', `%${empresa_bandera}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /grifos/:id - Obtener un grifo por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('grifo')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Grifo no encontrado' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /grifos - Crear nuevo grifo
 */
router.post('/', async (req, res) => {
  try {
    const { nombre, direccion, latitud, longitud, empresa_bandera, distrito } = req.body;

    const { data, error } = await supabase
      .from('grifo')
      .insert([{
        nombre,
        direccion,
        latitud,
        longitud,
        empresa_bandera,
        distrito
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
 * PUT /grifos/:id - Actualizar grifo
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, latitud, longitud, empresa_bandera, distrito } = req.body;

    const updates = {};
    if (nombre) updates.nombre = nombre;
    if (direccion) updates.direccion = direccion;
    if (latitud !== undefined) updates.latitud = latitud;
    if (longitud !== undefined) updates.longitud = longitud;
    if (empresa_bandera) updates.empresa_bandera = empresa_bandera;
    if (distrito) updates.distrito = distrito;

    const { data, error } = await supabase
      .from('grifo')
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
 * DELETE /grifos/:id - Eliminar grifo
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('grifo')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
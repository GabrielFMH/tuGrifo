const express = require('express');
const supabase = require('../config/supabase');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /perfil_usuario:
 *   get:
 *     summary: Lista todos los perfiles de usuario
 *     tags: [Perfil Usuario]
 *     responses:
 *       200:
 *         description: Lista de perfiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PerfilUsuario'
 *   post:
 *     summary: Crea un nuevo perfil de usuario
 *     tags: [Perfil Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               puntos_reputacion:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Perfil creado
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /perfil_usuario/{id}:
 *   get:
 *     summary: Obtiene un perfil por ID
 *     tags: [Perfil Usuario]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerfilUsuario'
 *       404:
 *         description: Perfil no encontrado
 *   put:
 *     summary: Actualiza un perfil
 *     tags: [Perfil Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               puntos_reputacion:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *       403:
 *         description: No autorizado
 *   delete:
 *     summary: Elimina un perfil
 *     tags: [Perfil Usuario]
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
 *         description: Perfil eliminado
 *       403:
 *         description: No autorizado
 */

/**
 * GET /perfil_usuario - Obtener todos los perfiles de usuario
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('perfil_usuario')
      .select('*')
      .order('fecha_registro', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /perfil_usuario/:id - Obtener un perfil por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('perfil_usuario')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /perfil_usuario - Crear nuevo perfil
 * Requiere autenticación
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { username, puntos_reputacion } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('perfil_usuario')
      .insert([{
        id: userId,
        username,
        puntos_reputacion: puntos_reputacion || 0,
        fecha_registro: new Date().toISOString()
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
 * PUT /perfil_usuario/:id - Actualizar perfil
 * Requiere autenticación
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, puntos_reputacion } = req.body;

    // Verificar que el usuario actual es elpropietario del perfil
    if (req.user.id !== id) {
      return res.status(403).json({ error: 'No autorizado para actualizar este perfil' });
    }

    const updates = {};
    if (username) updates.username = username;
    if (puntos_reputacion !== undefined) updates.puntos_reputacion = puntos_reputacion;

    const { data, error } = await supabase
      .from('perfil_usuario')
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
 * DELETE /perfil_usuario/:id - Eliminar perfil
 * Requiere autenticación
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario actual es elpropietario del perfil
    if (req.user.id !== id) {
      return res.status(403).json({ error: 'No autorizado para eliminar este perfil' });
    }

    const { error } = await supabase
      .from('perfil_usuario')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
const supabase = require('../config/supabase');

/**
 * Middleware para verificar autenticación mediante JWT de Supabase
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Error al verificar autenticación' });
  }
};

/**
 * Middleware opcional - no requiere autenticación pero la procesa si está presente
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      req.user = user;
    } catch (error) {
      // Ignorar error si no hay token válido
    }
  }

  next();
};

module.exports = { authenticate, optionalAuth };
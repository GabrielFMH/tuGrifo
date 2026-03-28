require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Rutas
const perfilUsuarioRoutes = require('./routes/perfil_usuario');
const grifoRoutes = require('./routes/grifo');
const combustibleRoutes = require('./routes/combustible');
const precioReporteRoutes = require('./routes/precio_reporte');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GrifoAPI - API de Precios de Combustible',
      version: '1.0.0',
      description: 'API para gestionar estaciones de combustible, precios y reportes en Tacna',
      contact: {
        name: 'API Support',
        email: 'soporte@grifoapi.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        PerfilUsuario: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            username: { type: 'string' },
            puntos_reputacion: { type: 'integer' },
            fecha_registro: { type: 'string', format: 'date-time' }
          }
        },
        Grifo: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nombre: { type: 'string' },
            direccion: { type: 'string' },
            latitud: { type: 'number' },
            longitud: { type: 'number' },
            empresa_bandera: { type: 'string' },
            distrito: { type: 'string' }
          }
        },
        Combustible: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nombre: { type: 'string' }
          }
        },
        PrecioReporte: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            id_grifo: { type: 'string', format: 'uuid' },
            id_combustible: { type: 'string', format: 'uuid' },
            id_usuario: { type: 'string', format: 'uuid' },
            precio: { type: 'number' },
            fecha_reporte: { type: 'string', format: 'date-time' },
            es_verificado: { type: 'boolean' }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());

// Documentación Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta JSON de Swagger
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// Rutas API
app.use('/perfil_usuario', perfilUsuarioRoutes);
app.use('/grifos', grifoRoutes);
app.use('/combustibles', combustibleRoutes);
app.use('/precios', precioReporteRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Documentación Swagger: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
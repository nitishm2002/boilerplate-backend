export default {
  options: {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Medinilife APIs',
        version: '1.0.0',
        description: 'This is a REST API application made with Node,Express and Postgres Database.',
        license: {
          name: 'Licensed Under MIT',
          url: 'https://spdx.org/licenses/MIT.html',
        },
      },
      servers: [
        {
          url: 'http://localhost:9000',
          description: 'Local Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./**/*.ts'],
  },
};

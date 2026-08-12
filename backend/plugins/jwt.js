import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

export default fp(async (fastify) => {
  const secret = process.env.JWT_SECRET || 'supersecretknowhrjwtkey2026!';

  // Register Fastify JWT Plugin
  fastify.register(fastifyJwt, {
    secret: secret,
    sign: {
      expiresIn: '7d', // Token berlaku 7 hari
    },
  });

  // Decorator Authenticate (Cek apakah user mengirim JWT valid)
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ status: 'error', message: 'Unauthorized: Invalid or expired token' });
    }
  });

  // Decorator Authorize Roles (Cek role user)
  fastify.decorate('authorizeRoles', (...allowedRoles) => {
    return async (request, reply) => {
      if (!request.user || !allowedRoles.includes(request.user.roleName)) {
        return reply.code(403).send({
          status: 'error',
          message: `Forbidden: Access denied. Required role: ${allowedRoles.join(', ')}`,
        });
      }
    };
  });
});

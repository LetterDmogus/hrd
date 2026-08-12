import bcrypt from 'bcryptjs';
import { eq, and, isNull } from 'drizzle-orm';
import { users, employees } from '../../src/db/schema.js';

export default async function (fastify, opts) {
  // POST /api/auth/login
  fastify.post('/auth/login', async (request, reply) => {
    const { email, password } = request.body || {};

    if (!email || !password) {
      return reply.code(400).send({ status: 'error', message: 'Email and password are required' });
    }

    try {
      const userList = await fastify.db
        .select()
        .from(users)
        .where(and(eq(users.email, email), isNull(users.deletedAt)))
        .limit(1);

      const user = userList[0];

      if (!user) {
        return reply.code(401).send({ status: 'error', message: 'Invalid email or password' });
      }

      if (!user.isActive) {
        return reply.code(403).send({ status: 'error', message: 'Account is deactivated' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return reply.code(401).send({ status: 'error', message: 'Invalid email or password' });
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        roleName: user.roleName,
        employeeId: user.employeeId,
      };

      const token = fastify.jwt.sign(tokenPayload);

      return {
        status: 'success',
        message: 'Login successful',
        data: {
          token,
          user: tokenPayload,
        },
      };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // GET /api/auth/me
  fastify.get(
    '/auth/me',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      return {
        status: 'success',
        data: {
          user: request.user,
        },
      };
    }
  );

  // GET /api/auth/profile - profile akun yang sedang login
  fastify.get('/auth/profile', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const [profile] = await fastify.db.select({
        userId: users.id, email: users.email, roleName: users.roleName, employeeId: users.employeeId,
        firstName: employees.firstName, lastName: employees.lastName, phone: employees.phone, gender: employees.gender,
        birthDate: employees.birthDate, employeeCode: employees.employeeCode,
      }).from(users).leftJoin(employees, eq(users.employeeId, employees.id)).where(eq(users.id, request.user.id));
      if (!profile) return reply.code(404).send({ status: 'error', message: 'Profile not found' });
      return { status: 'success', data: profile };
    } catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
  });

  // PUT /api/auth/profile - user hanya boleh mengubah akun dan data personalnya sendiri
  fastify.put('/auth/profile', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const body = request.body || {};
    try {
      const [current] = await fastify.db.select({ employeeId: users.employeeId }).from(users).where(eq(users.id, request.user.id));
      if (!current) return reply.code(404).send({ status: 'error', message: 'User not found' });
      if (body.email !== undefined) {
        if (!body.email) return reply.code(400).send({ status: 'error', message: 'Email tidak boleh kosong' });
        await fastify.db.update(users).set({ email: body.email }).where(eq(users.id, request.user.id));
      }
      if (current.employeeId) {
        const employeeData = {};
        for (const key of ['firstName', 'lastName', 'phone', 'gender', 'birthDate']) if (body[key] !== undefined) employeeData[key] = body[key] || null;
        if (Object.keys(employeeData).length) await fastify.db.update(employees).set(employeeData).where(eq(employees.id, current.employeeId));
      }
      return { status: 'success', message: 'Profile berhasil diperbarui' };
    } catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.code === '23505' ? 'Email sudah digunakan' : err.message }); }
  });
}

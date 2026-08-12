import bcrypt from 'bcryptjs';
import { eq, desc, isNull, isNotNull, and } from 'drizzle-orm';
import {
    users,
    employees,
} from '../../src/db/schema.js';

export default async function (fastify, opts) {
    // GET /api/users
    fastify.get(
        '/users',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            try {
                const rawUsers = await fastify.db
                    .select({
                        id: users.id,
                        email: users.email,
                        employeeId: users.employeeId,
                        employeeFirstName: employees.firstName,
                        employeeLastName: employees.lastName,
                        roleName: users.roleName,
                        isActive: users.isActive,
                    })
                    .from(users)
                    .leftJoin(employees, eq(users.employeeId, employees.id))
                    .where(isNull(users.deletedAt))
                    .orderBy(desc(users.createdAt));

                const allUsers = rawUsers.map((u) => ({
                    id: u.id,
                    name: u.employeeFirstName
                        ? `${u.employeeFirstName} ${u.employeeLastName || ''}`.trim()
                        : u.email.split('@')[0],
                    email: u.email,
                    employeeId: u.employeeId,
                    employeeName: u.employeeFirstName
                        ? `${u.employeeFirstName} ${u.employeeLastName || ''}`.trim()
                        : 'Non-Pegawai',
                    roleName: u.roleName,
                    isActive: u.isActive,
                }));

                return { status: 'success', data: allUsers };
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // GET /api/users/:id
    fastify.get(
        '/users/:id',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const { id } = request.params;
            const userIdNum = parseInt(id, 10);

            if (isNaN(userIdNum)) {
                return reply.code(400).send({ status: 'error', message: 'Invalid user ID' });
            }

            try {
                const userDetails = await fastify.db
                    .select({
                        id: users.id,
                        email: users.email,
                        employeeId: users.employeeId,
                        employeeFirstName: employees.firstName,
                        employeeLastName: employees.lastName,
                        roleName: users.roleName,
                        isActive: users.isActive,
                    })
                    .from(users)
                    .leftJoin(employees, eq(users.employeeId, employees.id))
                    .where(and(eq(users.id, userIdNum), isNull(users.deletedAt)))
                    .limit(1);

                if (!userDetails[0]) {
                    return reply.code(404).send({ status: 'error', message: 'User not found' });
                }

                const u = userDetails[0];
                const formattedUser = {
                    id: u.id,
                    name: u.employeeFirstName
                        ? `${u.employeeFirstName} ${u.employeeLastName || ''}`.trim()
                        : u.email.split('@')[0],
                    email: u.email,
                    employeeId: u.employeeId,
                    employeeName: u.employeeFirstName
                        ? `${u.employeeFirstName} ${u.employeeLastName || ''}`.trim()
                        : 'Non-Pegawai',
                    roleName: u.roleName,
                    isActive: u.isActive,
                };

                return {
                    status: 'success',
                    data: formattedUser,
                };
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // POST /api/users
    fastify.post(
        '/users',
        {
            onRequest: [
                fastify.authenticate,
                fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
            ],
        },
        async (request, reply) => {
            const {
                email,
                employeeId,
                roleName,
                isActive,
            } = request.body || {};

            if (!email || !roleName) {
                return reply.code(400).send({
                    status: 'error',
                    message: 'email and roleName are required',
                });
            }

            const passwordHash = await bcrypt.hash("password123", 10);

            try {
                const newUser = await fastify.db
                    .insert(users)
                    .values({
                        email,
                        passwordHash,
                        employeeId: employeeId ? parseInt(employeeId, 10) : null,
                        roleName,
                        isActive: isActive !== undefined ? Boolean(isActive) : true,
                    })
                    .returning();

                return reply.code(201).send({ status: 'success', data: newUser[0] });
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // PUT /api/users/:id
    fastify.put(
        '/users/:id',
        {
            onRequest: [
                fastify.authenticate,
                fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
            ],
        },
        async (request, reply) => {
            const { id } = request.params;
            const userIdNum = parseInt(id, 10);
            const body = request.body || {};

            if (isNaN(userIdNum)) {
                return reply.code(400).send({ status: 'error', message: 'Invalid user ID' });
            }

            try {
                const updateData = {};

                if (body.email !== undefined) updateData.email = body.email;
                if (body.employeeId !== undefined) updateData.employeeId = body.employeeId ? parseInt(body.employeeId, 10) : null;
                if (body.roleName !== undefined) updateData.roleName = body.roleName;
                if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

                const updatedUser = await fastify.db
                    .update(users)
                    .set(updateData)
                    .where(and(eq(users.id, userIdNum), isNull(users.deletedAt)))
                    .returning();

                if (!updatedUser[0]) {
                    return reply.code(404).send({ status: 'error', message: 'User not found' });
                }

                return reply.code(200).send({ status: 'success', data: updatedUser[0] });
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // DELETE /api/users/:id (Soft Delete -> move to Recycle Bin)
    fastify.delete(
        '/users/:id',
        {
            onRequest: [
                fastify.authenticate,
                fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
            ],
        },
        async (request, reply) => {
            const { id } = request.params;
            const userIdNum = parseInt(id, 10);

            if (isNaN(userIdNum)) {
                return reply.code(400).send({ status: 'error', message: 'Invalid user ID' });
            }

            try {
                const deletedUser = await fastify.db
                    .update(users)
                    .set({ deletedAt: new Date() })
                    .where(and(eq(users.id, userIdNum), isNull(users.deletedAt)))
                    .returning();

                if (!deletedUser[0]) {
                    return reply.code(404).send({ status: 'error', message: 'User not found' });
                }

                return reply.code(200).send({ status: 'success', message: 'User dipindahkan ke recycle bin', data: deletedUser[0] });
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // POST /api/users/:id/reset-password
    fastify.post(
        '/users/:id/reset-password',
        {
            onRequest: [
                fastify.authenticate,
                fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
            ],
        },
        async (request, reply) => {
            const { id } = request.params;
            const userIdNum = parseInt(id, 10);

            if (isNaN(userIdNum)) {
                return reply.code(400).send({ status: 'error', message: 'Invalid user ID' });
            }

            try {
                const updatedUser = await fastify.db
                    .update(users)
                    .set({ passwordHash: await bcrypt.hash("password123", 10) })
                    .where(and(eq(users.id, userIdNum), isNull(users.deletedAt)))
                    .returning();

                if (!updatedUser[0]) {
                    return reply.code(404).send({ status: 'error', message: 'User not found' });
                }

                return reply.code(200).send({ status: 'success', message: 'Password reset to password123 successfully', data: updatedUser[0] });
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // Recycle Bin Endpoints
    const adminGuard = { onRequest: [fastify.authenticate, fastify.authorizeRoles('superadmin', 'admin_ti', 'hr')] };

    fastify.get('/users/recycle-bin', adminGuard, async (request, reply) => {
        try {
            const rawUsers = await fastify.db
                .select({
                    id: users.id,
                    email: users.email,
                    employeeFirstName: employees.firstName,
                    employeeLastName: employees.lastName,
                    roleName: users.roleName,
                    deletedAt: users.deletedAt,
                })
                .from(users)
                .leftJoin(employees, eq(users.employeeId, employees.id))
                .where(isNotNull(users.deletedAt))
                .orderBy(desc(users.deletedAt));

            const data = rawUsers.map(u => ({
                id: u.id,
                name: u.employeeFirstName ? `${u.employeeFirstName} ${u.employeeLastName || ''}`.trim() : u.email.split('@')[0],
                email: u.email,
                roleName: u.roleName,
            }));

            return { status: 'success', data };
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ status: 'error', message: err.message });
        }
    });

    fastify.post('/users/:id/restore', adminGuard, async (request, reply) => {
        try {
            const [row] = await fastify.db
                .update(users)
                .set({ deletedAt: null })
                .where(and(eq(users.id, Number(request.params.id)), isNotNull(users.deletedAt)))
                .returning();
            if (!row) return reply.code(404).send({ status: 'error', message: 'User tidak ditemukan di recycle bin' });
            return { status: 'success', data: row };
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ status: 'error', message: err.message });
        }
    });

    fastify.delete('/users/:id/permanent', adminGuard, async (request, reply) => {
        try {
            const [row] = await fastify.db
                .delete(users)
                .where(and(eq(users.id, Number(request.params.id)), isNotNull(users.deletedAt)))
                .returning();
            if (!row) return reply.code(404).send({ status: 'error', message: 'User tidak ditemukan di recycle bin' });
            return { status: 'success', data: row };
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ status: 'error', message: err.message });
        }
    });
}

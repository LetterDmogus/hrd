import { eq, desc, count, and, isNull, isNotNull } from 'drizzle-orm';
import {
    departments,
} from '../../src/db/schema.js';

export default async function (fastify, opts) {
    // GET /api/departments
    fastify.get(
        '/departments',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const page = parseInt(request.query.page, 10) || 1;
            const limit = parseInt(request.query.limit, 10) || 5;
            const offset = (page - 1) * limit;

            try {
                const allDepartments = await fastify.db
                    .select({
                        id: departments.id,
                        code: departments.code,
                        name: departments.name,
                    })
                    .from(departments)
                    .where(isNull(departments.deletedAt))
                    .orderBy(desc(departments.createdAt))
                    .limit(limit)
                    .offset(offset);

                const totalRecordsResult = await fastify.db.select({ value: count() }).from(departments).where(isNull(departments.deletedAt));
                const totalRecords = totalRecordsResult[0].value;
                const totalPages = Math.ceil(totalRecords / limit);

                return {
                    status: 'success',
                    data: allDepartments,
                    pagination: {
                        page,
                        limit,
                        totalRecords,
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPreviousPage: page > 1
                    },
                };
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // GET /api/departments/:id
    fastify.get(
        '/departments/:id',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const { id } = request.params;
            const positionIdNum = parseInt(id, 10);

            if (isNaN(positionIdNum)) {
                return reply.code(400).send({ status: 'error', message: 'Invalid position ID' });
            }

            try {
                const departmentDetails = await fastify.db
                    .select({
                        id: departments.id,
                        code: departments.code,
                        name: departments.name,
                    })
                    .from(departments)
                    .where(and(eq(departments.id, departmentIdNum), isNull(departments.deletedAt)))
                    .limit(1);

                if (!departmentDetails[0]) {
                    return reply.code(404).send({ status: 'error', message: 'Department not found' });
                }

                return {
                    status: 'success',
                    data: departmentDetails[0],
                };
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // POST /api/departments
    fastify.post(
        '/departments',
        {
            onRequest: [
                fastify.authenticate,
                fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
            ],
        },
        async (request, reply) => {
            const {
                code,
                name,
            } = request.body || {};

            if (!code || !name) {
                return reply.code(400).send({
                    status: 'error',
                    message: 'code and name are required',
                });
            }

            try {
                const newDepartment = await fastify.db
                    .insert(departments)
                    .values({
                        code,
                        name,
                    })
                    .returning();

                return reply.code(201).send({ status: 'success', data: newDepartment[0] });
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // PUT /api/departments/:id
    fastify.put(
        '/departments/:id',
        {
            onRequest: [
                fastify.authenticate,
                fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
            ],
        },
        async (request, reply) => {
            const { id } = request.params;
            const departmentIdNum = parseInt(id, 10);
            const body = request.body || {};

            if (isNaN(departmentIdNum)) {
                return reply.code(400).send({ status: 'error', message: 'Invalid department ID' });
            }

            try {
                const updateData = {};

                if (body.code !== undefined) updateData.code = body.code;
                if (body.name !== undefined) updateData.name = body.name;

                const updatedDepartment = await fastify.db
                    .update(departments)
                    .set(updateData)
                    .where(and(eq(departments.id, departmentIdNum), isNull(departments.deletedAt)))
                    .returning();

                if (!updatedDepartment[0]) {
                    return reply.code(404).send({ status: 'error', message: 'Department not found' });
                }

                return reply.code(200).send({ status: 'success', data: updatedDepartment[0] });
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // DELETE /api/departments/:id
    fastify.delete(
        '/departments/:id',
        {
            onRequest: [
                fastify.authenticate,
                fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
            ],
        },
        async (request, reply) => {
            const { id } = request.params;
            const departmentIdNum = parseInt(id, 10);

            if (isNaN(departmentIdNum)) {
                return reply.code(400).send({ status: 'error', message: 'Invalid department ID' });
            }

            try {
                const deletedDepartment = await fastify.db
                    .update(departments)
                    .set({ deletedAt: new Date() })
                    .where(and(eq(departments.id, departmentIdNum), isNull(departments.deletedAt)))
                    .returning();

                if (!deletedDepartment[0]) {
                    return reply.code(404).send({ status: 'error', message: 'Department not found' });
                }

                return reply.code(200).send({ status: 'success', message: 'Department dipindahkan ke recycle bin', data: deletedDepartment[0] });
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    const adminGuard = { onRequest: [fastify.authenticate, fastify.authorizeRoles('superadmin', 'admin_ti', 'hr')] };
    fastify.get('/departments/recycle-bin', adminGuard, async (request, reply) => {
        try { return { status: 'success', data: await fastify.db.select().from(departments).where(isNotNull(departments.deletedAt)).orderBy(desc(departments.deletedAt)) }; }
        catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
    });
    fastify.post('/departments/:id/restore', adminGuard, async (request, reply) => {
        try { const [row] = await fastify.db.update(departments).set({ deletedAt: null }).where(and(eq(departments.id, Number(request.params.id)), isNotNull(departments.deletedAt))).returning(); if (!row) return reply.code(404).send({ status: 'error', message: 'Department tidak ditemukan di recycle bin' }); return { status: 'success', data: row }; }
        catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
    });
    fastify.delete('/departments/:id/permanent', adminGuard, async (request, reply) => {
        try { const [row] = await fastify.db.delete(departments).where(and(eq(departments.id, Number(request.params.id)), isNotNull(departments.deletedAt))).returning(); if (!row) return reply.code(404).send({ status: 'error', message: 'Department tidak ditemukan di recycle bin' }); return { status: 'success', data: row }; }
        catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
    });
}

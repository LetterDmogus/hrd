import { eq, desc, count, isNull, isNotNull, and } from 'drizzle-orm';
import {
    departments,
    positions,
} from '../../src/db/schema.js';

export default async function (fastify, opts) {
    // GET /api/positions
    fastify.get(
        '/positions',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {

            const page = parseInt(request.query.page, 10) || 1;
            const limit = parseInt(request.query.limit, 10) || 5;
            const offset = (page - 1) * limit;

            try {
                const allPositions = await fastify.db
                    .select({
                        id: positions.id,
                        title: positions.title,
                        departmentId: positions.departmentId,
                        department: departments.name,
                        level: positions.level,
                    })
                    .from(positions)
                    .leftJoin(departments, eq(positions.departmentId, departments.id))
                    .where(isNull(positions.deletedAt))
                    .orderBy(desc(positions.createdAt))
                    .limit(limit)
                    .offset(offset);

                const totalRecordsResult = await fastify.db
                    .select({ value: count() })
                    .from(positions)
                    .where(isNull(positions.deletedAt));
                const totalRecords = totalRecordsResult[0].value;
                const totalPages = Math.ceil(totalRecords / limit);

                return {
                    status: 'success',
                    data: allPositions,
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

    // GET /api/positions/:id
    fastify.get(
        '/positions/:id',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const { id } = request.params;
            const positionIdNum = parseInt(id, 10);

            if (isNaN(positionIdNum)) {
                return reply.code(400).send({ status: 'error', message: 'Invalid position ID' });
            }

            try {
                const positionDetails = await fastify.db
                    .select({
                        id: positions.id,
                        title: positions.title,
                        department: departments.name,
                        level: positions.level,
                    })
                    .from(positions)
                    .leftJoin(departments, eq(positions.departmentId, departments.id))
                    .where(and(eq(positions.id, positionIdNum), isNull(positions.deletedAt)))
                    .limit(1);

                if (!positionDetails[0]) {
                    return reply.code(404).send({ status: 'error', message: 'Position not found' });
                }

                return {
                    status: 'success',
                    data: positionDetails[0],
                };
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // POST /api/positions
    fastify.post(
        '/positions',
        {
            onRequest: [
                fastify.authenticate,
                fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
            ],
        },
        async (request, reply) => {
            const {
                title,
                departmentId,
                level,
            } = request.body || {};

            if (!title || !departmentId || !level) {
                return reply.code(400).send({
                    status: 'error',
                    message: 'title, departmentId, and level are required',
                });
            }

            try {
                const newPosition = await fastify.db
                    .insert(positions)
                    .values({
                        title,
                        departmentId: parseInt(departmentId, 10),
                        level,
                    })
                    .returning();

                return reply.code(201).send({ status: 'success', data: newPosition[0] });
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // PUT /api/positions/:id
    fastify.put(
        '/positions/:id',
        {
            onRequest: [
                fastify.authenticate,
                fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
            ],
        },
        async (request, reply) => {
            const { id } = request.params;
            const positionIdNum = parseInt(id, 10);
            const body = request.body || {};

            if (isNaN(positionIdNum)) {
                return reply.code(400).send({ status: 'error', message: 'Invalid position ID' });
            }

            try {
                const updateData = { updatedAt: new Date() };

                if (body.title !== undefined) updateData.title = body.title;
                if (body.departmentId !== undefined) updateData.departmentId = parseInt(body.departmentId, 10);
                if (body.level !== undefined) updateData.level = body.level;

                const updatedPosition = await fastify.db
                    .update(positions)
                    .set(updateData)
                    .where(and(eq(positions.id, positionIdNum), isNull(positions.deletedAt)))
                    .returning();

                if (!updatedPosition[0]) {
                    return reply.code(404).send({ status: 'error', message: 'Position not found' });
                }

                return reply.code(200).send({ status: 'success', data: updatedPosition[0] });
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // DELETE /api/positions/:id (Soft Delete -> move to Recycle Bin)
    fastify.delete(
        '/positions/:id',
        {
            onRequest: [
                fastify.authenticate,
                fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
            ],
        },
        async (request, reply) => {
            const { id } = request.params;
            const positionIdNum = parseInt(id, 10);

            if (isNaN(positionIdNum)) {
                return reply.code(400).send({ status: 'error', message: 'Invalid position ID' });
            }

            try {
                const deletedPosition = await fastify.db
                    .update(positions)
                    .set({ deletedAt: new Date() })
                    .where(and(eq(positions.id, positionIdNum), isNull(positions.deletedAt)))
                    .returning();

                if (!deletedPosition[0]) {
                    return reply.code(404).send({ status: 'error', message: 'Position not found' });
                }

                return reply.code(200).send({ status: 'success', message: 'Position dipindahkan ke recycle bin', data: deletedPosition[0] });
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // Recycle Bin Endpoints
    const adminGuard = { onRequest: [fastify.authenticate, fastify.authorizeRoles('superadmin', 'admin_ti', 'hr')] };

    fastify.get('/positions/recycle-bin', adminGuard, async (request, reply) => {
        try {
            const data = await fastify.db
                .select({
                    id: positions.id,
                    title: positions.title,
                    department: departments.name,
                    level: positions.level,
                    deletedAt: positions.deletedAt,
                })
                .from(positions)
                .leftJoin(departments, eq(positions.departmentId, departments.id))
                .where(isNotNull(positions.deletedAt))
                .orderBy(desc(positions.deletedAt));
            return { status: 'success', data };
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ status: 'error', message: err.message });
        }
    });

    fastify.post('/positions/:id/restore', adminGuard, async (request, reply) => {
        try {
            const [row] = await fastify.db
                .update(positions)
                .set({ deletedAt: null })
                .where(and(eq(positions.id, Number(request.params.id)), isNotNull(positions.deletedAt)))
                .returning();
            if (!row) return reply.code(404).send({ status: 'error', message: 'Position tidak ditemukan di recycle bin' });
            return { status: 'success', data: row };
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ status: 'error', message: err.message });
        }
    });

    fastify.delete('/positions/:id/permanent', adminGuard, async (request, reply) => {
        try {
            const [row] = await fastify.db
                .delete(positions)
                .where(and(eq(positions.id, Number(request.params.id)), isNotNull(positions.deletedAt)))
                .returning();
            if (!row) return reply.code(404).send({ status: 'error', message: 'Position tidak ditemukan di recycle bin' });
            return { status: 'success', data: row };
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ status: 'error', message: err.message });
        }
    });
}

import { eq, desc, count, and, isNull, isNotNull } from 'drizzle-orm';
import {
    trainings,
} from '../../src/db/schema.js';

export default async function (fastify, opts) {
    // GET /api/trainings
    fastify.get(
        '/trainings',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const page = parseInt(request.query.page, 10) || 1;
            const limit = parseInt(request.query.limit, 10) || 5;
            const offset = (page - 1) * limit;

            try {
                const allTrainings = await fastify.db
                    .select({
                        id: trainings.id,
                        title: trainings.title,
                        category: trainings.category,
                        provider: trainings.provider,
                        durationHours: trainings.durationHours,
                    })
                    .from(trainings)
                    .where(isNull(trainings.deletedAt))
                    .orderBy(desc(trainings.createdAt))
                    .limit(limit)
                    .offset(offset);

                const totalRecordsResult = await fastify.db.select({ value: count() }).from(trainings).where(isNull(trainings.deletedAt));
                const totalRecords = totalRecordsResult[0].value;
                const totalPages = Math.ceil(totalRecords / limit);

                return {
                    status: 'success',
                    data: allTrainings,
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

    // GET /api/trainings/:id
    fastify.get(
        '/trainings/:id',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const { id } = request.params;
            const positionIdNum = parseInt(id, 10);

            if (isNaN(positionIdNum)) {
                return reply.code(400).send({ status: 'error', message: 'Invalid position ID' });
            }

            try {
                const trainingDetails = await fastify.db
                    .select({
                        id: trainings.id,
                        title: trainings.title,
                        category: trainings.category,
                        provider: trainings.provider,
                        durationHours: trainings.durationHours,
                    })
                    .from(trainings)
                    .where(and(eq(trainings.id, positionIdNum), isNull(trainings.deletedAt)))
                    .limit(1);

                if (!trainingDetails[0]) {
                    return reply.code(404).send({ status: 'error', message: 'Training not found' });
                }

                return {
                    status: 'success',
                    data: trainingDetails[0],
                };
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // POST /api/trainings
    fastify.post(
        '/trainings',
        {
            onRequest: [
                fastify.authenticate,
                fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
            ],
        },
        async (request, reply) => {
            const {
                title,
                category,
                provider,
                durationHours,
            } = request.body || {};

            if (!title || !category || !provider || !durationHours) {
                return reply.code(400).send({
                    status: 'error',
                    message: 'title, category, provider, durationHours are required',
                });
            }

            try {
                const newTraining = await fastify.db
                    .insert(trainings)
                    .values({
                        title,
                        category,
                        provider,
                        durationHours,
                    })
                    .returning();

                return reply.code(201).send({ status: 'success', data: newTraining[0] });
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // PUT /api/trainings/:id
    fastify.put(
        '/trainings/:id',
        {
            onRequest: [
                fastify.authenticate,
                fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
            ],
        },
        async (request, reply) => {
            const { id } = request.params;
            const trainingIdNum = parseInt(id, 10);
            const body = request.body || {};

            if (isNaN(trainingIdNum)) {
                return reply.code(400).send({ status: 'error', message: 'Invalid training ID' });
            }

            try {
                const updateData = { updatedAt: new Date() };

                if (body.title !== undefined) updateData.title = body.title;
                if (body.category !== undefined) updateData.category = body.category;
                if (body.provider !== undefined) updateData.provider = body.provider;
                if (body.durationHours !== undefined) updateData.durationHours = body.durationHours;

                const updatedTraining = await fastify.db
                    .update(trainings)
                    .set(updateData)
                    .where(and(eq(trainings.id, trainingIdNum), isNull(trainings.deletedAt)))
                    .returning();

                if (!updatedTraining[0]) {
                    return reply.code(404).send({ status: 'error', message: 'Training not found' });
                }

                return reply.code(200).send({ status: 'success', data: updatedTraining[0] });
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    // DELETE /api/trainings/:id
    fastify.delete(
        '/trainings/:id',
        {
            onRequest: [
                fastify.authenticate,
                fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
            ],
        },
        async (request, reply) => {
            const { id } = request.params;
            const trainingIdNum = parseInt(id, 10);

            if (isNaN(trainingIdNum)) {
                return reply.code(400).send({ status: 'error', message: 'Invalid training ID' });
            }

            try {
                const deletedTraining = await fastify.db
                    .update(trainings)
                    .set({ deletedAt: new Date() })
                    .where(and(eq(trainings.id, trainingIdNum), isNull(trainings.deletedAt)))
                    .returning();

                if (!deletedTraining[0]) {
                    return reply.code(404).send({ status: 'error', message: 'Training not found' });
                }

                return reply.code(200).send({ status: 'success', message: 'Training dipindahkan ke recycle bin', data: deletedTraining[0] });
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ status: 'error', message: err.message });
            }
        }
    );

    const adminGuard = { onRequest: [fastify.authenticate, fastify.authorizeRoles('superadmin', 'admin_ti', 'hr')] };
    fastify.get('/trainings/recycle-bin', adminGuard, async (request, reply) => {
        try { return { status: 'success', data: await fastify.db.select().from(trainings).where(isNotNull(trainings.deletedAt)).orderBy(desc(trainings.deletedAt)) }; }
        catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
    });
    fastify.post('/trainings/:id/restore', adminGuard, async (request, reply) => {
        try { const [row] = await fastify.db.update(trainings).set({ deletedAt: null }).where(and(eq(trainings.id, Number(request.params.id)), isNotNull(trainings.deletedAt))).returning(); if (!row) return reply.code(404).send({ status: 'error', message: 'Training tidak ditemukan di recycle bin' }); return { status: 'success', data: row }; }
        catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
    });
    fastify.delete('/trainings/:id/permanent', adminGuard, async (request, reply) => {
        try { const [row] = await fastify.db.delete(trainings).where(and(eq(trainings.id, Number(request.params.id)), isNotNull(trainings.deletedAt))).returning(); if (!row) return reply.code(404).send({ status: 'error', message: 'Training tidak ditemukan di recycle bin' }); return { status: 'success', data: row }; }
        catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
    });
}

import { and, desc, eq, sql, count, isNull, isNotNull } from 'drizzle-orm';
import { surveys, surveyResponses, employees, users, evaluationPeriods } from '../../src/db/schema.js';

const adminRoles = ['superadmin', 'admin_ti', 'hr'];

export default async function (fastify) {
  const adminGuard = { onRequest: [fastify.authenticate, fastify.authorizeRoles(...adminRoles)] };

  fastify.get('/surveys', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      const [user] = await fastify.db.select({ employeeId: users.employeeId }).from(users).where(eq(users.id, userId));

      const rows = await fastify.db.select({
        id: surveys.id,
        title: surveys.title,
        periodId: surveys.periodId,
        periodCode: evaluationPeriods.periodCode,
        periodName: evaluationPeriods.name,
        isAnonymous: surveys.isAnonymous,
        isActive: surveys.isActive,
        createdAt: surveys.createdAt,
        responseCount: count(surveyResponses.id),
      })
      .from(surveys)
      .leftJoin(evaluationPeriods, eq(surveys.periodId, evaluationPeriods.id))
      .leftJoin(surveyResponses, and(eq(surveys.id, surveyResponses.surveyId), isNull(surveyResponses.deletedAt)))
      .where(isNull(surveys.deletedAt))
      .groupBy(surveys.id, evaluationPeriods.periodCode, evaluationPeriods.name)
      .orderBy(desc(surveys.createdAt));

      let userResponses = [];
      if (user?.employeeId) {
        userResponses = await fastify.db
          .select({ surveyId: surveyResponses.surveyId })
          .from(surveyResponses)
          .where(and(eq(surveyResponses.employeeId, user.employeeId), isNull(surveyResponses.deletedAt)));
      }

      const submittedSurveyIds = new Set(userResponses.map(r => r.surveyId));

      const data = rows.map(r => ({
        ...r,
        isSubmitted: submittedSurveyIds.has(r.id),
      }));

      return { status: 'success', data };
    } catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
  });

  fastify.post('/surveys', adminGuard, async (request, reply) => {
    const { title, periodId, isAnonymous = false, isActive = true } = request.body || {};
    if (!title || !periodId) return reply.code(400).send({ status: 'error', message: 'title and periodId are required' });
    try {
      const [row] = await fastify.db.insert(surveys).values({
        title,
        periodId: Number(periodId),
        isAnonymous: Boolean(isAnonymous),
        isActive: Boolean(isActive)
      }).returning();
      return reply.code(201).send({ status: 'success', data: row });
    } catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
  });

  // GET /api/surveys/recycle-bin (Harus di atas /surveys/:id)
  fastify.get('/surveys/recycle-bin', adminGuard, async (request, reply) => {
    try {
      const rows = await fastify.db.select({
        id: surveys.id,
        title: surveys.title,
        periodId: surveys.periodId,
        periodCode: evaluationPeriods.periodCode,
        deletedAt: surveys.deletedAt,
      })
      .from(surveys)
      .leftJoin(evaluationPeriods, eq(surveys.periodId, evaluationPeriods.id))
      .where(isNotNull(surveys.deletedAt))
      .orderBy(desc(surveys.deletedAt));

      return { status: 'success', data: rows };
    } catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
  });

  fastify.put('/surveys/:id', adminGuard, async (request, reply) => {
    const id = Number(request.params.id); const body = request.body || {};
    if (!Number.isInteger(id)) return reply.code(400).send({ status: 'error', message: 'Invalid survey ID' });
    try {
      const [row] = await fastify.db.update(surveys).set({
        title: body.title,
        periodId: Number(body.periodId),
        isAnonymous: Boolean(body.isAnonymous),
        isActive: Boolean(body.isActive)
      }).where(eq(surveys.id, id)).returning();
      if (!row) return reply.code(404).send({ status: 'error', message: 'Survey not found' });
      return { status: 'success', data: row };
    } catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
  });

  fastify.delete('/surveys/:id', adminGuard, async (request, reply) => {
    const id = Number(request.params.id); if (!Number.isInteger(id)) return reply.code(400).send({ status: 'error', message: 'Invalid survey ID' });
    try { const [row] = await fastify.db.update(surveys).set({ deletedAt: new Date(), isActive: false }).where(and(eq(surveys.id, id), isNull(surveys.deletedAt))).returning(); if (!row) return reply.code(404).send({ status: 'error', message: 'Survey not found' }); return { status: 'success', message: 'Survey dipindahkan ke recycle bin', data: row }; }
    catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
  });

  fastify.get('/surveys/:id/responses', adminGuard, async (request, reply) => {
    const id = Number(request.params.id); if (!Number.isInteger(id)) return reply.code(400).send({ status: 'error', message: 'Invalid survey ID' });
    try {
      const [survey] = await fastify.db.select({ id: surveys.id, title: surveys.title, isAnonymous: surveys.isAnonymous }).from(surveys).where(and(eq(surveys.id, id), isNull(surveys.deletedAt)));
      if (!survey) return reply.code(404).send({ status: 'error', message: 'Survey not found' });
      const rows = await fastify.db.select({ id: surveyResponses.id, employeeId: surveyResponses.employeeId, employeeName: sql`concat(${employees.firstName}, ' ', coalesce(${employees.lastName}, ''))`, jobSatisfactionScore: surveyResponses.jobSatisfactionScore, workEnvironmentScore: surveyResponses.workEnvironmentScore, workLifeBalanceScore: surveyResponses.workLifeBalanceScore, feedbackText: surveyResponses.feedbackText, submittedAt: surveyResponses.submittedAt }).from(surveyResponses).leftJoin(employees, eq(surveyResponses.employeeId, employees.id)).where(eq(surveyResponses.surveyId, id)).orderBy(desc(surveyResponses.submittedAt));
      return { status: 'success', data: { survey, responses: rows } };
    } catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
  });

  fastify.post('/surveys/:id/responses', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const surveyId = Number(request.params.id); const body = request.body || {}; const userId = request.user?.id;
    const scores = ['jobSatisfactionScore', 'workEnvironmentScore', 'workLifeBalanceScore'];
    if (!Number.isInteger(surveyId) || scores.some(key => !Number.isInteger(Number(body[key])) || Number(body[key]) < 1 || Number(body[key]) > 5)) return reply.code(400).send({ status: 'error', message: 'All scores must be integers from 1 to 5' });
    try {
      const [survey] = await fastify.db.select().from(surveys).where(and(eq(surveys.id, surveyId), eq(surveys.isActive, true), isNull(surveys.deletedAt)));
      if (!survey) return reply.code(404).send({ status: 'error', message: 'Active survey not found' });
      const [user] = await fastify.db.select({ employeeId: users.employeeId }).from(users).where(eq(users.id, userId));
      if (!survey.isAnonymous && !user?.employeeId) return reply.code(400).send({ status: 'error', message: 'Akun belum terhubung ke karyawan' });
      if (!survey.isAnonymous && user?.employeeId) { const [existing] = await fastify.db.select({ id: surveyResponses.id }).from(surveyResponses).where(and(eq(surveyResponses.surveyId, surveyId), eq(surveyResponses.employeeId, user.employeeId))); if (existing) return reply.code(409).send({ status: 'error', message: 'Anda sudah mengisi survey ini' }); }
      const [row] = await fastify.db.insert(surveyResponses).values({ surveyId, employeeId: survey.isAnonymous ? null : user?.employeeId || null, jobSatisfactionScore: Number(body.jobSatisfactionScore), workEnvironmentScore: Number(body.workEnvironmentScore), workLifeBalanceScore: Number(body.workLifeBalanceScore), feedbackText: body.feedbackText || null }).returning();
      return reply.code(201).send({ status: 'success', data: row });
    } catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
  });

  fastify.post('/surveys/:id/restore', adminGuard, async (request, reply) => {
    const id = Number(request.params.id);
    try { const [row] = await fastify.db.update(surveys).set({ deletedAt: null, isActive: false }).where(and(eq(surveys.id, id), isNotNull(surveys.deletedAt))).returning(); if (!row) return reply.code(404).send({ status: 'error', message: 'Survey tidak ditemukan di recycle bin' }); return { status: 'success', data: row }; }
    catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
  });

  fastify.delete('/surveys/:id/permanent', adminGuard, async (request, reply) => {
    const id = Number(request.params.id);
    try { const [row] = await fastify.db.delete(surveys).where(and(eq(surveys.id, id), isNotNull(surveys.deletedAt))).returning(); if (!row) return reply.code(404).send({ status: 'error', message: 'Survey tidak ditemukan di recycle bin' }); return { status: 'success', message: 'Survey dihapus permanen', data: row }; }
    catch (err) { fastify.log.error(err); return reply.code(500).send({ status: 'error', message: err.message }); }
  });
}

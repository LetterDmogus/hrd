import { sql, eq } from 'drizzle-orm';
import {
  aiRecommendations,
  aiProductivityAnalyses,
  aiTurnoverPredictions,
  surveyResponses,
  surveys,
  employeeTrainings,
  trainings,
  promotions,
  salaryHistories,
  performanceEvaluations,
  leaveRequests,
  attendances,
  evaluationPeriods,
  users,
  roles,
  employees,
  positions,
  departments,
  appSettings,
} from '../../src/db/schema.js';

export default async function (fastify, opts) {
  const superadminGuard = {
    onRequest: [
      fastify.authenticate,
      fastify.authorizeRoles('superadmin', 'admin_ti'),
    ],
  };

  // GET /api/system/settings (Public / Authenticated: Load App & Company Settings)
  fastify.get('/system/settings', async (request, reply) => {
    try {
      const rows = await fastify.db.select().from(appSettings).limit(1);
      const settings = rows[0] || {
        appName: 'KnowHR',
        companyName: 'PT KnowHR Platform Indonesia',
        companyAddress: 'Jl. Jendral Sudirman No. 45, Jakarta Selatan, 12190',
        companyPhone: '+62 21 555 1234',
        companyEmail: 'contact@knowhr.id',
        copyrightText: '© 2026 KnowHR Platform. All rights reserved.',
      };
      return { status: 'success', data: settings };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // PUT /api/system/settings (Superadmin/Admin TI Only: Update App & Company Settings)
  fastify.put('/system/settings', superadminGuard, async (request, reply) => {
    const { appName, companyName, companyAddress, companyPhone, companyEmail, copyrightText } = request.body || {};
    try {
      const existing = await fastify.db.select().from(appSettings).limit(1);
      let updated;
      if (existing.length > 0) {
        [updated] = await fastify.db
          .update(appSettings)
          .set({
            appName: appName || existing[0].appName,
            companyName: companyName || existing[0].companyName,
            companyAddress: companyAddress || existing[0].companyAddress,
            companyPhone: companyPhone || existing[0].companyPhone,
            companyEmail: companyEmail || existing[0].companyEmail,
            copyrightText: copyrightText || existing[0].copyrightText,
            updatedAt: new Date(),
          })
          .where(eq(appSettings.id, existing[0].id))
          .returning();
      } else {
        [updated] = await fastify.db
          .insert(appSettings)
          .values({
            appName: appName || 'KnowHR',
            companyName: companyName || 'PT KnowHR Platform Indonesia',
            companyAddress: companyAddress || 'Jl. Jendral Sudirman No. 45, Jakarta Selatan, 12190',
            companyPhone: companyPhone || '+62 21 555 1234',
            companyEmail: companyEmail || 'contact@knowhr.id',
            copyrightText: copyrightText || '© 2026 KnowHR Platform. All rights reserved.',
          })
          .returning();
      }
      return { status: 'success', data: updated };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // GET /api/system/backup (Export Backup Database JSON)
  fastify.get('/system/backup', superadminGuard, async (request, reply) => {
    try {
      const [
        deptData,
        posData,
        empData,
        roleData,
        userData,
        periodData,
        attnData,
        evalData,
        salData,
        promData,
        trnData,
        empTrnData,
        srvData,
        srvRData,
        predData,
        prodData,
        recData,
      ] = await Promise.all([
        fastify.db.select().from(departments),
        fastify.db.select().from(positions),
        fastify.db.select().from(employees),
        fastify.db.select().from(roles),
        fastify.db.select().from(users),
        fastify.db.select().from(evaluationPeriods),
        fastify.db.select().from(attendances),
        fastify.db.select().from(performanceEvaluations),
        fastify.db.select().from(salaryHistories),
        fastify.db.select().from(promotions),
        fastify.db.select().from(trainings),
        fastify.db.select().from(employeeTrainings),
        fastify.db.select().from(surveys),
        fastify.db.select().from(surveyResponses),
        fastify.db.select().from(aiTurnoverPredictions),
        fastify.db.select().from(aiProductivityAnalyses),
        fastify.db.select().from(aiRecommendations),
      ]);

      const backupObj = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        tables: {
          departments: deptData,
          positions: posData,
          employees: empData,
          roles: roleData,
          users: userData,
          evaluationPeriods: periodData,
          attendances: attnData,
          performanceEvaluations: evalData,
          salaryHistories: salData,
          promotions: promData,
          trainings: trnData,
          employeeTrainings: empTrnData,
          surveys: srvData,
          surveyResponses: srvRData,
          aiTurnoverPredictions: predData,
          aiProductivityAnalyses: prodData,
          aiRecommendations: recData,
        },
      };

      const filename = `backup_hrd_${new Date().toISOString().slice(0, 10)}.json`;
      reply.header('Content-Type', 'application/json');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      return backupObj;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // POST /api/system/reset (Reset Database & Seed Akun Utama Superadmin)
  fastify.post('/system/reset', superadminGuard, async (request, reply) => {
    const { confirmText } = request.body || {};
    if (confirmText !== 'RESET DATABASE') {
      return reply.code(400).send({
        status: 'error',
        message: 'Konfirmasi tidak sesuai. Harap ketik "RESET DATABASE".',
      });
    }

    try {
      // Hapus data operasional dan transaksi (TRUNCATE cascading / delete sequentially)
      await fastify.db.delete(aiRecommendations);
      await fastify.db.delete(aiProductivityAnalyses);
      await fastify.db.delete(aiTurnoverPredictions);
      await fastify.db.delete(surveyResponses);
      await fastify.db.delete(employeeTrainings);
      await fastify.db.delete(salaryHistories);
      await fastify.db.delete(promotions);
      await fastify.db.delete(performanceEvaluations);
      await fastify.db.delete(leaveRequests);
      await fastify.db.delete(attendances);
      await fastify.db.delete(evaluationPeriods);

      return {
        status: 'success',
        message: 'Data operasional, absensi, evaluasi KPI, dan hasil scan AI berhasil di-reset.',
      };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });
}

import { eq, desc, count, isNull, isNotNull, and, sql } from 'drizzle-orm';
import {
  attendances,
  performanceEvaluations,
  employeeTrainings,
  salaryHistories,
  promotions,
  employees,
  trainings,
  departments,
  positions,
} from '../../src/db/schema.js';

export default async function (fastify, opts) {
  const adminGuard = {
    onRequest: [
      fastify.authenticate,
      fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
    ],
  };

  // ==========================================
  // 1. KEHADIRAN (ATTENDANCES)
  // ==========================================

  // GET /api/operational/attendances
  fastify.get('/operational/attendances', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const { periodId } = request.query;

    try {
      let whereConditions = [isNull(attendances.deletedAt)];

      if (periodId) {
        const [period] = await fastify.db
          .select()
          .from(evaluationPeriods)
          .where(eq(evaluationPeriods.id, parseInt(periodId, 10)));

        if (period && period.startDate && period.endDate) {
          whereConditions.push(sql`${attendances.date} >= ${period.startDate} AND ${attendances.date} <= ${period.endDate}`);
        }
      }

      const data = await fastify.db
        .select({
          id: attendances.id,
          employeeId: attendances.employeeId,
          employeeCode: employees.employeeCode,
          employeeName: sql`${employees.firstName} || ' ' || COALESCE(${employees.lastName}, '')`,
          departmentName: departments.name,
          date: attendances.date,
          checkIn: attendances.checkIn,
          checkOut: attendances.checkOut,
          lateMinutes: attendances.lateMinutes,
          overtimeHours: attendances.overtimeHours,
          status: attendances.status,
        })
        .from(attendances)
        .innerJoin(employees, eq(attendances.employeeId, employees.id))
        .leftJoin(departments, eq(employees.departmentId, departments.id))
        .where(and(...whereConditions))
        .orderBy(desc(attendances.date), desc(attendances.id))
        .limit(limit)
        .offset(offset);

      const totalResult = await fastify.db.select({ value: count() }).from(attendances).where(and(...whereConditions));
      const totalRecords = totalResult[0].value;
      const totalPages = Math.ceil(totalRecords / limit);

      return {
        status: 'success',
        data,
        pagination: { page, limit, totalRecords, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
      };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // POST /api/operational/attendances (Catat / Batch Catat Kehadiran)
  fastify.post('/operational/attendances', adminGuard, async (request, reply) => {
    const body = request.body || {};
    const items = Array.isArray(body.items) ? body.items : [body];

    try {
      const inserted = [];
      for (const item of items) {
        if (!item.employeeId || !item.date) continue;
        const [row] = await fastify.db
          .insert(attendances)
          .values({
            employeeId: parseInt(item.employeeId, 10),
            date: item.date,
            checkIn: item.checkIn || '08:00',
            checkOut: item.checkOut || '17:00',
            lateMinutes: parseInt(item.lateMinutes || 0, 10),
            overtimeHours: String(item.overtimeHours || '0.00'),
            status: item.status || 'present',
          })
          .returning();
        if (row) inserted.push(row);
      }
      return reply.code(201).send({ status: 'success', message: `${inserted.length} data kehadiran berhasil ditambahkan`, data: inserted });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // DELETE /api/operational/attendances/:id
  fastify.delete('/operational/attendances/:id', adminGuard, async (request, reply) => {
    try {
      const [row] = await fastify.db.delete(attendances).where(eq(attendances.id, Number(request.params.id))).returning();
      if (!row) return reply.code(404).send({ status: 'error', message: 'Data tidak ditemukan' });
      return { status: 'success', data: row };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // ==========================================
  // 2. EVALUASI KPI & PERFORMANCE
  // ==========================================

  // GET /api/operational/evaluations
  fastify.get('/operational/evaluations', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const { periodId, period: periodCodeParam } = request.query;

    try {
      let whereConditions = [isNull(performanceEvaluations.deletedAt)];

      let targetPeriodCode = periodCodeParam;
      if (periodId && !targetPeriodCode) {
        const [p] = await fastify.db
          .select()
          .from(evaluationPeriods)
          .where(eq(evaluationPeriods.id, parseInt(periodId, 10)));
        if (p) targetPeriodCode = p.periodCode;
      }

      if (targetPeriodCode) {
        whereConditions.push(eq(performanceEvaluations.period, targetPeriodCode));
      }

      const data = await fastify.db
        .select({
          id: performanceEvaluations.id,
          employeeId: performanceEvaluations.employeeId,
          employeeCode: employees.employeeCode,
          employeeName: sql`${employees.firstName} || ' ' || COALESCE(${employees.lastName}, '')`,
          departmentName: departments.name,
          period: performanceEvaluations.period,
          kpiScore: performanceEvaluations.kpiScore,
          workloadScore: performanceEvaluations.workloadScore,
          rating: performanceEvaluations.rating,
          notes: performanceEvaluations.notes,
          evaluatedAt: performanceEvaluations.evaluatedAt,
        })
        .from(performanceEvaluations)
        .innerJoin(employees, eq(performanceEvaluations.employeeId, employees.id))
        .leftJoin(departments, eq(employees.departmentId, departments.id))
        .where(and(...whereConditions))
        .orderBy(desc(performanceEvaluations.evaluatedAt), desc(performanceEvaluations.id))
        .limit(limit)
        .offset(offset);

      const totalResult = await fastify.db.select({ value: count() }).from(performanceEvaluations).where(and(...whereConditions));
      const totalRecords = totalResult[0].value;
      const totalPages = Math.ceil(totalRecords / limit);

      return {
        status: 'success',
        data,
        pagination: { page, limit, totalRecords, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
      };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // POST /api/operational/evaluations
  fastify.post('/operational/evaluations', adminGuard, async (request, reply) => {
    const { employeeId, period, kpiScore, workloadScore, rating, notes, evaluatedAt } = request.body || {};
    if (!employeeId || !period || kpiScore === undefined) {
      return reply.code(400).send({ status: 'error', message: 'employeeId, period, and kpiScore are required' });
    }

    try {
      const [row] = await fastify.db
        .insert(performanceEvaluations)
        .values({
          employeeId: parseInt(employeeId, 10),
          evaluatorId: request.user.id,
          period,
          kpiScore: String(kpiScore),
          workloadScore: String(workloadScore || 5),
          rating: rating || (kpiScore >= 85 ? 'exceeds' : kpiScore >= 70 ? 'meets' : 'needs_improvement'),
          notes,
          evaluatedAt: evaluatedAt || new Date().toISOString().slice(0, 10),
        })
        .returning();

      return reply.code(201).send({ status: 'success', data: row });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // DELETE /api/operational/evaluations/:id
  fastify.delete('/operational/evaluations/:id', adminGuard, async (request, reply) => {
    try {
      const [row] = await fastify.db.delete(performanceEvaluations).where(eq(performanceEvaluations.id, Number(request.params.id))).returning();
      if (!row) return reply.code(404).send({ status: 'error', message: 'Data evaluasi tidak ditemukan' });
      return { status: 'success', data: row };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // ==========================================
  // 3. RIWAYAT PELATIHAN KARYAWAN (EMPLOYEE TRAININGS)
  // ==========================================

  // GET /api/operational/employee-trainings
  fastify.get('/operational/employee-trainings', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    try {
      const data = await fastify.db
        .select({
          id: employeeTrainings.id,
          employeeId: employeeTrainings.employeeId,
          employeeCode: employees.employeeCode,
          employeeName: sql`${employees.firstName} || ' ' || COALESCE(${employees.lastName}, '')`,
          departmentName: departments.name,
          trainingId: employeeTrainings.trainingId,
          trainingTitle: trainings.title,
          trainingCategory: trainings.category,
          status: employeeTrainings.status,
          score: employeeTrainings.score,
          completionDate: employeeTrainings.completionDate,
        })
        .from(employeeTrainings)
        .innerJoin(employees, eq(employeeTrainings.employeeId, employees.id))
        .innerJoin(trainings, eq(employeeTrainings.trainingId, trainings.id))
        .leftJoin(departments, eq(employees.departmentId, departments.id))
        .where(isNull(employeeTrainings.deletedAt))
        .orderBy(desc(employeeTrainings.createdAt))
        .limit(limit)
        .offset(offset);

      const totalResult = await fastify.db.select({ value: count() }).from(employeeTrainings).where(isNull(employeeTrainings.deletedAt));
      const totalRecords = totalResult[0].value;
      const totalPages = Math.ceil(totalRecords / limit);

      return {
        status: 'success',
        data,
        pagination: { page, limit, totalRecords, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
      };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // POST /api/operational/employee-trainings (Tugaskan / Update Pelatihan Karyawan)
  fastify.post('/operational/employee-trainings', adminGuard, async (request, reply) => {
    const { employeeId, trainingId, status, score, completionDate } = request.body || {};
    if (!employeeId || !trainingId) {
      return reply.code(400).send({ status: 'error', message: 'employeeId and trainingId are required' });
    }

    try {
      const [row] = await fastify.db
        .insert(employeeTrainings)
        .values({
          employeeId: parseInt(employeeId, 10),
          trainingId: parseInt(trainingId, 10),
          status: status || 'enrolled',
          score: score ? String(score) : null,
          completionDate: completionDate || null,
        })
        .returning();

      return reply.code(201).send({ status: 'success', data: row });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // PUT /api/operational/employee-trainings/:id (Update Status/Nilai Pelatihan)
  fastify.put('/operational/employee-trainings/:id', adminGuard, async (request, reply) => {
    const { id } = request.params;
    const { status, score, completionDate } = request.body || {};

    try {
      const updateData = {};
      if (status) updateData.status = status;
      if (score !== undefined) updateData.score = score ? String(score) : null;
      if (completionDate !== undefined) updateData.completionDate = completionDate || null;
      if (status === 'completed' && !completionDate) {
        updateData.completionDate = new Date().toISOString().slice(0, 10);
      }

      const [row] = await fastify.db
        .update(employeeTrainings)
        .set(updateData)
        .where(eq(employeeTrainings.id, Number(id)))
        .returning();

      if (!row) return reply.code(404).send({ status: 'error', message: 'Data penugasan pelatihan tidak ditemukan' });
      return { status: 'success', message: 'Status penugasan pelatihan berhasil diperbarui', data: row };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // DELETE /api/operational/employee-trainings/:id
  fastify.delete('/operational/employee-trainings/:id', adminGuard, async (request, reply) => {
    try {
      const [row] = await fastify.db.delete(employeeTrainings).where(eq(employeeTrainings.id, Number(request.params.id))).returning();
      if (!row) return reply.code(404).send({ status: 'error', message: 'Data keikutsertaan pelatihan tidak ditemukan' });
      return { status: 'success', data: row };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // ==========================================
  // 4. RIWAYAT GAJI & PROMOSI
  // ==========================================

  // GET /api/operational/salary-histories
  fastify.get('/operational/salary-histories', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const data = await fastify.db
        .select({
          id: salaryHistories.id,
          employeeId: salaryHistories.employeeId,
          employeeCode: employees.employeeCode,
          employeeName: sql`${employees.firstName} || ' ' || COALESCE(${employees.lastName}, '')`,
          departmentName: departments.name,
          oldSalary: salaryHistories.oldSalary,
          newSalary: salaryHistories.newSalary,
          incrementPercentage: salaryHistories.incrementPercentage,
          effectiveDate: salaryHistories.effectiveDate,
          reason: salaryHistories.reason,
        })
        .from(salaryHistories)
        .innerJoin(employees, eq(salaryHistories.employeeId, employees.id))
        .leftJoin(departments, eq(employees.departmentId, departments.id))
        .where(isNull(salaryHistories.deletedAt))
        .orderBy(desc(salaryHistories.effectiveDate));

      return { status: 'success', data };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // POST /api/operational/salary-histories (Catat Kenaikan Gaji)
  fastify.post('/operational/salary-histories', adminGuard, async (request, reply) => {
    const { employeeId, oldSalary, newSalary, effectiveDate, reason } = request.body || {};
    if (!employeeId || !newSalary) {
      return reply.code(400).send({ status: 'error', message: 'employeeId and newSalary are required' });
    }

    try {
      const oldSal = parseFloat(oldSalary || 0);
      const newSal = parseFloat(newSalary);
      const incrementPercentage = oldSal > 0 ? (((newSal - oldSal) / oldSal) * 100).toFixed(2) : '0.00';

      const [row] = await fastify.db
        .insert(salaryHistories)
        .values({
          employeeId: parseInt(employeeId, 10),
          oldSalary: String(oldSal),
          newSalary: String(newSal),
          incrementPercentage: String(incrementPercentage),
          effectiveDate: effectiveDate || new Date().toISOString().slice(0, 10),
          reason,
        })
        .returning();

      // Update gaji terbaru di tabel employees
      await fastify.db.update(employees).set({ currentSalary: String(newSal) }).where(eq(employees.id, parseInt(employeeId, 10)));

      return reply.code(201).send({ status: 'success', data: row });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // DELETE /api/operational/salary-histories/:id
  fastify.delete('/operational/salary-histories/:id', adminGuard, async (request, reply) => {
    try {
      const [row] = await fastify.db.delete(salaryHistories).where(eq(salaryHistories.id, Number(request.params.id))).returning();
      if (!row) return reply.code(404).send({ status: 'error', message: 'Data riwayat gaji tidak ditemukan' });
      return { status: 'success', data: row };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // GET /api/operational/promotions
  fastify.get('/operational/promotions', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const data = await fastify.db
        .select({
          id: promotions.id,
          employeeId: promotions.employeeId,
          employeeCode: employees.employeeCode,
          employeeName: sql`${employees.firstName} || ' ' || COALESCE(${employees.lastName}, '')`,
          oldDepartmentId: promotions.oldDepartmentId,
          newDepartmentId: promotions.newDepartmentId,
          oldPositionId: promotions.oldPositionId,
          newPositionId: promotions.newPositionId,
          promotionDate: promotions.promotionDate,
          reason: promotions.notes,
          previousPositionTitle: sql`old_pos.title`,
          newPositionTitle: sql`new_pos.title`,
          previousDepartmentName: sql`old_dept.name`,
          newDepartmentName: sql`new_dept.name`,
        })
        .from(promotions)
        .innerJoin(employees, eq(promotions.employeeId, employees.id))
        .leftJoin(sql`positions old_pos`, sql`${promotions.oldPositionId} = old_pos.id`)
        .leftJoin(sql`positions new_pos`, sql`${promotions.newPositionId} = new_pos.id`)
        .leftJoin(sql`departments old_dept`, sql`${promotions.oldDepartmentId} = old_dept.id`)
        .leftJoin(sql`departments new_dept`, sql`${promotions.newDepartmentId} = new_dept.id`)
        .where(isNull(promotions.deletedAt))
        .orderBy(desc(promotions.promotionDate));

      return { status: 'success', data };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // POST /api/operational/promotions (Catat Promosi Karyawan)
  fastify.post('/operational/promotions', adminGuard, async (request, reply) => {
    const { employeeId, newDepartmentId, newPositionId, promotionDate, notes } = request.body || {};
    if (!employeeId || (!newDepartmentId && !newPositionId)) {
      return reply.code(400).send({ status: 'error', message: 'employeeId and newDepartmentId/newPositionId are required' });
    }

    try {
      const [emp] = await fastify.db.select().from(employees).where(eq(employees.id, parseInt(employeeId, 10)));
      if (!emp) return reply.code(404).send({ status: 'error', message: 'Karyawan tidak ditemukan' });

      const [row] = await fastify.db
        .insert(promotions)
        .values({
          employeeId: parseInt(employeeId, 10),
          oldDepartmentId: emp.departmentId,
          newDepartmentId: newDepartmentId ? parseInt(newDepartmentId, 10) : emp.departmentId,
          oldPositionId: emp.positionId,
          newPositionId: newPositionId ? parseInt(newPositionId, 10) : emp.positionId,
          promotionDate: promotionDate || new Date().toISOString().slice(0, 10),
          notes,
        })
        .returning();

      // Update jabatan/departemen terbaru di tabel employees
      const empUpdateData = {};
      if (newDepartmentId) empUpdateData.departmentId = parseInt(newDepartmentId, 10);
      if (newPositionId) empUpdateData.positionId = parseInt(newPositionId, 10);
      await fastify.db.update(employees).set(empUpdateData).where(eq(employees.id, parseInt(employeeId, 10)));

      return reply.code(201).send({ status: 'success', data: row });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // DELETE /api/operational/promotions/:id
  fastify.delete('/operational/promotions/:id', adminGuard, async (request, reply) => {
    try {
      const [row] = await fastify.db.delete(promotions).where(eq(promotions.id, Number(request.params.id))).returning();
      if (!row) return reply.code(404).send({ status: 'error', message: 'Data promosi tidak ditemukan' });
      return { status: 'success', data: row };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });
}

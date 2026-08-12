import { eq, desc, count, sql, isNull, and } from 'drizzle-orm';
import {
  employees,
  departments,
  positions,
  evaluationPeriods,
  aiTurnoverPredictions,
} from '../../src/db/schema.js';

export default async function (fastify, opts) {
  // GET /api/analytics/periods (Master Periode Evaluasi & Scan AI)
  fastify.get('/analytics/periods', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      let periods = await fastify.db
        .select()
        .from(evaluationPeriods)
        .where(isNull(evaluationPeriods.deletedAt))
        .orderBy(desc(evaluationPeriods.startDate));

      // Seeder otomatis jika tabel periode masih kosong
      if (!periods || periods.length === 0) {
        const seeded = await fastify.db
          .insert(evaluationPeriods)
          .values([
            { periodCode: '2026-Q1', name: 'Kuartal I 2026 (Jan - Mar)', startDate: '2026-01-01', endDate: '2026-03-31', status: 'active' },
            { periodCode: '2026-Q2', name: 'Kuartal II 2026 (Apr - Jun)', startDate: '2026-04-01', endDate: '2026-06-30', status: 'active' },
            { periodCode: '2026-Q3', name: 'Kuartal III 2026 (Jul - Sep)', startDate: '2026-07-01', endDate: '2026-09-30', status: 'active' },
            { periodCode: '2026-Q4', name: 'Kuartal IV 2026 (Okt - Des)', startDate: '2026-10-01', endDate: '2026-12-31', status: 'active' },
          ])
          .returning();
        periods = seeded;
      }

      return { status: 'success', data: periods };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // PUT /api/analytics/periods/:id (Update Periode Evaluasi)
  fastify.put('/analytics/periods/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    const { periodCode, name, startDate, endDate, status } = request.body || {};

    try {
      const updateData = {};
      if (periodCode) updateData.periodCode = periodCode.trim().toUpperCase();
      if (name) updateData.name = name;
      if (startDate) updateData.startDate = startDate;
      if (endDate) updateData.endDate = endDate;
      if (status) updateData.status = status;

      const [row] = await fastify.db
        .update(evaluationPeriods)
        .set(updateData)
        .where(eq(evaluationPeriods.id, parseInt(id, 10)))
        .returning();

      if (!row) return reply.code(404).send({ status: 'error', message: 'Periode evaluasi tidak ditemukan' });
      return { status: 'success', message: 'Periode evaluasi berhasil diperbarui', data: row };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // DELETE /api/analytics/periods/:id (Soft Delete)
  fastify.delete('/analytics/periods/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    try {
      const [row] = await fastify.db
        .update(evaluationPeriods)
        .set({ deletedAt: new Date() })
        .where(eq(evaluationPeriods.id, parseInt(id, 10)))
        .returning();

      if (!row) return reply.code(404).send({ status: 'error', message: 'Periode evaluasi tidak ditemukan' });
      return { status: 'success', message: 'Periode evaluasi dipindahkan ke recycle bin', data: row };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // GET /api/analytics/periods/recycle-bin
  fastify.get('/analytics/periods/recycle-bin', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const rows = await fastify.db.select().from(evaluationPeriods).where(sql`${evaluationPeriods.deletedAt} IS NOT NULL`).orderBy(desc(evaluationPeriods.deletedAt));
      return { status: 'success', data: rows };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // POST /api/analytics/periods/:id/restore
  fastify.post('/analytics/periods/:id/restore', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const [row] = await fastify.db.update(evaluationPeriods).set({ deletedAt: null }).where(eq(evaluationPeriods.id, Number(request.params.id))).returning();
      if (!row) return reply.code(404).send({ status: 'error', message: 'Periode tidak ditemukan' });
      return { status: 'success', data: row };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  // DELETE /api/analytics/periods/:id/permanent
  fastify.delete('/analytics/periods/:id/permanent', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const [row] = await fastify.db.delete(evaluationPeriods).where(eq(evaluationPeriods.id, Number(request.params.id))).returning();
      if (!row) return reply.code(404).send({ status: 'error', message: 'Periode tidak ditemukan' });
      return { status: 'success', data: row };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });
  // GET /api/analytics/summary
  fastify.get(
    '/analytics/summary',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const totalEmp = await fastify.db
          .select({ count: count() })
          .from(employees)
          .where(isNull(employees.deletedAt));

        const totalDept = await fastify.db
          .select({ count: count() })
          .from(departments)
          .where(isNull(departments.deletedAt));

        // Count karyawan berisiko resign dari prediksi TERBARU per karyawan saja
        const allPredictions = await fastify.db
          .select({
            employeeId: aiTurnoverPredictions.employeeId,
            riskLevel: aiTurnoverPredictions.riskLevel,
            createdAt: aiTurnoverPredictions.createdAt,
          })
          .from(aiTurnoverPredictions)
          .where(isNull(aiTurnoverPredictions.deletedAt));

        const latestByEmployee = new Map();
        for (const p of allPredictions) {
          const prev = latestByEmployee.get(p.employeeId);
          if (!prev || new Date(p.createdAt).getTime() > new Date(prev.createdAt).getTime()) {
            latestByEmployee.set(p.employeeId, p);
          }
        }

        let highRiskCount = 0;
        for (const p of latestByEmployee.values()) {
          if (p.riskLevel === 'high' || p.riskLevel === 'critical') highRiskCount += 1;
        }

        return {
          status: 'success',
          data: {
            totalEmployees: totalEmp[0]?.count || 0,
            totalDepartments: totalDept[0]?.count || 0,
            highRiskCount,
          },
        };
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ status: 'error', message: err.message });
      }
    }
  );

  // GET /api/analytics/turnover-risk
  fastify.get(
    '/analytics/turnover-risk',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const periodId = request.query.periodId;
        const month = request.query.month; // fallback legacy
        let whereClause = isNull(aiTurnoverPredictions.deletedAt);

        if (periodId) {
          whereClause = and(whereClause, eq(aiTurnoverPredictions.periodId, parseInt(periodId, 10)));
        } else if (month) {
          whereClause = and(whereClause, sql`to_char(${aiTurnoverPredictions.createdAt}, 'YYYY-MM') = ${month}`);
        }

        const riskList = await fastify.db
          .select({
            predictionId: aiTurnoverPredictions.id,
            employeeId: employees.id,
            employeeCode: employees.employeeCode,
            employeeName: sql`${employees.firstName} || ' ' || COALESCE(${employees.lastName}, '')`,
            departmentName: departments.name,
            periodId: aiTurnoverPredictions.periodId,
            riskScore: aiTurnoverPredictions.riskScore,
            riskLevel: aiTurnoverPredictions.riskLevel,
            primaryRiskFactors: aiTurnoverPredictions.primaryRiskFactors,
            predictionDate: aiTurnoverPredictions.predictionDate,
            createdAt: aiTurnoverPredictions.createdAt,
          })
          .from(aiTurnoverPredictions)
          .innerJoin(employees, eq(aiTurnoverPredictions.employeeId, employees.id))
          .leftJoin(departments, eq(employees.departmentId, departments.id))
          .where(whereClause)
          .orderBy(desc(aiTurnoverPredictions.createdAt));

        return { status: 'success', data: riskList };
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ status: 'error', message: err.message });
      }
    }
  );

  // GET /api/analytics/quarterly-risk (Analisis Risiko Resign per Kuartal dari Data Tersimpan)
  fastify.get(
    '/analytics/quarterly-risk',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const [predictions, periods] = await Promise.all([
          fastify.db
            .select({
              employeeId: aiTurnoverPredictions.employeeId,
              periodId: aiTurnoverPredictions.periodId,
              riskLevel: aiTurnoverPredictions.riskLevel,
              createdAt: aiTurnoverPredictions.createdAt,
              departmentName: departments.name,
            })
            .from(aiTurnoverPredictions)
            .innerJoin(employees, eq(aiTurnoverPredictions.employeeId, employees.id))
            .leftJoin(departments, eq(employees.departmentId, departments.id))
            .where(
              and(
                isNull(aiTurnoverPredictions.deletedAt),
                sql`${aiTurnoverPredictions.periodId} IS NOT NULL`
              )
            ),
          fastify.db
            .select()
            .from(evaluationPeriods)
            .where(isNull(evaluationPeriods.deletedAt))
            .orderBy(evaluationPeriods.startDate),
        ]);

        const periodMap = new Map(periods.map(p => [p.id, p]));

        // Smart selection: per periode hanya pakai prediksi TERBARU per karyawan
        const latestByPeriod = new Map();
        for (const row of predictions) {
          const pid = row.periodId;
          if (!latestByPeriod.has(pid)) latestByPeriod.set(pid, new Map());
          const empMap = latestByPeriod.get(pid);
          const prev = empMap.get(row.employeeId);
          if (!prev || new Date(row.createdAt).getTime() > new Date(prev.createdAt).getTime()) {
            empMap.set(row.employeeId, row);
          }
        }

        // Buat hasil ringkasan untuk SETIAP periode evaluasi (meski belum ada scan)
        const result = periods.map(period => {
          const empMap = latestByPeriod.get(period.id) || new Map();

          const deptMap = new Map();
          let total = 0;
          let highRisk = 0;
          for (const row of empMap.values()) {
            total += 1;
            const isHigh = row.riskLevel === 'high' || row.riskLevel === 'critical';
            if (isHigh) highRisk += 1;
            const name = row.departmentName || 'Tanpa Divisi';
            if (!deptMap.has(name)) deptMap.set(name, { total: 0, highRisk: 0 });
            const d = deptMap.get(name);
            d.total += 1;
            if (isHigh) d.highRisk += 1;
          }

          const departments = Array.from(deptMap.entries())
            .map(([name, d]) => ({
              name,
              total: d.total,
              highRisk: d.highRisk,
              highRiskPct: d.total ? Math.round((d.highRisk / d.total) * 1000) / 10 : 0,
            }))
            .sort((a, b) => b.highRiskPct - a.highRiskPct || b.highRisk - a.highRisk);

          return {
            id: period.id,
            periodCode: period.periodCode,
            name: period.name,
            startDate: period.startDate,
            endDate: period.endDate,
            total,
            highRisk,
            highRiskPct: total ? Math.round((highRisk / total) * 1000) / 10 : 0,
            departments,
          };
        });

        result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        // Default: periode yang mencakup hari ini, fallback ke periode terbaru yang punya data
        const todayStr = new Date().toISOString().slice(0, 10);
        let defaultPeriodId = null;
        for (const p of result) {
          if (p.startDate <= todayStr && todayStr <= p.endDate) {
            defaultPeriodId = p.id;
            break;
          }
        }
        if (defaultPeriodId == null && result.length) {
          defaultPeriodId = result[result.length - 1].id;
        }

        return { status: 'success', data: { defaultPeriodId, periods: result } };
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ status: 'error', message: err.message });
      }
    }
  );

  // GET /api/analytics/scan/:id (Detail 1 Scan Record Spesifik)
  fastify.get(
    '/analytics/scan/:id',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const record = await fastify.db
          .select({
            predictionId: aiTurnoverPredictions.id,
            employeeId: employees.id,
            employeeCode: employees.employeeCode,
            firstName: employees.firstName,
            lastName: employees.lastName,
            departmentName: departments.name,
            positionTitle: positions.title,
            riskScore: aiTurnoverPredictions.riskScore,
            riskLevel: aiTurnoverPredictions.riskLevel,
            primaryRiskFactors: aiTurnoverPredictions.primaryRiskFactors,
            predictionDate: aiTurnoverPredictions.predictionDate,
            createdAt: aiTurnoverPredictions.createdAt,
          })
          .from(aiTurnoverPredictions)
          .innerJoin(employees, eq(aiTurnoverPredictions.employeeId, employees.id))
          .leftJoin(departments, eq(employees.departmentId, departments.id))
          .leftJoin(positions, eq(employees.positionId, positions.id))
          .where(eq(aiTurnoverPredictions.id, parseInt(id, 10)))
          .limit(1);

        if (!record || record.length === 0) {
          return reply.code(404).send({ status: 'error', message: 'Record scan tidak ditemukan' });
        }

        const r = record[0];
        const employeeName = `${r.firstName} ${r.lastName || ''}`.trim();

        return {
          status: 'success',
          data: {
            predictionId: r.predictionId,
            employeeId: r.employeeId,
            employeeCode: r.employeeCode,
            employeeName,
            departmentName: r.departmentName,
            positionTitle: r.positionTitle || '-',
            riskScore: r.riskScore,
            riskLevel: r.riskLevel,
            primaryRiskFactors: r.primaryRiskFactors,
            predictionDate: r.predictionDate,
            createdAt: r.createdAt,
          }
        };
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ status: 'error', message: err.message });
      }
    }
  );

  // POST /api/analytics/scan (Simpan/Replace Hasil Scan AI ke DB: 1 Karyawan 1 Scan per Periode)
  fastify.post(
    '/analytics/scan',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const { items, periodId } = request.body || {}; // items: [{ employeeId, riskScore, riskLevel, primaryRiskFactors }]
      if (!Array.isArray(items) || items.length === 0) {
        return reply.code(400).send({ status: 'error', message: 'items array is required' });
      }

      try {
        const parsedPeriodId = periodId ? parseInt(periodId, 10) : null;
        const todayStr = new Date().toISOString().slice(0, 10);

        // Jika ada periodId, hapus scan sebelumnya untuk karyawan yang bersangkutan pada periode tersebut (Replace Mode)
        const employeeIds = items.map(item => parseInt(item.employeeId, 10));

        if (parsedPeriodId && employeeIds.length > 0) {
          await fastify.db
            .delete(aiTurnoverPredictions)
            .where(
              and(
                eq(aiTurnoverPredictions.periodId, parsedPeriodId),
                sql`${aiTurnoverPredictions.employeeId} IN ${employeeIds}`
              )
            );
        }

        const recordsToInsert = items.map(item => ({
          employeeId: parseInt(item.employeeId, 10),
          periodId: parsedPeriodId,
          predictionDate: todayStr,
          riskScore: String(item.riskScore),
          riskLevel: item.riskLevel,
          primaryRiskFactors: item.primaryRiskFactors || [],
        }));

        const inserted = await fastify.db
          .insert(aiTurnoverPredictions)
          .values(recordsToInsert)
          .returning();

        return reply.code(201).send({
          status: 'success',
          message: `Berhasil menyimpan/memperbarui ${inserted.length} hasil scan AI pada periode ini`,
          data: inserted,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ status: 'error', message: err.message });
      }
    }
  );

  // GET /api/analytics/months (List Bulan yang Memiliki Riwayat Scan)
  fastify.get(
    '/analytics/months',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const months = await fastify.db
          .select({
            month: sql`to_char(${aiTurnoverPredictions.createdAt}, 'YYYY-MM')`,
            scanCount: count(aiTurnoverPredictions.id),
          })
          .from(aiTurnoverPredictions)
          .where(isNull(aiTurnoverPredictions.deletedAt))
          .groupBy(sql`to_char(${aiTurnoverPredictions.createdAt}, 'YYYY-MM')`)
          .orderBy(desc(sql`to_char(${aiTurnoverPredictions.createdAt}, 'YYYY-MM')`));

        return { status: 'success', data: months };
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ status: 'error', message: err.message });
      }
    }
  );

  // DELETE /api/analytics/scan/:id (Soft Delete Record Hasil Scan AI)
  fastify.delete(
    '/analytics/scan/:id',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params;
      try {
        await fastify.db
          .update(aiTurnoverPredictions)
          .set({ deletedAt: new Date() })
          .where(eq(aiTurnoverPredictions.id, parseInt(id, 10)));

        return { status: 'success', message: 'Hasil scan AI berhasil dihapus' };
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ status: 'error', message: err.message });
      }
    }
  );
}

import { eq, desc, count, isNull, isNotNull, and } from 'drizzle-orm';
import {
  employees,
  departments,
  positions,
  aiTurnoverPredictions,
} from '../../src/db/schema.js';

export default async function (fastify, opts) {
  // GET /api/employees
  fastify.get(
    '/employees',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const page = parseInt(request.query.page, 10) || 1;
      const limit = parseInt(request.query.limit, 10) || 5;
      const offset = (page - 1) * limit;

      try {
        const allEmployees = await fastify.db
          .select({
            id: employees.id,
            employeeCode: employees.employeeCode,
            firstName: employees.firstName,
            lastName: employees.lastName,
            email: employees.email,
            phone: employees.phone,
            gender: employees.gender,
            maritalStatus: employees.maritalStatus,
            birthDate: employees.birthDate,
            hireDate: employees.hireDate,
            currentSalary: employees.currentSalary,
            employmentStatus: employees.employmentStatus,
            departmentId: employees.departmentId,
            departmentName: departments.name,
            positionTitle: positions.title,
          })
          .from(employees)
          .leftJoin(departments, eq(employees.departmentId, departments.id))
          .leftJoin(positions, eq(employees.positionId, positions.id))
          .where(isNull(employees.deletedAt))
          .orderBy(desc(employees.createdAt))
          .limit(limit)
          .offset(offset);

        const totalRecordsResult = await fastify.db
          .select({ value: count() })
          .from(employees)
          .where(isNull(employees.deletedAt));
        const totalRecords = totalRecordsResult[0].value;
        const totalPages = Math.ceil(totalRecords / limit);

        return {
          status: 'success',
          data: allEmployees,
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

  // GET /api/employees/:id
  fastify.get(
    '/employees/:id',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params;
      const employeeIdNum = parseInt(id, 10);

      if (isNaN(employeeIdNum)) {
        return reply.code(400).send({ status: 'error', message: 'Invalid employee ID' });
      }

      try {
        const empDetails = await fastify.db
          .select({
            id: employees.id,
            employeeCode: employees.employeeCode,
            firstName: employees.firstName,
            lastName: employees.lastName,
            email: employees.email,
            phone: employees.phone,
            gender: employees.gender,
            birthDate: employees.birthDate,
            hireDate: employees.hireDate,
            currentSalary: employees.currentSalary,
            employmentStatus: employees.employmentStatus,
            departmentName: departments.name,
            positionTitle: positions.title,
          })
          .from(employees)
          .leftJoin(departments, eq(employees.departmentId, departments.id))
          .leftJoin(positions, eq(employees.positionId, positions.id))
          .where(and(eq(employees.id, employeeIdNum), isNull(employees.deletedAt)))
          .limit(1);

        if (!empDetails[0]) {
          return reply.code(404).send({ status: 'error', message: 'Employee not found' });
        }

        const latestPrediction = await fastify.db
          .select()
          .from(aiTurnoverPredictions)
          .where(eq(aiTurnoverPredictions.employeeId, employeeIdNum))
          .orderBy(desc(aiTurnoverPredictions.createdAt))
          .limit(1);

        return {
          status: 'success',
          data: {
            ...empDetails[0],
            aiPrediction: latestPrediction[0] || null,
          },
        };
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ status: 'error', message: err.message });
      }
    }
  );

  // POST /api/employees
  fastify.post(
    '/employees',
    {
      onRequest: [
        fastify.authenticate,
        fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
      ],
    },
    async (request, reply) => {
      const {
        employeeCode,
        firstName,
        lastName,
        email,
        phone,
        gender,
        birthDate,
        hireDate,
        departmentId,
        positionId,
        currentSalary,
      } = request.body || {};

      if (!employeeCode || !firstName || !email || !departmentId || !positionId || !currentSalary) {
        return reply.code(400).send({
          status: 'error',
          message: 'employeeCode, firstName, email, departmentId, positionId, and currentSalary are required',
        });
      }

      try {
        const newEmp = await fastify.db
          .insert(employees)
          .values({
            employeeCode,
            firstName,
            lastName,
            email,
            phone,
            gender,
            birthDate,
            hireDate,
            departmentId: parseInt(departmentId, 10),
            positionId: parseInt(positionId, 10),
            currentSalary,
          })
          .returning();

        return reply.code(201).send({ status: 'success', data: newEmp[0] });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ status: 'error', message: err.message });
      }
    }
  );

  // PUT /api/employees/:id
  fastify.put(
    '/employees/:id',
    {
      onRequest: [
        fastify.authenticate,
        fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
      ],
    },
    async (request, reply) => {
      const { id } = request.params;
      const employeeIdNum = parseInt(id, 10);
      const body = request.body || {};

      if (isNaN(employeeIdNum)) {
        return reply.code(400).send({ status: 'error', message: 'Invalid employee ID' });
      }

      try {
        const updateData = { updatedAt: new Date() };

        if (body.employeeCode !== undefined) updateData.employeeCode = body.employeeCode;
        if (body.firstName !== undefined) updateData.firstName = body.firstName;
        if (body.lastName !== undefined) updateData.lastName = body.lastName;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.phone !== undefined) updateData.phone = body.phone;
        if (body.gender !== undefined) updateData.gender = body.gender;
        if (body.birthDate !== undefined) updateData.birthDate = body.birthDate;
        if (body.hireDate !== undefined) updateData.hireDate = body.hireDate;
        if (body.departmentId !== undefined) updateData.departmentId = parseInt(body.departmentId, 10);
        if (body.positionId !== undefined) updateData.positionId = parseInt(body.positionId, 10);
        if (body.currentSalary !== undefined) updateData.currentSalary = body.currentSalary;

        const updatedEmp = await fastify.db
          .update(employees)
          .set(updateData)
          .where(and(eq(employees.id, employeeIdNum), isNull(employees.deletedAt)))
          .returning();

        if (!updatedEmp[0]) {
          return reply.code(404).send({ status: 'error', message: 'Employee not found' });
        }

        return reply.code(200).send({ status: 'success', data: updatedEmp[0] });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ status: 'error', message: err.message });
      }
    }
  );

  // DELETE /api/employees/:id (Soft Delete -> move to Recycle Bin)
  fastify.delete(
    '/employees/:id',
    {
      onRequest: [
        fastify.authenticate,
        fastify.authorizeRoles('superadmin', 'admin_ti', 'hr'),
      ],
    },
    async (request, reply) => {
      const { id } = request.params;
      const employeeIdNum = parseInt(id, 10);

      if (isNaN(employeeIdNum)) {
        return reply.code(400).send({ status: 'error', message: 'Invalid employee ID' });
      }

      try {
        const deletedEmp = await fastify.db
          .update(employees)
          .set({ deletedAt: new Date() })
          .where(and(eq(employees.id, employeeIdNum), isNull(employees.deletedAt)))
          .returning();

        if (!deletedEmp[0]) {
          return reply.code(404).send({ status: 'error', message: 'Employee not found' });
        }

        return reply.code(200).send({ status: 'success', message: 'Employee dipindahkan ke recycle bin', data: deletedEmp[0] });
      } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ status: 'error', message: err.message });
      }
    }
  );

  // Recycle Bin Endpoints
  const adminGuard = { onRequest: [fastify.authenticate, fastify.authorizeRoles('superadmin', 'admin_ti', 'hr')] };

  fastify.get('/employees/recycle-bin', adminGuard, async (request, reply) => {
    try {
      const data = await fastify.db
        .select()
        .from(employees)
        .where(isNotNull(employees.deletedAt))
        .orderBy(desc(employees.deletedAt));
      return { status: 'success', data };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  fastify.post('/employees/:id/restore', adminGuard, async (request, reply) => {
    try {
      const [row] = await fastify.db
        .update(employees)
        .set({ deletedAt: null })
        .where(and(eq(employees.id, Number(request.params.id)), isNotNull(employees.deletedAt)))
        .returning();
      if (!row) return reply.code(404).send({ status: 'error', message: 'Karyawan tidak ditemukan di recycle bin' });
      return { status: 'success', data: row };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });

  fastify.delete('/employees/:id/permanent', adminGuard, async (request, reply) => {
    try {
      const [row] = await fastify.db
        .delete(employees)
        .where(and(eq(employees.id, Number(request.params.id)), isNotNull(employees.deletedAt)))
        .returning();
      if (!row) return reply.code(404).send({ status: 'error', message: 'Karyawan tidak ditemukan di recycle bin' });
      return { status: 'success', data: row };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ status: 'error', message: err.message });
    }
  });
}

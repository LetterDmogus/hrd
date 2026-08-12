import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import bcrypt from 'bcryptjs';
import * as schema from './schema.js';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL environment variable is not defined!');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Roles
  console.log('  -> Seeding roles...');
  await db
    .insert(schema.roles)
    .values([
      { name: 'superadmin', description: 'Pengelola utama seluruh sistem & data AI' },
      { name: 'admin_ti', description: 'Pengelola data teknis karyawan & pelatihan' },
      { name: 'hr', description: 'Input data operasional HR & evaluasi' },
      { name: 'manager', description: 'Melihat laporan analytical & hasil AI' },
    ])
    .onConflictDoNothing();

  // 2. Departments
  console.log('  -> Seeding departments...');
  const insertedDepts = await db
    .insert(schema.departments)
    .values([
      { code: 'ENG', name: 'Engineering & Technology' },
      { code: 'HRD', name: 'Human Resources' },
      { code: 'FIN', name: 'Finance & Accounting' },
      { code: 'MKT', name: 'Marketing & Sales' },
    ])
    .onConflictDoNothing()
    .returning();

  const engDept = insertedDepts.find((d) => d.code === 'ENG') || { id: 1 };
  const hrdDept = insertedDepts.find((d) => d.code === 'HRD') || { id: 2 };
  const finDept = insertedDepts.find((d) => d.code === 'FIN') || { id: 3 };

  // 3. Positions
  console.log('  -> Seeding positions...');
  const insertedPositions = await db
    .insert(schema.positions)
    .values([
      { departmentId: engDept.id, title: 'Engineering Manager', level: 'Manager' },
      { departmentId: engDept.id, title: 'Senior Software Engineer', level: 'Senior' },
      { departmentId: engDept.id, title: 'Junior Software Engineer', level: 'Junior' },
      { departmentId: hrdDept.id, title: 'HR Manager', level: 'Manager' },
      { departmentId: hrdDept.id, title: 'HR Officer', level: 'Junior' },
      { departmentId: finDept.id, title: 'Finance Officer', level: 'Junior' },
    ])
    .onConflictDoNothing()
    .returning();

  const mgrPos = insertedPositions.find((p) => p.title === 'Engineering Manager') || { id: 1 };
  const devPos = insertedPositions.find((p) => p.title === 'Senior Software Engineer') || { id: 2 };
  const hrPos = insertedPositions.find((p) => p.title === 'HR Officer') || { id: 5 };

  // 4. Employees
  console.log('  -> Seeding employees...');
  const insertedEmployees = await db
    .insert(schema.employees)
    .values([
      {
        employeeCode: 'EMP001',
        firstName: 'Budi',
        lastName: 'Santoso',
        email: 'budi.santoso@knowhr.com',
        phone: '081234567890',
        gender: 'male',
        maritalStatus: 'Married',
        birthDate: '1990-05-15',
        hireDate: '2020-01-10',
        departmentId: engDept.id,
        positionId: mgrPos.id,
        currentSalary: '25000000.00',
        employmentStatus: 'active',
      },
      {
        employeeCode: 'EMP002',
        firstName: 'Siti',
        lastName: 'Rahma',
        email: 'siti.rahma@knowhr.com',
        phone: '081234567891',
        gender: 'female',
        maritalStatus: 'Single',
        birthDate: '1995-08-20',
        hireDate: '2022-03-01',
        departmentId: engDept.id,
        positionId: devPos.id,
        currentSalary: '15000000.00',
        employmentStatus: 'active',
      },
      {
        employeeCode: 'EMP003',
        firstName: 'Andi',
        lastName: 'Pratama',
        email: 'andi.pratama@knowhr.com',
        phone: '081234567892',
        gender: 'male',
        maritalStatus: 'Single',
        birthDate: '1998-12-10',
        hireDate: '2023-06-15',
        departmentId: hrdDept.id,
        positionId: hrPos.id,
        currentSalary: '8000000.00',
        employmentStatus: 'active',
      },
      {
        employeeCode: 'EMP004',
        firstName: 'Rina',
        lastName: 'Lestari',
        email: 'rina.lestari@knowhr.com',
        phone: '081234567893',
        gender: 'female',
        birthDate: '1997-04-22',
        hireDate: '2024-02-12',
        departmentId: engDept.id,
        positionId: devPos.id,
        currentSalary: '12000000.00',
        employmentStatus: 'active',
      },
    ])
    .onConflictDoNothing()
    .returning();

  // 5. Users (Accounts)
  console.log('  -> Seeding users...');
  const seedPassword = process.env.SEED_USER_PASSWORD || 'password123';
  const defaultPasswordHash = await bcrypt.hash(seedPassword, 10);

  const emp1 = insertedEmployees.find((e) => e.employeeCode === 'EMP001') || { id: 1 };
  const emp2 = insertedEmployees.find((e) => e.employeeCode === 'EMP002') || { id: 2 };
  const emp3 = insertedEmployees.find((e) => e.employeeCode === 'EMP003') || { id: 3 };
  const emp4 = insertedEmployees.find((e) => e.employeeCode === 'EMP004') || { id: 4 };

  // Pastikan akun yang sudah pernah diseed tetap terhubung ke employee yang benar.
  await db.update(schema.users).set({ employeeId: emp3.id }).where(eq(schema.users.email, 'hr@knowhr.com'));
  await db.update(schema.users).set({ employeeId: emp2.id, roleName: 'employee' }).where(eq(schema.users.email, 'siti.rahma@knowhr.com'));
  await db.update(schema.users).set({ employeeId: emp4.id, roleName: 'employee' }).where(eq(schema.users.email, 'rina.lestari@knowhr.com'));

  await db
    .insert(schema.users)
    .values([
      {
        email: 'superadmin@knowhr.com',
        passwordHash: defaultPasswordHash,
        roleName: 'superadmin',
        isActive: true,
      },
      {
        email: 'admin.ti@knowhr.com',
        passwordHash: defaultPasswordHash,
        roleName: 'admin_ti',
        isActive: true,
      },
      {
        employeeId: emp3.id,
        email: 'hr@knowhr.com',
        passwordHash: defaultPasswordHash,
        roleName: 'hr',
        isActive: true,
      },
      {
        employeeId: emp1.id,
        email: 'manager@knowhr.com',
        passwordHash: defaultPasswordHash,
        roleName: 'manager',
        isActive: true,
      },
      {
        employeeId: emp2.id,
        email: 'siti.rahma@knowhr.com',
        passwordHash: defaultPasswordHash,
        roleName: 'employee',
        isActive: true,
      },
      {
        employeeId: emp4.id,
        email: 'rina.lestari@knowhr.com',
        passwordHash: defaultPasswordHash,
        roleName: 'employee',
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 6. Sample AI Model & Predictions
  console.log('  -> Seeding AI Models & Sample Predictions...');
  const insertedModels = await db
    .insert(schema.aiModels)
    .values([
      {
        name: 'Turnover_RandomForest_v1',
        algorithm: 'random_forest',
        version: '1.0.0',
        accuracy: '0.9150',
        f1Score: '0.8920',
        rocAuc: '0.9310',
        modelFilePath: '/models/turnover_rf_v1.onnx',
        isActive: true,
      },
    ])
    .onConflictDoNothing()
    .returning();

  const activeModel = insertedModels[0] || { id: 1 };

  await db.insert(schema.aiTurnoverPredictions).values([
    {
      employeeId: emp2.id,
      modelId: activeModel.id,
      predictionDate: '2026-08-01',
      riskScore: '0.7850',
      riskLevel: 'high',
      primaryRiskFactors: [
        { factor: 'overtime_hours', weight: 0.4, desc: 'Frekuensi lembur > 25 jam/bulan' },
        { factor: 'salary_stagnation', weight: 0.3, desc: 'Gaji belum naik dalam 2 tahun' },
        { factor: 'work_satisfaction', weight: 0.15, desc: 'Skor kepuasan lingkungan kerja 2/5' },
      ],
    },
  ]);

  console.log('✅ Seeding completed successfully!');
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});

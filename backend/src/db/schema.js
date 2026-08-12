import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  decimal,
  date,
  time,
  timestamp,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

const softDeleteTable = (name, columns) => pgTable(name, {
  ...columns,
  deletedAt: timestamp('deleted_at'),
});

// ==========================================
// 1. MODUL A: USER & MANAJEMEN ORGANISASI
// ==========================================

// Roles Master
export const roles = softDeleteTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(), // superadmin, admin_ti, hr, manager
  description: text('description'),
});

// Departments / Divisi
export const departments = softDeleteTable('departments', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Positions / Jabatan
export const positions = softDeleteTable('positions', {
  id: serial('id').primaryKey(),
  departmentId: integer('department_id')
    .notNull()
    .references(() => departments.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 100 }).notNull(),
  level: varchar('level', { length: 50 }), // Junior, Senior, Lead, Manager
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Employees (Data Utama Karyawan)
export const employees = softDeleteTable('employees', {
  id: serial('id').primaryKey(),
  employeeCode: varchar('employee_code', { length: 50 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 150 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  gender: varchar('gender', { length: 10 }), // male, female
  maritalStatus: varchar('marital_status', { length: 20 }), // Single, Married, Divorced
  birthDate: date('birth_date').notNull(),
  hireDate: date('hire_date').notNull(),
  departmentId: integer('department_id')
    .notNull()
    .references(() => departments.id, { onDelete: 'restrict' }),
  positionId: integer('position_id')
    .notNull()
    .references(() => positions.id, { onDelete: 'restrict' }),
  managerId: integer('manager_id')
    .references(() => employees.id, { onDelete: 'set null' }), // Self-reference Atasan
  currentSalary: decimal('current_salary', { precision: 12, scale: 2 }).notNull(),
  employmentStatus: varchar('employment_status', { length: 30 }).default('active').notNull(), // active, probation, resigned, terminated
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users (Akun Login Aplikasi)
export const users = softDeleteTable('users', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .unique()
    .references(() => employees.id, { onDelete: 'set null' }),
  email: varchar('email', { length: 150 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  roleName: varchar('role_name', { length: 50 }).notNull(), // superadmin, admin_ti, hr, manager
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 2. MODUL B: OPERASIONAL & KINERJA HRD
// ==========================================

// Salary Histories (Riwayat Gaji & Kenaikan)
export const salaryHistories = softDeleteTable('salary_histories', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  oldSalary: decimal('old_salary', { precision: 12, scale: 2 }).notNull(),
  newSalary: decimal('new_salary', { precision: 12, scale: 2 }).notNull(),
  incrementPercentage: decimal('increment_percentage', { precision: 5, scale: 2 }),
  effectiveDate: date('effective_date').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Promotions (Riwayat Promosi & Mutasi)
export const promotions = softDeleteTable('promotions', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  oldDepartmentId: integer('old_department_id').references(() => departments.id),
  newDepartmentId: integer('new_department_id').references(() => departments.id),
  oldPositionId: integer('old_position_id').references(() => positions.id),
  newPositionId: integer('new_position_id').references(() => positions.id),
  promotionDate: date('promotion_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Attendances (Kehadiran, Keterlambatan, Lembur)
export const attendances = softDeleteTable('attendances', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  checkIn: time('check_in'),
  checkOut: time('check_out'),
  lateMinutes: integer('late_minutes').default(0).notNull(),
  overtimeHours: decimal('overtime_hours', { precision: 4, scale: 2 }).default('0.00').notNull(),
  status: varchar('status', { length: 20 }).default('present').notNull(), // present, late, absent, leave
});

// Leave Requests (Pengajuan Cuti)
export const leaveRequests = softDeleteTable('leave_requests', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  leaveType: varchar('leave_type', { length: 50 }).notNull(), // annual, sick, maternity, unpaid
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  totalDays: integer('total_days').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, approved, rejected
  approvedBy: integer('approved_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Performance Evaluations (Hasil Evaluasi & KPI)
export const performanceEvaluations = softDeleteTable('performance_evaluations', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  evaluatorId: integer('evaluator_id').references(() => users.id, { onDelete: 'set null' }),
  period: varchar('period', { length: 20 }).notNull(), // e.g. 2026-Q1
  kpiScore: decimal('kpi_score', { precision: 5, scale: 2 }).notNull(), // 0 - 100
  workloadScore: decimal('workload_score', { precision: 5, scale: 2 }).notNull(), // 1 - 10
  rating: varchar('rating', { length: 20 }), // exceeds, meets, needs_improvement
  notes: text('notes'),
  evaluatedAt: date('evaluated_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 3. MODUL C: COMPETENCIES, TRAININGS & SURVEYS
// ==========================================

// Trainings (Katalog Pelatihan)
export const trainings = softDeleteTable('trainings', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  provider: varchar('provider', { length: 100 }),
  durationHours: integer('duration_hours'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Employee Trainings (Riwayat Keikutsertaan Pelatihan)
export const employeeTrainings = softDeleteTable('employee_trainings', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  trainingId: integer('training_id')
    .notNull()
    .references(() => trainings.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 30 }).default('enrolled').notNull(), // enrolled, in_progress, completed, failed
  score: decimal('score', { precision: 5, scale: 2 }),
  completionDate: date('completion_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Surveys (Survei Kepuasan Karyawan)
export const surveys = softDeleteTable('surveys', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  periodId: integer('period_id')
    .notNull()
    .references(() => evaluationPeriods.id, { onDelete: 'cascade' }),
  isAnonymous: boolean('is_anonymous').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Survey Responses (Hasil Survei Kepuasan)
export const surveyResponses = softDeleteTable('survey_responses', {
  id: serial('id').primaryKey(),
  surveyId: integer('survey_id')
    .notNull()
    .references(() => surveys.id, { onDelete: 'cascade' }),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'set null' }), // Nullable jika anonymous
  jobSatisfactionScore: integer('job_satisfaction_score').notNull(), // 1 - 5
  workEnvironmentScore: integer('work_environment_score').notNull(), // 1 - 5
  workLifeBalanceScore: integer('work_life_balance_score').notNull(), // 1 - 5
  feedbackText: text('feedback_text'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});

// ==========================================
// 4. MODUL D: MANAJEMEN MODEL AI (SUPERADMIN)
// ==========================================

// AI Models (Master Model ML & Versioning)
export const aiModels = softDeleteTable('ai_models', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // e.g. Turnover_RandomForest_v1
  algorithm: varchar('algorithm', { length: 50 }).notNull(), // random_forest, xgboost, etc
  version: varchar('version', { length: 20 }).notNull(), // e.g. 1.0.0
  accuracy: decimal('accuracy', { precision: 5, scale: 4 }),
  f1Score: decimal('f1_score', { precision: 5, scale: 4 }),
  rocAuc: decimal('roc_auc', { precision: 5, scale: 4 }),
  modelFilePath: text('model_file_path').notNull(),
  featureConfig: jsonb('feature_config'),
  isActive: boolean('is_active').default(false).notNull(),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  trainedAt: timestamp('trained_at').defaultNow().notNull(),
});

// ==========================================
// 5. MODUL E: HASIL ANALYTICS & PREDIKSI AI
// ==========================================

// Evaluation Periods (Master Periode Evaluasi & Scanning AI)
export const evaluationPeriods = softDeleteTable('evaluation_periods', {
  id: serial('id').primaryKey(),
  periodCode: varchar('period_code', { length: 20 }).notNull().unique(), // e.g. 2026-Q1, 2026-M08
  name: varchar('name', { length: 100 }).notNull(), // e.g. Kuartal I 2026
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(), // active, closed, draft
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// AI Turnover Predictions (Prediksi Resign Random Forest / Logistic Regression)
export const aiTurnoverPredictions = softDeleteTable('ai_turnover_predictions', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  periodId: integer('period_id').references(() => evaluationPeriods.id, { onDelete: 'set null' }),
  modelId: integer('model_id').references(() => aiModels.id, { onDelete: 'set null' }),
  predictionDate: date('prediction_date').notNull(),
  riskScore: decimal('risk_score', { precision: 5, scale: 4 }).notNull(), // 0.0000 - 1.0000
  riskLevel: varchar('risk_level', { length: 20 }).notNull(), // low, medium, high, critical
  primaryRiskFactors: jsonb('primary_risk_factors').notNull(), // XAI / SHAP / Feature importances
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// AI Productivity Analyses (Analisis Produktivitas & Beban Kerja)
export const aiProductivityAnalyses = softDeleteTable('ai_productivity_analyses', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  period: varchar('period', { length: 20 }).notNull(),
  productivityScore: decimal('productivity_score', { precision: 5, scale: 2 }).notNull(), // 0 - 100
  workloadStatus: varchar('workload_status', { length: 30 }).notNull(), // underloaded, optimal, overloaded, burnout_risk
  insights: jsonb('insights'),
  analyzedAt: timestamp('analyzed_at').defaultNow().notNull(),
});

// AI Recommendations (Rekomendasi Action Playbook AI)
export const aiRecommendations = softDeleteTable('ai_recommendations', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  recommendationType: varchar('recommendation_type', { length: 50 }).notNull(), // training, promotion, salary_adjustment, workload_redistribution
  trainingId: integer('training_id').references(() => trainings.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  priority: varchar('priority', { length: 20 }).default('medium').notNull(), // low, medium, high, urgent
  status: varchar('status', { length: 30 }).default('pending').notNull(), // pending, approved, in_progress, completed, rejected
  actionTakenBy: integer('action_taken_by').references(() => users.id, { onDelete: 'set null' }),
  followUpDate: date('follow_up_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// App Settings (Tabel Pengaturan Utama Sistem & Perusahaan)
export const appSettings = softDeleteTable('app_settings', {
  id: serial('id').primaryKey(),
  appName: varchar('app_name', { length: 100 }).default('KnowHR').notNull(),
  companyName: varchar('company_name', { length: 200 }).default('PT KnowHR Platform Indonesia').notNull(),
  companyAddress: text('company_address').default('Jl. Jendral Sudirman No. 45, Jakarta Selatan, 12190').notNull(),
  companyPhone: varchar('company_phone', { length: 50 }).default('+62 21 555 1234').notNull(),
  companyEmail: varchar('company_email', { length: 100 }).default('contact@knowhr.id').notNull(),
  copyrightText: varchar('copyright_text', { length: 200 }).default('© 2026 KnowHR Platform. All rights reserved.').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// DRIZZLE RELATIONS DEFINITIONS
// ==========================================

export const departmentsRelations = relations(departments, ({ many }) => ({
  positions: many(positions),
  employees: many(employees),
}));

export const positionsRelations = relations(positions, ({ one, many }) => ({
  department: one(departments, {
    fields: [positions.departmentId],
    references: [departments.id],
  }),
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
  position: one(positions, {
    fields: [employees.positionId],
    references: [positions.id],
  }),
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
    relationName: 'employee_manager',
  }),
  subordinates: many(employees, {
    relationName: 'employee_manager',
  }),
  user: one(users, {
    fields: [employees.id],
    references: [users.employeeId],
  }),
  salaryHistories: many(salaryHistories),
  promotions: many(promotions),
  attendances: many(attendances),
  leaveRequests: many(leaveRequests),
  performanceEvaluations: many(performanceEvaluations),
  employeeTrainings: many(employeeTrainings),
  surveyResponses: many(surveyResponses),
  turnoverPredictions: many(aiTurnoverPredictions),
  productivityAnalyses: many(aiProductivityAnalyses),
  recommendations: many(aiRecommendations),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  employee: one(employees, {
    fields: [users.employeeId],
    references: [employees.id],
  }),
  approvedLeaveRequests: many(leaveRequests),
  evaluatedPerformances: many(performanceEvaluations),
  executedRecommendations: many(aiRecommendations),
  createdAiModels: many(aiModels),
}));

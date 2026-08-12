import modelConfig from '../assets/ibm_model_config.json';

/**
 * Inferensi Client-Side Logistic Regression (XAI - Explainable AI)
 * Menggunakan 14 Fitur Lengkap Dataset IBM & Database PostgreSQL (Mata Uang IDR)
 */
export function predictEmployeeTurnover(empData) {
  const impacts = modelConfig.feature_impacts || {};
  const intercept = modelConfig.intercept || 0;

  // 1. Petakan data karyawan ke 14 fitur persis model
  const rawFeatures = {
    Age: Number(empData.age || 30),
    MonthlyIncomeIDR: Number(empData.current_salary || 8000000),
    PercentSalaryHike: Number(empData.salary_increment_pct || 5),
    is_overtime: Number(empData.overtime_hours || 0) > 15 ? 1 : 0,
    is_male: String(empData.gender).toLowerCase() === 'male' ? 1 : 0,
    marital_status_num: String(empData.maritalStatus).toLowerCase() === 'single' ? 2 : (String(empData.maritalStatus).toLowerCase() === 'married' ? 1 : 0),
    DistanceFromHome: 10, // Default 10 km
    job_satisfaction_num: Number(empData.job_satisfaction || 3),
    env_satisfaction_num: Number(empData.env_satisfaction || 3),
    worklife_num: Number(empData.worklife_balance || 3),
    YearsAtCompany: Math.max(1, Math.floor(Number(empData.tenure_months || 12) / 12)),
    YearsSinceLastPromotion: Number(empData.promotions_count || 0) === 0 ? Math.floor(Number(empData.tenure_months || 12) / 12) : 1,
    YearsWithCurrManager: Math.max(1, Math.floor(Number(empData.tenure_months || 12) / 12)),
    TrainingTimesLastYear: Number(empData.training_count || 0)
  };

  // 2. Hitung Logit Linear: Z = Intercept + Sum(Coef * (X - Mean) / Std)
  let logit = intercept;
  const factorContributions = [];

  for (const key in impacts) {
    const fInfo = impacts[key];
    const val = rawFeatures[key] !== undefined ? rawFeatures[key] : fInfo.mean;
    const scaledVal = (val - fInfo.mean) / (fInfo.std || 1);
    const contribution = fInfo.coefficient * scaledVal;

    logit += contribution;

    // Catat kontribusi fitur jika berdampak signifikan (|contribution| >= 0.05)
    if (Math.abs(contribution) >= 0.05) {
      const isRiskIncreaser = contribution > 0;
      factorContributions.push({
        factor: fInfo.label,
        weight: parseFloat(Math.abs(contribution).toFixed(2)),
        direction: isRiskIncreaser ? 'increase' : 'decrease',
        effectText: isRiskIncreaser ? 'Meningkatkan Risiko' : 'Menurunkan Risiko',
        detail: `Nilai: ${val} (${isRiskIncreaser ? 'Perlu Perhatian' : 'Kondisi Positif'})`
      });
    }
  }

  // 3. Transformasi Sigmoid ke Probabilitas (0.0 - 1.0)
  const riskScore = parseFloat((1 / (1 + Math.exp(-logit))).toFixed(4));
  const riskPercent = Math.round(riskScore * 100);

  // 4. Tentukan Risk Level
  let riskLevel = 'low';
  if (riskPercent >= 70) riskLevel = 'critical';
  else if (riskPercent >= 50) riskLevel = 'high';
  else if (riskPercent >= 35) riskLevel = 'medium';

  // Urutkan faktor pemicu berdasarkan kontribusi terbesar
  factorContributions.sort((a, b) => b.weight - a.weight);

  // 5. Analisis Produktivitas & Status Beban Kerja
  const kpiScore = Number(empData.kpi_score || 75);
  const overtimeHours = Number(empData.overtime_hours || 0);
  const lateMinutes = Number(empData.late_minutes || 0);

  // Produktivitas = (KPI * 0.5) + (Kepatuhan Lembur * 0.25) + (Kepatuhan Jam Masuk * 0.25)
  const overtimePenalty = Math.min(30, overtimeHours * 0.8);
  const latePenalty = Math.min(30, lateMinutes * 0.2);
  const productivityScore = Math.max(0, Math.min(100, Math.round((kpiScore * 0.6) + (40 - overtimePenalty - latePenalty))));

  let workloadStatus = 'Optimal';
  if (overtimeHours >= 30) workloadStatus = 'Burnout Risk';
  else if (overtimeHours >= 15) workloadStatus = 'Overloaded';
  else if (kpiScore < 60 && overtimeHours < 5) workloadStatus = 'Underloaded';

  // 6. Identifikasi Kesenjangan Kompetensi (Competency Gaps)
  const competencyGaps = [];
  if (kpiScore < 70) {
    competencyGaps.push({ skill: 'Kinerja Operasional / Technical Execution', gapLevel: 'Tinggi', recommendation: 'Modul Pelatihan Peningkatan Kinerja KPI' });
  }
  if (rawFeatures.TrainingTimesLastYear === 0) {
    competencyGaps.push({ skill: 'Pengembangan Skill & Sertifikasi Baru', gapLevel: 'Sedang', recommendation: 'Penugasan Training Kompetensi Tahunan' });
  }
  if (rawFeatures.worklife_num <= 2 || overtimeHours >= 20) {
    competencyGaps.push({ skill: 'Manajemen Waktu & Efisiensi Kerja', gapLevel: 'Sedang', recommendation: 'Workshop Time Management & Stress Resilience' });
  }
  if (rawFeatures.job_satisfaction_num <= 2) {
    competencyGaps.push({ skill: 'Engagement & Career Alignment', gapLevel: 'Tinggi', recommendation: 'Sesi Counseling & Mentoring Karir' });
  }

  // 7. Action Playbook & Actionable Recommendations (Diturunkan Langsung dari XAI Factors)
  const actionPlan = [];

  // Pindai setiap pemicu risiko XAI yang berdampak meningkatkan risiko (direction === 'increase')
  const riskIncreasers = factorContributions.filter(f => f.direction === 'increase');

  riskIncreasers.forEach(f => {
    if (f.factor.includes('Lembur')) {
      actionPlan.push({
        type: 'workload',
        title: 'Redistribusi Beban Kerja & Evaluasi Kebijakan Lembur',
        priority: f.weight >= 0.20 ? 'Urgent' : 'High',
        reason: `Diturunkan dari XAI Pemicu: ${f.factor} (${(f.weight * 100).toFixed(0)}% impact)`
      });
    } else if (f.factor.includes('Promosi')) {
      actionPlan.push({
        type: 'promotion',
        title: 'Tinjau Rencana Karir & Evaluasi Kenaikan/Promosi Jabatan',
        priority: f.weight >= 0.15 ? 'High' : 'Medium',
        reason: `Diturunkan dari XAI Pemicu: ${f.factor} (${(f.weight * 100).toFixed(0)}% impact)`
      });
    } else if (f.factor.includes('Kepuasan') || f.factor.includes('Work-Life')) {
      actionPlan.push({
        type: 'counseling',
        title: 'Jadwalkan Sesi 1-on-1 Stay Interview & Counseling',
        priority: 'High',
        reason: `Diturunkan dari XAI Pemicu: ${f.factor} (${(f.weight * 100).toFixed(0)}% impact)`
      });
    } else if (f.factor.includes('Gaji')) {
      actionPlan.push({
        type: 'salary',
        title: 'Tinjau Kesesuaian Kompensasi & Banding Gaji Internal',
        priority: 'High',
        reason: `Diturunkan dari XAI Pemicu: ${f.factor} (${(f.weight * 100).toFixed(0)}% impact)`
      });
    } else if (f.factor.includes('Pelatihan')) {
      actionPlan.push({
        type: 'training',
        title: 'Tugaskan Modul Pelatihan Pengembangan Diri',
        priority: 'Medium',
        reason: `Diturunkan dari XAI Pemicu: ${f.factor} (${(f.weight * 100).toFixed(0)}% impact)`
      });
    }
  });

  // Jika tidak ada risiko spesifik tetapi produktivitas kurang
  if (actionPlan.length === 0 && competencyGaps.length > 0) {
    actionPlan.push({
      type: 'training',
      title: 'Penugasan Program Pelatihan Kompetensi Rutin',
      priority: 'Low',
      reason: 'Peningkatan berkelanjutan (Continuous Improvement)'
    });
  }

  return {
    riskScore,
    riskPercent,
    riskLevel,
    primaryRiskFactors: factorContributions,
    productivityAnalysis: {
      score: productivityScore,
      status: workloadStatus,
      kpiScore,
      overtimeHours,
      lateMinutes
    },
    competencyGaps,
    actionPlan,
    modelInfo: {
      name: modelConfig.model_name,
      algorithm: 'Logistic Regression (Explainable AI)',
      accuracy: modelConfig.metrics.accuracy,
      rocAuc: modelConfig.metrics.roc_auc,
      totalFeatures: modelConfig.total_features
    }
  };
}

<template>
  <div class="space-y-6">
    <!-- Header Page with Period Selector -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
      <div>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight dark:text-white">Manajemen Operasional HRD</h2>
        <p class="text-xs text-slate-500 mt-0.5 dark:text-slate-400">Pembaruan berkala Kehadiran, Evaluasi Kinerja KPI, dan Pelatihan Karyawan.</p>
      </div>

      <!-- Global Evaluation Period Selector -->
      <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs dark:bg-slate-900 dark:border-slate-800">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-400">Periode Operasional:</span>
        <select v-model="selectedPeriodId" @change="onPeriodChange" class="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-indigo-600 focus:outline-none cursor-pointer dark:bg-slate-800 dark:border-slate-700">
          <option value="">Semua Periode</option>
          <option v-for="p in periodsList" :key="p.id" :value="p.id">
            {{ p.periodCode }} - {{ p.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Main Operational Layout: Sidebar Tabs + Content Area -->
    <div class="flex flex-col md:flex-row gap-6 items-start">
      <!-- Left Compact Icon-Only Sidebar Tabs with Hover Tooltip Popups -->
      <aside class="w-auto flex flex-row md:flex-col bg-slate-50 border border-slate-200/80 rounded-2xl p-1.5 shrink-0 gap-1.5 dark:bg-slate-900 dark:border-slate-800">
        <!-- Tab 1: Kehadiran & Lembur -->
        <div class="relative group">
          <button
            @click="activeTab = 'attendance'"
            class="p-3 rounded-xl transition flex items-center justify-center cursor-pointer"
            :class="activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
              : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'"
          >
            <Calendar class="w-5 h-5 shrink-0" />
          </button>
          
          <!-- Floating Tooltip Popover (Right on Desktop, Top on Mobile) -->
          <div class="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex flex-col w-48 p-2.5 bg-slate-900 text-white rounded-xl shadow-2xl text-xs z-50 pointer-events-none transition-all duration-200 dark:bg-slate-800 dark:border dark:border-slate-700">
            <span class="font-bold block text-white text-xs">Kehadiran &amp; Lembur</span>
            <span class="text-[10px] text-slate-300 font-normal leading-tight mt-0.5">Kalender harian, rekap lembur, &amp; bulk input.</span>
          </div>
        </div>

        <!-- Tab 2: Evaluasi KPI -->
        <div class="relative group">
          <button
            @click="activeTab = 'evaluation'"
            class="p-3 rounded-xl transition flex items-center justify-center cursor-pointer"
            :class="activeTab === 'evaluation'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
              : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'"
          >
            <BarChart3 class="w-5 h-5 shrink-0" />
          </button>

          <!-- Floating Tooltip Popover -->
          <div class="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex flex-col w-48 p-2.5 bg-slate-900 text-white rounded-xl shadow-2xl text-xs z-50 pointer-events-none transition-all duration-200 dark:bg-slate-800 dark:border dark:border-slate-700">
            <span class="font-bold block text-white text-xs">Evaluasi KPI</span>
            <span class="text-[10px] text-slate-300 font-normal leading-tight mt-0.5">Penilaian kinerja &amp; skor beban kerja.</span>
          </div>
        </div>

        <!-- Tab 3: Penugasan Pelatihan -->
        <div class="relative group">
          <button
            @click="activeTab = 'training'"
            class="p-3 rounded-xl transition flex items-center justify-center cursor-pointer"
            :class="activeTab === 'training'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
              : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'"
          >
            <GraduationCap class="w-5 h-5 shrink-0" />
          </button>

          <!-- Floating Tooltip Popover -->
          <div class="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex flex-col w-48 p-2.5 bg-slate-900 text-white rounded-xl shadow-2xl text-xs z-50 pointer-events-none transition-all duration-200 dark:bg-slate-800 dark:border dark:border-slate-700">
            <span class="font-bold block text-white text-xs">Penugasan Pelatihan</span>
            <span class="text-[10px] text-slate-300 font-normal leading-tight mt-0.5">Manajemen modul &amp; status keikutsertaan.</span>
          </div>
        </div>
      </aside>

      <!-- Right Main Content Area -->
      <main class="flex-1 min-w-0 w-full">
        <!-- ================= TAB 1: KEHADIRAN & LEMBUR ================= -->
        <div v-if="activeTab === 'attendance'" class="space-y-5">
          <!-- Sub-mode Switcher & Controls -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-2 border border-slate-200/80 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
            <div class="flex items-center gap-1 bg-white border border-slate-200/80 p-1 rounded-xl text-xs shadow-xs dark:bg-slate-800 dark:border-slate-700">
              <button @click="attendanceMode = 'calendar'" class="px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5"
                :class="attendanceMode === 'calendar' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'">
                <Calendar class="w-3.5 h-3.5" />
                <span>Kalender</span>
              </button>
              <button v-if="canManage" @click="attendanceMode = 'bulk'" class="px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5"
                :class="attendanceMode === 'bulk' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'">
                <Users class="w-3.5 h-3.5" />
                <span>Bulk Input Tim</span>
              </button>
              <button @click="attendanceMode = 'summary'" class="px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5"
                :class="attendanceMode === 'summary' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'">
                <FileText class="w-3.5 h-3.5" />
                <span>Rekap Bulanan</span>
              </button>
              <button @click="attendanceMode = 'list'" class="px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5"
                :class="attendanceMode === 'list' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'">
                <ListFilter class="w-3.5 h-3.5" />
                <span>Semua Data</span>
              </button>
            </div>

            <div class="flex items-center gap-2">
              <!-- Month & Year Selector -->
              <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1.5 py-0.5 dark:bg-slate-800 dark:border-slate-700">
                <button @click="prevMonth" class="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition dark:text-slate-400 dark:hover:bg-slate-700">
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <span class="text-xs font-bold text-slate-700 px-2 min-w-[110px] text-center dark:text-slate-200">{{ calendarMonthLabel }}</span>
                <button @click="nextMonth" class="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition dark:text-slate-400 dark:hover:bg-slate-700">
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- -------- MODE: KALENDER -------- -->
          <div v-if="attendanceMode === 'calendar'" class="space-y-4">
            <!-- Header bar khusus Kalender: Searchbar Cari/Pilih Karyawan -->
            <div class="p-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs dark:bg-slate-900 dark:border-slate-800">
              <div class="flex items-center gap-2">
                <UserCheck class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 class="text-xs font-bold text-slate-900 dark:text-white">Pilih Karyawan Terlebih Dahulu</h3>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">Tampilkan kalender dan catatan absensi karyawan yang dipilih.</p>
                </div>
              </div>

              <!-- Searchable Employee Selector Dropdown -->
              <div class="relative w-full sm:w-72">
                <button
                  type="button"
                  @click="showEmployeeDropdown = !showEmployeeDropdown"
                  class="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold flex items-center justify-between gap-2 shadow-2xs hover:bg-slate-100 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  <span class="truncate">{{ selectedEmployeeLabel }}</span>
                  <ChevronRight class="w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 dark:text-slate-500" :class="showEmployeeDropdown ? 'rotate-90' : ''" />
                </button>

                <!-- Search Popover -->
                <div
                  v-if="showEmployeeDropdown"
                  class="absolute top-full left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 space-y-1.5 dark:bg-slate-800 dark:border-slate-700"
                >
                  <!-- Search input -->
                  <div class="relative">
                    <Search class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 dark:text-slate-500" />
                    <input
                      v-model="employeeSearchQuery"
                      type="text"
                      placeholder="Cari nama / NIK..."
                      class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>

                  <!-- Employees List (Max 5 items) -->
                  <div class="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                    <button
                      v-for="emp in filteredEmployeesLimit5"
                      :key="emp.id"
                      @click="selectCalendarEmployee(emp)"
                      class="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition flex items-center justify-between dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                      :class="String(calendarEmployeeId) === String(emp.id) ? 'bg-indigo-50 text-indigo-600 font-bold dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'"
                    >
                      <div class="truncate">
                        <span class="block font-semibold">{{ emp.firstName }} {{ emp.lastName || '' }}</span>
                        <span class="text-[10px] text-slate-400 font-mono dark:text-slate-500">{{ emp.employeeCode }}</span>
                      </div>
                    </button>

                    <div v-if="filteredEmployeesLimit5.length === 0" class="p-3 text-center text-[11px] text-slate-400 dark:text-slate-500">
                      Karyawan tidak ditemukan.
                    </div>
                  </div>
                  <div class="text-[10px] text-slate-400 px-2 pt-1 border-t border-slate-100 dark:text-slate-500 dark:border-slate-700">
                    Menampilkan max 5 hasil
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!calendarEmployeeId" class="p-12 text-center bg-slate-50 border border-slate-200/80 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
              <UserCheck class="w-8 h-8 mx-auto text-slate-400 mb-2 dark:text-slate-500" />
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">Belum ada Karyawan Terpilih</p>
              <p class="text-xs text-slate-400 mt-1 dark:text-slate-500">Gunakan dropdown pencarian di atas untuk memilih karyawan.</p>
            </div>

            <div v-else class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs space-y-4 p-4 dark:bg-slate-900 dark:border-slate-800">
              <!-- Legend Status -->
              <div class="flex items-center gap-4 px-2 pb-3 border-b border-slate-100 flex-wrap dark:border-slate-800">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">Keterangan:</span>
                <span v-for="s in statusList" :key="s.value" class="flex items-center gap-1.5 text-[11px] font-semibold" :class="s.text">
                  <span class="w-2.5 h-2.5 rounded-full" :class="s.dot"></span>{{ s.label }}
                </span>
                <span class="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  <span class="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>Belum Dicatat
                </span>
              </div>

              <!-- Calendar Grid -->
              <div>
                <div class="grid grid-cols-7 gap-1.5 mb-1.5">
                  <div v-for="day in ['Min','Sen','Sel','Rab','Kam','Jum','Sab']" :key="day"
                    class="text-center text-[11px] font-bold text-slate-400 uppercase py-1 dark:text-slate-500">{{ day }}</div>
                </div>
                <div class="grid grid-cols-7 gap-1.5">
                  <div v-for="n in calendarStartDay" :key="'blank-'+n"></div>
                  <div v-for="day in calendarDays" :key="day.date"
                    @click="canManage && openDayModal(day)"
                    class="h-14 sm:h-16 rounded-xl p-1 flex flex-col justify-between text-xs font-semibold transition relative border"
                    :class="[
                      day.isToday ? 'ring-2 ring-indigo-500 border-indigo-200 dark:border-indigo-500' : 'border-slate-100 dark:border-slate-800',
                      day.isWeekend ? 'bg-slate-50 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500' : '',
                      !day.isWeekend && !day.record ? 'bg-slate-50/70 text-slate-600 hover:bg-slate-100 cursor-pointer dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-700' : '',
                      day.record?.status === 'present' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 cursor-pointer hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20' : '',
                      day.record?.status === 'late' ? 'bg-amber-50 text-amber-800 border-amber-200 cursor-pointer hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30 dark:hover:bg-amber-500/20' : '',
                      day.record?.status === 'absent' ? 'bg-rose-50 text-rose-800 border-rose-200 cursor-pointer hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30 dark:hover:bg-rose-500/20' : '',
                      day.record?.status === 'leave' ? 'bg-sky-50 text-sky-800 border-sky-200 cursor-pointer hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30 dark:hover:bg-sky-500/20' : '',
                    ]"
                  >
                    <div class="flex items-center justify-between w-full">
                      <span class="text-[11px] font-bold" :class="day.isToday ? 'text-indigo-600 dark:text-indigo-400' : ''">{{ day.day }}</span>
                      <span v-if="day.record?.status" class="w-2 h-2 rounded-full"
                        :class="{
                          'bg-emerald-500': day.record.status === 'present',
                          'bg-amber-500': day.record.status === 'late',
                          'bg-rose-500': day.record.status === 'absent',
                          'bg-sky-500': day.record.status === 'leave'
                        }"></span>
                    </div>

                    <div class="flex flex-col text-[9px] leading-tight">
                      <span v-if="day.record?.checkIn" class="font-mono text-slate-500 dark:text-slate-400">{{ day.record.checkIn }}</span>
                      <span v-if="day.record?.lateMinutes > 0" class="font-bold text-amber-600 dark:text-amber-400">+{{ day.record.lateMinutes }}m</span>
                      <span v-if="parseFloat(day.record?.overtimeHours) > 0" class="font-bold text-indigo-600 dark:text-indigo-400">OT {{ day.record.overtimeHours }}j</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Monthly Summary Footer -->
              <div class="border-t border-slate-100 pt-3 flex items-center justify-around flex-wrap gap-4 text-xs dark:border-slate-800">
                <div v-for="s in calendarMonthlySummary" :key="s.label" class="text-center">
                  <span class="block text-base font-extrabold text-slate-900 dark:text-white">{{ s.value }}</span>
                  <span class="text-[11px] text-slate-400 font-medium dark:text-slate-500">{{ s.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- -------- MODE: REKAP BULANAN -------- -->
          <div v-if="attendanceMode === 'summary'" class="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800">
            <div v-if="loadingAttendances" class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Menghitung rekap bulanan...</div>
            <div v-else-if="monthlySummary.length" class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-700">
                  <tr>
                    <th class="py-3 px-4">Karyawan</th>
                    <th class="py-3 px-4">Divisi</th>
                    <th class="py-3 px-4 text-center text-emerald-600 dark:text-emerald-400">Hadir</th>
                    <th class="py-3 px-4 text-center text-amber-600 dark:text-amber-400">Terlambat</th>
                    <th class="py-3 px-4 text-center text-rose-600 dark:text-rose-400">Absen</th>
                    <th class="py-3 px-4 text-center text-sky-600 dark:text-sky-400">Cuti</th>
                    <th class="py-3 px-4 text-center text-indigo-600 dark:text-indigo-400">Total Lembur</th>
                    <th class="py-3 px-4 text-center text-amber-700 dark:text-amber-400">Total Terlambat</th>
                    <th class="py-3 px-4 text-center">Kehadiran</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
                  <tr v-for="row in monthlySummary" :key="row.employeeId" class="hover:bg-white transition dark:hover:bg-slate-800/40">
                    <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {{ row.employeeName }}
                      <span class="block text-[10px] font-mono text-indigo-600 dark:text-indigo-400">{{ row.employeeCode }}</span>
                    </td>
                    <td class="py-3 px-4 text-slate-600 dark:text-slate-400">{{ row.departmentName || '-' }}</td>
                    <td class="py-3 px-4 text-center font-bold text-emerald-700 dark:text-emerald-400">{{ row.present }}</td>
                    <td class="py-3 px-4 text-center font-bold text-amber-700 dark:text-amber-400">{{ row.late }}</td>
                    <td class="py-3 px-4 text-center font-bold text-rose-700 dark:text-rose-400">{{ row.absent }}</td>
                    <td class="py-3 px-4 text-center font-bold text-sky-700 dark:text-sky-400">{{ row.leave }}</td>
                    <td class="py-3 px-4 text-center font-bold text-indigo-700 dark:text-indigo-400">{{ row.totalOvertime }}j</td>
                    <td class="py-3 px-4 text-center font-bold text-amber-800 dark:text-amber-400">{{ row.totalLate }}m</td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex items-center gap-2">
                        <div class="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
                          <div class="h-full rounded-full transition-all"
                            :class="row.attendancePct >= 90 ? 'bg-emerald-500' : row.attendancePct >= 75 ? 'bg-amber-500' : 'bg-rose-500'"
                            :style="`width:${row.attendancePct}%`"></div>
                        </div>
                        <span class="font-bold text-slate-700 w-10 text-right dark:text-slate-300">{{ row.attendancePct }}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Belum ada data kehadiran pada bulan ini.</div>
          </div>

          <!-- -------- MODE: SEMUA DATA (LIST) -------- -->
          <div v-if="attendanceMode === 'list'" class="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800">
            <div v-if="loadingAttendances" class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Memuat data kehadiran...</div>
            <div v-else-if="attendancesList.length" class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-700">
                  <tr>
                    <th class="py-3 px-4">Tanggal</th>
                    <th class="py-3 px-4">Karyawan</th>
                    <th class="py-3 px-4">Divisi</th>
                    <th class="py-3 px-4">Jam Masuk - Keluar</th>
                    <th class="py-3 px-4">Terlambat</th>
                    <th class="py-3 px-4">Lembur</th>
                    <th class="py-3 px-4">Status</th>
                    <th class="py-3 px-4 text-right" v-if="canManage">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
                  <tr v-for="item in attendancesList" :key="item.id" class="hover:bg-white transition dark:hover:bg-slate-800/40">
                    <td class="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">{{ item.date }}</td>
                    <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {{ item.employeeName }}
                      <span class="block text-[10px] text-indigo-600 font-mono dark:text-indigo-400">{{ item.employeeCode }}</span>
                    </td>
                    <td class="py-3 px-4 text-slate-600 dark:text-slate-400">{{ item.departmentName || '-' }}</td>
                    <td class="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{{ item.checkIn || '-' }} - {{ item.checkOut || '-' }}</td>
                    <td class="py-3 px-4 font-mono" :class="item.lateMinutes > 0 ? 'text-amber-600 font-bold dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'">
                      {{ item.lateMinutes }} menit
                    </td>
                    <td class="py-3 px-4 font-mono" :class="parseFloat(item.overtimeHours) > 0 ? 'text-indigo-600 font-bold dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'">
                      {{ item.overtimeHours }} jam
                    </td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border"
                        :class="{
                          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30': item.status === 'present',
                          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30': item.status === 'late',
                          'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30': item.status === 'absent',
                          'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30': item.status === 'leave'
                        }">{{ item.status }}</span>
                    </td>
                    <td class="py-3 px-4 text-right" v-if="canManage">
                      <button @click="deleteAttendance(item.id)" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10" title="Hapus">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Belum ada data kehadiran.</div>
          </div>

          <!-- -------- MODE: BULK INPUT PANEL -------- -->
          <div v-if="attendanceMode === 'bulk'" class="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-5 shadow-xs dark:bg-slate-900 dark:border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-slate-800">
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Form Bulk Input Kehadiran Tim / Divisi</h3>
                <p class="text-xs text-slate-500 mt-0.5 dark:text-slate-400">Pencatatan absensi kolektif seluruh karyawan untuk tanggal tertentu secara cepat.</p>
              </div>
              <button @click="attendanceMode = 'calendar'" class="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                Kembali ke Kalender
              </button>
            </div>

            <div class="space-y-4 text-xs font-sans">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Tanggal Kehadiran</label>
                  <input v-model="bulkDate" type="date" required class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Filter Departemen / Divisi</label>
                  <select v-model="bulkDeptFilter" @change="applyBulkDeptFilter" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                    <option value="">Semua Departemen ({{ allEmployees.length }} Karyawan)</option>
                    <option v-for="dept in allDepartments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
                  </select>
                </div>
              </div>

              <!-- Default Time Setters for All Rows -->
              <div class="p-3.5 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs dark:bg-slate-800 dark:border-slate-700">
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Set Jam Default Semua Karyawan:</span>
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[11px] text-slate-500 font-medium dark:text-slate-400">Masuk:</span>
                    <input v-model="bulkDefaultCheckIn" @change="applyDefaultTimes" type="time" class="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono font-bold dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" />
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[11px] text-slate-500 font-medium dark:text-slate-400">Keluar:</span>
                    <input v-model="bulkDefaultCheckOut" @change="applyDefaultTimes" type="time" class="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono font-bold dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" />
                  </div>
                </div>
              </div>

              <!-- Scrollable Rows List Area (Wide Landscape Grid) -->
              <div class="max-h-[60vh] overflow-y-auto border border-slate-200/80 rounded-2xl divide-y divide-slate-100 bg-white shadow-2xs dark:bg-slate-800/40 dark:border-slate-800 dark:divide-slate-800/70">
                <div v-for="row in bulkRows" :key="row.employeeId" class="p-3.5 hover:bg-slate-50 transition dark:hover:bg-slate-800/60">
                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <!-- Karyawan Info -->
                    <div class="w-full md:w-56 shrink-0">
                      <div class="font-bold text-slate-900 truncate dark:text-slate-100 text-xs">
                        {{ row.employeeName }}
                      </div>
                      <div class="text-[10px] font-mono text-indigo-600 font-bold dark:text-indigo-400">
                        {{ row.employeeCode }}
                      </div>
                    </div>

                    <!-- Status & Inputs Grid Landscape -->
                    <div class="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-2.5 items-center">
                      <!-- Status -->
                      <div>
                        <span class="block text-[10px] font-semibold text-slate-400 mb-0.5 dark:text-slate-500">Status</span>
                        <select v-model="row.status" class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-semibold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                          <option value="present">Hadir</option>
                          <option value="late">Terlambat</option>
                          <option value="absent">Absen</option>
                          <option value="leave">Cuti</option>
                        </select>
                      </div>

                      <!-- Jam Masuk -->
                      <div>
                        <span class="block text-[10px] font-semibold text-slate-400 mb-0.5 dark:text-slate-500">Jam Masuk</span>
                        <input v-model="row.checkIn" type="time" class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
                      </div>

                      <!-- Jam Keluar -->
                      <div>
                        <span class="block text-[10px] font-semibold text-slate-400 mb-0.5 dark:text-slate-500">Jam Keluar</span>
                        <input v-model="row.checkOut" type="time" class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
                      </div>

                      <!-- Terlambat -->
                      <div>
                        <span class="block text-[10px] font-semibold text-slate-400 mb-0.5 dark:text-slate-500">Terlambat (m)</span>
                        <input v-model="row.lateMinutes" type="number" min="0" placeholder="0" class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
                      </div>

                      <!-- Lembur -->
                      <div>
                        <span class="block text-[10px] font-semibold text-slate-400 mb-0.5 dark:text-slate-500">Lembur (j)</span>
                        <input v-model="row.overtimeHours" type="number" step="0.5" min="0" placeholder="0" class="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Total Karyawan Dicatat: <strong class="text-slate-900 dark:text-white font-bold">{{ bulkRows.length }} Karyawan</strong></span>
                <div class="flex items-center gap-2">
                  <button type="button" @click="attendanceMode = 'calendar'" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 transition dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Batal</button>
                  <button
                    @click="saveBulkAttendance"
                    :disabled="savingBulk"
                    class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {{ savingBulk ? 'Menyimpan...' : `Simpan Kehadiran Tim (${bulkRows.length})` }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= TAB 2: EVALUASI KPI ================= -->
        <div v-if="activeTab === 'evaluation'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Riwayat Evaluasi Kinerja & KPI</h3>
            <button v-if="canManage" @click="showAddEvaluationModal = true"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5">
              <Plus class="w-4 h-4" /><span>Tambah Evaluasi KPI</span>
            </button>
          </div>

          <div class="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800">
            <div v-if="loadingEvaluations" class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Memuat data evaluasi...</div>
            <div v-else-if="evaluationsList.length" class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-700">
                  <tr>
                    <th class="py-3 px-4">Periode</th>
                    <th class="py-3 px-4">Karyawan</th>
                    <th class="py-3 px-4">Skor KPI</th>
                    <th class="py-3 px-4">Beban Kerja</th>
                    <th class="py-3 px-4">Rating</th>
                    <th class="py-3 px-4">Catatan</th>
                    <th class="py-3 px-4 text-right" v-if="canManage">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
                  <tr v-for="item in evaluationsList" :key="item.id" class="hover:bg-white transition dark:hover:bg-slate-800/40">
                    <td class="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ item.period }}</td>
                    <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {{ item.employeeName }}
                      <span class="block text-[10px] text-slate-400 font-normal dark:text-slate-500">{{ item.departmentName || '-' }}</span>
                    </td>
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-2">
                        <div class="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
                          <div class="h-full rounded-full" :class="item.kpiScore >= 85 ? 'bg-emerald-500' : item.kpiScore >= 70 ? 'bg-amber-500' : 'bg-rose-500'"
                            :style="`width:${item.kpiScore}%`"></div>
                        </div>
                        <span class="font-bold text-slate-900 dark:text-slate-100">{{ item.kpiScore }}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{{ item.workloadScore }} / 10</td>
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-1.5">
                        <div class="flex items-center text-amber-400">
                          <Star v-for="i in (item.rating === 'exceeds' ? 3 : item.rating === 'meets' ? 2 : 1)" :key="i" class="w-3.5 h-3.5 fill-amber-400" />
                        </div>
                        <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md border"
                          :class="{
                            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30': item.rating === 'exceeds',
                            'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30': item.rating === 'meets',
                            'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30': item.rating === 'needs_improvement'
                          }">
                          {{ item.rating === 'exceeds' ? 'Sangat Baik' : item.rating === 'meets' ? 'Sesuai Target' : 'Perlu Perbaikan' }}
                        </span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-slate-600 max-w-xs truncate dark:text-slate-400">{{ item.notes || '-' }}</td>
                    <td class="py-3 px-4 text-right" v-if="canManage">
                      <button @click="deleteEvaluation(item.id)" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Belum ada riwayat evaluasi KPI karyawan.</div>
          </div>
        </div>

        <!-- ================= TAB 3: PENUGASAN PELATIHAN ================= -->
        <div v-if="activeTab === 'training'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Keikutsertaan Pelatihan Karyawan</h3>
            <button v-if="canManage" @click="showAddEmpTrainingModal = true"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5">
              <Plus class="w-4 h-4" /><span>Tugaskan Pelatihan</span>
            </button>
          </div>

          <div class="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800">
            <div v-if="loadingTrainings" class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Memuat data pelatihan...</div>
            <div v-else-if="empTrainingsList.length" class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-700">
                  <tr>
                    <th class="py-3 px-4">Karyawan</th>
                    <th class="py-3 px-4">Judul Training</th>
                    <th class="py-3 px-4">Kategori</th>
                    <th class="py-3 px-4">Status</th>
                    <th class="py-3 px-4">Nilai</th>
                    <th class="py-3 px-4">Tanggal Selesai</th>
                    <th class="py-3 px-4 text-right" v-if="canManage">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
                  <tr v-for="item in empTrainingsList" :key="item.id" class="hover:bg-white transition dark:hover:bg-slate-800/40">
                    <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {{ item.employeeName }}
                      <span class="block text-[10px] text-slate-400 font-normal dark:text-slate-500">{{ item.departmentName || '-' }}</span>
                    </td>
                    <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{{ item.trainingTitle }}</td>
                    <td class="py-3 px-4 text-slate-600 dark:text-slate-400">{{ item.trainingCategory || '-' }}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border"
                        :class="{
                          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30': item.status === 'completed',
                          'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30': item.status === 'in_progress',
                          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30': item.status === 'enrolled',
                          'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30': item.status === 'failed'
                        }">{{ item.status }}</span>
                    </td>
                    <td class="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">{{ item.score || '-' }}</td>
                    <td class="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">{{ item.completionDate || '-' }}</td>
                    <td class="py-3 px-4 text-right" v-if="canManage">
                      <button @click="deleteEmpTraining(item.id)" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Belum ada penugasan pelatihan karyawan.</div>
          </div>
        </div>

        <!-- ================= TAB 4: RIWAYAT GAJI & PROMOSI ================= -->
        <div v-if="activeTab === 'career'" class="space-y-6">
          <!-- Section 1: Kenaikan Gaji -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Riwayat Kenaikan Gaji Karyawan</h3>
                <p class="text-[11px] text-slate-400 dark:text-slate-500">Catat dan pantau riwayat kenaikan/penyesuaian gaji berkala.</p>
              </div>
              <button v-if="canManage" @click="showAddSalaryModal = true"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5">
                <Plus class="w-4 h-4" /><span>Catat Kenaikan Gaji</span>
              </button>
            </div>

            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800">
              <div v-if="loadingSalaryHistories" class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Memuat riwayat gaji...</div>
              <div v-else-if="salaryHistoriesList.length" class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-700">
                    <tr>
                      <th class="py-3 px-4">Tgl Berlaku</th>
                      <th class="py-3 px-4">Karyawan</th>
                      <th class="py-3 px-4">Gaji Lama</th>
                      <th class="py-3 px-4">Gaji Baru</th>
                      <th class="py-3 px-4">Kenaikan (%)</th>
                      <th class="py-3 px-4">Alasan / Catatan</th>
                      <th class="py-3 px-4 text-right" v-if="canManage">Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
                    <tr v-for="item in salaryHistoriesList" :key="item.id" class="hover:bg-white transition dark:hover:bg-slate-800/40">
                      <td class="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">{{ item.effectiveDate }}</td>
                      <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {{ item.employeeName }}
                        <span class="block text-[10px] text-slate-400 font-mono dark:text-slate-500">{{ item.employeeCode }}</span>
                      </td>
                      <td class="py-3 px-4 font-mono text-slate-500 dark:text-slate-500">Rp {{ Number(item.oldSalary).toLocaleString('id-ID') }}</td>
                      <td class="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">Rp {{ Number(item.newSalary).toLocaleString('id-ID') }}</td>
                      <td class="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">+{{ item.incrementPercentage }}%</td>
                      <td class="py-3 px-4 text-slate-600 max-w-xs truncate dark:text-slate-400">{{ item.reason || '-' }}</td>
                      <td class="py-3 px-4 text-right" v-if="canManage">
                        <button @click="deleteSalaryHistory(item.id)" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10">
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Belum ada riwayat kenaikan gaji.</div>
            </div>
          </div>

          <!-- Section 2: Promosi & Mutasi -->
          <div class="space-y-3 pt-4 border-t border-slate-200/70 dark:border-slate-800">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Riwayat Promosi & Mutasi Jabatan</h3>
                <p class="text-[11px] text-slate-400 dark:text-slate-500">Catat dan pantau perjalanan karir serta perubahan posisi karyawan.</p>
              </div>
              <button v-if="canManage" @click="showAddPromotionModal = true"
                class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5">
                <Plus class="w-4 h-4" /><span>Catat Promosi / Mutasi</span>
              </button>
            </div>

            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800">
              <div v-if="loadingPromotions" class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Memuat riwayat promosi...</div>
              <div v-else-if="promotionsList.length" class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-700">
                    <tr>
                      <th class="py-3 px-4">Tgl Promosi</th>
                      <th class="py-3 px-4">Karyawan</th>
                      <th class="py-3 px-4">Catatan Perubahan</th>
                      <th class="py-3 px-4 text-right" v-if="canManage">Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
                    <tr v-for="item in promotionsList" :key="item.id" class="hover:bg-white transition dark:hover:bg-slate-800/40">
                      <td class="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">{{ item.promotionDate }}</td>
                      <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {{ item.employeeName }}
                        <span class="block text-[10px] text-indigo-600 font-mono dark:text-indigo-400">{{ item.employeeCode }}</span>
                      </td>
                      <td class="py-3 px-4 text-slate-700 max-w-sm font-medium dark:text-slate-300">{{ item.notes || 'Promosi / Mutasi Jabatan' }}</td>
                      <td class="py-3 px-4 text-right" v-if="canManage">
                        <button @click="deletePromotion(item.id)" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10">
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Belum ada riwayat promosi.</div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- ======================== MODALS ======================== -->

    <!-- MODAL: Input per tanggal (dari kalender) -->
    <Modal :open="showDayModal" :title="`Catat Kehadiran — ${selectedDayDate}`" @close="showDayModal = false">
      <form @submit.prevent="saveDayAttendance" class="space-y-3 text-xs">
        <div v-if="selectedDayRecord" class="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-[11px] dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400">
          <Info class="w-4 h-4 shrink-0" />
          Data sudah ada — ini akan menimpa catatan yang sudah ada.
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Status Kehadiran</label>
            <select v-model="attendanceForm.status" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
              <option value="present">Hadir (Present)</option>
              <option value="late">Terlambat (Late)</option>
              <option value="absent">Absen (Absent)</option>
              <option value="leave">Cuti (Leave)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Keterlambatan (Menit)</label>
            <input v-model="attendanceForm.lateMinutes" type="number" min="0" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Jam Masuk</label>
            <input v-model="attendanceForm.checkIn" type="time" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Jam Keluar</label>
            <input v-model="attendanceForm.checkOut" type="time" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Lembur (Jam)</label>
          <input v-model="attendanceForm.overtimeHours" type="number" step="0.5" min="0" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
        </div>
        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" @click="showDayModal = false" class="px-3 py-1.5 text-slate-500 dark:text-slate-400">Batal</button>
          <button type="submit" class="px-4 py-1.5 bg-indigo-600 text-white font-semibold rounded-xl">Simpan</button>
        </div>
      </form>
    </Modal>

    <!-- MODAL: EVALUASI KPI -->
    <Modal :open="showAddEvaluationModal" title="Input Evaluasi KPI Karyawan" @close="showAddEvaluationModal = false">
      <form @submit.prevent="saveEvaluation" class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Pilih Karyawan</label>
          <select v-model="evaluationForm.employeeId" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
            <option value="" disabled>Pilih Karyawan (Tersisa {{ availableEmployeesForEvaluation.length }})</option>
            <option v-for="emp in availableEmployeesForEvaluation" :key="emp.id" :value="emp.id">{{ emp.employeeCode }} - {{ emp.firstName }} {{ emp.lastName || '' }}</option>
          </select>
          <p v-if="availableEmployeesForEvaluation.length === 0" class="text-[11px] text-amber-600 font-semibold mt-1 dark:text-amber-400">
            Seluruh karyawan sudah memiliki catatan evaluasi KPI pada periode {{ evaluationForm.period }}.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Periode Evaluasi</label>
            <select v-model="evaluationForm.period" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
              <option value="" disabled>Pilih Periode</option>
              <option v-for="p in periodsList" :key="p.id" :value="p.periodCode">
                {{ p.periodCode }} - {{ p.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Tanggal Evaluasi</label>
            <input v-model="evaluationForm.evaluatedAt" type="date" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Skor KPI (0–100)</label>
            <input v-model="evaluationForm.kpiScore" type="number" min="0" max="100" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Beban Kerja (1–10)</label>
            <input v-model="evaluationForm.workloadScore" type="number" min="1" max="10" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1.5 dark:text-slate-400">Rating Evaluasi Kinerja</label>
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 dark:bg-slate-800/60 dark:border-slate-700">
            <!-- Clickable Interactive Stars -->
            <div class="flex items-center gap-2">
              <button
                v-for="star in 3"
                :key="star"
                type="button"
                @click="evaluationForm.rating = star === 3 ? 'exceeds' : star === 2 ? 'meets' : 'needs_improvement'"
                class="p-2 rounded-xl border transition flex items-center gap-1 cursor-pointer"
                :class="(evaluationForm.rating === 'exceeds' ? 3 : evaluationForm.rating === 'meets' ? 2 : 1) >= star
                  ? 'bg-amber-50 border-amber-300 text-amber-500 shadow-2xs dark:bg-amber-500/20 dark:border-amber-500/40'
                  : 'bg-white border-slate-200 text-slate-300 hover:text-amber-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-600'"
              >
                <Star class="w-5 h-5" :class="(evaluationForm.rating === 'exceeds' ? 3 : evaluationForm.rating === 'meets' ? 2 : 1) >= star ? 'fill-amber-400 text-amber-400' : ''" />
                <span class="text-xs font-bold font-mono">{{ star }}</span>
              </button>
            </div>

            <!-- Dynamic Rating Label & Description -->
            <div class="pt-1">
              <span
                class="inline-block px-2.5 py-1 text-xs font-extrabold uppercase rounded-lg border"
                :class="{
                  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30': evaluationForm.rating === 'exceeds',
                  'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-500/30': evaluationForm.rating === 'meets',
                  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30': evaluationForm.rating === 'needs_improvement'
                }"
              >
                {{ evaluationForm.rating === 'exceeds' ? '★★★ Sangat Baik (Kinerja Melebihi Ekspektasi)' : evaluationForm.rating === 'meets' ? '★★ Sesuai Target (Kinerja Memenuhi Standar)' : '★ Perlu Perbaikan (Kinerja Masih Kurang)' }}
              </span>
            </div>
          </div>
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Catatan / Feedback</label>
          <textarea v-model="evaluationForm.notes" rows="2" placeholder="Catatan kinerja karyawan..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"></textarea>
        </div>
        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" @click="showAddEvaluationModal = false" class="px-3 py-1.5 text-slate-500 dark:text-slate-400">Batal</button>
          <button type="submit" class="px-4 py-1.5 bg-indigo-600 text-white font-semibold rounded-xl">Simpan Evaluasi</button>
        </div>
      </form>
    </Modal>

    <!-- MODAL: TUGASKAN PELATIHAN -->
    <Modal :open="showAddEmpTrainingModal" title="Tugaskan Pelatihan Karyawan" @close="showAddEmpTrainingModal = false">
      <form @submit.prevent="saveEmpTraining" class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Pilih Karyawan</label>
          <select v-model="empTrainingForm.employeeId" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
            <option value="" disabled>Pilih Karyawan</option>
            <option v-for="emp in allEmployees" :key="emp.id" :value="emp.id">{{ emp.employeeCode }} - {{ emp.firstName }} {{ emp.lastName || '' }}</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Pilih Modul Pelatihan</label>
          <select v-model="empTrainingForm.trainingId" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
            <option value="" disabled>Pilih Training</option>
            <option v-for="t in allTrainings" :key="t.id" :value="t.id">{{ t.title }} ({{ t.category }})</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Status</label>
            <select v-model="empTrainingForm.status" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
              <option value="enrolled">Enrolled (Terdaftar)</option>
              <option value="in_progress">In Progress (Sedang Berlangsung)</option>
              <option value="completed">Completed (Selesai)</option>
              <option value="failed">Failed (Gagal)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Nilai Akhir (Opsional)</label>
            <input v-model="empTrainingForm.score" type="number" min="0" max="100" placeholder="85" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Tanggal Selesai (Opsional)</label>
          <input v-model="empTrainingForm.completionDate" type="date" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
        </div>
        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" @click="showAddEmpTrainingModal = false" class="px-3 py-1.5 text-slate-500 dark:text-slate-400">Batal</button>
          <button type="submit" class="px-4 py-1.5 bg-indigo-600 text-white font-semibold rounded-xl">Simpan Penugasan</button>
        </div>
      </form>
    </Modal>

    <!-- MODAL: CATAT KENAIKAN GAJI -->
    <Modal :open="showAddSalaryModal" title="Catat Kenaikan Gaji Karyawan" @close="showAddSalaryModal = false">
      <form @submit.prevent="saveSalaryHistory" class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Pilih Karyawan</label>
          <select v-model="salaryForm.employeeId" @change="onSalaryEmployeeSelect" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
            <option value="" disabled>Pilih Karyawan</option>
            <option v-for="emp in allEmployees" :key="emp.id" :value="emp.id">{{ emp.employeeCode }} - {{ emp.firstName }} {{ emp.lastName || '' }} (Gaji: Rp {{ Number(emp.currentSalary || 0).toLocaleString('id-ID') }})</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Gaji Lama (Rp)</label>
            <input v-model="salaryForm.oldSalary" readonly class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400" />
          </div>
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Gaji Baru (Rp)</label>
            <input v-model="salaryForm.newSalary" type="number" required placeholder="18000000" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Tanggal Berlaku</label>
          <input v-model="salaryForm.effectiveDate" type="date" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Alasan / Catatan Penyesuaian</label>
          <input v-model="salaryForm.reason" placeholder="Annual Performance Review 2026" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
        </div>
        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" @click="showAddSalaryModal = false" class="px-3 py-1.5 text-slate-500 dark:text-slate-400">Batal</button>
          <button type="submit" class="px-4 py-1.5 bg-indigo-600 text-white font-semibold rounded-xl">Simpan Kenaikan Gaji</button>
        </div>
      </form>
    </Modal>

    <!-- MODAL: CATAT PROMOSI / MUTASI -->
    <Modal :open="showAddPromotionModal" title="Catat Promosi / Mutasi Jabatan" @close="showAddPromotionModal = false">
      <form @submit.prevent="savePromotion" class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Pilih Karyawan</label>
          <select v-model="promotionForm.employeeId" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
            <option value="" disabled>Pilih Karyawan</option>
            <option v-for="emp in allEmployees" :key="emp.id" :value="emp.id">{{ emp.employeeCode }} - {{ emp.firstName }} {{ emp.lastName || '' }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Departemen Baru (Opsional)</label>
            <select v-model="promotionForm.newDepartmentId" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
              <option value="">Tidak Berubah</option>
              <option v-for="dept in allDepartments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Jabatan Baru (Opsional)</label>
            <select v-model="promotionForm.newPositionId" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
              <option value="">Tidak Berubah</option>
              <option v-for="pos in allPositions" :key="pos.id" :value="pos.id">{{ pos.title }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Tanggal Efektif Promosi</label>
          <input v-model="promotionForm.promotionDate" type="date" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Catatan SK Promosi / Mutasi</label>
          <textarea v-model="promotionForm.notes" rows="2" placeholder="Nomor SK Promosi & rincian tugas baru..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"></textarea>
        </div>
        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" @click="showAddPromotionModal = false" class="px-3 py-1.5 text-slate-500 dark:text-slate-400">Batal</button>
          <button type="submit" class="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-xl">Simpan Promosi</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import api from '../api/axios';
import { useAuthStore } from '../stores/auth';
import {
  Calendar,
  BarChart3,
  GraduationCap,
  FileText,
  ListFilter,
  Users,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Plus,
  Trash2,
  Info,
  Search,
  TrendingUp,
  Award,
  Star
} from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';

const authStore = useAuthStore();
const activeTab = ref('attendance');
const attendanceMode = ref('calendar');

const canManage = computed(() => ['superadmin', 'admin_ti', 'hr'].includes(authStore.userRole));

const allEmployees = ref([]);
const allDepartments = ref([]);
const employeeSearchQuery = ref('');
const showEmployeeDropdown = ref(false);

const filteredEmployeesLimit5 = computed(() => {
  if (!employeeSearchQuery.value) {
    return allEmployees.value.slice(0, 5);
  }
  const q = employeeSearchQuery.value.toLowerCase();
  return allEmployees.value
    .filter(emp =>
      emp.firstName.toLowerCase().includes(q) ||
      (emp.lastName && emp.lastName.toLowerCase().includes(q)) ||
      emp.employeeCode.toLowerCase().includes(q)
    )
    .slice(0, 5);
});

const selectedEmployeeLabel = computed(() => {
  const emp = allEmployees.value.find(e => String(e.id) === String(calendarEmployeeId.value));
  return emp ? `${emp.employeeCode} - ${emp.firstName} ${emp.lastName || ''}` : 'Cari / Pilih Karyawan...';
});

const selectCalendarEmployee = (emp) => {
  calendarEmployeeId.value = emp.id;
  showEmployeeDropdown.value = false;
  employeeSearchQuery.value = '';
};
const allTrainings = ref([]);
const attendancesList = ref([]);
const evaluationsList = ref([]);
const empTrainingsList = ref([]);
const loadingAttendances = ref(true);
const loadingEvaluations = ref(true);
const loadingTrainings = ref(true);

// ============ CALENDAR STATE ============
const today = new Date();
const calendarYear = ref(today.getFullYear());
const calendarMonth = ref(today.getMonth()); // 0-indexed
const calendarEmployeeId = ref('');

const calendarMonthLabel = computed(() => {
  const d = new Date(calendarYear.value, calendarMonth.value, 1);
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
});

const prevMonth = () => {
  if (calendarMonth.value === 0) { calendarMonth.value = 11; calendarYear.value--; }
  else calendarMonth.value--;
};
const nextMonth = () => {
  if (calendarMonth.value === 11) { calendarMonth.value = 0; calendarYear.value++; }
  else calendarMonth.value++;
};

const calendarStartDay = computed(() => {
  return new Date(calendarYear.value, calendarMonth.value, 1).getDay();
});

const calendarDays = computed(() => {
  const year = calendarYear.value;
  const month = calendarMonth.value;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = today.toISOString().slice(0, 10);

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dow = new Date(year, month, day).getDay();
    const record = attendancesList.value.find(
      a => a.date === dateStr && String(a.employeeId) === String(calendarEmployeeId.value)
    );
    return { day, date: dateStr, isToday: dateStr === todayStr, isWeekend: dow === 0 || dow === 6, record };
  });
});

const calendarMonthlySummary = computed(() => {
  const days = calendarDays.value.filter(d => d.record);
  return [
    { label: 'Hadir', value: days.filter(d => d.record.status === 'present').length },
    { label: 'Terlambat', value: days.filter(d => d.record.status === 'late').length },
    { label: 'Absen', value: days.filter(d => d.record.status === 'absent').length },
    { label: 'Cuti', value: days.filter(d => d.record.status === 'leave').length },
    { label: 'Total Lembur', value: days.reduce((s, d) => s + parseFloat(d.record.overtimeHours || 0), 0).toFixed(1) + 'j' },
    { label: 'Total Terlambat', value: days.reduce((s, d) => s + parseInt(d.record.lateMinutes || 0), 0) + 'm' },
  ];
});

const monthlySummary = computed(() => {
  const monthStr = `${calendarYear.value}-${String(calendarMonth.value + 1).padStart(2, '0')}`;
  const monthData = attendancesList.value.filter(a => a.date?.startsWith(monthStr));
  const grouped = {};
  monthData.forEach(a => {
    if (!grouped[a.employeeId]) {
      grouped[a.employeeId] = { employeeId: a.employeeId, employeeCode: a.employeeCode, employeeName: a.employeeName, departmentName: a.departmentName, present: 0, late: 0, absent: 0, leave: 0, totalOvertime: 0, totalLate: 0 };
    }
    const g = grouped[a.employeeId];
    if (a.status === 'present') g.present++;
    else if (a.status === 'late') { g.late++; }
    else if (a.status === 'absent') g.absent++;
    else if (a.status === 'leave') g.leave++;
    g.totalOvertime = +(g.totalOvertime + parseFloat(a.overtimeHours || 0)).toFixed(1);
    g.totalLate = g.totalLate + parseInt(a.lateMinutes || 0);
  });
  return Object.values(grouped).map(g => {
    const worked = g.present + g.late;
    const total = worked + g.absent;
    return { ...g, attendancePct: total > 0 ? Math.round((worked / total) * 100) : 100 };
  });
});

const statusList = [
  { value: 'present', label: 'Hadir', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  { value: 'late', label: 'Terlambat', dot: 'bg-amber-500', text: 'text-amber-700' },
  { value: 'absent', label: 'Absen', dot: 'bg-rose-500', text: 'text-rose-700' },
  { value: 'leave', label: 'Cuti', dot: 'bg-sky-500', text: 'text-sky-700' },
];

// ============ DAY MODAL ============
const showDayModal = ref(false);
const selectedDayDate = ref('');
const selectedDayRecord = ref(null);

const openDayModal = (day) => {
  selectedDayDate.value = day.date;
  selectedDayRecord.value = day.record;
  attendanceForm.value = {
    employeeId: calendarEmployeeId.value,
    date: day.date,
    status: day.record?.status || 'present',
    checkIn: day.record?.checkIn || '08:00',
    checkOut: day.record?.checkOut || '17:00',
    lateMinutes: day.record?.lateMinutes || 0,
    overtimeHours: day.record?.overtimeHours || 0,
  };
  showDayModal.value = true;
};

const saveDayAttendance = async () => {
  try {
    if (selectedDayRecord.value) {
      await api.delete(`/operational/attendances/${selectedDayRecord.value.id}`);
    }
    await api.post('/operational/attendances', attendanceForm.value);
    showDayModal.value = false;
    await fetchAttendances();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan data kehadiran');
  }
};

// ============ BULK INPUT ============
const showBulkModal = ref(false);
const bulkDate = ref(today.toISOString().slice(0, 10));
const bulkDeptFilter = ref('');
const bulkDefaultCheckIn = ref('08:00');
const bulkDefaultCheckOut = ref('17:00');
const bulkRows = ref([]);

const applyDefaultTimes = () => {
  bulkRows.value.forEach(row => {
    row.checkIn = bulkDefaultCheckIn.value;
    row.checkOut = bulkDefaultCheckOut.value;
  });
};

watch([attendanceMode, allEmployees], ([mode]) => {
  if (mode === 'bulk') {
    bulkRows.value = allEmployees.value.map(emp => ({
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      employeeName: `${emp.firstName} ${emp.lastName || ''}`,
      departmentId: emp.departmentId,
      status: 'present',
      checkIn: bulkDefaultCheckIn.value,
      checkOut: bulkDefaultCheckOut.value,
      lateMinutes: 0,
      overtimeHours: 0,
    }));
  }
}, { immediate: true });

const applyBulkDeptFilter = () => {
  const mapEmp = emp => ({
    employeeId: emp.id, employeeCode: emp.employeeCode,
    employeeName: `${emp.firstName} ${emp.lastName || ''}`, departmentId: emp.departmentId,
    status: 'present', checkIn: bulkDefaultCheckIn.value, checkOut: bulkDefaultCheckOut.value,
    lateMinutes: 0, overtimeHours: 0,
  });

  if (!bulkDeptFilter.value) {
    bulkRows.value = allEmployees.value.map(mapEmp);
  } else {
    const targetDept = allDepartments.value.find(d => String(d.id) === String(bulkDeptFilter.value));
    const targetName = targetDept ? targetDept.name : '';

    bulkRows.value = allEmployees.value
      .filter(emp =>
        String(emp.departmentId) === String(bulkDeptFilter.value) ||
        (targetName && emp.departmentName === targetName)
      )
      .map(mapEmp);
  }
};

const savingBulk = ref(false);

const saveBulkAttendance = async () => {
  if (!bulkRows.value.length) {
    alert('Tidak ada data karyawan untuk disimpan.');
    return;
  }
  savingBulk.value = true;
  try {
    const items = bulkRows.value.map(row => ({
      employeeId: row.employeeId,
      date: bulkDate.value,
      status: row.status,
      checkIn: row.checkIn || bulkDefaultCheckIn.value,
      checkOut: row.checkOut || bulkDefaultCheckOut.value,
      lateMinutes: row.lateMinutes || 0,
      overtimeHours: row.overtimeHours || 0,
    }));
    await api.post('/operational/attendances', { items });
    alert(`Berhasil menyimpan data kehadiran untuk ${items.length} karyawan pada tanggal ${bulkDate.value}.`);
    attendanceMode.value = 'calendar';
    await fetchAttendances();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan bulk kehadiran');
  } finally {
    savingBulk.value = false;
  }
};

// ============ FORMS ============
const attendanceForm = ref({
  employeeId: '', date: today.toISOString().slice(0, 10),
  status: 'present', checkIn: '08:00', checkOut: '17:00', lateMinutes: 0, overtimeHours: 0,
});

const evaluationForm = ref({
  employeeId: '', period: '', kpiScore: 85, workloadScore: 6,
  rating: 'meets', notes: '', evaluatedAt: today.toISOString().slice(0, 10),
});

const availableEmployeesForEvaluation = computed(() => {
  if (!evaluationForm.value.period) return allEmployees.value;
  const currentPeriod = evaluationForm.value.period.trim().toUpperCase();
  
  // Ambil daftar employeeId yang sudah memiliki evaluasi pada periode ini
  const existingEmployeeIds = evaluationsList.value
    .filter(ev => ev.period && ev.period.trim().toUpperCase() === currentPeriod)
    .map(ev => String(ev.employeeId));

  // Tapis karyawan agar yang sudah dievaluasi di periode ini tidak muncul lagi
  return allEmployees.value.filter(emp => !existingEmployeeIds.includes(String(emp.id)));
});

const empTrainingForm = ref({
  employeeId: '', trainingId: '', status: 'enrolled', score: '', completionDate: '',
});

const showAddEvaluationModal = ref(false);
const showAddEmpTrainingModal = ref(false);

// ============ FETCH ============
const fetchMasters = async () => {
  try {
    const [empRes, trainRes, deptRes] = await Promise.all([
      api.get('/employees', { params: { limit: 500 } }),
      api.get('/trainings', { params: { limit: 100 } }),
      api.get('/departments'),
    ]);
    allEmployees.value = empRes.data.data;
    allTrainings.value = trainRes.data.data;
    allDepartments.value = deptRes.data.data;
  } catch (err) {
    console.error('Error fetching masters:', err);
  }
};

const periodsList = ref([]);
const selectedPeriodId = ref('');

const fetchPeriods = async () => {
  try {
    const res = await api.get('/analytics/periods');
    periodsList.value = res.data.data || [];
  } catch (err) {
    console.error('Error fetching periods:', err);
  }
};

const onPeriodChange = () => {
  fetchAttendances();
  fetchEvaluations();
};

const fetchAttendances = async () => {
  loadingAttendances.value = true;
  try {
    const params = { limit: 1000 };
    if (selectedPeriodId.value) params.periodId = selectedPeriodId.value;
    const res = await api.get('/operational/attendances', { params });
    attendancesList.value = res.data.data;
  } catch (err) { console.error(err); }
  finally { loadingAttendances.value = false; }
};

const fetchEvaluations = async () => {
  loadingEvaluations.value = true;
  try {
    const params = {};
    if (selectedPeriodId.value) params.periodId = selectedPeriodId.value;
    const res = await api.get('/operational/evaluations', { params });
    evaluationsList.value = res.data.data;
  } catch (err) { console.error(err); }
  finally { loadingEvaluations.value = false; }
};

const fetchEmpTrainings = async () => {
  loadingTrainings.value = true;
  try {
    const res = await api.get('/operational/employee-trainings');
    empTrainingsList.value = res.data.data;
  } catch (err) { console.error(err); }
  finally { loadingTrainings.value = false; }
};

// ============ SAVE / DELETE ============
const saveEvaluation = async () => {
  try {
    await api.post('/operational/evaluations', evaluationForm.value);
    showAddEvaluationModal.value = false;
    fetchEvaluations();
  } catch (err) { alert(err.response?.data?.message || 'Gagal menyimpan evaluasi KPI'); }
};

const saveEmpTraining = async () => {
  try {
    await api.post('/operational/employee-trainings', empTrainingForm.value);
    showAddEmpTrainingModal.value = false;
    fetchEmpTrainings();
  } catch (err) { alert(err.response?.data?.message || 'Gagal menugaskan pelatihan'); }
};

const deleteAttendance = async (id) => {
  if (!confirm('Hapus data kehadiran ini?')) return;
  try { await api.delete(`/operational/attendances/${id}`); fetchAttendances(); }
  catch (err) { alert(err.response?.data?.message || 'Gagal menghapus data kehadiran'); }
};

const deleteEvaluation = async (id) => {
  if (!confirm('Hapus data evaluasi KPI ini?')) return;
  try { await api.delete(`/operational/evaluations/${id}`); fetchEvaluations(); }
  catch (err) { alert(err.response?.data?.message || 'Gagal menghapus evaluasi'); }
};

const deleteEmpTraining = async (id) => {
  if (!confirm('Hapus penugasan pelatihan ini?')) return;
  try { await api.delete(`/operational/employee-trainings/${id}`); fetchEmpTrainings(); }
  catch (err) { alert(err.response?.data?.message || 'Gagal menghapus penugasan pelatihan'); }
};

const allPositions = ref([]);
const salaryHistoriesList = ref([]);
const promotionsList = ref([]);
const loadingSalaryHistories = ref(true);
const loadingPromotions = ref(true);

const showAddSalaryModal = ref(false);
const showAddPromotionModal = ref(false);

const salaryForm = ref({
  employeeId: '',
  oldSalary: 0,
  newSalary: '',
  effectiveDate: today.toISOString().slice(0, 10),
  reason: '',
});

const promotionForm = ref({
  employeeId: '',
  newDepartmentId: '',
  newPositionId: '',
  promotionDate: today.toISOString().slice(0, 10),
  notes: '',
});

const onSalaryEmployeeSelect = () => {
  const emp = allEmployees.value.find(e => String(e.id) === String(salaryForm.value.employeeId));
  if (emp) {
    salaryForm.value.oldSalary = emp.currentSalary || 0;
  }
};

const fetchSalaryHistories = async () => {
  loadingSalaryHistories.value = true;
  try {
    const res = await api.get('/operational/salary-histories');
    salaryHistoriesList.value = res.data.data;
  } catch (err) { console.error(err); }
  finally { loadingSalaryHistories.value = false; }
};

const fetchPromotions = async () => {
  loadingPromotions.value = true;
  try {
    const res = await api.get('/operational/promotions');
    promotionsList.value = res.data.data;
  } catch (err) { console.error(err); }
  finally { loadingPromotions.value = false; }
};

const fetchMastersAll = async () => {
  try {
    const [empRes, trainRes, deptRes, posRes] = await Promise.all([
      api.get('/employees', { params: { limit: 500 } }),
      api.get('/trainings', { params: { limit: 100 } }),
      api.get('/departments'),
      api.get('/positions'),
    ]);
    allEmployees.value = empRes.data.data;
    allTrainings.value = trainRes.data.data;
    allDepartments.value = deptRes.data.data;
    allPositions.value = posRes.data.data;
  } catch (err) {
    console.error('Error fetching masters:', err);
  }
};

const saveSalaryHistory = async () => {
  try {
    await api.post('/operational/salary-histories', salaryForm.value);
    showAddSalaryModal.value = false;
    await fetchMastersAll();
    fetchSalaryHistories();
  } catch (err) { alert(err.response?.data?.message || 'Gagal menyimpan kenaikan gaji'); }
};

const savePromotion = async () => {
  try {
    await api.post('/operational/promotions', promotionForm.value);
    showAddPromotionModal.value = false;
    await fetchMastersAll();
    fetchPromotions();
  } catch (err) { alert(err.response?.data?.message || 'Gagal menyimpan data promosi'); }
};

const deleteSalaryHistory = async (id) => {
  if (!confirm('Hapus riwayat kenaikan gaji ini?')) return;
  try { await api.delete(`/operational/salary-histories/${id}`); fetchSalaryHistories(); }
  catch (err) { alert(err.response?.data?.message || 'Gagal menghapus riwayat gaji'); }
};

const deletePromotion = async (id) => {
  if (!confirm('Hapus riwayat promosi ini?')) return;
  try { await api.delete(`/operational/promotions/${id}`); fetchPromotions(); }
  catch (err) { alert(err.response?.data?.message || 'Gagal menghapus data promosi'); }
};

onMounted(async () => {
  await fetchMastersAll();
  fetchPeriods();
  fetchAttendances();
  fetchEvaluations();
  fetchEmpTrainings();
  fetchSalaryHistories();
  fetchPromotions();
});
</script>

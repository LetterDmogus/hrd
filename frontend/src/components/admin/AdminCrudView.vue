<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div class="relative flex-1 max-w-md">
        <Search class="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
        <input v-model="searchQuery" type="text" :placeholder="searchPlaceholder"
          class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800" />
      </div>
      <button v-if="canManage" @click="openAdd"
        class="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-2xl shadow-sm shadow-indigo-200 dark:shadow-black/40 transition flex items-center justify-center gap-1.5">
        <Plus class="w-4 h-4" /> <span>{{ addLabel }}</span>
      </button>
    </div>

    <div class="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800">
      <div v-if="loading" class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">{{ loadingText }}</div>
      <div v-else-if="filteredRows.length" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead
            class="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-800">
            <tr>
              <th v-for="column in columns" :key="column.key" class="py-3 px-4"
                :class="column.align === 'right' ? 'text-right' : ''">{{ column.label }}</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
            <tr v-for="row in filteredRows" :key="row.id" class="hover:bg-white transition dark:hover:bg-slate-800/40">
              <td v-for="column in columns" :key="column.key" class="py-3 px-4"
                :class="column.align === 'right' ? 'text-right' : ''">
                <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                  <span v-if="column.type === 'status'"
                    class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border"
                    :class="column.statusClass?.(row) || 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'">{{ column.format
                      ? column.format(row[column.key], row) : row[column.key] }}</span>
                  <span v-else>{{ column.format ? column.format(row[column.key], row) : (row[column.key] ?? '-')
                    }}</span>
                </slot>
              </td>
              <td class="py-3 px-4 text-right space-x-1">
                <button v-if="canManage" @click="openEdit(row)"
                  class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10"
                  title="Edit">
                  <Pencil class="w-4 h-4" />
                </button>
                <button v-if="canManage" @click="askRemove(row)"
                  class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10" title="Hapus">
                  <Trash2 class="w-4 h-4" />
                </button>
                <slot name="row-actions" :row="row" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">{{ emptyText }}</div>
    </div>

    <div v-if="pagination.totalPages > 1" class="flex justify-center items-center gap-2 mt-4">
      <button v-if="pagination.hasPreviousPage" @click="fetchRows(pagination.page - 1)"
        class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10">
        <ChevronLeft class="w-6 h-6" />
      </button>
      <button v-for="page in pagination.totalPages" :key="page" @click="fetchRows(page)"
        class="font-medium w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10">{{
        page }}</button>
      <button v-if="pagination.hasNextPage" @click="fetchRows(pagination.page + 1)"
        class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10">
        <ChevronRight class="w-6 h-6" />
      </button>
    </div>

    <Modal :open="showModal" :title="isEdit ? `Edit ${resourceLabel}` : addLabel" @close="showModal = false">
      <form @submit.prevent="save" class="space-y-3.5 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div v-for="field in fields" :key="field.key">
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">{{ field.label }}</label>
            <select v-if="field.type === 'select'" v-model="form[field.key]" :required="field.required"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
              <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}
              </option>
            </select>
            <label v-else-if="field.type === 'checkbox'" class="flex items-center gap-2 py-2"><input
                v-model="form[field.key]" type="checkbox" class="rounded border-slate-300 text-indigo-600 dark:border-slate-600" /><span
                class="text-slate-700 dark:text-slate-300">{{ field.checkboxLabel || field.label }}</span></label>
            <input v-else v-model="form[field.key]" :type="field.type || 'text'" :required="field.required"
              :placeholder="field.placeholder"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800"><button type="button"
            @click="showModal = false"
            class="px-3 py-1.5 text-slate-500 hover:text-slate-800 transition dark:text-slate-400 dark:hover:text-slate-100">Batal</button><button type="submit"
            class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl">Simpan</button>
        </div>
      </form>
    </Modal>
    <Modal :open="showDeleteModal" title="Konfirmasi Hapus" @close="showDeleteModal = false">
      <div class="space-y-4 text-xs"><p class="text-slate-600 dark:text-slate-400">Yakin ingin memindahkan <strong class="text-slate-900 dark:text-white">{{ deleteLabel }}</strong> ke Recycle Bin?</p><div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800"><button type="button" @click="showDeleteModal = false" class="px-3 py-1.5 text-slate-500 dark:text-slate-400">Batal</button><button type="button" @click="remove" class="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl">Hapus</button></div></div>
    </Modal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-vue-next';
import api from '../../api/axios';
import Modal from '../ui/Modal.vue';

const props = defineProps({
  resourceLabel: { type: String, required: true }, endpoint: { type: String, required: true },
  columns: { type: Array, required: true }, fields: { type: Array, required: true },
  initialForm: { type: Object, required: true }, searchPlaceholder: { type: String, default: 'Cari data...' },
  addLabel: { type: String, default: 'Tambah Data' }, loadingText: { type: String, default: 'Memuat data...' }, emptyText: { type: String, default: 'Tidak ditemukan data.' },
  canManage: { type: Boolean, default: false }, pageSize: { type: Number, default: 10 }, paginated: { type: Boolean, default: true },
});
const emit = defineEmits(['saved', 'deleted']);
const rows = ref([]); const loading = ref(true); const searchQuery = ref(''); const showModal = ref(false); const showDeleteModal = ref(false); const deleteTarget = ref(null); const isEdit = ref(false); const activeId = ref(null); const form = ref({});
const pagination = ref({ page: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false });
const filteredRows = computed(() => { const q = searchQuery.value.toLowerCase(); if (!q) return rows.value; return rows.value.filter(row => props.columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q)) || String(row.id).includes(q)); });
const fetchRows = async (page = 1) => { loading.value = true; try { const res = await api.get(props.endpoint, { params: props.paginated ? { page, limit: props.pageSize } : undefined }); rows.value = res.data.data; if (res.data.pagination) pagination.value = res.data.pagination; } catch (err) { alert(err.response?.data?.message || `Gagal memuat data ${props.resourceLabel.toLowerCase()}`); } finally { loading.value = false; } };
const openAdd = () => { isEdit.value = false; activeId.value = null; form.value = { ...props.initialForm }; showModal.value = true; };
const openEdit = row => { isEdit.value = true; activeId.value = row.id; form.value = Object.fromEntries(props.fields.map(field => [field.key, row[field.key] ?? props.initialForm[field.key]])); showModal.value = true; };
const save = async () => { try { if (isEdit.value) await api.put(`${props.endpoint}/${activeId.value}`, form.value); else await api.post(props.endpoint, form.value); showModal.value = false; await fetchRows(pagination.value.page || 1); emit('saved'); } catch (err) { alert(err.response?.data?.message || `Gagal menyimpan data ${props.resourceLabel.toLowerCase()}`); } };
const deleteLabel = computed(() => deleteTarget.value ? props.columns.map(c => deleteTarget.value[c.key]).find(Boolean) || deleteTarget.value.id : 'data ini');
const askRemove = row => { deleteTarget.value = row; showDeleteModal.value = true; };
const remove = async () => { if (!deleteTarget.value) return; try { await api.delete(`${props.endpoint}/${deleteTarget.value.id}`); showDeleteModal.value = false; deleteTarget.value = null; await fetchRows(pagination.value.page || 1); emit('deleted'); } catch (err) { alert(err.response?.data?.message || `Gagal menghapus ${props.resourceLabel.toLowerCase()}`); } };
onMounted(fetchRows);
defineExpose({ reload: () => fetchRows(pagination.value.page || 1) });
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LogOut, AlertTriangle, Download } from 'lucide-vue-next';
import { useAuditData, type AuditFilters } from '../composables/useAuditData';
import type { AuditRole, AuditRecord } from '../types/audit';
import Sidebar from '../components/Sidebar.vue';
import AuditTable from '../components/AuditTable.vue';
import AiLiaison from '../components/AiLiaison.vue';
import AuditDrawer from '../components/AuditDrawer.vue';
import ExportModal from '../components/ExportModal.vue';
import { useExport } from '../composables/useExport';

const router = useRouter();
const { loading, fetchPage, regenerateAssessment, updateAssessmentItems } = useAuditData();
const { generateExecutiveReport } = useExport();

const role = ref<AuditRole>('DEPT_USER');
const filters = ref<AuditFilters>({
  department: 'All',
  mode: 'triage'
});

const currentData = ref<AuditRecord[]>([]);
const totalRecords = ref(0);

const currentPage = ref(1);
const pageSize = 20;

const isDrawerOpen = ref(false);
const selectedRecord = ref<AuditRecord | null>(null);
const isGenerating = ref(false);

const isExportModalOpen = ref(false);

const handleExport = (format: 'pdf' | 'excel', start: string, end: string) => {
    generateExecutiveReport(filters.value, format, start, end);
    isExportModalOpen.value = false;
};

const handleRowClick = (record: AuditRecord) => {
    selectedRecord.value = JSON.parse(JSON.stringify(record));
    isDrawerOpen.value = true;
};

const handleRegenerate = async (id: string) => {
    isGenerating.value = true;
    try {
        const updated = await regenerateAssessment(id);
        const idx = currentData.value.findIndex(r => r.id === id);
        if (idx !== -1) currentData.value[idx] = updated;
        selectedRecord.value = JSON.parse(JSON.stringify(updated));
    } catch (e) {
        console.error(e);
    } finally {
        isGenerating.value = false;
    }
};

const handleSaveItems = async (id: string, items: {item: string, cost: number}[]) => {
    try {
        const updated = await updateAssessmentItems(id, items);
        const idx = currentData.value.findIndex(r => r.id === id);
        if (idx !== -1) currentData.value[idx] = updated;
        selectedRecord.value = JSON.parse(JSON.stringify(updated));
    } catch(e) {
        console.error(e);
    }
};

const loadData = async () => {
  const result = await fetchPage(currentPage.value, pageSize, filters.value);
  currentData.value = result.data;
  totalRecords.value = result.total;
};

const handleLogout = () => {
  sessionStorage.removeItem('user');
  document.cookie = 'auth_token=; Max-Age=0; path=/;';
  router.push('/login');
};

const handlePageChange = (delta: number) => {
  const newPage = currentPage.value + delta;
  const maxPage = Math.ceil(totalRecords.value / pageSize);
  if (newPage >= 1 && newPage <= maxPage) {
    currentPage.value = newPage;
    loadData();
  }
};

onMounted(() => {
  const userData = sessionStorage.getItem('user');
  if (userData) {
    try {
      const parsedUser = JSON.parse(userData);
      role.value = parsedUser.role === 'admin' ? 'ADMIN' : 'DEPT_USER';
      if (role.value === 'DEPT_USER') {
        filters.value.department = parsedUser.department || 'Housekeeping';
      }
    } catch(e) { }
  } else {
    router.push('/login');
    return;
  }
  loadData();
});
</script>

<template>
  <div class="h-screen w-full bg-slate-950 text-slate-100 flex overflow-hidden selection:bg-emerald-500/30">
    <!-- Left Sidebar -->
    <Sidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- Top Header Area -->
      <header class="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur z-20 flex-shrink-0">
        <h2 class="text-xl font-bold tracking-tight text-white flex items-center gap-3">
          The Triage Room
          <span class="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Critical & Discrepancies
          </span>
        </h2>
        
        <div class="flex items-center gap-4">
          <button @click="isExportModalOpen = true" class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
            <Download class="w-3.5 h-3.5" />
            Export Triage
          </button>
          <button @click="handleLogout" class="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white" title="Logout">
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- Dashboard Body -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_0%_0%,rgba(244,63,94,0.03),transparent_50%_100%)]">
        <div class="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col min-h-full">
          
          <!-- Alert Banner -->
          <div class="mb-6 rounded-lume border border-rose-500/20 bg-rose-500/10 p-4 shadow-xl backdrop-blur-xl flex items-start gap-4">
            <AlertTriangle class="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="text-rose-100 font-medium mb-1">Attention Required</h3>
              <p class="text-sm text-rose-200/70">Showing only records flagged as "Critical" (Negative Sentiment & 1 Star) or "Discrepancy" (Negative Sentiment & 5 Stars).</p>
            </div>
          </div>

          <!-- Data Grid -->
          <div class="flex-1 flex flex-col min-h-0 bg-slate-900/20 rounded-lume border border-slate-800/60 shadow-inner relative">
            <AuditTable 
              :data="currentData" 
              :role="role" 
              :loading="loading"
              @row-click="handleRowClick"
              class="flex-1 overflow-y-auto"
            />
          </div>

        </div>
        
        <!-- Pinned Pagination Footer -->
        <div class="sticky bottom-0 w-full z-30 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 px-6 py-4 mt-auto">
          <div class="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between relative min-h-[44px]">
            <p class="text-sm text-slate-400 hidden md:block">
              Showing <span class="font-medium text-slate-200">{{ Math.min((currentPage - 1) * pageSize + 1, Math.max(0, totalRecords)) }}</span> to <span class="font-medium text-slate-200">{{ Math.min(currentPage * pageSize, totalRecords) }}</span> of <span class="font-medium text-slate-200">{{ totalRecords }}</span> results
            </p>
            <div class="flex items-center gap-3 bg-slate-900 border border-slate-800 p-1 rounded-lume shadow-inner md:absolute md:left-1/2 md:-translate-x-1/2">
              <button 
                @click="handlePageChange(-1)"
                :disabled="currentPage <= 1 || loading"
                class="rounded-full bg-slate-800/50 px-4 py-1.5 text-sm font-semibold text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span class="text-sm font-medium text-slate-500 font-mono tracking-widest px-3">
                PAGE <span class="text-slate-200">{{ currentPage }}</span> / {{ Math.max(1, Math.ceil(totalRecords / pageSize)) }}
              </span>
              <button 
                @click="handlePageChange(1)"
                :disabled="currentPage * pageSize >= totalRecords || loading"
                class="rounded-full bg-slate-800/50 px-4 py-1.5 text-sm font-semibold text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <!-- AI Liaison Floating Assistant -->
      <AiLiaison />
      
      <!-- Slide Over AI Detail Panel -->
      <AuditDrawer
        :record="selectedRecord"
        :is-open="isDrawerOpen"
        :is-generating="isGenerating"
        @close="isDrawerOpen = false"
        @regenerate="handleRegenerate"
        @save-items="handleSaveItems"
      />

      <!-- Export Modal -->
      <ExportModal 
        :is-open="isExportModalOpen" 
        @close="isExportModalOpen = false" 
        @export="handleExport"
      />
    </div>
  </div>
</template>

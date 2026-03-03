<script setup lang="ts">
import type { AuditRecord, AuditRole } from '../types/audit';
import { AlertTriangle, AlertCircle } from 'lucide-vue-next';

const props = defineProps<{
  data: AuditRecord[];
  role: AuditRole;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'row-click', record: AuditRecord): void;
}>();

// Helper for formatting currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

// Helper for formatting date
const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getWarningTags = (record: AuditRecord) => {
  const tags: { label: string; type: 'danger' | 'warning' }[] = [];
  
  if (record.sentiment === 'negative' && record.rating === 1) {
    tags.push({ label: 'Extremely Negative', type: 'danger' });
  }
  
  if (record.rating === 5 && record.sentiment === 'negative') {
    tags.push({ label: 'Rating Discrepancy', type: 'warning' });
  }
  
  return tags;
};
</script>

<template>
  <div class="relative w-full rounded-xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-xl overflow-hidden">
    <!-- Loading Overlay -->
    <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-3">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        <p class="text-sm font-medium text-emerald-500 animate-pulse">Synchronizing Data Engine...</p>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-300">
        <thead class="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-800">
          <tr>
            <th scope="col" class="px-6 py-4 font-semibold tracking-wider">ID / Date</th>
            <th scope="col" class="px-6 py-4 font-semibold tracking-wider">Department</th>
            <th scope="col" class="px-6 py-4 font-semibold tracking-wider">Inspector</th>
            <th scope="col" class="px-6 py-4 font-semibold tracking-wider">Rating</th>
            <th scope="col" class="px-6 py-4 font-semibold tracking-wider">Findings</th>
            <!-- RBAC: Only ADMIN sees this column header -->
            <th v-if="role === 'ADMIN'" scope="col" class="px-6 py-4 font-semibold tracking-wider text-right">Remediation Cost</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr 
            v-for="record in data" 
            :key="record.id"
            @click="emit('row-click', record)"
            class="transition-colors hover:bg-slate-800/40 group group-hover:cursor-pointer"
          >
            <td class="whitespace-nowrap px-6 py-4">
              <div class="font-mono text-xs text-slate-500">{{ record.id.split('-')[0] }}</div>
              <div class="font-medium text-slate-200 mt-1">{{ formatDate(record.timestamp) }}</div>
            </td>
            <td class="whitespace-nowrap px-6 py-4">
              <span class="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-slate-700">
                {{ record.department }}
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 font-medium text-slate-200">
              {{ record.inspector_name }}
            </td>
            <td class="whitespace-nowrap px-6 py-4">
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold" :class="{
                  'text-emerald-500': record.rating >= 4,
                  'text-yellow-500': record.rating === 3,
                  'text-red-500': record.rating <= 2
                }">
                  {{ record.rating }}<span class="text-slate-500 text-sm font-normal">/5</span>
                </span>
                <span class="text-xs uppercase tracking-wider font-semibold" :class="{
                  'text-emerald-500/70': record.sentiment === 'positive',
                  'text-slate-500/70': record.sentiment === 'neutral',
                  'text-red-500/70': record.sentiment === 'negative'
                }">
                  {{ record.sentiment }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 max-w-xs xl:max-w-md">
              <p class="truncate text-slate-400">{{ record.findings }}</p>
              
              <!-- Warning Tags -->
              <div v-if="getWarningTags(record).length > 0" class="mt-2 flex flex-wrap gap-2">
                <span 
                  v-for="tag in getWarningTags(record)" 
                  :key="tag.label"
                  class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset shadow-sm"
                  :class="{
                    'bg-red-500/10 text-red-400 ring-red-500/20': tag.type === 'danger',
                    'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20': tag.type === 'warning'
                  }"
                >
                  <AlertCircle v-if="tag.type === 'danger'" class="w-3 h-3" />
                  <AlertTriangle v-else class="w-3 h-3" />
                  {{ tag.label }}
                </span>
              </div>
            </td>
            
            <!-- RBAC: Only ADMIN sees this cell -->
            <td v-if="role === 'ADMIN'" class="whitespace-nowrap px-6 py-4 text-right">
              <div class="font-mono text-emerald-400 font-semibold bg-emerald-500/10 inline-block px-2 py-1 rounded">
                {{ formatCurrency(record.remediation_cost) }}
              </div>
            </td>
          </tr>
          
          <tr v-if="data.length === 0 && !loading">
            <td :colspan="role === 'ADMIN' ? 6 : 5" class="py-12 text-center text-slate-500">
              No audit records found matching the current criteria.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

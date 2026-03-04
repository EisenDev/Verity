<script setup lang="ts">
import { Search, SlidersHorizontal, CalendarDays, X } from 'lucide-vue-next';
import type { AuditRole, Department, Sentiment } from '../types/audit';
import type { AuditFilters } from '../composables/useAuditData';

const role = defineProps<{ role: AuditRole }>();
const filters = defineModel<AuditFilters>('filters', { required: true });

const departments: ('All' | Department)[] = ['All', 'Housekeeping', 'Maintenance', 'F&B'];
const sentiments: ('all' | Sentiment)[] = ['all', 'positive', 'neutral', 'negative'];

const clearDates = () => {
  filters.value.dateFrom = '';
  filters.value.dateTo = '';
};
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 rounded-lume border border-slate-800 bg-slate-900/50 p-4 shadow-xl backdrop-blur-xl">
    
    <!-- Top Row: Search -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="relative w-full">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input 
          v-model="filters.search"
          type="text" 
          placeholder="Search findings, inspector or ID..."
          class="w-full rounded-lg bg-slate-950 border border-slate-800 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
        >
      </div>
    </div>

    <!-- Bottom Row: Filters -->
    <div class="flex flex-wrap items-center gap-x-4 gap-y-3 pt-4 border-t border-slate-800/80">
      <div class="flex items-center gap-2 text-sm text-slate-400 font-medium">
        <SlidersHorizontal class="w-4 h-4" />
        Filters:
      </div>

      <!-- Department Filter -->
      <div class="flex items-center gap-2">
        <label class="text-xs font-medium text-slate-500 uppercase tracking-wider">Dept</label>
        <select 
          v-model="filters.department"
          :disabled="role.role === 'DEPT_USER'"
          class="rounded-md bg-slate-950 border border-slate-800 py-1.5 pl-3 pr-8 text-sm text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer appearance-none"
        >
          <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
        </select>
      </div>

      <!-- Rating Filter -->
      <div class="flex items-center gap-2">
        <label class="text-xs font-medium text-slate-500 uppercase tracking-wider">Rating</label>
        <select 
          v-model="filters.rating"
          class="rounded-md bg-slate-950 border border-slate-800 py-1.5 pl-3 pr-8 text-sm text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none"
        >
          <option :value="null">Any Rating</option>
          <option v-for="r in [1,2,3,4,5]" :key="r" :value="r">{{ r }} Stars</option>
        </select>
      </div>

      <!-- Sentiment Filter -->
      <div class="flex items-center gap-2">
        <label class="text-xs font-medium text-slate-500 uppercase tracking-wider">Sentiment</label>
        <select 
          v-model="filters.sentiment"
          class="rounded-md bg-slate-950 border border-slate-800 py-1.5 pl-3 pr-8 text-sm text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none capitalize"
        >
          <option v-for="s in sentiments" :key="s" :value="s">{{ s === 'all' ? 'Any Sentiment' : s }}</option>
        </select>
      </div>

      <!-- Date Range Filter -->
      <div class="flex items-center gap-2 ml-auto flex-wrap">
        <CalendarDays class="w-4 h-4 text-emerald-500/70" />
        <label class="text-xs font-medium text-slate-500 uppercase tracking-wider">From</label>
        <input
          v-model="filters.dateFrom"
          type="date"
          class="rounded-md bg-slate-950 border border-slate-800 py-1.5 px-3 text-sm text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer [color-scheme:dark]"
        />
        <label class="text-xs font-medium text-slate-500 uppercase tracking-wider">To</label>
        <input
          v-model="filters.dateTo"
          type="date"
          class="rounded-md bg-slate-950 border border-slate-800 py-1.5 px-3 text-sm text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer [color-scheme:dark]"
        />
        <button
          v-if="filters.dateFrom || filters.dateTo"
          @click="clearDates"
          class="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Clear date filter"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Target, Activity, DollarSign } from 'lucide-vue-next';
import type { AuditRole } from '../types/audit';

const props = defineProps<{
  role: AuditRole;
  averageRating: number | null;
  pendingRemediationCount: number;
  totalFinancialRisk: number | null;
  loading: boolean;
}>();

const formattedRating = computed(() => {
  if (props.loading || props.averageRating === null) return '--';
  return props.averageRating.toFixed(1);
});

const formattedRisk = computed(() => {
  if (props.loading || props.totalFinancialRisk === null) return '--';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    style: 'currency',
    currency: 'USD'
  }).format(props.totalFinancialRisk);
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <!-- Global Quality Score -->
    <div class="rounded-lume border border-slate-800/80 bg-slate-900/40 p-5 shadow-2xl backdrop-blur-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
      <div class="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
        <Target class="w-32 h-32 text-emerald-500" />
      </div>
      <div class="flex items-center gap-4 relative z-10">
        <div class="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <Target class="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Global Quality Score</p>
          <div class="flex items-end gap-2">
            <h3 class="text-3xl font-bold font-mono tracking-tight text-white">{{ formattedRating }}</h3>
            <span class="text-slate-500 text-sm mb-1">/ 5.0</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending Remediation -->
    <div class="rounded-lume border border-slate-800/80 bg-slate-900/40 p-5 shadow-2xl backdrop-blur-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
      <div class="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
        <Activity class="w-32 h-32 text-amber-500" />
      </div>
      <div class="flex items-center gap-4 relative z-10">
        <div class="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <Activity class="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Pending Remediation</p>
          <div class="flex items-end gap-2">
            <h3 class="text-3xl font-bold font-mono tracking-tight text-white">
              <span v-if="loading">...</span>
              <span v-else>{{ pendingRemediationCount.toLocaleString() }}</span>
            </h3>
            <span class="text-slate-500 text-sm mb-1 italic text-[10px]">& negative sentiments</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Financial Risk (Admin Only) -->
    <div v-if="role === 'ADMIN'" class="rounded-lume border border-slate-800/80 bg-slate-900/40 p-5 shadow-2xl backdrop-blur-2xl relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
      <div class="absolute -right-4 -bottom-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
        <DollarSign class="w-32 h-32 text-red-500" />
      </div>
      <div class="flex items-center gap-4 relative z-10">
        <div class="p-3 bg-red-500/10 rounded-xl border border-red-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <DollarSign class="w-6 h-6 text-red-400" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Financial Risk</p>
          <div class="flex items-end gap-2">
            <h3 class="text-3xl font-bold font-mono tracking-tight text-white">{{ formattedRisk }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="rounded-lume border border-slate-800/80 bg-slate-900/40 p-5 shadow-2xl backdrop-blur-2xl flex items-center justify-center">
        <p class="text-xs text-slate-500 italic flex items-center gap-2">
          <ShieldAlert class="w-4 h-4" />
          Financial metrics redacted by command order.
        </p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { X, FileText, Table, Download } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'export', format: 'pdf' | 'excel', startDate: string, endDate: string): void;
}>();

const format = ref<'pdf' | 'excel'>('pdf');
const startDate = ref<string>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '');
const endDate = ref<string>(new Date().toISOString().split('T')[0] || '');

const handleExport = () => {
    emit('export', format.value, startDate.value, endDate.value);
};
</script>

<template>
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <h3 class="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Download class="w-5 h-5 text-emerald-500" />
            Export Executive Report
          </h3>
          <button @click="emit('close')" class="text-slate-400 hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6">
          <!-- Format Selection -->
          <div class="space-y-3">
            <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Select Format</label>
            <div class="grid grid-cols-2 gap-4">
              <button 
                @click="format = 'pdf'"
                :class="format === 'pdf' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'"
                class="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all group"
              >
                <FileText class="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span class="font-bold text-sm">PDF Document</span>
              </button>
              <button 
                @click="format = 'excel'"
                :class="format === 'excel' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'"
                class="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all group"
              >
                <Table class="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span class="font-bold text-sm">Excel Sheets</span>
              </button>
            </div>
          </div>

          <!-- Date Range -->
          <div class="space-y-3">
            <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Select Date Range</label>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <span class="text-[10px] text-slate-500 uppercase font-mono">Start Date</span>
                <input type="date" v-model="startDate" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-colors" />
              </div>
              <div class="space-y-1">
                <span class="text-[10px] text-slate-500 uppercase font-mono">End Date</span>
                <input type="date" v-model="endDate" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-3">
          <button @click="emit('close')" class="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button @click="handleExport" class="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/20">
            Generate Export
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

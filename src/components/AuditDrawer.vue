<script setup lang="ts">
import { X, Calendar, User, Tag, ShieldCheck, RefreshCw } from 'lucide-vue-next';
import type { AuditRecord } from '../types/audit';

import { ref, watch } from 'vue';

const props = defineProps<{
  record: AuditRecord | null;
  isOpen: boolean;
  isGenerating?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'regenerate', id: string): void;
  (e: 'save-items', id: string, items: {item: string, cost: number}[]): void;
}>();

const editMode = ref(false);
const draftItems = ref<{item: string, cost: number}[]>([]);

const startEdit = () => {
    editMode.value = true;
    draftItems.value = props.record?.lineItems ? JSON.parse(JSON.stringify(props.record.lineItems)) : [];
};

const saveEdit = () => {
    if (props.record) {
        emit('save-items', props.record.id, draftItems.value);
    }
    editMode.value = false;
};

const addItem = () => { draftItems.value.push({ item: 'New Item', cost: 0 }); };
const removeItem = (index: number) => { draftItems.value.splice(index, 1); };

watch(() => props.isOpen, (val) => {
    if (!val) editMode.value = false;
});

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};
const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
</script>

<template>
  <div>
    <!-- Backdrop -->
    <transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm" @click="emit('close')"></div>
    </transition>

    <!-- Slide-over panel -->
    <transition enter-active-class="transform transition ease-in-out duration-300 sm:duration-500" enter-from-class="translate-x-full" enter-to-class="translate-x-0" leave-active-class="transform transition ease-in-out duration-300 sm:duration-500" leave-from-class="translate-x-0" leave-to-class="translate-x-full">
      <div v-if="isOpen" class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-slate-900 border-l border-slate-800 shadow-2xl overflow-y-auto">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-800 bg-slate-950/50 px-6 py-4 backdrop-blur-xl">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-bold text-white tracking-widest font-mono">{{ record?.id.split('-')[0] }}</h2>
            <span v-if="record?.rating === 1 && record?.sentiment === 'negative'" class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">Critical</span>
            <span v-else class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Resolved</span>
          </div>
          <button @click="emit('close')" class="text-slate-400 hover:text-white transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Body -->
        <div v-if="record" class="flex-1 p-6 space-y-8">
          
          <!-- Metadata -->
          <div class="space-y-4">
             <div class="flex items-center gap-3 text-sm text-slate-300">
                <Calendar class="w-4 h-4 text-emerald-500" />
                <span><strong class="text-slate-500 mr-2 uppercase tracking-wider text-xs">Date:</strong> {{ formatDate(record.timestamp) }}</span>
             </div>
             <div class="flex items-center gap-3 text-sm text-slate-300">
                <Tag class="w-4 h-4 text-emerald-500" />
                <span><strong class="text-slate-500 mr-2 uppercase tracking-wider text-xs">Dept:</strong> {{ record.department }}</span>
             </div>
             <div class="flex items-center gap-3 text-sm text-slate-300">
                <User class="w-4 h-4 text-emerald-500" />
                <span><strong class="text-slate-500 mr-2 uppercase tracking-wider text-xs">Inspector:</strong> {{ record.inspector_name || 'System Auto' }}</span>
             </div>
          </div>

          <!-- Evidence -->
          <div>
            <h3 class="text-xs uppercase tracking-widest font-semibold text-slate-500 mb-3 border-b border-slate-800 pb-2">The Evidence (Findings)</h3>
            <div class="p-4 rounded-lume bg-slate-950 border border-slate-800 text-sm text-slate-300 leading-relaxed font-mono">
              "{{ record.findings }}"
            </div>
          </div>

          <!-- AI Remediation Breakdown -->
          <div>
            <div class="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 class="text-xs uppercase tracking-widest font-semibold text-slate-500">AI Remediation Breakdown</h3>
              <div v-if="!editMode" class="flex gap-2">
                <button @click="startEdit" class="text-[10px] uppercase font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors">Edit</button>
                <div class="flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                  <ShieldCheck class="w-3 h-3" />
                  Price Verified via LUME API
                </div>
              </div>
              <div v-else class="flex gap-2">
                  <button @click="saveEdit" class="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded transition-colors">Save</button>
                  <button @click="editMode = false" class="text-[10px] uppercase font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
            
            <table class="w-full text-sm text-left mb-4">
              <thead class="text-xs text-slate-500 uppercase bg-slate-950 border-b border-slate-800">
                <tr>
                  <th class="px-4 py-2 font-medium w-2/3">Item</th>
                  <th class="px-4 py-2 font-medium text-right w-1/3">Cost</th>
                  <th v-if="editMode" class="px-2 w-8"></th>
                </tr>
              </thead>
              <tbody v-if="!editMode">
                <tr v-if="!record.lineItems?.length" class="border-b border-slate-800/50 text-center"><td colspan="2" class="py-4 text-slate-500 text-xs text-center border-b border-slate-800/50">No items available. Awaiting generation.</td></tr>
                <tr v-for="(item, i) in record.lineItems || []" :key="i" class="border-b border-slate-800/50">
                  <td class="px-4 py-3 text-slate-300">{{ item.item }}</td>
                  <td class="px-4 py-3 text-right text-emerald-400 font-mono">{{ formatCurrency(item.cost) }}</td>
                </tr>
                <tr class="bg-slate-950">
                  <td class="px-4 py-3 text-slate-400 font-semibold text-right">Extrapolated Total</td>
                  <td class="px-4 py-3 text-right text-white font-mono font-bold">{{ formatCurrency(record.lineItems?.reduce((a,b)=>a+b.cost, 0) || 0) }}</td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr v-for="(item, i) in draftItems" :key="i" class="border-b border-slate-800/50">
                  <td class="px-2 py-2"><input v-model="item.item" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white" /></td>
                  <td class="px-2 py-2"><input type="number" v-model.number="item.cost" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-emerald-400 font-mono text-right" /></td>
                  <td class="px-2 py-2 text-center"><button @click="removeItem(i)" class="text-rose-500 hover:text-rose-400"><X class="w-4 h-4"/></button></td>
                </tr>
                <tr>
                    <td colspan="3" class="px-2 py-2">
                        <button @click="addItem" class="w-full py-1.5 border border-dashed border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-emerald-400 text-xs font-bold uppercase tracking-widest rounded transition-colors">+ Add Line Item</button>
                    </td>
                </tr>
              </tbody>
            </table>

            <button v-if="!editMode" @click="emit('regenerate', record.id)" class="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] transition-all rounded-lume text-sm font-semibold text-white group" :disabled="isGenerating">
              <RefreshCw class="w-4 h-4 text-emerald-400 transition-transform duration-500" :class="{'animate-spin': isGenerating, 'group-hover:rotate-180': !isGenerating}" />
              {{ isGenerating ? 'Matrix Computing...' : 'Regenerate Estimate' }}
            </button>
          </div>

        </div>
      </div>
    </transition>
  </div>
</template>

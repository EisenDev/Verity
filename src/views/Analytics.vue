<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { LogOut, Activity } from 'lucide-vue-next';
import Sidebar from '../components/Sidebar.vue';
import AiLiaison from '../components/AiLiaison.vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js'
import { Pie, Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

interface KPI {
  department: string;
  averageRating: number;
  totalAudits: number;
  negativeAudits: number;
  totalRemediationCost: number;
}

const router = useRouter();
const data = ref<KPI[]>([]);
const sentiments = ref<{sentiment: string, count: number}[]>([]);
const timeline = ref<{date: string, total: number, negative: number}[]>([]);
const loading = ref(true);
const role = ref<string>('DEPT_USER');

const grandTotalRisk = computed(() => {
  return data.value.reduce((sum, dept) => sum + (dept.totalRemediationCost || 0), 0);
});

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    compactDisplay: 'short'
  }).format(val);
};

const handleLogout = () => {
  sessionStorage.removeItem('user');
  document.cookie = 'auth_token=; Max-Age=0; path=/;';
  router.push('/login');
};

const loadAnalytics = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/analytics`);
    const json = await res.json();
    data.value = json.data || [];
    sentiments.value = json.sentiments || [];
    timeline.value = json.timeline || [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const userData = sessionStorage.getItem('user');
  if (!userData) {
    router.push('/login');
    return;
  }
  try {
    const parsedUser = JSON.parse(userData);
    role.value = parsedUser.role === 'admin' ? 'ADMIN' : 'DEPT_USER';
  } catch(e) { }
  loadAnalytics();
});

const pieChartData = computed(() => {
  const mapColor = (sentiment: string) => {
    switch (sentiment) {
      case 'negative': return '#f43f5e'; // Rose-500
      case 'neutral': return '#f59e0b'; // Amber-500
      case 'positive': return '#10b981'; // Emerald-500
      default: return '#64748b';
    }
  };

  return {
    labels: sentiments.value.map(s => s.sentiment.toUpperCase()),
    datasets: [{
      data: sentiments.value.map(s => s.count),
      backgroundColor: sentiments.value.map(s => mapColor(s.sentiment)),
      borderWidth: 0,
      hoverOffset: 4
    }]
  };
});

const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom' as const, labels: { color: '#94a3b8', padding: 20, font: { family: 'ui-monospace, monospace' } } }
    }
};

const lineChartData = computed(() => {
  return {
    labels: timeline.value.map(t => t.date),
    datasets: [
      {
        label: 'Total Audits',
        data: timeline.value.map(t => t.total),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Negative Flagged',
        data: timeline.value.map(t => t.negative),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  };
});

const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: { ticks: { color: '#64748b', font: { family: 'ui-monospace' } }, grid: { color: '#1e293b' } },
        y: { ticks: { color: '#64748b', font: { family: 'ui-monospace' } }, grid: { color: '#1e293b' } }
    },
    plugins: {
        legend: { position: 'top' as const, labels: { color: '#94a3b8', font: { family: 'ui-monospace' } } }
    }
};
</script>

<template>
  <div class="h-screen w-full bg-slate-950 text-slate-100 flex overflow-hidden selection:bg-emerald-500/30">
    <Sidebar />

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur z-20 flex-shrink-0">
        <h2 class="text-xl font-bold tracking-tight text-white flex items-center gap-3">
          Performance Intelligence
        </h2>
        
        <div class="flex items-center gap-4">
          <button @click="handleLogout" class="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white" title="Logout">
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.03),transparent_50%_100%)]">
        <div class="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col min-h-full">
          
          <!-- Grand Total Risk (Admin Only) -->
          <div v-if="role === 'ADMIN'" class="mb-6 rounded-lume border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-2xl flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Cross-Department Financial Risk</h3>
              <p class="text-3xl font-bold font-mono text-white tracking-tight">{{ formatCurrency(grandTotalRisk) }}</p>
            </div>
            <div class="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
               <Activity class="w-8 h-8 text-rose-400" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
             <div v-for="dept in data" :key="dept.department" class="rounded-lume border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-2xl flex flex-col justify-between">
               <div>
                  <div class="flex justify-between items-center mb-6">
                    <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-widest">{{ dept.department }}</h3>
                    <Activity class="w-5 h-5" :class="dept.averageRating < 3 ? 'text-rose-500' : 'text-emerald-500'" />
                  </div>
                  
                  <!-- Score Bar -->
                  <div class="mb-4">
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-slate-400">Average Rating</span>
                      <span class="text-emerald-400 font-mono">{{ dept.averageRating.toFixed(2) }} / 5.0</span>
                    </div>
                    <div class="w-full bg-slate-800 rounded-full h-2">
                      <div class="bg-emerald-500 h-2 rounded-full transition-all duration-1000" :style="{ width: `${(dept.averageRating / 5) * 100}%` }"></div>
                    </div>
                  </div>

                  <!-- Negative Sentiment Rate Bar -->
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-slate-400">Negative Audits Ratio</span>
                      <span class="text-rose-400 font-mono">{{ dept.negativeAudits }} / {{ dept.totalAudits }}</span>
                    </div>
                    <div class="w-full bg-slate-800 rounded-full h-2">
                      <div class="bg-rose-500 h-2 rounded-full transition-all duration-1000" :style="{ width: `${dept.totalAudits ? (dept.negativeAudits / dept.totalAudits) * 100 : 0}%` }"></div>
                    </div>
                  </div>
               </div>
               
               <!-- Dept Remediation Cost (Admin Only) -->
               <div v-if="role === 'ADMIN'" class="mt-6 pt-4 border-t border-slate-800">
                  <div class="flex items-end justify-between">
                     <span class="text-xs text-slate-500 uppercase font-semibold">Remediation Cost</span>
                     <span class="text-lg font-mono font-bold text-rose-400">{{ formatCurrency(dept.totalRemediationCost) }}</span>
                  </div>
               </div>
             </div>
          </div>

          <!-- Advanced Charts Section -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 flex-1">
             <!-- Pie Chart -->
             <div class="rounded-lume border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-2xl flex flex-col items-center min-h-[400px]">
               <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-widest self-start w-full border-b border-slate-800/80 pb-4 mb-6">Global Sentiment Base</h3>
               <div class="w-full relative flex-1 min-h-0 flex items-center justify-center">
                 <Pie v-if="!loading && sentiments.length" :data="pieChartData" :options="pieChartOptions" />
                 <div v-else-if="loading" class="animate-pulse flex items-center gap-2 text-emerald-500/50">
                   <div class="w-2 h-2 rounded-full bg-emerald-500"></div> Loading matrix...
                 </div>
               </div>
             </div>

             <!-- Line Chart -->
             <div class="lg:col-span-2 rounded-lume border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-2xl flex flex-col items-center min-h-[400px]">
               <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-widest self-start w-full border-b border-slate-800/80 pb-4 mb-6">Velocity Timeline</h3>
               <div class="w-full relative flex-1 min-h-0">
                 <Line v-if="!loading && timeline.length" :data="lineChartData" :options="lineChartOptions" />
                 <div v-else-if="loading" class="absolute inset-0 flex items-center justify-center animate-pulse gap-2 text-emerald-500/50">
                   <div class="w-2 h-2 rounded-full bg-emerald-500"></div> Loading matrix...
                 </div>
               </div>
             </div>
          </div>

        </div>
      </main>
      
      <AiLiaison />
    </div>
  </div>
</template>

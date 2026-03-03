<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LogOut, ShieldIcon, Database, Key } from 'lucide-vue-next';
import Sidebar from '../components/Sidebar.vue';
import AiLiaison from '../components/AiLiaison.vue';

const router = useRouter();

const handleLogout = () => {
  sessionStorage.removeItem('user');
  document.cookie = 'auth_token=; Max-Age=0; path=/;';
  router.push('/login');
};

onMounted(() => {
  const userData = sessionStorage.getItem('user');
  if (!userData) {
    router.push('/login');
  }
});
</script>

<template>
  <div class="h-screen w-full bg-slate-950 text-slate-100 flex overflow-hidden selection:bg-emerald-500/30">
    <Sidebar />

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur z-20 flex-shrink-0">
        <h2 class="text-xl font-bold tracking-tight text-white flex items-center gap-3">
          Governance Settings
        </h2>
        
        <div class="flex items-center gap-4">
          <button @click="handleLogout" class="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white" title="Logout">
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.03),transparent_50%_100%)]">
        <div class="max-w-[800px] mx-auto p-4 sm:p-6 lg:p-8">
          
          <div class="space-y-6">
            
            <div class="rounded-lume border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-2xl">
              <div class="flex items-center gap-3 mb-4">
                <ShieldIcon class="w-5 h-5 text-emerald-500" />
                <h3 class="text-sm font-semibold text-white uppercase tracking-widest">Access Protocol</h3>
              </div>
              <p class="text-sm text-slate-400 mb-4">Manage role-based access control and system permissions.</p>
              <button class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors">Configure Roles</button>
            </div>

            <div class="rounded-lume border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-2xl">
              <div class="flex items-center gap-3 mb-4">
                <Database class="w-5 h-5 text-amber-500" />
                <h3 class="text-sm font-semibold text-white uppercase tracking-widest">Data Retention</h3>
              </div>
              <p class="text-sm text-slate-400 mb-4">Configure automatic log pruning and cold-storage archiving for audit records.</p>
              <button class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors">Retention Policies</button>
            </div>

            <div class="rounded-lume border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-2xl">
              <div class="flex items-center gap-3 mb-4">
                <Key class="w-5 h-5 text-blue-500" />
                <h3 class="text-sm font-semibold text-white uppercase tracking-widest">API Integrations</h3>
              </div>
              <p class="text-sm text-slate-400 mb-4">Manage webhook endpoints and third-party service tokens.</p>
              <button class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors">Manage Secret Keys</button>
            </div>

          </div>

        </div>
      </main>
      
      <AiLiaison />
    </div>
  </div>
</template>

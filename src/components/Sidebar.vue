<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { LayoutDashboard, Layers, Activity, Settings, ShieldAlert, Users } from 'lucide-vue-next';

const route = useRoute();

const navItems = computed(() => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  
  const items = [
    { name: 'Overview', icon: LayoutDashboard, path: '/dashboard', active: route.path === '/dashboard' },
    { name: 'Operations', icon: Layers, path: '/operations', active: route.path === '/operations' },
  ];

  if (isAdmin) {
    items.push(
      { name: 'Analytics', icon: Activity, path: '/analytics', active: route.path === '/analytics' },
      { name: 'Users', icon: Users, path: '/users', active: route.path === '/users' },
      { name: 'Settings', icon: Settings, path: '/settings', active: route.path === '/settings' }
    );
  }

  return items;
});
</script>

<template>
  <aside class="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl flex flex-col hidden lg:flex">
    
    <!-- Branding -->
    <div class="h-16 flex items-center px-6 border-b border-slate-800 flex-shrink-0">
      <div class="flex items-center gap-3">
        <img src="/logo.png" alt="VERITY Logo" class="w-8 h-8 rounded-lg object-cover shadow-[0_0_12px_rgba(16,185,129,0.3)]" />
        <div>
          <h1 class="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            VERITY
          </h1>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      <router-link 
        v-for="item in navItems" 
        :key="item.name"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lume text-sm font-medium transition-all group"
        :class="item.active 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'"
      >
        <component :is="item.icon" class="w-5 h-5 transition-colors" :class="item.active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'" />
        {{ item.name }}
      </router-link>
    </nav>
    
    <!-- Bottom User area placeholder if needed -->
    <div class="p-4 border-t border-slate-800">
      <div class="w-full h-24 rounded-lume bg-slate-900 border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-end">
        <div class="absolute -right-4 -top-4 opacity-10">
          <ShieldAlert class="w-20 h-20 text-emerald-500" />
        </div>
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">System Status</p>
        <div class="flex items-center gap-2 text-sm text-emerald-400 font-medium">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Operational
        </div>
      </div>
    </div>
  </aside>
</template>

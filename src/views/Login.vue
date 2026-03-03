<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ShieldAlert, LogIn, ShieldCheck, User as UserIcon, Mail, Lock } from 'lucide-vue-next';

const router = useRouter();
const loading = ref(false);
const error = ref('');

const emailInput = ref('');
const passwordInput = ref('');

const login = async (email?: string, password?: string) => {
  loading.value = true;
  error.value = '';
  
  const targetEmail = email || emailInput.value;
  const targetPassword = password || passwordInput.value || 'password123';

  if (!targetEmail || !targetPassword) {
    error.value = 'Please enter both email and password.';
    loading.value = false;
    return;
  }
  
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, password: targetPassword })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Invalid credentials');
    }

    const data = await res.json();
    
    sessionStorage.setItem('user', JSON.stringify(data.user));
    document.cookie = `auth_token=${data.user.id}; path=/`;

    await router.push('/dashboard');
  } catch (err: any) {
    error.value = err.message || 'Authentication failed';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative selection:bg-emerald-500/30 overflow-hidden">
    
    <!-- Background Graphics -->
    <div class="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_50%_100%)]"></div>

    <div class="z-10 w-full max-w-sm p-4">
      <div class="text-center mb-10 group">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-4 group-hover:border-emerald-500/50 transition-colors">
          <ShieldAlert class="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-white mb-2">VERITY Secure</h1>
        <p class="text-sm text-slate-400">Authenticate sovereign entry protocols.</p>
      </div>

      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl group-hover:border-slate-700 transition-colors relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-50"></div>
        
        <h2 class="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
          <LogIn class="w-4 h-4 text-emerald-500" />
          Quick Access
        </h2>

        <div v-if="error" class="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg text-center font-mono uppercase tracking-tighter">
          {{ error }}
        </div>

        <div class="flex flex-col gap-3 mb-8">
          <button 
            @click="login('admin@zenith.me', 'password123')"
            :disabled="loading"
            class="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all text-left group/btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover/btn:bg-emerald-500/20 group-hover/btn:scale-110 transition-all">
                <ShieldCheck class="w-5 h-5" />
              </div>
              <div>
                <p class="font-medium text-slate-200 text-sm">Access as Admin</p>
                <p class="text-xs text-slate-500 font-mono mt-0.5">admin@zenith.me</p>
              </div>
            </div>
          </button>

          <button 
            @click="login('staff@zenith.me', 'password123')"
            :disabled="loading"
            class="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-600 hover:bg-slate-900 transition-all text-left group/btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover/btn:bg-slate-700 group-hover/btn:text-slate-300 group-hover/btn:scale-110 transition-all">
                <UserIcon class="w-5 h-5" />
              </div>
              <div>
                <p class="font-medium text-slate-200 text-sm">Access as Dept User</p>
                <p class="text-xs text-slate-500 font-mono mt-0.5">staff@zenith.me</p>
              </div>
            </div>
          </button>
        </div>

        <!-- Manual Login Form -->
        <div class="relative mb-6">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-slate-800"></div>
          </div>
          <div class="relative flex justify-center text-xs uppercase tracking-[0.2em] font-bold">
            <span class="bg-slate-900 px-3 text-slate-500">OR MANUAL OVERRIDE</span>
          </div>
        </div>

        <form @submit.prevent="login()" class="space-y-4">
          <div class="space-y-1.5">
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                v-model="emailInput"
                type="email" 
                placeholder="Personnel Email" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all transition-colors placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                v-model="passwordInput"
                type="password" 
                placeholder="Secure Password" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all transition-colors placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
          >
            <LogIn class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            SECURE LOGIN
          </button>
        </form>
      </div>
      
      <p class="mt-8 text-center text-xs text-slate-600 uppercase tracking-widest font-mono">
        &copy; 2026 EISENDEV. ALL RIGHTS RESERVED.
      </p>
    </div>
  </div>
</template>

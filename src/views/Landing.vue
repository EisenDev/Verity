<script setup lang="ts">
import { Play, ArrowRight, Shield, Brain, BarChart3, Search, Activity, Cpu, CheckCircle2, Globe, Github } from 'lucide-vue-next';
import { ref, onMounted } from 'vue';

const isScrolled = ref(false);

onMounted(() => {
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 20;
  });
});

const features = [
  {
    icon: Shield,
    title: 'Sovereign Governance',
    description: 'Military-grade role-based access control protecting your sensitive operational data.'
  },
  {
    icon: Brain,
    title: 'Intelligence Liaison',
    description: 'Context-aware AI assistant locked to your organization documentation for real-time guidance.'
  },
  {
    icon: BarChart3,
    title: 'Forensic Analytics',
    description: 'Granular tracking of sentiment, rating discrepancies, and multi-department performance.'
  },
  {
    icon: Activity,
    title: 'Live Price Watcher',
    description: 'Real-time remediation cost estimation verified via the LUME Procurement API.'
  }
];
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden selection:bg-emerald-500/30">
    
    <!-- Background Accents -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-1/4 w-[1000px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-1/4 w-[800px] h-[500px] bg-slate-500/5 blur-[100px] rounded-full translate-y-1/2"></div>
      <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
    </div>

    <!-- Navbar -->
    <nav 
      class="fixed top-0 w-full z-50 transition-all duration-300 border-b"
      :class="isScrolled ? 'bg-slate-950/80 backdrop-blur-xl border-slate-800 py-3' : 'bg-transparent border-transparent py-6'"
    >
      <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div class="flex items-center gap-2 group cursor-pointer">
          <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform">
            <Cpu class="w-5 h-5 text-slate-950" />
          </div>
          <span class="text-xl font-bold tracking-tighter text-white">VERITY</span>
        </div>

        <div class="hidden md:flex items-center gap-8">
          <a href="#" class="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">Intelligence</a>
          <a href="#" class="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">Operations</a>
          <a href="#" class="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">Governance</a>
          <a href="#" class="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">Documentation</a>
        </div>

        <div class="flex items-center gap-4">
          <router-link to="/login" class="text-sm font-bold text-slate-300 hover:text-white transition-colors">Log In</router-link>
          <router-link to="/login" class="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
            Launch Platform
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative z-10 pt-32 pb-20 px-6">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div class="space-y-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-[0.2em] uppercase shadow-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Intelligence System Online
          </div>

          <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Precision <span class="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Hospitality</span> Intelligence.
          </h1>
          
          <p class="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed">
            The ultimate B2B SaaS architecture for operational forensics. High-density audits, AI-driven remediation costs, and granular department intelligence.
          </p>

          <div class="flex flex-col sm:flex-row gap-4">
            <router-link to="/login" class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all hover:translate-y-[-2px] active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.3)] group text-base">
              Start Operational Audit
              <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </router-link>
            <button class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800 transition-all text-base">
              <Play class="w-5 h-5 text-emerald-500 fill-emerald-500" />
              Watch Forensic Demo
            </button>
          </div>

          <div class="pt-8 flex items-center gap-6 text-slate-500 border-t border-slate-900">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-500" />
              <span class="text-sm font-medium">SOVEREIGN V4.0</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-500" />
              <span class="text-sm font-medium">AI COST MATRIX</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-500" />
              <span class="text-sm font-medium">B2B ENTERPRISE</span>
            </div>
          </div>
        </div>

        <!-- 3D Card / Visual -->
        <div class="relative group perspective-1000">
          <div class="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-700"></div>
          <div class="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:rotate-y-preview group-hover:rotate-x-preview">
            <img 
              src="/verity_hero_visual_1772544437694.png" 
              alt="VERITY Dashboard Preview" 
              class="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            
            <!-- Glassmorphism Stats Overlay -->
            <div class="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/5 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Risk Score</span>
                <span class="text-xs font-bold text-emerald-400">98.4%</span>
              </div>
              <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 w-[94%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="relative z-10 py-24 bg-slate-950/50 backdrop-blur-sm border-y border-slate-900 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center space-y-4 mb-16">
          <h2 class="text-xs font-bold text-emerald-500 uppercase tracking-[0.3em]">INTELLIGENCE PILLARS</h2>
          <p class="text-3xl md:text-5xl font-bold text-white tracking-tight">Everything you need for Forensic Control.</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="feature in features" :key="feature.title" class="p-8 rounded-2xl bg-slate-900/30 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-900/50 transition-all group">
            <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 transition-all">
              <component :is="feature.icon" class="w-6 h-6 text-emerald-500 group-hover:text-slate-950 transition-colors" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2 tracking-tight">{{ feature.title }}</h3>
            <p class="text-slate-400 text-sm leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Banner -->
    <section class="py-12 border-b border-slate-900 px-6">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        <div class="flex items-center gap-2 font-black text-2xl tracking-tighter">
          <Globe class="w-6 h-6" /> GLOBAL_ACCESS
        </div>
        <div class="flex items-center gap-2 font-black text-2xl tracking-tighter">
          <Search class="w-6 h-6" /> FORENSIC_ENGINE
        </div>
        <div class="flex items-center gap-2 font-black text-2xl tracking-tighter">
          <Activity class="w-6 h-6" /> LIVE_TRIAGE
        </div>
        <div class="flex items-center gap-2 font-black text-2xl tracking-tighter text-emerald-500">
          <Github class="w-6 h-6" /> OPEN_MATRIX
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative z-10 py-12 px-6 border-t border-slate-900 mt-20">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-4 gap-12 mb-12">
          <div class="col-span-2 space-y-6">
            <div class="flex items-center gap-2">
              <Cpu class="w-6 h-6 text-emerald-500" />
              <span class="text-2xl font-bold tracking-tighter text-white uppercase">VERITY</span>
            </div>
            <p class="text-slate-500 max-w-sm text-sm">
              The world's most advanced B2B SaaS architecture for luxury hospitality auditing. Engineered for precision, security, and intelligence.
            </p>
          </div>
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-widest">Platform</h4>
            <ul class="space-y-2 text-sm text-slate-500 font-medium">
              <li><a href="#" class="hover:text-emerald-500 transition-colors">Intelligence Matrix</a></li>
              <li><a href="#" class="hover:text-emerald-500 transition-colors">Forensic Triage</a></li>
              <li><a href="#" class="hover:text-emerald-500 transition-colors">Cost Automation</a></li>
            </ul>
          </div>
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-widest">Governance</h4>
            <ul class="space-y-2 text-sm text-slate-500 font-medium">
              <li><a href="#" class="hover:text-emerald-500 transition-colors">Security Protocols</a></li>
              <li><a href="#" class="hover:text-emerald-500 transition-colors">Sovereign Engine</a></li>
              <li><a href="#" class="hover:text-emerald-500 transition-colors">Data Integrity</a></li>
            </ul>
          </div>
        </div>
        <div class="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-xs text-slate-600 font-bold uppercase tracking-widest">© 2026 EISENDEV. ALL RIGHTS RESERVED.</p>
          <div class="flex items-center gap-6 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <a href="https://arjayescabas.me/" target="_blank" class="hover:text-emerald-400 transition-colors">Portfolio</a>
            <a href="https://github.com/EisenDev" target="_blank" class="hover:text-emerald-400 transition-colors">Github</a>
            <a href="https://v2.onlinejobs.ph/jobseekers/info/4691563" target="_blank" class="hover:text-emerald-400 transition-colors">Onlinejobs.ph</a>
            <a href="https://www.linkedin.com/in/arjay-escabas-8a30413a0/" target="_blank" class="hover:text-emerald-400 transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.rotate-y-preview {
  transform: rotateY(-5deg);
}
.rotate-x-preview {
  transform: rotateX(5deg);
}
</style>


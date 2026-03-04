<script setup lang="ts">
import { Play, ArrowRight, Shield, Brain, BarChart3, Activity, CheckCircle2, Globe, Search, DollarSign } from 'lucide-vue-next';
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
    description: 'Military-grade RBAC protecting sensitive data — Admins get global access, Department Users see only their scope with financial fields auto-redacted.'
  },
  {
    icon: Brain,
    title: 'Intelligence Liaison',
    description: 'Context-aware Gemini 2.5 AI assistant grounded exclusively in VERITY documentation. Real-time guidance, zero hallucination drift.'
  },
  {
    icon: BarChart3,
    title: 'Forensic Analytics',
    description: 'Granular tracking of audit sentiment, rating discrepancies, and per-department financial risk across 5,000+ live inspection records.'
  },
  {
    icon: DollarSign,
    title: 'Remediation Estimator',
    description: 'AI-powered itemized cost generation per audit finding. Automatically produces line-item breakdowns like "Broken Bed Frame – $500."'
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
        <!-- Logo -->
        <div class="flex items-center gap-2.5 group cursor-pointer">
          <img src="/logo.png" alt="VERITY Logo" class="w-8 h-8 rounded-lg object-cover shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform" />
          <span class="text-xl font-bold tracking-tighter text-white">VERITY</span>
        </div>

        <div class="hidden md:flex items-center gap-8">
          <a href="#features" class="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">Intelligence</a>
          <a href="#" class="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">Operations</a>
          <a href="#" class="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">Governance</a>
          <a href="https://github.com/EisenDev/Verity" target="_blank" class="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">Documentation</a>
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
            Sovereign Engine Active
          </div>

          <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Precision <span class="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Hospitality</span> Intelligence.
          </h1>
          
          <p class="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed">
            The enterprise audit platform built for luxury hospitality. Role-gated data access, AI-powered remediation costing, and forensic insights across 5,000+ inspection records.
          </p>

          <div class="flex flex-col sm:flex-row gap-4">
            <router-link to="/login" class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all hover:translate-y-[-2px] active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.3)] group text-base">
              Start Operational Audit
              <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </router-link>
            <a href="https://github.com/EisenDev/Verity" target="_blank" class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800 transition-all text-base">
              <Play class="w-5 h-5 text-emerald-500 fill-emerald-500" />
              View Source
            </a>
          </div>

          <div class="pt-8 flex items-center gap-6 text-slate-500 border-t border-slate-900">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-500" />
              <span class="text-sm font-medium">RBAC ENFORCED</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-500" />
              <span class="text-sm font-medium">AI COST MATRIX</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-500" />
              <span class="text-sm font-medium">5K LIVE RECORDS</span>
            </div>
          </div>
        </div>

        <!-- 3D Card / Visual -->
        <div class="relative group perspective-1000">
          <div class="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-700"></div>
          <div class="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500">
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
    <section id="features" class="relative z-10 py-24 bg-slate-950/50 backdrop-blur-sm border-y border-slate-900 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center space-y-4 mb-16">
          <h2 class="text-xs font-bold text-emerald-500 uppercase tracking-[0.3em]">INTELLIGENCE PILLARS</h2>
          <p class="text-3xl md:text-5xl font-bold text-white tracking-tight">Everything built for Forensic Control.</p>
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
          <Shield class="w-6 h-6" /> OPEN_MATRIX
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative z-10 py-12 px-6 border-t border-slate-900 mt-20">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-4 gap-12 mb-12">
          <div class="col-span-2 space-y-6">
            <div class="flex items-center gap-3">
              <img src="/logo.png" alt="VERITY Logo" class="w-7 h-7 rounded-md object-cover" />
              <span class="text-2xl font-bold tracking-tighter text-white uppercase">VERITY</span>
            </div>
            <p class="text-slate-500 max-w-sm text-sm">
              Enterprise B2B audit and forensic remediation platform for luxury hospitality. Engineered for precision, governance, and intelligence.
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
          <!-- Social Links as Icon Logos -->
          <div class="flex items-center gap-5">
            <!-- Portfolio -->
            <a href="https://arjayescabas.me/" target="_blank" title="Portfolio" class="text-slate-500 hover:text-emerald-400 transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                <line x1="12" y1="12" x2="12" y2="16"/>
                <line x1="10" y1="14" x2="14" y2="14"/>
              </svg>
            </a>
            <!-- GitHub -->
            <a href="https://github.com/EisenDev" target="_blank" title="GitHub" class="text-slate-500 hover:text-emerald-400 transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <!-- Onlinejobs.ph -->
            <a href="https://v2.onlinejobs.ph/jobseekers/info/4691563" target="_blank" title="OnlineJobs.ph" class="text-slate-500 hover:text-emerald-400 transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </a>
            <!-- LinkedIn -->
            <a href="https://www.linkedin.com/in/arjay-escabas-8a30413a0/" target="_blank" title="LinkedIn" class="text-slate-500 hover:text-emerald-400 transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
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
</style>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { Brain, X, Send, Terminal } from 'lucide-vue-next';
import { getApiBase } from '../utils/api';

const isOpen = ref(false);
const input = ref('');
const messages = ref<{role: 'user' | 'ai', text: string}[]>([]);
const loading = ref(false);
const chatContainer = ref<HTMLElement | null>(null);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && messages.value.length === 0) {
    messages.value.push({
      role: 'ai',
      text: 'VERITY Intelligence Matrix online. I am your Liaison. How may I assist with your operational data today?'
    });
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!input.value.trim() || loading.value) return;
  
  const userText = input.value;
  messages.value.push({ role: 'user', text: userText });
  input.value = '';
  loading.value = true;
  await scrollToBottom();

  try {
    const res = await fetch(`${getApiBase()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });
    
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    
    messages.value.push({ role: 'ai', text: data.response });
  } catch (err) {
    messages.value.push({ role: 'ai', text: '[SYSTEM_ERROR]: Matrix communication failure.' });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
};
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    
    <!-- Chat Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-8 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-8 opacity-0 scale-95"
    >
      <div v-if="isOpen" class="mb-4 w-96 h-[500px] rounded-lume bg-slate-950 border border-slate-800 shadow-2xl flex flex-col overflow-hidden relative">
        <div class="absolute inset-0 bg-emerald-500/5 mix-blend-overlay pointer-events-none"></div>
        
        <!-- Header -->
        <div class="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50 relative z-10">
          <div class="flex items-center gap-2 text-emerald-400 font-mono text-sm tracking-widest font-bold">
            <Terminal class="w-4 h-4" />
            INTELLIGENCE LIAISON
          </div>
          <button @click="toggleChat" class="text-slate-500 hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Messages -->
        <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-mono text-sm relative z-10">
          <div 
            v-for="(msg, i) in messages" 
            :key="i"
            class="flex items-start gap-3 max-w-[90%]"
            :class="msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'"
          >
            <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border"
                 :class="msg.role === 'user' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'">
              <Brain v-if="msg.role === 'ai'" class="w-4 h-4" />
              <div v-else class="text-xs font-bold font-sans">US</div>
            </div>
            
            <div class="p-3 rounded-xl border leading-relaxed whitespace-pre-wrap"
                 :class="msg.role === 'user' 
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 rounded-tr-sm' 
                  : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-100/90 rounded-tl-sm'">
              {{ msg.text }}
            </div>
          </div>
          
          <div v-if="loading" class="flex gap-2 p-2 items-center text-emerald-500/50 self-start">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 border-t border-slate-800 bg-slate-900/50 relative z-10">
          <form @submit.prevent="sendMessage" class="relative">
            <input 
              v-model="input" 
              type="text" 
              placeholder="Query matrix..."
              class="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
            >
            <button 
              type="submit" 
              :disabled="loading || !input.trim()"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-400 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
            >
              <Send class="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Trigger Button -->
    <button 
      @click="toggleChat"
      class="group relative w-14 h-14 bg-slate-900 border-2 border-emerald-500/30 hover:border-emerald-400 rounded-full flex items-center justify-center shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all overflow-hidden"
    >
      <div class="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <!-- Pulse Ring -->
      <div class="absolute inset-0 rounded-full border border-emerald-500/50 animate-ping"></div>
      
      <Brain class="w-6 h-6 text-emerald-400 relative z-10 drop-shadow-md" :class="{'opacity-0 scale-50 transition-all duration-300': isOpen, 'opacity-100 scale-100 transition-all duration-300': !isOpen}" />
      <X class="w-6 h-6 text-emerald-400 absolute transition-all duration-300" :class="{'opacity-100 scale-100': isOpen, 'opacity-0 scale-50': !isOpen}" />
    </button>
  </div>
</template>

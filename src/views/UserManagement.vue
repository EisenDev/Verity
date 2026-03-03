<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Ban, 
  CheckCircle, 
  Trash2, 
  Key,
  LogOut,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next';
import Sidebar from '../components/Sidebar.vue';

interface ManagedUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  department: string | null;
  status: 'active' | 'suspended';
  lastLogin: string | null;
  password?: string;
}

const router = useRouter();
const loading = ref(false);
const users = ref<ManagedUser[]>([]);
const search = ref('');

// Password Modal State
const showPassModal = ref(false);
const selectedUser = ref<ManagedUser | null>(null);
const decodedPassword = ref('');
const isDecoding = ref(false);
const showDecoded = ref(false);
const newPassword = ref('');
const isSavingPass = ref(false);

const openPasswordModal = async (user: ManagedUser) => {
    selectedUser.value = user;
    newPassword.value = '';
    decodedPassword.value = '';
    showDecoded.value = false;
    showPassModal.value = true;
    
    // Auto-decode for admin oversight
    isDecoding.value = true;
    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${user.id}/decode`);
        const json = await res.json();
        decodedPassword.value = json.password;
    } catch (e) {
        console.error('Decoding failure', e);
    } finally {
        isDecoding.value = false;
    }
};

const fetchUsers = async () => {
    loading.value = true;
    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users`);
        const json = await res.json();
        users.value = json.data;
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const toggleStatus = async (user: ManagedUser) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${user.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) fetchUsers();
    } catch (e) { console.error(e); }
};

const commitPasswordReset = async () => {
    if (!selectedUser.value || !newPassword.value) return;
    
    isSavingPass.value = true;
    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${selectedUser.value.id}/reset-password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword.value })
        });
        const json = await res.json();
        if (json.success) {
            showPassModal.value = false;
            fetchUsers();
        }
    } catch (e) {
        console.error(e);
    } finally {
        isSavingPass.value = false;
    }
};

const deleteUser = async (userId: string) => {
    if (!confirm('CRITICAL: Permanent deletion from the Sovereign database. Proceed?')) return;
    try {
        const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: 'DELETE'
        });
        if (res.ok) fetchUsers();
    } catch (e) { console.error(e); }
};

const handleLogout = () => {
  sessionStorage.removeItem('user');
  document.cookie = 'auth_token=; Max-Age=0; path=/;';
  router.push('/login');
};

const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
};

onMounted(() => {
    const userData = sessionStorage.getItem('user');
    if (!userData || JSON.parse(userData).role !== 'admin') {
        router.push('/dashboard');
        return;
    }
    fetchUsers();
});

const filteredUsers = computed(() => {
    return users.value.filter(u => 
        u.email.toLowerCase().includes(search.value.toLowerCase()) ||
        (u.name?.toLowerCase() || '').includes(search.value.toLowerCase())
    );
});
</script>

<script lang="ts">
import { computed } from 'vue';
</script>

<template>
  <div class="h-screen w-full bg-slate-950 text-slate-100 flex overflow-hidden selection:bg-emerald-500/30">
    <!-- Left Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 font-sans">
      
      <!-- Header -->
      <header class="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur z-20 flex-shrink-0">
        <div class="flex items-center gap-4">
            <h2 class="text-xl font-bold tracking-tight text-white flex items-center gap-3">
            Internal Staff Governance
            <span class="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Authorized Personnel Only
            </span>
            </h2>
        </div>
        
        <div class="flex items-center gap-4">
          <button @click="handleLogout" class="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white" title="Logout">
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- Dashboard Body -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.03),transparent_50%_100%)]">
        <div class="max-w-7xl mx-auto p-8 flex flex-col min-h-full">
          
          <!-- Controls Panel -->
          <div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div class="relative w-full md:w-96 group">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                    v-model="search"
                    type="text" 
                    placeholder="Search personnel by name or email..." 
                    class="w-full bg-slate-900 border border-slate-800 rounded-lume pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
                />
            </div>
            <button class="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lume text-sm transition-all shadow-lg active:scale-95">
                <UserPlus class="w-4 h-4" />
                ENROLL NEW STAFF
            </button>
          </div>

          <!-- User Table -->
          <div class="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm flex-1 flex flex-col min-h-0">
            <div class="overflow-x-auto flex-1">
              <table class="w-full text-left text-sm text-slate-300">
                <thead class="bg-slate-950/50 text-xs uppercase text-slate-500 border-b border-slate-800 font-mono tracking-widest">
                  <tr>
                    <th class="px-6 py-4 font-semibold">Staff Identity</th>
                    <th class="px-6 py-4 font-semibold">Department</th>
                    <th class="px-6 py-4 font-semibold">Access Role</th>
                    <th class="px-6 py-4 font-semibold">Status</th>
                    <th class="px-6 py-4 font-semibold">Last Login</th>
                    <th class="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-800/30 transition-colors group">
                    <td class="px-6 py-5">
                      <div class="flex flex-col">
                        <span class="text-slate-200 font-bold tracking-tight">{{ user.name || 'Anonymous Staff' }}</span>
                        <span class="text-xs text-slate-500">{{ user.email }}</span>
                        <span class="text-[10px] text-slate-600 font-mono mt-1">{{ user.id }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <span class="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700 font-medium">
                        {{ user.department || 'GLOBAL' }}
                      </span>
                    </td>
                    <td class="px-6 py-5">
                      <div class="flex items-center gap-2">
                        <div :class="user.role === 'admin' ? 'text-emerald-400' : 'text-slate-400'" class="flex items-center gap-1.5 font-bold text-xs uppercase tracking-tighter">
                          <ShieldCheck v-if="user.role === 'admin'" class="w-3.5 h-3.5" />
                          {{ user.role }}
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <span 
                        :class="user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'"
                        class="px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider"
                      >
                        {{ user.status }}
                      </span>
                    </td>
                    <td class="px-6 py-5 font-mono text-xs text-slate-500">
                      {{ formatDate(user.lastLogin) }}
                    </td>
                    <td class="px-6 py-5 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button 
                            @click="toggleStatus(user)"
                            class="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                            :title="user.status === 'active' ? 'Suspend Access' : 'Activate Access'"
                        >
                          <Ban v-if="user.status === 'active'" class="w-4 h-4 text-rose-500 hover:scale-110" />
                          <CheckCircle v-else class="w-4 h-4 text-emerald-500" />
                        </button>
                        <button 
                            @click="openPasswordModal(user)"
                            class="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors hover:text-white"
                            title="Manage Access Credentials"
                        >
                          <Key class="w-4 h-4" />
                        </button>
                        <button 
                            @click="deleteUser(user.id)"
                            class="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors hover:text-rose-500"
                            title="Permanent Deletion"
                        >
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="loading" class="py-20 flex flex-col items-center justify-center gap-4">
                <div class="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                <p class="text-xs font-bold text-emerald-500 animate-pulse tracking-widest uppercase">Fetching Organization Records...</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>

    <!-- Sovereign Password Management Modal -->
    <div v-if="showPassModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 transform transition-all">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Key class="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-white">Access Governance</h3>
            <p class="text-xs text-slate-500 font-mono">Credential Management Matrix</p>
          </div>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Target Personnel</label>
            <div class="px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-300 font-medium">
              {{ selectedUser?.name || selectedUser?.email }}
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Sovereign Decoder Output</label>
            <div class="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-emerald-400 font-mono text-sm flex items-center justify-between group/pass">
              <span v-if="isDecoding" class="animate-pulse">DECRYPTING...</span>
              <span v-else>
                {{ showDecoded ? decodedPassword : '••••••••••••' }}
              </span>
              <button @click="showDecoded = !showDecoded" class="text-slate-500 hover:text-emerald-500 transition-colors">
                <Eye v-if="!showDecoded" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">New Access Override</label>
            <input 
              v-model="newPassword"
              type="text" 
              placeholder="Inject new secure password..."
              class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>

        <div class="mt-8 flex gap-3">
          <button 
            @click="showPassModal = false"
            class="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-all"
          >
            ABORT
          </button>
          <button 
            @click="commitPasswordReset"
            :disabled="!newPassword || isSavingPass"
            class="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            {{ isSavingPass ? 'REWRITING...' : 'OVERRIDE ACCESS' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

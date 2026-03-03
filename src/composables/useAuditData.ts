import { ref } from 'vue';
import type { Department, Sentiment } from '../types/audit';

export interface AuditFilters {
    department?: Department | 'All';
    rating?: number | null;
    sentiment?: Sentiment | 'all';
    search?: string;
    mode?: 'triage';
}

export function useAuditData() {
    const loading = ref(false);

    const fetchPage = async (page: number, pageSize: number, filters?: AuditFilters) => {
        const userStr = sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const isAdmin = user?.role === 'admin';

        loading.value = true;

        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            if (filters) {
                // GLOBAL ACCESS FIX: Removed forced department filter for non-admins
                if (filters.department && filters.department !== 'All') {
                    queryParams.append('department', filters.department);
                }

                if (filters.rating) queryParams.append('rating', filters.rating.toString());
                if (filters.sentiment && filters.sentiment !== 'all') queryParams.append('sentiment', filters.sentiment);
                if (filters.search) queryParams.append('search', filters.search);
                if (filters.mode) queryParams.append('mode', filters.mode);
            }

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/reviews?${queryParams.toString()}`, {
                headers: {
                    'X-User-ID': user?.id || ''
                }
            });
            if (!res.ok) throw new Error('Failed to fetch records');

            const { data, total, kpi } = await res.json();

            const processedData = data.map((r: any) => ({
                ...r,
                lineItems: r.line_items || []
            }));

            // Secondary UI guard: nullify financial risk for non-admins if API didn't already
            const sanitizedKpi = {
                ...kpi,
                totalFinancialRisk: isAdmin ? kpi.totalFinancialRisk : null
            };

            return { data: processedData, total, kpi: sanitizedKpi };

        } catch (e) {
            console.error(e);
            return {
                data: [],
                total: 0,
                kpi: { averageRating: null, totalFinancialRisk: null, pendingRemediationCount: 0 }
            };
        } finally {
            loading.value = false;
        }
    };

    const regenerateAssessment = async (id: string) => {
        const userStr = sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/reviews/${id}/regenerate`, {
            method: 'PUT',
            headers: { 'X-User-ID': user?.id || '' }
        });
        if (!res.ok) throw new Error('Regeneration failed');
        const json = await res.json();
        return {
            ...json.data,
            lineItems: json.data.line_items || []
        };
    };

    const updateAssessmentItems = async (id: string, lineItems: { item: string, cost: number }[]) => {
        const userStr = sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/reviews/${id}/items`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': user?.id || ''
            },
            body: JSON.stringify({ lineItems })
        });
        if (!res.ok) throw new Error('Update failed');
        const json = await res.json();
        return {
            ...json.data,
            lineItems: json.data.line_items || []
        };
    };

    return {
        loading,
        fetchPage,
        regenerateAssessment,
        updateAssessmentItems
    };
}

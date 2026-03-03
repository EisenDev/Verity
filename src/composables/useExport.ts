import { unref, type MaybeRef } from 'vue';
import type { AuditFilters } from './useAuditData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as xlsx from 'xlsx';

export function useExport() {
    const generateExecutiveReport = async (filters: MaybeRef<AuditFilters>, format: 'pdf' | 'excel' = 'pdf', startDate?: string, endDate?: string) => {
        const activeFilters = unref(filters);
        const queryParams = new URLSearchParams({
            page: '1',
            pageSize: '5000'
        });
        if (activeFilters.department && activeFilters.department !== 'All') queryParams.append('department', activeFilters.department);
        if (activeFilters.rating) queryParams.append('rating', activeFilters.rating.toString());
        if (activeFilters.sentiment && activeFilters.sentiment !== 'all') queryParams.append('sentiment', activeFilters.sentiment);
        if (activeFilters.search) queryParams.append('search', activeFilters.search);
        if (activeFilters.mode) queryParams.append('mode', activeFilters.mode);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/reviews?${queryParams.toString()}`);
            const { data } = await res.json();
            const dateStamp = new Date().toISOString().split('T')[0];

            if (format === 'excel') {
                const worksheetData = data.map((row: any) => ({
                    ID: row.id,
                    Date: new Date(row.timestamp).toLocaleString(),
                    Dept: row.department,
                    Inspector: row.inspector,
                    Rating: row.rating,
                    Sentiment: row.sentiment,
                    Findings: row.findings,
                    Cost: row.remediation_cost,
                    LineItems: Array.isArray(row.line_items) ? row.line_items.map((i: any) => `${i.item} ($${i.cost})`).join('; ') : ''
                }));
                const ws = xlsx.utils.json_to_sheet(worksheetData);
                const wb = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(wb, ws, "VERITY Report");
                xlsx.writeFile(wb, `VERITY_Audit_Report_${dateStamp}.xlsx`);
            } else {
                const doc = new jsPDF('l', 'mm', 'a4');
                doc.setFontSize(22);
                doc.setTextColor(16, 185, 129);
                doc.text('VERITY EXECUTIVE AUDIT INTELLIGENCE', 14, 20);

                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
                if (startDate) doc.text(`Period: ${startDate} to ${endDate}`, 14, 34);

                const tableRows = data.map((r: any) => [
                    r.id.split('-')[0],
                    new Date(r.timestamp).toLocaleDateString(),
                    r.department,
                    r.rating + '/5',
                    r.sentiment.toUpperCase(),
                    `$${Number(r.remediation_cost).toLocaleString()}`
                ]);

                autoTable(doc, {
                    startY: 40,
                    head: [['ID', 'Date', 'Department', 'Rating', 'Sentiment', 'Remediation Cost']],
                    body: tableRows,
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [15, 23, 42] }
                });

                doc.save(`VERITY_Executive_Report_${dateStamp}.pdf`);
            }
        } catch (e) {
            console.error("Export failed", e);
        }
    };

    return { generateExecutiveReport };
}

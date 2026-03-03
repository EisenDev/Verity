export type AuditRole = 'ADMIN' | 'DEPT_USER';
export type Department = 'Housekeeping' | 'Maintenance' | 'F&B';
export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface AuditRecord {
    id: string;
    timestamp: string;
    inspector_name: string;
    department: Department;
    rating: number; // 1 to 5
    sentiment: Sentiment;
    findings: string;
    remediation_cost: number;
    lineItems?: { item: string; cost: number }[];
}

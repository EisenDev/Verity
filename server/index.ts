import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PrismaClient } from '@prisma/client';
import { setCookie } from 'hono/cookie';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { serveStatic } from '@hono/node-server/serve-static';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from('v3r1ty_s0v3r31gn_k3y_32_byt3s_!!', 'utf8'); // 32 bytes
const IV_LENGTH = 16;

function encrypt(text: string) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

const app = new Hono();
const prisma = new PrismaClient();

console.log('Matrix Intelligence initialization. System model:', process.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash');
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

app.use('/api/*', cors({
    origin: '*',
    credentials: true,
}));

app.post('/api/login', async (c) => {
    const body = await c.req.json();
    const { email, password } = body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return c.json({ error: 'Invalid credentials' }, 401);
    let isMatch = false;
    try {
        const decrypted = decrypt(user.password);
        isMatch = decrypted === password;
    } catch (e) {
        isMatch = user.password === password;
    }
    if (!isMatch) return c.json({ error: 'Invalid credentials' }, 401);
    if (user.status !== 'active') return c.json({ error: 'Account suspended' }, 403);
    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    setCookie(c, 'auth_token', user.id, { httpOnly: false, secure: false, path: '/', maxAge: 60 * 60 * 24 });
    return c.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, department: user.department, status: user.status } });
});

app.get('/api/users', async (c) => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    const processed = users.map(u => ({ ...u, password: 'ENC:' + u.id.split('-')[0] }));
    return c.json({ data: processed });
});

app.get('/api/users/:id/decode', async (c) => {
    const id = c.req.param('id');
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return c.json({ error: 'Not found' }, 404);
    try { return c.json({ password: decrypt(user.password) }); } catch (e) { return c.json({ password: user.password }); }
});

app.put('/api/users/:id/status', async (c) => {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    const user = await prisma.user.update({ where: { id }, data: { status } });
    return c.json({ data: user });
});

app.put('/api/users/:id/reset-password', async (c) => {
    const id = c.req.param('id');
    const { password } = await c.req.json();
    const targetPassword = password || ('RESET_' + Math.floor(Math.random() * 9999));
    await prisma.user.update({ where: { id }, data: { password: encrypt(targetPassword) } });
    return c.json({ success: true, message: 'Administrative access override complete.' });
});

app.delete('/api/users/:id', async (c) => {
    const id = c.req.param('id');
    await prisma.user.delete({ where: { id } });
    return c.json({ success: true });
});

app.get('/api/reviews', async (c) => {
    const page = Number(c.req.query('page') || '1');
    const pageSize = Number(c.req.query('pageSize') || '20');
    const department = c.req.query('department');
    const rating = c.req.query('rating');
    const sentiment = c.req.query('sentiment');
    const search = c.req.query('search');
    const where: any = {};
    if (department && department !== 'All') where.department = department;
    if (rating) where.rating = parseInt(rating);
    if (sentiment && sentiment !== 'all') where.sentiment = sentiment;
    if (search) {
        where.OR = [
            { findings: { contains: search, mode: 'insensitive' } },
            { inspector: { contains: search, mode: 'insensitive' } }
        ];
    }
    const [total, data, aggregations, negCount] = await Promise.all([
        prisma.review.count({ where }),
        prisma.review.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { timestamp: 'desc' } }),
        prisma.review.aggregate({ where, _avg: { rating: true }, _sum: { remediation_cost: true } }),
        prisma.review.count({ where: { ...where, sentiment: 'negative' } })
    ]);
    return c.json({ total, data, kpi: { averageRating: aggregations._avg.rating || 0, totalFinancialRisk: Number(aggregations._sum.remediation_cost) || 0, pendingRemediationCount: negCount } });
});

app.put('/api/reviews/:id/regenerate', async (c) => {
    const id = c.req.param('id');
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return c.json({ error: 'Not found' }, 404);
    try {
        const model = genAI.getGenerativeModel({ model: process.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash' });
        const result = await model.generateContent(`Estimate itemized remediation costs for: "${review.findings}"`);
        const updated = await prisma.review.update({ where: { id }, data: { remediation_cost: 150 } });
        return c.json({ success: true, data: updated });
    } catch (e) { return c.json({ error: 'AI Matrix failed' }, 500); }
});

app.post('/api/chat', async (c) => {
    const { message } = await c.req.json();
    try {
        const model = genAI.getGenerativeModel({ model: process.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash' });
        const result = await model.generateContent(message);
        return c.json({ response: result.response.text() });
    } catch (e) { return c.json({ response: 'Liaison offline.' }, 500); }
});

app.get('/api/analytics', async (c) => {
    const departments = ['Housekeeping', 'Maintenance', 'F&B'];
    const performance = await Promise.all(departments.map(async (dept) => {
        const agg = await prisma.review.aggregate({
            where: { department: dept }, _avg: { rating: true }, _count: { id: true }, _sum: { remediation_cost: true }
        });
        return { department: dept, averageRating: agg._avg.rating || 0, totalAudits: agg._count.id, totalRemediationCost: Number(agg._sum.remediation_cost) || 0 };
    }));
    return c.json({ data: performance });
});

// SERVE FRONTEND (Azure Monolith)
app.use('/*', serveStatic({ root: './dist' }));
app.notFound((c) => {
    if (c.req.path.startsWith('/api')) return c.json({ error: 'Not found' }, 404);
    try { return c.html(readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf-8')); }
    catch { return c.text('Matrix Initializing...'); }
});

const port = Number(process.env.PORT) || 3000;
console.log(`[SOVEREIGN_ENGINE]: Deploying on port ${port}...`);
serve({ fetch: app.fetch, port });

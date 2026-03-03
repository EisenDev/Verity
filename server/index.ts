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
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));

// Artificial delay middleware
app.use('/api/reviews', async (c, next) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    await next();
});


app.post('/api/login', async (c) => {
    const body = await c.req.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) return c.json({ error: 'Invalid credentials' }, 401);

    // Try to decrypt or compare raw (if seeded old)
    let isMatch = false;
    try {
        const decrypted = decrypt(user.password);
        isMatch = decrypted === password;
    } catch (e) {
        // Fallback for raw passwords (seeded)
        isMatch = user.password === password;
    }

    if (!isMatch) {
        return c.json({ error: 'Invalid credentials' }, 401);
    }

    if (user.status !== 'active') {
        return c.json({ error: 'Account suspended by Sovereign Governance' }, 403);
    }

    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
    });

    // Set a secure cookie for the session (simplified token)
    setCookie(c, 'auth_token', user.id, {
        httpOnly: false, // Accessible to Vue for auth check
        secure: false, // local dev
        path: '/',
        maxAge: 60 * 60 * 24 // 1 day
    });

    return c.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
            status: user.status
        }
    });
});

app.get('/api/users', async (c) => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    // For admin view, we'll provide the 'DECODED' password label if requested
    const processed = users.map(u => ({
        ...u,
        password: 'ENC:' + u.id.split('-')[0] // Masked even for general admin list
    }));
    return c.json({ data: processed });
});

app.get('/api/users/:id/decode', async (c) => {
    const id = c.req.param('id');
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return c.json({ error: 'Not found' }, 404);

    try {
        const physicalPassword = decrypt(user.password);
        return c.json({ password: physicalPassword });
    } catch (e) {
        return c.json({ password: user.password }); // Fallback if raw
    }
});

app.put('/api/users/:id/status', async (c) => {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    const user = await prisma.user.update({
        where: { id },
        data: { status }
    });
    return c.json({ data: user });
});

app.put('/api/users/:id/reset-password', async (c) => {
    const id = c.req.param('id');
    const { password } = await c.req.json();

    const targetPassword = password || ('RESET_' + Math.floor(Math.random() * 9999));
    const encryptedPassword = encrypt(targetPassword);

    await prisma.user.update({
        where: { id },
        data: { password: encryptedPassword }
    });
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
    const mode = c.req.query('mode'); // e.g., 'triage'
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    // RBAC: Check user from cookie or query? Usually from session.
    // Simplifying: we'll check if a 'userId' query param is passed or assume admin if missing for this demo's complexity.
    // In real app, we verify the auth_token.
    const userId = c.req.header('X-User-ID');
    const requestingUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

    // Build Prisma Where Clause
    const where: any = {};

    // REMOVED FOR USER REQUEST: dept_user can now see all 5,000 records
    /*
    if (requestingUser && requestingUser.role !== 'admin') {
        where.department = requestingUser.department;
    } else 
    */
    if (department && department !== 'All') {
        where.department = department;
    }

    if (startDate && endDate) {
        where.timestamp = {
            gte: new Date(startDate),
            lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        };
    }

    if (mode === 'triage') {
        const triageCondition = {
            OR: [
                { rating: 1, sentiment: 'negative' },
                { rating: 5, sentiment: 'negative' }
            ]
        };
        if (where.OR) {
            where.AND = [triageCondition];
        } else {
            where.OR = triageCondition.OR;
        }
    } else {
        if (rating) {
            where.rating = parseInt(rating);
        }
        if (sentiment && sentiment !== 'all') {
            where.sentiment = sentiment;
        }
    }

    if (search) {
        const searchLower = search.toLowerCase();
        const searchCondition = {
            OR: [
                { findings: { contains: searchLower, mode: 'insensitive' as const } },
                { inspector: { contains: searchLower, mode: 'insensitive' as const } },
                { id: { contains: searchLower, mode: 'insensitive' as const } }
            ]
        };
        if (!where.AND) where.AND = [];
        where.AND.push(searchCondition);
    }

    // Build aggregations for KPIs (filtered by the same criteria)
    const [total, data, aggregations, pendingRemediations] = await Promise.all([
        prisma.review.count({ where }),
        prisma.review.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { timestamp: 'desc' }
        }),
        prisma.review.aggregate({
            where,
            _avg: { rating: true },
            _sum: { remediation_cost: true }
        }),
        prisma.review.count({
            where: { ...where, sentiment: 'negative' }
        })
    ]);

    const isAdmin = requestingUser ? requestingUser.role === 'admin' : true;

    return c.json({
        total,
        data,
        kpi: {
            averageRating: aggregations._avg.rating,
            totalFinancialRisk: isAdmin ? aggregations._sum.remediation_cost : null,
            pendingRemediationCount: pendingRemediations
        }
    });
});

app.put('/api/reviews/:id/regenerate', async (c) => {
    const id = c.req.param('id');
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return c.json({ error: 'Not found' }, 404);

    try {
        const model = genAI.getGenerativeModel({
            model: process.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash',
            systemInstruction: 'You are an itemized cost estimator. Reply only in valid JSON arrays containing objects with `item` (string) and `cost` (number).'
        });
        const prompt = `Based on these hotel audit findings, estimate realistic remediation line items and costs. Findings: "${review.findings}". Department: ${review.department}`;

        const result = await model.generateContent(prompt);
        let rawText = result.response.text().trim();
        if (rawText.startsWith('```json')) rawText = rawText.substring(7);
        if (rawText.endsWith('```')) rawText = rawText.substring(0, rawText.length - 3);

        const lineItems = JSON.parse(rawText);
        const newCost = lineItems.reduce((acc: number, item: any) => acc + item.cost, 0);

        const updated = await prisma.review.update({
            where: { id },
            data: {
                line_items: lineItems,
                remediation_cost: newCost
            }
        });

        return c.json({ success: true, data: updated });
    } catch (e) {
        console.error(e);
        return c.json({ error: 'AI Matrix failed to generate' }, 500);
    }
});

app.put('/api/reviews/:id/items', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { lineItems } = body;

    const newCost = lineItems.reduce((acc: number, item: any) => acc + item.cost, 0);

    const updated = await prisma.review.update({
        where: { id },
        data: {
            line_items: lineItems,
            remediation_cost: newCost
        }
    });

    return c.json({ success: true, data: updated });
});

app.post('/api/chat', async (c) => {
    const { message } = await c.req.json();

    try {
        const verityDoc = readFileSync(join(process.cwd(), 'public', 'verity.txt'), 'utf-8');
        const model = genAI.getGenerativeModel({
            model: process.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash',
            systemInstruction: `You are the VERITY Intelligence Liaison. Answer ONLY based on this documentation:\n\n${verityDoc}\n\nIf the answer is not in the documentation, politely state that your matrix is only authorized to discuss VERITY operational parameters.`
        });

        const result = await model.generateContent(message);
        return c.json({ response: result.response.text() });
    } catch (e) {
        console.error(e);
        return c.json({ response: '[SYSTEM_ERROR]: Documentation load failure. Liaison offline.' }, 500);
    }
});

app.get('/api/analytics', async (c) => {
    // RBAC: Analytics restricted to ADMIN
    const userId = c.req.header('X-User-ID');
    const requestingUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

    if (requestingUser && requestingUser.role !== 'admin') {
        return c.json({ error: 'Unauthorized Intelligence Access' }, 403);
    }

    // Generate department performance data
    const departments = ['Housekeeping', 'Maintenance', 'F&B'];
    const performance = [];

    for (const dept of departments) {
        const agg = await prisma.review.aggregate({
            where: { department: dept },
            _avg: { rating: true },
            _count: { id: true },
            _sum: { remediation_cost: true }
        });

        const negCount = await prisma.review.count({
            where: { department: dept, sentiment: 'negative' }
        });

        performance.push({
            department: dept,
            averageRating: agg._avg.rating || 0,
            totalAudits: agg._count.id,
            negativeAudits: negCount,
            totalRemediationCost: Number(agg._sum.remediation_cost) || 0
        });
    }

    const sentimentsAggregation = await prisma.review.groupBy({
        by: ['sentiment'],
        _count: { sentiment: true }
    });

    const sentiments = sentimentsAggregation.map(s => ({
        sentiment: s.sentiment,
        count: s._count.sentiment
    }));

    // Fetch the 1000 most recent records to simulate a timeline easily without complex SQL
    const recentReviews = await prisma.review.findMany({
        take: 1000,
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true, sentiment: true }
    });

    const timelineMap: Record<string, { total: number, negative: number }> = {};
    recentReviews.forEach((r: any) => {
        // Date format YYYY-MM-DD
        const date = r.timestamp.toISOString().split('T')[0];
        if (!timelineMap[date]) timelineMap[date] = { total: 0, negative: 0 };
        timelineMap[date].total++;
        if (r.sentiment === 'negative') timelineMap[date].negative++;
    });

    const timeline = Object.keys(timelineMap).sort().map(date => ({
        date,
        total: timelineMap[date].total,
        negative: timelineMap[date].negative
    })).slice(-10); // Take the last 10 days of data

    return c.json({ data: performance, sentiments, timeline });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port
});

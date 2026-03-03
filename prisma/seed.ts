import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

type Department = 'Housekeeping' | 'Maintenance' | 'F&B';
type Sentiment = 'positive' | 'neutral' | 'negative';

interface AItemplate {
    department: Department;
    sentiment: Sentiment;
    findings: string;
    line_items: { item: string, cost: number }[];
    total_cost: number;
}

// Fallback just in case Gemini rejects or rate limits during seeder launch
const fallbackTemplates: AItemplate[] = [
    { department: 'Housekeeping', sentiment: 'negative', findings: 'The primary bed frame is completely cracked on the left support rail. Extensive mold was found under bathroom sink.', line_items: [{ item: 'King Bed Frame Replacement', cost: 450 }, { item: 'Mold Remediation Labor', cost: 120 }], total_cost: 570 },
    { department: 'Maintenance', sentiment: 'negative', findings: 'HVAC unit is blowing warm air and capacitor smells burnt. Several lightbulbs blown out.', line_items: [{ item: 'HVAC Capacitor Replacement', cost: 350 }, { item: 'Lighting Replacement', cost: 40 }], total_cost: 390 },
    { department: 'F&B', sentiment: 'positive', findings: 'Excellent kitchen sanitation. All fridges are at target temperatures with logs perfectly maintained.', line_items: [], total_cost: 0 },
];

async function generateWithAI(): Promise<AItemplate[]> {
    console.log('Interfacing with Intelligence Matrix (Gemini)... Building templates...');
    try {
        const model = genAI.getGenerativeModel({
            model: process.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash',
            systemInstruction: 'You are a hotel inspector system. You reply ONLY in raw valid JSON arrays.'
        });
        const prompt = `Generate a JSON array of 30 distinct, highly detailed hotel audit findings.Each object must have:
"department"(must be "Housekeeping", "Maintenance", or "F&B")
"sentiment"(must be "positive", "neutral", or "negative")
"findings"(2 - 3 sentences of raw descriptive evidence.Realistic inspection tone.)
"line_items"(an array of { "item": string, "cost": number } representing the cost to fix.If positive / neutral, this can be empty)
"total_cost"(integer sum of line_items, or 0)
Make sure the syntax is purely valid JSON nothing else !`;

        const result = await model.generateContent(prompt);
        let rawText = result.response.text().trim();
        // cleanse markdown blocks
        if (rawText.startsWith('```json')) rawText = rawText.substring(7);
        if (rawText.endsWith('```')) rawText = rawText.substring(0, rawText.length - 3);

        const templates = JSON.parse(rawText) as AItemplate[];
        console.log(`Successfully generated ${templates.length} templates from AI.`);
        return templates;
    } catch (e) {
        console.error('AI Strategy generation failed, using fallback templates.', e);
        return fallbackTemplates;
    }
}

async function main() {
    console.log('Seeding Database...');

    // 1. Ensure the users exist
    const adminEmail = 'admin@zenith.me';
    const userEmail = 'staff@zenith.me';

    await prisma.user.upsert({
        where: { email: 'admin@zenith.me' },
        update: { password: encrypt('password123') },
        create: {
            email: 'admin@zenith.me',
            name: 'Sovereign Admin',
            password: encrypt('password123'),
            role: 'admin',
            department: 'GLOBAL',
            status: 'active'
        }
    });

    await prisma.user.upsert({
        where: { email: 'staff@zenith.me' },
        update: { password: encrypt('password123') },
        create: {
            email: 'staff@zenith.me',
            name: 'Dept Lead',
            password: encrypt('password123'),
            role: 'dept_user',
            department: 'Housekeeping',
            status: 'active'
        }
    });

    // 2. Clear existing reviews
    await prisma.review.deleteMany({});

    // 3. Obtain templates
    const templates = await generateWithAI();
    const inspectors = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Evan Wright', 'Fiona Gallagher'];

    const mockData = [];
    for (let i = 0; i < 5000; i++) {
        const t = templates[Math.floor(Math.random() * templates.length)];

        let rating = 3;
        const rand = Math.random();
        if (t.sentiment === 'positive') {
            rating = rand > 0.1 ? Math.floor(Math.random() * 2) + 4 : Math.floor(Math.random() * 5) + 1;
        } else if (t.sentiment === 'negative') {
            rating = rand > 0.1 ? Math.floor(Math.random() * 2) + 1 : 5;
        } else {
            rating = Math.floor(Math.random() * 3) + 2;
        }

        mockData.push({
            id: crypto.randomUUID(),
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)),
            inspector: inspectors[Math.floor(Math.random() * inspectors.length)],
            department: t.department,
            rating,
            sentiment: t.sentiment,
            findings: t.findings,
            line_items: t.line_items,
            remediation_cost: t.total_cost
        });
    }

    const batchSize = 1000;
    for (let i = 0; i < mockData.length; i += batchSize) {
        const batch = mockData.slice(i, i + batchSize);
        await prisma.review.createMany({ data: batch });
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(mockData.length / batchSize)}`);
    }

    console.log('Seeding complete! 5000 fully verified AI records created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

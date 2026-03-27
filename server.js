import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
import { z } from 'zod';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'leads.db');
const csvPath = path.join(dataDir, 'leads.csv');

fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    createdAt TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    businessName TEXT NOT NULL,
    website TEXT,
    serviceInterest TEXT NOT NULL,
    monthlyLeads TEXT,
    timeline TEXT,
    budgetRange TEXT,
    goals TEXT NOT NULL,
    referralSource TEXT,
    status TEXT NOT NULL DEFAULT 'new'
  )
`);

const insertLead = db.prepare(`
  INSERT INTO leads (
    createdAt, name, email, phone, businessName, website, serviceInterest,
    monthlyLeads, timeline, budgetRange, goals, referralSource, status
  ) VALUES (
    @createdAt, @name, @email, @phone, @businessName, @website, @serviceInterest,
    @monthlyLeads, @timeline, @budgetRange, @goals, @referralSource, 'new'
  )
`);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'site')));

const leadSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  phone: z.string().max(40).optional().default(''),
  businessName: z.string().min(2).max(180),
  website: z.string().max(180).optional().default(''),
  serviceInterest: z.string().min(2).max(80),
  monthlyLeads: z.string().max(40).optional().default(''),
  timeline: z.string().max(80).optional().default(''),
  budgetRange: z.string().max(80).optional().default(''),
  goals: z.string().min(10).max(2000),
  referralSource: z.string().max(120).optional().default('')
});

function csvSafe(value) {
  const normalized = String(value ?? '').replace(/\r?\n/g, ' ').trim();
  return `"${normalized.replace(/"/g, '""')}"`;
}

function appendLeadToCsv(payload) {
  const exists = fs.existsSync(csvPath);
  if (!exists) {
    const header = [
      'createdAt','name','email','phone','businessName','website','serviceInterest',
      'monthlyLeads','timeline','budgetRange','goals','referralSource','status'
    ].join(',');
    fs.writeFileSync(csvPath, `${header}\n`, 'utf8');
  }
  const line = [
    payload.createdAt,
    payload.name,
    payload.email,
    payload.phone,
    payload.businessName,
    payload.website,
    payload.serviceInterest,
    payload.monthlyLeads,
    payload.timeline,
    payload.budgetRange,
    payload.goals,
    payload.referralSource,
    payload.status
  ].map(csvSafe).join(',');
  fs.appendFileSync(csvPath, `${line}\n`, 'utf8');
}

async function sendLeadEmail(payload) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const notifyTo = process.env.NOTIFY_TO;

  if (!host || !user || !pass || !notifyTo) return { sent: false, reason: 'smtp-not-configured' };

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || '587'),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user, pass }
  });

  const details = [
    ['Name', payload.name],
    ['Email', payload.email],
    ['Phone', payload.phone || 'N/A'],
    ['Business', payload.businessName],
    ['Website', payload.website || 'N/A'],
    ['Service', payload.serviceInterest],
    ['Monthly leads', payload.monthlyLeads || 'N/A'],
    ['Timeline', payload.timeline || 'N/A'],
    ['Budget', payload.budgetRange || 'N/A'],
    ['Referral source', payload.referralSource || 'N/A'],
    ['Goals', payload.goals]
  ];

  await transporter.sendMail({
    from: process.env.NOTIFY_FROM || user,
    to: notifyTo,
    subject: `New website lead: ${payload.businessName}`,
    text: details.map(([label, value]) => `${label}: ${value}`).join('\n')
  });

  return { sent: true };
}

async function sendLeadWebhook(payload) {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return { sent: false, reason: 'webhook-not-configured' };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Webhook failed with status ${response.status}`);
  }

  return { sent: true };
}

app.post('/api/leads', async (req, res) => {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: 'Invalid lead payload',
      details: parsed.error.flatten()
    });
  }

  const payload = {
    ...parsed.data,
    createdAt: new Date().toISOString(),
    status: 'new'
  };

  const result = insertLead.run(payload);
  appendLeadToCsv(payload);

  const notificationState = { email: null, webhook: null };

  try {
    notificationState.email = await sendLeadEmail(payload);
  } catch (error) {
    notificationState.email = { sent: false, reason: error.message };
  }

  try {
    notificationState.webhook = await sendLeadWebhook(payload);
  } catch (error) {
    notificationState.webhook = { sent: false, reason: error.message };
  }

  return res.status(201).json({
    ok: true,
    leadId: result.lastInsertRowid,
    notificationState
  });
});

app.get('/api/health', (_req, res) => {
  const leadCount = db.prepare('SELECT COUNT(*) AS count FROM leads').get().count;
  res.json({ ok: true, leadCount });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'site', 'index.html'));
});

const port = Number(process.env.PORT || '3000');
app.listen(port, () => {
  console.log(`Website MVP listening on http://localhost:${port}`);
});

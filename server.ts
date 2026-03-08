import 'dotenv/config';
import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import nodemailer from "nodemailer";
import path from "path";

const WA_NUMBER   = process.env.WA_NUMBER   || '';
const LEAD_EMAIL  = process.env.LEAD_EMAIL  || '';
const GMAIL_USER  = process.env.GMAIL_USER  || '';
const GMAIL_PASS  = process.env.GMAIL_APP_PASSWORD || '';

// Email transporter — only active when credentials are configured
const transporter = (GMAIL_USER && GMAIL_PASS)
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    })
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  const db = new Database("leads.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT,
      phone         TEXT NOT NULL,
      email         TEXT,
      property_type TEXT,
      district      TEXT,
      location      TEXT,
      area          TEXT,
      purpose       TEXT,
      message       TEXT,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  app.use(express.json());

  app.post("/api/leads", async (req, res) => {
    const { name, phone, email, propertyType, district, location, area, purpose, message } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "El teléfono es obligatorio." });
    }

    // Persist lead
    try {
      db.prepare(`
        INSERT INTO leads (name, phone, email, property_type, district, location, area, purpose, message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name || null, phone, email || null, propertyType || null, district || null, location || null, area || null, purpose || null, message || null);
    } catch (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Error al guardar la solicitud." });
    }

    // Send email notification (best-effort, non-blocking)
    if (transporter && LEAD_EMAIL) {
      transporter.sendMail({
        from: `"JCB Consult" <${GMAIL_USER}>`,
        to: LEAD_EMAIL,
        subject: `Nuevo prospecto — ${propertyType || 'Inmueble'} en ${district || 'Lima'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; color: #1A2B3C;">
            <h2 style="color: #1A2B3C; border-bottom: 2px solid #C5A059; padding-bottom: 8px;">
              Nuevo prospecto · JCB Consult
            </h2>
            <table style="width:100%; border-collapse: collapse; font-size:14px;">
              <tr><td style="padding:8px 0; color:#888; width:160px;">Nombre</td><td style="padding:8px 0; font-weight:600;">${name || '—'}</td></tr>
              <tr><td style="padding:8px 0; color:#888;">Teléfono / WhatsApp</td><td style="padding:8px 0; font-weight:600;">${phone}</td></tr>
              <tr><td style="padding:8px 0; color:#888;">Email</td><td style="padding:8px 0;">${email || '—'}</td></tr>
              <tr><td style="padding:8px 0; color:#888;">Tipo de inmueble</td><td style="padding:8px 0;">${propertyType || '—'}</td></tr>
              <tr><td style="padding:8px 0; color:#888;">Distrito</td><td style="padding:8px 0;">${district || '—'}</td></tr>
              <tr><td style="padding:8px 0; color:#888;">Ubicación</td><td style="padding:8px 0; font-weight:600;">${location || '—'}</td></tr>
              <tr><td style="padding:8px 0; color:#888;">Área aprox.</td><td style="padding:8px 0;">${area ? area + ' m²' : '—'}</td></tr>
              <tr><td style="padding:8px 0; color:#888;">Finalidad</td><td style="padding:8px 0;">${purpose || '—'}</td></tr>
              <tr><td style="padding:8px 0; color:#888; vertical-align:top;">Mensaje</td><td style="padding:8px 0;">${message || '—'}</td></tr>
            </table>
          </div>
        `,
      }).catch((err) => console.error("Email error:", err));
    } else if (!transporter) {
      console.log("⚠️  Email not configured. Set GMAIL_APP_PASSWORD in .env to enable notifications.");
    }

    // Build WhatsApp URL with pre-filled context (number lives server-side only)
    let waUrl: string | null = null;
    if (WA_NUMBER) {
      const lines = [
        `Hola Juan Carlos Bejarano, me interesa solicitar una tasación.`,
        name      ? `Nombre: ${name}` : null,
        propertyType ? `Tipo: ${propertyType}` : null,
        district  ? `Distrito: ${district}` : null,
        location  ? `Ubicación: ${location}` : null,
        area      ? `Área: ${area} m²` : null,
        purpose   ? `Finalidad: ${purpose}` : null,
        message   ? `Mensaje: ${message}` : null,
        phone     ? `Mi número: ${phone}` : null,
      ].filter(Boolean).join('\n');
      waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`;
    }

    res.json({ success: true, waUrl });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!transporter) console.log("ℹ️  Email: configure GMAIL_APP_PASSWORD in .env to enable.");
  });
}

startServer();

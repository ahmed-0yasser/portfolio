const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "change-me";
const DATA_DIR = path.join(__dirname, "data");
const PROFILE_FILE = path.join(DATA_DIR, "profile.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

const hits = new Map();
function rateLimit(max, windowMs) {
  return (req, res, next) => {
    const now = Date.now();
    const list = (hits.get(req.ip) || []).filter((t) => now - t < windowMs);
    if (list.length >= max) {
      return res.status(429).json({ error: "Too many requests, try again later." });
    }
    list.push(now);
    hits.set(req.ip, list);
    next();
  };
}

app.get("/api/profile", async (req, res) => {
  const { projects, ...profile } = await readJson(PROFILE_FILE, {});
  res.json(profile);
});

app.get("/api/projects", async (req, res) => {
  const { projects = [] } = await readJson(PROFILE_FILE, {});
  const { category } = req.query;
  res.json(category ? projects.filter((p) => p.category === category) : projects);
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post("/api/contact", rateLimit(5, 10 * 60 * 1000), async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim();
  const message = String(req.body.message || "").trim();

  const errors = {};
  if (name.length < 2) errors.name = "Name must be at least 2 characters.";
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email.";
  if (message.length < 10) errors.message = "Message must be at least 10 characters.";
  if (message.length > 2000) errors.message = "Message is too long.";
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const messages = await readJson(MESSAGES_FILE, []);
  messages.push({ id: Date.now(), name, email, message, createdAt: new Date().toISOString() });
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  res.status(201).json({ ok: true, message: "Thanks! Your message was sent." });
});

app.get("/api/messages", async (req, res) => {
  if (req.get("x-admin-key") !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(await readJson(MESSAGES_FILE, []));
});

app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => console.log(`Portfolio running on http://localhost:${PORT}`));

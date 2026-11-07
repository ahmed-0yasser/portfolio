const $ = (s) => document.querySelector(s);

function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (text) node.textContent = text;
  return node;
}

async function loadProfile() {
  const res = await fetch("/api/profile");
  const p = await res.json();
  document.title = `${p.name} | ${p.role}`;
  $("#name").textContent = p.name;
  $("#photo").alt = p.name;
  $("#role").textContent = p.role;
  $("#tagline").textContent = p.tagline;
  const about = $("#about-text");
  [].concat(p.about || []).forEach((para) => about.append(el("p", {}, para)));
  const facts = $("#facts");
  (p.facts || []).forEach((f) => {
    const box = el("div", { class: "card fact" });
    box.append(el("span", { class: "fact-label" }, f.label), el("strong", {}, f.value));
    facts.append(box);
  });
  $("#location").textContent = `Based in ${p.location} · ${p.email}`;
  $("#footer-name").textContent = p.name;

  const social = $("#social");
  Object.entries(p.social || {}).forEach(([name, url]) => {
    social.append(el("a", { href: url, target: "_blank", rel: "noopener" }, name[0].toUpperCase() + name.slice(1)));
  });
  if (p.cv) {
    const cv = $("#cv-btn");
    cv.href = p.cv;
    cv.hidden = false;
  }
  if (p.languages) $("#languages").textContent = `Languages: ${p.languages.join(" · ")}`;

  const timeline = $("#timeline");
  [...(p.experience || []), ...(p.education || [])].forEach((item) => {
    const card = el("div", { class: "card tl-item" });
    card.append(el("h4", {}, item.title), el("p", { class: "accent-text" }, item.org));
    const ul = el("ul");
    item.points.forEach((pt) => ul.append(el("li", {}, pt)));
    card.append(ul);
    timeline.append(card);
  });

  const grid = $("#skills-grid");
  p.skills.forEach((g) => {
    const card = el("div", { class: "card" });
    card.append(el("h4", {}, g.group));
    const tags = el("div", { class: "tags" });
    g.items.forEach((s) => tags.append(el("span", { class: "tag" }, s)));
    card.append(tags);
    grid.append(card);
  });
}

async function loadProjects(category = "") {
  const grid = $("#projects-grid");
  const res = await fetch(`/api/projects${category ? `?category=${category}` : ""}`);
  const projects = await res.json();
  grid.innerHTML = "";
  if (!projects.length) grid.append(el("p", { class: "muted" }, "No projects yet."));
  projects.forEach((p) => {
    const card = el("article", { class: "card project" });
    card.append(el("h4", {}, p.title), el("p", {}, p.description));
    if (p.features && p.features.length) {
      const ul = el("ul", { class: "features" });
      p.features.forEach((f) => ul.append(el("li", {}, f)));
      card.append(ul);
    }
    const tags = el("div", { class: "tags" });
    p.tags.forEach((t) => tags.append(el("span", { class: "tag" }, t)));
    const links = el("div", { class: "links" });
    if (p.live) links.append(el("a", { href: p.live, target: "_blank", rel: "noopener" }, "Live demo"));
    if (p.code) links.append(el("a", { href: p.code, target: "_blank", rel: "noopener" }, "Source code"));
    card.append(tags, links);
    grid.append(card);
  });
}

$("#filters").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  loadProjects(chip.dataset.cat);
});

$("#contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const status = $("#form-status");
  const btn = form.querySelector("button");
  form.querySelectorAll("[data-err]").forEach((s) => (s.textContent = ""));
  status.className = "status";
  status.textContent = "";
  btn.disabled = true;

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const data = await res.json();
    if (res.ok) {
      status.classList.add("ok");
      status.textContent = data.message;
      form.reset();
    } else if (data.errors) {
      Object.entries(data.errors).forEach(([k, v]) => (form.querySelector(`[data-err="${k}"]`).textContent = v));
    } else {
      status.classList.add("err");
      status.textContent = data.error || "Something went wrong.";
    }
  } catch {
    status.classList.add("err");
    status.textContent = "Network error, please try again.";
  } finally {
    btn.disabled = false;
  }
});

const root = document.documentElement;
function setTheme(t) {
  root.dataset.theme = t;
  $("#theme").innerHTML = t === "dark" ? "&#9728;" : "&#9790;";
  try { localStorage.setItem("theme", t); } catch {}
}
let saved = null;
try { saved = localStorage.getItem("theme"); } catch {}
setTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
$("#theme").addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));

$("#burger").addEventListener("click", () => $("#menu").classList.toggle("open"));
$("#menu").addEventListener("click", () => $("#menu").classList.remove("open"));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((en) => en.isIntersecting && en.target.classList.add("show"));
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((s) => observer.observe(s));

$("#year").textContent = new Date().getFullYear();
loadProfile();
loadProjects();

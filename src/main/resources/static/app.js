/**
 * Movie Match — Frontend (demonstration only)
 * This UI was NOT created by the project author.
 * It exists solely to show what the Spring Boot backend can do.
 *
 * Backend API (port 8081):
 *   GET /movie/search?description=...  → List<{ name, description, cosines }>
 *   GET /movie/{title}/similar         → List<{ name, description, cosines }>
 */

const API_BASE = "http://localhost:8081";

// Local catalog (same titles/descriptions as movies.json) so users can browse & click.
const MOVIES = [
  { name: "Interstellar", description: "A group of astronauts travel through a wormhole searching for a new home for humanity." },
  { name: "Gravity", description: "An astronaut stranded in space struggles to survive and return safely to Earth." },
  { name: "The Martian", description: "An astronaut stranded on Mars uses science and ingenuity to survive until rescue." },
  { name: "Titanic", description: "Two passengers from different social classes fall in love aboard a doomed ocean liner." },
  { name: "John Wick", description: "A retired assassin returns to the criminal underworld seeking revenge after a personal loss." },
  { name: "The Dark Knight", description: "A masked vigilante battles a criminal mastermind who spreads chaos throughout Gotham City." },
  { name: "Shutter Island", description: "A detective investigates the disappearance of a patient from an isolated psychiatric hospital and begins questioning reality." },
  { name: "Finding Nemo", description: "A cautious father crosses the ocean searching for his missing son." },
  { name: "The Pursuit of Happyness", description: "A struggling father faces poverty and homelessness while trying to build a better future for himself and his young son." },
  { name: "Toy Story", description: "A group of toys come alive and struggle with friendship, jealousy, identity and being replaced." },
  { name: "Inception", description: "A skilled thief enters people's dreams to steal secrets and is given a mission to plant an idea inside a target's mind." },
  { name: "The Shawshank Redemption", description: "A wrongly convicted banker forms a lasting friendship and searches for hope while serving a long prison sentence." },
  { name: "Forrest Gump", description: "A kind-hearted man experiences decades of American history while remaining devoted to the woman he has loved since childhood." },
  { name: "The Matrix", description: "A hacker discovers that reality is a simulated world and joins a rebellion against the machines controlling humanity." },
  { name: "Gladiator", description: "A betrayed Roman general becomes a gladiator and fights his way toward revenge against the emperor who destroyed his family." },
  { name: "Avengers: Endgame", description: "The surviving heroes reunite for a final mission to reverse a devastating loss and restore the people who disappeared." },
  { name: "Jurassic Park", description: "Scientists and visitors become trapped in a dinosaur theme park after its security systems fail." },
  { name: "The Godfather", description: "The reluctant son of a powerful crime family is drawn into the family's violent world and gradually takes control." },
  { name: "Fight Club", description: "A disillusioned office worker and a charismatic stranger create an underground fight club that grows into something dangerous." },
  { name: "La La Land", description: "An aspiring actress and a jazz musician fall in love while pursuing ambitious creative careers in Los Angeles." },
  { name: "3 Idiots", description: "Three engineering students navigate academic pressure, friendship and expectations while questioning a rigid education system." },
  { name: "Dangal", description: "A former wrestler trains his daughters to become competitive wrestlers while challenging social expectations in rural India." },
  { name: "Zindagi Na Milegi Dobara", description: "Three friends take a road trip across Spain that forces them to confront fear, relationships and how they want to live." },
  { name: "Taare Zameen Par", description: "A misunderstood child struggling with dyslexia finds confidence after a compassionate teacher recognizes his creativity." },
  { name: "Lagaan", description: "Villagers under colonial rule challenge British officers to a cricket match in hopes of escaping a crushing agricultural tax." },
  { name: "Dilwale Dulhania Le Jayenge", description: "Two young Indians living abroad fall in love, but family tradition and an arranged marriage stand between them." },
  { name: "Gully Boy", description: "A young man from a poor Mumbai neighborhood uses hip-hop and street rap to pursue a life beyond poverty and social limitations." },
  { name: "Queen", description: "After being abandoned before her wedding, a sheltered young woman travels alone on her planned honeymoon and discovers independence." },
  { name: "Bajrangi Bhaijaan", description: "A kind-hearted Indian man crosses borders and overcomes political obstacles to reunite a lost mute Pakistani girl with her family." },
  { name: "Andhadhun", description: "A pianist pretending to be blind becomes trapped in a dangerous web of murder, deception and unpredictable consequences." }
];

const $ = (sel) => document.querySelector(sel);

function escapeHTML(str = "") {
  return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
}

function formatCosine(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(1)}%  (${n.toFixed(4)})`;
}

let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}${body ? ": " + body.slice(0, 120) : ""}`);
  }
  return res.json();
}

/* ---------- Render helpers ---------- */

function renderMatchCards(container, list) {
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = `<div class="empty">No matches returned. Try a different description.</div>`;
    return;
  }

  const items = list.slice(0, 3);

  container.innerHTML = items
      .map((m, i) => {
        const title = m.name ?? m.title ?? "Untitled";
        const desc = m.description ?? "";
        const score = m.cosines ?? m.cosine ?? m.similarity;

        return `
        <article class="card">
          <div class="card-top">
            <span class="rank">MATCH ${String(i + 1).padStart(2, "0")}</span>
            <span class="score" title="Cosine similarity">${escapeHTML(formatCosine(score))}</span>
          </div>
          <h3>${escapeHTML(title)}</h3>
          <p>${escapeHTML(desc)}</p>
          <div class="card-actions">
            <button type="button" class="btn-similar" data-title="${escapeHTML(title)}">
              Find similar →
            </button>
          </div>
        </article>`;
      })
      .join("");
}

function renderCatalog(filter = "") {
  const q = filter.trim().toLowerCase();
  const filtered = MOVIES.filter(
      (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
  );

  $("#catalogCount").textContent = `${filtered.length} FILM${filtered.length === 1 ? "" : "S"}`;

  const grid = $("#catalogGrid");
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty">No movies match that filter.</div>`;
    return;
  }

  grid.innerHTML = filtered
      .map(
          (m) => `
      <button type="button" class="catalog-card" data-title="${escapeHTML(m.name)}">
        <h3>${escapeHTML(m.name)}</h3>
        <p>${escapeHTML(m.description)}</p>
      </button>`
      )
      .join("");
}

/* ---------- API actions ---------- */

async function searchByDescription(description) {
  const query = description.trim();
  if (!query) {
    toast("Enter a movie description first.");
    $("#descriptionInput").focus();
    return;
  }

  const btn = $("#searchBtn");
  const btnText = $("#searchBtnText");
  btn.disabled = true;
  btnText.textContent = "Searching…";

  const section = $("#searchSection");
  section.classList.remove("hidden");
  $("#searchResults").innerHTML = `<div class="empty">Computing embeddings & ranking by cosine similarity…</div>`;

  try {
    const results = await fetchJSON(
        `${API_BASE}/movie/search?description=${encodeURIComponent(query)}`
    );
    renderMatchCards($("#searchResults"), results);
    $("#searchBadge").textContent = `TOP ${Math.min(3, Array.isArray(results) ? results.length : 0)}`;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    $("#searchResults").innerHTML = `
      <div class="empty">
        Could not reach the backend. Make sure Spring Boot is running on port 8081.<br>
        <small style="color:#666">${escapeHTML(err.message)}</small>
      </div>`;
    toast("Search failed — is the backend running?");
    console.error(err);
  } finally {
    btn.disabled = false;
    btnText.textContent = "Search";
  }
}

async function showSimilar(title) {
  const section = $("#similarSection");
  section.classList.remove("hidden");
  $("#similarHeading").textContent = `Movies similar to “${title}”`;
  $("#similarResults").innerHTML = `<div class="empty">Comparing embeddings…</div>`;

  document.querySelectorAll(".catalog-card.selected").forEach((el) => el.classList.remove("selected"));
  const selected = [...document.querySelectorAll(".catalog-card")].find(
      (el) => el.dataset.title?.toLowerCase() === title.toLowerCase()
  );
  if (selected) selected.classList.add("selected");

  try {
    const results = await fetchJSON(
        `${API_BASE}/movie/${encodeURIComponent(title)}/similar`
    );
    renderMatchCards($("#similarResults"), results);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    $("#similarResults").innerHTML = `
      <div class="empty">
        Could not load similar movies.<br>
        <small style="color:#666">${escapeHTML(err.message)}</small>
      </div>`;
    toast("Similar movies request failed.");
    console.error(err);
  }
}

/* ---------- Backend health check ---------- */

async function checkBackend() {
  const dot = $("#statusDot");
  const text = $("#statusText");
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    await fetch(`${API_BASE}/movie/search?description=test`, {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    });
    clearTimeout(t);
    dot.classList.add("online");
    dot.classList.remove("offline");
    text.textContent = "Backend online";
  } catch {
    dot.classList.add("offline");
    dot.classList.remove("online");
    text.textContent = "Backend offline";
  }
}

/* ---------- Event wiring ---------- */

function init() {
  $("#searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    searchByDescription($("#descriptionInput").value);
  });

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const q = chip.dataset.q || chip.textContent;
      $("#descriptionInput").value = q;
      searchByDescription(q);
    });
  });

  $("#closeSimilar").addEventListener("click", () => {
    $("#similarSection").classList.add("hidden");
    document.querySelectorAll(".catalog-card.selected").forEach((el) => el.classList.remove("selected"));
  });

  $("#catalogFilter").addEventListener("input", (e) => {
    renderCatalog(e.target.value);
  });

  document.addEventListener("click", (e) => {
    const catalogCard = e.target.closest(".catalog-card");
    if (catalogCard?.dataset.title) {
      showSimilar(catalogCard.dataset.title);
      return;
    }

    const similarBtn = e.target.closest(".btn-similar");
    if (similarBtn?.dataset.title) {
      showSimilar(similarBtn.dataset.title);
    }
  });

  renderCatalog();
  checkBackend();
}

document.addEventListener("DOMContentLoaded", init);
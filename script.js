const content = document.getElementById("content");
const dateEl = document.getElementById("date");
dateEl.textContent = new Date().toLocaleDateString();

let trees = JSON.parse(localStorage.getItem("eco_trees")) || [];

// Save trees
function saveTrees() {
  localStorage.setItem("eco_trees", JSON.stringify(trees));
}

// --- Browser notifications ---
function notifyUser(message) {
  if (Notification.permission === "granted") {
    new Notification("EcoTrack 🌿", { body: message });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(p => {
      if (p === "granted") new Notification("EcoTrack 🌿", { body: message });
    });
  }
}

// --- Home screen ---
function showHome() {
  const total = trees.length;
  const needing = trees.filter(t => t.status === "Needs Water").length;
  const alive = trees.filter(t => t.status !== "Dried").length;
  const survival = total ? Math.round((alive / total) * 100) : 0;

  content.innerHTML = `
    <h2>Welcome to EcoTrack 🌿</h2>
    <p>Track and care for your planted trees.</p>

    <div class="card">
      <p><b>Total Trees:</b> ${total}</p>
      <p><b>Needs Water:</b> ${needing}</p>
      <p><b>Survival Rate:</b> ${survival}%</p>
    </div>

    <button onclick="showAdd()" class="add">➕ Add New Plantation</button>
    <button onclick="showTracker()">🌳 View Tracker</button>
    <button onclick="showAwareness()">💡 Awareness Zone</button>
  `;
}

// --- Add plantation ---
function showAdd() {
  content.innerHTML = `
    <h3>Add New Plantation</h3>
    <label>Tree Type:</label>
    <input id="type" placeholder="Neem, Mango..." style="width:100%;padding:8px;margin:6px 0;border:1px solid #cbd5c0;border-radius:6px;">
    <label>Location:</label>
    <input id="location" placeholder="Park, School..." style="width:100%;padding:8px;margin:6px 0;border:1px solid #cbd5c0;border-radius:6px;">
    <button onclick="saveTree()" class="add" style="margin-top:10px;">Save</button>
  `;
}

function saveTree() {
  const type = document.getElementById("type").value.trim();
  const location = document.getElementById("location").value.trim();
  if (!type || !location) return alert("దయచేసి అన్ని వివరాలు నమోదు చేయండి / Please fill all fields");

  const newTree = {
    id: Date.now(),
    type,
    location,
    date: new Date().toLocaleDateString(),
    status: "Good",
    lastUpdated: Date.now()
  };
  trees.unshift(newTree);
  saveTrees();
  showTracker();
}

// --- Tracker view ---
function showTracker() {
  if (trees.length === 0) {
    content.innerHTML = `<p>No trees added yet 🌱</p>`;
    return;
  }

  content.innerHTML = `<h3>Your Trees</h3>` + 
    trees.map(t => `
      <div class="card">
        <h4>${t.type}</h4>
        <p>${t.location} • ${t.date}</p>
        <p>Status: <b>${t.status}</b></p>
        <div>
          <button class="good" onclick="updateStatus(${t.id}, 'Good')">Good</button>
          <button class="water" onclick="updateStatus(${t.id}, 'Needs Water')">Needs Water</button>
          <button class="dried" onclick="updateStatus(${t.id}, 'Dried')">Dried</button>
        </div>
      </div>
    `).join("");
}

function updateStatus(id, status) {
  trees = trees.map(t => t.id === id ? { ...t, status, lastUpdated: Date.now() } : t);
  saveTrees();
  showTracker();
}

// --- Awareness (Telugu + English) ---
function showAwareness() {
  content.innerHTML = `
    <h3>🌱 పర్యావరణ చైతన్యం / Awareness Zone</h3>
    <p>💧 <b>నీటి సూచన:</b> వేడి కాలంలో ప్రతి 2–3 రోజులకు మొక్కలకు నీరు ఇవ్వండి.<br>
       <b>Water Tip:</b> Water saplings every 2–3 days during hot months.</p>

    <p>🌾 <b>ఎరువు:</b> మట్టిని ఆరోగ్యంగా ఉంచడానికి సేంద్రీయ ఎరువు వాడండి.<br>
       <b>Compost:</b> Use compost to keep soil healthy.</p>

    <p>🪵 <b>రక్షణ:</b> జంతువుల నుండి రక్షణ కోసం సులభమైన కంచెలు వాడండి.<br>
       <b>Protection:</b> Protect saplings from grazing animals with small fences.</p>

    <button onclick="showHome()" class="add">🏠 హోమ్‌కి వెళ్ళండి / Back Home</button>
  `;
}

// --- Auto water alert check ---
function checkForWaterAlerts() {
  const now = Date.now();
  let alertNeeded = false;

  trees = trees.map(t => {
    const days = (now - t.lastUpdated) / (1000 * 60 * 60 * 24);
    if (days > 3 && t.status === "Good") {
      alertNeeded = true;
      return { ...t, status: "Needs Water" };
    }
    return t;
  });

  saveTrees();

  if (alertNeeded) {
    notifyUser("🚰 కొన్ని మొక్కలకు నీరు అవసరం ఉంది! / Some plants need water!");
  }
}

// --- Navigation ---
document.getElementById("homeBtn").onclick = showHome;
document.getElementById("trackerBtn").onclick = showTracker;
document.getElementById("addBtn").onclick = showAdd;
document.getElementById("awarenessBtn").onclick = showAwareness;

// --- Start app ---
checkForWaterAlerts();
showHome();
const metrics = [
  {key:"waterTemp", label:"Water Temp", value:"16.4", unit:"°C", tone:"yellow", icon:"♨", points:[20,21,20,22,22,21,14,14,20,20,19]},
  {key:"airTemp", label:"Air Temp", value:"16.2", unit:"°C", tone:"green", icon:"♨", points:[20,19,20,19,18,17,16,15,14,13,14]},
  {key:"humidity", label:"Humidity", value:"31.0", unit:"%", tone:"red", icon:"♨", points:[32,30,31,29,34,31,36,38,31,27,31]},
  {key:"waterLevel", label:"Water Level", value:"0.0", unit:"%", tone:"red", icon:"♨", points:[20,20,20,20,20,20,20,20,20,18,3]},
  {key:"ec", label:"Water EC", value:"0.0", unit:"mS/cm", tone:"red", icon:"⚗", points:[2,2,2,2,2,2,2,2,2,2,2]},
  {key:"ph", label:"Water pH", value:"—", unit:"pH", tone:"gray", icon:"⚗", points:[10,10,10,10,10,10,10,10,10,10,10]},
  {key:"battery", label:"Battery", value:"11.6", unit:"V", tone:"red", icon:"▣", points:[4,4,3,4,3,4,3,3,12,12,12]},
  {key:"pressure", label:"Pressure", value:"1003.4", unit:"hPa", tone:"green", icon:"◴", points:[5,6,5,7,6,7,6,8,7,10,8]}
];

const state = { pump:false, valve:true, mode:"Manual", runDuration:10, schedule:"Every 6 hours" };
const content = document.getElementById("content");

function spark(points, cls=""){
  const max=Math.max(...points), min=Math.min(...points), range=max-min||1;
  const pts=points.map((p,i)=>`${(i/(points.length-1))*100},${32-((p-min)/range)*28}`).join(" ");
  return `<div class="spark ${cls}"><svg viewBox="0 0 100 35" preserveAspectRatio="none"><polyline points="${pts}"/></svg></div>`;
}
function metricCard(m){
  return `<article class="metric-card ${m.tone}">
    <div class="metric-top"><div class="metric-icon">${m.icon}</div><div class="metric-dot"></div></div>
    <div class="metric-value">${m.value} <small>${m.unit}</small></div>
    <div class="metric-label">${m.label}</div>
    ${spark(m.points)}
  </article>`;
}
function pageHead(title, sub){ return `<div class="page-head"><h1>${title}</h1><p>${sub}</p></div>`; }

function dashboard(){
  return pageHead("System Overview","Real-time telemetry from your hydroponic system") +
    `<div class="cards">${metrics.map(metricCard).join("")}</div>
     <div class="panel-grid">
       <section class="panel"><h2>System Activity</h2>${bigChart()}</section>
       <section class="panel"><h2>Quick Status</h2>
         <div class="device-list">
           <div class="list-row"><span>●</span> HydroNode_01 <span class="badge bad">OFFLINE</span></div>
           <div class="list-row"><span>⚗</span> Water pH <strong>—</strong></div>
           <div class="list-row"><span>♨</span> Water Temperature <strong>16.4 °C</strong></div>
           <div class="list-row"><span>◴</span> Pressure <strong>1003.4 hPa</strong></div>
         </div>
       </section>
     </div>`;
}
function bigChart(){
  return `<div class="chart"><svg viewBox="0 0 700 230" preserveAspectRatio="none">
    ${[35,80,125,170,215].map(y=>`<line class="gridline" x1="0" y1="${y}" x2="700" y2="${y}"/>`).join("")}
    <polyline class="line" points="0,160 55,145 110,150 165,128 220,140 275,100 330,115 385,92 440,108 495,72 550,92 605,70 650,80 700,55"/>
  </svg></div><div class="chart-labels"><span>08:00</span><span>08:30</span><span>09:00</span><span>09:30</span><span>10:00</span></div>`;
}

function devices(){
 return pageHead("Devices","Manage connected HydroNode devices") +
 `<div class="toolbar"><input id="deviceSearch" placeholder="⌕  Search devices"><button class="btn" onclick="toast('Device scan started')">＋ Add Device</button></div>
  <section class="panel"><div class="device-list">
   <div class="list-row"><span class="metric-icon green">▣</span><div><strong>HydroNode_01</strong><div class="device-meta">Firmware: 1.0.1 · Last seen: 0d 1h 38m</div></div><span class="badge bad">OFFLINE</span><strong>›</strong></div>
   <div class="list-row"><span class="metric-icon green">▣</span><div><strong>HydroNode_02</strong><div class="device-meta">Firmware: 1.0.0 · Last seen: just now</div></div><span class="badge ok">ONLINE</span><strong>›</strong></div>
  </div></section>`;
}
function controls(){
 return pageHead("Water Controls","Operate pumps and valves for your hydroponic system") +
 `<div class="control-grid">
  <section class="control-card"><h3>💧 Water Pump</h3>
   <div class="control-line"><span>Status</span><span id="pumpStatus">${state.pump?"ON":"OFF"} <button class="switch ${state.pump?"on":""}" onclick="togglePump()"></button></span></div>
   <div class="control-line"><span>Mode</span><select class="field" onchange="state.mode=this.value"><option ${state.mode==="Manual"?"selected":""}>Manual</option><option>Auto</option></select></div>
   <div class="control-line"><span>Run Duration</span><span><input class="field" type="number" min="1" max="60" value="${state.runDuration}" onchange="state.runDuration=this.value"> min</span></div>
   <button class="btn" onclick="runPump()">▷ Run Pump</button>
  </section>
  <section class="control-card"><h3>♧ Water Valve</h3>
   <div class="control-line"><span>Status</span><span id="valveStatus">${state.valve?"OPEN":"CLOSED"} <button class="switch ${state.valve?"on":""}" onclick="toggleValve()"></button></span></div>
   <div class="control-line"><span>Mode</span><select class="field"><option>Auto</option><option>Manual</option></select></div>
   <div class="control-line"><span>Schedule</span><select class="field"><option>Every 6 hours</option><option>Every 4 hours</option><option>Every 12 hours</option></select></div>
  </section>
 </div>`;
}
function environment(){
 const env=[
  ["Water Temp (°C)","16.4","yellow",[12,14,13,16,15,18,17,15,14,16]],
  ["Air Temp (°C)","16.2","green",[14,15,14,17,18,16,17,15,13,14]],
  ["Humidity (%)","31.0","red",[35,31,30,34,29,41,37,31,26,31]]
 ];
 return pageHead("Environment","Live environmental telemetry and trends")+
 `<div class="toolbar"><button class="btn">Live</button><button class="btn secondary">1H</button><button class="btn secondary">6H</button><button class="btn secondary">1D</button><button class="btn secondary">7D</button></div>
 <div class="env-grid">${env.map(e=>`<section class="env-card" style="color:var(--${e[2]})"><h3>${e[0]}</h3><div class="env-value">${e[1]} <small>${e[0].includes("Humidity")?"%":"°C"}</small></div><div class="mini-chart">${spark(e[3])}</div></section>`).join("")}</div>`;
}
function history(){
 const rows=metrics.map(m=>`<tr><td>${m.label}</td><td><strong>${m.value} ${m.unit}</strong></td><td>10:00 AM</td><td>Normal</td></tr>`).join("");
 return pageHead("History","Review historical sensor readings")+
 `<div class="toolbar"><input type="date" value="2025-05-20"><button class="btn secondary">▣ Filter</button><button class="btn" onclick="exportCSV()">⇩ Export CSV</button></div>
 <section class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>Sensor</th><th>Reading</th><th>Time</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
}
function configuration(){
 return pageHead("Configuration","Device settings, alerts and measurement units")+
 `<div class="settings-grid">
  <section class="setting"><h3>Device</h3><div class="control-line">Device Name <strong>HydroNode_01</strong></div><div class="control-line">Device ID <strong>HN-0001</strong></div><div class="control-line">Firmware Version <strong>1.0.1</strong></div><div class="control-line">Uptime <strong>0d 1h 38m</strong></div></section>
  <section class="setting"><h3>Alerts</h3>${["Low Water Level","High Temperature","Low Battery"].map(x=>`<div class="control-line">${x}<button class="switch on"></button></div>`).join("")}</section>
  <section class="setting"><h3>Units</h3><div class="control-line">Temperature <select class="field"><option>°C</option><option>°F</option></select></div><div class="control-line">Pressure <select class="field"><option>hPa</option><option>kPa</option></select></div></section>
  <section class="setting"><h3>Maintenance</h3><p>Keep your controller updated and export a backup before major changes.</p><button class="btn secondary" onclick="toast('Backup exported')">Export Backup</button> <button class="btn" onclick="toast('Configuration saved')">Save</button></section>
 </div>`;
}
function simplePage(title,sub,body){ return pageHead(title,sub)+`<section class="panel">${body}</section>`; }

const pages={
 dashboard,devices,controls,environment,history,configuration,
 calibration:()=>simplePage("Calibration","Calibrate your sensors for accurate readings",`<h2>Sensor Calibration</h2><p>Choose a sensor and follow the calibration steps.</p><div class="toolbar"><select class="field"><option>Water pH</option><option>Water EC</option><option>Water Temperature</option></select><button class="btn" onclick="toast('Calibration started')">Start Calibration</button></div>`),
 ota:()=>simplePage("OTA Update","Update HydroNode firmware over the network",`<h2>Firmware 1.0.1</h2><p>Your device is ready to check for a newer firmware version.</p><button class="btn" onclick="toast('Checking for updates...')">Check for Updates</button>`)
};

function render(page="dashboard"){
 content.innerHTML=pages[page]();
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
 document.title=`HydroOne · ${page[0].toUpperCase()+page.slice(1)}`;
}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>{render(b.dataset.page);document.getElementById("sidebar").classList.remove("open")}));
document.getElementById("menuBtn").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));

// Front-end demo authentication. For production, use a secure backend and hashed passwords.
const authScreen = document.getElementById("authScreen");
const dashboardApp = document.getElementById("dashboardApp");
const authForm = document.getElementById("authForm");
const authHeading = document.getElementById("authHeading");
const authDescription = document.getElementById("authDescription");
const authSubmit = document.getElementById("authSubmit");
const authToggleText = document.getElementById("authToggleText");
const authError = document.getElementById("authError");
const nameField = document.getElementById("nameField");
const confirmField = document.getElementById("confirmField");
const registerName = document.getElementById("registerName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const confirmPassword = document.getElementById("confirmPassword");
let authMode = "login";

function readAccounts() {
  try { return JSON.parse(localStorage.getItem("hydroponicsAccounts") || "[]"); }
  catch (error) { return []; }
}
function showAuthError(message, success=false) {
  authError.textContent = message;
  authError.classList.toggle("success", success);
}
function setAuthMode(mode) {
  authMode = mode;
  const registering = mode === "register";
  authHeading.textContent = registering ? "Create your account" : "Welcome back";
  authDescription.textContent = registering
    ? "Register to access your hydroponics dashboard."
    : "Sign in to continue to your dashboard.";
  authSubmit.textContent = registering ? "Create account" : "Sign in";
  nameField.classList.toggle("hidden", !registering);
  confirmField.classList.toggle("hidden", !registering);
  registerName.required = registering;
  confirmPassword.required = registering;
  authPassword.autocomplete = registering ? "new-password" : "current-password";
  authToggleText.innerHTML = registering
    ? 'Already have an account? <button type="button" id="authToggle">Sign in</button>'
    : 'Don\'t have an account? <button type="button" id="authToggle">Register</button>';
  document.getElementById("authToggle").addEventListener("click", () => {
    setAuthMode(authMode === "login" ? "register" : "login");
  });
  showAuthError("");
}
document.getElementById("authToggle").addEventListener("click", () => setAuthMode("register"));

authForm.addEventListener("submit", event => {
  event.preventDefault();
  const email = authEmail.value.trim().toLowerCase();
  const password = authPassword.value;
  const accounts = readAccounts();

  if (authMode === "register") {
    const name = registerName.value.trim();
    if (!name) return showAuthError("Please enter your name.");
    if (password.length < 6) return showAuthError("Password must be at least 6 characters.");
    if (password !== confirmPassword.value) return showAuthError("Passwords do not match.");
    if (accounts.some(account => account.email === email)) return showAuthError("This email is already registered.");
    // Plain-text storage is only suitable for a local demo. Never use this for real credentials.
    accounts.push({ name, email, password });
    localStorage.setItem("hydroponicsAccounts", JSON.stringify(accounts));
    setAuthMode("login");
    authEmail.value = email;
    authPassword.value = "";
    showAuthError("Account created! Sign in with your new account.", true);
    return;
  }

  const account = accounts.find(item => item.email === email && item.password === password);
  if (!account) return showAuthError("Email or password is incorrect.");
  authScreen.classList.add("hidden");
  dashboardApp.classList.remove("hidden");
  showAuthError("");
  render("dashboard");
  toast("Welcome, " + account.name + "!");
});

document.getElementById("logout").addEventListener("click", () => {
  dashboardApp.classList.add("hidden");
  authScreen.classList.remove("hidden");
  authForm.reset();
  setAuthMode("login");
  showAuthError("You have been logged out.", true);
});

document.getElementById("deviceSelect").addEventListener("change",e=>toast(`${e.target.value} selected`));

function togglePump(){state.pump=!state.pump;render("controls");toast(`Water pump ${state.pump?"ON":"OFF"}`)}
function toggleValve(){state.valve=!state.valve;render("controls");toast(`Water valve ${state.valve?"OPEN":"CLOSED"}`)}
function runPump(){toast(`Pump running for ${state.runDuration} minute(s)`);state.pump=true;render("controls")}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200)}
function exportCSV(){
 const csv=["Sensor,Value,Unit,Time",...metrics.map(m=>`${m.label},${m.value},${m.unit},10:00 AM`)].join("\n");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="hydroone-history.csv";a.click();URL.revokeObjectURL(a.href);
 toast("CSV exported");
}
render();

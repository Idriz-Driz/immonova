// ===== IMMONOVA SHARED.JS =====
// Gemeinsame Daten & Hilfsfunktionen für alle Seiten

// AUTH CHECK
function checkAuth() {
  var role = localStorage.getItem('in_role');
  if (!role) { window.location.href = 'login.html'; return false; }
  return true;
}

// USER INFO
function getUser() {
  return {
    uid: localStorage.getItem('in_user_uid') || 'admin',
    name: localStorage.getItem('in_user_name') || 'Admin',
    plan: localStorage.getItem('in_user_plan') || 'starter',
    email: localStorage.getItem('in_user_email') || 'admin@immonova.de',
    role: localStorage.getItem('in_role') || 'admin'
  };
}

// DATA HELPERS
function getData(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch(e) { return fallback; }
}

function setData(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// SHARED DATA KEYS
var KEYS = {
  mieter: 'in_m',
  tickets: 'in_t',
  handwerker: 'in_hw',
  projekte: 'in_proj',
  termine: 'in_ter',
  kontakte: 'in_kon',
  aufgaben: 'in_auf',
  zaehler: 'in_zae',
  objekte: 'in_obj',
  versicherungen: 'in_vs',
  followups: 'in_fu',
  interessenten: 'in_int',
  mitteilungen: 'in_mit',
  reinigungen: 'in_rei',
  notifs: 'in_notifs'
};

// DEFAULT MIETER DATA
var DEFAULT_MIETER = [
  {name:"Max Mustermann",wn:"1 OG",miete:950,tel:"4915733665661",status:"bezahlt",sco:98,dat:"2023-01-01",em:"max@mail.de",kau:2850},
  {name:"Anna Schmidt",wn:"2 OG",miete:780,tel:"4915733665662",status:"offen",sco:72,dat:"2022-06-01",em:"anna@mail.de",kau:2340},
  {name:"Idriz Osmanaj",wn:"EG",miete:1100,tel:"4915733665663",status:"bezahlt",sco:95,dat:"2021-03-01",em:"idriz@mail.de",kau:3300},
  {name:"Idriz Osmanaj",wn:"10 OG",miete:850,tel:"4915733665664",status:"offen",sco:65,dat:"2023-08-01",em:"",kau:2550},
  {name:"Idriz Osmanaj",wn:"7 OG",miete:920,tel:"4915733665665",status:"bezahlt",sco:88,dat:"2022-11-01",em:"",kau:2760}
];

// FORMAT HELPERS
function fmt(n) { return (n||0).toLocaleString('de-DE'); }
function fmtDate(d) { if(!d) return '–'; try { return new Date(d).toLocaleDateString('de-DE'); } catch(e) { return d; } }
function today() { return new Date().toISOString().split('T')[0]; }

// NOTIFICATION
function addNotif(ico, txt) {
  var notifs = getData(KEYS.notifs, []);
  notifs.unshift({ico:ico, txt:txt, time:new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}), unread:true});
  if(notifs.length > 30) notifs.pop();
  setData(KEYS.notifs, notifs);
}

// LOGOUT
function doLogout() {
  if(confirm('Möchtest du dich wirklich abmelden?')) {
    if(typeof firebase !== 'undefined') {
      firebase.auth().signOut().catch(function(){});
    }
    localStorage.clear();
    window.location.href = 'login.html';
  }
}

// FIREBASE SYNC
var firebaseConfig = {
  apiKey: "AIzaSyA3DfAclMBygqai_k-_z4HmZyGgB9j6IqM",
  authDomain: "immonova-2e0f2.firebaseapp.com",
  projectId: "immonova-2e0f2",
  storageBucket: "immonova-2e0f2.firebasestorage.app",
  messagingSenderId: "639601807117",
  appId: "1:639601807117:web:45d09a1a9f44df3a916a44"
};

function initFirebase() {
  if(typeof firebase === 'undefined') return;
  if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);
}

function syncToFirebase(uid) {
  if(!uid || uid === 'admin') return;
  if(typeof firebase === 'undefined') return;
  var db = firebase.firestore();
  var data = {};
  Object.keys(KEYS).forEach(function(k) {
    data[k] = getData(KEYS[k], []);
  });
  db.collection('data').doc(uid).set(data).catch(function(){});
}

function loadFromFirebase(uid, callback) {
  if(!uid || uid === 'admin') { if(callback) callback(); return; }
  if(typeof firebase === 'undefined') { if(callback) callback(); return; }
  var db = firebase.firestore();
  db.collection('data').doc(uid).get().then(function(snap) {
    if(snap.exists) {
      var d = snap.data();
      Object.keys(KEYS).forEach(function(k) {
        if(d[k] && (Array.isArray(d[k]) ? d[k].length > 0 : true)) {
          setData(KEYS[k], d[k]);
        }
      });
    }
    if(callback) callback();
  }).catch(function() { if(callback) callback(); });
}

// SIDEBAR HTML generator
function getSidebarHTML(activePage) {
  var user = getUser();
  var mieter = getData(KEYS.mieter, DEFAULT_MIETER);
  var tickets = getData(KEYS.tickets, []);
  var aufgaben = getData(KEYS.aufgaben, []);
  var followups = getData(KEYS.followups, []);
  var projekte = getData(KEYS.projekte, []);
  var heute = today();

  var offeneMiete = mieter.filter(function(m){return m.status==='offen';}).length;
  var offeneTickets = tickets.filter(function(t){return t.status==='Offen';}).length;
  var offeneAufgaben = aufgaben.filter(function(a){return !a.done;}).length;
  var fuHeute = followups.filter(function(f){return !f.done && f.dat===heute;}).length;
  var aktiveProjekte = projekte.filter(function(p){return p.status==='In Bearbeitung';}).length;

  function navItem(href, ico, label, badge, badgeColor, isActive) {
    var badgeHtml = badge > 0 ? '<span style="background:'+(badgeColor||'#dc2626')+';color:white;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px;margin-left:auto;">'+badge+'</span>' : '';
    return '<a href="'+href+'" style="display:flex;align-items:center;gap:9px;padding:9px 16px;color:'+(isActive?'#60a5fa':'#94a3b8')+';text-decoration:none;font-size:13px;font-weight:500;background:'+(isActive?'rgba(37,99,235,0.15)':'none')+';transition:all 0.15s;" onmouseover="this.style.background=\'#1e293b\';this.style.color=\'white\';" onmouseout="this.style.background=\''+(isActive?'rgba(37,99,235,0.15)':'none')+'\';this.style.color=\''+(isActive?'#60a5fa':'#94a3b8')+'\';">'
      +'<span style="font-size:15px;width:20px;text-align:center;">'+ico+'</span>'
      +'<span style="flex:1;">'+label+'</span>'
      +badgeHtml
      +'</a>';
  }

  return '<div style="width:240px;background:#0f172a;display:flex;flex-direction:column;height:100vh;overflow-y:auto;flex-shrink:0;">'
    // Logo
    +'<a href="app.html" style="padding:18px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #1e293b;text-decoration:none;">'
    +'<div style="width:34px;height:34px;background:#2563eb;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🏢</div>'
    +'<div style="font-size:16px;font-weight:700;color:white;">Immo<span style="color:#60a5fa;">Nova</span></div>'
    +'</a>'
    // Search
    +'<div style="padding:10px 12px 6px;">'
    +'<input type="text" placeholder="🔍 Suchen..." oninput="doSearch(this.value)" style="width:100%;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:7px 10px;color:white;font-size:12px;font-family:inherit;outline:none;">'
    +'</div>'
    // Nav
    +'<nav style="flex:1;padding:8px 0;">'
    +'<div style="padding:10px 16px 4px;font-size:10px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:0.8px;">Hauptmenü</div>'
    +navItem('app.html','🏠','Dashboard',0,'',activePage==='dashboard')
    +navItem('objekte.html','🏢','Objekte & Gebäude',0,'',activePage==='objekte')
    +navItem('projekte.html','🏗️','Projekte & Baustellen',aktiveProjekte,'#2563eb',activePage==='projekte')
    +navItem('mieter.html','👥','Mieter',offeneMiete,'#dc2626',activePage==='mieter')
    +navItem('tickets.html','🎫','Tickets & Schäden',offeneTickets,'#dc2626',activePage==='tickets')
    +navItem('handwerker.html','🔧','Handwerker',0,'',activePage==='handwerker')
    +navItem('nachrichten.html','💬','Nachrichten',0,'#2563eb',activePage==='nachrichten')
    +navItem('zahlungen.html','💳','Zahlungen & Bank',0,'',activePage==='zahlungen')
    +'<div style="padding:10px 16px 4px;font-size:10px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:0.8px;margin-top:6px;">CRM & Vermietung</div>'
    +navItem('crm.html','🎯','Follow-Up CRM',fuHeute,'#dc2626',activePage==='crm')
    +navItem('interessenten.html','🔍','Interessenten',0,'',activePage==='interessenten')
    +navItem('mitteilungen.html','📢','Haus-Mitteilungen',0,'',activePage==='mitteilungen')
    +'<div style="padding:10px 16px 4px;font-size:10px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:0.8px;margin-top:6px;">Verwaltung</div>'
    +navItem('kalender.html','📅','Terminkalender',0,'#16a34a',activePage==='kalender')
    +navItem('kontakte.html','📇','Kontakte',0,'',activePage==='kontakte')
    +navItem('aufgaben.html','✅','Aufgaben',offeneAufgaben,'#dc2626',activePage==='aufgaben')
    +navItem('reinigung.html','🧹','Reinigungsplan',0,'',activePage==='reinigung')
    +navItem('zaehler.html','🔢','Zählerstände',0,'',activePage==='zaehler')
    +navItem('dokumente.html','📄','Dokumente & Vorlagen',0,'',activePage==='dokumente')
    +navItem('versicherungen.html','🛡️','Versicherungen',0,'',activePage==='versicherungen')
    +navItem('berichte.html','📊','Berichte & Analyse',0,'',activePage==='berichte')
    +'<div style="padding:10px 16px 4px;font-size:10px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:0.8px;margin-top:6px;">System</div>'
    +navItem('einstellungen.html','⚙️','Einstellungen',0,'',activePage==='einstellungen')
    +'</nav>'
    // User footer
    +'<div style="padding:12px;border-top:1px solid #1e293b;">'
    +'<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#1e293b;border-radius:10px;">'
    +'<div style="width:32px;height:32px;background:#2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;flex-shrink:0;">'+user.name[0].toUpperCase()+'</div>'
    +'<div style="flex:1;min-width:0;">'
    +'<div style="font-size:12px;font-weight:600;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+user.name+'</div>'
    +'<div style="font-size:10px;color:#64748b;">'+user.plan.charAt(0).toUpperCase()+user.plan.slice(1)+' Plan</div>'
    +'</div>'
    +'<button onclick="doLogout()" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:16px;padding:2px;" title="Abmelden">🚪</button>'
    +'</div></div>'
    +'</div>';
}

// TOPBAR HTML generator
function getTopbarHTML(title, actionBtn) {
  return '<div style="background:white;border-bottom:1px solid #e2e8f0;padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;box-shadow:0 1px 3px rgba(0,0,0,0.06);">'
    +'<div style="font-size:16px;font-weight:700;color:#0f172a;">'+title+'</div>'
    +'<div style="display:flex;align-items:center;gap:10px;">'
    +(actionBtn||'')
    +'<button onclick="toggleNotifPanel()" style="width:36px;height:36px;border-radius:9px;border:1px solid #e2e8f0;background:white;cursor:pointer;font-size:16px;position:relative;" id="notif-btn">🔔<div id="notif-dot" style="display:none;position:absolute;top:6px;right:6px;width:8px;height:8px;background:#dc2626;border-radius:50%;border:2px solid white;"></div></button>'
    +'</div></div>';
}

// CARD helper
function card(content, style) {
  return '<div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);'+(style||'')+'">'+content+'</div>';
}

// BADGE helper
function badge(txt, color) {
  var colors = {
    green: 'background:#f0fdf4;color:#16a34a;',
    red: 'background:#fef2f2;color:#dc2626;',
    yellow: 'background:#fffbeb;color:#d97706;',
    blue: 'background:#eff6ff;color:#2563eb;',
    gray: 'background:#f1f5f9;color:#64748b;'
  };
  return '<span style="display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;'+(colors[color]||colors.gray)+'">'+txt+'</span>';
}

// MODAL helpers
function showModal(id) { var m=document.getElementById(id); if(m) m.style.display='flex'; }
function hideModal(id) { var m=document.getElementById(id); if(m) m.style.display='none'; }

function modalHTML(id, title, content) {
  return '<div id="'+id+'" onclick="if(event.target===this)this.style.display=\'none\'" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;z-index:1000;padding:20px;backdrop-filter:blur(4px);">'
    +'<div style="background:white;border-radius:16px;padding:28px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">'
    +'<div style="font-size:16px;font-weight:700;">'+title+'</div>'
    +'<button onclick="hideModal(\''+id+'\')" style="background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;">✕</button>'
    +'</div>'
    +content
    +'</div></div>';
}

// FORM INPUT helpers
function formGroup(label, inputHtml) {
  return '<div style="margin-bottom:14px;"><label style="display:block;font-size:11px;font-weight:700;color:#64748b;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.4px;">'+label+'</label>'+inputHtml+'</div>';
}

var inputStyle = 'style="width:100%;padding:10px 13px;border:1.5px solid #e2e8f0;border-radius:9px;font-size:14px;font-family:inherit;color:#0f172a;background:white;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor=\'#2563eb\'" onblur="this.style.borderColor=\'#e2e8f0\'"';

// NOTIF PANEL
function getNotifPanelHTML() {
  return '<div id="notif-panel" style="display:none;position:fixed;top:56px;right:0;width:320px;background:white;border-left:1px solid #e2e8f0;height:calc(100vh - 56px);flex-direction:column;z-index:100;box-shadow:-4px 0 20px rgba(0,0,0,0.08);">'
    +'<div style="padding:16px 20px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;">'
    +'<div style="font-size:14px;font-weight:700;">🔔 Benachrichtigungen</div>'
    +'<button onclick="clearAllNotifs()" style="background:none;border:1px solid #e2e8f0;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;">Alle gelesen</button>'
    +'</div>'
    +'<div id="notif-list" style="overflow-y:auto;flex:1;"></div>'
    +'</div>';
}

function toggleNotifPanel() {
  var p = document.getElementById('notif-panel');
  if(!p) return;
  var isOpen = p.style.display === 'flex';
  p.style.display = isOpen ? 'none' : 'flex';
  if(!isOpen) renderNotifList();
}

function renderNotifList() {
  var list = document.getElementById('notif-list');
  if(!list) return;
  var notifs = getData(KEYS.notifs, []);
  var dot = document.getElementById('notif-dot');
  if(dot) dot.style.display = notifs.some(function(n){return n.unread;}) ? 'block' : 'none';
  list.innerHTML = notifs.length ? notifs.slice(0,20).map(function(n,i){
    return '<div onclick="markNotif('+i+')" style="padding:14px 20px;border-bottom:1px solid #f8fafc;cursor:pointer;background:'+(n.unread?'#eff6ff':'white')+';display:flex;gap:12px;align-items:flex-start;">'
      +'<div style="font-size:20px;">'+n.ico+'</div>'
      +'<div><div style="font-size:13px;font-weight:500;margin-bottom:2px;">'+n.txt+'</div>'
      +'<div style="font-size:11px;color:#94a3b8;">'+n.time+'</div></div></div>';
  }).join('') : '<div style="padding:20px;text-align:center;color:#94a3b8;font-size:13px;">Keine Benachrichtigungen</div>';
}

function markNotif(i) {
  var notifs = getData(KEYS.notifs, []);
  if(notifs[i]) { notifs[i].unread = false; setData(KEYS.notifs, notifs); renderNotifList(); }
}

function clearAllNotifs() {
  var notifs = getData(KEYS.notifs, []);
  notifs.forEach(function(n){n.unread=false;});
  setData(KEYS.notifs, notifs);
  renderNotifList();
}

function doSearch(q) {
  if(!q || q.length < 2) return;
  var mieter = getData(KEYS.mieter, []);
  var results = mieter.filter(function(m){return m.name.toLowerCase().includes(q.toLowerCase());});
  if(results.length > 0) window.location.href = 'mieter.html';
}

// PAGE LAYOUT helper
function renderLayout(activePage, title, actionBtn, mainContent, modals) {
  document.body.innerHTML =
    '<div style="display:flex;height:100vh;overflow:hidden;font-family:\'DM Sans\',sans-serif;font-size:14px;color:#0f172a;background:#f8fafc;">'
    + getSidebarHTML(activePage)
    + '<div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">'
    + getTopbarHTML(title, actionBtn)
    + getNotifPanelHTML()
    + '<div style="flex:1;overflow-y:auto;padding:24px;" id="main-content">'
    + mainContent
    + '</div>'
    + '</div>'
    + '</div>'
    + (modals||'');
  renderNotifList();
}

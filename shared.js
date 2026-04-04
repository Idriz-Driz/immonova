// ═══════════════════════════════════════════════════════════════
// IMMONOVA SHARED.JS v3.0 – Enterprise Edition
// Foundation for all pages – DO NOT load as module
// ═══════════════════════════════════════════════════════════════

// ─── FIREBASE CONFIG ──────────────────────────────────────────
var firebaseConfig = {
  apiKey: "AIzaSyA3DfAclMBygqai_k-_z4HmZyGgB9j6IqM",
  authDomain: "immonova-2e0f2.firebaseapp.com",
  projectId: "immonova-2e0f2",
  storageBucket: "immonova-2e0f2.firebasestorage.app",
  messagingSenderId: "639601807117",
  appId: "1:639601807117:web:45d09a1a9f44df3a916a44"
};

function initFirebase() {
  if (typeof firebase === 'undefined') return;
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
}

// ─── DATA KEYS ────────────────────────────────────────────────
var KEYS = {
  mieter:        'in_m',
  tickets:       'in_t',
  handwerker:    'in_hw',
  projekte:      'in_proj',
  termine:       'in_ter',
  kontakte:      'in_kon',
  aufgaben:      'in_auf',
  zaehler:       'in_zae',
  objekte:       'in_obj',
  versicherungen:'in_vs',
  followups:     'in_fu',
  interessenten: 'in_int',
  mitteilungen:  'in_mit',
  reinigungen:   'in_rei',
  zahlungen:     'in_zahlungen',
  messages:      'in_messages',
  notifs:        'in_notifs',
  dokumente:     'in_dok'
};

// ─── DEMO DATA ────────────────────────────────────────────────
var DEFAULT_MIETER = [];

var DEMO_DATA = {
  mieter: [{ id:'demo-m1', name:'Max Mustermann', wn:'Musterstraße 5, 1 OG', miete:'950', nk:'120', kaution:'2850', beginn:'2023-01-01', status:'aktiv', tel:'+49151000000', email:'max@mustermann.de' }],
  tickets: [{ id:'demo-t1', pb:'Wasserhahn tropft', wn:'Musterstraße 5, 1 OG', status:'Offen', prio:'Mittel', erstellt: new Date().toISOString() }],
  followups: [{ id:'demo-f1', name:'Thomas Müller', typ:'Interessent', dat: new Date().toISOString().split('T')[0], done:false, notiz:'Besichtigung geplant' }],
  termine: [{ id:'demo-ter1', titel:'Wohnungsübergabe', datum: new Date(Date.now()+7*86400000).toISOString().split('T')[0], uhrzeit:'10:00', ort:'Musterstraße 5' }],
  objekte: [{ id:'demo-o1', name:'Musterstraße 5', adr:'Musterstraße 5, 44137 Dortmund', einheiten:4, typ:'MFH' }]
};

// ─── FORMAT HELPERS ───────────────────────────────────────────
function fmt(n) { return (n || 0).toLocaleString('de-DE'); }
function fmtEur(n) { return (parseFloat(n)||0).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' €'; }
function fmtDate(d) {
  if (!d) return '–';
  try { return new Date(d).toLocaleDateString('de-DE'); } catch(e) { return d; }
}
function today() { return new Date().toISOString().split('T')[0]; }

// ─── DATA HELPERS ─────────────────────────────────────────────
function getData(key, fallback) {
  try { var v = JSON.parse(localStorage.getItem(key)); return (v !== null && v !== undefined) ? v : fallback; }
  catch(e) { return fallback; }
}
function setData(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// ─── USER INFO ────────────────────────────────────────────────
function getUser() {
  return {
    uid:         localStorage.getItem('in_user_uid')   || '',
    name:        localStorage.getItem('in_user_name')  || 'Nutzer',
    plan:        localStorage.getItem('in_user_plan')  || 'starter',
    email:       localStorage.getItem('in_user_email') || '',
    role:        localStorage.getItem('in_role')       || '',
    firma:       localStorage.getItem('in_user_firma') || '',
    trialEndsAt: localStorage.getItem('in_trial_ends') || null
  };
}
function getUserRole() { return getUser().role; }

// ─── DEMO MODE ────────────────────────────────────────────────
function isDemoMode() { return sessionStorage.getItem('demo_mode') === 'true'; }

function startDemoMode() {
  sessionStorage.setItem('demo_mode', 'true');
  localStorage.setItem('in_role', 'verwalter');
  localStorage.setItem('in_user_uid', 'demo');
  localStorage.setItem('in_user_name', 'Demo Nutzer');
  localStorage.setItem('in_user_plan', 'pro');
  localStorage.setItem('in_user_email', 'demo@immonova.de');
  localStorage.setItem('in_user_firma', 'Demo Immobilien GmbH');
  Object.keys(DEMO_DATA).forEach(function(k) {
    if (KEYS[k]) setData(KEYS[k], DEMO_DATA[k]);
  });
  window.location.href = 'app.html';
}

// ─── AUTH GUARD ───────────────────────────────────────────────
function checkAuth() {
  var role = localStorage.getItem('in_role');
  if (!role) { window.location.href = 'login.html'; return false; }
  return true;
}

function checkRole(allowedRoles) {
  var role = localStorage.getItem('in_role');
  if (!role) { window.location.href = 'login.html'; return false; }
  if (role === 'superadmin') return true;
  if (!allowedRoles) return true;
  var allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (allowed.indexOf(role) < 0) { window.location.href = 'app.html'; return false; }
  return true;
}

// ─── TRIAL SYSTEM ─────────────────────────────────────────────
function getTrialDaysLeft() {
  var user = getUser();
  if (user.role === 'superadmin' || user.uid === 'demo') return 9999;
  if (!user.trialEndsAt) return 9999;
  return Math.ceil((new Date(user.trialEndsAt) - new Date()) / (1000*60*60*24));
}

function checkTrial() {
  var days = getTrialDaysLeft();
  if (days < 0) { window.location.href = 'upgrade.html'; return false; }
  return true;
}

function getTrialBanner() {
  var days = getTrialDaysLeft();
  if (days >= 9999 || days <= 0) return '';
  var closed = sessionStorage.getItem('trial_banner_closed');
  if (closed) return '';
  return '<div id="trial-banner" style="background:#1e3a8a;padding:10px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">'
    + '<span style="color:white;font-size:13px;font-weight:500;">⏰ Deine Testphase endet in <strong>' + days + ' Tagen</strong> – Entdecke die volle Power von ImmoNova</span>'
    + '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">'
    +   '<a href="upgrade.html" style="background:#2563eb;color:white;text-decoration:none;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:700;">Jetzt upgraden</a>'
    +   '<a href="mailto:kontakt@immonova.de?subject=Kostenlose Beratung" style="background:#fbbf24;color:#0f172a;text-decoration:none;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:700;">Kostenlose Beratung</a>'
    +   '<button onclick="document.getElementById(\'trial-banner\').style.display=\'none\';sessionStorage.setItem(\'trial_banner_closed\',\'1\')" style="background:none;border:none;color:rgba(255,255,255,0.6);cursor:pointer;font-size:18px;line-height:1;padding:0 4px;">×</button>'
    + '</div>'
    + '</div>';
}

// ─── TOAST NOTIFICATIONS ──────────────────────────────────────
function toast(msg, type, duration) {
  var colors = {
    success: { bg:'#f0fdf4', border:'#bbf7d0', text:'#15803d', icon:'✅' },
    error:   { bg:'#fef2f2', border:'#fecaca', text:'#dc2626', icon:'❌' },
    warning: { bg:'#fffbeb', border:'#fde68a', text:'#d97706', icon:'⚠️' },
    info:    { bg:'#eff6ff', border:'#bfdbfe', text:'#2563eb', icon:'ℹ️' }
  };
  var c = colors[type] || colors.info;
  var container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:70px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(container);
  }
  var t = document.createElement('div');
  t.style.cssText = 'background:' + c.bg + ';border:1px solid ' + c.border + ';color:' + c.text + ';padding:12px 16px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,0.12);display:flex;align-items:center;gap:8px;pointer-events:all;max-width:320px;animation:slideIn 0.2s ease;font-family:inherit;';
  t.innerHTML = '<span>' + c.icon + '</span><span style="flex:1;">' + msg + '</span><button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:' + c.text + ';font-size:16px;line-height:1;padding:0;opacity:0.6;">×</button>';
  container.appendChild(t);
  setTimeout(function() { if (t.parentElement) t.remove(); }, duration || 4000);
}

// ─── AKTIVITÄTS-FEED ──────────────────────────────────────────
// Schreibt eine Aktivität in Firestore /tenants/{uid}/aktivitaeten
// und optional in die lokale Notif-Liste
function logAktivitaet(ico, text) {
  var u = getUser();
  if (!u || !u.uid || u.uid === 'demo') return;
  if (typeof firebase === 'undefined' || !firebase.apps.length) return;
  try {
    firebase.firestore()
      .collection('tenants').doc(u.uid)
      .collection('aktivitaeten').add({
        icon: ico,
        text: text,
        zeit: firebase.firestore.FieldValue.serverTimestamp(),
        uid: u.uid
      });
  } catch(e) {}
}

// ─── NOTIFICATIONS ────────────────────────────────────────────
function addNotif(ico, txt) {
  // Also log to Firestore aktivitaeten feed
  logAktivitaet(ico, txt);
  var notifs = getData(KEYS.notifs, []);
  notifs.unshift({
    ico: ico, txt: txt, unread: true,
    time: new Date().toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' })
  });
  if (notifs.length > 50) notifs.pop();
  setData(KEYS.notifs, notifs);
  var dot = document.getElementById('notif-dot');
  if (dot) dot.style.display = 'block';
}

function renderNotifList() {
  var list = document.getElementById('notif-list');
  if (!list) return;
  var notifs = getData(KEYS.notifs, []);
  var unreadCount = notifs.filter(function(n){return n.unread;}).length;
  var dot = document.getElementById('notif-dot');
  if (dot) { dot.style.display = unreadCount > 0 ? 'flex' : 'none'; dot.textContent = unreadCount > 9 ? '9+' : (unreadCount || ''); }
  if (!notifs.length) { list.innerHTML = '<div style="padding:40px 20px;text-align:center;color:#94a3b8;font-size:13px;">🔔<br><br>Keine Benachrichtigungen</div>'; return; }
  list.innerHTML = notifs.slice(0,25).map(function(n,i) {
    return '<div onclick="markNotif(' + i + ')" style="padding:12px 18px;border-bottom:1px solid #f8fafc;cursor:pointer;background:' + (n.unread?'#eff6ff':'white') + ';display:flex;gap:10px;align-items:flex-start;transition:background 0.1s;" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'' + (n.unread?'#eff6ff':'white') + '\'">'
      + '<span style="font-size:18px;margin-top:1px;">' + n.ico + '</span>'
      + '<div style="flex:1;min-width:0;"><div style="font-size:13px;color:#0f172a;font-weight:' + (n.unread?'600':'400') + ';line-height:1.4;">' + n.txt + '</div>'
      + '<div style="font-size:11px;color:#94a3b8;margin-top:2px;">' + n.time + '</div></div>'
      + (n.unread ? '<div style="width:7px;height:7px;border-radius:50%;background:#2563eb;flex-shrink:0;margin-top:4px;"></div>' : '')
      + '</div>';
  }).join('');
}

function markNotif(i) {
  var notifs = getData(KEYS.notifs, []);
  if (notifs[i]) { notifs[i].unread = false; setData(KEYS.notifs, notifs); renderNotifList(); }
}

function clearAllNotifs() {
  var notifs = getData(KEYS.notifs, []);
  notifs.forEach(function(n){ n.unread = false; });
  setData(KEYS.notifs, notifs); renderNotifList();
}

// ─── FIREBASE SYNC ────────────────────────────────────────────
function syncToFirebase(uid) {
  if (!uid || uid === 'demo') return;
  if (typeof firebase === 'undefined' || !firebase.apps.length) return;
  var db = firebase.firestore();
  var data = {};
  var objectKeys = { zaehler: true };
  Object.keys(KEYS).forEach(function(k) {
    data[k] = getData(KEYS[k], objectKeys[k] ? {} : []);
  });
  db.collection('data').doc(uid).set(data, { merge: true }).catch(function(){});
}

function loadFromFirebase(uid, callback) {
  if (!uid || uid === 'demo') { if (callback) callback(); return; }
  if (typeof firebase === 'undefined' || !firebase.apps.length) { if (callback) callback(); return; }
  var db = firebase.firestore();
  db.collection('data').doc(uid).get().then(function(snap) {
    if (snap.exists) {
      var d = snap.data();
      Object.keys(KEYS).forEach(function(k) { if (d[k] !== undefined) setData(KEYS[k], d[k]); });
    }
    if (callback) callback();
  }).catch(function() { if (callback) callback(); });
}

// ─── REALTIME LISTENERS ───────────────────────────────────────
var _activeListeners = {};

function startPageListener(uid, callback) {
  if (!uid || uid === 'demo') { if (callback) callback(); return function(){}; }
  if (typeof firebase === 'undefined' || !firebase.apps.length) { if (callback) callback(); return function(){}; }
  var db = firebase.firestore();
  var unsub = db.collection('data').doc(uid).onSnapshot(function(snap) {
    if (snap.exists) {
      var d = snap.data();
      Object.keys(KEYS).forEach(function(k) { if (d[k] !== undefined) setData(KEYS[k], d[k]); });
    }
    if (callback) callback();
  }, function() { if (callback) callback(); });
  _activeListeners['page'] = unsub;
  window.addEventListener('beforeunload', cleanupListeners);
  return unsub;
}

function cleanupListeners() {
  Object.keys(_activeListeners).forEach(function(k) {
    try { if (_activeListeners[k]) _activeListeners[k](); } catch(e) {}
  });
  _activeListeners = {};
}

// ─── LOGOUT ───────────────────────────────────────────────────
function doLogout() {
  if (!confirm('Möchtest du dich wirklich abmelden?')) return;
  var uid = getUser().uid;
  cleanupListeners();
  syncToFirebase(uid);
  if (typeof firebase !== 'undefined' && firebase.apps.length) {
    firebase.auth().signOut().catch(function(){});
  }
  sessionStorage.clear();
  localStorage.clear();
  window.location.href = 'login.html';
}

// ─── REAL-TIME SEARCH ─────────────────────────────────────────
var _searchTimer = null;

function doSearch(q) {
  clearTimeout(_searchTimer);
  var dropdown = document.getElementById('search-dropdown');
  if (!q || q.length < 2) { if (dropdown) dropdown.style.display = 'none'; return; }
  _searchTimer = setTimeout(function() {
    var ql = q.toLowerCase();
    var results = [];
    getData(KEYS.mieter, []).forEach(function(m) {
      if ((m.name||'').toLowerCase().indexOf(ql)>=0 || (m.wn||'').toLowerCase().indexOf(ql)>=0 || (m.email||'').toLowerCase().indexOf(ql)>=0)
        results.push({ ico:'👥', label:(m.name||'')+(m.wn?' – '+m.wn:''), url:'mieter.html', sub:'Mieter' });
    });
    getData(KEYS.tickets, []).forEach(function(t) {
      if ((t.pb||'').toLowerCase().indexOf(ql)>=0)
        results.push({ ico:'🎫', label:(t.pb||'').substring(0,45), url:'tickets.html', sub:'Ticket – '+(t.status||'') });
    });
    getData(KEYS.kontakte, []).forEach(function(k) {
      var n = ((k.vn||'')+' '+(k.nn||'')).trim();
      if (n.toLowerCase().indexOf(ql)>=0 || (k.firma||'').toLowerCase().indexOf(ql)>=0)
        results.push({ ico:'📇', label:n+(k.firma?' – '+k.firma:''), url:'kontakte.html', sub:'Kontakt' });
    });
    getData(KEYS.projekte, []).forEach(function(p) {
      if ((p.name||'').toLowerCase().indexOf(ql)>=0)
        results.push({ ico:'🏗️', label:p.name+(p.adr?' – '+p.adr:''), url:'projekte.html', sub:'Projekt' });
    });
    getData(KEYS.handwerker, []).forEach(function(h) {
      var n = ((h.vn||'')+' '+(h.nn||'')).trim()||(h.firma||'');
      if (n.toLowerCase().indexOf(ql)>=0||(h.firma||'').toLowerCase().indexOf(ql)>=0)
        results.push({ ico:'🔧', label:n+(h.gewerk?' – '+h.gewerk:''), url:'handwerker.html', sub:'Handwerker' });
    });
    getData(KEYS.interessenten, []).forEach(function(i) {
      var n = ((i.vn||'')+' '+(i.nn||'')).trim();
      if (n.toLowerCase().indexOf(ql)>=0)
        results.push({ ico:'🎯', label:n+(i.wunsch?' – '+i.wunsch:''), url:'interessenten.html', sub:'Interessent' });
    });
    getData(KEYS.objekte, []).forEach(function(o) {
      if ((o.name||'').toLowerCase().indexOf(ql)>=0||(o.adr||'').toLowerCase().indexOf(ql)>=0)
        results.push({ ico:'🏢', label:(o.name||o.adr||''), url:'objekte.html', sub:'Objekt' });
    });
    results = results.slice(0, 8);
    if (!dropdown) return;
    if (!results.length) {
      dropdown.innerHTML = '<div style="padding:14px 16px;font-size:13px;color:#94a3b8;text-align:center;">Keine Ergebnisse für „'+q+'"</div>';
    } else {
      dropdown.innerHTML = results.map(function(r) {
        return '<a href="'+r.url+'" style="display:flex;align-items:center;gap:10px;padding:10px 14px;text-decoration:none;color:#1e293b;border-bottom:1px solid #f1f5f9;transition:background 0.1s;" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'white\'">'
          + '<span style="font-size:16px;width:22px;text-align:center;flex-shrink:0;">'+r.ico+'</span>'
          + '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+r.label+'</div>'
          + '<div style="font-size:11px;color:#94a3b8;">'+r.sub+'</div></div>'
          + '<span style="font-size:11px;color:#94a3b8;flex-shrink:0;">→</span>'
          + '</a>';
      }).join('');
    }
    dropdown.style.display = 'block';
  }, 280);
}

// ─── SIDEBAR ──────────────────────────────────────────────────
function getSidebarHTML(activePage) {
  var user = getUser();
  var role = user.role;
  var mieter    = getData(KEYS.mieter, []);
  var tickets   = getData(KEYS.tickets, []);
  var aufgaben  = getData(KEYS.aufgaben, []);
  var followups = getData(KEYS.followups, []);
  var messages  = getData(KEYS.messages, []);
  var heute     = today();

  var offeneTickets  = tickets.filter(function(t){ return t.status==='Offen'; }).length;
  var offeneAufgaben = aufgaben.filter(function(a){ return !a.done; }).length;
  var fuHeute        = followups.filter(function(f){ return !f.done && f.dat===heute; }).length;
  var unreadMsgs     = messages.filter(function(m){ return !m.gelesen && m.von !== user.name; }).length;

  function navLink(href, ico, label, badge, badgeColor, active) {
    var isActive = activePage === active;
    var bdg = badge > 0
      ? '<span style="background:'+(badgeColor||'#dc2626')+';color:white;font-size:10px;font-weight:700;min-width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;border-radius:9px;padding:0 4px;margin-left:auto;">'+badge+'</span>'
      : '';
    return '<a href="'+href+'" style="display:flex;align-items:center;gap:10px;padding:8px 14px 8px 16px;text-decoration:none;font-size:13px;font-weight:'+(isActive?'600':'400')+';color:'+(isActive?'#fff':'#94a3b8')+';background:'+(isActive?'rgba(37,99,235,0.25)':'transparent')+';border-left:3px solid '+(isActive?'#60a5fa':'transparent')+';transition:all 0.12s;" '
      + 'onmouseover="if(this.style.background!==\'rgba(37,99,235,0.25)\'){this.style.background=\'#1e293b\';this.style.color=\'#e2e8f0\';}" '
      + 'onmouseout="if(this.style.background!==\'rgba(37,99,235,0.25)\'){this.style.background=\'transparent\';this.style.color=\'#94a3b8\';}">'
      + '<span style="font-size:14px;width:18px;text-align:center;flex-shrink:0;">'+ico+'</span>'
      + '<span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+label+'</span>'
      + bdg
      + '</a>';
  }

  function navSection(label) {
    return '<div style="padding:14px 16px 4px;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.8px;">'+label+'</div>';
  }

  var isSuperAdmin = (role === 'superadmin');
  var isVerwalter  = (role === 'verwalter' || role === 'admin' || isSuperAdmin);

  return '<div id="sidebar" style="width:240px;min-width:240px;background:#0f172a;display:flex;flex-direction:column;height:100vh;overflow:hidden;flex-shrink:0;transition:width 0.2s ease;">'
    // Logo
    + '<a href="app.html" style="padding:16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #1e293b;text-decoration:none;flex-shrink:0;">'
    +   '<div style="width:32px;height:32px;background:#2563eb;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🏢</div>'
    +   '<div style="font-size:16px;font-weight:700;color:white;letter-spacing:-0.3px;white-space:nowrap;">Immo<span style="color:#60a5fa;">Nova</span></div>'
    + '</a>'
    // Nav
    + '<nav style="flex:1;overflow-y:auto;padding:6px 0;" id="sidebar-nav">'
    + navSection('Übersicht')
    + navLink('app.html',           '🏠', 'Dashboard',         0,           '',        'dashboard')
    + navLink('mieter.html',        '👥', 'Mieter',            0,           '',        'mieter')
    + navLink('objekte.html',       '🏢', 'Objekte & Gebäude', 0,           '',        'objekte')
    + navLink('projekte.html',      '🏗️', 'Projekte',          0,           '',        'projekte')
    + navLink('tickets.html',       '🎫', 'Tickets & Schäden', offeneTickets,'#dc2626','tickets')
    + navLink('handwerker.html',    '🔧', 'Handwerker',        0,           '',        'handwerker')
    + navSection('Kommunikation')
    + navLink('nachrichten.html',   '💬', 'Nachrichten',       unreadMsgs,  '#2563eb', 'nachrichten')
    + navLink('mitteilungen.html',  '📢', 'Haus-Mitteilungen', 0,           '',        'mitteilungen')
    + (isVerwalter ? navSection('Finanzen') : '')
    + (isVerwalter ? navLink('zahlungen.html', '💳', 'Zahlungen & Bank', 0, '', 'zahlungen') : '')
    + navSection('CRM & Vermietung')
    + navLink('crm.html',           '🎯', 'Follow-Up CRM',     fuHeute,     '#dc2626', 'crm')
    + navLink('interessenten.html', '🔍', 'Interessenten',     0,           '',        'interessenten')
    + navSection('Verwaltung')
    + navLink('kalender.html',      '📅', 'Terminkalender',    0,           '',        'kalender')
    + navLink('kontakte.html',      '📇', 'Kontakte',          0,           '',        'kontakte')
    + navLink('aufgaben.html',      '✅', 'Aufgaben',          offeneAufgaben,'#dc2626','aufgaben')
    + navLink('reinigung.html',     '🧹', 'Reinigungsplan',    0,           '',        'reinigung')
    + navLink('zaehler.html',       '🔢', 'Zählerstände',      0,           '',        'zaehler')
    + navLink('dokumente.html',     '📄', 'Dokumente',         0,           '',        'dokumente')
    + navLink('versicherungen.html','🛡️', 'Versicherungen',    0,           '',        'versicherungen')
    + (isVerwalter ? navLink('berichte.html', '📊', 'Berichte & Analyse', 0, '', 'berichte') : '')
    + navSection('System')
    + navLink('einstellungen.html', '⚙️', 'Einstellungen',     0,           '',        'einstellungen')
    + (isSuperAdmin ? navLink('admin.html','👑','Admin-Konsole',0,'#fbbf24','admin') : '')
    + '</nav>'
    // User footer
    + '<div style="padding:10px;border-top:1px solid #1e293b;flex-shrink:0;">'
    +   '<div style="display:flex;align-items:center;gap:9px;padding:9px 10px;background:#1e293b;border-radius:10px;">'
    +     '<div style="width:30px;height:30px;background:#2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;flex-shrink:0;">'+(user.name[0]||'?').toUpperCase()+'</div>'
    +     '<div style="flex:1;min-width:0;">'
    +       '<div style="font-size:12px;font-weight:600;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+user.name+'</div>'
    +       '<div style="font-size:10px;color:#64748b;">'+(isSuperAdmin?'👑 Superadmin':role==='admin'?'⚙️ Admin':role==='mitarbeiter'?'👤 Mitarbeiter':'🏢 Verwalter')+'</div>'
    +     '</div>'
    +     '<button onclick="doLogout()" title="Abmelden" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:15px;padding:4px;border-radius:6px;transition:color 0.1s;" onmouseover="this.style.color=\'#ef4444\'" onmouseout="this.style.color=\'#64748b\'">🚪</button>'
    +   '</div>'
    + '</div>'
    + '</div>';
}

// ─── TOPBAR ───────────────────────────────────────────────────
function getTopbarHTML(title, actionBtn) {
  var user = getUser();
  var unreadNotifs = getData(KEYS.notifs, []).filter(function(n){return n.unread;}).length;
  return '<div style="background:white;border-bottom:1px solid #e2e8f0;padding:0 20px;height:56px;display:flex;align-items:center;gap:12px;flex-shrink:0;box-shadow:0 1px 3px rgba(0,0,0,0.06);position:relative;z-index:50;">'
    // Title
    + '<div style="font-size:15px;font-weight:700;color:#0f172a;white-space:nowrap;">'+title+'</div>'
    // Spacer
    + '<div style="flex:1;"></div>'
    // Action button
    + (actionBtn ? '<div>'+actionBtn+'</div>' : '')
    // Notifications
    + '<button onclick="toggleNotifPanel()" id="notif-btn" style="position:relative;width:36px;height:36px;border-radius:9px;border:1px solid #e2e8f0;background:white;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:background 0.1s;" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'white\'">🔔'
    +   '<div id="notif-dot" style="display:'+(unreadNotifs>0?'flex':'none')+';position:absolute;top:-3px;right:-3px;width:18px;height:18px;background:#dc2626;border-radius:50%;border:2px solid white;font-size:9px;font-weight:700;color:white;align-items:center;justify-content:center;">'+(unreadNotifs>9?'9+':unreadNotifs||'')+'</div>'
    + '</button>'
    // Avatar + Dropdown
    + '<div style="position:relative;" id="avatar-menu-wrap">'
    +   '<button onclick="toggleAvatarMenu()" style="display:flex;align-items:center;gap:7px;background:none;border:1px solid #e2e8f0;border-radius:9px;padding:5px 10px 5px 6px;cursor:pointer;font-family:inherit;transition:background 0.1s;" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'white\'">'
    +     '<div style="width:28px;height:28px;background:#2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;flex-shrink:0;">'+(user.name[0]||'?').toUpperCase()+'</div>'
    +     '<span style="font-size:13px;font-weight:600;color:#0f172a;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+user.name+'</span>'
    +     '<span style="color:#94a3b8;font-size:11px;">▾</span>'
    +   '</button>'
    +   '<div id="avatar-menu" style="display:none;position:absolute;top:calc(100%+6px);right:0;background:white;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:180px;z-index:200;overflow:hidden;">'
    +     '<div style="padding:12px 14px;border-bottom:1px solid #f1f5f9;">'
    +       '<div style="font-size:13px;font-weight:600;color:#0f172a;">'+user.name+'</div>'
    +       '<div style="font-size:11px;color:#94a3b8;">'+user.email+'</div>'
    +     '</div>'
    +     '<a href="einstellungen.html" style="display:flex;align-items:center;gap:8px;padding:10px 14px;text-decoration:none;color:#374151;font-size:13px;transition:background 0.1s;" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'white\'">⚙️ Einstellungen</a>'
    +     '<a href="einstellungen.html#profil" style="display:flex;align-items:center;gap:8px;padding:10px 14px;text-decoration:none;color:#374151;font-size:13px;transition:background 0.1s;" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'white\'">👤 Mein Profil</a>'
    +     '<div style="border-top:1px solid #f1f5f9;"></div>'
    +     '<button onclick="doLogout()" style="display:flex;align-items:center;gap:8px;padding:10px 14px;width:100%;background:none;border:none;color:#dc2626;font-size:13px;cursor:pointer;font-family:inherit;text-align:left;transition:background 0.1s;" onmouseover="this.style.background=\'#fef2f2\'" onmouseout="this.style.background=\'white\'">🚪 Abmelden</button>'
    +   '</div>'
    + '</div>'
    + '</div>';
}

function toggleAvatarMenu() {
  var m = document.getElementById('avatar-menu');
  if (!m) return;
  var open = m.style.display === 'block';
  m.style.display = open ? 'none' : 'block';
  if (!open) {
    setTimeout(function() {
      document.addEventListener('click', function closeMenu(e) {
        var wrap = document.getElementById('avatar-menu-wrap');
        if (wrap && !wrap.contains(e.target)) { m.style.display='none'; document.removeEventListener('click', closeMenu); }
      });
    }, 10);
  }
}

function toggleNotifPanel() {
  var p = document.getElementById('notif-panel');
  if (!p) return;
  var isOpen = p.style.display === 'flex';
  p.style.display = isOpen ? 'none' : 'flex';
  if (!isOpen) {
    renderNotifList();
    setTimeout(function() {
      document.addEventListener('click', function closePanel(e) {
        var btn = document.getElementById('notif-btn');
        if (p && !p.contains(e.target) && btn && !btn.contains(e.target)) {
          p.style.display='none'; document.removeEventListener('click', closePanel);
        }
      });
    }, 10);
  }
}

// ─── NOTIF PANEL ──────────────────────────────────────────────
function getNotifPanelHTML() {
  return '<div id="notif-panel" style="display:none;position:fixed;top:56px;right:0;width:340px;background:white;border-left:1px solid #e2e8f0;height:calc(100vh - 56px);flex-direction:column;z-index:100;box-shadow:-4px 0 24px rgba(0,0,0,0.1);">'
    + '<div style="padding:14px 18px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;">'
    +   '<div style="font-size:14px;font-weight:700;color:#0f172a;">🔔 Benachrichtigungen</div>'
    +   '<button onclick="clearAllNotifs()" style="background:none;border:1px solid #e2e8f0;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;color:#64748b;transition:all 0.1s;" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'white\'">Alle gelesen</button>'
    + '</div>'
    + '<div id="notif-list" style="overflow-y:auto;flex:1;"></div>'
    + '</div>';
}

// ─── LAYOUT RENDERER ──────────────────────────────────────────
function renderLayout(activePage, title, actionBtn, mainContent, modals) {
  document.body.innerHTML =
    '<div style="display:flex;height:100vh;overflow:hidden;font-family:\'DM Sans\',sans-serif;font-size:14px;color:#0f172a;background:#f8fafc;">'
    + getSidebarHTML(activePage)
    + '<div style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;">'
    + getTrialBanner()
    + getTopbarHTML(title, actionBtn)
    + getNotifPanelHTML()
    + '<div style="flex:1;overflow-y:auto;padding:24px;" id="main-content">'
    + mainContent
    + '</div>'
    + '</div>'
    + '</div>'
    + (modals || '');
  renderNotifList();
  injectGlobalStyles();
}

// ─── CARD / BADGE / FORM HELPERS ──────────────────────────────
function card(content, style) {
  return '<div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);'+(style||'')+'">'+content+'</div>';
}

function badge(txt, color) {
  var c = { green:'background:#f0fdf4;color:#16a34a;', red:'background:#fef2f2;color:#dc2626;', yellow:'background:#fffbeb;color:#d97706;', blue:'background:#eff6ff;color:#2563eb;', gray:'background:#f1f5f9;color:#64748b;', purple:'background:#faf5ff;color:#7c3aed;' };
  return '<span style="display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;'+(c[color]||c.gray)+'">'+txt+'</span>';
}

// ─── UNIFIED FORM DESIGN SYSTEM ───────────────────────────────
var inputStyle = 'width:100%;height:42px;padding:9px 13px;border:1.5px solid #e2e8f0;border-radius:9px;font-size:14px;font-family:inherit;color:#0f172a;background:white;outline:none;box-sizing:border-box;transition:border-color 0.15s,box-shadow 0.15s;" onfocus="this.style.borderColor=\'#2563eb\';this.style.boxShadow=\'0 0 0 3px rgba(37,99,235,0.1)\'" onblur="this.style.borderColor=\'#e2e8f0\';this.style.boxShadow=\'none\'';
var labelStyle = 'display:block;font-size:11px;font-weight:700;color:#64748b;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px;';
var formGroupStyle = 'margin-bottom:14px;';
var formRowStyle = 'display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:0;';
var formRow3Style = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:0;';
var selectStyle = inputStyle + ';cursor:pointer;';
var textareaStyle = 'width:100%;padding:9px 13px;border:1.5px solid #e2e8f0;border-radius:9px;font-size:14px;font-family:inherit;color:#0f172a;background:white;outline:none;box-sizing:border-box;resize:vertical;min-height:70px;transition:border-color 0.15s,box-shadow 0.15s;" onfocus="this.style.borderColor=\'#2563eb\';this.style.boxShadow=\'0 0 0 3px rgba(37,99,235,0.1)\'" onblur="this.style.borderColor=\'#e2e8f0\';this.style.boxShadow=\'none\'';

function formGroup(label, inputHtml, extraStyleOrRequired) {
  var extra = typeof extraStyleOrRequired === 'string' ? extraStyleOrRequired : '';
  var req = extraStyleOrRequired === true;
  var lbl = req ? label + '<span style="color:#ef4444;margin-left:2px;">*</span>' : label;
  return '<div style="'+formGroupStyle+extra+'">'
    + '<label style="'+labelStyle+'">'+lbl+'</label>'
    + inputHtml + '</div>';
}

function formInput(id, type, placeholder, extra) {
  return '<input id="'+id+'" type="'+(type||'text')+'" placeholder="'+(placeholder||'')+'" style="'+inputStyle+'" '+(extra||'')+'>';
}

function formSelect(id, optionsHtml, extra) {
  return '<select id="'+id+'" style="'+inputStyle+'" '+(extra||'')+'>'+(optionsHtml||'')+'</select>';
}

function formTextarea(id, placeholder, rows) {
  return '<textarea id="'+id+'" placeholder="'+(placeholder||'')+'" rows="'+(rows||3)+'" style="'+textareaStyle+'"></textarea>';
}

function formRow(col1, col2) {
  return '<div style="'+formRowStyle+'">'+col1+col2+'</div>';
}

function formRow3(col1, col2, col3) {
  return '<div style="'+formRow3Style+'">'+col1+col2+col3+'</div>';
}

function modalFooter(cancelId, saveLabel, saveAction) {
  return '<div style="display:flex;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid #f1f5f9;">'
    + '<button onclick="'+saveAction+'" style="flex:1;height:42px;background:#2563eb;color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;">'+saveLabel+'</button>'
    + '<button onclick="hideModal(\''+cancelId+'\')" style="height:42px;padding:0 20px;background:#f1f5f9;color:#64748b;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Abbrechen</button>'
    + '</div>';
}

// Blocks add/edit/delete in demo mode; returns true if blocked
function checkDemoBlock() {
  if (!isDemoMode()) return false;
  toast('Im Demo-Modus sind keine Änderungen möglich. Jetzt kostenlos registrieren!', 'info');
  return true;
}

// Injects sticky demo mode banner at top of page
function showDemoBanner() {
  if (!isDemoMode()) return;
  if (document.getElementById('demo-banner')) return;
  var b = document.createElement('div');
  b.id = 'demo-banner';
  b.style.cssText = 'background:#1e3a8a;color:white;text-align:center;padding:10px 20px;font-size:13px;font-weight:600;position:sticky;top:0;z-index:998;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;';
  b.innerHTML = '🏢 Du siehst gerade Beispiel-Daten – lege jetzt deine echten Daten an! <a href="login.html#register" style="color:#93c5fd;text-decoration:underline;white-space:nowrap;">Jetzt kostenlos registrieren →</a>';
  document.body.insertBefore(b, document.body.firstChild);
}

function emptyState(icon, title, desc, btnLabel, btnOnclick) {
  return '<div style="text-align:center;padding:60px 20px;">'
    + '<div style="font-size:52px;margin-bottom:12px;">'+icon+'</div>'
    + '<div style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:8px;">'+title+'</div>'
    + '<div style="font-size:14px;color:#94a3b8;margin-bottom:24px;max-width:340px;margin-left:auto;margin-right:auto;line-height:1.6;">'+desc+'</div>'
    + (btnLabel ? '<button onclick="'+btnOnclick+'" style="background:#2563eb;color:white;border:none;border-radius:9px;padding:11px 22px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(37,99,235,0.3);">'+btnLabel+'</button>' : '')
    + '</div>';
}

// ─── MODAL HELPERS ────────────────────────────────────────────
function showModal(id) { var m=document.getElementById(id); if(m){m.style.display='flex'; m.style.animation='fadeIn 0.15s ease';} }
function hideModal(id) { var m=document.getElementById(id); if(m) m.style.display='none'; }

function modalHTML(id, title, content, wide) {
  return '<div id="'+id+'" onclick="if(event.target===this)hideModal(\''+id+'\')" '
    + 'style="display:none;position:fixed;inset:0;background:rgba(15,23,42,0.5);align-items:center;justify-content:center;z-index:1000;padding:20px;backdrop-filter:blur(4px);">'
    + '<div style="background:white;border-radius:16px;padding:28px;width:100%;max-width:'+(wide?'720':'520')+'px;max-height:92vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.22);">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">'
    + '<div style="font-size:16px;font-weight:700;color:#0f172a;">'+title+'</div>'
    + '<button onclick="hideModal(\''+id+'\')" style="background:#f1f5f9;border:none;font-size:14px;cursor:pointer;color:#64748b;width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;">✕</button>'
    + '</div>'+content+'</div></div>';
}

// ─── COOKIE CONSENT ───────────────────────────────────────────
function showCookieBanner() {
  if (localStorage.getItem('cookie_consent')) return;
  var banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#0f172a;color:white;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;z-index:9998;flex-wrap:wrap;box-shadow:0 -4px 20px rgba(0,0,0,0.2);';
  banner.innerHTML = '<div style="font-size:13px;color:#cbd5e1;flex:1;min-width:200px;">🍪 Wir verwenden Cookies für Firebase-Authentifizierung und lokale Datenspeicherung gemäß <a href="datenschutz.html" style="color:#60a5fa;text-decoration:underline;">Datenschutzerklärung</a>.</div>'
    + '<div style="display:flex;gap:8px;flex-shrink:0;">'
    +   '<button onclick="acceptCookies()" style="background:#2563eb;color:white;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">Akzeptieren</button>'
    +   '<button onclick="document.getElementById(\'cookie-banner\').remove()" style="background:#1e293b;color:#94a3b8;border:1px solid #334155;border-radius:8px;padding:8px 14px;font-size:13px;cursor:pointer;font-family:inherit;">Nur notwendige</button>'
    + '</div>';
  document.body.appendChild(banner);
}

function acceptCookies() {
  localStorage.setItem('cookie_consent', '1');
  var b = document.getElementById('cookie-banner'); if (b) b.remove();
}

// ─── GLOBAL CSS ───────────────────────────────────────────────
function injectGlobalStyles() {
  if (document.getElementById('immonova-css')) return;
  var s = document.createElement('style');
  s.id = 'immonova-css';
  s.textContent = [
    '@keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}',
    '@keyframes spin{to{transform:rotate(360deg)}}',
    '@keyframes confettiFall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}',
    '*{box-sizing:border-box;}',
    '::-webkit-scrollbar{width:5px;height:5px;}',
    '::-webkit-scrollbar-track{background:transparent;}',
    '::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}',
    '::-webkit-scrollbar-thumb:hover{background:#94a3b8;}',
    'a{color:#2563eb;}',
    'button,input,select,textarea{font-family:\'DM Sans\',sans-serif;}',
    '.imn-btn{background:#2563eb;color:white;border:none;border-radius:9px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;box-shadow:0 2px 8px rgba(37,99,235,0.25);}',
    '.imn-btn:hover{background:#1d4ed8;}',
    '.imn-btn-outline{background:white;color:#374151;border:1px solid #e2e8f0;border-radius:9px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.15s;}',
    '.imn-btn-outline:hover{background:#f8fafc;border-color:#cbd5e1;}',
    '.imn-btn-danger{background:white;color:#dc2626;border:1.5px solid #dc2626;border-radius:9px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.15s;}',
    '.imn-btn-danger:hover{background:#dc2626;color:white;}',
    '#sidebar-nav::-webkit-scrollbar{width:0;}',
  ].join('');
  document.head.appendChild(s);
}

// ─── ADDRESS AUTOCOMPLETE (Nominatim/OpenStreetMap) ───────────
// Usage: initAddressAutocomplete('input-id', function(result){ ... })
// result: { strasse, hausnummer, plz, stadt, bundesland, land, formatted }
function initAddressAutocomplete(inputId, callback) {
  var input = document.getElementById(inputId);
  if (!input) return;

  // Dropdown container
  var dropdown = document.createElement('div');
  dropdown.style.cssText = [
    'position:absolute;left:0;right:0;top:100%;',
    'background:white;border:1.5px solid #2563eb;border-radius:0 0 10px 10px;',
    'box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:9999;',
    'max-height:220px;overflow-y:auto;display:none;'
  ].join('');

  // Make parent relative
  var wrap = input.parentElement;
  if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
  wrap.appendChild(dropdown);

  var debounceTimer;
  var lastQuery = '';

  input.addEventListener('input', function() {
    var q = input.value.trim();
    if (q === lastQuery) return;
    lastQuery = q;
    clearTimeout(debounceTimer);
    if (q.length < 3) { dropdown.style.display = 'none'; return; }
    debounceTimer = setTimeout(function() { fetchSuggestions(q); }, 350);
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { dropdown.style.display = 'none'; }
    if (e.key === 'ArrowDown') {
      var first = dropdown.querySelector('.acItem');
      if (first) { first.focus(); e.preventDefault(); }
    }
  });

  document.addEventListener('click', function(e) {
    if (!wrap.contains(e.target)) dropdown.style.display = 'none';
  });

  function fetchSuggestions(q) {
    var url = 'https://nominatim.openstreetmap.org/search'
      + '?format=json&q=' + encodeURIComponent(q)
      + '&countrycodes=de&addressdetails=1&limit=6&accept-language=de';

    dropdown.innerHTML = '<div style="padding:10px 14px;font-size:12px;color:#94a3b8;">Suche...</div>';
    dropdown.style.display = 'block';

    fetch(url, { headers: { 'Accept-Language': 'de' } })
      .then(function(r) { return r.json(); })
      .then(function(results) {
        dropdown.innerHTML = '';
        if (!results.length) {
          dropdown.innerHTML = '<div style="padding:10px 14px;font-size:13px;color:#94a3b8;">Keine Ergebnisse</div>';
          return;
        }
        results.forEach(function(r, idx) {
          var item = document.createElement('div');
          item.className = 'acItem';
          item.tabIndex = 0;
          item.style.cssText = [
            'padding:10px 14px;cursor:pointer;font-size:13px;color:#0f172a;',
            'border-bottom:1px solid #f1f5f9;display:flex;align-items:center;gap:8px;',
            'transition:background 0.1s;outline:none;'
          ].join('');

          var icon = r.type === 'house' ? '🏠' : r.type === 'road' ? '🛣️' : '📍';
          item.innerHTML = '<span style="flex-shrink:0;">' + icon + '</span>'
            + '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + r.display_name + '</span>';

          function select() {
            var addr = r.address || {};
            var strasse = addr.road || addr.pedestrian || addr.footway || '';
            var hausnummer = addr.house_number || '';
            var plz = addr.postcode || '';
            var stadt = addr.city || addr.town || addr.village || addr.hamlet || '';
            var bundesland = addr.state || '';
            var formatted = strasse + (hausnummer ? ' ' + hausnummer : '')
              + (plz ? ', ' + plz : '') + (stadt ? ' ' + stadt : '');
            input.value = formatted || r.display_name;
            dropdown.style.display = 'none';
            lastQuery = input.value;
            if (callback) callback({
              strasse: strasse,
              hausnummer: hausnummer,
              plz: plz,
              stadt: stadt,
              bundesland: bundesland,
              land: 'Deutschland',
              lat: parseFloat(r.lat) || 0,
              lng: parseFloat(r.lon) || 0,
              formatted: formatted || r.display_name
            });
          }

          item.addEventListener('click', select);
          item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') select();
            if (e.key === 'ArrowDown') {
              var next = item.nextElementSibling;
              if (next) { next.focus(); e.preventDefault(); }
            }
            if (e.key === 'ArrowUp') {
              var prev = item.previousElementSibling;
              if (prev) { prev.focus(); } else { input.focus(); }
              e.preventDefault();
            }
            if (e.key === 'Escape') { dropdown.style.display = 'none'; input.focus(); }
          });
          item.addEventListener('mouseover', function() { item.style.background = '#eff6ff'; });
          item.addEventListener('mouseout',  function() { item.style.background = 'white'; });
          dropdown.appendChild(item);
        });
        dropdown.style.display = 'block';
      })
      .catch(function() {
        dropdown.innerHTML = '<div style="padding:10px 14px;font-size:13px;color:#dc2626;">Fehler bei der Adresssuche</div>';
      });
  }
}

// ─── GOOGLE MAPS LINK HELPER ─────────────────────────────────
function mapsLink(address) {
  if (!address) return '#';
  return 'https://maps.google.com/?q=' + encodeURIComponent(address);
}

// Run on load
(function() {
  injectGlobalStyles();
})();

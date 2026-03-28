// ===== IMMONOVA SHARED.JS v2.0 – Enterprise Edition =====

// ─── FIREBASE CONFIG ──────────────────────────────────────
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

// ─── AUTH CHECK ───────────────────────────────────────────
function checkAuth() {
  var role = localStorage.getItem('in_role');
  if (!role) { window.location.href = 'login.html'; return false; }
  return true;
}

// Rollen-Prüfung (RBAC)
function checkRole(allowedRoles) {
  var role = localStorage.getItem('in_role');
  if (!role) { window.location.href = 'login.html'; return false; }
  if (!allowedRoles) return true;
  var allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  // superadmin und admin haben immer Zugriff
  if (role === 'superadmin' || role === 'admin') return true;
  if (allowed.indexOf(role) < 0) {
    window.location.href = 'app.html';
    return false;
  }
  return true;
}

// ─── USER INFO ────────────────────────────────────────────
function getUser() {
  return {
    uid:         localStorage.getItem('in_user_uid')    || 'admin',
    name:        localStorage.getItem('in_user_name')   || 'Admin',
    plan:        localStorage.getItem('in_user_plan')   || 'starter',
    email:       localStorage.getItem('in_user_email')  || '',
    role:        localStorage.getItem('in_role')        || 'admin',
    firma:       localStorage.getItem('in_user_firma')  || '',
    trialEndsAt: localStorage.getItem('in_trial_ends')  || null
  };
}

// ─── TRIAL-SYSTEM ─────────────────────────────────────────
function getTrialDaysLeft() {
  var user = getUser();
  if (user.uid === 'admin' || user.role === 'superadmin') return 9999;
  if (!user.trialEndsAt) return 9999;
  return Math.ceil((new Date(user.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24));
}

function checkTrial() {
  var days = getTrialDaysLeft();
  if (days < 0) { window.location.href = 'upgrade.html'; return false; }
  return true;
}

function getTrialBanner() {
  var days = getTrialDaysLeft();
  if (days >= 9999) return '';
  if (days <= 0)    return '';
  if (days <= 7)
    return '<div style="background:#fef2f2;border-bottom:2px solid #fecaca;padding:8px 24px;text-align:center;font-size:13px;color:#dc2626;font-weight:500;">⏰ Testphase endet in <strong>' + days + ' Tagen</strong>! <a href="upgrade.html" style="color:#dc2626;font-weight:700;text-decoration:underline;margin-left:8px;">Jetzt upgraden →</a></div>';
  if (days <= 14)
    return '<div style="background:#fffbeb;border-bottom:1px solid #fde68a;padding:7px 24px;text-align:center;font-size:13px;color:#d97706;font-weight:500;">⏰ Noch <strong>' + days + ' Tage</strong> in der Testphase. <a href="upgrade.html" style="color:#d97706;font-weight:700;text-decoration:none;margin-left:8px;">Plan wählen →</a></div>';
  return '<div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:6px 24px;text-align:center;font-size:12px;color:#2563eb;">✨ Testphase aktiv – noch <strong>' + days + ' Tage</strong> kostenlos</div>';
}

// ─── ONBOARDING CHECK ─────────────────────────────────────
function checkOnboarding() {
  var uid = getUser().uid;
  if (uid === 'admin') return false;
  var done = localStorage.getItem('in_onboarding_done');
  var mieter = getData(KEYS.mieter, []);
  var objekte = getData(KEYS.objekte, []);
  if (!done && mieter.length === 0 && objekte.length === 0) {
    // Nur einmal weiterleiten
    if (window.location.pathname.indexOf('onboarding') < 0) {
      window.location.href = 'onboarding.html';
      return true;
    }
  }
  return false;
}

// ─── DATA HELPERS ─────────────────────────────────────────
function getData(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch (e) { return fallback; }
}

function setData(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ─── SHARED DATA KEYS ─────────────────────────────────────
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
  notifs:        'in_notifs'
};

// DEFAULT MIETER – leer für neue User, Platzhalter für Demo
var DEFAULT_MIETER = [];

// ─── FORMAT HELPERS ───────────────────────────────────────
function fmt(n) { return (n || 0).toLocaleString('de-DE'); }
function fmtDate(d) {
  if (!d) return '–';
  try { return new Date(d).toLocaleDateString('de-DE'); }
  catch (e) { return d; }
}
function today() { return new Date().toISOString().split('T')[0]; }

// ─── NOTIFICATION ─────────────────────────────────────────
function addNotif(ico, txt) {
  var notifs = getData(KEYS.notifs, []);
  notifs.unshift({
    ico: ico, txt: txt, unread: true,
    time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  });
  if (notifs.length > 30) notifs.pop();
  setData(KEYS.notifs, notifs);
}

// ─── LOGOUT ───────────────────────────────────────────────
function doLogout() {
  if (confirm('Möchtest du dich wirklich abmelden?')) {
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
      firebase.auth().signOut().catch(function () {});
    }
    localStorage.clear();
    window.location.href = 'login.html';
  }
}

// ─── FIREBASE SYNC ────────────────────────────────────────
function syncToFirebase(uid) {
  if (!uid || uid === 'admin') return;
  if (typeof firebase === 'undefined') return;
  var db = firebase.firestore();
  var data = {};
  Object.keys(KEYS).forEach(function (k) { data[k] = getData(KEYS[k], []); });
  db.collection('data').doc(uid).set(data, { merge: true }).catch(function () {});
}

function loadFromFirebase(uid, callback) {
  if (!uid || uid === 'admin') { if (callback) callback(); return; }
  if (typeof firebase === 'undefined') { if (callback) callback(); return; }
  var db = firebase.firestore();
  db.collection('data').doc(uid).get().then(function (snap) {
    if (snap.exists) {
      var d = snap.data();
      Object.keys(KEYS).forEach(function (k) {
        if (d[k] !== undefined) setData(KEYS[k], d[k]);
      });
    }
    if (callback) callback();
  }).catch(function () { if (callback) callback(); });
}

// Echtzeit-Listener mit onSnapshot
var _activeListeners = {};

function listenToData(uid, callback) {
  if (!uid || uid === 'admin') { if (callback) callback(); return function () {}; }
  if (typeof firebase === 'undefined') { if (callback) callback(); return function () {}; }
  var db = firebase.firestore();
  var unsub = db.collection('data').doc(uid).onSnapshot(function (snap) {
    if (snap.exists) {
      var d = snap.data();
      Object.keys(KEYS).forEach(function (k) {
        if (d[k] !== undefined) setData(KEYS[k], d[k]);
      });
    }
    if (callback) callback();
  }, function () { if (callback) callback(); });
  return unsub;
}

// Seiten-spezifischer Listener (wird beim Verlassen aufgeräumt)
function startPageListener(uid, callback) {
  var unsub = listenToData(uid, callback);
  window.addEventListener('beforeunload', function () { if (unsub) unsub(); });
  return unsub;
}

// ─── ECHTZEIT-SUCHE ───────────────────────────────────────
var _searchTimer = null;

function doSearch(q) {
  clearTimeout(_searchTimer);
  var dropdown = document.getElementById('search-dropdown');
  if (!q || q.length < 2) {
    if (dropdown) dropdown.style.display = 'none';
    return;
  }
  _searchTimer = setTimeout(function () {
    var ql = q.toLowerCase();
    var results = [];

    getData(KEYS.mieter, []).forEach(function (m) {
      if ((m.name || '').toLowerCase().indexOf(ql) >= 0 || (m.wn || '').toLowerCase().indexOf(ql) >= 0)
        results.push({ ico: '👥', label: (m.name || '') + ' – ' + (m.wn || ''), url: 'mieter.html' });
    });
    getData(KEYS.tickets, []).forEach(function (t) {
      if ((t.pb || '').toLowerCase().indexOf(ql) >= 0)
        results.push({ ico: '🎫', label: (t.pb || '').substring(0, 40) + ' – ' + (t.wn || ''), url: 'tickets.html' });
    });
    getData(KEYS.kontakte, []).forEach(function (k) {
      var n = ((k.vn || '') + ' ' + (k.nn || '')).trim();
      if (n.toLowerCase().indexOf(ql) >= 0 || (k.firma || '').toLowerCase().indexOf(ql) >= 0)
        results.push({ ico: '📇', label: n + (k.firma ? ' – ' + k.firma : ''), url: 'kontakte.html' });
    });
    getData(KEYS.projekte, []).forEach(function (p) {
      if ((p.name || '').toLowerCase().indexOf(ql) >= 0)
        results.push({ ico: '🏗️', label: p.name + ' – ' + (p.adr || ''), url: 'projekte.html' });
    });
    getData(KEYS.handwerker, []).forEach(function (h) {
      var n = ((h.vn || '') + ' ' + (h.nn || '')).trim();
      if (n.toLowerCase().indexOf(ql) >= 0 || (h.firma || '').toLowerCase().indexOf(ql) >= 0)
        results.push({ ico: '🔧', label: n + (h.firma ? ' – ' + h.firma : ''), url: 'handwerker.html' });
    });
    getData(KEYS.interessenten, []).forEach(function (i) {
      var n = ((i.vn || '') + ' ' + (i.nn || '')).trim();
      if (n.toLowerCase().indexOf(ql) >= 0)
        results.push({ ico: '🔍', label: n + ' – Interessent', url: 'interessenten.html' });
    });

    results = results.slice(0, 8);
    if (!dropdown) return;
    if (results.length === 0) {
      dropdown.innerHTML = '<div style="padding:12px 14px;font-size:13px;color:#94a3b8;">Keine Ergebnisse für „' + q + '"</div>';
    } else {
      dropdown.innerHTML = results.map(function (r) {
        return '<a href="' + r.url + '" style="display:flex;align-items:center;gap:10px;padding:10px 14px;text-decoration:none;color:#1e293b;border-bottom:1px solid #f1f5f9;font-size:13px;transition:background 0.1s;" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'white\'">'
          + '<span style="font-size:15px;">' + r.ico + '</span>'
          + '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + r.label + '</span>'
          + '</a>';
      }).join('');
    }
    dropdown.style.display = 'block';
  }, 300);
}

// ─── SIDEBAR HTML ─────────────────────────────────────────
function getSidebarHTML(activePage) {
  var user = getUser();
  var role = user.role;
  var mieter     = getData(KEYS.mieter, []);
  var tickets    = getData(KEYS.tickets, []);
  var aufgaben   = getData(KEYS.aufgaben, []);
  var followups  = getData(KEYS.followups, []);
  var projekte   = getData(KEYS.projekte, []);
  var heute      = today();

  var offeneMiete    = mieter.filter(function (m) { return m.status === 'offen'; }).length;
  var offeneTickets  = tickets.filter(function (t) { return t.status === 'Offen'; }).length;
  var offeneAufgaben = aufgaben.filter(function (a) { return !a.done; }).length;
  var fuHeute        = followups.filter(function (f) { return !f.done && f.dat === heute; }).length;
  var aktiveProjekte = projekte.filter(function (p) { return p.status === 'In Bearbeitung'; }).length;

  // Berechtigungs-Rollen
  var VERWALTER = ['verwalter', 'admin', 'superadmin'];
  var MITARBEITER = ['mitarbeiter', 'verwalter', 'admin', 'superadmin'];

  function canSee(roles) {
    if (!roles) return true;
    return role === 'superadmin' || role === 'admin' || roles.indexOf(role) >= 0;
  }

  function navItem(href, ico, label, badge, badgeColor, isActive, roles) {
    if (!canSee(roles)) return '';
    var bdg = badge > 0 ? '<span style="background:' + (badgeColor || '#dc2626') + ';color:white;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px;margin-left:auto;">' + badge + '</span>' : '';
    var activeStyle = isActive ? 'background:rgba(37,99,235,0.18);color:#60a5fa;' : 'color:#94a3b8;';
    return '<a href="' + href + '" style="display:flex;align-items:center;gap:9px;padding:9px 16px;text-decoration:none;font-size:13px;font-weight:500;' + activeStyle + 'transition:all 0.15s;" '
      + 'onmouseover="this.style.background=\'#1e293b\';this.style.color=\'white\';" '
      + 'onmouseout="this.style.background=\'' + (isActive ? 'rgba(37,99,235,0.18)' : 'none') + '\';this.style.color=\'' + (isActive ? '#60a5fa' : '#94a3b8') + '\';">'
      + '<span style="font-size:15px;width:20px;text-align:center;">' + ico + '</span>'
      + '<span style="flex:1;">' + label + '</span>'
      + bdg
      + '</a>';
  }

  function navSection(label) {
    return '<div style="padding:10px 16px 4px;font-size:10px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:0.8px;margin-top:4px;">' + label + '</div>';
  }

  return '<div style="width:240px;background:#0f172a;display:flex;flex-direction:column;height:100vh;overflow-y:auto;flex-shrink:0;">'
    // Logo
    + '<a href="app.html" style="padding:18px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #1e293b;text-decoration:none;flex-shrink:0;">'
    + '<div style="width:34px;height:34px;background:#2563eb;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🏢</div>'
    + '<div style="font-size:16px;font-weight:700;color:white;">Immo<span style="color:#60a5fa;">Nova</span></div>'
    + '</a>'
    // Search mit Dropdown
    + '<div style="padding:10px 12px 6px;position:relative;">'
    + '<input type="text" id="sidebar-search" placeholder="🔍 Suchen..." oninput="doSearch(this.value)" '
    + 'onblur="setTimeout(function(){var d=document.getElementById(\'search-dropdown\');if(d)d.style.display=\'none\';},200)" '
    + 'style="width:100%;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:7px 10px;color:white;font-size:12px;font-family:inherit;outline:none;box-sizing:border-box;">'
    + '<div id="search-dropdown" style="display:none;position:absolute;top:calc(100% - 4px);left:12px;right:12px;background:white;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.18);z-index:9999;max-height:320px;overflow-y:auto;border:1px solid #e2e8f0;"></div>'
    + '</div>'
    // Navigation
    + '<nav style="flex:1;padding:8px 0;overflow-y:auto;">'
    + navSection('Hauptmenü')
    + navItem('app.html',            '🏠', 'Dashboard',          0,            '',        activePage === 'dashboard')
    + navItem('objekte.html',        '🏢', 'Objekte & Gebäude',  0,            '',        activePage === 'objekte')
    + navItem('projekte.html',       '🏗️', 'Projekte',           aktiveProjekte, '#2563eb', activePage === 'projekte')
    + navItem('mieter.html',         '👥', 'Mieter',             offeneMiete,  '#dc2626', activePage === 'mieter')
    + navItem('tickets.html',        '🎫', 'Tickets & Schäden',  offeneTickets,'#dc2626', activePage === 'tickets')
    + navItem('handwerker.html',     '🔧', 'Handwerker',         0,            '',        activePage === 'handwerker')
    + navItem('nachrichten.html',    '💬', 'Nachrichten',        0,            '#2563eb', activePage === 'nachrichten')
    + navItem('zahlungen.html',      '💳', 'Zahlungen & Bank',   0,            '',        activePage === 'zahlungen',      VERWALTER)
    + navSection('CRM & Vermietung')
    + navItem('crm.html',            '🎯', 'Follow-Up CRM',      fuHeute,      '#dc2626', activePage === 'crm')
    + navItem('interessenten.html',  '🔍', 'Interessenten',      0,            '',        activePage === 'interessenten')
    + navItem('mitteilungen.html',   '📢', 'Haus-Mitteilungen',  0,            '',        activePage === 'mitteilungen')
    + navSection('Verwaltung')
    + navItem('kalender.html',       '📅', 'Terminkalender',     0,            '#16a34a', activePage === 'kalender')
    + navItem('kontakte.html',       '📇', 'Kontakte',           0,            '',        activePage === 'kontakte')
    + navItem('aufgaben.html',       '✅', 'Aufgaben',           offeneAufgaben,'#dc2626',activePage === 'aufgaben')
    + navItem('reinigung.html',      '🧹', 'Reinigungsplan',     0,            '',        activePage === 'reinigung')
    + navItem('zaehler.html',        '🔢', 'Zählerstände',       0,            '',        activePage === 'zaehler')
    + navItem('dokumente.html',      '📄', 'Dokumente',          0,            '',        activePage === 'dokumente')
    + navItem('versicherungen.html', '🛡️', 'Versicherungen',     0,            '',        activePage === 'versicherungen')
    + navItem('berichte.html',       '📊', 'Berichte & Analyse', 0,            '',        activePage === 'berichte',       VERWALTER)
    + navSection('System')
    + navItem('einstellungen.html',  '⚙️', 'Einstellungen',      0,            '',        activePage === 'einstellungen')
    + (canSee(['superadmin']) ? navItem('admin.html', '👑', 'Admin-Konsole', 0, '#fbbf24', activePage === 'admin') : '')
    + '</nav>'
    // User Footer
    + '<div style="padding:12px;border-top:1px solid #1e293b;flex-shrink:0;">'
    + '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#1e293b;border-radius:10px;">'
    + '<div style="width:32px;height:32px;background:#2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;flex-shrink:0;">' + (user.name[0] || '?').toUpperCase() + '</div>'
    + '<div style="flex:1;min-width:0;">'
    + '<div style="font-size:12px;font-weight:600;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + user.name + '</div>'
    + '<div style="font-size:10px;color:#64748b;">' + (role === 'superadmin' ? '👑 Superadmin' : role === 'admin' ? '⚙️ Admin' : role === 'mitarbeiter' ? '👤 Mitarbeiter' : '🏢 Verwalter') + '</div>'
    + '</div>'
    + '<button onclick="doLogout()" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:16px;padding:2px;" title="Abmelden">🚪</button>'
    + '</div></div>'
    + '</div>';
}

// ─── TOPBAR HTML ──────────────────────────────────────────
function getTopbarHTML(title, actionBtn) {
  var trialBanner = getTrialBanner();
  return trialBanner
    + '<div style="background:white;border-bottom:1px solid #e2e8f0;padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;box-shadow:0 1px 3px rgba(0,0,0,0.06);">'
    + '<div style="font-size:16px;font-weight:700;color:#0f172a;">' + title + '</div>'
    + '<div style="display:flex;align-items:center;gap:10px;">'
    + (actionBtn || '')
    + '<button onclick="toggleNotifPanel()" style="width:36px;height:36px;border-radius:9px;border:1px solid #e2e8f0;background:white;cursor:pointer;font-size:16px;position:relative;" id="notif-btn">🔔<div id="notif-dot" style="display:none;position:absolute;top:6px;right:6px;width:8px;height:8px;background:#dc2626;border-radius:50%;border:2px solid white;"></div></button>'
    + '</div></div>';
}

// ─── LAYOUT RENDERER ──────────────────────────────────────
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
    + (modals || '');
  renderNotifList();
}

// ─── CARD / BADGE HELPERS ─────────────────────────────────
function card(content, style) {
  return '<div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);' + (style || '') + '">' + content + '</div>';
}

function badge(txt, color) {
  var colors = {
    green:  'background:#f0fdf4;color:#16a34a;',
    red:    'background:#fef2f2;color:#dc2626;',
    yellow: 'background:#fffbeb;color:#d97706;',
    blue:   'background:#eff6ff;color:#2563eb;',
    gray:   'background:#f1f5f9;color:#64748b;',
    purple: 'background:#faf5ff;color:#7c3aed;'
  };
  return '<span style="display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;' + (colors[color] || colors.gray) + '">' + txt + '</span>';
}

// ─── MODAL HELPERS ────────────────────────────────────────
function showModal(id) { var m = document.getElementById(id); if (m) m.style.display = 'flex'; }
function hideModal(id) { var m = document.getElementById(id); if (m) m.style.display = 'none'; }

function modalHTML(id, title, content) {
  return '<div id="' + id + '" onclick="if(event.target===this)this.style.display=\'none\'" '
    + 'style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);align-items:center;justify-content:center;z-index:1000;padding:20px;backdrop-filter:blur(4px);">'
    + '<div style="background:white;border-radius:16px;padding:28px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);animation:fadeIn 0.15s ease;">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">'
    + '<div style="font-size:16px;font-weight:700;color:#0f172a;">' + title + '</div>'
    + '<button onclick="hideModal(\'' + id + '\')" style="background:none;border:none;font-size:20px;cursor:pointer;color:#94a3b8;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;">✕</button>'
    + '</div>'
    + content
    + '</div></div>';
}

// ─── FORM HELPERS ─────────────────────────────────────────
function formGroup(label, inputHtml, extraStyle) {
  return '<div style="margin-bottom:14px;' + (extraStyle || '') + '">'
    + '<label style="display:block;font-size:11px;font-weight:700;color:#64748b;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.4px;">' + label + '</label>'
    + inputHtml
    + '</div>';
}

var inputStyle = 'width:100%;padding:10px 13px;border:1.5px solid #e2e8f0;border-radius:9px;font-size:14px;font-family:inherit;color:#0f172a;background:white;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor=\'#2563eb\'" onblur="this.style.borderColor=\'#e2e8f0\'';

// ─── NOTIF PANEL ──────────────────────────────────────────
function getNotifPanelHTML() {
  return '<div id="notif-panel" style="display:none;position:fixed;top:56px;right:0;width:320px;background:white;border-left:1px solid #e2e8f0;height:calc(100vh - 56px);flex-direction:column;z-index:100;box-shadow:-4px 0 20px rgba(0,0,0,0.08);">'
    + '<div style="padding:16px 20px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;">'
    + '<div style="font-size:14px;font-weight:700;">🔔 Benachrichtigungen</div>'
    + '<button onclick="clearAllNotifs()" style="background:none;border:1px solid #e2e8f0;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;font-family:inherit;">Alle gelesen</button>'
    + '</div>'
    + '<div id="notif-list" style="overflow-y:auto;flex:1;"></div>'
    + '</div>';
}

function toggleNotifPanel() {
  var p = document.getElementById('notif-panel');
  if (!p) return;
  var isOpen = p.style.display === 'flex';
  p.style.display = isOpen ? 'none' : 'flex';
  if (!isOpen) renderNotifList();
}

function renderNotifList() {
  var list = document.getElementById('notif-list');
  if (!list) return;
  var notifs = getData(KEYS.notifs, []);
  var dot = document.getElementById('notif-dot');
  if (dot) dot.style.display = notifs.some(function (n) { return n.unread; }) ? 'block' : 'none';
  list.innerHTML = notifs.length
    ? notifs.slice(0, 20).map(function (n, i) {
      return '<div onclick="markNotif(' + i + ')" style="padding:14px 20px;border-bottom:1px solid #f8fafc;cursor:pointer;background:' + (n.unread ? '#eff6ff' : 'white') + ';display:flex;gap:12px;align-items:flex-start;">'
        + '<div style="font-size:20px;">' + n.ico + '</div>'
        + '<div><div style="font-size:13px;font-weight:500;margin-bottom:2px;">' + n.txt + '</div>'
        + '<div style="font-size:11px;color:#94a3b8;">' + n.time + '</div></div></div>';
    }).join('')
    : '<div style="padding:20px;text-align:center;color:#94a3b8;font-size:13px;">Keine Benachrichtigungen</div>';
}

function markNotif(i) {
  var notifs = getData(KEYS.notifs, []);
  if (notifs[i]) { notifs[i].unread = false; setData(KEYS.notifs, notifs); renderNotifList(); }
}

function clearAllNotifs() {
  var notifs = getData(KEYS.notifs, []);
  notifs.forEach(function (n) { n.unread = false; });
  setData(KEYS.notifs, notifs);
  renderNotifList();
}

// ─── EMPTY STATE HELPER ───────────────────────────────────
function emptyState(icon, title, desc, btnLabel, btnOnclick) {
  return '<div style="text-align:center;padding:60px 20px;">'
    + '<div style="font-size:52px;margin-bottom:14px;">' + icon + '</div>'
    + '<div style="font-size:17px;font-weight:700;color:#1e293b;margin-bottom:8px;">' + title + '</div>'
    + '<div style="font-size:14px;color:#94a3b8;margin-bottom:24px;max-width:340px;margin-left:auto;margin-right:auto;line-height:1.6;">' + desc + '</div>'
    + (btnLabel ? '<button onclick="' + btnOnclick + '" style="background:#2563eb;color:white;border:none;border-radius:9px;padding:11px 22px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">' + btnLabel + '</button>' : '')
    + '</div>';
}

// ─── PAGE LAYOUT (backward compat alias) ──────────────────
// renderLayout already defined above

// CSS Animation (injiziert einmalig)
(function injectCSS() {
  if (document.getElementById('immonova-css')) return;
  var s = document.createElement('style');
  s.id = 'immonova-css';
  s.textContent = '@keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}} * { box-sizing: border-box; }';
  document.head.appendChild(s);
})();

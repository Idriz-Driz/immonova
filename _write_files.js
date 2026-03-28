// Script to write the 3 HTML files for ImmoNova
const fs = require('fs');
const path = require('path');
const dir = __dirname;

// ==================== APP.HTML ====================
const appHTML = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard \u2013 ImmoNova</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"><\/script>
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"><\/script>
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"><\/script>
  <script src="shared.js"><\/script>
</head>
<body style="margin:0;padding:0;">
<script>
if(!checkAuth()) { window.location.href='login.html'; }
var user = getUser();

function getGreeting() {
  var h = new Date().getHours();
  if(h < 12) return 'Guten Morgen';
  if(h < 18) return 'Guten Tag';
  return 'Guten Abend';
}
function getDatumDE() {
  return new Date().toLocaleDateString('de-DE', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
}
function kpiCard(icon, label, value, sub, borderColor, warn) {
  return '<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;padding:20px 22px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-left:4px solid '+borderColor+';position:relative;overflow:hidden;">'
    + '<div style="position:absolute;right:16px;top:14px;font-size:36px;opacity:0.09;line-height:1;">'+icon+'</div>'
    + '<div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">'+label+'</div>'
    + '<div style="display:flex;align-items:baseline;gap:8px;">'
    + '<div style="font-size:28px;font-weight:700;color:#0f172a;line-height:1;">'+value+'</div>'
    + (warn ? '<span style="background:#fef2f2;color:#dc2626;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;">!</span>' : '')
    + '</div>'
    + '<div style="font-size:12px;color:#94a3b8;margin-top:6px;">'+sub+'</div>'
    + '</div>';
}
function avatarCircle(name, size) {
  var s = size || 34;
  var initials = (name||'?').split(' ').map(function(w){return w[0]||'';}).join('').substring(0,2).toUpperCase();
  var cols = ['#2563eb','#16a34a','#9333ea','#d97706','#0891b2','#dc2626'];
  var ci = name ? name.charCodeAt(0) % cols.length : 0;
  return '<div style="width:'+s+'px;height:'+s+'px;border-radius:50%;background:'+cols[ci]+';display:inline-flex;align-items:center;justify-content:center;font-size:'+(s>30?13:11)+'px;font-weight:700;color:white;flex-shrink:0;">'+initials+'</div>';
}
function terminIcon(kat) {
  var k = (kat||'').toLowerCase();
  if(k.includes('wartung')||k.includes('handwerk')) return '\uD83D\uDD27';
  if(k.includes('\u00fcbergabe')||k.includes('schl\u00fcssel')) return '\uD83D\uDD11';
  if(k.includes('zahlung')||k.includes('miete')) return '\uD83D\uDCB3';
  if(k.includes('besichtigung')) return '\uD83D\uDC40';
  return '\uD83D\uDCC5';
}
function render() {
  var mieter = getData(KEYS.mieter, DEFAULT_MIETER);
  var tickets = getData(KEYS.tickets, []);
  var aufgaben = getData(KEYS.aufgaben, []);
  var followups = getData(KEYS.followups, []);
  var termine = getData(KEYS.termine, []);
  var notifs = getData(KEYS.notifs, []);
  var heute = today();
  var offeneMiete = mieter.filter(function(m){return m.status==='offen';}).length;
  var offeneTickets = tickets.filter(function(t){return t.status==='Offen';}).length;
  var gesamtBezahlt = mieter.reduce(function(s,m){return s+(m.status==='bezahlt'?(m.miete||0):0);},0);
  var gesamtMiete = mieter.reduce(function(s,m){return s+(m.miete||0);},0);
  var fuHeute = followups.filter(function(f){return !f.done && f.dat===heute;});
  var naechsteTermine = termine.filter(function(t){return (t.datum||'')>=heute;}).sort(function(a,b){return a.datum>b.datum?1:-1;}).slice(0,4);
  var offeneAufgaben = aufgaben.filter(function(a){return !a.done;}).slice(0,6);
  var neuesteTickets = tickets.slice().sort(function(a,b){return (b.id||0)-(a.id||0);}).slice(0,4);

  // WARN BANNERS
  var banners = '';
  if(offeneMiete > 0) {
    banners += '<div style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:11px 18px;display:flex;align-items:center;gap:12px;margin-bottom:10px;">'
      + '<span style="font-size:20px;">\u26A0\uFE0F</span>'
      + '<span style="font-size:13px;font-weight:600;color:#92400e;flex:1;"><strong>'+offeneMiete+' offene Miete(n)</strong> \u2013 Bitte Zahlungsstatus pr\u00FCfen und ggf. Mahnung versenden.</span>'
      + '<a href="mieter.html" style="font-size:12px;color:#92400e;font-weight:700;text-decoration:none;background:rgba(0,0,0,0.07);padding:5px 12px;border-radius:8px;white-space:nowrap;">Jetzt ansehen \u2192</a>'
      + '</div>';
  }
  if(offeneTickets > 2) {
    banners += '<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:11px 18px;display:flex;align-items:center;gap:12px;margin-bottom:10px;">'
      + '<span style="font-size:20px;">\uD83C\uDFAB</span>'
      + '<span style="font-size:13px;font-weight:600;color:#991b1b;flex:1;"><strong>'+offeneTickets+' offene Tickets</strong> \u2013 Dringende Schadensmeldungen ben\u00F6tigen Aufmerksamkeit.</span>'
      + '<a href="tickets.html" style="font-size:12px;color:#991b1b;font-weight:700;text-decoration:none;background:rgba(0,0,0,0.07);padding:5px 12px;border-radius:8px;white-space:nowrap;">Jetzt ansehen \u2192</a>'
      + '</div>';
  }
  if(fuHeute.length > 0) {
    banners += '<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:10px;padding:11px 18px;display:flex;align-items:center;gap:12px;margin-bottom:10px;">'
      + '<span style="font-size:20px;">\uD83C\uDFAF</span>'
      + '<span style="font-size:13px;font-weight:600;color:#1e40af;flex:1;"><strong>'+fuHeute.length+' Follow-Up(s) heute f\u00E4llig</strong> \u2013 Kontakte warten auf R\u00FCckmeldung.</span>'
      + '<a href="crm.html" style="font-size:12px;color:#1e40af;font-weight:700;text-decoration:none;background:rgba(0,0,0,0.07);padding:5px 12px;border-radius:8px;white-space:nowrap;">Zum CRM \u2192</a>'
      + '</div>';
  }

  // QUICK ACTIONS
  var quickItems = [
    {ico:'\uD83D\uDC65',lbl:'Mieter hinzuf\u00FCgen',href:'mieter.html'},
    {ico:'\uD83C\uDFAB',lbl:'Ticket erstellen',href:'tickets.html'},
    {ico:'\uD83D\uDCC5',lbl:'Termin anlegen',href:'kalender.html'},
    {ico:'\uD83C\uDFD7\uFE0F',lbl:'Projekt',href:'projekte.html'},
    {ico:'\uD83C\uDFAF',lbl:'Follow-Up',href:'crm.html'}
  ];
  var quickActions = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;">'
    + quickItems.map(function(qi){
        return '<a href="'+qi.href+'" style="display:inline-flex;align-items:center;gap:7px;padding:9px 16px;background:white;border:1.5px solid #e2e8f0;border-radius:10px;font-size:13px;font-weight:600;color:#0f172a;text-decoration:none;box-shadow:0 1px 3px rgba(0,0,0,0.04);" onmouseover="this.style.borderColor=\'#2563eb\';this.style.color=\'#2563eb\';" onmouseout="this.style.borderColor=\'#e2e8f0\';this.style.color=\'#0f172a\';">'+qi.ico+' '+qi.lbl+'</a>';
      }).join('')
    + '</div>';

  // KPI CARDS
  var kpiGrid = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:22px;">'
    + kpiCard('\uD83D\uDCB6','Monatl. Einnahmen','\u20AC'+fmt(gesamtBezahlt),'<span style="color:#16a34a;font-weight:600;">\u2191</span> von \u20AC'+fmt(gesamtMiete)+' gesamt','#2563eb',false)
    + kpiCard('\uD83C\uDFE0','Auslastung',mieter.length>0?'100%':'0%',mieter.length+' Mieter aktiv','#16a34a',false)
    + kpiCard('\uD83C\uDFAB','Offene Tickets',offeneTickets,'Schadensmeldungen','#dc2626',offeneTickets>0)
    + kpiCard('\uD83D\uDCB3','Offene Mieten',offeneMiete,'Zahlungen ausstehend','#d97706',offeneMiete>0)
    + '</div>';

  // WOHNUNGSÜBERSICHT
  var mietListe = '<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">'
    + '<div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">'
    + '<div style="font-size:14px;font-weight:700;">\uD83C\uDFD8 Wohnungs\u00FCbersicht</div>'
    + '<a href="mieter.html" style="font-size:12px;color:#2563eb;text-decoration:none;font-weight:600;">Alle ansehen \u2192</a>'
    + '</div>'
    + (mieter.length === 0 ? '<div style="padding:28px;text-align:center;color:#94a3b8;font-size:13px;">Keine Mieter vorhanden</div>' :
      mieter.map(function(m){
        var pct = gesamtMiete > 0 ? Math.round((m.miete||0)/gesamtMiete*100) : 0;
        var bezahlt = m.status === 'bezahlt';
        return '<div style="padding:13px 20px;border-bottom:1px solid #f8fafc;display:flex;align-items:center;gap:12px;">'
          + avatarCircle(m.name, 36)
          + '<div style="flex:1;min-width:0;">'
          + '<div style="font-size:13px;font-weight:600;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(m.name||'\u2013')+'</div>'
          + '<div style="font-size:11px;color:#94a3b8;">'+(m.wn||'\u2013')+' \u00B7 \u20AC'+fmt(m.miete||0)+'/Monat</div>'
          + '</div>'
          + '<div style="min-width:110px;">'
          + '<div style="height:5px;background:#f1f5f9;border-radius:99px;overflow:hidden;margin-bottom:3px;">'
          + '<div style="height:100%;width:'+pct+'%;background:'+(bezahlt?'#2563eb':'#dc2626')+';border-radius:99px;"></div>'
          + '</div>'
          + '<div style="font-size:10px;color:#94a3b8;">'+pct+'% des Gesamtertrags</div>'
          + '</div>'
          + '<span style="display:inline-flex;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:'+(bezahlt?'#f0fdf4':'#fef2f2')+';color:'+(bezahlt?'#16a34a':'#dc2626')+';white-space:nowrap;flex-shrink:0;">'+(bezahlt?'\u2713 Bezahlt':'\u2717 Offen')+'</span>'
          + '</div>';
      }).join(''))
    + '</div>';

  // FOLLOW-UPS HEUTE
  var fuBlock = '<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">'
    + '<div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">'
    + '<div style="font-size:14px;font-weight:700;">\uD83D\uDD25 Follow-Ups heute</div>'
    + '<a href="crm.html" style="font-size:12px;color:#2563eb;text-decoration:none;font-weight:600;">CRM \u2192</a>'
    + '</div>'
    + (fuHeute.length === 0
      ? '<div style="padding:22px 20px;text-align:center;color:#94a3b8;font-size:13px;">\u2705 Keine Follow-Ups heute f\u00E4llig</div>'
      : fuHeute.slice(0,4).map(function(f){
          var waLink = f.tel ? 'https://wa.me/'+f.tel.replace(/\\D/g,'') : null;
          return '<div style="padding:12px 20px;border-bottom:1px solid #f8fafc;display:flex;align-items:flex-start;gap:10px;">'
            + '<div style="font-size:18px;margin-top:1px;">\uD83D\uDD25</div>'
            + '<div style="flex:1;min-width:0;">'
            + '<div style="font-size:13px;font-weight:600;">'+(f.name||'Kontakt')+'</div>'
            + '<div style="font-size:12px;color:#64748b;margin-top:2px;">'+(f.notiz||f.txt||'Follow-Up f\u00E4llig')+'</div>'
            + '</div>'
            + (waLink ? '<a href="'+waLink+'" target="_blank" style="display:inline-flex;align-items:center;gap:4px;background:#16a34a;color:white;border-radius:7px;padding:5px 10px;font-size:11px;font-weight:700;text-decoration:none;flex-shrink:0;">\uD83D\uDCF2 WA</a>' : '')
            + '</div>';
        }).join('')
      )
    + '</div>';

  // NÄCHSTE TERMINE
  var termineBlock = '<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);margin-top:14px;">'
    + '<div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">'
    + '<div style="font-size:14px;font-weight:700;">\uD83D\uDCC5 N\u00E4chste Termine</div>'
    + '<a href="kalender.html" style="font-size:12px;color:#2563eb;text-decoration:none;font-weight:600;">Kalender \u2192</a>'
    + '</div>'
    + (naechsteTermine.length === 0
      ? '<div style="padding:22px 20px;text-align:center;color:#94a3b8;font-size:13px;">Keine Termine vorhanden</div>'
      : naechsteTermine.map(function(t){
          return '<div style="padding:11px 20px;border-bottom:1px solid #f8fafc;display:flex;align-items:center;gap:11px;">'
            + '<div style="width:34px;height:34px;background:#eff6ff;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;">'+terminIcon(t.kat||t.kategorie||'')+'</div>'
            + '<div style="flex:1;min-width:0;">'
            + '<div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(t.titel||t.title||'Termin')+'</div>'
            + '<div style="font-size:11px;color:#94a3b8;margin-top:2px;">'+(t.kat||t.kategorie||'Allgemein')+'</div>'
            + '</div>'
            + '<div style="font-size:12px;font-weight:600;color:#2563eb;white-space:nowrap;">'+fmtDate(t.datum)+'</div>'
            + '</div>';
        }).join('')
      )
    + '</div>';

  // AKTIVITÄTS-FEED
  var aktivFeed = '<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">'
    + '<div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;">'
    + '<div style="font-size:14px;font-weight:700;">\uD83D\uDCCB Aktivit\u00E4ts-Feed</div>'
    + '</div>'
    + (notifs.length === 0
      ? '<div style="padding:28px 20px;text-align:center;color:#94a3b8;font-size:13px;">Noch keine Aktivit\u00E4ten vorhanden</div>'
      : notifs.slice(0,8).map(function(n){
          return '<div style="padding:11px 20px;border-bottom:1px solid #f8fafc;display:flex;align-items:flex-start;gap:11px;">'
            + '<div style="width:32px;height:32px;background:#f8fafc;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;">'+n.ico+'</div>'
            + '<div style="flex:1;min-width:0;">'
            + '<div style="font-size:13px;color:#0f172a;">'+n.txt+'</div>'
            + '<div style="font-size:11px;color:#94a3b8;margin-top:2px;">'+n.time+'</div>'
            + '</div>'
            + (n.unread ? '<div style="width:8px;height:8px;background:#2563eb;border-radius:50%;flex-shrink:0;margin-top:5px;"></div>' : '')
            + '</div>';
        }).join('')
      )
    + '</div>';

  // NEUESTE TICKETS
  var pColors = {'Hoch':'background:#fef2f2;color:#dc2626;','Mittel':'background:#fffbeb;color:#d97706;','Niedrig':'background:#f0fdf4;color:#16a34a;'};
  var stColors = {'Offen':'background:#fef2f2;color:#dc2626;','In Bearbeitung':'background:#fffbeb;color:#d97706;','Erledigt':'background:#f0fdf4;color:#16a34a;'};
  var ticketBlock = '<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">'
    + '<div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">'
    + '<div style="font-size:14px;font-weight:700;">\uD83C\uDFAB Neueste Tickets</div>'
    + '<a href="tickets.html" style="font-size:12px;color:#2563eb;text-decoration:none;font-weight:600;">Alle \u2192</a>'
    + '</div>'
    + (neuesteTickets.length === 0
      ? '<div style="padding:28px 20px;text-align:center;color:#94a3b8;font-size:13px;">Keine Tickets vorhanden</div>'
      : neuesteTickets.map(function(t){
          var pb = pColors[t.prio] || 'background:#f1f5f9;color:#64748b;';
          var sb = stColors[t.status] || 'background:#f1f5f9;color:#64748b;';
          var desc = (t.beschreibung||t.desc||'\u2013');
          if(desc.length > 50) desc = desc.substring(0,50)+'\u2026';
          return '<div style="padding:11px 20px;border-bottom:1px solid #f8fafc;display:flex;align-items:center;gap:8px;">'
            + '<span style="display:inline-flex;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700;'+pb+';white-space:nowrap;flex-shrink:0;">'+(t.prio||'\u2013')+'</span>'
            + '<div style="flex:1;min-width:0;">'
            + '<div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(t.wohnung||t.wn||'\u2013')+'</div>'
            + '<div style="font-size:11px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+desc+'</div>'
            + '</div>'
            + '<span style="display:inline-flex;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700;'+sb+';white-space:nowrap;flex-shrink:0;">'+(t.status||'\u2013')+'</span>'
            + '</div>';
        }).join('')
      )
    + '</div>';

  // OFFENE AUFGABEN
  var aufgabenBlock = '<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);margin-top:14px;">'
    + '<div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">'
    + '<div style="font-size:14px;font-weight:700;">\u2705 Offene Aufgaben</div>'
    + '<a href="aufgaben.html" style="font-size:12px;color:#2563eb;text-decoration:none;font-weight:600;">Alle \u2192</a>'
    + '</div>'
    + (offeneAufgaben.length === 0
      ? '<div style="padding:22px 20px;text-align:center;color:#94a3b8;font-size:13px;">\u2705 Alle Aufgaben erledigt!</div>'
      : offeneAufgaben.map(function(a, idx){
          var prioC = a.prio==='Hoch'?'#dc2626':(a.prio==='Mittel'?'#d97706':'#64748b');
          var prioBg = a.prio==='Hoch'?'#fef2f2':(a.prio==='Mittel'?'#fffbeb':'#f1f5f9');
          return '<div style="padding:10px 20px;border-bottom:1px solid #f8fafc;display:flex;align-items:center;gap:11px;">'
            + '<div onclick="toggleAufgabe('+idx+')" style="width:17px;height:17px;border-radius:50%;border:2px solid #cbd5e1;cursor:pointer;flex-shrink:0;transition:all 0.15s;" onmouseover="this.style.borderColor=\'#2563eb\';this.style.background=\'#eff6ff\';" onmouseout="this.style.borderColor=\'#cbd5e1\';this.style.background=\'transparent\';"></div>'
            + '<div style="flex:1;font-size:13px;color:#0f172a;">'+(a.titel||a.txt||'Aufgabe')+'</div>'
            + (a.prio ? '<span style="display:inline-flex;padding:2px 7px;border-radius:20px;font-size:11px;font-weight:700;background:'+prioBg+';color:'+prioC+';white-space:nowrap;flex-shrink:0;">'+a.prio+'</span>' : '')
            + '</div>';
        }).join('')
      )
    + '</div>';

  var mainHTML = ''
    + (banners ? '<div style="margin-bottom:18px;">'+banners+'</div>' : '')
    + '<div style="margin-bottom:20px;">'
    + '<div style="font-size:22px;font-weight:700;color:#0f172a;line-height:1.2;">'+getGreeting()+', '+user.name+'! \uD83D\uDC4B</div>'
    + '<div style="font-size:13px;color:#94a3b8;margin-top:5px;">'+getDatumDE()+'</div>'
    + '</div>'
    + quickActions
    + kpiGrid
    + '<div style="display:grid;grid-template-columns:3fr 2fr;gap:18px;margin-bottom:18px;">'
    + mietListe
    + '<div>'+fuBlock+termineBlock+'</div>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">'
    + aktivFeed
    + '<div>'+ticketBlock+aufgabenBlock+'</div>'
    + '</div>';

  renderLayout('dashboard', '\uD83C\uDFE0 Dashboard', '', mainHTML, '');
}

function toggleAufgabe(visIdx) {
  var aufgaben = getData(KEYS.aufgaben, []);
  var offene = aufgaben.filter(function(a){return !a.done;});
  if(offene[visIdx]) {
    offene[visIdx].done = true;
    setData(KEYS.aufgaben, aufgaben);
    addNotif('\u2705','Aufgabe erledigt: '+(offene[visIdx].titel||offene[visIdx].txt||''));
    syncToFirebase(user.uid);
    render();
  }
}

initFirebase();
loadFromFirebase(user.uid, render);
<\/script>
</body>
</html>`;

// ==================== MIETER.HTML ====================
const mieterHTML = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mieter \u2013 ImmoNova</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"><\/script>
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"><\/script>
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"><\/script>
  <script src="shared.js"><\/script>
</head>
<body style="margin:0;padding:0;">
<script>
if(!checkAuth()) { window.location.href='login.html'; }
var user = getUser();
var activeTab = 'alle';
var editIdx = -1;

var MONTHS_DE = ['Jan','Feb','M\u00E4r','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
function lastSixMonths() {
  var now = new Date(); var result = [];
  for(var i=5;i>=0;i--) { var d=new Date(now.getFullYear(),now.getMonth()-i,1); result.push({y:d.getFullYear(),m:d.getMonth(),lbl:MONTHS_DE[d.getMonth()]}); }
  return result;
}

function avatarCircle(name, size) {
  var s = size||34;
  var initials = (name||'?').split(' ').map(function(w){return w[0]||'';}).join('').substring(0,2).toUpperCase();
  var cols = ['#2563eb','#16a34a','#9333ea','#d97706','#0891b2','#dc2626'];
  var ci = name ? name.charCodeAt(0) % cols.length : 0;
  return '<div style="width:'+s+'px;height:'+s+'px;border-radius:50%;background:'+cols[ci]+';display:inline-flex;align-items:center;justify-content:center;font-size:'+(s>30?13:11)+'px;font-weight:700;color:white;flex-shrink:0;">'+initials+'</div>';
}

function scoreBar(sco) {
  var s = sco||0;
  var col = s>=80?'#16a34a':(s>=60?'#d97706':'#dc2626');
  var bg = s>=80?'#f0fdf4':(s>=60?'#fffbeb':'#fef2f2');
  return '<div style="display:flex;align-items:center;gap:6px;">'
    + '<div style="width:48px;height:6px;background:#f1f5f9;border-radius:99px;overflow:hidden;">'
    + '<div style="height:100%;width:'+Math.min(s,100)+'%;background:'+col+';border-radius:99px;"></div>'
    + '</div>'
    + '<span style="font-size:12px;font-weight:700;color:'+col+';">'+s+'</span>'
    + '</div>';
}

function render() {
  var mieter = getData(KEYS.mieter, DEFAULT_MIETER);

  // TABS
  var tabBar = '<div style="display:flex;gap:2px;background:#f1f5f9;border-radius:12px;padding:4px;margin-bottom:22px;width:fit-content;">'
    + ['alle','kautionen','miethistorie'].map(function(t,i){
        var labels = ['Alle Mieter','Kautionen','Miethistorie'];
        var isActive = activeTab === t;
        return '<button onclick="setTab(\''+t+'\')" style="padding:8px 20px;border-radius:9px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;background:'+(isActive?'white':'transparent')+';color:'+(isActive?'#0f172a':'#64748b')+';box-shadow:'+(isActive?'0 1px 4px rgba(0,0,0,0.1)':'none')+';transition:all 0.15s;">'+labels[i]+'</button>';
      }).join('')
    + '</div>';

  var tabContent = '';

  if(activeTab === 'alle') {
    var tableRows = mieter.length === 0
      ? '<tr><td colspan="9" style="padding:40px;text-align:center;color:#94a3b8;">'
        + '<div style="font-size:32px;margin-bottom:10px;">\uD83D\uDC65</div>'
        + '<div style="font-size:15px;font-weight:600;margin-bottom:8px;">Noch keine Mieter</div>'
        + '<button onclick="openModal(-1)" style="background:#2563eb;color:white;border:none;border-radius:9px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">+ Mieter hinzuf\u00FCgen</button>'
        + '</td></tr>'
      : mieter.map(function(m,i){
          var bezahlt = m.status === 'bezahlt';
          var waText = '\u00DCberweisung+f\u00E4llig';
          if(!bezahlt && m.tel) {
            var encodedMsg = encodeURIComponent('Sehr geehrte/r '+m.name+', Ihre Miete f\u00FCr '+m.wn+' in H\u00F6he von \u20AC'+fmt(m.miete||0)+' ist noch offen. Bitte um baldige \u00DCberweisung. Freundliche Gr\u00FC\u00DFe');
            var waUrl = 'https://wa.me/'+m.tel.replace(/\\D/g,'')+' ?text='+encodedMsg;
          }
          return '<tr style="border-bottom:1px solid #f1f5f9;" onmouseover="this.style.background=\'#f8fafc\';" onmouseout="this.style.background=\'white\';">'
            + '<td style="padding:12px 16px;">'
            + '<div style="display:flex;align-items:center;gap:10px;">'
            + avatarCircle(m.name,34)
            + '<div>'
            + '<div style="font-size:13px;font-weight:600;color:#0f172a;">'+(m.name||'\u2013')+'</div>'
            + '<div style="font-size:11px;color:#94a3b8;">'+(m.em||'\u2013')+'</div>'
            + '</div></div></td>'
            + '<td style="padding:12px 16px;font-size:13px;color:#0f172a;font-weight:500;">'+(m.wn||'\u2013')+'</td>'
            + '<td style="padding:12px 16px;font-size:13px;font-weight:600;color:#0f172a;">\u20AC'+fmt(m.miete||0)+'</td>'
            + '<td style="padding:12px 16px;font-size:13px;color:#0f172a;">\u20AC'+fmt(m.kau||0)+'</td>'
            + '<td style="padding:12px 16px;font-size:12px;color:#64748b;">'+(m.tel?'+'+m.tel:'\u2013')+'</td>'
            + '<td style="padding:12px 16px;">'
            + '<button onclick="toggleStatus('+i+')" style="display:inline-flex;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;border:none;cursor:pointer;font-family:inherit;background:'+(bezahlt?'#f0fdf4':'#fef2f2')+';color:'+(bezahlt?'#16a34a':'#dc2626')+';transition:all 0.2s;">'+(bezahlt?'\u2713 Bezahlt':'\u2717 Offen')+'</button>'
            + '</td>'
            + '<td style="padding:12px 16px;">'+scoreBar(m.sco)+'</td>'
            + '<td style="padding:12px 16px;font-size:12px;color:#64748b;">'+fmtDate(m.dat)+'</td>'
            + '<td style="padding:12px 16px;">'
            + '<div style="display:flex;gap:6px;align-items:center;">'
            + (m.tel ? '<a href="https://wa.me/'+m.tel.replace(/\\D/g,'')+(!bezahlt?'?text='+encodeURIComponent('Sehr geehrte/r '+m.name+', Ihre Miete f\u00FCr '+m.wn+' in H\u00F6he von \u20AC'+fmt(m.miete||0)+' ist noch offen. Bitte um baldige \u00DCberweisung. Freundliche Gr\u00FC\u00DFe'):'')+'" target="_blank" title="WhatsApp" style="width:30px;height:30px;border-radius:8px;background:#dcfce7;display:inline-flex;align-items:center;justify-content:center;font-size:15px;text-decoration:none;">\uD83D\uDCF2</a>' : '')
            + '<button onclick="openModal('+i+')" title="Bearbeiten" style="width:30px;height:30px;border-radius:8px;background:#eff6ff;border:none;cursor:pointer;font-size:15px;">\u270F\uFE0F</button>'
            + '<button onclick="deleteMieter('+i+')" title="L\u00F6schen" style="width:30px;height:30px;border-radius:8px;background:#fef2f2;border:none;cursor:pointer;font-size:15px;">\uD83D\uDDD1\uFE0F</button>'
            + '</div>'
            + '</td>'
            + '</tr>';
        }).join('');

    tabContent = '<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">'
      + '<div style="overflow-x:auto;">'
      + '<table style="width:100%;border-collapse:collapse;">'
      + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">'
      + ['Avatar & Name','Wohnung','Kaltmiete','Kaution','Telefon','Status','Score','Einzug','Aktionen'].map(function(h){
          return '<th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.4px;white-space:nowrap;">'+h+'</th>';
        }).join('')
      + '</tr></thead>'
      + '<tbody>'+tableRows+'</tbody>'
      + '</table></div></div>';

  } else if(activeTab === 'kautionen') {
    var kauRows = mieter.map(function(m,i){
      var kauSoll = (m.miete||0)*3;
      var kauIst = m.kau || 0;
      var ok = kauIst >= kauSoll;
      var hinterlegt = kauIst > 0;
      return '<tr style="border-bottom:1px solid #f1f5f9;" onmouseover="this.style.background=\'#f8fafc\';" onmouseout="this.style.background=\'white\';">'
        + '<td style="padding:12px 16px;"><div style="display:flex;align-items:center;gap:10px;">'+avatarCircle(m.name,30)+'<span style="font-size:13px;font-weight:600;">'+(m.name||'\u2013')+'</span></div></td>'
        + '<td style="padding:12px 16px;font-size:13px;font-weight:500;">'+(m.wn||'\u2013')+'</td>'
        + '<td style="padding:12px 16px;font-size:13px;font-weight:600;">\u20AC'+fmt(kauIst)+'</td>'
        + '<td style="padding:12px 16px;font-size:13px;color:#64748b;">\u20AC'+fmt(kauSoll)+' (3x Monatsmiete)</td>'
        + '<td style="padding:12px 16px;">'
        + '<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;background:'+(ok?'#f0fdf4':'#fffbeb')+';color:'+(ok?'#16a34a':'#d97706')+'">'
        + (ok ? '\u2713 Vollst\u00E4ndig' : (hinterlegt ? '\u26A0 Teilweise' : '\u2717 Ausstehend'))+'</span>'
        + '</td>'
        + '<td style="padding:12px 16px;">'
        + '<span style="display:inline-flex;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;background:'+(hinterlegt?'#f0fdf4':'#fef2f2')+';color:'+(hinterlegt?'#16a34a':'#dc2626')+';">'+(hinterlegt?'\uD83C\uDFE6 Hinterlegt':'\u23F3 Offen')+'</span>'
        + '</td>'
        + '</tr>';
    }).join('');
    tabContent = '<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">'
      + '<div style="overflow-x:auto;">'
      + '<table style="width:100%;border-collapse:collapse;">'
      + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">'
      + ['Mieter','Wohnung','Kaution (Ist)','3x Monatsmiete (Soll)','Check','Status'].map(function(h){
          return '<th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.4px;white-space:nowrap;">'+h+'</th>';
        }).join('')
      + '</tr></thead>'
      + '<tbody>'+kauRows+'</tbody>'
      + '</table></div></div>';

  } else if(activeTab === 'miethistorie') {
    var months = lastSixMonths();
    var histRows = mieter.map(function(m,i){
      var hist = m.hist || [];
      return '<tr style="border-bottom:1px solid #f1f5f9;" onmouseover="this.style.background=\'#f8fafc\';" onmouseout="this.style.background=\'white\';">'
        + '<td style="padding:12px 16px;"><div style="display:flex;align-items:center;gap:10px;">'+avatarCircle(m.name,30)+'<div><div style="font-size:13px;font-weight:600;">'+(m.name||'\u2013')+'</div><div style="font-size:11px;color:#94a3b8;">'+(m.wn||'\u2013')+'</div></div></div></td>'
        + months.map(function(mo, mi){
            var st = hist[mi] || 'bezahlt';
            var isB = st === 'bezahlt';
            return '<td style="padding:12px 16px;text-align:center;">'
              + '<span style="display:inline-flex;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:700;background:'+(isB?'#f0fdf4':'#fef2f2')+';color:'+(isB?'#16a34a':'#dc2626')+';white-space:nowrap;">'+(isB?'\u2713 Bezahlt':'\u2717 Offen')+'</span>'
              + '</td>';
          }).join('')
        + '</tr>';
    }).join('');
    tabContent = '<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">'
      + '<div style="overflow-x:auto;">'
      + '<table style="width:100%;border-collapse:collapse;">'
      + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">'
      + ['<th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.4px;">Mieter</th>']
        .concat(months.map(function(mo){ return '<th style="padding:12px 16px;text-align:center;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.4px;">'+mo.lbl+' '+mo.y+'</th>'; }))
        .join('')
      + '</tr></thead>'
      + '<tbody>'+histRows+'</tbody>'
      + '</table></div></div>';
  }

  var mainHTML = tabBar + tabContent;

  // MODAL
  var mieterForEdit = editIdx >= 0 ? mieter[editIdx] : {};
  var modalContent = ''
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">'
    + formGroup('Vorname & Nachname', '<input id="m-name" '+inputStyle+' value="'+(mieterForEdit.name||'')+'" placeholder="Max Mustermann">')
    + formGroup('Wohnung', '<input id="m-wn" '+inputStyle+' value="'+(mieterForEdit.wn||'')+'" placeholder="z.B. 1 OG">')
    + formGroup('Kaltmiete (\u20AC)', '<input id="m-miete" type="number" '+inputStyle+' value="'+(mieterForEdit.miete||'')+'" placeholder="950">')
    + formGroup('Kaution (\u20AC)', '<input id="m-kau" type="number" '+inputStyle+' value="'+(mieterForEdit.kau||'')+'" placeholder="2850">')
    + formGroup('Telefon', '<input id="m-tel" '+inputStyle+' value="'+(mieterForEdit.tel||'')+'" placeholder="49157...">')
    + formGroup('E-Mail', '<input id="m-em" type="email" '+inputStyle+' value="'+(mieterForEdit.em||'')+'" placeholder="max@mail.de">')
    + formGroup('Einzugsdatum', '<input id="m-dat" type="date" '+inputStyle+' value="'+(mieterForEdit.dat||today())+'">')
    + formGroup('Score (1\u2013100)', '<input id="m-sco" type="number" min="1" max="100" '+inputStyle+' value="'+(mieterForEdit.sco||80)+'">')
    + '</div>'
    + formGroup('Status', '<select id="m-status" '+inputStyle+'><option value="bezahlt"'+(mieterForEdit.status==='bezahlt'?' selected':'')+'>Bezahlt</option><option value="offen"'+(mieterForEdit.status==='offen'?' selected':'')+'>Offen</option></select>')
    + '<div style="display:flex;gap:10px;margin-top:6px;justify-content:flex-end;">'
    + '<button onclick="hideModal(\'m-modal\')" style="padding:10px 20px;border-radius:9px;border:1.5px solid #e2e8f0;background:white;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Abbrechen</button>'
    + '<button onclick="saveMieter()" style="padding:10px 24px;border-radius:9px;border:none;background:#16a34a;color:white;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">\uD83D\uDCBE Speichern</button>'
    + '</div>';

  var modalsHTML = modalHTML('m-modal', editIdx >= 0 ? '\u270F\uFE0F Mieter bearbeiten' : '\uD83D\uDC65 Neuen Mieter hinzuf\u00FCgen', modalContent);

  var actionBtn = '<button onclick="openModal(-1)" style="background:#2563eb;color:white;border:none;border-radius:9px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">+ Mieter hinzuf\u00FCgen</button>';

  renderLayout('mieter', '\uD83D\uDC65 Mieter', actionBtn, mainHTML, modalsHTML);
}

function setTab(t) { activeTab = t; render(); }

function openModal(idx) {
  editIdx = idx;
  render();
  showModal('m-modal');
}

function toggleStatus(i) {
  var mieter = getData(KEYS.mieter, DEFAULT_MIETER);
  var m = mieter[i];
  if(!m) return;
  m.status = m.status === 'bezahlt' ? 'offen' : 'bezahlt';
  if(m.status === 'bezahlt') addNotif('\uD83D\uDCB0','Miete von '+m.name+' als bezahlt markiert');
  setData(KEYS.mieter, mieter);
  syncToFirebase(user.uid);
  render();
}

function deleteMieter(i) {
  if(!confirm('Mieter wirklich l\u00F6schen?')) return;
  var mieter = getData(KEYS.mieter, DEFAULT_MIETER);
  var name = mieter[i] ? mieter[i].name : '';
  mieter.splice(i, 1);
  setData(KEYS.mieter, mieter);
  addNotif('\uD83D\uDDD1\uFE0F','Mieter '+name+' gel\u00F6scht');
  syncToFirebase(user.uid);
  render();
}

function saveMieter() {
  var name = (document.getElementById('m-name')||{}).value||'';
  var wn = (document.getElementById('m-wn')||{}).value||'';
  var miete = parseInt((document.getElementById('m-miete')||{}).value)||0;
  var kau = parseInt((document.getElementById('m-kau')||{}).value)||0;
  var tel = (document.getElementById('m-tel')||{}).value||'';
  var em = (document.getElementById('m-em')||{}).value||'';
  var dat = (document.getElementById('m-dat')||{}).value||today();
  var sco = parseInt((document.getElementById('m-sco')||{}).value)||80;
  var status = (document.getElementById('m-status')||{}).value||'bezahlt';
  if(!name) { alert('Bitte Name eingeben'); return; }
  var mieter = getData(KEYS.mieter, DEFAULT_MIETER);
  var obj = {name:name, wn:wn, miete:miete, kau:kau, tel:tel, em:em, dat:dat, sco:sco, status:status};
  if(editIdx >= 0) {
    obj.hist = mieter[editIdx] ? (mieter[editIdx].hist||[]) : [];
    mieter[editIdx] = obj;
    addNotif('\u270F\uFE0F','Mieter '+name+' aktualisiert');
  } else {
    obj.hist = [];
    mieter.push(obj);
    addNotif('\uD83D\uDC65','Mieter '+name+' hinzugef\u00FCgt');
  }
  setData(KEYS.mieter, mieter);
  syncToFirebase(user.uid);
  hideModal('m-modal');
  editIdx = -1;
  render();
}

initFirebase();
loadFromFirebase(user.uid, render);
<\/script>
</body>
</html>`;

// ==================== TICKETS.HTML ====================
const ticketsHTML = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tickets \u2013 ImmoNova</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"><\/script>
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"><\/script>
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"><\/script>
  <script src="shared.js"><\/script>
</head>
<body style="margin:0;padding:0;">
<script>
if(!checkAuth()) { window.location.href='login.html'; }
var user = getUser();
var filterStatus = 'Alle';
var filterPrio = 'Alle';
var editTicketId = null;

var PRIO_STYLE = {
  'Hoch': 'background:#fef2f2;color:#dc2626;border:1.5px solid #fca5a5;',
  'Mittel': 'background:#fffbeb;color:#d97706;border:1.5px solid #fde68a;',
  'Niedrig': 'background:#f0fdf4;color:#16a34a;border:1.5px solid #86efac;'
};
var STATUS_STYLE = {
  'Offen': 'background:#fef2f2;color:#dc2626;',
  'In Bearbeitung': 'background:#fffbeb;color:#d97706;',
  'Erledigt': 'background:#f0fdf4;color:#16a34a;'
};

function render() {
  var tickets = getData(KEYS.tickets, []);
  var mieter = getData(KEYS.mieter, DEFAULT_MIETER);
  var handwerker = getData(KEYS.handwerker, []);

  // FILTER
  var filtered = tickets.filter(function(t){
    var stOk = filterStatus === 'Alle' || t.status === filterStatus;
    var prOk = filterPrio === 'Alle' || t.prio === filterPrio;
    return stOk && prOk;
  });

  // FILTER BAR
  var filterBar = '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px;align-items:center;">'
    + '<div style="display:flex;gap:4px;background:#f1f5f9;border-radius:10px;padding:4px;">'
    + ['Alle','Offen','In Bearbeitung','Erledigt'].map(function(s){
        var act = filterStatus === s;
        return '<button onclick="setFilter(\''+s+'\',filterPrio)" style="padding:7px 14px;border-radius:7px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;background:'+(act?'white':'transparent')+';color:'+(act?'#0f172a':'#64748b')+';box-shadow:'+(act?'0 1px 3px rgba(0,0,0,0.1)':'none')+';white-space:nowrap;">'+s+'</button>';
      }).join('')
    + '</div>'
    + '<div style="display:flex;gap:4px;background:#f1f5f9;border-radius:10px;padding:4px;">'
    + ['Alle','Hoch','Mittel','Niedrig'].map(function(p){
        var act = filterPrio === p;
        var dotColor = p==='Hoch'?'#dc2626':(p==='Mittel'?'#d97706':(p==='Niedrig'?'#16a34a':'transparent'));
        return '<button onclick="setFilter(filterStatus,\''+p+'\')" style="padding:7px 14px;border-radius:7px;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;background:'+(act?'white':'transparent')+';color:'+(act?'#0f172a':'#64748b')+';box-shadow:'+(act?'0 1px 3px rgba(0,0,0,0.1)':'none')+';display:flex;align-items:center;gap:5px;white-space:nowrap;">'
          + (p!=='Alle'?'<span style="width:8px;height:8px;border-radius:50%;background:'+dotColor+';display:inline-block;"></span>':'')
          + p+'</button>';
      }).join('')
    + '</div>'
    + '<div style="margin-left:auto;font-size:12px;color:#94a3b8;font-weight:500;">'+filtered.length+' von '+tickets.length+' Tickets</div>'
    + '</div>';

  // STATS ROW
  var stats = ['Offen','In Bearbeitung','Erledigt'];
  var statColors = ['#dc2626','#d97706','#16a34a'];
  var statBg = ['#fef2f2','#fffbeb','#f0fdf4'];
  var statsRow = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;">'
    + stats.map(function(s,i){
        var cnt = tickets.filter(function(t){return t.status===s;}).length;
        return '<div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 3px rgba(0,0,0,0.05);">'
          + '<div>'
          + '<div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">'+s+'</div>'
          + '<div style="font-size:24px;font-weight:700;color:#0f172a;">'+cnt+'</div>'
          + '</div>'
          + '<div style="width:44px;height:44px;border-radius:12px;background:'+statBg[i]+';display:flex;align-items:center;justify-content:center;font-size:20px;">'
          + (i===0?'\uD83D\uDD34':i===1?'\uD83D\uDFE1':'\uD83D\uDFE2')+'</div>'
          + '</div>';
      }).join('')
    + '</div>';

  // TICKET TABLE
  var tableRows = filtered.length === 0
    ? '<tr><td colspan="8" style="padding:40px;text-align:center;color:#94a3b8;">'
      + '<div style="font-size:32px;margin-bottom:10px;">\uD83C\uDFAB</div>'
      + '<div style="font-size:15px;font-weight:600;margin-bottom:8px;">Keine Tickets gefunden</div>'
      + '<button onclick="openTicketModal()" style="background:#2563eb;color:white;border:none;border-radius:9px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">+ Ticket erstellen</button>'
      + '</td></tr>'
    : filtered.map(function(t){
        var tidx = tickets.indexOf(t);
        var ps = PRIO_STYLE[t.prio] || 'background:#f1f5f9;color:#64748b;border:1.5px solid #e2e8f0;';
        var ss = STATUS_STYLE[t.status] || 'background:#f1f5f9;color:#64748b;';
        var desc = (t.beschreibung||t.desc||'\u2013');
        if(desc.length > 60) desc = desc.substring(0,60)+'\u2026';
        var nextStatus = t.status === 'Offen' ? 'In Bearbeitung' : (t.status === 'In Bearbeitung' ? 'Erledigt' : null);
        var statusBtn = '';
        if(nextStatus) {
          var btnColor = nextStatus === 'In Bearbeitung' ? '#d97706' : '#16a34a';
          statusBtn = '<button onclick="advanceStatus('+tidx+')" style="display:inline-flex;padding:5px 12px;border-radius:8px;border:none;background:'+btnColor+';color:white;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;">\u2192 '+nextStatus+'</button>';
        } else {
          statusBtn = '<span style="display:inline-flex;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700;'+ss+';white-space:nowrap;">\u2713 Erledigt</span>';
        }
        return '<tr style="border-bottom:1px solid #f1f5f9;" onmouseover="this.style.background=\'#f8fafc\';" onmouseout="this.style.background=\'white\';">'
          + '<td style="padding:12px 16px;">'
          + '<span style="display:inline-flex;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;'+ps+';white-space:nowrap;">'+(t.prio||'\u2013')+'</span>'
          + '</td>'
          + '<td style="padding:12px 16px;font-size:13px;font-weight:600;color:#0f172a;white-space:nowrap;">'+(t.wohnung||t.wn||'\u2013')+'</td>'
          + '<td style="padding:12px 16px;max-width:220px;">'
          + '<div style="font-size:13px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+desc+'</div>'
          + (t.foto ? '<img src="'+t.foto+'" style="width:40px;height:40px;object-fit:cover;border-radius:6px;margin-top:6px;border:1px solid #e2e8f0;" onerror="this.style.display=\'none\'">' : '')
          + '</td>'
          + '<td style="padding:12px 16px;font-size:12px;color:#64748b;white-space:nowrap;">'+(t.hw||'\u2013')+'</td>'
          + '<td style="padding:12px 16px;font-size:12px;color:#64748b;white-space:nowrap;">'+fmtDate(t.datum)+'</td>'
          + '<td style="padding:12px 16px;">'+statusBtn+'</td>'
          + '<td style="padding:12px 16px;">'
          + '<div style="display:flex;gap:6px;">'
          + '<button onclick="openTicketModal('+tidx+')" title="Bearbeiten" style="width:30px;height:30px;border-radius:8px;background:#eff6ff;border:none;cursor:pointer;font-size:14px;">\u270F\uFE0F</button>'
          + '<button onclick="deleteTicket('+tidx+')" title="L\u00F6schen" style="width:30px;height:30px;border-radius:8px;background:#fef2f2;border:none;cursor:pointer;font-size:14px;">\uD83D\uDDD1\uFE0F</button>'
          + '</div>'
          + '</td>'
          + '</tr>';
      }).join('');

  var table = '<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">'
    + '<div style="overflow-x:auto;">'
    + '<table style="width:100%;border-collapse:collapse;">'
    + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">'
    + ['Priorit\u00E4t','Wohnung','Beschreibung','Handwerker','Erstellt','Status','Aktionen'].map(function(h){
        return '<th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.4px;white-space:nowrap;">'+h+'</th>';
      }).join('')
    + '</tr></thead>'
    + '<tbody>'+tableRows+'</tbody>'
    + '</table></div></div>';

  var mainHTML = filterBar + statsRow + table;

  // MODAL
  var tkt = editTicketId !== null ? tickets.find(function(t){return t.id===editTicketId;}) : {};
  if(!tkt) tkt = {};
  var wohnungen = mieter.map(function(m){return m.wn||'';}).filter(function(w,i,arr){return w&&arr.indexOf(w)===i;});
  var hwList = handwerker.map(function(h){return h.name||h;}).filter(Boolean);

  var modalContent = ''
    + formGroup('Wohnung', '<select id="t-wn" '+inputStyle+'>'
        + '<option value="">-- W\u00E4hlen --</option>'
        + wohnungen.map(function(w){ return '<option value="'+w+'"'+(tkt.wohnung===w?' selected':'')+'>'+w+'</option>'; }).join('')
        + '</select>')
    + formGroup('Beschreibung', '<textarea id="t-desc" '+inputStyle+' rows="3" style="resize:vertical;min-height:80px;" placeholder="Schadensbeschreibung...">'+(tkt.beschreibung||tkt.desc||'')+'<\/textarea>')
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">'
    + formGroup('Priorit\u00E4t', '<select id="t-prio" '+inputStyle+'>'
        + ['Hoch','Mittel','Niedrig'].map(function(p){ return '<option value="'+p+'"'+(tkt.prio===p?' selected':'')+'>'+p+'</option>'; }).join('')
        + '</select>')
    + formGroup('Handwerker', '<select id="t-hw" '+inputStyle+'>'
        + '<option value="">-- Kein Handwerker --</option>'
        + hwList.map(function(h){ return '<option value="'+h+'"'+(tkt.hw===h?' selected':'')+'>'+h+'</option>'; }).join('')
        + '</select>')
    + formGroup('Status', '<select id="t-status" '+inputStyle+'>'
        + ['Offen','In Bearbeitung','Erledigt'].map(function(s){ return '<option value="'+s+'"'+((tkt.status||'Offen')===s?' selected':'')+'>'+s+'</option>'; }).join('')
        + '</select>')
    + formGroup('Foto-URL (optional)', '<input id="t-foto" type="url" '+inputStyle+' value="'+(tkt.foto||'')+'" placeholder="https://...">')
    + '</div>'
    + '<div style="display:flex;gap:10px;margin-top:8px;justify-content:flex-end;">'
    + '<button onclick="hideModal(\'t-modal\')" style="padding:10px 20px;border-radius:9px;border:1.5px solid #e2e8f0;background:white;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Abbrechen</button>'
    + '<button onclick="saveTicket()" style="padding:10px 24px;border-radius:9px;border:none;background:#2563eb;color:white;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">\uD83D\uDCBE Speichern</button>'
    + '</div>';

  var modalsHTML = modalHTML('t-modal', editTicketId !== null ? '\u270F\uFE0F Ticket bearbeiten' : '\uD83C\uDFAB Neues Ticket erstellen', modalContent);

  var actionBtn = '<button onclick="openTicketModal()" style="background:#2563eb;color:white;border:none;border-radius:9px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">+ Ticket erstellen</button>';

  renderLayout('tickets', '\uD83C\uDFAB Tickets & Sch\u00E4den', actionBtn, mainHTML, modalsHTML);
}

function setFilter(status, prio) {
  filterStatus = status;
  filterPrio = prio;
  render();
}

function openTicketModal(idx) {
  var tickets = getData(KEYS.tickets, []);
  if(idx !== undefined && tickets[idx]) {
    editTicketId = tickets[idx].id;
  } else {
    editTicketId = null;
  }
  render();
  showModal('t-modal');
}

function advanceStatus(idx) {
  var tickets = getData(KEYS.tickets, []);
  var t = tickets[idx];
  if(!t) return;
  var next = t.status === 'Offen' ? 'In Bearbeitung' : (t.status === 'In Bearbeitung' ? 'Erledigt' : null);
  if(!next) return;
  t.status = next;
  setData(KEYS.tickets, tickets);
  addNotif('\uD83C\uDFAB','Ticket ('+t.wohnung+'): Status \u2192 '+next);
  syncToFirebase(user.uid);
  render();
}

function deleteTicket(idx) {
  if(!confirm('Ticket wirklich l\u00F6schen?')) return;
  var tickets = getData(KEYS.tickets, []);
  var desc = tickets[idx] ? (tickets[idx].beschreibung||tickets[idx].desc||'') : '';
  tickets.splice(idx, 1);
  setData(KEYS.tickets, tickets);
  addNotif('\uD83D\uDDD1\uFE0F','Ticket gel\u00F6scht: '+desc.substring(0,30));
  syncToFirebase(user.uid);
  render();
}

function saveTicket() {
  var wn = (document.getElementById('t-wn')||{}).value||'';
  var desc = (document.getElementById('t-desc')||{}).value||'';
  var prio = (document.getElementById('t-prio')||{}).value||'Mittel';
  var hw = (document.getElementById('t-hw')||{}).value||'';
  var status = (document.getElementById('t-status')||{}).value||'Offen';
  var foto = (document.getElementById('t-foto')||{}).value||'';
  if(!wn && !desc) { alert('Bitte Wohnung oder Beschreibung angeben'); return; }
  var tickets = getData(KEYS.tickets, []);
  if(editTicketId !== null) {
    var idx = tickets.findIndex(function(t){return t.id===editTicketId;});
    if(idx >= 0) {
      tickets[idx].wohnung = wn; tickets[idx].beschreibung = desc; tickets[idx].prio = prio;
      tickets[idx].hw = hw; tickets[idx].status = status; tickets[idx].foto = foto;
      addNotif('\u270F\uFE0F','Ticket aktualisiert: '+desc.substring(0,30));
    }
  } else {
    var pb = desc||wn;
    tickets.push({id:Date.now(), wohnung:wn, beschreibung:desc, prio:prio, hw:hw, status:'Offen', datum:today(), foto:foto});
    addNotif('\uD83C\uDFAB','Neues Ticket: '+pb.substring(0,30));
  }
  setData(KEYS.tickets, tickets);
  syncToFirebase(user.uid);
  hideModal('t-modal');
  editTicketId = null;
  render();
}

initFirebase();
loadFromFirebase(user.uid, render);
<\/script>
</body>
</html>`;

fs.writeFileSync(path.join(dir, 'app.html'), appHTML, 'utf8');
console.log('app.html written:', appHTML.length, 'bytes');

fs.writeFileSync(path.join(dir, 'mieter.html'), mieterHTML, 'utf8');
console.log('mieter.html written:', mieterHTML.length, 'bytes');

fs.writeFileSync(path.join(dir, 'tickets.html'), ticketsHTML, 'utf8');
console.log('tickets.html written:', ticketsHTML.length, 'bytes');

console.log('All 3 files written successfully!');

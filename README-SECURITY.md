# ImmoNova – Sicherheits-Dokumentation

## Superadmin einrichten

**WICHTIG: Superadmin-Konten dürfen NIEMALS im Code erstellt oder hardcodiert werden.**

### Schritt-für-Schritt Anleitung

1. Normalen Account über die Registrierungsseite erstellen
2. E-Mail-Adresse bestätigen (Verification-Link klicken)
3. **Firebase Console** öffnen: https://console.firebase.google.com
4. Projekt `immonova-2e0f2` öffnen
5. **Firestore Database** → `users` → die UID des neuen Accounts öffnen
6. Feld `rolle` auf `superadmin` setzen (Wert manuell eingeben)
7. Optional: Feld `plan` auf `enterprise` setzen
8. Fertig – der Nutzer hat beim nächsten Login Superadmin-Rechte

### ⚠️ Sicherheitsregeln

- **NIEMALS** E-Mail-Adressen oder Passwörter im Code hardcoden
- **NIEMALS** automatische Superadmin-Erstellung im Code implementieren
- Superadmin-Rechte ausschließlich manuell in Firestore vergeben
- Superadmin-Konten regelmäßig auditieren (Firebase Console → Authentication)

---

## Firestore Security Rules

Die aktuellen Rules befinden sich in `firestore.rules` und implementieren:

### Zugriffshierarchie
- **Superadmin**: Vollzugriff auf alle Daten (nur manuell vergeben)
- **Verwalter (Owner)**: Vollzugriff auf eigene Tenant-Daten inkl. Zahlungen
- **Mitarbeiter**: Lesezugriff auf Mieter/Tickets, kein Zugriff auf Zahlungen
- **Öffentlich**: Kein Zugriff

### Geschützte Felder (users/{uid})
Folgende Felder können Nutzer **nicht selbst ändern**:
- `rolle` – Benutzerrolle
- `parentUid` – Tenant-Zuordnung
- `plan` – Abonnement-Plan
- `trialEndsAt` – Trial-Ablaufdatum
- `aktiv` – Account-Status

### Mitarbeiter-Sicherheit
- Mitarbeiter müssen aktiv sein (`aktiv: true`) für Zugriff
- `parentUid` wird serverseitig gesetzt, nicht client-seitig
- Zahlungsdaten sind für Mitarbeiter vollständig gesperrt

---

## XSS-Schutz

Alle Benutzerdaten die in innerHTML eingefügt werden, müssen durch `escHtml()` aus `shared.js` geschützt werden.

```javascript
// FALSCH – XSS-Risiko:
element.innerHTML = '<td>' + m.name + '</td>';

// RICHTIG – XSS-sicher:
element.innerHTML = '<td>' + escHtml(m.name) + '</td>';
```

### Felder die IMMER escaped werden müssen
- Namen: `name`, `vn`, `nn`, `nm`, `firma`
- Freitext: `pb`, `text`, `notiz`, `not`, `beschreibung`, `kommentar`, `inhalt`
- Adressen: `adr`, `adresse`, `wohnung`, `wn`, `ort`
- Kontaktdaten: `email`, `tel`, `web`

---

## localStorage-Verschlüsselung

Alle Geschäftsdaten werden vor dem Speichern in localStorage Base64-kodiert (Obfuskation gegen triviale Inspektion). Die `getData()`/`setData()` Funktionen in `shared.js` handhaben dies automatisch.

**Hinweis**: Base64 ist keine kryptografische Verschlüsselung. Für Produktionsumgebungen mit hochsensiblen Daten sollte eine echte Verschlüsselung mit der WebCrypto API implementiert werden.

---

## Content Security Policy

Alle HTML-Seiten enthalten folgende Security-Headers (als Meta-Tags):

```html
<meta http-equiv="Content-Security-Policy" content="...">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
```

**Empfehlung**: Diese Headers sollten zusätzlich als HTTP-Headers im Hosting-Setup (Netlify `_headers` oder Firebase Hosting `firebase.json`) gesetzt werden.

---

## Sicherheits-Checkliste vor jedem Release

- [ ] Keine hardcodierten Credentials im Code
- [ ] Alle neuen user-data-Felder in innerHTML mit `escHtml()` wrapped
- [ ] Neue Firestore-Collections in den Rules berücksichtigt
- [ ] Firebase Rules deployed: `firebase deploy --only firestore:rules`
- [ ] Keine `console.log()` mit sensiblen Daten im Produktions-Code

---

## Bekannte Einschränkungen (To-Do für v2.0)

1. **Echte Verschlüsselung**: localStorage mit WebCrypto API verschlüsseln
2. **Session-Timeout**: Automatischer Logout nach 8h Inaktivität
3. **DSGVO-Audit**: Rechtsanwalt-Review für Data Processing Agreement
4. **Penetration Test**: Externes Security-Audit vor GA-Release
5. **Audit-Logging**: DSGVO-konforme Protokollierung aller Datenzugriffe
6. **Rate-Limiting**: Schutz vor Brute-Force auf Firestore-Reads

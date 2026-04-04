# ImmoNova

Moderne B2B SaaS Immobilienverwaltung für Deutschland.
Live: https://spectacular-bonbon-9e24d8.netlify.app

---

## Deploy zu Netlify (aktuell aktiv)

Einfach GitHub push → automatisch deployed:

```bash
git add .
git commit -m "update"
git push
```

---

## Deploy zu Firebase Hosting

```bash
# 1. Firebase CLI installieren
npm install -g firebase-tools

# 2. Einloggen
firebase login

# 3. Deployen (Hosting + Firestore Rules + Storage Rules)
firebase deploy

# Nur Firestore Rules deployen:
firebase deploy --only firestore:rules

# Nur Storage Rules deployen:
firebase deploy --only storage:rules

# Nur Hosting deployen:
firebase deploy --only hosting
```

Firebase Projekt: `immonova-2e0f2`

---

## Firestore Security Rules

Datei: `firestore.rules`

- Authentifizierung + Email-Verifizierung erforderlich
- Jeder Tenant sieht nur seine eigenen Daten (`/tenants/{uid}/`)
- Superadmin hat vollständigen Zugriff
- Mitarbeiter mit `parentUid` haben Zugriff auf Tenant-Daten

## Storage Rules

Datei: `storage.rules`

- Ticket-Fotos: `/tickets/{tenantId}/`
- Handwerker-Fotos: `/handwerker/`
- Tenant-Dateien: `/tenants/{tenantId}/`

---

## Technologie

- Vanilla HTML/CSS/JavaScript (keine Frameworks)
- Firebase Auth, Firestore, Storage (compat v10.7.0)
- Netlify Hosting (automatisches Deploy via GitHub)
- PWA-fähig (manifest.json)
- Nominatim/OpenStreetMap für Adress-Autocomplete (kostenlos)

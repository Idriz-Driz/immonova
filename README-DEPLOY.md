# ImmoNova – Firebase Deployment Guide

## Einmalige Einrichtung

```bash
# Firebase CLI installieren
npm install -g firebase-tools

# Einloggen
firebase login

# Projekt verknüpfen
firebase use immonova-2e0f2
```

## Firestore Rules deployen

```bash
firebase deploy --only firestore:rules
```

## Storage Rules deployen

```bash
firebase deploy --only storage
```

## Alles deployen (Hosting + Rules)

```bash
firebase deploy
```

## Nur Hosting deployen

```bash
firebase deploy --only hosting
```

---

## firebase.json Konfiguration

Falls noch nicht vorhanden, erstelle `firebase.json` im Projekt-Root:

```json
{
  "firestore": {
    "rules": "immonova/firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "immonova/storage.rules"
  },
  "hosting": {
    "public": "immonova",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
        ]
      },
      {
        "source": "sw.js",
        "headers": [
          { "key": "Cache-Control", "value": "no-cache" },
          { "key": "Service-Worker-Allowed", "value": "/" }
        ]
      }
    ],
    "rewrites": [
      { "source": "/portal", "destination": "/mieter-portal.html" }
    ]
  }
}
```

---

## Wichtige Hinweise

- **Superadmin einrichten**: Nur manuell in Firebase Console → Firestore → users/{uid} → rolle: "superadmin"
- **Nie im Code**: Keine hardcodierten Rollen oder Passwörter
- **Nach jedem Rules-Update**: `firebase deploy --only firestore:rules` ausführen
- **PWA Icons**: icons/icon-72.png, icon-192.png, icon-512.png müssen im Hosting-Ordner liegen

---

## Netlify Deploy (Alternative)

Das Projekt deployed automatisch via GitHub Push:
- **URL**: https://gregarious-starlight-1f8a77.netlify.app
- **Trigger**: Push auf `main` Branch
- **Publish Dir**: `immonova/`

Für Netlify Headers, erstelle `immonova/_headers`:
```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin

/sw.js
  Cache-Control: no-cache
  Service-Worker-Allowed: /
```

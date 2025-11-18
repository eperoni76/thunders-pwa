# 🔥 Firebase - Prossimi Passi

## ✅ Implementazione Completata!

Il codice è pronto. Ora devi solo configurare Firebase Console.

---

## 🚀 Setup Rapido (10 minuti)

### 1. Crea Progetto Firebase
https://console.firebase.google.com/ → Aggiungi progetto → `thunders-pwa`

### 2. Aggiungi App Web
Icona `</>` → Registra app → Copia la configurazione

### 3. Aggiorna environment.ts
Sostituisci i placeholder in `src/environments/environment.ts` con i tuoi valori:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "IL_TUO_VALORE_QUI",
    authDomain: "IL_TUO_VALORE_QUI",
    projectId: "IL_TUO_VALORE_QUI",
    storageBucket: "IL_TUO_VALORE_QUI",
    messagingSenderId: "IL_TUO_VALORE_QUI",
    appId: "IL_TUO_VALORE_QUI"
  }
};
```

### 4. Crea Database Firestore
Firebase Console → Firestore Database → Crea database → Modalità test → europe-west1

### 5. Configura Regole
Tab "Regole" in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /giocatori/{document=**} {
      allow read, write: if true;
    }
    match /partite/{document=**} {
      allow read, write: if true;
    }
  }
}
```

Pubblica!

### 6. Avvia & Testa
```bash
ng serve
```

Vai su http://localhost:4200 e aggiungi un giocatore!

---

## 📚 Documentazione Completa

Vedi: **FIREBASE_SETUP.md** per tutti i dettagli

---

## ⚡ Quick Test

Dopo il setup, apri 2 tab del browser:
- Tab 1: Aggiungi un giocatore
- Tab 2: Appare automaticamente! 🔥

---

**Buon lavoro! 🚀**


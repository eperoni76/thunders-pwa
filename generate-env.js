const fs = require('fs');
const path = require('path');

// Leggi le variabili d'ambiente (da GitHub Secrets o .env)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || ''
};

// Verifica che tutte le variabili siano presenti
const missingVars = [];
Object.keys(firebaseConfig).forEach(key => {
  if (!firebaseConfig[key]) {
    missingVars.push(key);
  }
});

if (missingVars.length > 0) {
  console.error('❌ Variabili Firebase mancanti:', missingVars.join(', '));
  console.error('ℹ️  Per sviluppo locale: copia environment.template.ts in environment.ts e compila i valori');
  console.error('ℹ️  Per CI/CD: configura le GitHub Secrets');
  process.exit(1);
}

// Crea il contenuto del file environment
const environmentContent = `export const environment = {
  production: ${process.env.PRODUCTION === 'true'},
  firebase: {
    apiKey: "${firebaseConfig.apiKey}",
    authDomain: "${firebaseConfig.authDomain}",
    projectId: "${firebaseConfig.projectId}",
    storageBucket: "${firebaseConfig.storageBucket}",
    messagingSenderId: "${firebaseConfig.messagingSenderId}",
    appId: "${firebaseConfig.appId}"
  }
};
`;

// Determina il file di output
const isProd = process.env.PRODUCTION === 'true';
const outputFile = isProd ? 'environment.prod.ts' : 'environment.ts';
const outputPath = path.join(__dirname, 'src', 'environments', outputFile);

// Scrivi il file
fs.writeFileSync(outputPath, environmentContent);

console.log(`✅ File ${outputFile} creato con successo`);
console.log(`   Production: ${isProd}`);
console.log(`   Project ID: ${firebaseConfig.projectId}`);


/**
 * Génère js/firebase-config.js à partir de la variable d'environnement FIREBASE_CONFIG_JSON.
 * Utilisé par la CI (GitHub Actions) pour ne pas committer la config.
 * Usage: FIREBASE_CONFIG_JSON='{"apiKey":"..."}' node scripts/inject-firebase-config.js
 */
const fs = require('fs');
const path = require('path');

const json = process.env.FIREBASE_CONFIG_JSON;
if (!json) {
  console.error('FIREBASE_CONFIG_JSON manquant.');
  process.exit(1);
}

let config;
try {
  config = JSON.parse(json);
} catch (e) {
  console.error('FIREBASE_CONFIG_JSON invalide (JSON attendu):', e.message);
  process.exit(1);
}

const required = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'appId'];
for (const key of required) {
  if (!config[key]) {
    console.error('Clé manquante dans la config:', key);
    process.exit(1);
  }
}

const configStr = Object.entries(config)
  .map(([k, v]) => `    ${k}: '${String(v).replace(/'/g, "\\'")}'`)
  .join(',\n');

const finalContent = `/**
 * Configuration Firebase (générée par CI / secrets GitHub)
 */
(function (global) {
  'use strict';

  const firebaseConfig = {
${configStr}
  };

  if (!global.firebase?.apps?.length) {
    global.firebase.initializeApp(firebaseConfig);
  }

  global.FIREBASE_CONFIG = firebaseConfig;
  global.FIREBASE_DB = global.firebase.database();
})(typeof window !== 'undefined' ? window : this);
`;

const outPath = path.join(__dirname, '..', 'js', 'firebase-config.js');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, finalContent, 'utf8');
console.log('Écrit:', outPath);

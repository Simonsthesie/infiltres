/**
 * Template : ne pas committer la vraie config.
 * Copie ce fichier en js/firebase-config.js et remplis les valeurs,
 * ou utilise les secrets GitHub pour le déploiement (voir README).
 */
(function (global) {
  'use strict';

  const firebaseConfig = {
    apiKey: 'VOTRE_API_KEY',
    authDomain: 'votre-projet.firebaseapp.com',
    databaseURL: 'https://votre-projet-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'votre-projet',
    storageBucket: 'votre-projet.firebasestorage.app',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:xxxxx',
    measurementId: 'G-XXXXXXXXXX'
  };

  if (!global.firebase?.apps?.length) {
    global.firebase.initializeApp(firebaseConfig);
  }

  global.FIREBASE_CONFIG = firebaseConfig;
  global.FIREBASE_DB = global.firebase.database();
})(typeof window !== 'undefined' ? window : this);

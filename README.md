# Infiltré — Jeu de soirée multijoueur

WebApp type **Agent Secret / Infiltré** pour animer des soirées entre amis.  
Architecture **100 % frontend** : hébergement sur **GitHub Pages**, synchronisation en temps réel via **Firebase Realtime Database** (sans backend).

---

## Structure du projet

```
Infiltré/
├── index.html          # Vue Joueur (connexion + écran agent / attente)
├── tv.html             # Vue TV (dashboard, classement, chrono, pop-up révélation)
├── admin.html          # Vue Admin (maître du jeu)
├── js/
│   ├── firebase-config.example.js   # Template (committé) — la vraie config ne l'est pas
│   ├── firebase-config.js           # Généré en local ou par la CI (dans .gitignore)
│   └── app.js                       # Logique métier + sync Firebase (états du jeu)
├── scripts/
│   └── inject-firebase-config.js   # Script utilisé par la CI pour générer la config
├── .github/workflows/
│   └── deploy-pages.yml             # Déploiement GitHub Pages avec secrets
├── css/
│   └── animations.css      # Animations Glitch, Shake, révélation
├── data/
│   └── missions.json       # Liste des missions (balise [CIBLE])
└── README.md
```

---

## Configuration Firebase

**En local** : le fichier `js/firebase-config.js` est dans `.gitignore` — il ne sera pas envoyé sur GitHub. Copie `js/firebase-config.example.js` vers `js/firebase-config.js` et remplis tes valeurs, ou garde ta config actuelle pour les tests.

**Sur GitHub (déploiement public)** : voir la section « Déploiement sur GitHub Pages (sans exposer la config Firebase) » plus bas.

1. Créer un projet sur [Firebase Console](https://console.firebase.google.com).
2. Activer **Realtime Database** (mode test ou règles adaptées).
3. Dans **Paramètres du projet** > **Comptes de service**, récupérer la config (ou dans « Ajouter une app » > Web).
4. Copier les valeurs dans `js/firebase-config.js` :

```js
const firebaseConfig = {
  apiKey: '...',
  authDomain: 'votre-projet.firebaseapp.com',
  databaseURL: 'https://votre-projet-default-rtdb.firebaseio.com',
  projectId: 'votre-projet',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...'
};
```

5. Pour **GitHub Pages** : dans Firebase Console > **Authentication** > **Authorized domains**, ajouter `https://votre-username.github.io` (et l’URL de votre dépôt si différente).

---

## Règles Realtime Database (exemple)

En mode développement (accès ouvert) :

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Pour la prod, restreindre lecture/écriture selon vos besoins (par ex. par partie / code PIN).

---

## Les 4 états du jeu

| État | Description |
|------|-------------|
| **IDLE** | Attente des joueurs. L’admin peut choisir un agent. |
| **INFILTRATION** | Un agent est désigné, mission attribuée, chrono (ex. 30 min). |
| **REVEAL** | Révélation sur la TV : « L’agent était [NOM], sa mission était [MISSION] ». |
| **RESOLUTION** | L’admin clique Succès ou Échec → points et gages, puis retour à IDLE. |

---

## Missions et balise [CIBLE]

Les missions sont dans `data/missions.json`. La chaîne **`[CIBLE]`** est remplacée par le nom d’un autre joueur connecté (choisi aléatoirement parmi les non-agents).

Exemples :

- `"Fais boire le verre de [CIBLE] sans qu'il s'en rende compte"`
- `"Fais dire à [CIBLE] le mot « spaghetti » en moins de 2 minutes"`

Vous pouvez modifier ou étendre ce fichier JSON.

---

## Déploiement sur GitHub Pages (sans exposer la config Firebase)

La config Firebase est dans **`.gitignore`** : elle ne sera jamais poussée sur le dépôt public. Pour déployer quand même :

### 1. Créer le secret GitHub

1. Sur ton dépôt : **Settings** > **Secrets and variables** > **Actions**.
2. **New repository secret** : nom `FIREBASE_CONFIG_JSON`, valeur = ton objet config en **une seule ligne JSON**, par exemple :

```json
{"apiKey":"AIzaSyAVlpRDEE9...","authDomain":"infiltres-112ec.firebaseapp.com","databaseURL":"https://infiltres-112ec-default-rtdb.europe-west1.firebasedatabase.app","projectId":"infiltres-112ec","storageBucket":"infiltres-112ec.firebasestorage.app","messagingSenderId":"618692158031","appId":"1:618692158031:web:eb19b84a51ae5c23eb803a","measurementId":"G-9992Q53MBK"}
```

### 2. Activer GitHub Pages via Actions

1. **Settings** > **Pages** > **Build and deployment**.
2. **Source** : **GitHub Actions** (pas « Deploy from a branch »).

### 3. Déployer

- À chaque **push sur `main`**, le workflow génère `js/firebase-config.js` à partir du secret puis publie le site.
- Ou lancer à la main : **Actions** > **Deploy to GitHub Pages** > **Run workflow**.

L’app sera à : `https://<username>.github.io/<nom-du-repo>/`.

> **Si tu avais déjà committé `js/firebase-config.js`** : supprime-le du suivi avec  
> `git rm --cached js/firebase-config.js` puis commit. La config restera dans l’historique ; pour la retirer complètement il faudrait réécrire l’historique (ex. avec BFG Repo-Cleaner). Pour la suite, elle ne sera plus poussée.

### En local (sans GitHub)

Garde ton fichier `js/firebase-config.js` avec ta vraie config sur ta machine (il est ignoré par git). Pour tester :

```bash
npx serve .
# ou
python -m http.server 8000
```

---

## Utilisation en soirée

1. **TV** : ouvrir `tv.html` sur l’écran principal.
2. **Joueurs** : ouvrir `index.html` sur les téléphones, entrer le pseudo, rejoindre.
3. **Admin** : ouvrir `admin.html` (sur un téléphone ou PC discret).
4. Quand tout le monde est là : Admin choisit un joueur comme **Agent** → la mission est tirée au sort (avec une [CIBLE] parmi les autres).
5. Phase **INFILTRATION** : chrono 30 min (ou révélation manuelle par l’admin).
6. Admin clique **Déclencher la RÉVÉLATION** → pop-up sur la TV + confettis.
7. Admin clique **Succès** ou **Échec** → mise à jour du classement, puis nouvelle manche (revenir à l’étape 4).

---

## Stack

- **HTML5**, **JavaScript**, **Vue 3** (CDN)
- **Tailwind CSS** (CDN), thème sombre / néon
- **Firebase Realtime Database** (CDN)
- **canvas-confetti** (CDN) pour la révélation
- **Animations CSS** : Glitch, Shake, pulse (voir `css/animations.css`)

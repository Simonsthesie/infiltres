/**
 * Infiltré - Logique métier et synchronisation Firebase
 * États : IDLE, INFILTRATION, REVEAL, RESOLUTION
 */
(function (global) {
  'use strict';

  const DB = global.FIREBASE_DB;
  const GAME_REF = 'game';
  const PLAYERS_REF = 'players';

  const STATES = {
    IDLE: 'IDLE',
    INFILTRATION: 'INFILTRATION',
    PAUSED: 'PAUSED',
    REVEAL: 'REVEAL',
    RESOLUTION: 'RESOLUTION'
  };

  const STATE_MESSAGES = {
    IDLE: 'En attente des joueurs...',
    INFILTRATION: 'Un agent est en mission secrète... Gardez l\'œil ouvert.',
    PAUSED: 'Partie en pause.',
    REVEAL: 'Révélation en cours...',
    RESOLUTION: 'Mission terminée. Distribution des points.'
  };

  let missionsCache = [];

  async function loadMissions() {
    if (missionsCache.length) return missionsCache;
    try {
      const res = await fetch('data/missions.json');
      missionsCache = await res.json();
      return missionsCache;
    } catch (e) {
      console.error('Erreur chargement missions:', e);
      return [];
    }
  }

  function resolveMissionText(missionText, targetPlayerName) {
    if (!missionText) return '';
    return missionText.replace(/\[CIBLE\]/g, targetPlayerName || 'quelqu\'un');
  }

  function pickRandomMission(players, excludePlayerId) {
    const list = players.filter(p => p.id !== excludePlayerId);
    const target = list.length ? list[Math.floor(Math.random() * list.length)] : null;
    const missions = missionsCache.length ? missionsCache : [];
    const raw = missions[Math.floor(Math.random() * missions.length)];
    const missionText = typeof raw === 'string' ? raw : (raw && raw.text) || 'Mission secrète';
    const resolved = resolveMissionText(missionText, target?.name);
    return { mission: resolved, targetId: target?.id || null, targetName: target?.name || null };
  }

  function gameRef() {
    return DB.ref(GAME_REF);
  }

  function playersRef() {
    return DB.ref(PLAYERS_REF);
  }

  function getInitialGameState() {
    return {
      state: STATES.IDLE,
      stateMessage: STATE_MESSAGES.IDLE,
      agentId: null,
      agentName: null,
      mission: null,
      targetName: null,
      revealAt: null,
      startedAt: null,
      durationSeconds: 30,
      durationMinutes: 30,
      resolution: null,
      grillWinner: null,
      leaderboard: {}
    };
  }

  function joinGame(playerName) {
    const id = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    playersRef().child(id).set({
      id,
      name: playerName.trim().slice(0, 30),
      joinedAt: Date.now()
    });
    return id;
  }

  function leaveGame(playerId) {
    return playersRef().child(playerId).remove();
  }

  function onPlayers(callback) {
    return playersRef().on('value', (snap) => {
      const val = snap.val();
      const list = val ? Object.entries(val).map(([k, v]) => ({ id: k, ...v })) : [];
      callback(list);
    });
  }

  function onGameState(callback) {
    return gameRef().on('value', (snap) => {
      const val = snap.val();
      callback(val || getInitialGameState());
    });
  }

  async function startInfiltration(agentId, agentName, players) {
    await loadMissions();
    const { mission, targetName } = pickRandomMission(players, agentId);
    const durationSeconds = 30;
    const current = await gameRef().once('value').then(s => s.val());
    const leaderboard = (current && current.leaderboard) ? current.leaderboard : {};
    const ServerTimestamp = global.firebase && global.firebase.database && global.firebase.database.ServerValue && global.firebase.database.ServerValue.TIMESTAMP;

    await gameRef().set({
      state: STATES.INFILTRATION,
      stateMessage: STATE_MESSAGES.INFILTRATION,
      agentId,
      agentName,
      mission,
      targetName: targetName || null,
      startedAt: ServerTimestamp || Date.now(),
      durationSeconds,
      durationMinutes: durationSeconds / 60,
      resolution: null,
      grillWinner: null,
      leaderboard
    });

    if (ServerTimestamp) {
      const snap = await gameRef().once('value');
      const val = snap.val();
      const startedAt = val && val.startedAt && typeof val.startedAt === 'number' ? val.startedAt : Date.now();
      await gameRef().update({ revealAt: startedAt + durationSeconds * 1000 });
    } else {
      const startedAt = Date.now();
      await gameRef().update({ revealAt: startedAt + durationSeconds * 1000, startedAt });
    }
  }

  function triggerReveal() {
    return gameRef().update({
      state: STATES.REVEAL,
      stateMessage: STATE_MESSAGES.REVEAL,
      revealStartedAt: Date.now()
    });
  }

  const REVEAL_TIMEOUT_MS = 5 * 60 * 1000;

  async function checkRevealTimeout() {
    const snap = await gameRef().once('value');
    const current = snap.val();
    if (!current || current.state !== STATES.REVEAL) return;
    if (current.revealTimeoutTriggered) return;
    const startedAt = current.revealStartedAt || 0;
    if (Date.now() - startedAt < REVEAL_TIMEOUT_MS) return;

    const updated = await gameRef().transaction((c) => {
      if (!c || c.state !== STATES.REVEAL || c.revealTimeoutTriggered) return;
      if (!c.revealStartedAt || Date.now() - c.revealStartedAt < REVEAL_TIMEOUT_MS) return;
      return { ...c, revealTimeoutTriggered: true };
    });

    if (updated.committed && updated.snapshot.val() && updated.snapshot.val().revealTimeoutTriggered) {
      const playersSnap = await playersRef().once('value');
      const playersList = playersSnap.val() ? Object.entries(playersSnap.val()).map(([k, v]) => ({ id: k, ...v })) : [];
      if (playersList.length > 0) {
        const newAgent = playersList[Math.floor(Math.random() * playersList.length)];
        await startInfiltration(newAgent.id, newAgent.name, playersList);
      }
    }
  }

  async function pauseGame() {
    const snap = await gameRef().once('value');
    const current = snap.val();
    if (!current || current.state !== STATES.INFILTRATION) return;
    const revealAt = current.revealAt ?? (current.startedAt != null && (current.durationSeconds != null || current.durationMinutes != null)
      ? current.startedAt + ((current.durationSeconds ?? (current.durationMinutes * 60)) * 1000) : null);
    if (!revealAt) return;
    const remainingSeconds = Math.max(0, (revealAt - Date.now()) / 1000);
    return gameRef().update({
      state: STATES.PAUSED,
      stateMessage: STATE_MESSAGES.PAUSED,
      remainingSeconds: Math.round(remainingSeconds)
    });
  }

  async function resumeGame() {
    const snap = await gameRef().once('value');
    const current = snap.val();
    if (!current || current.state !== STATES.PAUSED) return;
    const remaining = (current.remainingSeconds || 0) * 1000;
    return gameRef().update({
      state: STATES.INFILTRATION,
      stateMessage: STATE_MESSAGES.INFILTRATION,
      revealAt: Date.now() + remaining,
      remainingSeconds: null
    });
  }

  function setResolution(success) {
    return gameRef().update({
      state: STATES.RESOLUTION,
      stateMessage: STATE_MESSAGES.RESOLUTION,
      resolution: success ? 'success' : 'fail'
    });
  }

  async function applyScoresAndReset(agentId, success, leaderboard, agentName, autoStartNext) {
    const nextLeaderboard = { ...(leaderboard || {}) };
    const key = (agentName && String(agentName).trim()) ? String(agentName).trim() : agentId;
    const agentEntry = nextLeaderboard[key] || { name: agentName || '', score: 0, gages: 0 };
    if (agentName) agentEntry.name = agentName;
    if (success) {
      agentEntry.score = (agentEntry.score || 0) + 1;
    } else {
      agentEntry.gages = (agentEntry.gages || 0) + 1;
    }
    nextLeaderboard[key] = agentEntry;

    await gameRef().set({
      ...getInitialGameState(),
      leaderboard: nextLeaderboard,
      state: STATES.IDLE,
      stateMessage: STATE_MESSAGES.IDLE
    });

    if (autoStartNext) {
      const playersSnap = await playersRef().once('value');
      const playersList = playersSnap.val() ? Object.entries(playersSnap.val()).map(([k, v]) => ({ id: k, ...v })) : [];
      if (playersList.length > 0) {
        const newAgent = playersList[Math.floor(Math.random() * playersList.length)];
        await startInfiltration(newAgent.id, newAgent.name, playersList);
      }
    }
  }

  async function submitGrill(guesserId, guesserName, guessedPlayerId) {
    const snap = await gameRef().once('value');
    const current = snap.val();
    if (!current) return { ok: false, reason: 'no_state' };
    const state = current.state;
    if (state !== STATES.INFILTRATION && state !== STATES.PAUSED) return { ok: false, reason: 'not_in_mission' };
    if (current.grillWinner) return { ok: false, reason: 'already_guessed' };
    const leaderboard = { ...(current.leaderboard || {}) };
    const key = (guesserName && String(guesserName).trim()) ? String(guesserName).trim() : guesserId;
    const entry = leaderboard[key] || { name: guesserName || '', score: 0, gages: 0 };
    entry.name = guesserName || entry.name;

    if (current.agentId !== guessedPlayerId) {
      entry.score = Math.max(0, (entry.score || 0) - 3);
      leaderboard[key] = entry;
      await gameRef().update({ leaderboard });
      return { ok: false, reason: 'wrong', points: -3 };
    }

    entry.score = (entry.score || 0) + 2;
    leaderboard[key] = entry;
    await gameRef().update({ grillWinner: guesserId, leaderboard });

    const playersSnap = await playersRef().once('value');
    const playersList = playersSnap.val() ? Object.entries(playersSnap.val()).map(([k, v]) => ({ id: k, ...v })) : [];
    if (playersList.length > 0) {
      const newAgent = playersList[Math.floor(Math.random() * playersList.length)];
      await startInfiltration(newAgent.id, newAgent.name, playersList);
    }
    return { ok: true, points: 2 };
  }

  function getGameState() {
    return gameRef().once('value').then(snap => snap.val() || getInitialGameState());
  }

  function resetGame() {
    return gameRef().once('value').then(snap => {
      const current = snap.val();
      const leaderboard = (current && current.leaderboard) ? current.leaderboard : {};
      return gameRef().set({
        ...getInitialGameState(),
        leaderboard
      });
    });
  }

  function resetGameAndScores() {
    return gameRef().set(getInitialGameState());
  }

  global.InfiltreGame = {
    STATES,
    STATE_MESSAGES,
    loadMissions,
    resolveMissionText,
    pickRandomMission,
    getInitialGameState,
    joinGame,
    leaveGame,
    onPlayers,
    onGameState,
    startInfiltration,
    triggerReveal,
    pauseGame,
    resumeGame,
    setResolution,
    applyScoresAndReset,
    submitGrill,
    getGameState,
    resetGame,
    resetGameAndScores,
    checkRevealTimeout,
    REVEAL_TIMEOUT_MS
  };
})(typeof window !== 'undefined' ? window : this);

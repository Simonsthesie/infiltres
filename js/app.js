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
    REVEAL: 'REVEAL',
    RESOLUTION: 'RESOLUTION'
  };

  const STATE_MESSAGES = {
    IDLE: 'En attente des joueurs...',
    INFILTRATION: 'Un agent est en mission secrète... Gardez l\'œil ouvert.',
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
    const mission = missions[Math.floor(Math.random() * missions.length)] || 'Mission secrète';
    const resolved = resolveMissionText(mission, target?.name);
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
      durationMinutes: 30,
      resolution: null,
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
    const durationMinutes = 30;
    const startedAt = Date.now();
    const revealAt = startedAt + durationMinutes * 60 * 1000;
    const current = await gameRef().once('value').then(s => s.val());
    const leaderboard = (current && current.leaderboard) ? current.leaderboard : {};

    await gameRef().set({
      state: STATES.INFILTRATION,
      stateMessage: STATE_MESSAGES.INFILTRATION,
      agentId,
      agentName,
      mission,
      targetName: targetName || null,
      startedAt,
      revealAt,
      durationMinutes,
      resolution: null,
      leaderboard
    });
  }

  function triggerReveal() {
    return gameRef().update({
      state: STATES.REVEAL,
      stateMessage: STATE_MESSAGES.REVEAL
    });
  }

  function setResolution(success) {
    return gameRef().update({
      state: STATES.RESOLUTION,
      stateMessage: STATE_MESSAGES.RESOLUTION,
      resolution: success ? 'success' : 'fail'
    });
  }

  function applyScoresAndReset(agentId, success, leaderboard, agentName) {
    const nextLeaderboard = { ...(leaderboard || {}) };
    const agentEntry = nextLeaderboard[agentId] || { name: agentName || '', score: 0, gages: 0 };
    if (agentName) agentEntry.name = agentName;
    if (success) {
      agentEntry.score = (agentEntry.score || 0) + 1;
    } else {
      agentEntry.gages = (agentEntry.gages || 0) + 1;
    }
    nextLeaderboard[agentId] = agentEntry;

    return gameRef().set({
      ...getInitialGameState(),
      leaderboard: nextLeaderboard,
      state: STATES.IDLE,
      stateMessage: STATE_MESSAGES.IDLE
    });
  }

  function getGameState() {
    return gameRef().once('value').then(snap => snap.val() || getInitialGameState());
  }

  function resetGame() {
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
    setResolution,
    applyScoresAndReset,
    getGameState,
    resetGame
  };
})(typeof window !== 'undefined' ? window : this);

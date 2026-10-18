// ==========================================
// Party membership resolution (folder vs FD tracker)
// ==========================================

const MODULE_ID = 'fantastic-depths-dm-screen';

/**
 * @returns {'folder'|'tracker'}
 */
export function getPartySource() {
  return game.settings.get(MODULE_ID, 'partySource') || 'folder';
}

export function isPartyTrackerSource() {
  return getPartySource() === 'tracker';
}

/**
 * Actor IDs stored by Fantastic Depths Party Tracker.
 * @returns {string[]}
 */
export function getTrackerActorIds() {
  return game.settings.get(game.system.id, 'partyTrackerData') || [];
}

/**
 * Resolve raw character actors for the current party source.
 * @returns {{ actors: Actor[], followers: Actor[] }}
 */
export function resolvePartyActors() {
  if (isPartyTrackerSource()) {
    const actors = getTrackerActorIds()
      .map(id => game.actors.get(id))
      .filter(a => a?.type === 'character' && !a.system?.details?.isNPC);

    return {
      actors: actors.filter(a => a.system?.isRetainer !== true),
      followers: actors.filter(a => a.system?.isRetainer === true)
    };
  }

  const partyFolder = game.folders?.find(f =>
    f.type === 'Actor' && f.name.toLowerCase() === 'party'
  );

  const seguaciFolder = game.folders?.find(f =>
    f.type === 'Actor' && /^(seguaci|retainers)$/i.test(f.name)
  );

  const actors = partyFolder
    ? game.actors.contents.filter(actor =>
        actor.type === 'character' &&
        !actor.system?.details?.isNPC &&
        actor.folder?.id === partyFolder.id
      )
    : [];

  const followers = seguaciFolder
    ? game.actors.contents.filter(actor =>
        actor.type === 'character' &&
        !actor.system?.details?.isNPC &&
        actor.folder?.id === seguaciFolder.id &&
        actor.system?.isRetainer === true
      )
    : [];

  return { actors, followers };
}

/**
 * Flat list of party + retainer characters (for TPL / encounter generation).
 * @returns {Actor[]}
 */
export function getAllPartyActors() {
  const { actors, followers } = resolvePartyActors();
  return [...actors, ...followers];
}

/**
 * Append an actor id to Fantastic Depths partyTrackerData if not already present.
 * @param {string} actorId
 * @returns {Promise<boolean>} true if added
 */
export async function addActorToPartyTracker(actorId) {
  const ids = [...getTrackerActorIds()];
  if (ids.includes(actorId)) return false;
  ids.push(actorId);
  await game.settings.set(game.system.id, 'partyTrackerData', ids);
  return true;
}

/**
 * Remove an actor id from Fantastic Depths partyTrackerData.
 * @param {string} actorId
 * @returns {Promise<boolean>} true if removed
 */
export async function removeActorFromPartyTracker(actorId) {
  const ids = getTrackerActorIds();
  if (!ids.includes(actorId)) return false;
  await game.settings.set(
    game.system.id,
    'partyTrackerData',
    ids.filter(id => id !== actorId)
  );
  return true;
}

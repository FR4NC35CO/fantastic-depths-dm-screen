// ==========================================
// FaDe roll helpers — saving throws, ability checks, exploration
// Delegates to game.fade.registry / SpecialAbilityItem.roll
// ==========================================

/** Request UI save keys → FaDe customCode (save specialAbility) */
const SAVE_CODE_MAP = {
  wand: 'wand',
  spell: 'spell',
  petrification: 'paralysis',
  stone: 'paralysis',
  paralysis: 'paralysis',
  breath: 'breath',
  death: 'death'
};

/**
 * Base exploration abilities (pack docs under Special Abilities → Exploration).
 * `names` = bilingual substrings for actor item matching (temporary until durable id).
 */
export const EXPLORATION_ABILITIES = {
  findSecretDoors: {
    id: 'akgcSVIh27fXqbVW',
    uuid: 'Compendium.fade-compendiums.item-compendium.Item.akgcSVIh27fXqbVW',
    names: ['Porte Segrete', 'Detect Secret Door', 'Find Secret Doors']
  },
  forceOpenDoors: {
    id: 'nPZLQJzGQ7b0g665',
    uuid: 'Compendium.fade-compendiums.item-compendium.Item.nPZLQJzGQ7b0g665',
    names: ['Forzare Porte', 'Open Door', 'Force Open Doors']
  },
  listenAtDoors: {
    id: 'qTQsTNYfcHpEki7V',
    uuid: 'Compendium.fade-compendiums.item-compendium.Item.qTQsTNYfcHpEki7V',
    names: ['Origliare Porte', 'Listen Door', 'Listen at Doors']
  },
  findTraps: {
    id: 'BDFBtg7fOKRvlzbd',
    uuid: 'Compendium.fade-compendiums.item-compendium.Item.BDFBtg7fOKRvlzbd',
    names: ['Scoprire Trappole', 'Find Trap', 'Find Traps']
  }
};

/**
 * Synthetic event for AbilityCheck.execute — mirrors ability-scores.hbs dataset.
 * @param {string} ability str|dex|con|int|wis|cha
 * @param {Event|null} sourceEvent optional real click (ctrlKey skips FaDe dialog)
 */
export function createAbilityCheckEvent(ability, sourceEvent = null) {
  const target = document.createElement('span');
  Object.assign(target.dataset, {
    ability,
    test: 'ability',
    pass: 'lte',
    autosuccess: '1',
    autofail: '20'
  });
  return {
    target,
    currentTarget: target,
    ctrlKey: Boolean(sourceEvent?.ctrlKey),
    preventDefault() {},
    stopPropagation() {}
  };
}

/**
 * Lightweight event for SavingThrowSystem / SpecialAbilityItem (ctrl skips dialogs).
 * @param {Event|null} sourceEvent
 */
export function createFadeRollEvent(sourceEvent = null) {
  const target = document.createElement('span');
  return {
    target,
    currentTarget: target,
    ctrlKey: Boolean(sourceEvent?.ctrlKey),
    preventDefault() {},
    stopPropagation() {}
  };
}

export function mapSaveCode(saveKey) {
  if (!saveKey) return null;
  return SAVE_CODE_MAP[saveKey] || saveKey;
}

/**
 * Find an explore specialAbility on the actor by bilingual name match.
 * @param {Actor} actor
 * @param {string} skillKey request data-skill key
 * @returns {Item|null}
 */
export function findExploreItem(actor, skillKey) {
  const meta = EXPLORATION_ABILITIES[skillKey];
  if (!meta || !actor?.items) return null;

  return actor.items.find(item => {
    if (item.type !== 'specialAbility' || item.system?.category !== 'explore') return false;
    const itemName = item.name?.toLowerCase() || '';
    return meta.names.some(n => itemName.includes(n.toLowerCase()));
  }) || null;
}

/**
 * Roll an ability check via FaDe abilityCheck registry.
 * @param {Actor} actor
 * @param {string} ability
 * @param {Event|null} sourceEvent
 */
export async function rollAbilityCheck(actor, ability, sourceEvent = null) {
  await game.fade.registry.getSystem('abilityCheck').execute({
    actor,
    event: createAbilityCheckEvent(ability, sourceEvent)
  });
  return true;
}

/**
 * Roll a saving throw via FaDe savingThrowSystem.
 * @param {Actor} actor
 * @param {string} saveKey request save key (e.g. petrification)
 * @param {Event|null} sourceEvent
 */
export async function rollSavingThrow(actor, saveKey, sourceEvent = null) {
  await game.fade.registry.getSystem('savingThrowSystem').execute({
    actor,
    type: mapSaveCode(saveKey),
    event: createFadeRollEvent(sourceEvent)
  });
  return true;
}

/**
 * Roll an exploration specialAbility on the actor via item.roll().
 * @param {Actor} actor
 * @param {string} skillKey
 * @param {Event|null} sourceEvent
 */
export async function rollExploration(actor, skillKey, sourceEvent = null) {
  const item = findExploreItem(actor, skillKey);
  if (!item) {
    ui.notifications.warn(game.i18n.format('NOTIFY.ExploreAbilityMissing', { skill: skillKey }));
    return false;
  }
  await item.roll(
    { test: 'specialAbility', label: item.name },
    null,
    createFadeRollEvent(sourceEvent)
  );
  return true;
}

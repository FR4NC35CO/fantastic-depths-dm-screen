// ==========================================
// Optional overlays + helpers keyed by FaDe class system.key
// Each class item has exactly one key. Maps are sparse: miss → generic / none.
// ==========================================

/** Normalize a class key from a class item or raw string. */
export function getClassKey(classItemOrKey) {
  if (!classItemOrKey) return '';
  if (typeof classItemOrKey === 'string') return classItemOrKey.toUpperCase();
  return (classItemOrKey.system?.key || '').toUpperCase();
}

/** Species from class item (Human, Elf, Dwarf, Halfling, Dragon). */
export function getClassSpecies(classItem) {
  return classItem?.system?.species || 'Human';
}

export function isDruid(key) {
  return getClassKey(key) === 'DR';
}

export function isMystic(key) {
  return getClassKey(key) === 'MY';
}

export function isFighter(key) {
  return getClassKey(key) === 'F';
}

export function isMagicUser(key) {
  return getClassKey(key) === 'M';
}

export function isElf(key) {
  return getClassKey(key) === 'E';
}

export function isDwarf(key) {
  return getClassKey(key) === 'D';
}

export function isHalfling(key) {
  return getClassKey(key) === 'H';
}

/** Dragon classes use species Dragon (preferred) or a *DR key that is not Druid (DR). */
export function isDragon(key, species) {
  if (species === 'Dragon') return true;
  const k = getClassKey(key);
  return k.length > 2 && k.endsWith('DR');
}

export function isDemihuman(key, species) {
  const s = species || '';
  if (s === 'Elf' || s === 'Dwarf' || s === 'Halfling') return true;
  return isElf(key) || isDwarf(key) || isHalfling(key);
}

/**
 * Optional chargen upgrade: replace one class item with another by key
 * (e.g. Paladin → Paladin (C) when WIS allows). These are different classes.
 */
export const CASTING_CLASS_UPGRADE = {
  PA: 'PAC',
  AV: 'AVC'
};

export function getCastingUpgradeKey(key) {
  return CASTING_CLASS_UPGRADE[getClassKey(key)] || null;
}

/** Height/weight table race id from species (preferred) or class key. */
export function getRaceGroup(classItemOrKey, species) {
  const s = species || (typeof classItemOrKey === 'object' ? getClassSpecies(classItemOrKey) : '');
  if (s === 'Dwarf' || isDwarf(classItemOrKey)) return 'dwarf';
  if (s === 'Elf' || isElf(classItemOrKey)) return 'elf';
  if (s === 'Halfling' || isHalfling(classItemOrKey)) return 'halfling';
  return 'human';
}

const ICON_PALADIN = '🛡️';
const ICON_AVENGER = '⚡';
const ICON_DRAGON = '🐉';

/**
 * Optional chat emoji by class key (one entry per class key).
 * Unknown keys → generic icon.
 */
export const CLASS_ICONS = {
  F: '⚔️',
  M: '🧙‍♂️',
  C: '⛪',
  T: '🗡️',
  PA: ICON_PALADIN,
  PAC: ICON_PALADIN,
  AV: ICON_AVENGER,
  AVC: ICON_AVENGER,
  DR: '🌿',
  B: '🎵',
  MY: '👁️',
  E: '🏹',
  D: '⛏️',
  H: '🍃',
  BKDR: ICON_DRAGON,
  BLDR: ICON_DRAGON,
  GDDR: ICON_DRAGON,
  GDR: ICON_DRAGON,
  RDR: ICON_DRAGON,
  WDR: ICON_DRAGON
};

export const GENERIC_CLASS_ICON = '👤';

export function getClassIcon(key) {
  const k = getClassKey(key);
  return (k && CLASS_ICONS[k]) || GENERIC_CLASS_ICON;
}

const TOKEN_HERO = 'systems/fantastic-depths/assets/img/actor/hero1.webp';
const TOKEN_DRAGON = 'systems/fantastic-depths/assets/img/actor/monster1a.webp';

/**
 * Optional token art by class key (one entry per class key).
 * Unknown keys → generic default.
 */
export const CLASS_TOKEN_IMAGES = {
  DR: 'systems/fantastic-depths/assets/img/actor/cleric1a.webp',
  C: 'systems/fantastic-depths/assets/img/actor/cleric2a.webp',
  D: 'systems/fantastic-depths/assets/img/actor/dwarf1a.webp',
  E: 'systems/fantastic-depths/assets/img/actor/elf1a.webp',
  F: 'systems/fantastic-depths/assets/img/actor/fighter1a.webp',
  H: 'systems/fantastic-depths/assets/img/actor/halfling1a.webp',
  PA: TOKEN_HERO,
  PAC: TOKEN_HERO,
  AV: TOKEN_HERO,
  AVC: TOKEN_HERO,
  BKDR: TOKEN_DRAGON,
  BLDR: TOKEN_DRAGON,
  GDDR: TOKEN_DRAGON,
  GDR: TOKEN_DRAGON,
  RDR: TOKEN_DRAGON,
  WDR: TOKEN_DRAGON,
  T: 'systems/fantastic-depths/assets/img/actor/rogue1a.webp',
  MY: 'systems/fantastic-depths/assets/img/actor/rogue2a.webp',
  M: 'systems/fantastic-depths/assets/img/actor/wizard1a.webp',
  B: 'systems/fantastic-depths/assets/img/actor/fighter1a.webp'
};

export function getClassTokenImage(key, fallback = 'icons/svg/mystery-man.svg') {
  const k = getClassKey(key);
  return (k && CLASS_TOKEN_IMAGES[k]) || fallback;
}

/**
 * Build generator requirements from a FaDe class item (system of record).
 * Mins are the same fields FaDe copies onto the actor in setupMinAbilityScores
 * (`classItem.system.abilities.*.min`) — what the sheet uses for red highlighting.
 * - primeReq: unique abilities from class.system.primeReqs
 * - lowerable: module chargen convention (STR/INT/WIS; never CON/CHA/DEX)
 */
export function buildClassRequirements(classItem) {
  const empty = { primeReq: [], min: {}, lowerable: ['str', 'int', 'wis'] };
  if (!classItem?.system) return empty;

  const min = {};
  const abilities = classItem.system.abilities || {};
  // Same enumeration FaDe setupMinAbilityScores uses
  for (const [abil, data] of Object.entries(abilities)) {
    const raw = data?.min;
    if (raw === null || raw === undefined) continue;
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 3) min[abil] = n;
  }

  const primeReq = [];
  for (const req of classItem.system.primeReqs || []) {
    const abil = (req?.ability || '').toLowerCase();
    if (abil && !primeReq.includes(abil)) primeReq.push(abil);
  }

  const lowerable = ['str', 'int', 'wis'];

  return { primeReq, min, lowerable };
}

/** True when DEX is a prime requisite on the class (may raise DEX with reserve). */
export function canRaiseDex(classItemOrReqs) {
  if (Array.isArray(classItemOrReqs?.primeReq)) {
    return classItemOrReqs.primeReq.includes('dex');
  }
  if (classItemOrReqs && typeof classItemOrReqs === 'object') {
    return buildClassRequirements(classItemOrReqs).primeReq.includes('dex');
  }
  return false;
}

/** Wrap flat generator stats for ClassDefinitionItem.getXPBonus. */
export function toAbilityValues(stats = {}) {
  return {
    str: { value: Number(stats.str) || 0 },
    int: { value: Number(stats.int) || 0 },
    wis: { value: Number(stats.wis) || 0 },
    dex: { value: Number(stats.dex) || 0 },
    con: { value: Number(stats.con) || 0 },
    cha: { value: Number(stats.cha) || 0 }
  };
}

/**
 * Exact class-key kit lookup. Missing key → null (class still works without a kit).
 */
export function getEquipmentKit(kitsByKey, classItemOrKey) {
  if (!kitsByKey) return null;
  const key = getClassKey(classItemOrKey);
  if (!key) return null;
  return kitsByKey[key] || null;
}

export function hasEquipmentKit(kitsByKey, classItemOrKey) {
  return !!getEquipmentKit(kitsByKey, classItemOrKey);
}

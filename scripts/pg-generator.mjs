// ==========================================
// PG Generator - Character Generator Logic - Generatore PG - Logica Generatore Personaggi
// Based on PG al Volo macro by FR4NC35C0 - Basato sulla macro PG al Volo di FR4NC35C0
// ==========================================

const MODULE_ID = 'fantastic-depths-dm-screen';

// Import name generation from embedded data tables - Importa generazione nomi da tabelle dati incorporate
import { generateName } from './name-tables.mjs';

// Import equipment tables from embedded data - Importa tabelle equipaggiamento da dati incorporati
import { EQUIPMENT_TABLES, rollOnTable } from './equipment-tables.mjs';

import {
  getClassKey,
  getClassSpecies,
  getRaceGroup,
  getCastingUpgradeKey,
  buildClassRequirements,
  getEquipmentKit,
  getClassTokenImage,
  isFighter,
  isMagicUser,
  isElf,
  isDwarf,
  isHalfling,
  isDragon,
  isDemihuman
} from './class-keys.mjs';
import { EXPLORATION_ABILITIES } from './fade-rolls.mjs';

// Fixed items added to all characters - Oggetti fissi aggiunti a tutti i personaggi
const FIXED_ITEMS = [
  { uuid: 'Compendium.fade-compendiums.item-compendium.Item.ocHxOKvcCTL4aXcV', qty: 1 }, // Zaino
  { uuid: 'Compendium.fade-compendiums.item-compendium.Item.wqc3Ia6OrM8QKS5I', qty: 1 }, // Sacco a pelo
  { uuid: 'Compendium.fade-compendiums.item-compendium.Item.Hr6A6CQSnqfLxgS9', qty: 1 }, // Scatola dell'acciarino
  { uuid: 'Compendium.fade-compendiums.item-compendium.Item.FiWHs33UbwiJ1sQl', qty: '1d6' }, // Torce
  { uuid: 'Compendium.fade-compendiums.item-compendium.Item.g71I73ETpOuvSgNY', qty: 1 }, // Otre
  { uuid: 'Compendium.fade-compendiums.item-compendium.Item.APdZ1PKHBWeYdGq4', qty: 1 }, // Acqua
  { uuid: 'Compendium.fade-compendiums.item-compendium.Item.IEC3TVun30HQEtWG', qty: 1 }, // Razioni speciali
  { uuid: 'Compendium.fade-compendiums.item-compendium.Item.8qd1fzwJ5gN1ulwm', qty: '3d6' } // Monete d'oro
];

// Height and Weight Tables by Race and Sex (RC Rules) - Tabelle Altezza e Peso per Razza e Sesso (Regole RC)
const HEIGHT_WEIGHT_TABLES = {
  human: {
    heights: ["4'10\"", "5'0\"", "5'2\"", "5'4\"", "5'6\"", "5'8\"", "5'10\"", "6'0\"", "6'2\"", "6'4\""],
    weights: {
      M: [1100, 1200, 1300, 1400, 1500, 1550, 1650, 1750, 1850, 2000], // Male weights in cn (coins)
      F: [1050, 1100, 1200, 1250, 1300, 1400, 1500, 1550, 1650, 1750]  // Female weights in cn (coins)
    }
  },
  dwarf: {
    heights: ["3'8\"", "3'10\"", "4'0\"", "4'2\"", "4'4\""],
    weights: {
      M: [1300, 1400, 1500, 1550, 1650],
      F: [1250, 1350, 1450, 1500, 1600]
    }
  },
  elf: {
    heights: ["4'8\"", "5'0\"", "5'2\"", "5'4\"", "5'6\"", "5'8\""],
    weights: {
      M: [900, 1000, 1100, 1200, 1300, 1400],
      F: [750, 800, 900, 1000, 1100, 1200]
    }
  },
  halfling: {
    heights: ["2'10\"", "3'0\"", "3'2\""],
    weights: {
      M: [580, 600, 620],
      F: [580, 600, 620] // Same for both sexes
    }
  }
};

/**
 * Optional starting kits keyed by FaDe class system.key.
 * Any class without an entry still generates fine — just no kit overlay.
 */
export const CLASS_EQUIPMENT_KITS = {
  B: {
    fixed: [
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.wfea742tl5e0bxLw', qty: 1 },
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.fllzf2TGXt1KEs5F', qty: 1 },
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.rSvhFj4XuO1ihVIk', qty: 1 },
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.c3K7FQMsMFqwELcl', qty: 3 }
    ],
    randomTables: [
      { tableId: '9Pk4ckAUhNdSZeoo', qty: 1 },
      { tableId: 'qefII3Zunz8Gvg7t', qty: 1 },
      { tableId: 'YOfTRPFY6iTK7UWY', qty: 1 },
      { tableId: 'TheqtiqB1nviHVGm', qty: '1d6' }
    ]
  },
  C: {
    fixed: [
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.YHUTAI2L3mwrX3LF', qty: 1 }
    ],
    randomTables: [
      { tableId: 'dcqtCjWpj9srykEE', qty: 1 },
      { tableId: 'hEBnXuAZl6ZialtA', qty: 1 },
      { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' }
    ]
  },
  DR: {
    fixed: [],
    randomTables: [
      { tableId: 'cS7vWrh4LvNPMqD7', qty: 1 },
      { tableId: '9vWUsej1rMUDuF65', qty: 1 },
      { tableId: 'Rd2WQagbBWCD3zOb', qty: '1d6' }
    ]
  },
  E: {
    fixed: [],
    randomTables: [
      { tableId: 'aATDPX9vntwYIhxO', qty: 1 },
      { tableId: 'hEBnXuAZl6ZialtA', qty: 1 },
      { tableId: 'aUxhhOhaOaANMlWB', qty: '1d6' }
    ]
  },
  F: {
    fixed: [],
    randomTables: [
      { tableId: 'c9UmJwIBRLwEttlh', qty: 1 },
      { tableId: 'hEBnXuAZl6ZialtA', qty: 1 },
      { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' }
    ]
  },
  H: {
    fixed: [],
    randomTables: [
      { tableId: 'WVxgQJiPM5TOqnzo', qty: 1 },
      { tableId: 'hEBnXuAZl6ZialtA', qty: 1 },
      { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' }
    ]
  },
  T: {
    fixed: [
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.wfea742tl5e0bxLw', qty: 1 }
    ],
    randomTables: [
      { tableId: '473Z4vxNmPPCQHsb', qty: 1 },
      { tableId: 'hEBnXuAZl6ZialtA', qty: 1 },
      { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' }
    ]
  },
  M: {
    fixed: [
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.fllzf2TGXt1KEs5F', qty: 1 },
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.rSvhFj4XuO1ihVIk', qty: 1 },
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.c3K7FQMsMFqwELcl', qty: 3 }
    ],
    randomTables: [
      { tableId: 'zz6imLGmyofZaXfb', qty: 1 },
      { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' }
    ]
  },
  MY: {
    fixed: [
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.A4nQHbJt1qy5ByzL', qty: 1 },
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.M3tlcSo9qIaqTad9', qty: 1 }
    ],
    randomTables: [
      { tableId: 'Bj10PzlLeaD98oUL', qty: '1d2' }
    ]
  },
  D: {
    fixed: [],
    randomTables: [
      { tableId: 'QvZzndSGsXUZ1Js1', qty: 1 },
      { tableId: 'hEBnXuAZl6ZialtA', qty: 1 },
      { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' }
    ]
  },
};

// Shared kit objects assigned to each class key that uses them (one key → one entry)
const PALADIN_KIT = {
  fixed: [
    { uuid: 'Compendium.fade-compendiums.item-compendium.Item.YHUTAI2L3mwrX3LF', qty: 1 }
  ],
  randomTables: [
    { tableId: 'c9UmJwIBRLwEttlh', qty: 1 },
    { tableId: 'hEBnXuAZl6ZialtA', qty: 1 },
    { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' }
  ]
};
CLASS_EQUIPMENT_KITS.PA = PALADIN_KIT;
CLASS_EQUIPMENT_KITS.PAC = PALADIN_KIT;

const AVENGER_KIT = {
  fixed: [
    { uuid: 'Compendium.fade-compendiums.item-compendium.Item.YHUTAI2L3mwrX3LF', qty: 1 }
  ],
  randomTables: [
    { tableId: 'c9UmJwIBRLwEttlh', qty: 1 },
    { tableId: 'hEBnXuAZl6ZialtA', qty: 1 },
    { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' }
  ]
};
CLASS_EQUIPMENT_KITS.AV = AVENGER_KIT;
CLASS_EQUIPMENT_KITS.AVC = AVENGER_KIT;

export class PGGenerator {
  
  constructor() {
    this.defaultImg = 'icons/svg/mystery-man.svg';
    
    // Equipment tables mapping (UUIDs will need to be configured per world)
    this.equipmentTables = {};
    this.fixedItems = [];
    this.classEquipmentKits = {};
    
    this.explorationAbilities = [];
    this.savingThrows = [];
  }
  
  // ==========================================
  // Main Generation - Generazione Principale
  // ==========================================
  
  async generate(options = {}) {
    const {
      name,
      classId,
      alignment,
      stats,
      level = 1,
      equipment = '__GOLD_START__',
      isRetainer = false,
      folder = null,
      sex = null,
      height = null,
      disposition = 1
    } = options;
    
    // Validate inputs
    if (!classId) {
      ui.notifications.error(game.i18n.localize('NOTIFY.SelectClass'));
      return null;
    }
    
    // When level is a fixed number, random class must allow that level (skip PA/DR/etc. firstLevel 9)
    const levelRaw = String(level ?? '').trim();
    const requestedLevel = /^\d+$/.test(levelRaw) ? parseInt(levelRaw, 10) : null;
    // Height options are race-tagged: `5'0"|elf` — constrain random class to that race
    const { raceGroup: heightRace } = this._parseHeightSelection(height);
    // Stats before class pick so random can honor ability minimums
    const finalStats = stats || this._rollStats();

    // Class resolution only via FaDe fadeFinder (same world→pack rules as the sheet)
    let classItem;
    if (classId === '__RANDOM__') {
      const pool = await this._getClassDocuments();
      const eligibleClasses = [];
      for (const doc of pool) {
        // Dragons only when explicitly selected — never via random
        if (!doc || doc.type !== 'class') continue;
        if (isDragon(doc, getClassSpecies(doc)) || /dragon|drago/i.test(doc.name || '')) continue;
        if (requestedLevel != null && !this._classAllowsLevel(doc, requestedLevel)) continue;
        if (heightRace && getRaceGroup(doc) !== heightRace) continue;
        // Same mins the sheet uses (abilities.*.min) — skip if stats do not qualify
        if (!this.validateClassRequirements(doc, finalStats).valid) continue;
        eligibleClasses.push(doc);
      }
      if (eligibleClasses.length === 0) {
        ui.notifications.error(
          heightRace && requestedLevel != null
            ? game.i18n.format('NOTIFY.NoRandomClassesAtLevelRace', { level: requestedLevel, race: heightRace })
            : requestedLevel != null
              ? game.i18n.format('NOTIFY.NoRandomClassesAtLevel', { level: requestedLevel })
              : heightRace
                ? game.i18n.format('NOTIFY.NoRandomClassesForRace', { race: heightRace })
                : game.i18n.localize('NOTIFY.NoRandomClasses')
        );
        return null;
      }
      classItem = eligibleClasses[Math.floor(Math.random() * eligibleClasses.length)];
    } else {
      classItem = await this._findClassById(classId);
    }
    
    if (!classItem || classItem.type !== 'class') {
      ui.notifications.error(game.i18n.localize('NOTIFY.ClassNotFound'));
      return null;
    }

    // Canonicalize through getClass (exact document class prep uses)
    classItem = await this._resolveCanonicalClass(classItem);
    
    // Evaluate level (support for random/roll formulas)
    const levelNum = await this._evalAsLevel(level, classItem);
    
    // Optional upgrade to a different class item (PA→PAC, AV→AVC) when WIS >= 13
    const classKey = getClassKey(classItem);
    const wisScore = Number(finalStats?.wis) || 0;
    const upgradeKey = getCastingUpgradeKey(classKey);
    
    if (upgradeKey && wisScore >= 13) {
      const castingClass = await game.fade.fadeFinder.getClass(null, upgradeKey);
      if (castingClass) classItem = castingClass;
    }

    // Never create a PC the sheet would mark unqualified (red ability mins)
    const validation = this.validateClassRequirements(classItem, finalStats);
    if (!validation.valid) {
      const issues = validation.issues.join(', ');
      ui.notifications.error(game.i18n.format('NOTIFY.ClassRequirements', { issues }));
      return null;
    }
    
    // Determine folder: only Friendly disposition goes into Party/Seguaci folders
    let targetFolder = null;
    if (disposition === 1) {
      const folderName = folder || (isRetainer
        ? game.i18n.localize('FOLDER.Retainers')
        : game.i18n.localize('FOLDER.Party'));
      targetFolder = await this._getOrCreateFolder(folderName);
    }
    
    // Determine sex for name generation (random if not specified)
    const finalSex = sex || (Math.random() < 0.5 ? 'M' : 'F');
    
    // Generate random values (name by species, not localized class name)
    const finalName = name || await this._generateName(getClassSpecies(classItem), finalSex);
    // FaDe stores English alignment tokens; localize only for display
    let finalAlignment;
    if (alignment === '__RANDOM_MISTIC__') {
      const roll = Math.random();
      if (roll < 0.75) finalAlignment = 'Lawful';
      else if (roll < 0.875) finalAlignment = 'Neutral';
      else finalAlignment = 'Chaotic';
    } else {
      finalAlignment = this._normalizeAlignment(alignment) || this._rollAlignment();
    }
    
    // Authored inputs only — FaDe classSystem fills derived class fields after create
    const actorData = this._buildActorData({
      name: finalName,
      classItem,
      alignment: finalAlignment,
      stats: finalStats,
      level: levelNum,
      isRetainer,
      folder: targetFolder,
      sex: finalSex,
      height,
      disposition
    });
    
    try {
      // Class + final level must be on the actor at create time. An empty class lets
      // FaDe SingleClassSystem treat every update as a "clear class" and re-update forever.
      const actor = await Actor.create(actorData);

      // Drive FaDe prep once at the requested level (saves, thac0, xp.next/bonus, abilities, …)
      await this._applyClassViaFade(actor, classItem, levelNum);
      
      // Add items based on equipment choice
      if (equipment === '__CLASS_KIT__') {
        await this._addClassKitEquipment(actor, classItem, levelNum);
      } else if (equipment === '__RANDOM__') {
        await this._addRandomEquipment(actor);
      } else if (equipment === '__GOLD_START__') {
        await this._addGoldForEquipment(actor, levelNum);
      }
      // __NONE__ = no equipment
      
      await this._addExplorationAbilities(actor);

      // Detect Evil (PA)/(AV) comes from FaDe class specialAbilities via _applyClassViaFade

      ui.notifications.info(game.i18n.format('GENERATOR.Success', { name: finalName, level: levelNum }));
      return actor;
    } catch (err) {
      console.error(`${MODULE_ID} | Error creating character:`, err);
      ui.notifications.error(game.i18n.localize('GENERATOR.Error'));
      return null;
    }
  }

  /**
   * Run FaDe class prep at the final level (saves, abilities, thac0, xp.next/bonus, …).
   * Single-class: do NOT use createActorClass (it forces level 1 then a second update).
   * Multi-class: createActorClass + actorClass level bump.
   * Temporarily disables ability-prompt dialogs for silent chargen.
   */
  async _applyClassViaFade(actor, classItem, levelNum) {
    const classSystem = game.fade.registry.getSystem('classSystem');
    const level = Number(levelNum) || 1;

    const promptKey = 'promptAddClassAbilities';
    const sysId = game.system.id;
    let prevPrompt;
    try {
      prevPrompt = game.settings.get(sysId, promptKey);
      if (prevPrompt === true) await game.settings.set(sysId, promptKey, false);
    } catch (e) {
      prevPrompt = undefined;
    }

    try {
      if (classSystem.isMultiClassSystem) {
        if (!classSystem.createActorClass) return;
        await classSystem.createActorClass(actor, classItem);
        if (level > 1) {
          const key = getClassKey(classItem);
          const actorClass = actor.items.find(i =>
            i.type === 'actorClass' && (i.name === classItem.name || i.system?.key === key)
          );
          if (actorClass) {
            await actorClass.update({ 'system.level': level });
          } else {
            console.warn(`${MODULE_ID} | actorClass not found after createActorClass for ${classItem.name}`);
          }
        }
      } else if (typeof classSystem.onCharacterActorUpdate === 'function') {
        // Actor already has class + level from create; run the same prep as a sheet class/level change once
        await classSystem.onCharacterActorUpdate(actor, {
          system: {
            details: {
              class: classItem.name,
              level
            }
          }
        }, false);
      }
    } finally {
      if (prevPrompt !== undefined) {
        try {
          await game.settings.set(sysId, promptKey, prevPrompt);
        } catch (e) { /* ignore */ }
      }
    }
  }

  /**
   * Parse height select values (`5'0"|elf` or bare `5'0"`).
   * @returns {{ imperialHeight: string|null, raceGroup: string|null }}
   */
  _parseHeightSelection(height) {
    if (!height || height === '__RANDOM__') {
      return { imperialHeight: null, raceGroup: null };
    }
    const raw = String(height);
    if (raw.includes('|')) {
      const [imperialHeight, raceGroup] = raw.split('|');
      const race = (raceGroup || '').toLowerCase();
      return {
        imperialHeight: imperialHeight || null,
        raceGroup: HEIGHT_WEIGHT_TABLES[race] ? race : null
      };
    }
    // Bare height: unique table match only (human/elf share some values)
    const matches = Object.entries(HEIGHT_WEIGHT_TABLES)
      .filter(([, table]) => table.heights.includes(raw))
      .map(([race]) => race);
    return {
      imperialHeight: raw,
      raceGroup: matches.length === 1 ? matches[0] : null
    };
  }

  /** Class level bounds from FaDe class item (`firstLevel` / `maxLevel`). */
  _getClassLevelBounds(classItem) {
    const s = classItem?.system || {};
    const maxLevel = Math.max(1, Number(s.maxLevel) || 36);
    const first = Number(s.firstLevel);
    // firstLevel 0 (e.g. Fighter) → treat as 1 for chargen
    const minLevel = Math.max(1, Number.isFinite(first) ? first : 1);
    return { minLevel, maxLevel };
  }

  _classAllowsLevel(classItem, levelNum) {
    const { minLevel, maxLevel } = this._getClassLevelBounds(classItem);
    const n = Number(levelNum);
    return Number.isFinite(n) && n >= minLevel && n <= maxLevel;
  }

  // Evaluate level input (number, dice roll, or random)
  async _evalAsLevel(input, classItem) {
    const raw = String(input ?? '').trim();
    const { minLevel, maxLevel } = this._getClassLevelBounds(classItem);
    
    // Empty or "__RANDOM__" = random
    if (!raw || raw === '__RANDOM__') {
      return Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
    }
    
    // Plain number — clamp to class bounds (explicit Paladin + level 2 → 9)
    if (/^\d+$/.test(raw)) {
      return Math.min(maxLevel, Math.max(minLevel, parseInt(raw, 10)));
    }
    
    // Dice roll formula
    try {
      const r = await (new Roll(raw)).evaluate();
      let total = Math.floor(Number(r.total) || minLevel);
      return Math.min(maxLevel, Math.max(minLevel, total));
    } catch {
      return minLevel;
    }
  }
  
  // ==========================================
  // Data Builders - Costruttori Dati
  // ==========================================
  
  _buildActorData({ name, classItem, alignment, stats, level = 1, isRetainer, folder, sex, height, disposition = 1 }) {
    const classSystem = classItem.system || {};
    const classKey = getClassKey(classItem);
    const species = getClassSpecies(classItem);
    
    // Determine sex (random if not specified) - Determina sesso (casuale se non specificato)
    const finalSex = sex || (Math.random() < 0.5 ? 'M' : 'F');
    const sexLabel = finalSex === 'M' ? game.i18n.localize('CHAT.Male') : game.i18n.localize('CHAT.Female');
    
    // Race / height table from class species (height values may be tagged `5'0"|elf`)
    const race = getRaceGroup(classItem);
    const { imperialHeight } = this._parseHeightSelection(height);
    
    // Get height and weight from tables - Ottieni altezza e peso dalle tabelle
    const raceTable = HEIGHT_WEIGHT_TABLES[race];
    let finalHeight = imperialHeight;
    let weight = 0;
    
    if (finalHeight) {
      // Use selected height, find corresponding weight - Usa altezza selezionata, trova peso corrispondente
      const heightIndex = raceTable.heights.indexOf(finalHeight);
      if (heightIndex >= 0) {
        weight = raceTable.weights[finalSex][heightIndex];
      } else {
        // Fallback to random - Fallback a casuale
        const randomIndex = Math.floor(Math.random() * raceTable.heights.length);
        finalHeight = raceTable.heights[randomIndex];
        weight = raceTable.weights[finalSex][randomIndex];
      }
    } else {
      // Random height and weight - Altezza e peso casuali
      const randomIndex = Math.floor(Math.random() * raceTable.heights.length);
      finalHeight = raceTable.heights[randomIndex];
      weight = raceTable.weights[finalSex][randomIndex];
    }
    
    // Unit system from module setting (defaults from language on first load)
    const useMetric = game.settings.get(MODULE_ID, 'useMetric');

    // Convert height to cm if using metric system - Converti altezza in cm se usa sistema metrico
    let displayHeight = finalHeight;
    if (useMetric) {
      displayHeight = this._convertHeightToCm(finalHeight);
    }

    // Imperial base from FaDe encumbrance CONFIG; metric is module overlay
    const imperialMaxMove = CONFIG.FADE?.Encumbrance?.Expert?.maxMove
      ?? CONFIG.FADE?.Encumbrance?.Basic?.maxMove
      ?? 120;
    const movementBase = useMetric ? 36 : imperialMaxMove;
    const movementMode = game.fade.registry.getSystem('actorMovement')
      .createDefaultMode('ground', { base: movementBase, turn: movementBase });
    
    // HP from class level hd formula + CON once per level with hdcon
    const levels = classSystem.levels;
    const levelEntry = levels.find(l => l.level === level)
      || [...levels].reverse().find(l => l.level <= level);
    const hpTotal = this._rollHitPoints(levels, level, stats.con, levelEntry);
    
    const nakedAC = CONFIG.FADE?.Armor?.acNaked ?? 9;
    const { xpCurrent } = this._getLevelXP(levelEntry, level, classSystem);
    
    // Build languages - Costruisci lingue
    const languages = this._buildLanguages(classKey, species, alignment, stats.int);
    
    // Calculate weapon mastery points and skill slots - Calcola punti padronanza armi e slot abilità
    const weaponMasteryPoints = this._getWeaponMasteryPoints(classKey, level);
    const skillSlots = this._getSkillSlots(classKey, species, level, stats.int);
    
    // Build GM notes (without languages and XP bonus) - Costruisci note GM (senza lingue e bonus PX)
    const gmNotes = `=== ${game.i18n.localize('MASTERY.Title')} ===<br>${game.i18n.localize('MASTERY.Points')}: ${weaponMasteryPoints}<br><br>=== ${game.i18n.localize('SKILLS.Title')} ===<br>${game.i18n.localize('SKILLS.Slots')}: ${skillSlots}`;
    
    // Get token image - Ottieni immagine token
    const tokenImg = this._getTokenImage(classKey);
    const hasDarkvision = species === 'Elf' || species === 'Dwarf' || isElf(classKey) || isDwarf(classKey);
    const classReqs = buildClassRequirements(classItem);
    const abilityMins = classSystem.abilities || {};
    const abilityBlock = {};
    for (const abil of ['str', 'int', 'wis', 'dex', 'con', 'cha']) {
      const score = Number(stats[abil]) || 0;
      const minScore = classReqs.min[abil] ?? abilityMins[abil]?.min ?? 1;
      abilityBlock[abil] = {
        value: score,
        total: score,
        mod: this._getAbilityMod(abil, score),
        tempMod: 0,
        min: (minScore !== null && minScore !== undefined) ? Number(minScore) || 1 : 1
      };
    }
    
    // Identity + level on create (never leave class empty — FaDe single-class loops on updates).
    // Derived thac0 / saves / xp.next / bonus / title filled by classSystem prep after create.
    const levelNum = Number(level) || 1;
    return {
      name,
      type: 'character',
      img: tokenImg,
      folder: folder?.id || null,
      system: {
        details: {
          class: classItem.name,
          classKey,
          castAsKey: classSystem.castAsKey || null,
          species,
          alignment,
          level: levelNum,
          sex: sexLabel,
          height: displayHeight,
          weight: weight,
          xp: {
            value: String(xpCurrent)
          },
          isNPC: false,
          background: 'PG Generato al volo'
        },
        hp: {
          value: hpTotal,
          max: hpTotal
        },
        ac: {
          base: nakedAC,
          total: nakedAC
        },
        abilities: abilityBlock,
        movement: {
          modifiers: { encumbrance: 1 },
          modes: [movementMode]
        },
        config: {
          firstSpellLevel: Number(classSystem.firstSpellLevel) || 1,
          maxSpellLevel: Number(classSystem.maxSpellLevel || classSystem.spells?.maxSpellLevel) || 0
        },
        isRetainer,
        biography: gmNotes,
        languages: languages,
        gm: { notes: '' }
      },
      prototypeToken: {
        name,
        texture: { src: tokenImg },
        actorLink: !isRetainer,
        disposition: disposition,
        displayBars: 20, // Hovered by Owner
        bar1: { attribute: 'hp' },
        sight: { 
          enabled: true,
          range: hasDarkvision ? 18 : 0,
          visionMode: hasDarkvision ? 'darkvision' : 'basic',
          color: hasDarkvision ? '#3232ff' : null
        },
        detectionModes: hasDarkvision ? {
          basicSight: {
            enabled: false,
            range: 0
          },
          darkvision: {
            enabled: false,
            range: null
          },
          senseAll: {
            enabled: true,
            range: 18
          }
        } : {
          basicSight: {
            enabled: false,
            range: null
          },
          darkvision: {
            enabled: false,
            range: null
          }
        },
        removeDetectionMode: ['darkvision']
      }
    };
  }

  // Starting XP at this level from class levels[] (FaDe sets xp.next / bonus)
  _getLevelXP(levelEntry, _level, _classSystem) {
    return { xpCurrent: levelEntry?.xp || 0 };
  }

  /**
   * Ability score modifier from FaDe abilityScore + userTables (ability-mods-* setting).
   */
  _getAbilityMod(abilityKey, score) {
    const adjustments = game.fade.registry.getSystem('abilityScore').getAdjustments(abilityKey);
    const total = Number(score) || 0;
    const sorted = [...adjustments].sort((a, b) => b.min - a.min);
    const adjustment = sorted.find(item => total >= item.min) ?? sorted[0];
    return Number(adjustment.value) || 0;
  }

  /**
   * Roll HP from the class level's hd formula (via classSystem.getParsedHD).
   * Apply CON mod once for each level row (1..level) with hdcon.
   */
  _rollHitPoints(levels, level, conScore, levelEntry) {
    const levelNum = Number(level) || 1;
    const { numberOfDice, numberOfSides, modifier } =
      game.fade.registry.getSystem('classSystem').getParsedHD(levelEntry.hd);

    const dice = [];
    for (let i = 0; i < numberOfDice; i++) {
      dice.push(Math.floor(Math.random() * numberOfSides) + 1);
    }
    const diceSum = dice.reduce((a, b) => a + b, 0);

    const conMod = this._getAbilityMod('con', conScore);
    const conApplications = levels.filter(l =>
      l.level >= 1 && l.level <= levelNum && l.hdcon
    ).length;
    const conTotal = conMod * conApplications;
    const total = Math.max(1, diceSum + modifier + conTotal);

    console.log(
      `${MODULE_ID} | HP L${levelNum} hd=${levelEntry.hd} | ` +
      `dice[${dice.join('+')}]=${diceSum}` +
      (modifier ? ` mod=${modifier >= 0 ? '+' : ''}${modifier}` : '') +
      ` | CON ${conMod}×${conApplications}=${conTotal} | total=${total}`
    );

    return total;
  }

  // Convert height from feet'inches" format to centimeters - Converti altezza da formato piedi-pollici a centimetri
  // Format: "5'10"" = 5 feet + 10 inches = 177.8 cm - Formato: "5'10"" = 5 piedi + 10 pollici = 177.8 cm
  _convertHeightToCm(heightStr) {
    if (!heightStr || typeof heightStr !== 'string') return heightStr;
    
    // Match pattern like "5'10"" or "4'6"" or "3'8"" - Corrisponde pattern come "5'10"" o "4'6"" o "3'8""
    const match = heightStr.match(/(\d+)'(\d+)"/);
    if (!match) return heightStr;
    
    const feet = parseInt(match[1], 10);
    const inches = parseInt(match[2], 10);
    
    // Convert to cm: 1 foot = 30.48 cm, 1 inch = 2.54 cm - Converti in cm: 1 piede = 30.48 cm, 1 pollice = 2.54 cm
    const totalCm = Math.round((feet * 30.48) + (inches * 2.54));
    
    return `${totalCm} cm`;
  }

  // Build languages string — use class key / species, not localized name
  _buildLanguages(classKey, species, alignment, intScore) {
    if (isDragon(classKey, species)) return '';
    
    const intEffect = this._getIntLanguageEffect(intScore);
    const commonLang = game.i18n.localize('LANGUAGE.Common');

    if (isDwarf(classKey) || species === 'Dwarf') {
      const langs = [game.i18n.localize('LANGUAGE.Dwarven'), game.i18n.localize('LANGUAGE.Gnomish'), game.i18n.localize('LANGUAGE.Goblin'), game.i18n.localize('LANGUAGE.Kobold'), commonLang, alignment, `(${intEffect})`];
      return langs.join(', ');
    }
    if (isElf(classKey) || species === 'Elf') {
      const langs = [game.i18n.localize('LANGUAGE.Elvish'), game.i18n.localize('LANGUAGE.Gnoll'), game.i18n.localize('LANGUAGE.Hobgoblin'), game.i18n.localize('LANGUAGE.Orcish'), commonLang, alignment, `(${intEffect})`];
      return langs.join(', ');
    }
    return `${commonLang}, ${alignment}, (${intEffect})`;
  }

  _getIntLanguageEffect(intScore) {
    const int = Number(intScore) || 0;
    if (int <= 3) return game.i18n.localize('LANGUAGE.IntEffect3');
    if (int <= 5) return game.i18n.localize('LANGUAGE.IntEffect5');
    if (int <= 8) return game.i18n.localize('LANGUAGE.IntEffect8');
    if (int <= 12) return game.i18n.localize('LANGUAGE.IntEffect12');
    if (int <= 15) return game.i18n.localize('LANGUAGE.IntEffect15');
    if (int <= 17) return game.i18n.localize('LANGUAGE.IntEffect17');
    return game.i18n.localize('LANGUAGE.IntEffect18');
  }

  // Calculate weapon mastery points
  _getWeaponMasteryPoints(classKey, level) {
    const fighter = isFighter(classKey);
    const lvl = Number(level) || 1;
    
    const thresholds = [1, 3, 6, 9, 11, 15, 19, 23, 27, 30, 33, 36];
    let points = 0;
    
    if (fighter) {
      for (const t of thresholds) {
        if (lvl >= t) points += 2;
      }
    } else {
      for (const t of thresholds) {
        if (lvl >= t) points++;
      }
    }
    
    return points;
  }

  // Calculate general skill slots - Calcola slot abilità generali
  _getSkillSlots(classKey, species, level, intScore) {
    const lvl = Number(level) || 1;
    const int = Number(intScore) || 0;
    
    const dwarf = isDwarf(classKey) || species === 'Dwarf';
    const elf = isElf(classKey) || species === 'Elf';
    const halfling = isHalfling(classKey) || species === 'Halfling';
    const demihuman = isDemihuman(classKey, species);
    
    let slots = 0;
    
    if (demihuman) {
      if (lvl >= 1) slots = 4;
      if (lvl >= 5) slots += 1;
      if (lvl >= 9) slots += 1;
      if (dwarf && lvl >= 12) {
        const extraLevels = Math.max(0, lvl - 12);
        slots += Math.floor(extraLevels / 4);
      } else if (elf && lvl >= 11) {
        const extraLevels = Math.max(0, lvl - 11);
        slots += Math.floor(extraLevels / 5);
      } else if (halfling && lvl >= 9) {
        const extraLevels = Math.max(0, lvl - 9);
        slots += Math.floor(extraLevels / 6);
      }
    } else {
      const thresholds = [1, 5, 9, 13, 17, 21, 25, 29, 33];
      for (const t of thresholds) {
        if (lvl >= t) slots++;
      }
    }
    
    // INT bonus at level 1 - Bonus INT al livello 1
    if (lvl === 1) {
      if (int >= 18) slots += 3;
      else if (int >= 16) slots += 2;
      else if (int >= 13) slots += 1;
    }
    
    return slots;
  }
  
  // ==========================================
  // Random Generation Helpers - Helper Generazione Casuale
  // ==========================================
  
  _rollStats() {
    const rollStat = () => {
      const dice = Array(4).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
      dice.sort((a, b) => b - a);
      return dice.slice(0, 3).reduce((a, b) => a + b, 0);
    };
    
    return {
      str: rollStat(),
      int: rollStat(),
      wis: rollStat(),
      dex: rollStat(),
      con: rollStat(),
      cha: rollStat()
    };
  }
  
  /** English FaDe alignment tokens only. */
  _rollAlignment() {
    const alignments = ['Lawful', 'Neutral', 'Chaotic'];
    return alignments[Math.floor(Math.random() * alignments.length)];
  }

  /** Map legacy localized / mixed values to FaDe English tokens. */
  _normalizeAlignment(value) {
    if (!value || value === '__RANDOM__') return null;
    const map = {
      Lawful: 'Lawful',
      Neutral: 'Neutral',
      Chaotic: 'Chaotic',
      Legale: 'Lawful',
      Neutrale: 'Neutral',
      Caotico: 'Chaotic'
    };
    return map[value] || null;
  }

  async _generateName(speciesOrClass, sex) {
    // Name tables keyed by species (Human/Elf/Dwarf/Halfling), not localized class name
    return generateName(speciesOrClass, sex);
  }
  
  _getTokenImage(classKey) {
    return getClassTokenImage(classKey, this.defaultImg);
  }
  
  async _getOrCreateFolder(name) {
    let folder = game.folders?.find(f => 
      f.type === 'Actor' && f.name.toLowerCase() === name.toLowerCase()
    );
    
    if (!folder && game.user.isGM) {
      folder = await Folder.create({
        name,
        type: 'Actor',
        parent: null
      });
    }
    
    return folder;
  }
  
  // ==========================================
  // Equipment & Abilities - Equipaggiamento e Abilità
  // ==========================================
  
  /**
   * Helper to roll dice (e.g., "1d6", "3d6") - Helper per tirare dadi (es. "1d6", "3d6")
   */
  _rollDice(dice) {
    if (typeof dice === 'number') return dice;
    if (typeof dice !== 'string') return 1;
    
    const match = dice.match(/(\d+)d(\d+)/);
    if (!match) return parseInt(dice) || 1;
    
    const num = parseInt(match[1]);
    const sides = parseInt(match[2]);
    let total = 0;
    for (let i = 0; i < num; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
  }
  
  /**
   * Import item from UUID and add to actor with quantity - Importa oggetto da UUID e aggiunge all'attore con quantità
   * @returns {boolean} true if successful - @returns {boolean} true se riuscito
   */
  async _importItemFromUuid(actor, uuid, qty) {
    try {
      const item = await fromUuid(uuid);
      if (!item) {
        console.warn(`${MODULE_ID} | ❌ Item not found: ${uuid}`);
        return false;
      }
      
      const itemData = item.toObject();
      itemData.system = itemData.system || {};
      
      // Set quantity if specified - Imposta quantità se specificato
      if (qty && qty !== 1) {
        const quantity = this._rollDice(qty);
        if (itemData.system.quantity !== undefined) {
          itemData.system.quantity = quantity;
        }
      }
      
      await actor.createEmbeddedDocuments('Item', [itemData]);
      return true;
    } catch (err) {
      console.warn(`${MODULE_ID} | ❌ Could not import item ${uuid}:`, err);
      return false;
    }
  }
  
  /**
   * Draw item from table - returns {uuid, name} from embedded table or world table - Estrae oggetto dalla tabella - restituisce {uuid, nome} da tabella incorporata o tabella del mondo
   */
  async _drawFromTable(tableId) {
    // First try embedded tables - Prima prova tabelle incorporate
    const embeddedTable = EQUIPMENT_TABLES[tableId];
    if (embeddedTable) {
      const result = rollOnTable(embeddedTable);
      if (result) {
        return { uuid: result.uuid, name: result.name };
      }
    }
    
    // Fallback to world tables if available - Fallback a tabelle del mondo se disponibili
    try {
      const table = game.tables?.get(tableId);
      if (!table) {
        console.warn(`${MODULE_ID} | ❌ Table not found (embedded or world): ${tableId}`);
        return null;
      }
      
      const draw = await table.draw({ displayChat: false });
      const result = draw?.results?.[0];
      
      if (!result) {
        console.warn(`${MODULE_ID} | ⚠️ No result from table draw: ${tableId}`);
        return null;
      }
      
      const itemName = String(result?.name ?? result?.text ?? 'Sconosciuto').trim();
      let itemUuid = result?.uuid;
      
      // Fix UUID format if needed - Correggi formato UUID se necessario
      if (!itemUuid || itemUuid.includes('TableResult')) {
        if (result?.documentId && result?.documentCollection) {
          itemUuid = `${result.documentCollection}.${result.documentId}`;
        }
      }
      
      // Ensure proper Compendium format - Assicura formato Compendium corretto
      if (itemUuid && !itemUuid.startsWith('Compendium.')) {
        const parts = itemUuid.split('.');
        if (parts.length === 3 && !parts.includes('Item')) {
          itemUuid = `Compendium.${parts[0]}.${parts[1]}.Item.${parts[2]}`;
        } else {
          itemUuid = `Compendium.${itemUuid}`;
        }
      }
      
      return { uuid: itemUuid, name: itemName, document: result?.document };
    } catch (err) {
      console.warn(`${MODULE_ID} | ❌ Could not draw from table ${tableId}:`, err);
      return null;
    }
  }
  
  /**
   * Add fixed items from UUIDs to actor - Aggiunge oggetti fissi da UUID all'attore
   */
  async _addFixedItems(actor) {
    let success = 0;
    let failed = 0;
    for (const itemDef of FIXED_ITEMS) {
      const result = await this._importItemFromUuid(actor, itemDef.uuid, itemDef.qty);
      if (result) success++;
      else failed++;
    }
  }
  
  async _addStartingEquipment(actor, classItemOrKey) {
    // Add fixed base items to all characters - Aggiunge oggetti base fissi a tutti i personaggi
    await this._addFixedItems(actor);
    
    // Add class-specific equipment from kit - Aggiunge equipaggiamento specifico per classe dal kit
    await this._addClassEquipmentFromKit(actor, classItemOrKey);
  }
  
  /**
   * Optional kit overlay — only runs when CLASS_EQUIPMENT_KITS has an entry for the class key.
   */
  async _addClassEquipmentFromKit(actor, classItemOrKey) {
    const classKey = getClassKey(classItemOrKey);
    const kit = getEquipmentKit(CLASS_EQUIPMENT_KITS, classItemOrKey);
    
    if (!kit) {
      // Unknown / unsupported kit key is fine — character still created without a kit
      console.debug(`${MODULE_ID} | No optional equipment kit for class key: ${classKey}`);
      return;
    }
    const mappedName = classKey;
    
    let addedCount = 0;
    let failedCount = 0;
    
    // Add fixed items from kit - Aggiunge oggetti fissi dal kit
    if (kit.fixed) {
      for (const itemDef of kit.fixed) {
        const success = await this._importItemFromUuid(actor, itemDef.uuid, itemDef.qty);
        if (success) addedCount++;
        else failedCount++;
      }
    }
    
    // Roll on random tables and add items to actor (like original macro) - Tira su tabelle casuali e aggiunge oggetti all'attore (come macro originale)
    if (kit.randomTables) {
      const tableResults = [];
      const addedUuids = new Set(); // Track already added items to prevent duplicates - Traccia oggetti già aggiunti per prevenire duplicati
      const weaponTableIds = []; // Track weapon table IDs for potential re-roll - Traccia ID tabelle armi per potenziale ri-tiro
      const assignedWeapons = []; // Track assigned weapon names - Traccia nomi armi assegnate
      
      for (const tableDef of kit.randomTables) {
        const qty = this._rollDice(tableDef.qty);
        
        // Check if this is a weapon table (table ID contains weapon table identifiers) - Controlla se questa è una tabella armi (ID tabella contiene identificatori tabelle armi)
        const isWeaponTable = EQUIPMENT_TABLES[tableDef.tableId]?.name?.toLowerCase().includes('armi');
        if (isWeaponTable) {
          weaponTableIds.push(tableDef.tableId);
        }
        
        for (let i = 0; i < qty; i++) {
          const result = await this._drawFromTable(tableDef.tableId);
          if (result) {
            tableResults.push(result.name);
            // Track weapons for "only dagger" check - Traccia armi per controllo "solo pugnale"
            if (isWeaponTable) {
              assignedWeapons.push(result.name);
            }
            // Skip if this item was already added (prevent duplicates like multiple mirrors) - Salta se questo oggetto è già stato aggiunto (prevenisci duplicati come specchi multipli)
            if (addedUuids.has(result.uuid)) {
              continue;
            }
            // Add the drawn item to actor (like original: result.document or fromUuid) - Aggiungi l'oggetto estratto all'attore (come originale: result.document o fromUuid)
            try {
              let itemData = null;
              if (result.document) {
                itemData = result.document.toObject();
              } else if (result.uuid) {
                const item = await fromUuid(result.uuid);
                if (item) itemData = item.toObject();
              }
              if (itemData) {
                await actor.createEmbeddedDocuments('Item', [itemData]);
                addedUuids.add(result.uuid); // Mark as added
                addedCount++;
                
                // If Dardo is drawn, also give Cerbottana Corta - Se viene estratto Dardo, dai anche Cerbottana Corta
                if (result.name === 'Dardo') {
                  try {
                    const blowgun = await fromUuid('Compendium.fade-compendiums.item-compendium.Item.YWqiQwzhVvxa35sU');
                    if (blowgun) {
                      const blowgunData = blowgun.toObject();
                      await actor.createEmbeddedDocuments('Item', [blowgunData]);
                      addedUuids.add('Compendium.fade-compendiums.item-compendium.Item.YWqiQwzhVvxa35sU');
                      addedCount++;
                    }
                  } catch (blowgunErr) {
                    console.warn(`${MODULE_ID} | ⚠️ Could not add Cerbottana Corta:`, blowgunErr);
                  }
                }
                
                // If Fionda is drawn, also give Biglie di Piombo - Se viene estratta Fionda, dai anche Biglie di Piombo
                if (result.name === 'Fionda') {
                  try {
                    const ammo = await fromUuid('Compendium.fade-compendiums.item-compendium.Item.4gqcAs9PntHmvNIF');
                    if (ammo) {
                      const ammoData = ammo.toObject();
                      await actor.createEmbeddedDocuments('Item', [ammoData]);
                      addedUuids.add('Compendium.fade-compendiums.item-compendium.Item.4gqcAs9PntHmvNIF');
                      addedCount++;
                    }
                  } catch (ammoErr) {
                    console.warn(`${MODULE_ID} | ⚠️ Could not add Biglie di Piombo:`, ammoErr);
                  }
                }
              } else {
                console.warn(`${MODULE_ID} | ⚠️ Could not get item data for: ${result.name}`);
                failedCount++;
              }
            } catch (innerErr) {
              console.warn(`${MODULE_ID} | ❌ Error adding table item ${result.name}:`, innerErr);
              failedCount++;
            }
          } else {
            failedCount++;
          }
        }
      }
      
      // Check if only Pugnale was assigned as weapon and class is not Mage
      const onlyDagger = assignedWeapons.length === 1 && assignedWeapons[0]?.toLowerCase() === 'pugnale';
      
      if (onlyDagger && !isMagicUser(classKey) && weaponTableIds.length > 0) {
        ui.notifications?.info(game.i18n.format('NOTIFY.WeaponAdded', { weapon: assignedWeapons[0] }));
        
        // Try to add another weapon from the first available weapon table - Prova ad aggiungere un'altra arma dalla prima tabella armi disponibile
        const weaponTableId = weaponTableIds[0];
        let extraWeaponAdded = false;
        let attempts = 0;
        const maxAttempts = 10; // Prevent infinite loop - Previene loop infinito
        
        while (!extraWeaponAdded && attempts < maxAttempts) {
          attempts++;
          const extraResult = await this._drawFromTable(weaponTableId);
          
          if (extraResult) {
            // Skip if it's another pugnale or already added - Salta se è un altro pugnale o già aggiunto
            if (extraResult.name?.toLowerCase() === 'pugnale') continue;
            if (addedUuids.has(extraResult.uuid)) continue;
            
            // Add the extra weapon - Aggiungi l'arma extra
            try {
              let extraItemData = null;
              if (extraResult.document) {
                extraItemData = extraResult.document.toObject();
              } else if (extraResult.uuid) {
                const extraItem = await fromUuid(extraResult.uuid);
                if (extraItem) extraItemData = extraItem.toObject();
              }
              
              if (extraItemData) {
                await actor.createEmbeddedDocuments('Item', [extraItemData]);
                addedUuids.add(extraResult.uuid);
                tableResults.push(extraResult.name);
                addedCount++;
                extraWeaponAdded = true;
                ui.notifications?.info(game.i18n.format('NOTIFY.ExtraWeapon', { weapon: extraResult.name }));
                
                // Check for Dardo -> Cerbottana condition - Controlla condizione Dardo -> Cerbottana
                if (extraResult.name === 'Dardo') {
                  try {
                    const blowgun = await fromUuid('Compendium.fade-compendiums.item-compendium.Item.YWqiQwzhVvxa35sU');
                    if (blowgun) {
                      const blowgunData = blowgun.toObject();
                      await actor.createEmbeddedDocuments('Item', [blowgunData]);
                      addedUuids.add('Compendium.fade-compendiums.item-compendium.Item.YWqiQwzhVvxa35sU');
                      addedCount++;
                    }
                  } catch (blowgunErr) {
                    console.warn(`${MODULE_ID} | ⚠️ Could not add Cerbottana Corta:`, blowgunErr);
                  }
                }
                
                // Check for Fionda -> Biglie condition - Controlla condizione Fionda -> Biglie
                if (extraResult.name === 'Fionda') {
                  try {
                    const ammo = await fromUuid('Compendium.fade-compendiums.item-compendium.Item.4gqcAs9PntHmvNIF');
                    if (ammo) {
                      const ammoData = ammo.toObject();
                      await actor.createEmbeddedDocuments('Item', [ammoData]);
                      addedUuids.add('Compendium.fade-compendiums.item-compendium.Item.4gqcAs9PntHmvNIF');
                      addedCount++;
                    }
                  } catch (ammoErr) {
                    console.warn(`${MODULE_ID} | ⚠️ Could not add Biglie di Piombo:`, ammoErr);
                  }
                }
              }
            } catch (extraErr) {
              console.warn(`${MODULE_ID} | ❌ Error adding extra weapon:`, extraErr);
            }
          }
        }
        
        if (!extraWeaponAdded) {
          console.warn(`${MODULE_ID} | ⚠️ Could not add extra weapon after ${maxAttempts} attempts`);
        }
      }
      
      // Store table results in actor flags for reference - Salva risultati tabella nei flag attore per riferimento
      if (tableResults.length > 0) {
        await actor.setFlag(MODULE_ID, 'randomEquipment', tableResults);
      }
    }
    
    // Summary notification - Notifica riepilogo
    if (failedCount > 0) {
      ui.notifications?.info(game.i18n.format('NOTIFY.KitPartial', { class: mappedName, count: addedCount, failed: failedCount }));
    } else {
      ui.notifications?.info(game.i18n.format('NOTIFY.KitAdded', { class: mappedName, count: addedCount }));
    }
    
  }
  
  // Add exploration abilities - Aggiungi abilità esplorazione
  async _addExplorationAbilities(actor) {
    const existingAbilities = actor.items.filter(i => i.type === 'specialAbility').map(i => i.name);

    for (const { uuid } of Object.values(EXPLORATION_ABILITIES)) {
      try {
        const item = await fromUuid(uuid);
        if (!item || existingAbilities.includes(item.name)) continue;
        await actor.createEmbeddedDocuments('Item', [item.toObject()]);
      } catch (e) {
        console.warn(`${MODULE_ID} | Could not add exploration ability:`, uuid, e);
      }
    }
  }
  
  // ==========================================
  // Class Requirements Validation - Validazione Requisiti Classe
  // ==========================================
  
  validateClassRequirements(classItem, stats) {
    const requirements = buildClassRequirements(classItem);
    
    const results = {
      valid: true,
      issues: []
    };
    
    const statKeys = {
      str: 'ABILITY.STR',
      dex: 'ABILITY.DEX',
      con: 'ABILITY.CON',
      int: 'ABILITY.INT',
      wis: 'ABILITY.WIS',
      cha: 'ABILITY.CHA'
    };
    
    for (const [stat, minValue] of Object.entries(requirements.min || {})) {
      const score = Number(stats[stat]) || 0;
      if (score < minValue) {
        results.valid = false;
        const statName = game.i18n.localize(statKeys[stat] || stat.toUpperCase());
        results.issues.push(game.i18n.format('NOTIFY.StatMinRequirement', {
          stat: statName,
          min: minValue
        }));
      }
    }
    
    return results;
  }
  
  _getClassRequirements(classItem) {
    return buildClassRequirements(classItem);
  }

  /**
   * Class definitions from fadeFinder.getClassDefinitions (world then pack).
   * One entry per class key; first occurrence wins (world over pack, matching getClass).
   */
  async _getClassDocuments() {
    const docs = await game.fade.fadeFinder.getClassDefinitions();
    const byKey = new Map();
    for (const doc of docs || []) {
      if (doc?.type !== 'class') continue;
      const key = getClassKey(doc);
      if (!key || byKey.has(key)) continue;
      byKey.set(key, doc);
    }
    return [...byKey.values()];
  }

  /** Find a class by document id via fadeFinder.getClassDefinitions. */
  async _findClassById(classId) {
    if (!classId) return null;
    const docs = await game.fade.fadeFinder.getClassDefinitions();
    return (docs || []).find(c => c.id === classId || c._id === classId) || null;
  }

  /**
   * Resolve the class document fadeFinder.getClass would return for prep/sheet mins.
   */
  async _resolveCanonicalClass(classItem) {
    if (!classItem) return classItem;
    const key = getClassKey(classItem);
    if (key) {
      const byKey = await game.fade.fadeFinder.getClass(null, key);
      if (byKey) return byKey;
    }
    if (classItem.name) {
      const byName = await game.fade.fadeFinder.getClass(classItem.name);
      if (byName) return byName;
    }
    return classItem;
  }
  
  // ==========================================
  // Equipment Type Methods - Metodi Tipo Equipaggiamento
  // ==========================================
  
  async _addClassKitEquipment(actor, classItemOrKey, level) {
    // Add equipment from class kit using CLASS_EQUIPMENT_KITS (keyed via class key)
    await this._addStartingEquipment(actor, classItemOrKey);
  }
  
  async _addRandomEquipment(actor) {
    // Add random generic equipment (without weapons/armor) - just fixed base items - Aggiungi equipaggiamento generico casuale (senza armi/armature) - solo oggetti base fissi
    await this._addFixedItems(actor);
  }
  
  async _addGoldForEquipment(actor, level) {
    // Calculate starting gold: (3d6*10) + 10% per level - Calcola oro iniziale: (3d6*10) + 10% per livello
    const rollGold = () => {
      let total = 0;
      for (let i = 0; i < 3; i++) {
        total += Math.floor(Math.random() * 6) + 1;
      }
      return total * 10;
    };
    
    const baseGold = rollGold();
    const levelBonus = Math.floor(baseGold * (level - 1) * 0.1);
    const totalGold = baseGold + levelBonus;
    
    // Add gold using the actual compendium item - Aggiungi oro usando l'oggetto compendium reale
    const goldUuid = 'Compendium.fade-compendiums.item-compendium.Item.8qd1fzwJ5gN1ulwm';
    try {
      const goldItem = await fromUuid(goldUuid);
      if (goldItem) {
        const itemData = goldItem.toObject();
        itemData.system = itemData.system || {};
        itemData.system.quantity = totalGold;
        await actor.createEmbeddedDocuments('Item', [itemData]);
      }
    } catch (err) {
      console.warn(`${MODULE_ID} | Could not add gold from compendium:`, err);
      // Fallback: try to add to currency system - Fallback: prova ad aggiungere al sistema valuta
      try {
        if (actor.system?.currency) {
          const currentGold = actor.system.currency.gp || 0;
          await actor.update({ 'system.currency.gp': currentGold + totalGold });
        }
      } catch (currencyErr) {
        console.warn(`${MODULE_ID} | Could not add gold to currency:`, currencyErr);
      }
    }
  }
  
}

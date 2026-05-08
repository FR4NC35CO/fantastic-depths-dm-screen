// ==========================================
// PG Generator - Character Generator Logic - Generatore PG - Logica Generatore Personaggi
// Based on PG al Volo macro by FR4NC35C0 - Basato sulla macro PG al Volo di FR4NC35C0
// ==========================================

const MODULE_ID = 'fantastic-depths-dm-screen';

// Import name generation from embedded data tables - Importa generazione nomi da tabelle dati incorporate
import { generateHumanName, generateElfName, generateHalflingName, generateDwarfName, generateName } from './name-tables.mjs';

// Import equipment tables from embedded data - Importa tabelle equipaggiamento da dati incorporati
import { EQUIPMENT_TABLES, rollOnTable } from './equipment-tables.mjs';

// UUIDs for exploration abilities - UUID per abilità di esplorazione
const EXPLORATION_ABILITIES = [
  'Compendium.fade-compendiums.item-compendium.Item.akgcSVIh27fXqbVW',
  'Compendium.fade-compendiums.item-compendium.Item.nPZLQJzGQ7b0g665',
  'Compendium.fade-compendiums.item-compendium.Item.qTQsTNYfcHpEki7V',
  'Compendium.fade-compendiums.item-compendium.Item.BDFBtg7fOKRvlzbd'
];

// UUIDs for saving throws - UUID per tiri salvezza
const SAVING_THROWS = [
  'Compendium.fade-compendiums.item-compendium.Item.j3TIIGM9mWiQXVKp',
  'Compendium.fade-compendiums.item-compendium.Item.TSY8SHAE8ovvNBvu',
  'Compendium.fade-compendiums.item-compendium.Item.J5SgmaRRd8UeZroR',
  'Compendium.fade-compendiums.item-compendium.Item.FWPTVC5W45aZzZMY',
  'Compendium.fade-compendiums.item-compendium.Item.y2oCWVc2M1yTE20R'
];

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

// Class-specific equipment kits (from original PG al Volo macro) - Kit equipaggiamento specifici per classe (dalla macro originale PG al Volo)
const CLASS_EQUIPMENT_KITS = {
  'Bardo': {
    fixed: [
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.wfea742tl5e0bxLw', qty: 1 }, // Attrezzi da scasso
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.fllzf2TGXt1KEs5F', qty: 1 }, // Penna
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.rSvhFj4XuO1ihVIk', qty: 1 }, // Inchiostro
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.c3K7FQMsMFqwELcl', qty: 3 }  // Carta
    ],
    randomTables: [
      { tableId: '9Pk4ckAUhNdSZeoo', qty: 1 }, // Tabella strumento musicale
      { tableId: 'qefII3Zunz8Gvg7t', qty: 1 }, // Tabella armature bardo
      { tableId: 'YOfTRPFY6iTK7UWY', qty: 1 }, // Tabella armi bardo
      { tableId: 'TheqtiqB1nviHVGm', qty: '1d6' } // Tabella Bardo oggetti extra
    ]
  },
  'Chierico': {
    fixed: [
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.YHUTAI2L3mwrX3LF', qty: 1 } // Simbolo sacro
    ],
    randomTables: [
      { tableId: 'dcqtCjWpj9srykEE', qty: 1 }, // Tabella Chierico Armi
      { tableId: 'hEBnXuAZl6ZialtA', qty: 1 }, // Tabella Armature
      { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' } // Tabella oggetti extra
    ]
  },
  'Druido': {
    fixed: [],
    randomTables: [
      { tableId: 'cS7vWrh4LvNPMqD7', qty: 1 }, // Tabella Druido Armi
      { tableId: '9vWUsej1rMUDuF65', qty: 1 }, // Tabella Druido Armatura (SOLO cuoio)
      { tableId: 'Rd2WQagbBWCD3zOb', qty: '1d6' } // Tabella Druido Oggetti Extra
    ]
  },
  'Elfo': {
    fixed: [],
    randomTables: [
      { tableId: 'aATDPX9vntwYIhxO', qty: 1 }, // Tabella Armi Elfo
      { tableId: 'hEBnXuAZl6ZialtA', qty: 1 }, // Tabella Armature
      { tableId: 'aUxhhOhaOaANMlWB', qty: '1d6' } // Tabella Elfo oggetti extra
    ]
  },
  'Guerriero': {
    fixed: [],
    randomTables: [
      { tableId: 'c9UmJwIBRLwEttlh', qty: 1 }, // Tabella Armi Guerriero
      { tableId: 'hEBnXuAZl6ZialtA', qty: 1 }, // Tabella Armature
      { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' } // Tabella oggetti extra
    ]
  },
  'Halfling': {
    fixed: [],
    randomTables: [
      { tableId: 'WVxgQJiPM5TOqnzo', qty: 1 }, // Tabella Armi Halfling
      { tableId: 'hEBnXuAZl6ZialtA', qty: 1 }, // Tabella Armature
      { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' } // Tabella oggetti extra
    ]
  },
  'Ladro': {
    fixed: [
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.wfea742tl5e0bxLw', qty: 1 } // Attrezzi da scasso
    ],
    randomTables: [
      { tableId: '473Z4vxNmPPCQHsb', qty: 1 }, // Tabella Armi Ladro
      { tableId: 'hEBnXuAZl6ZialtA', qty: 1 }, // Tabella Armature
      { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' } // Tabella oggetti extra
    ]
  },
  'Mago': {
    fixed: [
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.fllzf2TGXt1KEs5F', qty: 1 }, // Penna
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.rSvhFj4XuO1ihVIk', qty: 1 }, // Inchiostro
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.c3K7FQMsMFqwELcl', qty: 3 }  // Carta
    ],
    randomTables: [
      { tableId: 'zz6imLGmyofZaXfb', qty: 1 }, // Tabella Armi Mago
      { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' } // Tabella oggetti extra
    ]
  },
  'Mistico': {
    fixed: [
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.A4nQHbJt1qy5ByzL', qty: 1 }, // Bastone ferrato
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.M3tlcSo9qIaqTad9', qty: 1 }  // Colpo senz'armi
    ],
    randomTables: [
      { tableId: 'Bj10PzlLeaD98oUL', qty: '1d2' } // Tabella Mistico Oggetti Extra
    ]
  },
  'Nano': {
    fixed: [],
    randomTables: [
      { tableId: 'QvZzndSGsXUZ1Js1', qty: 1 }, // Tabella Armi Nano
      { tableId: 'hEBnXuAZl6ZialtA', qty: 1 }, // Tabella Armature
      { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' } // Tabella oggetti extra
    ]
  },
  'Paladino': {
    fixed: [
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.YHUTAI2L3mwrX3LF', qty: 1 } // Simbolo sacro
    ],
    randomTables: [
      { tableId: 'c9UmJwIBRLwEttlh', qty: 1 }, // Tabella Armi Guerriero (condivisa)
      { tableId: 'hEBnXuAZl6ZialtA', qty: 1 }, // Tabella Armature
      { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' } // Tabella oggetti extra
    ]
  },
  'Vendicatore': {
    fixed: [
      { uuid: 'Compendium.fade-compendiums.item-compendium.Item.YHUTAI2L3mwrX3LF', qty: 1 } // Simbolo sacro
    ],
    randomTables: [
      { tableId: 'c9UmJwIBRLwEttlh', qty: 1 }, // Tabella Armi Guerriero (condivisa)
      { tableId: 'hEBnXuAZl6ZialtA', qty: 1 }, // Tabella Armature
      { tableId: 'KO8OFvtVeXujoaWL', qty: '1d6' } // Tabella oggetti extra
    ]
  }
};

export class PGGenerator {
  
  constructor() {
    this.classTokenImages = {
      'druido': 'systems/fantastic-depths/assets/img/actor/cleric1a.webp',
      'druid': 'systems/fantastic-depths/assets/img/actor/cleric1a.webp',
      'chierico': 'systems/fantastic-depths/assets/img/actor/cleric2a.webp',
      'cleric': 'systems/fantastic-depths/assets/img/actor/cleric2a.webp',
      'nano': 'systems/fantastic-depths/assets/img/actor/dwarf1a.webp',
      'dwarf': 'systems/fantastic-depths/assets/img/actor/dwarf1a.webp',
      'elfo': 'systems/fantastic-depths/assets/img/actor/elf1a.webp',
      'elf': 'systems/fantastic-depths/assets/img/actor/elf1a.webp',
      'guerriero': 'systems/fantastic-depths/assets/img/actor/fighter1a.webp',
      'fighter': 'systems/fantastic-depths/assets/img/actor/fighter1a.webp',
      'halfling': 'systems/fantastic-depths/assets/img/actor/halfling1a.webp',
      'paladino': 'systems/fantastic-depths/assets/img/actor/hero1.webp',
      'paladino (c)': 'systems/fantastic-depths/assets/img/actor/hero1.webp',
      'paladin': 'systems/fantastic-depths/assets/img/actor/hero1.webp',
      'paladin (c)': 'systems/fantastic-depths/assets/img/actor/hero1.webp',
      'vendicatore': 'systems/fantastic-depths/assets/img/actor/hero1.webp',
      'vendicatore (c)': 'systems/fantastic-depths/assets/img/actor/hero1.webp',
      'avenger': 'systems/fantastic-depths/assets/img/actor/hero1.webp',
      'avenger (c)': 'systems/fantastic-depths/assets/img/actor/hero1.webp',
      'drago': 'systems/fantastic-depths/assets/img/actor/monster1a.webp',
      'dragon': 'systems/fantastic-depths/assets/img/actor/monster1a.webp',
      'ladro': 'systems/fantastic-depths/assets/img/actor/rogue1a.webp',
      'rogue': 'systems/fantastic-depths/assets/img/actor/rogue1a.webp',
      'thief': 'systems/fantastic-depths/assets/img/actor/rogue1a.webp',
      'mistico': 'systems/fantastic-depths/assets/img/actor/rogue2a.webp',
      'mystic': 'systems/fantastic-depths/assets/img/actor/rogue2a.webp',
      'mago': 'systems/fantastic-depths/assets/img/actor/wizard1a.webp',
      'magic-user': 'systems/fantastic-depths/assets/img/actor/wizard1a.webp',
      'bardo': 'systems/fantastic-depths/assets/img/actor/fighter1a.webp'
    };
    
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
    
    // Get class item (handle random selection)
    let classItem;
    if (classId === '__RANDOM__') {
      const allClasses = this._getAllClasses();
      const nonDragonClasses = allClasses.filter(c => !/dragon|drago/i.test(c.name));
      if (nonDragonClasses.length === 0) {
        ui.notifications.error(game.i18n.localize('NOTIFY.NoRandomClasses'));
        return null;
      }
      const randomClass = nonDragonClasses[Math.floor(Math.random() * nonDragonClasses.length)];
      // Get full item from compendium ONLY
      if (randomClass.compendium) {
        const pack = game.packs.get(randomClass.compendium);
        classItem = pack ? await pack.getDocument(randomClass.id) : null;
      }
    } else {
      // Search in compendiums ONLY (never use world items) - Cerca SOLO nei compendium (non usare mai oggetti del mondo)
      for (const pack of game.packs) {
        if (pack.metadata?.type === 'Item' || pack.documentName === 'Item') {
          const doc = await pack.getDocument(classId);
          if (doc && doc.type === 'class') {
            classItem = doc;
            break;
          }
        }
      }
    }
    
    if (!classItem || classItem.type !== 'class') {
      ui.notifications.error(game.i18n.localize('NOTIFY.ClassNotFound'));
      return null;
    }
    
    // Evaluate level (support for random/roll formulas)
    const levelNum = await this._evalAsLevel(level, classItem);
    
    // Validate class requirements
    const finalStats = stats || this._rollStats();
    const validation = this.validateClassRequirements(classItem.name, finalStats);
    if (!validation.valid) {
      const issues = validation.issues.join(', ');
      ui.notifications.warn(game.i18n.format('NOTIFY.ClassRequirements', { issues }));
    }
    
    // Special handling for Paladin/Avenger: use (C) variant if WIS >= 13
    const classNameLower = (classItem.name || '').toLowerCase();
    const isPaladinOrAvenger = /paladino|paladin|vendicatore|avenger/.test(classNameLower);
    const wisScore = Number(finalStats?.wis) || 0;
    
    if (isPaladinOrAvenger && wisScore >= 13) {
      // Look for (C) variant in same compendium
      const castingClassName = classItem.name + ' (C)';
      // Search for (C) variant in compendiums
      for (const pack of game.packs) {
        if (pack.metadata?.type === 'Item' || pack.documentName === 'Item') {
          const allItems = await pack.getDocuments();
          const castingClass = allItems.find(doc => 
            doc.type === 'class' && doc.name === castingClassName
          );
          if (castingClass) {
            classItem = castingClass;
            break;
          }
        }
      }
    }
    
    // Determine folder: only Friendly disposition goes into Party/Seguaci folders
    let targetFolder = null;
    if (disposition === 1) {
      const isItalian = (game.i18n.lang ?? 'en') === 'it';
      const folderName = folder || (isRetainer ? (isItalian ? 'Seguaci' : 'Retainers') : 'Party');
      targetFolder = await this._getOrCreateFolder(folderName);
    }
    
    // Determine sex for name generation (random if not specified)
    const finalSex = sex || (Math.random() < 0.5 ? 'M' : 'F');
    
    // Generate random values
    const finalName = name || await this._generateName(classItem.name, finalSex);
    // Handle alignment: __RANDOM_MISTIC__ = 75% Lawful, 12.5% Neutral, 12.5% Chaotic
    let finalAlignment;
    if (alignment === '__RANDOM_MISTIC__') {
      const roll = Math.random();
      if (roll < 0.75) finalAlignment = game.i18n.localize('ALIGNMENT.Lawful');
      else if (roll < 0.875) finalAlignment = game.i18n.localize('ALIGNMENT.Neutral');
      else finalAlignment = game.i18n.localize('ALIGNMENT.Chaotic');
    } else {
      finalAlignment = alignment || this._rollAlignment();
    }
    
    // Prepare items array including class item first
    const items = [];
    if (classItem) {
      const classItemData = classItem.toObject();
      const classNameLower = (classItem.name || '').toLowerCase();
      const isPaladin = /paladino|paladin/.test(classNameLower);
      const maxSpellLevel = classItem.system?.spells?.maxSpellLevel || classItem.system?.maxSpellLevel || 0;

      // Always ensure spells structure exists to prevent ClassSystem._prepareSpellLevels crash
      classItemData.system = classItemData.system || {};
      if (!classItemData.system.spells) {
        classItemData.system.spells = {
          maxSpellLevel: maxSpellLevel,
          spellSlots: classItem.system?.spells?.spellSlots || [],
          spellList: classItem.system?.spells?.spellList || {}
        };
      }

      // Special handling for Paladin level 9+ - ensure spell slot for Detect Evil
      if (isPaladin && levelNum >= 9 && !classItemData.system.spells.maxSpellLevel) {
        classItemData.system.spells.maxSpellLevel = 1;
        classItemData.system.spells.spellSlots = [{ level: 1, slots: 1 }];
      }
      
      items.push(classItemData);
    }
    
    // Build actor data with level support
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
    
    // Add items to actor data
    if (items.length > 0) {
      actorData.items = items;
    }
    
    // Create the actor
    try {
      const actor = await Actor.create(actorData);
      
      // Add items based on equipment choice
      if (equipment === '__CLASS_KIT__') {
        await this._addClassKitEquipment(actor, classItem.name, levelNum);
      } else if (equipment === '__RANDOM__') {
        await this._addRandomEquipment(actor);
      } else if (equipment === '__GOLD_START__') {
        await this._addGoldForEquipment(actor, levelNum);
      }
      // __NONE__ = no equipment
      
      // Add abilities, exploration, saves
      await this._addClassAbilities(actor, classItem, levelNum);
      await this._addExplorationAbilities(actor);
      await this._addSavingThrows(actor, classItem, levelNum);
      
      // Add Detect Evil spell for Paladin and Avenger (default spell)
      const classNameLower = (classItem?.name || '').toLowerCase();
      if (/paladino|paladin|vendicatore|avenger/.test(classNameLower)) {
        await this._addDetectEvilSpell(actor);
      }
      
      ui.notifications.info(game.i18n.format('GENERATOR.Success', { name: finalName, level: levelNum }));
      return actor;
    } catch (err) {
      console.error(`${MODULE_ID} | Error creating character:`, err);
      ui.notifications.error(game.i18n.localize('GENERATOR.Error'));
      return null;
    }
  }

  // Evaluate level input (number, dice roll, or random)
  async _evalAsLevel(input, classItem) {
    const raw = String(input ?? '').trim();
    const className = (classItem?.name || '').toLowerCase();
    const isDragon = /dragon|drago/.test(className);
    const isHalfling = /halfling|mezzuomo/.test(className);
    const isElf = /elf|elfo/.test(className);
    const isDwarf = /dwarf|nano/.test(className);
    const isMystic = /mystic|mistico/.test(className);
    const isSpecialClass = /paladin|vendicatore|druido/.test(className);
    
    // Determine max level based on class
    let maxLevel = 36;
    if (isDragon) maxLevel = 3;
    else if (isHalfling) maxLevel = 18;
    else if (isElf) maxLevel = 20;
    else if (isDwarf) maxLevel = 22;
    else if (isMystic) maxLevel = 16;
    
    // Determine min level
    let minLevel = 1;
    if (isSpecialClass) minLevel = 9;
    
    // Empty or "__RANDOM__" = random
    if (!raw || raw === '__RANDOM__') {
      return Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
    }
    
    // Plain number
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
    const className = classItem.name;
    const classSystem = classItem.system || {};
    const classNameLower = className.toLowerCase();
    
    // Determine sex (random if not specified) - Determina sesso (casuale se non specificato)
    const finalSex = sex || (Math.random() < 0.5 ? 'M' : 'F');
    const sexLabel = finalSex === 'M' ? game.i18n.localize('CHAT.Male') : game.i18n.localize('CHAT.Female');
    
    // Determine race from class - Determina razza dalla classe
    let race = 'human';
    if (/nano|dwarf/.test(classNameLower)) race = 'dwarf';
    else if (/elfo|elf/.test(classNameLower)) race = 'elf';
    else if (/halfling/.test(classNameLower)) race = 'halfling';
    
    // Get height and weight from tables - Ottieni altezza e peso dalle tabelle
    const raceTable = HEIGHT_WEIGHT_TABLES[race];
    let finalHeight = height;
    let weight = 0;
    
    if (finalHeight && finalHeight !== '__RANDOM__') {
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
    
    // Check if using metric system based on language - Controlla se usa sistema metrico basato sulla lingua
    const useMetric = game.i18n.lang === 'it';

    // Convert height to cm if using metric system - Converti altezza in cm se usa sistema metrico
    let displayHeight = finalHeight;
    if (useMetric) {
      displayHeight = this._convertHeightToCm(finalHeight);
    }

    // Determine movement based on unit system (36 for metric, 120 for imperial) - Determina movimento basato su sistema unità (36 per metrico, 120 per imperiale)
    const movementMax = useMetric ? 36 : 120;
    
    // Special handling for Paladin/Avenger spellcasting (RC rules: cast as Cleric of 1/3 level if WIS >= 13) - Gestione speciale per incantesimi Paladino/Vendicatore (regole RC: lancia come Chierico di 1/3 livello se SAG >= 13)
    const isPaladinOrAvenger = /paladino|paladin|vendicatore|avenger/.test(classNameLower);
    const wisScore = Number(stats?.wis) || 0;
    let maxSpellLevel = Number(classSystem?.maxSpellLevel || classSystem?.spells?.maxSpellLevel || 0);
    
    // If Paladin/Avenger has WIS >= 13, set maxSpellLevel to 7 (same as Cleric) - Se Paladino/Vendicatore ha SAG >= 13, imposta maxSpellLevel a 7 (come Chierico)
    if (isPaladinOrAvenger && wisScore >= 13) {
      maxSpellLevel = 7;
    }
    
    // Get class level data
    const levels = classSystem.levels || [];
    const levelEntry = levels.find(l => l.level === level) || 
                       [...levels].reverse().find(l => l.level <= level) || 
                       levels[0] || { hd: '1d8' };
    const hdStr = levelEntry.hd || '1d8';
    
    // Calculate HP with con mod for level 1, roll for higher levels - Calcola PF con mod CON per livello 1, tira per livelli superiori
    const conMod = this._getConHpMod(stats.con);
    let hpTotal;
    if (level === 1) {
      const hdMatch = hdStr.match(/(\d+)d(\d+)/i);
      if (hdMatch) {
        const dieSize = parseInt(hdMatch[2]);
        hpTotal = Math.max(1, dieSize + conMod);
      } else {
        hpTotal = Math.max(1, 8 + conMod);
      }
    } else {
      hpTotal = this._rollHPForLevel(hdStr, level, conMod);
    }
    
    // Calculate XP values - Calcola valori PX
    const { xpCurrent, xpNext } = this._getLevelXP(levelEntry, level, classSystem);
    
    // Calculate XP bonus based on prime requisites - Calcola bonus PX basato su prerequisiti primari
    const xpBonus = this._calculateXPBonus(classItem, stats);
    
    // Get class title - Ottieni titolo classe
    const classTitle = this._getClassTitle(classItem, level);
    
    // Build languages - Costruisci lingue
    const languages = this._buildLanguages(className, alignment, stats.int);
    
    // Calculate weapon mastery points and skill slots - Calcola punti padronanza armi e slot abilità
    const weaponMasteryPoints = this._getWeaponMasteryPoints(className, level);
    const skillSlots = this._getSkillSlots(className, level, stats.int);
    
    // Build GM notes (without languages and XP bonus) - Costruisci note GM (senza lingue e bonus PX)
    const gmNotes = `=== ${game.i18n.localize('MASTERY.Title')} ===<br>${game.i18n.localize('MASTERY.Points')}: ${weaponMasteryPoints}<br><br>=== ${game.i18n.localize('SKILLS.Title')} ===<br>${game.i18n.localize('SKILLS.Slots')}: ${skillSlots}`;
    
    // Get token image - Ottieni immagine token
    const tokenImg = this._getTokenImage(className);
    
    // Get saves from class - Ottieni tiri salvezza dalla classe
    const saves = classSystem.saves || {};
    let levelSaves = {};
    if (Array.isArray(saves)) {
      const entry = saves.find(s => s.level === level) || 
                    [...saves].reverse().find(s => s.level <= level) || 
                    saves[0];
      if (entry) levelSaves = entry;
    } else {
      levelSaves = saves;
    }
    
    return {
      name,
      type: 'character',
      img: tokenImg,
      folder: folder?.id || null,
      system: {
        details: {
          class: className,
          classId: classItem.id,
          classKey: classSystem.key || '',
          species: classSystem.species || '',
          alignment,
          level: String(level),
          title: classTitle,
          sex: sexLabel,
          height: displayHeight,
          weight: weight,
          xp: { 
            value: String(xpCurrent), 
            bonus: xpBonus,
            next: String(xpNext) 
          },
          isNPC: false,
          background: 'PG Generato al volo'
        },
        hp: {
          value: hpTotal,
          max: hpTotal,
          hd: hdStr
        },
        ac: {
          base: 10,
          total: 10
        },
        abilities: {
          str: { value: stats.str, total: stats.str, mod: 0, tempMod: 0, min: 1 },
          int: { value: stats.int, total: stats.int, mod: 0, tempMod: 0, min: 1 },
          wis: { value: stats.wis, total: stats.wis, mod: 0, tempMod: 0, min: 1 },
          dex: { value: stats.dex, total: stats.dex, mod: 0, tempMod: 0, min: 1 },
          con: { value: stats.con, total: stats.con, mod: 0, tempMod: 0, min: 1 },
          cha: { value: stats.cha, total: stats.cha, mod: 0, tempMod: 0, min: 1 }
        },
        thac0: { value: levelEntry?.thac0 || classSystem.thac0 || 19 },
        movement: { max: movementMax },
        combat: {
          basicProficiency: /mistico|mystic/.test(classNameLower)
        },
        saves: {
          breath: levelSaves.breath || 15,
          poison: levelSaves.poison || 15,
          paralysis: levelSaves.paralysis || 15,
          spell: levelSaves.spell || 15,
          magic: levelSaves.magic || 15
        },
        isRetainer,
        biography: gmNotes,
        languages: languages,
        gm: { notes: '' },
        maxSpellLevel: maxSpellLevel,
        config: {
          maxSpellLevel: maxSpellLevel
        }
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
          range: /elfo|elf|nano|dwarf/.test(classNameLower) ? 18 : 0,
          visionMode: /elfo|elf|nano|dwarf/.test(classNameLower) ? 'darkvision' : 'basic',
          color: /elfo|elf|nano|dwarf/.test(classNameLower) ? '#3232ff' : null
        },
        detectionModes: /elfo|elf|nano|dwarf/.test(classNameLower) ? {
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
        removeDetectionMode: /elfo|elf|nano|dwarf/.test(classNameLower) ? ['darkvision'] : ['darkvision']
      }
    };
  }

  // Get max spell level for class (RC rules) - Ottieni livello massimo incantesimi per classe (regole RC)
  _getMaxSpellLevel(className, stats) {
    const normalized = (className || '').toLowerCase();
    const sagScore = Number(stats?.wis) || 0;
    
    // Spellcasting classes with specific max spell levels
    if (normalized.includes('mago') || normalized.includes('magic-user') || normalized.includes('wizard')) {
      return 9; // Mage
    }
    if (normalized.includes('chierico') || normalized.includes('cleric')) {
      return 7; // Cleric
    }
    if (normalized.includes('elfo') || normalized.includes('elf')) {
      return 5; // Elf
    }
    if (normalized.includes('bardo') || normalized.includes('bard')) {
      return 4; // Bard
    }
    
    // Paladin and Avenger: only if WIS >= 13
    if (normalized.includes('paladino') || normalized.includes('paladin') ||
        normalized.includes('vendicatore') || normalized.includes('avenger')) {
      return sagScore >= 13 ? 7 : 0;
    }
    
    // All other classes (Fighter, Thief, Dwarf, Halfling, Mystic, Druid)
    return 0;
  }

  // Get XP values for level - Ottieni valori PX per livello
  _getLevelXP(levelEntry, level, classSystem) {
    let xpCurrent = 0;
    let xpNext = classSystem.xpNextLevel || 2000;
    
    if (levelEntry) {
      xpCurrent = levelEntry.xp || 0;
      // Find next level XP
      const nextLevelEntry = classSystem.levels?.find(l => l.level === level + 1);
      xpNext = nextLevelEntry?.xp || (xpCurrent + 2000);
    }
    
    return { xpCurrent, xpNext };
  }

  // Calculate HP modifier from CON - Calcola modificatore PF da CON
  _getConHpMod(con) {
    if (con >= 15) return 2;
    if (con >= 12) return 1;
    if (con >= 9) return 0;
    if (con >= 6) return -1;
    return -2;
  }

  // Roll HP for level > 1 - Tira PF per livello > 1
  _rollHPForLevel(hdStr, level, conMod) {
    const hdMatch = hdStr.match(/(\d+)d(\d+)/i);
    if (!hdMatch) return 8 + conMod;
    
    const numDice = parseInt(hdMatch[1]);
    const dieSize = parseInt(hdMatch[2]);
    
    let total = 0;
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * dieSize) + 1;
    }
    
    // Add CON mod per level for levels 1-9 - Aggiungi mod CON per livello per livelli 1-9
    const modLevels = Math.min(level, 9);
    total += conMod * modLevels;
    
    return Math.max(1, total);
  }

  // Calculate XP bonus based on prime requisites (RC rules) - Calcola bonus PX basato su prerequisiti primari (regole RC)
  // Returns: +10, +5, 0, -10, or -20 based on prime requisite scores - Restituisce: +10, +5, 0, -10 o -20 basato sui punteggi dei prerequisiti primari
  _calculateXPBonus(classItem, stats) {
    const primeReqs = classItem?.system?.primeReqs;
    if (!primeReqs || !Array.isArray(primeReqs) || primeReqs.length === 0) return '0';
    
    const className = (classItem?.name || '').toLowerCase();
    const isElf = /elf/.test(className);
    const isHalfling = /halfling|mezzelfo/.test(className);
    const isMystic = /mistico|mystic/.test(className);
    const isBard = /bard/.test(className);
    const isPaladin = /paladino|paladin/.test(className);
    const isAvenger = /vendicatore|avenger/.test(className);
    
    // Get ability scores
    const forVal = Number(stats.str) || 0;
    const intVal = Number(stats.int) || 0;
    const desVal = Number(stats.dex) || 0;
    const sagVal = Number(stats.wis) || 0;
    const carVal = Number(stats.cha) || 0;
    
    // Helper to calculate bonus/penalty for a single ability score (standard classes) - Helper per calcolare bonus/penalità per un singolo punteggio caratteristica (classi standard)
    // RC Rules: 16-18 = +10%, 13-15 = +5%, 9-12 = 0%, 6-8 = -10%, 3-5 = -20%
    const getStandardBonus = (score) => {
      if (score >= 16) return 10;
      if (score >= 13) return 5;
      if (score >= 9) return 0;
      if (score >= 6) return -10;  // 6-8
      return -20; // 3-5
    };
    
    // Helper for Mystic (reduced penalties) - Helper per Mistico (penalità ridotte)
    // RC Rules: 16-18 = +10%, 13-15 = +5%, 9-12 = 0%, 6-8 = -5%, 3-5 = -10%
    const getMysticBonus = (score) => {
      if (score >= 16) return 10;
      if (score >= 13) return 5;
      if (score >= 9) return 0;
      if (score >= 6) return -5;   // 6-8
      return -10; // 3-5
    };
    
    // Helper for Elf (dual: FOR≥13 AND INT) - Helper per Elfo (duale: FOR≥13 E INT)
    // RC Rules: FOR≥13 AND INT 13-15 = +5%, FOR≥13 AND INT 16-18 = +10%, otherwise 0%
    const getElfBonus = (forScore, intScore) => {
      if (forScore >= 13 && intScore >= 16) return 10;
      if (forScore >= 13 && intScore >= 13) return 5;
      return 0; // No penalties for low scores
    };
    
    // Helper for Halfling (dual: FOR or DES) - Helper per Halfling (duale: FOR o DES)
    // RC Rules: FOR≥13 OR DES 13-18 = +5%, FOR≥13 AND DES 13-18 = +10%, otherwise 0%
    const getHalflingBonus = (forScore, desScore) => {
      const hasFor13 = forScore >= 13;
      const hasDes13 = desScore >= 13;
      if (hasFor13 && hasDes13) return 10;
      if (hasFor13 || hasDes13) return 5;
      return 0; // No penalties for low scores
    };
    
    // Special class handling per RC rules - Gestione speciale classi secondo regole RC
    if (isElf) {
      // Elf: FOR≥13 AND INT prime requisites - Elfo: FOR≥13 E INT prerequisiti primari
      return String(getElfBonus(forVal, intVal));
    }
    
    if (isHalfling) {
      // Halfling: FOR OR DES prime requisites - Halfling: FOR O DES prerequisiti primari
      return String(getHalflingBonus(forVal, desVal));
    }
    
    if (isMystic) {
      // Mystic: Single FOR prime requisite (reduced penalties) - Mistico: Prerequisito FOR singolo (penalità ridotte)
      return String(getMysticBonus(forVal));
    }
    
    if (isBard) {
      // Bard: CHA + DES per RC (use standard combined logic) - Bardo: CAR + DES per RC (usa logica combinata standard)
      // RC implies both need to be high, so use AND logic
      if (carVal >= 16 && desVal >= 16) return '10';
      if (carVal >= 13 && desVal >= 13) return '5';
      // Penalties only apply to prime requisites (per B/X), so check if either is low - Le penalità si applicano solo ai prerequisiti primari (per B/X), quindi controlla se uno è basso
      const lowestScore = Math.min(carVal, desVal);
      if (lowestScore <= 5) return '-20';
      if (lowestScore <= 8) return '-10';
      return '0';
    }
    
    if (isPaladin) {
      // Paladin: FOR and SAG prime requisites (RC: must have both FOR≥13 and SAG≥13 for bonus) - Paladino: FOR e SAG prerequisiti primari (RC: deve avere entrambi FOR≥13 e SAG≥13 per bonus)
      if (forVal >= 16 && sagVal >= 13) return '10';
      if (forVal >= 13 && sagVal >= 13) return '5';
      // Penalties per standard rules - Penalità secondo regole standard
      const lowestScore = Math.min(forVal, sagVal);
      if (lowestScore <= 5) return '-20';
      if (lowestScore <= 8) return '-10';
      return '0';
    }
    
    if (isAvenger) {
      // Avenger: Same as Paladin (FOR and SAG) - Vendicatore: Uguale a Paladino (FOR e SAG)
      if (forVal >= 16 && sagVal >= 13) return '10';
      if (forVal >= 13 && sagVal >= 13) return '5';
      const lowestScore = Math.min(forVal, sagVal);
      if (lowestScore <= 5) return '-20';
      if (lowestScore <= 8) return '-10';
      return '0';
    }
    
    // Generic calculation for other classes using primeReqs - Calcolo generico per altre classi usando primeReqs
    // Handle single or dual prime requisites - Gestisci prerequisiti primari singoli o doppi
    if (primeReqs.length === 1) {
      const req = primeReqs[0];
      const ability = (req.ability || '').toLowerCase();
      const score = Number(stats[ability]) || 0;
      return String(getStandardBonus(score));
    } else {
      // Multiple prime requisites - use combined logic - Prerequisiti primari multipli - usa logica combinata
      const scores = primeReqs.map(req => {
        const ability = (req.ability || '').toLowerCase();
        return Number(stats[ability]) || 0;
      });
      
      // For dual requisites, apply combined rules - Per prerequisiti doppi, applica regole combinate
      if (scores.length === 2) {
        const [score1, score2] = scores;
        // Bonus requires both to be high - Il bonus richiede che entrambi siano alti
        if (score1 >= 16 && score2 >= 16) return '10';
        if (score1 >= 13 && score2 >= 13) return '5';
        // Penalty uses the lowest score - La penalità usa il punteggio più basso
        const lowestScore = Math.min(score1, score2);
        if (lowestScore <= 5) return '-20';
        if (lowestScore <= 8) return '-10';
        return '0';
      }
      
      // For 3+ requisites - Per 3+ prerequisiti
      // RC rules: all must be high for bonus, lowest determines penalty - Regole RC: tutti devono essere alti per bonus, il più basso determina penalità
      let hasHigh = true;
      let hasVeryLow = false;
      let hasLow = false;
      let lowestScore = 18;
      
      for (const score of scores) {
        if (score < 13) hasHigh = false;
        if (score <= 5) hasVeryLow = true;
        if (score <= 8) hasLow = true;
        if (score < lowestScore) lowestScore = score;
      }
      
      if (hasHigh) {
        // Check if all are >= 16 for +10 - Controlla se tutti sono >= 16 per +10
        const allVeryHigh = scores.every(s => s >= 16);
        return allVeryHigh ? '10' : '5';
      }
      if (hasVeryLow) return '-20';
      if (hasLow) return '-10';
      return '0';
    }
  }

  // Get class title for level - Ottieni titolo classe per livello
  _getClassTitle(classItem, levelNum) {
    const clsName = (classItem?.name || '').toLowerCase();
    if (/dragon|drago/.test(clsName)) return '';
    
    const levels = classItem?.system?.levels;
    if (!levels || !Array.isArray(levels)) return '';
    
    // Find title for current level - Trova titolo per livello corrente
    const levelData = levels.find(l => l.level === levelNum);
    if (levelData?.title) return levelData.title;
    
    // Find highest title at or below current level - Trova titolo più alto al o sotto livello corrente
    if (levelNum > 1) {
      const levelsWithTitle = levels
        .filter(l => l.title && l.title.trim() !== '')
        .sort((a, b) => b.level - a.level);
      if (levelsWithTitle.length > 0) return levelsWithTitle[0].title;
    }
    
    return '';
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

  // Build languages string - Costruisci stringa lingue
  _buildLanguages(className, alignment, intScore) {
    const cls = (className || '').toLowerCase();
    const isDragon = /dragon|drago/.test(cls);
    if (isDragon) return '';
    
    const isDwarf = /dwarf|nano/.test(cls);
    const isElf = /elf|elfo/.test(cls);
    const isHalfling = /halfling|mezzuomo/.test(cls);
    
    const intEffect = this._getIntLanguageEffect(intScore);
    const commonLang = game.i18n.localize('LANGUAGE.Common');

    if (isDwarf) {
      const langs = [game.i18n.localize('LANGUAGE.Dwarven'), game.i18n.localize('LANGUAGE.Gnomish'), game.i18n.localize('LANGUAGE.Goblin'), game.i18n.localize('LANGUAGE.Kobold'), commonLang, alignment, `(${intEffect})`];
      return langs.join(', ');
    }
    if (isElf) {
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
  _getWeaponMasteryPoints(className, level) {
    const cls = (className || '').toLowerCase();
    const isFighter = /guerrier|fighter/.test(cls);
    const lvl = Number(level) || 1;
    
    const thresholds = [1, 3, 6, 9, 11, 15, 19, 23, 27, 30, 33, 36];
    let points = 0;
    
    if (isFighter) {
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
  _getSkillSlots(className, level, intScore) {
    const cls = (className || '').toLowerCase();
    const lvl = Number(level) || 1;
    const int = Number(intScore) || 0;
    
    const isDwarf = /dwarf|nano/.test(cls);
    const isElf = /elf|elfo/.test(cls);
    const isHalfling = /halfling|mezzuomo/.test(cls);
    const isDemihuman = isDwarf || isElf || isHalfling;
    
    let slots = 0;
    
    if (isDemihuman) {
      if (lvl >= 1) slots = 4;
      if (lvl >= 5) slots += 1;
      if (lvl >= 9) slots += 1;
      if (isDwarf && lvl >= 12) {
        const extraLevels = Math.max(0, lvl - 12);
        slots += Math.floor(extraLevels / 4);
      } else if (isElf && lvl >= 11) {
        const extraLevels = Math.max(0, lvl - 11);
        slots += Math.floor(extraLevels / 5);
      } else if (isHalfling && lvl >= 9) {
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
  
  _rollHP(hd) {
    let total = 0;
    for (let i = 0; i < hd; i++) {
      total += Math.floor(Math.random() * 8) + 1;
    }
    return total;
  }
  
  _rollAlignment() {
    const alignments = [
      game.i18n.localize('ALIGNMENT.Lawful'),
      game.i18n.localize('ALIGNMENT.Neutral'),
      game.i18n.localize('ALIGNMENT.Chaotic')
    ];
    return alignments[Math.floor(Math.random() * alignments.length)];
  }
  async _generateName(className, sex) {
    // Use embedded name tables for instant generation (no async, no Foundry dependencies)
    return generateName(className, sex);
  }

  _getAbilityBonus(score) {
    if (score >= 16) return 2;
    if (score >= 13) return 1;
    if (score <= 5) return -2;
    if (score <= 8) return -1;
    return 0;
  }
  
  _getTokenImage(className) {
    const normalized = (className || '').toLowerCase().trim();
    return this.classTokenImages[normalized] || this.defaultImg;
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
  
  async _addStartingEquipment(actor, className) {
    // Add fixed base items to all characters - Aggiunge oggetti base fissi a tutti i personaggi
    await this._addFixedItems(actor);
    
    // Add class-specific equipment from kit - Aggiunge equipaggiamento specifico per classe dal kit
    await this._addClassEquipmentFromKit(actor, className);
  }
  
  /**
   * Add class equipment from CLASS_EQUIPMENT_KITS - Aggiunge equipaggiamento classe da CLASS_EQUIPMENT_KITS
   */
  async _addClassEquipmentFromKit(actor, className) {
    // Map English class names to Italian - Mappa nomi classi inglesi a italiani
    const classNameMap = {
      'paladin': 'Paladino',
      'paladino': 'Paladino',
      'paladino (c)': 'Paladino',
      'paladin (c)': 'Paladino',
      'cleric': 'Chierico',
      'chierico': 'Chierico',
      'fighter': 'Guerriero',
      'guerriero': 'Guerriero',
      'mage': 'Mago',
      'mago': 'Mago',
      'magic-user': 'Mago',
      'thief': 'Ladro',
      'ladro': 'Ladro',
      'dwarf': 'Nano',
      'nano': 'Nano',
      'elf': 'Elfo',
      'elfo': 'Elfo',
      'halfling': 'Halfling',
      'druid': 'Druido',
      'druido': 'Druido',
      'avenger': 'Vendicatore',
      'vendicatore': 'Vendicatore',
      'avenger (c)': 'Vendicatore',
      'vendicatore (c)': 'Vendicatore',
      'mystic': 'Mistico',
      'mistico': 'Mistico',
      'bard': 'Bardo',
      'bardo': 'Bardo'
    };
    
    const mappedName = classNameMap[className?.toLowerCase()] || className;
    const kit = CLASS_EQUIPMENT_KITS[mappedName] || CLASS_EQUIPMENT_KITS[className];
    
    if (!kit) {
      console.warn(`${MODULE_ID} | ❌ No equipment kit found for class: ${className} (mapped: ${mappedName})`);
      return;
    }
    
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
      
      // Check if only Pugnale was assigned as weapon and class is not Mage - Controlla se è stato assegnato solo Pugnale come arma e la classe non è Mago
      const isMage = /mago|magic-user|wizard/.test(className?.toLowerCase() || '');
      const onlyDagger = assignedWeapons.length === 1 && assignedWeapons[0]?.toLowerCase() === 'pugnale';
      
      if (onlyDagger && !isMage && weaponTableIds.length > 0) {
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
  
  async _addClassAbilities(actor, classItem, levelNum) {
    // Get class abilities based on level - Ottieni abilità classe basate su livello
    const items = [];
    const addedAbilityNames = new Set(); // Track already added abilities to prevent duplicates - Traccia abilità già aggiunte per prevenire duplicati
    const classSystem = classItem?.system || {};
    const className = (classItem?.name || '').toLowerCase();
    const classKey = classSystem?.key || '';
    const levels = classSystem?.levels || [];
    
    // Helper to find ability item in compendiums ONLY - Helper per trovare oggetto abilità SOLO nei compendium
    const findAbilityItem = async (abilityName) => {
      // Search in compendiums ONLY (never use world items) - Cerca SOLO nei compendium (non usare mai oggetti del mondo)
      const packs = game.packs?.filter(p => p.metadata.type === 'Item') || [];
      for (const pack of packs) {
        const compendiumItem = pack.index?.find(i => 
          i.type === 'specialAbility' && 
          i.name?.toLowerCase() === abilityName?.toLowerCase()
        );
        if (compendiumItem) {
          try {
            const fullItem = await pack.getDocument(compendiumItem._id);
            if (fullItem) return fullItem;
          } catch (e) {}
        }
      }
      return null;
    };
    
    // Get description from ability reference or item - Ottieni descrizione da riferimento abilità o oggetto
    const getDescription = (abilityRef, abilityItem) => {
      if (abilityItem?.system?.description) {
        return typeof abilityItem.system.description === 'object' 
          ? abilityItem.system.description?.value || '' 
          : abilityItem.system.description;
      }
      if (abilityRef?.description) {
        return typeof abilityRef.description === 'object' 
          ? abilityRef.description?.value || '' 
          : abilityRef.description;
      }
      return '';
    };
    
    // Import abilities from class definition - Importa abilità da definizione classe
    const importAbilitiesFromClass = async (sourceClass, maxLevel, prefix = '') => {
      const levels = sourceClass?.system?.levels || [];
      const classAbilities = sourceClass?.system?.specialAbilities || [];
      
      // Add special abilities from class definition - Aggiungi abilità speciali da definizione classe
      for (const ability of classAbilities) {
        const abilityLevel = ability.level || ability.requiredLevel || 1;
        if (abilityLevel <= maxLevel) {
          const abilityKey = prefix + ability.name;
          if (addedAbilityNames.has(abilityKey)) continue; // Skip duplicates
          
          const abilityItem = await findAbilityItem(ability.name);
          const description = getDescription(ability, abilityItem);
          
          items.push({
            name: prefix + (ability.name || 'Abilità'),
            type: 'specialAbility',
            img: abilityItem?.img || 'systems/fantastic-depths/assets/img/item/specialAbility.png',
            system: {
              description: description,
              category: abilityItem?.system?.category || ability.category || 'class',
              classKey: classKey,
              shortName: abilityItem?.system?.shortName || ability.shortName || '',
              level: abilityLevel
            }
          });
          addedAbilityNames.add(abilityKey);
        }
      }
      
      // Add level-specific abilities - Aggiungi abilità specifiche per livello
      for (let lvl = 1; lvl <= maxLevel; lvl++) {
        const levelEntry = levels.find(x => x.level === lvl);
        if (levelEntry?.specialAbilities) {
          for (const ability of levelEntry.specialAbilities) {
            const abilityKey = prefix + ability.name;
            if (addedAbilityNames.has(abilityKey)) continue; // Skip duplicates
            
            const abilityItem = await findAbilityItem(ability.name);
            const description = getDescription(ability, abilityItem);
            
            items.push({
              name: prefix + (ability.name || 'Abilità'),
              type: 'specialAbility',
              img: abilityItem?.img || 'systems/fantastic-depths/assets/img/item/specialAbility.png',
              system: {
                description: description,
                category: abilityItem?.system?.category || ability.category || 'class',
                classKey: classKey,
                shortName: abilityItem?.system?.shortName || ability.shortName || '',
                level: lvl
              }
            });
            addedAbilityNames.add(abilityKey);
          }
        }
      }
    };
    
    // Helper to find class item in compendiums ONLY - Helper per trovare oggetto classe SOLO nei compendium
    const findClassItem = async (namePattern) => {
      // Search in compendiums ONLY (never use world items) - Cerca SOLO nei compendium (non usare mai oggetti del mondo)
      const packs = game.packs?.filter(p => p.metadata.type === 'Item') || [];
      for (const pack of packs) {
        const compendiumItem = pack.index?.find(i => 
          namePattern.test(i.name?.toLowerCase()) && i.type === 'class'
        );
        if (compendiumItem) {
          try {
            const fullItem = await pack.getDocument(compendiumItem._id);
            if (fullItem) return fullItem;
          } catch (e) {}
        }
      }
      return null;
    };
    
    // Handle special class combinations (Paladin/Vendicatore, Druido) - Gestisci combinazioni classi speciali (Paladino/Vendicatore, Druido)
    try {
      if (/paladin|paladino|avenger|vendicatore/.test(className)) {
        const fighterClass = await findClassItem(/guerrier|fighter/);
        // Paladins and Avengers are level 9 warriors who change career - import all warrior abilities up to level 9 - Paladini e Vendicatori sono guerrieri di livello 9 che cambiano carriera - importa tutte le abilità guerriero fino al livello 9
        if (fighterClass) {
          await importAbilitiesFromClass(fighterClass, 9, `[${fighterClass.name}] `);
        } else {
          console.warn(`${MODULE_ID} | ⚠️ Could not find Guerriero class for Paladin/Vendicatore abilities`);
        }
      }
      
      if (/druid|druido/.test(className)) {
        const clericClass = await findClassItem(/chierico|cleric/);
        // Druids are level 9 clerics who change career - import all cleric abilities up to level 9 - Druidi sono chierici di livello 9 che cambiano carriera - importa tutte le abilità chierico fino al livello 9
        if (clericClass) {
          await importAbilitiesFromClass(clericClass, 9, `[${clericClass.name}] `);
        } else {
          console.warn(`${MODULE_ID} | ⚠️ Could not find Chierico class for Druid abilities`);
        }
      }
      
      await importAbilitiesFromClass(classItem, levelNum);
    } catch (e) {
      console.warn(`${MODULE_ID} | Error importing class abilities:`, e);
    }
    
    // Create all ability items - Crea tutti gli oggetti abilità
    for (const itemData of items) {
      try {
        await actor.createEmbeddedDocuments('Item', [itemData]);
      } catch (err) {
        console.warn(`${MODULE_ID} | Could not add ability:`, itemData.name, err);
      }
    }
  }

  // Add exploration abilities - Aggiungi abilità esplorazione
  async _addExplorationAbilities(actor) {
    // Get existing ability names to avoid duplicates - Ottieni nomi abilità esistenti per evitare duplicati
    const existingAbilities = actor.items.filter(i => i.type === 'specialAbility').map(i => i.name);
    
    for (const uuid of EXPLORATION_ABILITIES) {
      try {
        const item = await fromUuid(uuid);
        if (item) {
          // Skip if actor already has this ability - Salta se l'attore ha già questa abilità
          if (existingAbilities.includes(item.name)) continue;
          await actor.createEmbeddedDocuments('Item', [item.toObject()]);
        }
      } catch (e) {
        console.warn(`${MODULE_ID} | Could not add exploration ability:`, uuid, e);
      }
    }
  }

  // Add saving throws as special ability items - Aggiungi tiri salvezza come oggetti abilità speciali
  async _addSavingThrows(actor, classItem, levelNum) {
    const saveTypes = [
      { key: 'death', name: 'Veleno o Raggio della Morte', short: 'Morte' },
      { key: 'wand', name: 'Bacchetta Magica', short: 'Bacchetta' },
      { key: 'paralysis', name: 'Pietrificazione o Paralisi', short: 'Pietrificazione' },
      { key: 'breath', name: 'Soffio del Drago', short: 'Soffio' },
      { key: 'spell', name: 'Incantesimi, Verga o Bastone Magico', short: 'Incantesimo' }
    ];
    
    // Get saves data for current level - Ottieni dati tiri salvezza per livello corrente
    const savesData = classItem?.system?.saves || [];
    let levelSaves = {};
    if (Array.isArray(savesData)) {
      const entry = savesData.find(s => s.level === levelNum) || 
                    [...savesData].reverse().find(s => s.level <= levelNum) || 
                    savesData[0];
      if (entry) levelSaves = entry;
    } else {
      levelSaves = savesData;
    }
    
    // Add saving throw items - Aggiungi oggetti tiri salvezza
    for (let i = 0; i < SAVING_THROWS.length; i++) {
      const uuid = SAVING_THROWS[i];
      const saveType = saveTypes[i];
      try {
        const item = await fromUuid(uuid);
        if (item) {
          const itemData = item.toObject();
          // Update target based on class saves - Aggiorna bersaglio basato su tiri salvezza classe
          if (saveType && levelSaves[saveType.key]) {
            itemData.system.target = String(levelSaves[saveType.key]);
            itemData.system.level = levelNum;
          }
          await actor.createEmbeddedDocuments('Item', [itemData]);
        }
      } catch (e) {
        console.warn(`${MODULE_ID} | Could not add saving throw:`, uuid, e);
      }
    }
  }
  
  // ==========================================
  // Class Requirements Validation - Validazione Requisiti Classe
  // ==========================================
  
  validateClassRequirements(className, stats) {
    const requirements = this._getClassRequirements(className);
    
    const results = {
      valid: true,
      issues: []
    };
    
    // Map abbreviazioni inglesi a italiano - Mappa abbreviazioni inglesi a italiano
    const statNames = {
      str: 'FOR',
      dex: 'DES',
      con: 'COS',
      int: 'INT',
      wis: 'SAG',
      cha: 'CAR'
    };
    
    // Check minimum stats - Controlla statistiche minime
    for (const [stat, minValue] of Object.entries(requirements.min || {})) {
      if (stats[stat] < minValue) {
        results.valid = false;
        const statName = statNames[stat] || stat.toUpperCase();
        results.issues.push(`${statName} deve essere almeno ${minValue}`);
      }
    }
    
    return results;
  }
  
  _getClassRequirements(className) {
    const normalized = (className || '').toLowerCase();
    
    const requirements = {
      'bardo': { primeReq: ['int', 'dex'], min: { dex: 12 } },
      'chierico': { primeReq: ['wis'], min: { wis: 9 } },
      'cleric': { primeReq: ['wis'], min: { wis: 9 } },
      'druido': { primeReq: ['wis'], min: { wis: 12 } },
      'elfo': { primeReq: ['str', 'int'], min: { str: 9, int: 9 } },
      'elf': { primeReq: ['str', 'int'], min: { str: 9, int: 9 } },
      'guerriero': { primeReq: ['str'], min: { str: 9 } },
      'fighter': { primeReq: ['str'], min: { str: 9 } },
      'halfling': { primeReq: ['str', 'dex'], min: { str: 9, dex: 9 } },
      'ladro': { primeReq: ['dex'], min: { dex: 9 } },
      'thief': { primeReq: ['dex'], min: { dex: 9 } },
      'mago': { primeReq: ['int'], min: { int: 9 } },
      'magic-user': { primeReq: ['int'], min: { int: 9 } },
      'mistico': { primeReq: ['str', 'dex'], min: { str: 9, dex: 9 } },
      'mystic': { primeReq: ['str', 'dex'], min: { str: 9, dex: 9 } },
      'nano': { primeReq: ['str'], min: { str: 9 } },
      'dwarf': { primeReq: ['str'], min: { str: 9 } },
      'paladino': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 } },
      'vendicatore': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 } }
    };
    
    return requirements[normalized] || { primeReq: [], min: {} };
  }
  
  // Get all classes from world and compendiums - Ottieni tutte le classi dal mondo e compendium
  _getAllClasses() {
    let allClasses = [];
    
    // From world - Dal mondo
    const worldClasses = game.items?.contents?.filter(i => i.type === 'class') || [];
    allClasses.push(...worldClasses);
    
    // From compendiums - Dai compendium
    for (const pack of game.packs) {
      if (pack.metadata?.type === 'Item' || pack.documentName === 'Item') {
        const packClasses = pack.index?.filter(i => i.type === 'class') || [];
        for (const cls of packClasses) {
          allClasses.push({
            id: cls._id || cls.id,
            name: cls.name,
            type: 'class',
            compendium: pack.collection
          });
        }
      }
    }
    
    // Deduplicate by name - Deduplica per nome
    const uniqueClasses = allClasses.filter((item, index, self) => 
      index === self.findIndex(i => i.name.toLowerCase().trim() === item.name.toLowerCase().trim())
    );
    
    return uniqueClasses.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  // ==========================================
  // Equipment Type Methods - Metodi Tipo Equipaggiamento
  // ==========================================
  
  async _addClassKitEquipment(actor, className, level) {
    // Add equipment from class kit using CLASS_EQUIPMENT_KITS constants - Aggiungi equipaggiamento dal kit classe usando costanti CLASS_EQUIPMENT_KITS
    // This uses real items from compendium via UUIDs and rolls on tables - Questo usa oggetti reali da compendium via UUID e tira su tabelle
    await this._addStartingEquipment(actor, className);
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
  
  // Add Detect Evil spell for Paladin and Avenger (default spell)
  async _addDetectEvilSpell(actor) {
    const detectEvilUuid = 'Compendium.fade-compendiums.item-compendium.Item.evcGalskzeP10Rk5';
    try {
      const spell = await fromUuid(detectEvilUuid);
      if (spell) {
        await actor.createEmbeddedDocuments('Item', [spell.toObject()]);
      }
    } catch (err) {
      console.warn(`${MODULE_ID} | Could not add Detect Evil spell:`, err);
    }
  }
}

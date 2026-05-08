// ==========================================
// PG + PX Manager - Module Entry Point
// For Fantastic Depths - Foundry VTT v13/v14
// By FR4NC35C0
// ==========================================

import { PGPXManagerApp } from './pg-px-app.mjs';
import { PGGenerator } from './pg-generator.mjs';
import { PXManager } from './px-manager.mjs';

const MODULE_ID = 'fantastic-depths-dm-screen';

// Global reference to active app instance for auto-refresh
globalThis.activePGPXApp = null;

// Global combat tracking state
globalThis.combatXP = 0;
globalThis.combatId = null;
globalThis.combatants = new Set();

// ==========================================
// Roll Request Handler - Gestore Richieste Tiro
// ==========================================

async function executeRollRequest(actor, rollType, difficultyBonus, showDC, rollMode, flavour) {
  const { type, ability, save, skill, roll } = rollType;
  const difficultyText = showDC ? `bonus difficoltà: ${difficultyBonus >= 0 ? '+' : ''}${difficultyBonus}` : 'bonus difficoltà: ???';
  const flavorText = flavour ? `${flavour} (${difficultyText})` : difficultyText;
  
  // Ability abbreviation mapping - Mappa abbreviazioni caratteristiche
  const abilityLabelMap = {
    'str': game.i18n.lang === 'it' ? 'FOR' : 'STR',
    'dex': game.i18n.lang === 'it' ? 'DES' : 'DEX',
    'int': game.i18n.lang === 'it' ? 'INT' : 'INT',
    'wis': game.i18n.lang === 'it' ? 'SAG' : 'WIS',
    'con': game.i18n.lang === 'it' ? 'COS' : 'CON',
    'cha': game.i18n.lang === 'it' ? 'CAR' : 'CHA'
  };
  
  try {
    if (type === 'ability' && ability) {
      // Roll ability check - Success if 1d20 + bonus difficulty <= ability value
      const abilityData = actor.system?.abilities?.[ability];
      const abilityValue = abilityData?.value || 0;
      
      const formula = `1d20${difficultyBonus >= 0 ? '+' : ''}${difficultyBonus}`;
      const rollResult = new Roll(formula);
      await rollResult.evaluate();
      
      const success = rollResult.total <= abilityValue;
      const successText = success ? (game.i18n.lang === 'it' ? 'Successo' : 'Success') : (game.i18n.lang === 'it' ? 'Fallimento' : 'Failed');
      const successIcon = success ? '<span style="color: #4CAF50; font-weight: bold; font-size: 1.2em;">✓</span>' : '<span style="color: #F44336; font-weight: bold; font-size: 1.2em;">✗</span>';
      
      const abilityLabel = abilityLabelMap[ability] || ability.toUpperCase();
      
      rollResult.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `${successIcon} ${abilityLabel} ${formula} - ${successText} (${rollResult.total} <= ${abilityValue})`,
        rollMode: rollMode
      });
      
      return { success };
      
    } else if (type === 'save' && save) {
      // Roll FaDe saving throw - Success if 1d20 <= save value
      const saveLabelMap = {
        'wand': game.i18n.lang === 'it' ? 'Bacchetta' : 'Wand',
        'spell': game.i18n.lang === 'it' ? 'Incantesimo' : 'Spell',
        'stone': game.i18n.lang === 'it' ? 'Pietrificazione' : 'Stone',
        'breath': game.i18n.lang === 'it' ? 'Soffio' : 'Breath',
        'death': game.i18n.lang === 'it' ? 'Morte' : 'Death'
      };
      
      // Get the save value from the actor's system
      let saveValue = 0;
      const saves = actor.system?.saves || {};
      
      // Map save names to compendium table keys (compendium uses 'paralysis' instead of 'stone')
      const saveKeyMap = {
        'stone': 'paralysis',
        'petrification': 'paralysis',
        'paralysis': 'paralysis',
        'wand': 'wand',
        'spell': 'spell',
        'breath': 'breath',
        'death': 'death'
      };
      const compendiumSaveKey = saveKeyMap[save] || save;
      
      // Map save names to display labels (for flavor text)
      const saveDisplayMap = {
        'stone': game.i18n.lang === 'it' ? 'Pietrificazione' : 'Stone',
        'petrification': game.i18n.lang === 'it' ? 'Pietrificazione' : 'Stone',
        'paralysis': game.i18n.lang === 'it' ? 'Pietrificazione' : 'Stone',
        'wand': game.i18n.lang === 'it' ? 'Bacchetta' : 'Wand',
        'spell': game.i18n.lang === 'it' ? 'Incantesimo' : 'Spell',
        'breath': game.i18n.lang === 'it' ? 'Soffio' : 'Breath',
        'death': game.i18n.lang === 'it' ? 'Morte' : 'Death'
      };
      const saveDisplayLabel = saveDisplayMap[save] || save;
      
      // Try to find save value in savesSpecialAbilityItems
      if (saveValue === 0 && actor.savesSpecialAbilityItems) {
        const saveItem = actor.savesSpecialAbilityItems.find(i => 
          i.system?.save === save || i.system?.save === compendiumSaveKey ||
          i.system?.type === save || i.system?.type === compendiumSaveKey ||
          i.name?.toLowerCase().includes(save) || i.name?.toLowerCase().includes(compendiumSaveKey)
        );
        if (saveItem) {
          saveValue = saveItem.system?.target || saveItem.system?.value || saveItem.system?.bonus || saveItem.system?.mod || 0;
        }
      }
      
      // Try to find save value from class in compendium
      if (saveValue === 0) {
        const characterClass = actor.system?.details?.class;
        const level = actor.system?.details?.level;
        
        if (characterClass && level) {
          // Class name mapping for Italian/English (bidirectional)
          const classNameMap = {
            'Mago': 'Magic-User',
            'Magic-User': 'Mago',
            'Guerriero': 'Fighter',
            'Fighter': 'Guerriero',
            'Chierico': 'Cleric',
            'Cleric': 'Chierico',
            'Ladro': 'Thief',
            'Thief': 'Ladro',
            'Elfo': 'Elf',
            'Elf': 'Elfo',
            'Nano': 'Dwarf',
            'Dwarf': 'Nano',
            'Halfling': 'Halfling',
            'Bardo': 'Bard',
            'Bard': 'Bardo',
            'Druido': 'Druid',
            'Druid': 'Druido',
            'Mistico': 'Mystic',
            'Mystic': 'Mistico',
            'Paladino': 'Paladin',
            'Paladin': 'Paladino',
            'Vendicatore': 'Avenger',
            'Avenger': 'Vendicatore',
            'Paladino (C)': 'Paladin (C)',
            'Vendicatore (C)': 'Avenger (C)'
          };
          
          // Get both Italian and English class names
          const classNames = [characterClass];
          if (classNameMap[characterClass]) {
            classNames.push(classNameMap[characterClass]);
          }
          
          // Search for class item in compendium
          let classItem = null;
          
          // Try to find in world items first
          for (const className of classNames) {
            classItem = game.items.find(i => i.name === className && i.type === 'class');
            if (classItem) break;
          }
          
          // If not found in world, try compendiums
          if (!classItem) {
            for (const pack of game.packs.filter(p => p.documentName === 'Item')) {
              await pack.getIndex();
              for (const className of classNames) {
                const entry = pack.index.find(i => i.name === className && i.type === 'class');
                if (entry) {
                  classItem = await pack.getDocument(entry._id);
                  break;
                }
              }
              if (classItem) break;
            }
          }
          
          if (classItem) {
            // Look for saves table in class item
            const savesTable = classItem.system?.saves || classItem.system?.savingThrows;
            if (savesTable) {
              if (Array.isArray(savesTable)) {
                // Find the element with the lowest level that is >= character level
                let levelData = null;
                let lowestLevel = Infinity;
                for (const entry of savesTable) {
                  if (entry.level && entry.level >= level && entry.level < lowestLevel) {
                    lowestLevel = entry.level;
                    levelData = entry;
                  }
                }
                if (levelData) {
                  // Try to find save value in the level data
                  if (levelData[compendiumSaveKey] !== undefined) {
                    saveValue = levelData[compendiumSaveKey];
                  }
                }
              }
              // Try to find save value for the specific save and level
              if (typeof savesTable === 'object' && !Array.isArray(savesTable)) {
                const levelData = savesTable[level] || savesTable[String(level)];
                if (levelData && levelData[compendiumSaveKey] !== undefined) {
                  saveValue = levelData[compendiumSaveKey];
                } else if (savesTable[compendiumSaveKey] !== undefined) {
                  saveValue = savesTable[compendiumSaveKey];
                }
              }
            }
          }
        }
      }
      
      // Try to find save value in other possible locations
      if (saveValue === 0) {
        const details = actor.system?.details || {};
        if (details[save] !== undefined) {
          saveValue = typeof details[save] === 'number' ? details[save] : details[save].value || details[save].bonus || details[save].mod || 0;
        }
      }
      
      if (saveValue === 0) {
        const combat = actor.system?.combat || {};
        if (combat[save] !== undefined) {
          saveValue = typeof combat[save] === 'number' ? combat[save] : combat[save].value || combat[save].bonus || combat[save].mod || 0;
        }
      }
      
      // Try to find save value in mod
      if (saveValue === 0) {
        const mod = actor.system?.mod || {};
        if (mod.save && mod.save[save] !== undefined) {
          saveValue = typeof mod.save[save] === 'number' ? mod.save[save] : mod.save[save].value || mod.save[save].bonus || mod.save[save].mod || 0;
        }
      }
      
      // Try to find save value in items (special abilities)
      if (saveValue === 0) {
        const items = actor.items?.contents || actor.items || [];
        const saveItems = items.filter(i => i.system?.category === 'saves' || i.type === 'save' || i.name?.toLowerCase().includes(save));
        
        for (const item of saveItems) {
          if (item.system?.value !== undefined) {
            saveValue = item.system.value;
            break;
          } else if (item.system?.bonus !== undefined) {
            saveValue = item.system.bonus;
            break;
          } else if (item.system?.mod !== undefined) {
            saveValue = item.system.mod;
            break;
          }
        }
      }
      
      
      const formula = '1d20';
      const rollResult = new Roll(formula);
      await rollResult.evaluate();
      
      const success = rollResult.total >= saveValue;
      const successText = success ? (game.i18n.lang === 'it' ? 'Successo' : 'Success') : (game.i18n.lang === 'it' ? 'Fallimento' : 'Failed');
      const successIcon = success ? '<span style="color: #4CAF50; font-weight: bold; font-size: 1.2em;">✓</span>' : '<span style="color: #F44336; font-weight: bold; font-size: 1.2em;">✗</span>';
      
      rollResult.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `${successIcon} ${saveDisplayLabel} ${formula} - ${successText} (${rollResult.total} >= ${saveValue})`,
        rollMode: rollMode
      });
      
      return { success };
      
    } else if (type === 'exploration' && skill) {
      // Roll exploration skill (FaDe specific skills) - Success if 1d6 satisfies skill formula
      const skillLabelMap = {
        'findSecretDoors': game.i18n.lang === 'it' ? 'Porte Segrete' : 'Find Secret Doors',
        'forceOpenDoors': game.i18n.lang === 'it' ? 'Forzare Porte' : 'Force Open Doors',
        'listenAtDoors': game.i18n.lang === 'it' ? 'Origliare Porte' : 'Listen at Doors',
        'findTraps': game.i18n.lang === 'it' ? 'Scoprire Trappole' : 'Find Traps'
      };
      
      // Map skill keys to Italian item names for better matching
      const skillNameMap = {
        'findSecretDoors': ['Porte Segrete', 'Detect Secret Door'],
        'forceOpenDoors': ['Forzare Porte', 'Open Door'],
        'listenAtDoors': ['Origliare Porte', 'Listen Door'],
        'findTraps': ['Scoprire Trappole', 'Find Trap']
      };
      
      // Get the skill value from actor items
      let skillValue = 0;
      const possibleNames = skillNameMap[skill] || [skill];
      const skillItem = actor.items.find(i =>
        i.system?.skill === skill || 
        possibleNames.some(name => i.name?.toLowerCase().includes(name.toLowerCase()))
      );
      if (skillItem) {
        skillValue = skillItem.system?.target || skillItem.system?.value || skillItem.system?.bonus || skillItem.system?.mod || 0;
      }
      
      const formula = '1d6';
      const rollResult = new Roll(formula);
      await rollResult.evaluate();
      
      const success = rollResult.total <= skillValue;
      const successText = success ? (game.i18n.lang === 'it' ? 'Successo' : 'Success') : (game.i18n.lang === 'it' ? 'Fallimento' : 'Failed');
      const successIcon = success ? '<span style="color: #4CAF50; font-weight: bold; font-size: 1.2em;">✓</span>' : '<span style="color: #F44336; font-weight: bold; font-size: 1.2em;">✗</span>';
      
      rollResult.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `${successIcon} ${skillLabelMap[skill] || skill} ${formula} - ${successText} (${rollResult.total} <= ${skillValue})`,
        rollMode: rollMode
      });
      
      return { success };
      
    } else if (type === 'roll' && roll) {
      // Generic roll type
      const formula = '1d20';
      const rollResult = new Roll(formula);
      await rollResult.evaluate();
      
      rollResult.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `🎲 ${roll.toUpperCase()} ${formula} - ${rollResult.total}`,
        rollMode: rollMode
      });
      
      return { success: true };
    }
  } catch (err) {
    console.error('[fantastic-depths-dm-screen] Error executing roll request:', err);
    ui.notifications.error(game.i18n.lang === 'it' ? 'Errore nell\'esecuzione del tiro' : 'Error executing roll');
    return { success: false };
  }
}

// ==========================================
// RollTable Name Translation (English -> Italian)
// ==========================================

const ROLLTABLE_TRANSLATIONS = {
  'Rare Jewelry (50k)': 'Gioello Raro (50k)',
  'Common Jewelry (4k)': 'Gioielli Comuni (4k)',
  'Uncommon Jewelry (15k)': 'Gioiello Non-Comune (15k)',
  'Special Treasure Table': 'Tabella Tesoro Speciale',
  'Gem Value Table': 'Tabella Valore Gemme',
  'Jewelry Value Table': 'Tabella Valore Gioielli',
  'Magical Weapon (Basic)': 'Armi Magiche (Base)',
  'Magical Items (Adv.)': 'Oggetti Magici (Avanzato)',
  'Magical Items (Basic)': 'Oggetti Magici (Base)',
  'Magical Items (No Weapons)': 'Oggetti Magici (No Armi)',
  'Sword, Weapon or Armor(Basic)': 'Spada, Arma o Armatura (Base)',
  'Sword, Weapon or Armor (Basic)': 'Spada, Arma o Armatura (Base)',
  'Wishes Ring': 'Anello dei Desideri',
  'Elemental Adaptation Ring': 'Anello dell\'Adattamento Elementale',
  'Weapon Opponents': 'Arma Avversari',
  'Weapons Add. Mod. 10%': 'Armi con Mod. 10%',
  'Weapons Add. Mod. 15%': 'Armi con Mod. 15%',
  'Weapons Add. Mod. 20%': 'Armi con Mod. 20%',
  'Weapons Add. Mod. 25%': 'Armi con Mod. 25%',
  'Weapons Add. Mod. 30%': 'Armi con Mod. 30%',
  'Weapons Add. Mod. 40%': 'Armi con Mod. 40%',
  'Misc. Weapons (Class B)': 'Armi Varie (Classe B)',
  'Misc. Weapons (Class C)': 'Armi Varie (Classe C)',
  'Misc. Weapons (Class D)': 'Armi Varie (Classe D)',
  'Cursed Weapon Check': 'Controllo Arma Maledetta',
  'Cursed Sword Check': 'Controllo Spada Maledetta',
  'Intelligence of Sword': 'Intelligenza della Spada',
  'Additional Weapon Mods. (Swords)': 'Modificatori Arma Addizionale (Spade)',
  'Additional Weapon Mods (Misc)': 'Modificatori Arma Addizionale (Varia)',
  'Extraordinary Power': 'Potere Straordinario',
  'Extraordinary Power (NoReroll)': 'Potere Straordinario (Non Ri-Tira)',
  'Sword Primary Power': 'Spada Potere Primario',
  'Sword Primary Power (NoReroll)': 'Spada Potere Primario (TiroUnico)',
  'Swords (Class C)': 'Spade (Classe C)',
  'Swords (Class D)': 'Spade (Classe D)',
  'Weapon Talents': 'Talenti Arma',
  'Missile Weapons (Class D)': 'Armi a Distanza (Classe D)',
  'Missile Weapons Range (+1)': 'Gittata Armi a Distanza (+1)',
  'Missile Weapons Range (+2)': 'Gittata Armi a Distanza (+2)',
  'Missile Weapons Range (+3)': 'Gittata Armi a Distanza (+3)',
  'Missile Weapons Range (+4)': 'Gittata Armi a Distanza (+4)',
  'Missile Weapons Range (+5)': 'Gittata Armi a Distanza (+5)',
  'Missiles (Class A)': 'Proiettili (Classe A)',
  'Missile Talents': 'Talenti Proiettile',
  'Missile Talent 10%': 'Talento Proiettile 10%',
  'Missile Talent 15%': 'Talento Proiettile 15%',
  'Missile Talent 20%': 'Talento Proiettile 20%',
  'Missile Talent 25%': 'Talento Proiettile 25%',
  'Missile Talent 30%': 'Talento Proiettile 30%',
  'Cursed Armor Check': 'Controllo Armatura Maledetta',
  'AC Mod (Banded, Scale or Leather)': 'Mod CA (Bande, Scaglie o Pelle)',
  'AC Mod (Chain)': 'Mod CA (Maglia)',
  'AC Mod (Plate or Suit)': 'Mod CA (Piastre o Completa)',
  'AC Mod (Shield)': 'Mod CA (Scudo)',
  'Special Power 10%': 'Potere Speciale 10%',
  'Special Power 15%': 'Potere Speciale 15%',
  'Special Power 20%': 'Potere Speciale 20%',
  'Special Power 25%': 'Potere Speciale 25%',
  'Special Power 30%': 'Potere Speciale 30%',
  'Armor Special Powers': 'Poteri Speciali Armatura',
  'Armor Size Table': 'Tabella Dimensioni Armatura',
  'Staff of Element': 'Bastone Elementale',
  'Rod of the Wyrm': 'Verga del Wyrm',
  'Scrolls': 'Pergamene',
  'Cleric/Druid Scroll Spell Count': 'Conteggio Incantesimi su Pergamena (Chierico/Druido)',
  'Magic-User Scroll Spell Count': 'Incantesimi per pergamena - Mago',
  'Spell Catching': 'Intercetta Incantesimo',
  'Magic-User Scroll Spell Level': 'Livello Incantesimo Pergamena - Mago',
  'Cleric/Druid Scroll Spell Level': 'Livello Incantesimo su pergamena (Chierico/Druido)',
  'Spell Scrolls': 'Pergamene Incantesimi',
  'Dragon Control (gemstone)': 'Controllo del Drago (gemma)',
  'Dragon Control (normal)': 'Controllo del Drago (normale)',
  'Dragon Control (main)': 'Controllo del Drago (principale)',
  'Giant Control': 'Controllo Gigante',
  'Antidote Potion': 'Pozione antidoto',
  'Defense Potion': 'Pozione Difensiva',
  'Magic Rings': 'Anelli Magici',
  'Magic Armor': 'Armatura Magica',
  'Missile Weapons & Missiles (Adv.)': 'Armi a Distanza & Proiettili (Avanzato)',
  'Missile Weapon or Missile (Basic)': 'Armi a Distanza & Proiettili (Base)',
  'Misc.Weapons (Adv.)': 'Armi Varie (Avanzato)',
  'Misc. Weapons (Basic)': 'Armi Varie (Base)',
  'Wands, Staves, and Rods': 'Bacchette, Bastoni e Verghe',
  'Miscellaneous Items': 'Oggetti Vari',
  'Scrolls': 'Pergamene',
  'Potions': 'Pozioni',
  'Swords (Advanced)': 'Spade (Avanzato)',
  'Swords (Basic)': 'Spade (Base)',
  'Talisman of Elemental Travel': 'Talismano del Viaggio Elementale',
  'Ointment Type': 'Unguenti',
  'Egg of Wonder Creature Type': 'Uovo delle Meraviglie (Tipo Creatura)',
};

// Helper function to translate roll table names - Funzione helper per tradurre nomi delle tabelle di tiro
function translateRollTableName(englishName) {
  return ROLLTABLE_TRANSLATIONS[englishName] || englishName;
}

// ==========================================
// Hooks & Initialization
// ==========================================

Hooks.once('init', () => {
  console.log(`${MODULE_ID} | Initializing PG + PX Manager...`);
  
  // Register module settings
  registerSettings();
  
  // Preload templates
  preloadTemplates();

});

// Helper: update roll-request chat message with result icon (runs on GM side)
async function updateRollRequestMessage(requestId, actorId, success) {
  const successIcon = success 
    ? '<span class="roll-result-icon" style="color: #4CAF50; font-weight: bold; font-size: 1.2em; margin-left: 10px;">✓</span>' 
    : '<span class="roll-result-icon" style="color: #F44336; font-weight: bold; font-size: 1.2em; margin-left: 10px;">✗</span>';
  
  const chatMessage = game.messages.contents.find(m => m.content?.includes(requestId));
  if (chatMessage) {
    const $content = $(`<div>${chatMessage.content}</div>`);
    const $char = $content.find(`.roll-request-character[data-request-id="${requestId}"][data-actor-id="${actorId}"]`);
    if ($char.length > 0) {
      $char.find('.roll-request-icon').remove();
      $char.find('.roll-result-icon').remove();
      $char.append(successIcon);
      await chatMessage.update({ content: $content.html() });
    }
  }
}

// Import roll tables from compendium into world using English (original) names
// FaDe looks up sub-tables by English name; Babele renames them in the compendium, breaking lookups.
// Solution: keep a copy in the world under the original English name.
async function ensureRollTablesInWorld() {
  if (!game.user.isGM) return;
  const pack = game.packs.get('fade-compendiums.roll-table-compendium');
  if (!pack) return;

  // Build reverse map: Italian name → English name
  const italianToEnglish = {};
  for (const [en, it] of Object.entries(ROLLTABLE_TRANSLATIONS)) {
    italianToEnglish[it] = en;
  }

  const index = await pack.getIndex({ fields: ['name'] });

  // Find folder or create it
  let folder = game.folders.find(f => f.type === 'RollTable' && f.name === 'FaDe-EN-Tables');
  if (!folder) {
    folder = await Folder.create({ name: 'FaDe-EN-Tables', type: 'RollTable', parent: null });
  }

  let imported = 0;
  for (const entry of index) {
    const italianName = entry.name;
    const englishName = italianToEnglish[italianName];
    if (!englishName) continue; // not in our translation map, skip

    // Import from compendium using translated (live) data - Babele translates doc.results in-memory
    const doc = await pack.getDocument(entry._id);
    if (!doc) continue;
    const rawData = doc.toObject();
    // Use translated text from live document results
    const translatedResults = doc.results.map(r => {
      const rObj = r.toObject();
      rObj.text = r.name ?? r.description ?? rObj.text;
      return rObj;
    });

    const existing = game.tables.getName(englishName);
    if (existing) {
      // Update existing table with freshly translated results
      await existing.update({ results: translatedResults });
    } else {
      await RollTable.create({
        ...rawData,
        results: translatedResults,
        name: englishName,
        folder: folder.id,
        _id: undefined
      });
      imported++;
    }
  }
  if (imported > 0) {
    console.log(`[fantastic-depths-dm-screen] Imported ${imported} roll tables to world under English names`);
  }
}

// Patch PlayerCombatForm._updateTrackedActor to add missing null-check (FaDe bug workaround).
// _updateTrackedActor is a class field arrow function (defined per-instance in constructor).
// FaDe registers it as a hook in _onFirstRender — so we patch _onFirstRender on the prototype
// to wrap _updateTrackedActor with a try/catch BEFORE it gets registered as a Foundry hook.
// game.fade.PlayerCombatForm is available after the 'init' hook (FaDe sets game.fade in init).
Hooks.once('afterFadeInit', () => {
  try {
    const PCF = game.fade?.PlayerCombatForm;
    if (!PCF?.prototype?._onFirstRender) {
      console.warn(`${MODULE_ID} | PlayerCombatForm not found, skipping patch`);
      return;
    }
    const origOnFirstRender = PCF.prototype._onFirstRender;
    PCF.prototype._onFirstRender = function(context, options) {
      // Wrap _updateTrackedActor with try/catch before FaDe registers it as a hook
      if (typeof this._updateTrackedActor === 'function' && !this._updateTrackedActor._patched) {
        const origFn = this._updateTrackedActor;
        this._updateTrackedActor = (actor, changes, opts, userId) => {
          try { origFn(actor, changes, opts, userId); } catch(e) { /* FaDe null-check bug - silently ignore */ }
        };
        this._updateTrackedActor._patched = true;
      }
      return origOnFirstRender.call(this, context, options);
    };
    console.log(`${MODULE_ID} | Patched PlayerCombatForm._onFirstRender to wrap _updateTrackedActor`);
  } catch(e) {
    console.warn(`${MODULE_ID} | Could not patch PlayerCombatForm:`, e);
  }
});

Hooks.once('ready', () => {
  console.log(`${MODULE_ID} | Module ready`);

  // Import roll tables with English names so FaDe sub-table lookups work with Babele active
  ensureRollTablesInWorld();

  // GM intercepts whisper messages from players containing roll result data
  Hooks.on('createChatMessage', async (chatMessage, options, userId) => {
    if (!game.user.isGM) return;
    const flagData = chatMessage.getFlag(MODULE_ID, 'rollResult');
    if (!flagData) return;
    
    const { requestId, actorId, success } = chatMessage.flags[MODULE_ID];
    
    // Update the original request message
    await updateRollRequestMessage(requestId, actorId, success);
    
    // Delete the whisper message to keep chat clean
    await chatMessage.delete();
  });

  // Helper to escape regex special characters
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Use event delegation for roll request icons to ensure they work even after chat reload
  $(document).on('click', '.roll-request-icon', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const $icon = $(e.currentTarget);
    const actorId = $icon.data('actor-id');
    const actor = game.actors.get(actorId);
    
    // Check if user is owner or GM
    const isOwner = actor?.testUserPermission(game.user, 'OWNER');
    const isGM = game.user.isGM;
    
    if (!isOwner && !isGM) {
      return;
    }
    
    const difficultyBonus = parseInt($icon.data('difficulty-bonus')) || 0;
    const showDC = $icon.data('show-dc') === 'true';
    const rollMode = $icon.data('roll-mode') || 'public';
    const requestId = $icon.data('request-id');
    let rollTypes = $icon.data('roll-types');
    // Handle both string JSON and object
    if (typeof rollTypes === 'string') {
      rollTypes = JSON.parse(rollTypes || '[]');
    } else {
      rollTypes = rollTypes || [];
    }
    const flavour = $icon.data('flavour') || '';
    
    if (!actor) {
      ui.notifications.error('Actor not found');
      return;
    }
    
    // Execute rolls for each selected type and track success
    let overallSuccess = false;
    for (const rollType of rollTypes) {
      const result = await executeRollRequest(actor, rollType, difficultyBonus, showDC, rollMode, flavour);
      if (result.success) overallSuccess = true;
    }
    
    // Update the roll-request-character in the request message with success/failure icon
    // and persist the change in the ChatMessage database so it survives F5/reload
    if (requestId) {
      if (game.user.isGM) {
        // GM can update content directly
        await updateRollRequestMessage(requestId, actorId, overallSuccess);
      } else {
        // Player creates a hidden whisper message to GM with the roll result data
        // GM intercepts it via createChatMessage hook and updates the request message
        const gmUsers = game.users.filter(u => u.isGM).map(u => u.id);
        await ChatMessage.create({
          content: `<div class="fd-ds-roll-result" data-request-id="${requestId}" data-actor-id="${actorId}" data-success="${overallSuccess}" style="display:none;"></div>`,
          whisper: gmUsers,
          flags: { [MODULE_ID]: { rollResult: true, requestId, actorId, success: overallSuccess } }
        });
      }
    }
  });

  // Hide d20 roll icons for characters not owned by the current player
  Hooks.on('renderChatMessageHTML', (message, html, data) => {
    if (game.user.isGM) return; // GM sees all icons
    const $html = $(html);
    $html.find('.roll-request-character .roll-request-icon').each((i, icon) => {
      const $char = $(icon).closest('.roll-request-character');
      const actorId = $char.data('actor-id');
      if (actorId) {
        const actor = game.actors.get(actorId);
        if (!actor || !actor.isOwner) {
          $(icon).css('display', 'none');
        }
      }
    });
  });

  // Unified hook to handle clicks on treasure links and roll-table execute links
  Hooks.on('renderChatMessageHTML', (message, html, data) => {
    const $html = $(html);
    
    // Handle treasure macro links
    const treasureLinks = $html.find('.pg-px-treasure-link');
    treasureLinks.each((i, link) => {
      $(link).on('click', async (e) => {
        e.preventDefault();
        const uuid = $(link).data('uuid');
        if (!uuid) return;
        
        const lang = game.i18n.lang;
        
        try {
          const doc = await fromUuid(uuid);
          if (doc) {
            await doc.execute();
          }
        } catch (err) {
          console.error('[fantastic-depths-dm-screen] Error executing macro:', err);
          ui.notifications.error(lang === 'it' ? 'Errore nell\'esecuzione della macro' : 'Error executing macro');
        }
      });
    });

    // Handle roll-table execute links
    const rollTableLinks = $html.find('.roll-table-execute-link');
    rollTableLinks.each((i, link) => {
      $(link).on('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Prevent multiple executions
        if ($(link).data('processing') === 'true') {
          return;
        }
        
        $(link).data('processing', 'true');
        const uuid = $(link).data('uuid');
        
        try {
          const table = await fromUuid(uuid);
          if (table) {
            const drawOptions = CONFIG.ChatMessage?.modes?.gmRoll ? { messageMode: 'gmRoll' } : { rollMode: 'gmroll' };
            await table.draw(drawOptions);
          }
        } catch (err) {
          console.error('[fantastic-depths-dm-screen] Error executing roll-table:', err);
          ui.notifications.error('Errore nell\'esecuzione della roll-table');
        } finally {
          // Reset processing flag after a short delay
          setTimeout(() => {
            $(link).data('processing', 'false');
          }, 1000);
        }
      });
    });
  });

  // Note: treasure links and roll-table execute links are handled by renderChatMessageHTML hook
  // Roll request icons use global event delegation to ensure they work even after chat reload
  // Nota: I link treasure e roll-table sono gestiti dall'hook renderChatMessageHTML
  // Le icone roll request usano event delegation globale per funzionare anche dopo il ricaricamento della chat

  // Setup combat tracking hooks
  setupCombatHooks();

  // Set default metric system based on language (only on first load)
  const currentLang = game.settings.get('core', 'language');
  const metricSetting = game.settings.get(MODULE_ID, 'useMetric');
  const metricDefaultSet = game.settings.get(MODULE_ID, 'metricDefaultSet');

  // If this is the first time and language is English, default to imperial (false)
  // User can still manually change it later
  if (!metricDefaultSet && game.user.isGM) {
    const defaultMetric = currentLang === 'it'; // true for Italian, false for English
    game.settings.set(MODULE_ID, 'useMetric', defaultMetric);
    game.settings.set(MODULE_ID, 'metricDefaultSet', true);
    console.log(`${MODULE_ID} | Set default metric system to ${defaultMetric} based on language ${currentLang}`);
  }

  // Create Party/Seguaci folders if missing
  ensureFolders();
});

// Add button to Actor sidebar (GM only)
Hooks.on('renderActorDirectory', (app, html, data) => {
  if (!game.user.isGM) return;
  // V14: html is DOM element, wrap in jQuery
  const $html = $(html);
  const header = $html.find('.directory-header');
  if (!header.length) return;
  
  const button = $(`
    <button class="fd-ds-sidebar-btn" data-tooltip="${game.i18n.localize('BUTTON.Title')}">
      <i class="fas fa-book-open"></i> ${game.i18n.localize('BUTTON.Label')}
    </button>
  `);
  
  button.on('click', () => {
    if (!globalThis.activePGPXApp || !globalThis.activePGPXApp.rendered) {
      globalThis.activePGPXApp = new PGPXManagerApp();
      globalThis.activePGPXApp.render(true);
    } else {
      globalThis.activePGPXApp.bringToFront();
    }
  });
  
  header.append(button);
});

// Add star button to Scene Controls (left sidebar) - positioned after ghost control
Hooks.on('getSceneControlButtons', (controls) => {
  // V14: controls might be a Collection, convert to array
  const controlsArray = Array.isArray(controls) ? controls : Array.from(controls || []);
  
  const tokenGroup = controlsArray.find(c => c.name === 'token');
  
  if (tokenGroup && tokenGroup.tools) {
    // Ensure tools is array
    if (!Array.isArray(tokenGroup.tools)) {
      tokenGroup.tools = Array.from(tokenGroup.tools);
    }
    
    // Find the ghost/hidden tokens control index
    const ghostIndex = tokenGroup.tools.findIndex(t => 
      t?.name === 'invisibleToken' || t?.name === 'hidden' || t?.icon?.includes?.('ghost')
    );
    
    const buttonData = {
      name: 'fantastic-depths-dm-screen',
      title: 'PG+PX Manager',
      icon: 'fas fa-star',
      visible: game.user.isGM,
      onClick: () => {
        if (!globalThis.activePGPXApp || !globalThis.activePGPXApp.rendered) {
          globalThis.activePGPXApp = new PGPXManagerApp();
          globalThis.activePGPXApp.render(true);
        } else {
          globalThis.activePGPXApp.bringToFront();
        }
      },
      button: true
    };
    
    // Insert after ghost button if found, otherwise append
    if (ghostIndex >= 0) {
      tokenGroup.tools.splice(ghostIndex + 1, 0, buttonData);
    } else {
      tokenGroup.tools.push(buttonData);
    }
  }
});

// Add DM Screen button to main action bar (top center) - Aggiunge pulsante DM Screen alla action-bar principale (in alto al centro)
Hooks.on('ready', () => {
  if (!game.user.isGM) return;
  
  // Wait for UI to be fully loaded
  setTimeout(() => {
    try {
      // Find the ui-bottom container (bottom footer)
      const $uiBottom = $('#ui-bottom');
      if (!$uiBottom.length) return;
      
      // Check if button already exists
      if ($uiBottom.find('.fd-ds-action-btn').length > 0) return;
      
      // Create the button with DM Screen icon using hotbar slot classes
      const button = $(`
        <div class="macro-slot fd-ds-action-btn" 
             style="margin: 8px; flex: 0 0 auto; pointer-events: auto;">
          <button class="flexcol fd-ds-btn"
                  data-tooltip="${game.i18n.localize('BUTTON.Title')}"
                  style="width: 50px; height: 50px; pointer-events: auto; border-radius: 24px 24px 5px 5px; background-color: rgba(11, 10, 19, 0.4);"
                  onmouseover="this.style.backgroundColor='#5b4f17'; this.querySelector('i').style.color='#FFD700'"
                  onmouseout="this.style.backgroundColor='rgba(11, 10, 19, 0.4)'; this.querySelector('i').style.color=''">
            <i class="fas fa-book-open" style="font-size: 24px;"></i>
          </button>
        </div>
      `);
      
      // Add click handler directly to the inner button
      button.find('.fd-ds-btn').on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!globalThis.activePGPXApp || !globalThis.activePGPXApp.rendered) {
          globalThis.activePGPXApp = new PGPXManagerApp();
          globalThis.activePGPXApp.render(true);
        } else {
          globalThis.activePGPXApp.bringToFront();
        }
      });
      
      // Insert button before the faded-ui flexrow (hotbar)
      const $fadedUi = $uiBottom.find('.faded-ui');
      if ($fadedUi.length) {
        $fadedUi.before(button);
      } else {
        const $hotbar = $uiBottom.find('.hotbar');
        if ($hotbar.length) {
          $hotbar.before(button);
        } else {
          $uiBottom.append(button);
        }
      }
    } catch (err) {
      console.error('[fantastic-depths-dm-screen] Error adding action bar button:', err);
    }
  }, 1000);
});

// Debounce timer per evitare render multipli ravvicinati
let _updateActorDebounceTimer = null;

// Schedula render del DM Screen nel prossimo frame disponibile dopo un delay
function scheduleDMScreenRender() {
  if (_updateActorDebounceTimer) {
    clearTimeout(_updateActorDebounceTimer);
  }
  _updateActorDebounceTimer = setTimeout(() => {
    requestAnimationFrame(() => {
      if (globalThis.activePGPXApp?.rendered && !isCombatActive() && !isPlayerCombatFormOpen()) {
        globalThis.activePGPXApp.render(true);
      }
    });
  }, 300);
}

// Controlla se la PlayerCombatForm di FaDe è aperta
function isPlayerCombatFormOpen() {
  // V13: ui.windows è un oggetto {id: app}
  if (ui.windows) {
    for (const app of Object.values(ui.windows)) {
      if (app?.constructor?.name === 'PlayerCombatForm' && app.rendered) return true;
    }
  }
  // V14: foundry.applications.instances è una Map
  if (foundry?.applications?.instances) {
    for (const app of foundry.applications.instances.values()) {
      if (app?.constructor?.name === 'PlayerCombatForm' && app.rendered) return true;
    }
  }
  return false;
}

// Controlla se c'è un combattimento attivo
function isCombatActive() {
  return game.combat !== null && game.combat !== undefined;
}

// Auto-refresh when actors are updated (moved between folders, HP changes, etc.)
Hooks.on('updateActor', (actor, changes, options, userId) => {
  if (!globalThis.activePGPXApp || !globalThis.activePGPXApp.rendered) {
    return;
  }

  // Ignora sempre aggiornamenti di declaredAction (PlayerCombatForm di FaDe)
  if (changes.system?.combat?.declaredAction !== undefined ||
      changes.system?.declaredAction !== undefined ||
      changes.flags?.['fantastic-depths']?.declaredAction !== undefined) {
    return;
  }

  // Non fare render se c'è un combat attivo o la Player Combat Form è aperta
  if (isCombatActive() || isPlayerCombatFormOpen()) {
    return;
  }

  // Refresh on folder change
  if (changes.folder !== undefined) {
    scheduleDMScreenRender();
    return;
  }

  // Refresh on HP, level, or XP changes (stats shown in the manager)
  if (changes.system !== undefined) {
    // Check multiple possible HP paths (different systems use different paths)
    const hasHPChange = changes.system.attributes?.hp !== undefined ||
                        changes.system.hp?.value !== undefined ||
                        changes.system.health?.value !== undefined ||
                        changes.system.hitPoints?.value !== undefined;
    const hasLevelChange = changes.system.details?.level !== undefined;
    const hasXPChange = changes.system.details?.xp !== undefined;

    if (hasHPChange || hasLevelChange || hasXPChange) {
      scheduleDMScreenRender();
    }
  }
});

// Also refresh when actors are deleted
Hooks.on('deleteActor', (actor, options, userId) => {
  if (globalThis.activePGPXApp) {
    globalThis.activePGPXApp.render();
  }
});

// Track when app is closed to clear reference
Hooks.on('closeApplication', (app, html) => {
  if (app instanceof PGPXManagerApp) {
    globalThis.activePGPXApp = null;
  }
});

// Replace pause image with custom image using MutationObserver
Hooks.once('ready', () => {
  const pauseObserver = new MutationObserver(() => {
    const figure = document.querySelector('figure#pause');
    if (!figure) return;
    const img = figure.querySelector('img');
    if (img && !img.src.includes('blessed.webp')) {
      img.src = 'systems/fantastic-depths/assets/img/ui/blessed.webp';
    }
  });
  pauseObserver.observe(document.body, { childList: true, subtree: true, attributes: true });
});

// ==========================================
// Combat Tracking Hooks
// ==========================================

function setupCombatHooks() {
  
  // When combat is created, initialize tracking
  Hooks.on('createCombat', async (combat) => {
    if (!game.user.isGM) return;
    globalThis.combatXP = 0;
    globalThis.combatId = combat.id;
    globalThis.combatStarted = false;
    globalThis.combatants.clear();
  });
  
  // When combat is updated, track round progression
  Hooks.on('updateCombat', async (combat, changes) => {
    if (!game.user.isGM) return;
    // Track when combat actually starts (round advances beyond 0)
    if (combat.round > 0 && globalThis.combatId === combat.id) {
      globalThis.combatStarted = true;
    }
  });
  
  // When combat is deleted (End Combat in FaDe goes directly to delete)
  Hooks.on('deleteCombat', async (combat) => {
    if (!game.user.isGM) return;
    console.log(`[fantastic-depths-dm-screen] deleteCombat | combatId: ${globalThis.combatId}, combat.id: ${combat.id}, combatXP: ${globalThis.combatXP}, combatStarted: ${globalThis.combatStarted}`);
    if (globalThis.combatId === combat.id && globalThis.combatXP > 0 && globalThis.combatStarted) {
      // Wait a tick for FaDe's end-combat chat message to appear
      await new Promise(r => setTimeout(r, 300));
      // Check if FaDe posted an "end combat" chat message (only End Combat does this, not Delete Encounter)
      const recentMessages = game.messages.contents.slice(-10);
      const hasEndCombatMessage = recentMessages.some(m => {
        const content = m.content?.toLowerCase() || '';
        return content.includes('combat end') || content.includes('combattimento terminato') ||
               content.includes('end combat') || content.includes('fine combattimento') ||
               content.includes('combat has ended') || content.includes('il combattimento è terminato') ||
               content.includes('combat encounter has ended');
      });
      console.log(`[fantastic-depths-dm-screen] deleteCombat | hasEndCombatMessage: ${hasEndCombatMessage}, last msg: "${recentMessages.at(-1)?.content?.substring(0,80)}"`);
      if (hasEndCombatMessage) {
        await processCombatEnd(combat);
      } else {
        // Delete Encounter - reset without processing
        globalThis.combatXP = 0;
        globalThis.combatId = null;
        globalThis.combatStarted = false;
        globalThis.combatants.clear();
      }
    } else if (globalThis.combatId === combat.id) {
      // Reset tracking without processing (encounter deleted before starting)
      globalThis.combatXP = 0;
      globalThis.combatId = null;
      globalThis.combatStarted = false;
      globalThis.combatants.clear();
    }
  });
  
  // When combatant is added, accumulate XP if hostile
  Hooks.on('createCombatant', async (combatant, options, userId) => {
    if (!game.user.isGM) return;
    const combat = combatant.combat;
    
    // Initialize if this is our first combatant
    if (!globalThis.combatId && combat) {
      globalThis.combatId = combat.id;
      globalThis.combatXP = 0;
      globalThis.combatants.clear();
    }
    
    // Skip if not our tracked combat
    if (combat && combat.id !== globalThis.combatId) {
      return;
    }
    
    const token = combatant.token;
    const actor = combatant.actor;
    
    // Check if token is hostile (disposition -1)
    if (token?.disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE) {
      const xpAward = actor?.system?.details?.xpAward || 0;
      if (xpAward > 0) {
        globalThis.combatXP += xpAward;
      }
      // Track combatant for treasure lookup (store actor ID)
      if (actor?.id) {
        globalThis.combatants.add(actor.id);
      }
    }
  });
  
}

async function processCombatEnd(combat) {
  // Prevent double execution from async race conditions
  if (globalThis._processingCombatEnd) return;
  globalThis._processingCombatEnd = true;
  
  // Process treasure tables from defeated monsters - Elabora le tabelle tesoro dai mostri sconfitti
  await processCombatTreasure(combat);
  
  // Save combat XP before resetting - Salva i PX di combattimento prima del reset
  const combatXPToApply = globalThis.combatXP;
  
  // Reset tracking - Resetta il tracciamento
  globalThis.combatXP = 0;
  globalThis.combatId = null;
  globalThis.combatStarted = false;
  globalThis.combatants.clear();
  globalThis._processingCombatEnd = false;
  
  // If no XP to apply, do nothing - Se non ci sono PX da applicare, non fare nulla
  if (combatXPToApply <= 0) {
    console.log(`[${MODULE_ID}] processCombatEnd | No XP to apply (combatXPToApply: ${combatXPToApply}), returning.`);
    return;
  }
  
  console.log(`[${MODULE_ID}] processCombatEnd | combatXPToApply: ${combatXPToApply}, appOpen: ${!!(globalThis.activePGPXApp && globalThis.activePGPXApp.rendered)}, currentTab: ${globalThis.activePGPXApp?.currentTab}`);
  
  // If app is open, apply XP - Se l'app è aperta, applica i PX
  if (globalThis.activePGPXApp && globalThis.activePGPXApp.rendered) {
    const isOnAwardTab = globalThis.activePGPXApp.currentTab === 'award';
    console.log(`[${MODULE_ID}] processCombatEnd | App OPEN, isOnAwardTab: ${isOnAwardTab}`);
    
    if (!isOnAwardTab) {
      globalThis.activePGPXApp.currentTab = 'award';
      await globalThis.activePGPXApp.render(true);
      setTimeout(() => {
        console.log(`[${MODULE_ID}] processCombatEnd | setTimeout fired, calling _applyCombatXP(${combatXPToApply})`);
        globalThis.activePGPXApp?._applyCombatXP(combatXPToApply);
      }, 600);
    } else {
      console.log(`[${MODULE_ID}] processCombatEnd | Calling _applyCombatXP directly with ${combatXPToApply}`);
      globalThis.activePGPXApp._applyCombatXP(combatXPToApply);
    }
  } else {
    // App is closed - save XP to globalXP setting and open app - App chiusa: salva XP in globalXP e apri l'app
    console.log(`[${MODULE_ID}] processCombatEnd | App CLOSED, saving to settings and opening`);
    
    // Get current saved XP and accumulate - Ottieni XP salvati e accumula
    const currentSavedXP = game.settings.get(MODULE_ID, 'globalXP') || 0;
    const totalXP = currentSavedXP + combatXPToApply;
    
    // Save accumulated XP - Salva XP accumulati
    await game.settings.set(MODULE_ID, 'globalXP', totalXP);
    console.log(`[${MODULE_ID}] processCombatEnd | Saved totalXP: ${totalXP} to settings (current: ${currentSavedXP} + combat: ${combatXPToApply})`);
    
    // Open app automatically - Apri l'app automaticamente
    const app = new PGPXManagerApp();
    app.currentTab = 'award'; // Switch to award tab - Passa alla tab Assegna PX
    await app.render(true);
    ui.notifications.info(game.i18n.format('NOTIFY.CombatXPReady', { xp: combatXPToApply, total: totalXP }));
  }
}

// Process combat treasure from defeated monsters - Elabora il tesoro di combattimento dai mostri sconfitti
async function processCombatTreasure(combat) {
  // Read hostile combatants directly from the combat object for reliability
  // Build a list of unique actors by base actor ID, collecting names per treasure type
  const hostileCombatants = [];
  const seenActorIds = new Set();
  
  if (combat?.combatants) {
    for (const combatant of combat.combatants) {
      const token = combatant.token;
      const actor = combatant.actor;
      if (token?.disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE && actor) {
        // Use actor.id to avoid duplicates for same monster type (unlinked tokens share actor.id)
        if (!seenActorIds.has(actor.id)) {
          seenActorIds.add(actor.id);
          hostileCombatants.push(actor);
        }
      }
    }
  }
  
  // Fallback to tracked combatants if combat object didn't have data
  if (hostileCombatants.length === 0 && globalThis.combatants.size > 0) {
    for (const actorId of globalThis.combatants) {
      const actor = game.actors.get(actorId);
      if (actor) hostileCombatants.push(actor);
    }
  }
  
  if (hostileCombatants.length === 0) {
    return;
  }
  
  // Determine if we can use automatic treasure links (English, no Italian module)
  const lang = game.i18n.lang;
  const italianModuleActive = game.modules.get('fade-lang-it')?.active;
  const canUseAutoTreasure = (lang === 'en') && !italianModuleActive;

  if (canUseAutoTreasure) {
    // English mode: extract treasure types and create clickable links
    await processTreasureWithLinks(hostileCombatants);
  } else {
    // Italian/Babele mode: show raw treasure text only
    const monsterTreasures = [];
    const noTreasureLabel = lang === 'it' ? 'Nessun tesoro' : 'No treasure';
    for (const actor of hostileCombatants) {
      const treasureText = (actor.system?.treasure || '').trim();
      if (!treasureText || treasureText.toLowerCase() === 'nil') {
        monsterTreasures.push({ name: actor.name, treasure: noTreasureLabel });
      } else {
        monsterTreasures.push({ name: actor.name, treasure: treasureText });
      }
    }
    await createTreasureChatMessage(monsterTreasures);
  }
}

// Process treasure with clickable links for English mode (no Babele translation issues)
async function processTreasureWithLinks(hostileCombatants) {
  const treasureTypes = new Set();
  const monsterNames = new Map();
  
  for (const actor of hostileCombatants) {
    const treasureText = (actor.system?.treasure || '').trim();
    if (!treasureText || treasureText.toLowerCase() === 'nil') continue;
    
    // Extract individual treasure type letters from various formats
    const individualTypes = treasureText.match(/[A-Z]/g) || [];
    for (const type of individualTypes) {
      treasureTypes.add(type);
      if (!monsterNames.has(type)) {
        monsterNames.set(type, []);
      }
      if (!monsterNames.get(type).includes(actor.name)) {
        monsterNames.get(type).push(actor.name);
      }
    }
  }
  
  if (treasureTypes.size === 0) return;
  
  // Build clickable links to compendium macros
  const compendium = game.packs.get('fade-compendiums.macro-compendium');
  if (!compendium) return;
  const index = await compendium.getIndex({ fields: ['name'] });

  const treasureLinks = [];
  for (const treasureLetter of treasureTypes) {
    const macroName = `Treasure Type ${treasureLetter}`;
    const entry = index.find(e => e.name === macroName);
    if (entry) {
      treasureLinks.push({
        letter: treasureLetter,
        name: macroName,
        uuid: `Compendium.fade-compendiums.macro-compendium.${entry._id}`
      });
    }
  }

  if (treasureLinks.length > 0) {
    await createTreasureLinksChatMessage(treasureLinks, monsterNames);
  }
}

async function createTreasureChatMessage(monsterTreasures) {
  const lang = game.i18n.lang;
  const title = lang === 'it' ? '💎 Tesoro Disponibile' : '💎 Treasure Available';
  
  let content = `<h3>${title}</h3><ul>`;
  for (const { name, treasure } of monsterTreasures) {
    content += `<li><strong>${name}</strong>: ${treasure}</li>`;
  }
  content += `</ul>`;

  await ChatMessage.create({
    content: content,
    whisper: [game.users.activeGM.id],
    blind: false
  });
}

// Create clickable treasure links message for English mode
async function createTreasureLinksChatMessage(treasureLinks, monsterNames) {
  const lang = game.i18n.lang;
  const title = '💎 Treasure Available';
  const instruction = 'Click links to roll treasure tables:';
  
  let content = `<h3>${title}</h3>`;
  content += `<p>${instruction}</p>`;
  content += `<ul>`;
  
  for (const link of treasureLinks) {
    const names = monsterNames.get(link.letter) || ['Unknown'];
    const monsterName = Array.isArray(names) ? names.join(', ') : names;
    const uuid = link.uuid;
    content += `<li><strong>${monsterName}</strong> (${link.letter}): <a class="pg-px-treasure-link" data-uuid="${uuid}">${link.name}</a></li>`;
  }
  
  content += `</ul>`;

  await ChatMessage.create({
    content: content,
    whisper: [game.users.activeGM.id],
    blind: false
  });
}

// ==========================================
// Utility Functions
// ==========================================

// Register module settings - Registra le impostazioni del modulo
function registerSettings() {
  // Pending XP storage (per character) - Archiviazione PX in attesa (per personaggio)
  game.settings.register(MODULE_ID, 'pendingXP', {
    name: 'PX in Attesa',
    hint: 'Storage per i PX in attesa dei personaggi',
    scope: 'world',
    config: false,
    type: Object,
    default: {}
  });
  
  // Global XP storage (total XP from combat) - Archiviazione PX globale (PX totali dal combattimento)
  game.settings.register(MODULE_ID, 'globalXP', {
    name: 'XP Globale',
    hint: 'XP totale del combattimento corrente',
    scope: 'world',
    config: false,
    type: Number,
    default: 0
  });
  
  // Default tab - Tab predefinita
  game.settings.register(MODULE_ID, 'defaultTab', {
    name: 'Tab Predefinito',
    hint: 'Tab aperta di default all\'avvio',
    scope: 'client',
    config: true,
    restricted: true,
    type: String,
    choices: {
      'party': '🎭 Party',
      'award': '💰 Assegna PX',
      'pending': '⏳ PX in Attesa',
      'generator': '⚔️ Genera PG'
    },
    default: 'party'
  });
  
  // Unit system setting (Metric vs Imperial) - Impostazione sistema unità (Metrico vs Imperiale)
  game.settings.register(MODULE_ID, 'useMetric', {
    name: game.i18n.localize('SETTINGS.UseMetric'),
    hint: game.i18n.localize('SETTINGS.UseMetricHint'),
    scope: 'world',
    config: true,
    restricted: true,
    type: Boolean,
    default: false
  });

  // Internal flag to track if metric default has been set based on language - Flag interno per tracciare se il default metrico è stato impostato in base alla lingua
  game.settings.register(MODULE_ID, 'metricDefaultSet', {
    name: 'Metric Default Set',
    hint: 'Internal flag to track if metric system default has been set based on language',
    scope: 'world',
    config: false, // Hidden from user
    type: Boolean,
    default: false
  });

  // Pending XP chat message visibility (public or hidden) - Visibilità messaggio chat PX in attesa (pubblico o nascosto)
  game.settings.register(MODULE_ID, 'pendingChatPublic', {
    name: 'Pending Chat Public',
    hint: 'Whether the pending XP award chat message is public or GM-only',
    scope: 'world',
    config: false,
    type: Boolean,
    default: true
  });

  // Internal flag to track if macros have been copied for Italian language - Flag interno per tracciare se le macro sono state copiate per la lingua italiana
  game.settings.register(MODULE_ID, 'macrosCopiedForItalian', {
    name: 'Macros Copied for Italian',
    hint: 'Internal flag to track if treasure macros have been copied and translated for Italian language',
    scope: 'world',
    config: false, // Hidden from user
    type: Boolean,
    default: false
  });

  // Encounter state persistence - Persistenza stato generatore incontri
  game.settings.register(MODULE_ID, 'encounterState', {
    name: 'Encounter State',
    hint: 'Storage for encounter generator form values and last generated monsters',
    scope: 'client',
    config: false, // Hidden from user
    type: Object,
    default: {}
  });
}

// Preload Handlebars templates - Precarica i template Handlebars
async function preloadTemplates() {
  const templatePaths = [
    `modules/${MODULE_ID}/templates/main.html`,
    `modules/${MODULE_ID}/templates/party-tab.html`,
    `modules/${MODULE_ID}/templates/award-tab.html`,
    `modules/${MODULE_ID}/templates/pending-tab.html`,
    `modules/${MODULE_ID}/templates/generator-tab.html`,
    `modules/${MODULE_ID}/templates/encounter-tab.html`
  ];
  
  // V14: loadTemplates is namespaced under foundry.applications.handlebars
  const loadFn = foundry.applications?.handlebars?.loadTemplates || loadTemplates;
  return loadFn(templatePaths);
}

// Ensure Party and Seguaci/Retainers folders exist - Assicura che le cartelle Party e Seguaci/Retainers esistano
async function ensureFolders() {
  const isItalian = (game.i18n.lang ?? 'en') === 'it';
  const retainerFolderName = isItalian ? 'Seguaci' : 'Retainers';

  // Party folder
  let partyFolder = game.folders?.find(f => 
    f.type === 'Actor' && f.name.toLowerCase() === 'party'
  );
  
  if (!partyFolder && game.user.isGM) {
    partyFolder = await Folder.create({
      name: 'Party',
      type: 'Actor',
      parent: null
    });
    ui.notifications.info(game.i18n.format('NOTIFY.FolderCreated', { name: 'Party' }));
  }
  
  // Retainers/Seguaci folder
  let seguaciFolder = game.folders?.find(f => 
    f.type === 'Actor' && /^(seguaci|retainers)$/i.test(f.name)
  );
  
  console.log(`[fantastic-depths-dm-screen] ensureFolders | lang=${game.i18n.lang} | targetName=${retainerFolderName} | found=${seguaciFolder?.name ?? 'NONE'} | isGM=${game.user.isGM}`);

  if (!seguaciFolder && game.user.isGM) {
    seguaciFolder = await Folder.create({
      name: retainerFolderName,
      type: 'Actor',
      parent: null
    });
    ui.notifications.info(game.i18n.format('NOTIFY.FolderCreated', { name: retainerFolderName }));
  } else if (seguaciFolder && game.user.isGM && seguaciFolder.name !== retainerFolderName) {
    console.log(`[fantastic-depths-dm-screen] Renaming "${seguaciFolder.name}" → "${retainerFolderName}"`);
    await seguaciFolder.update({ name: retainerFolderName });
  }
}

// ==========================================
// Global Exports
// ==========================================

window.PGPXManager = {
  app: PGPXManagerApp,
  generator: PGGenerator,
  pxManager: PXManager,
  MODULE_ID
};

console.log(`${MODULE_ID} | Module loaded successfully`);

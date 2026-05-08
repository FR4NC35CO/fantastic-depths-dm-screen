// ==========================================
// PG + PX Manager - Main Application (V2)
// Foundry V14 ApplicationV2 compatible
// ==========================================

import { executeAcrobaticsCheck } from './acrobatics-check.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const MODULE_ID = 'fantastic-depths-dm-screen';

export class PGPXManagerApp extends HandlebarsApplicationMixin(ApplicationV2) {
  
  static DEFAULT_OPTIONS = {
    id: 'fantastic-depths-dm-screen',
    classes: ['fantastic-depths-dm-screen', 'fade-app', 'dialog'],
    tag: 'div',
    window: {
      title: 'Fantastic Depths DM Screen - by FR4NC35C0',
      icon: 'fas fa-book-open',
      resizable: true,
      minimizable: true,
      controls: [
        {
          icon: 'fa-solid fa-external-link-alt',
          label: 'Popout',
          action: 'popout'
        }
      ]
    },
    position: {
      width: 625,
      height: 464
    },
    actions: {
      switchTab: this._onSwitchTab,
      popout: this._onPopout,
      openSheet: this._onOpenSheet,
      calculateShares: this._onCalculateShares,
      storeXP: this._onStoreXP,
      awardNow: this._onAwardNow,
      awardPending: this._onAwardPending,
      clearPending: this._onClearPending,
      resetValues: this._onResetValues,
      addTreasureXP: this._onAddTreasureXP,
      showWrestling: this._onShowWrestling,
      showShove: this._onShowShove,
      showAcrobatics: this._onShowAcrobatics,
      showRollTableHelper: this._onShowRollTableHelper,
      showLightManager: this._onShowLightManager,
      generateCharacter: this._onGenerateCharacter,
      rollStats3d6: this._onRollStats3d6,
      rollStats4d6: this._onRollStats4d6,
      increaseStat: this._onIncreaseStat,
      decreaseStat: this._onDecreaseStat,
      resetRiserva: this._onResetRiserva,
      resetStats: this._onResetStats,
      classChange: this._onClassChange,
      rollAbility: this._onRollAbility,
      selectAll: this._onSelectAllRequest,
      selectRollType: this._onSelectRollType,
      sendRequest: this._onSendRequest,
      toggleChatVisibility: this._onToggleChatVisibility,
      toggleRequestRollMode: this._onToggleRequestRollMode
    }
  };
  
  static PARTS = {
    main: {
      template: `modules/${MODULE_ID}/templates/main.html`
    }
  };
  
  constructor(options = {}) {
    super(options);
    this.currentTab = game.settings.get(MODULE_ID, 'defaultTab') || 'party';
    this.actors = [];
    this.pendingXPData = {};
    this.generatorState = {}; // Store generator form values across tab switches
    
    // Encounter state is kept in-memory only (survives tab switches, resets on F5)
    this.encounterState = {};
    
    // Generator state
    this.genStats = { str: 0, int: 0, wis: 0, dex: 0, con: 0, cha: 0 };
    this.genRiserva = 0;
    this.genCurrentClass = null;
    
    // Load saved window position
    const savedPosition = localStorage.getItem('fd-ds-position');
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition);
        if (pos.left !== undefined && pos.top !== undefined) {
          this._savedPosition = pos;
        }
      } catch (e) {
        console.warn(`${MODULE_ID} | Could not parse saved position:`, e);
      }
    }
  }

  /**
   * Apply combat XP to the input field - Applica i PX di combattimento al campo di input
   */
  _applyCombatXP(combatXP = globalThis.combatXP) {
    console.log(`[${MODULE_ID}] _applyCombatXP CALLED | combatXP: ${combatXP}, currentTab: ${this.currentTab}, rendered: ${this.rendered}`);
    // Find the global XP input - try document first, then this.element
    let xpInput = document.querySelector('[name="global-xp-input"]');
    
    if (!xpInput && this.element) {
      xpInput = this.element.querySelector('[name="global-xp-input"]');
    }
    
    console.log(`[${MODULE_ID}] _applyCombatXP | xpInput found: ${!!xpInput}, element exists: ${!!this.element}`);
    
    if (xpInput) {
      // Get current value and add combat XP to it
      const currentValue = parseInt(xpInput.value) || 0;
      const newValue = currentValue + combatXP;
      xpInput.value = newValue;
      // Add editable-mode class to show yellow border
      xpInput.classList.add('editable-mode');
      // Persist to instance and game.settings so it survives close/refresh
      this._savedGlobalXP = newValue;
      game.settings.set(MODULE_ID, 'globalXP', newValue);
      // Trigger input event to update UI
      xpInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log(`[${MODULE_ID}] _applyCombatXP | SUCCESS - value set to: ${newValue}, editable-mode added, _savedGlobalXP: ${this._savedGlobalXP}`);
    } else {
      console.warn(`[${MODULE_ID}] _applyCombatXP | FAILED - xpInput NOT FOUND in DOM!`);
    }
  }
  
  // ==========================================
  // Data Preparation - Preparazione Dati
  // ==========================================
  
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    
    // Load actors
    this.actors = await this._loadActors();
    this.pendingXPData = this._loadPendingXP();
    
    // Calculate pending count first (needed for tabs)
    this.pendingCount = this.actors.filter(a => a.xp.pending > 0).length;
    
    // Add data to context
    context.currentTab = this.currentTab;
    context.actors = this.actors;
    context.pendingCount = this.pendingCount;
    context.tabs = this._getTabs();
    context.partyData = this._getPartyData();
    context.awardData = this._getAwardData();
    context.pendingData = this._getPendingData();
    context.availableClasses = this._getAvailableClasses();
    
    // Generator-specific data
    context.stats = [
      { key: 'str', label: game.i18n.localize('STATS.STR'), full: game.i18n.localize('PARTY.Tooltip.STR') },
      { key: 'int', label: game.i18n.localize('STATS.INT'), full: game.i18n.localize('PARTY.Tooltip.INT') },
      { key: 'wis', label: game.i18n.localize('STATS.WIS'), full: game.i18n.localize('PARTY.Tooltip.WIS') },
      { key: 'dex', label: game.i18n.localize('STATS.DEX'), full: game.i18n.localize('PARTY.Tooltip.DEX') },
      { key: 'con', label: game.i18n.localize('STATS.CON'), full: game.i18n.localize('PARTY.Tooltip.CON') },
      { key: 'cha', label: game.i18n.localize('STATS.CHA'), full: game.i18n.localize('PARTY.Tooltip.CHA') }
    ];
    context.levelOptions = Array.from({length: 36}, (_, i) => i + 1);
    context.dragonClasses = this._getDragonClasses();
    context.nonDragonClasses = this._getNonDragonClasses();
    context.classRequirements = this._getClassRequirements();
    
    // Render tab templates as HTML strings
    context.partyTabHTML = await this._renderTabTemplate('party-tab.html', context);
    context.awardTabHTML = await this._renderTabTemplate('award-tab.html', context);
    context.pendingTabHTML = await this._renderTabTemplate('pending-tab.html', context);
    context.requestTabHTML = await this._renderTabTemplate('request-tab.html', context);
    context.generatorTabHTML = await this._renderTabTemplate('generator-tab.html', context);
    context.encounterTabHTML = await this._renderTabTemplate('encounter-tab.html', context);
    
    return context;
  }
  
  async _renderTabTemplate(templateName, context) {
    try {
      const templatePath = `modules/${MODULE_ID}/templates/${templateName}`;
      // V14: getTemplate is namespaced under foundry.applications.handlebars
      const getTemplateFn = foundry.applications?.handlebars?.getTemplate || getTemplate;
      const template = await getTemplateFn(templatePath);
      return template(context);
    } catch (err) {
      console.error(`${MODULE_ID} | Error rendering template ${templateName}:`, err);
      return '';
    }
  }
  
  _getTabs() {
    return [
      { id: 'party', label: game.i18n.localize('TABS.Party'), icon: 'fa-users', tooltip: game.i18n.localize('TABS.PartyTooltip'), active: this.currentTab === 'party' },
      { id: 'award', label: game.i18n.localize('TABS.Award'), icon: 'fa-coins', tooltip: game.i18n.localize('TABS.AwardTooltip'), active: this.currentTab === 'award' },
      { id: 'pending', label: game.i18n.localize('TABS.Pending'), icon: 'fa-hourglass-half', tooltip: `${game.i18n.localize('TABS.PendingTooltip')} (${this.pendingCount})`, active: this.currentTab === 'pending' },
      { id: 'request', label: game.i18n.localize('TABS.Request'), icon: 'fa-dice-d20', tooltip: game.i18n.localize('TABS.RequestTooltip'), active: this.currentTab === 'request' },
      { id: 'generator', label: game.i18n.localize('TABS.Generator'), icon: 'fa-user-plus', tooltip: game.i18n.localize('TABS.GeneratorTooltip'), active: this.currentTab === 'generator' },
      { id: 'encounter', label: game.i18n.localize('TABS.Encounter'), icon: 'fa-dragon', tooltip: game.i18n.localize('TABS.EncounterTooltip'), active: this.currentTab === 'encounter' }
    ];
  }
  
  _getPartyData() {
    const ltp = this.actors.filter(a => !a.isDead).reduce((sum, a) => sum + (parseInt(a.level) || 0), 0);
    const totalPending = this.actors.reduce((sum, a) => sum + a.xp.pending, 0);
    
    return {
      ltp,
      totalPending,
      characters: {
        total: this.actors.filter(a => !a.isFollower).length,
        alive: this.actors.filter(a => !a.isFollower && !a.isDead).length
      },
      followers: {
        total: this.actors.filter(a => a.isFollower).length,
        alive: this.actors.filter(a => a.isFollower && !a.isDead).length
      },
      dead: this.actors.filter(a => a.isDead).length
    };
  }
  
  _getAwardData() {
    const followerCount = this.actors.filter(a => a.isFollower).length;
    return {
      actors: this.actors,
      followerCount: followerCount,
      awardModes: [
        { value: 'equal', label: game.i18n.localize('AWARD.Mode.Equal') },
        { value: 'share', label: game.i18n.localize('AWARD.Mode.Share') },
        { value: 'custom', label: game.i18n.localize('AWARD.Mode.Custom') }
      ]
    };
  }
  
  _getPendingData() {
    const pendingActors = this.actors.filter(a => a.xp.pending > 0);
    const followerCount = pendingActors.filter(a => a.isFollower).length;
    return {
      actors: pendingActors,
      followerCount: followerCount,
      totalPending: pendingActors.reduce((sum, a) => sum + a.xp.pending, 0),
      chatPublic: game.settings.get(MODULE_ID, 'pendingChatPublic')
    };
  }

  _getRequestData() {
    return {
      actors: this.actors
    };
  }
  
  _getAllClasses() {
    // Get class items from world AND compendiums
    let allClasses = [];
    
    // From world
    const worldClasses = game.items?.contents?.filter(i => i.type === 'class') || [];
    allClasses.push(...worldClasses);
    
    // From compendiums (use index for better compatibility)
    for (const pack of game.packs) {
      if (pack.metadata?.type === 'Item' || pack.documentName === 'Item') {
        // Get classes from index (doesn't require loading the pack)
        const packClasses = pack.index?.filter(i => i.type === 'class') || [];
        for (const cls of packClasses) {
          // Create a pseudo-item with id and name from index
          allClasses.push({
            id: cls._id || cls.id,
            name: cls.name,
            type: 'class',
            compendium: pack.collection
          });
        }
      }
    }
    
    // Deduplicate by name (same logic as original macro)
    const uniqueClasses = allClasses.filter((item, index, self) => 
      index === self.findIndex(i => i.name.toLowerCase().trim() === item.name.toLowerCase().trim())
    );
    
    return uniqueClasses.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  _getAvailableClasses() {
    const classes = this._getAllClasses();
    return classes.map(c => ({ id: c.id, name: c.name }));
  }
  
  _getDragonClasses() {
    const classes = this._getAllClasses().filter(c => /dragon|drago/i.test(c.name));
    return classes.map(c => ({ 
      id: c.id, 
      name: c.name
    }));
  }
  
  _getNonDragonClasses() {
    const classes = this._getAllClasses().filter(c => !/dragon|drago/i.test(c.name));
    return classes.map(c => ({ id: c.id, name: c.name }));
  }
  
  _getClassRequirements() {
    return {
      'bardo': { primeReq: ['int', 'dex'], min: { dex: 12 }, lowerable: ['str', 'int', 'wis'] },
      'chierico': { primeReq: ['wis'], min: { wis: 9 }, lowerable: ['str', 'int'] },
      'cleric': { primeReq: ['wis'], min: { wis: 9 }, lowerable: ['str', 'int'] },
      'druido': { primeReq: ['wis'], min: { wis: 12 }, lowerable: ['str', 'int'] },
      'elfo': { primeReq: ['str', 'int'], min: { str: 9, int: 9 }, lowerable: ['str', 'int', 'wis'] },
      'elf': { primeReq: ['str', 'int'], min: { str: 9, int: 9 }, lowerable: ['str', 'int', 'wis'] },
      'guerriero': { primeReq: ['str'], min: { str: 9 }, lowerable: ['str', 'int', 'wis'] },
      'fighter': { primeReq: ['str'], min: { str: 9 }, lowerable: ['str', 'int', 'wis'] },
      'halfling': { primeReq: ['str', 'dex'], min: { str: 9, dex: 9 }, lowerable: ['str', 'int', 'wis'] },
      'ladro': { primeReq: ['dex'], min: { dex: 9 }, lowerable: ['str', 'int', 'wis'] },
      'thief': { primeReq: ['dex'], min: { dex: 9 }, lowerable: ['str', 'int', 'wis'] },
      'mago': { primeReq: ['int'], min: { int: 9 }, lowerable: ['str', 'wis'] },
      'mystic': { primeReq: ['str', 'dex'], min: { str: 9, dex: 9 }, lowerable: ['str', 'dex', 'int', 'wis'] },
      'mistico': { primeReq: ['str', 'dex'], min: { str: 9, dex: 9 }, lowerable: ['str', 'dex', 'int', 'wis'] },
      'nano': { primeReq: ['str'], min: { str: 9 }, lowerable: ['str', 'int', 'wis'] },
      'dwarf': { primeReq: ['str'], min: { str: 9 }, lowerable: ['str', 'int', 'wis'] },
      'paladino': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] },
      'paladino (c)': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] },
      'paladin': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] },
      'paladin (c)': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] },
      'vendicatore': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] },
      'vendicatore (c)': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] },
      'avenger': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] },
      'avenger (c)': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] }
    };
  }

  // ==========================================
  // Actor Loading - Caricamento Attori
  // ==========================================
  
  async _loadActors() {
    const partyFolder = game.folders?.find(f => 
      f.type === 'Actor' && f.name.toLowerCase() === 'party'
    );
    
    const seguaciFolder = game.folders?.find(f => 
      f.type === 'Actor' && f.name.toLowerCase() === 'seguaci'
    );
    
    const partyActors = partyFolder ? game.actors.contents
      .filter(actor => 
        actor.type === 'character' && 
        !actor.system?.details?.isNPC &&
        actor.folder?.id === partyFolder.id
      )
      .map(actor => this._enrichActorData(actor, false)) : [];
    
    const followerActors = seguaciFolder ? game.actors.contents
      .filter(actor => 
        actor.type === 'character' && 
        !actor.system?.details?.isNPC &&
        actor.folder?.id === seguaciFolder.id &&
        actor.system?.isRetainer === true
      )
      .map(actor => this._enrichActorData(actor, true)) : [];
    
    return [...partyActors, ...followerActors].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  _enrichActorData(actor, isFollower) {
    const system = actor.system;
    const details = system?.details || {};
    const hp = system?.hp || { value: 0, max: 0 };
    const ac = system?.ac || { total: 0 };
    
    const actorData = {
      id: actor.id,
      name: actor.name,
      img: actor.img,
      isFollower,
      isDead: hp.value <= 0 && hp.max > 0,
      class: details.class || details.className || '-',
      level: details.level || 1,
      alignment: details.alignment || '-',
      hp: hp,
      ac: ac.total || 0,
      thac0: system?.thac0?.value || 0,
      movement: this._formatMovement(system?.movement),
      xp: {
        current: details.xp?.value || 0,
        pending: this._getPendingXP(actor.id),
        bonus: this._calculateXPBonus(actor),
        missing: this._calculateMissingXP(details, this._getPendingXP(actor.id), details.class || details.className),
        levelUp: this._isReadyToLevelUp(details, this._getPendingXP(actor.id), details.class || details.className)
      },
      abilities: {
        str: system?.abilities?.str?.value || 0,
        dex: system?.abilities?.dex?.value || 0,
        con: system?.abilities?.con?.value || 0,
        int: system?.abilities?.int?.value || 0,
        wis: system?.abilities?.wis?.value || 0,
        cha: system?.abilities?.cha?.value || 0
      }
    };
    
    return actorData;
  }
  
  _formatMovement(movement) {
    if (!movement) return '-';
    if (typeof movement === 'object') {
      const turn = movement.turn || 0;
      const round = movement.round || 0;
      if (turn && round) return `${turn}/${round}`;
      return turn || round || '-';
    }
    return movement;
  }
  
  _calculateXPBonus(actor) {
    // Read XP bonus from system.details.xp.bonus if available
    const xpBonus = actor.system?.details?.xp?.bonus;
    if (xpBonus !== undefined) {
      return parseInt(xpBonus) || 0;
    }
    return 0;
  }
  
  _calculateMissingXP(details, pendingXP = 0, className = '') {
    // If no class defined, cannot calculate missing XP
    if (!className || className === '-') {
      return 0;
    }
    
    const currentXP = parseInt(details.xp?.value) || 0;

    // Use system-provided xp.next if available and meaningful (> 0)
    const xpNext = parseInt(details.xp?.next) || 0;
    if (xpNext > 0) {
      const missing = xpNext - currentXP - pendingXP;
      return missing > 0 ? missing : 0;
    }
    
    // Fallback: XP table for standard classes (OSE/BX progression)
    const level = details.level || 1;
    const xpTable = [0, 2000, 4000, 8000, 16000, 32000, 64000, 120000, 240000, 360000, 480000, 600000, 720000, 840000, 960000, 1080000, 1200000, 1320000, 1440000, 1560000, 1680000];
    
    const xpForNextLevel = xpTable[level] || 0;
    const missing = xpForNextLevel - currentXP - pendingXP;
    return missing > 0 ? missing : 0;
  }
  
  _isReadyToLevelUp(details, pendingXP = 0, className = '') {
    if (!className || className === '-') return false;
    const currentXP = parseInt(details.xp?.value) || 0;
    const xpNext = parseInt(details.xp?.next) || 0;
    if (xpNext > 0) return (currentXP + pendingXP) >= xpNext;
    const level = parseInt(details.level) || 1;
    const xpTable = [0, 2000, 4000, 8000, 16000, 32000, 64000, 120000, 240000, 360000, 480000, 600000, 720000, 840000, 960000, 1080000, 1200000, 1320000, 1440000, 1560000, 1680000];
    const xpForNextLevel = xpTable[level] || 0;
    return xpForNextLevel > 0 && (currentXP + pendingXP) >= xpForNextLevel;
  }

  _loadPendingXP() {
    let data = game.settings.get(MODULE_ID, 'pendingXP');
    
    // Protect against corrupted data (if pendingXP was accidentally set to a number or Number object)
    if (typeof data !== 'object' || data === null || data instanceof Number || Array.isArray(data)) {
      console.warn(`${MODULE_ID} | pendingXP data corrupted (type: ${typeof data}), resetting to empty object`);
      // Reset to empty object and save it
      data = {};
      game.settings.set(MODULE_ID, 'pendingXP', data);
    }
    return data;
  }
  
  _getPendingXP(actorId) {
    const data = this._loadPendingXP();
    return data[actorId] || 0;
  }
  
  async _setPendingXP(actorId, value) {
    const data = this._loadPendingXP();
    data[actorId] = value;
    await game.settings.set(MODULE_ID, 'pendingXP', data);
  }
  
  async _clearAllPendingXP() {
    await game.settings.set(MODULE_ID, 'pendingXP', {});
  }
  
  // ==========================================
  // Event Handlers - Gestori Eventi
  // ==========================================
  
  static async _onSwitchTab(event, target) {
    event.preventDefault();
    const tab = target.dataset.tab;
    if (!tab) return;
    
    // Save generator state before switching away from generator tab
    if (this.currentTab === 'generator') {
      this._saveGeneratorState();
    }
    // Save encounter state before switching away
    if (this.currentTab === 'encounter') {
      this._saveEncounterState();
    }
    
    this.currentTab = tab;
    await this.render();
  }
  
  _saveGeneratorState() {
    const form = this.element.querySelector('#pg-generator-form');
    if (!form) return;
    
    // Save all form field values
    this.generatorState = {
      // Stats
      stats: {
        str: form.querySelector('#stat-str')?.value || '',
        dex: form.querySelector('#stat-dex')?.value || '',
        con: form.querySelector('#stat-con')?.value || '',
        int: form.querySelector('#stat-int')?.value || '',
        wis: form.querySelector('#stat-wis')?.value || '',
        cha: form.querySelector('#stat-cha')?.value || ''
      },
      // Other fields
      riserva: form.querySelector('#riserva-points')?.value || '0',
      name: form.querySelector('#char-name')?.value || '',
      sex: form.querySelector('input[name="char-sex"]:checked')?.value || '',
      isRetainer: form.querySelector('#char-is-retainer')?.checked || false,
      class: form.querySelector('#char-class')?.value || '__RANDOM__',
      level: form.querySelector('#char-level-select')?.value || '__RANDOM__',
      height: form.querySelector('#char-height')?.value || '__RANDOM__',
      alignment: form.querySelector('#char-alignment')?.value || '__RANDOM__',
      equipment: form.querySelector('#char-equipment')?.value || '__CLASS_KIT__'
    };
  }
  
  _restoreGeneratorState() {
    if (!this.generatorState || Object.keys(this.generatorState).length === 0) return;
    
    const form = this.element.querySelector('#pg-generator-form');
    if (!form) return;
    
    const state = this.generatorState;
    
    // Restore stats
    if (state.stats) {
      Object.entries(state.stats).forEach(([stat, value]) => {
        const input = form.querySelector(`#stat-${stat}`);
        if (input && value) input.value = value;
      });
    }
    
    // Restore other fields
    const riservaInput = form.querySelector('#riserva-points');
    if (riservaInput && state.riserva) riservaInput.value = state.riserva;
    
    const nameInput = form.querySelector('#char-name');
    if (nameInput && state.name) nameInput.value = state.name;
    
    // Restore sex radio
    if (state.sex) {
      const sexRadio = form.querySelector(`input[name="char-sex"][value="${state.sex}"]`);
      if (sexRadio) sexRadio.checked = true;
    }
    
    // Restore checkbox
    const retainerCheckbox = form.querySelector('#char-is-retainer');
    if (retainerCheckbox) retainerCheckbox.checked = state.isRetainer || false;
    
    // Restore selects
    const classSelect = form.querySelector('#char-class');
    if (classSelect && state.class) classSelect.value = state.class;
    
    const levelSelect = form.querySelector('#char-level-select');
    if (levelSelect && state.level) levelSelect.value = state.level;
    
    const heightSelect = form.querySelector('#char-height');
    if (heightSelect && state.height) heightSelect.value = state.height;
    
    const alignmentSelect = form.querySelector('#char-alignment');
    if (alignmentSelect && state.alignment) alignmentSelect.value = state.alignment;
    
    const equipmentSelect = form.querySelector('#char-equipment');
    if (equipmentSelect && state.equipment) equipmentSelect.value = state.equipment;
    
    // Trigger class change event to re-apply class requirements and update UI
    const classSelectForTrigger = form.querySelector('#char-class');
    if (classSelectForTrigger && state.class && state.class !== '__RANDOM__') {
      classSelectForTrigger.dispatchEvent(new Event('change'));
    }
  }
  
  static _onPopout(event) {
    // Handle popout functionality
    const popout = window.open('', 'fd-ds-popout', 'width=750,height=650');
    if (popout) {
      const content = this.element.innerHTML;
      popout.document.write(`
        <html>
          <head>
            <title>Fantastic Depths DM Screen</title>
            <link rel="stylesheet" href="modules/${MODULE_ID}/styles/fantastic-depths-dm-screen.css">
          </head>
          <body class="fd-ds-popout">${content}</body>
        </html>
      `);
      this.close();
    }
  }
  
  static async _onOpenSheet(event, target) {
    const actorId = target.dataset.actorId;
    if (!actorId) return;
    
    const actor = game.actors.get(actorId);
    if (actor) {
      actor.sheet.render(true);
    }
  }
  
  static async _onRollAbility(event, target) {
    const actorId = target.dataset.actorId;
    const ability = target.dataset.ability;
    if (!actorId || !ability) return;
    
    const actor = game.actors.get(actorId);
    if (!actor) return;
    
    // Map ability abbreviations to localized labels
    const abilityLabels = {
      'str': game.i18n.localize('ABILITY.STR'),
      'dex': game.i18n.localize('ABILITY.DEX'),
      'con': game.i18n.localize('ABILITY.CON'),
      'int': game.i18n.localize('ABILITY.INT'),
      'wis': game.i18n.localize('ABILITY.WIS'),
      'cha': game.i18n.localize('ABILITY.CHA'),
      'ac': 'CA'
    };
    
    const abilityLabel = abilityLabels[ability];
    if (!abilityLabel) return;
    
    try {
      if (ability === 'ac') {
        // For AC, just show a notification
        const acValue = actor.system?.ac?.value || target.textContent;
        ui.notifications.info(game.i18n.format('NOTIFY.ACOf', { name: actor.name, value: acValue }));
      } else {
        const abilityScore = actor.system?.abilities?.[ability]?.value || 0;
        const difficultyOptions = [
          { value: 'easy', label: game.i18n.localize('ABILITY.Easy'), bonus: 4 },
          { value: 'medium', label: game.i18n.localize('ABILITY.Medium'), bonus: 0 },
          { value: 'hard', label: game.i18n.localize('ABILITY.Hard'), bonus: -4 }
        ];
        const difficultyHTML = difficultyOptions.map(d =>
          `<option value="${d.value}" data-bonus="${d.bonus}" ${d.value === 'medium' ? 'selected' : ''}>${d.label}</option>`
        ).join('');

        const dialogTitle = game.i18n.format('ABILITY.DialogTitle', { name: actor.name, ability: abilityLabel });
        const result = await foundry.applications.api.DialogV2.wait({
          window: { title: dialogTitle },
          position: { width: 320 },
          content: `
            <div style="padding: 8px 4px;">
              <div style="margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                <label style="min-width: 140px;">${game.i18n.localize('ABILITY.RollFormula')}</label>
                <span>1d20</span>
              </div>
              <div style="margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                <label style="min-width: 140px;">${game.i18n.localize('ABILITY.Modifier')}</label>
                <input type="number" id="ability-modifier" value="0" style="width: 70px; text-align: right;">
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <label style="min-width: 140px;">${game.i18n.localize('ABILITY.Difficulty')}</label>
                <select id="ability-difficulty" style="flex: 1;">${difficultyHTML}</select>
              </div>
            </div>`,
          buttons: [
            {
              action: 'roll',
              label: game.i18n.localize('ABILITY.RollButton'),
              icon: 'fas fa-dice-d20',
              default: true,
              callback: (event, button, dialog) => {
                const form = button.form ?? dialog;
                const modifier = parseInt(form.querySelector('#ability-modifier')?.value) || 0;
                const diffSelect = form.querySelector('#ability-difficulty');
                const bonus = parseInt(diffSelect?.options[diffSelect.selectedIndex]?.dataset.bonus) || 0;
                return { modifier, bonus };
              }
            }
          ]
        });

        if (result) {
          const { modifier, bonus } = result;
          const totalMod = modifier + bonus;
          const formula = totalMod !== 0 ? `1d20${totalMod >= 0 ? '+' : ''}${totalMod}` : '1d20';
          const roll = new Roll(formula);
          await roll.evaluate();
          const success = roll.total <= abilityScore;
          const successLabel = success ? game.i18n.localize('ABILITY.Success') : game.i18n.localize('ABILITY.Failure');
          const successText = success ? `<span style="color:#4CAF50;font-weight:bold;">✓ ${successLabel}</span>` : `<span style="color:#F44336;font-weight:bold;">✗ ${successLabel}</span>`;
          await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor }),
            flavor: `${abilityLabel} (${abilityScore}) — ${successText} (${roll.total} <= ${abilityScore})`,
            rollMode: game.settings.get('core', 'messageMode')
          });
        }
      }
    } catch (err) {
      console.error(`${MODULE_ID} | Error rolling ability:`, err);
      ui.notifications.error(game.i18n.format('NOTIFY.RollError', { ability: ability, message: err.message }));
    }
  }

  static _onSelectAllRequest(event, target) {
    event.preventDefault();
    event.stopPropagation();
    const checkboxes = this.element.querySelectorAll('.request-character-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    const newState = !allChecked;
    // Toggle all character checkboxes
    checkboxes.forEach(cb => cb.checked = newState);
    // Also update the select-all checkbox visual state
    target.checked = newState;
  }

  static _onSelectRollType(event, target) {
    // When a roll type checkbox is selected, deselect all others
    if (target.checked) {
      const allCheckboxes = this.element.querySelectorAll('.request-roll-type');
      allCheckboxes.forEach(cb => {
        if (cb !== target) {
          cb.checked = false;
        }
      });
    }
  }

  static async _onSendRequest(event, target) {
    event.preventDefault();
    
    // Get selected actors
    const selectedActorIds = Array.from(this.element.querySelectorAll('.request-character-checkbox:checked'))
      .map(cb => cb.dataset.actorId);
    
    if (selectedActorIds.length === 0) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }
    
    // Get difficulty and bonus
    const difficultySelect = this.element.querySelector('#request-difficulty');
    const difficulty = difficultySelect?.value || 'medium';
    const difficultyBonusMap = {
      'easy': -4,
      'medium': 0,
      'hard': 4,
      'veryhard': 8,
      'absurd': 12
    };
    const difficultyBonus = difficultyBonusMap[difficulty] || 0;
    
    // Get show DC option
    const showDC = this.element.querySelector('#request-show-dc')?.checked || false;
    
    // Get roll mode from toggle icon
    const rollModeToggle = this.element.querySelector('[data-action="toggleRequestRollMode"]');
    const isPublic = rollModeToggle?.getAttribute('data-public') === 'true';
    const rollMode = isPublic ? 'public' : 'blind';
    
    // Get flavour
    const flavour = this.element.querySelector('#request-flavour')?.value || '';
    
    // Get selected roll types
    const selectedRollTypes = Array.from(this.element.querySelectorAll('.request-roll-type:checked'))
      .map(cb => ({
        type: cb.dataset.type,
        ability: cb.dataset.ability,
        save: cb.dataset.save,
        skill: cb.dataset.skill,
        roll: cb.dataset.roll
      }));
    
    if (selectedRollTypes.length === 0) {
      ui.notifications.warn(game.i18n.localize('REQUEST.SelectRollType'));
      return;
    }

    // Build roll request message
    const abilityLabelMap = {
      'str': 'STR',
      'dex': 'DEX',
      'int': 'INT',
      'wis': 'WIS',
      'con': 'CON',
      'cha': 'CHA'
    };

    const difficultyLabel = game.i18n.localize(`REQUEST.${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`);
    const difficultyText = showDC ? `${difficultyLabel} (bonus: ${difficultyBonus >= 0 ? '+' : ''}${difficultyBonus})` : `${difficultyLabel} (bonus: ???)`;

    const rollTypesText = selectedRollTypes.map(rt => {
      if (rt.type === 'ability') return abilityLabelMap[rt.ability] || rt.ability?.toUpperCase();
      if (rt.type === 'save') return rt.save;
      if (rt.type === 'exploration') return rt.skill;
      if (rt.type === 'roll') return rt.roll;
      return rt.type;
    }).join(', ');

    // Determine the header text based on the type of roll selected
    let headerText = game.i18n.localize('REQUEST.MsgMultipleRolls');
    if (selectedRollTypes.length > 0) {
      const firstType = selectedRollTypes[0];
      if (firstType.type === 'ability') {
        const abilityLabel = abilityLabelMap[firstType.ability] || firstType.ability?.toUpperCase();
        headerText = game.i18n.format('REQUEST.MsgAbilityCheck', { ability: abilityLabel });
      } else if (firstType.type === 'save') {
        const saveKeyMap = {
          'wand': 'REQUEST.WandSave',
          'spell': 'REQUEST.SpellSave',
          'stone': 'REQUEST.PetrificationSave',
          'breath': 'REQUEST.BreathSave',
          'death': 'REQUEST.DeathSave'
        };
        const saveLabel = game.i18n.localize(saveKeyMap[firstType.save]) || firstType.save;
        headerText = game.i18n.format('REQUEST.MsgSavingThrow', { save: saveLabel });
      } else if (firstType.type === 'exploration') {
        const skillKeyMap = {
          'findSecretDoors': 'REQUEST.FindSecretDoors',
          'forceOpenDoors': 'REQUEST.ForceOpenDoors',
          'listenAtDoors': 'REQUEST.ListenAtDoors',
          'findTraps': 'REQUEST.FindTraps'
        };
        const skillLabel = game.i18n.localize(skillKeyMap[firstType.skill]) || firstType.skill;
        headerText = game.i18n.format('REQUEST.MsgExploration', { skill: skillLabel });
      }
    }

    const rollModeText = game.i18n.localize(rollMode === 'blind' ? 'REQUEST.MsgBlind' : 'REQUEST.MsgPublic');
    const d20Icon = 'icons/svg/d20-grey.svg';
    
    const requestId = `roll-request-${Date.now()}`;
    
    const messageContent = `
      <div class="roll-request-message" id="${requestId}">
        <h3>${headerText} ${rollModeText}</h3>
        ${flavour ? `<p><em>${flavour}</em></p>` : ''}
        <hr>
        ${selectedActorIds.map(actorId => {
          const actor = this.actors.find(a => a.id === actorId);
          if (!actor) return '';
          return `<div class="roll-request-character" data-actor-id="${actor.id}" data-request-id="${requestId}">
            <img src="${d20Icon}" class="roll-request-icon" data-action="rollRequest" data-actor-id="${actor.id}" data-request-id="${requestId}" data-difficulty="${difficulty}" data-difficulty-bonus="${difficultyBonus}" data-show-dc="${showDC}" data-roll-mode="${rollMode}" data-roll-types='${JSON.stringify(selectedRollTypes)}' data-flavour="${flavour}">
            <strong>${actor.name}</strong> (${actor.class})
          </div>`;
        }).join('')}
      </div>
    `;
    
    // Send message to chat
    const speaker = ChatMessage.getSpeaker();
    const messageData = {
      speaker: speaker,
      content: messageContent,
      whisper: rollMode === 'blind' ? [game.user.id] : [],
      blind: rollMode === 'blind'
    };
    
    await ChatMessage.create(messageData);
    ui.notifications.info(`Richiesta inviata a ${selectedActorIds.length} personaggi`);
  }

  static async _onToggleChatVisibility(event, target) {
    event.preventDefault();
    const isPublic = target.getAttribute('data-public') === 'true';
    const newPublic = !isPublic;
    target.setAttribute('data-public', String(newPublic));
    target.style.color = newPublic ? '#ffd93d' : '#666';
    const icon = target.querySelector('i');
    if (icon) {
      icon.className = newPublic ? 'fas fa-eye' : 'fas fa-eye-slash';
    }
    await game.settings.set(MODULE_ID, 'pendingChatPublic', newPublic);
  }

  static async _onToggleRequestRollMode(event, target) {
    event.preventDefault();
    const isPublic = target.getAttribute('data-public') === 'true';
    const newPublic = !isPublic;
    target.setAttribute('data-public', String(newPublic));
    target.style.color = newPublic ? '#ffd93d' : '#666';
    const icon = target.querySelector('i');
    if (icon) {
      icon.className = newPublic ? 'fas fa-eye' : 'fas fa-eye-slash';
    }
    // Update the hidden input for form submission
    const hiddenInput = target.closest('.request-section')?.querySelector('#request-roll-mode');
    if (hiddenInput) {
      hiddenInput.value = newPublic ? 'public' : 'private';
    }
  }
  
  // ==========================================
  // Lifecycle Hooks - Hook del Ciclo di Vita
  // ==========================================
  
  _onRender(context, options) {
    super._onRender(context, options);
    
    // Attach change event listener to award-mode select
    const modeSelect = this.element.querySelector('[name="award-mode"]');
    if (modeSelect) {
      modeSelect.addEventListener('change', (event) => {
        this.constructor._onChangeMode.call(this, event);
      });
      // Trigger initial state
      modeSelect.dispatchEvent(new Event('change'));
    }
    
    // Attach select-all checkbox listener for pending tab
    const selectAllCheckbox = this.element.querySelector('.select-all-checkbox');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (event) => {
        const isChecked = event.target.checked;
        const pendingCheckboxes = this.element.querySelectorAll('.pending-checkbox');
        pendingCheckboxes.forEach(cb => {
          cb.checked = isChecked;
        });
      });
    }
    
    // Attach select-all checkbox listener for request tab
    const requestSelectAllCheckbox = this.element.querySelector('.request-select-all-checkbox');
    if (requestSelectAllCheckbox) {
      requestSelectAllCheckbox.addEventListener('change', (event) => {
        const isChecked = event.target.checked;
        const requestCheckboxes = this.element.querySelectorAll('.request-character-checkbox');
        requestCheckboxes.forEach(cb => {
          cb.checked = isChecked;
        });
      });
    }
    
    // Save global-xp-input value when it changes (for persistence across tab switches)
    const globalXPInput = this.element.querySelector('[name="global-xp-input"]');
    if (globalXPInput) {
      globalXPInput.addEventListener('change', (event) => {
        this._savedGlobalXP = parseInt(event.target.value) || 0;
        game.settings.set(MODULE_ID, 'globalXP', this._savedGlobalXP);
      });
      // Prevent Enter key from submitting form and breaking Foundry UI
      globalXPInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
        }
      });
      // Limit to 12 digits during typing
      globalXPInput.addEventListener('beforeinput', (event) => {
        const currentValue = globalXPInput.value.replace(/\D/g, ''); // Remove non-digits
        const selectionLength = globalXPInput.selectionEnd - globalXPInput.selectionStart;
        const newLength = currentValue.length - selectionLength + (event.data?.length || 0);
        if (newLength > 12 && event.inputType !== 'deleteContentBackward' && event.inputType !== 'deleteContentForward') {
          event.preventDefault();
        }
      });
      // Restore saved value from instance variable or game.settings (unless skip flag is set)
      if (!this._skipRestoreXP) {
        let savedValue = this._savedGlobalXP || game.settings.get(MODULE_ID, 'globalXP') || 0;
        if (savedValue > 0) {
          globalXPInput.value = savedValue;
          globalXPInput.classList.add('editable-mode');
          this._savedGlobalXP = savedValue;
        }
      } else {
        // Clear the skip flag after skipping once
        this._skipRestoreXP = false;
      }
    }
    
    // Attach change event listener to class select - this is the correct way to handle select changes
    const classSelect = this.element.querySelector('#char-class');
    if (classSelect) {
      classSelect.addEventListener('change', (event) => {
        this.constructor._onClassChange.call(this, event);
      });
    }
    
    // Restore generator form state AFTER attaching listeners so class change event works
    if (this.currentTab === 'generator') {
      this._restoreGeneratorState();
    }
    
    // Update height dropdown immediately based on metric setting (always update on render)
    this._updateHeightDropdownForMetric();
    
    // Check for pending combat XP from finished combat
    if (this._pendingCombatXP && this._pendingCombatXP > 0) {
      const xpInput = this.element?.querySelector('[name="global-xp-input"]');
      if (xpInput) {
        xpInput.value = this._pendingCombatXP;
        xpInput.classList.add('editable-mode');
        this.constructor._onCalculateShares.call(this);
        ui.notifications.info(game.i18n.format('NOTIFY.CombatXPInserted', { xp: this._pendingCombatXP }));
        this._pendingCombatXP = 0;
      }
    }
    
    // Auto-size window on first render based on content
    if (options.isFirstRender) {
      // Restore saved position first
      if (this._savedPosition) {
        this.setPosition({
          left: this._savedPosition.left,
          top: this._savedPosition.top
        });
      }
      
      setTimeout(() => {
        const content = this.element.querySelector('.window-content');
        if (content) {
          const contentHeight = content.scrollHeight;
          const headerHeight = this.element.querySelector('.window-header')?.offsetHeight || 30;
          const idealHeight = Math.min(Math.max(contentHeight + headerHeight + 20, 400), window.innerHeight - 100);
          this.setPosition({ height: idealHeight });
        }
      }, 50);
    }
    
    // Add listener to save window position when it's moved
    const windowHeader = this.element.querySelector('.window-header');
    if (windowHeader && !windowHeader._hasDragListener) {
      windowHeader.addEventListener('pointerup', () => {
        const pos = this.position;
        if (pos && pos.left !== undefined && pos.top !== undefined) {
          localStorage.setItem('fd-ds-position', JSON.stringify({
            left: pos.left,
            top: pos.top
          }));
        }
      });
      windowHeader._hasDragListener = true;
    }

    // ── Encounter Tab setup ──────────────────────────────────────────────────
    if (this.currentTab === 'encounter') {
      this._initEncounterTab();
    }
  }

  // ─── Encounter Tab ─────────────────────────────────────────────────────────

  _saveEncounterState() {
    const el = this.element;
    if (!el) return;
    this.encounterState = {
      location:    el.querySelector('#enc-location')?.value    ?? 'random',
      monsterType: el.querySelector('#enc-monster-type')?.value ?? 'random',
      rarity:      el.querySelector('#enc-rarity')?.value      ?? 'random',
      challenge:   el.querySelector('#enc-challenge')?.value   ?? 'good-fight',
      naMode:      el.querySelector('input[name="enc-na-mode"]:checked')?.value ?? 'wandering',
      numGroups:   el.querySelector('#enc-groups')?.value      ?? '1',
      lastResult:  this.encounterState?.lastResult ?? null,
      lastMonsters: this._lastGeneratedMonsters ?? null
    };
    
    // State is in-memory only - no sessionStorage persistence needed
  }

  async _initEncounterTab() {
    const el = this.element;
    const state = this.encounterState || {};

    const typeSelect = el.querySelector('#enc-monster-type');

    // Populate monster types
    if (typeSelect && typeSelect.options.length <= 1) {
      try {
        const { EncounterGenerator } = await import('./pg-encounter.mjs');
        const types = await EncounterGenerator.getMonsterTypes();
        for (const t of types) {
          const opt = document.createElement('option');
          opt.value = t.value;
          opt.textContent = t.label;
          typeSelect.appendChild(opt);
        }
      } catch (e) {
        console.warn(`${MODULE_ID} | Could not load monster types:`, e);
      }
    }

    // Restore form values from saved state
    if (state.location    && el.querySelector('#enc-location'))   { const loc = state.location === 'any' ? 'random' : state.location; el.querySelector('#enc-location').value = loc; }
    if (state.monsterType && typeSelect)                          { typeSelect.value = state.monsterType; }
    if (state.rarity      && el.querySelector('#enc-rarity'))     { el.querySelector('#enc-rarity').value = state.rarity; }
    if (state.challenge   && el.querySelector('#enc-challenge'))  { el.querySelector('#enc-challenge').value = state.challenge; }
    if (state.naMode) {
      const naRadio = el.querySelector(`input[name="enc-na-mode"][value="${state.naMode}"]`);
      if (naRadio) naRadio.checked = true;
    }
    if (state.numGroups && el.querySelector('#enc-groups')) { el.querySelector('#enc-groups').value = state.numGroups; }

    // Display TPL (max + real)
    this._updateTplDisplay();

    // Generate button
    const genBtn = el.querySelector('[data-action="generateEncounter"]');
    if (genBtn && !genBtn._hasEncListener) {
      genBtn.addEventListener('click', () => this._onGenerateEncounter());
      genBtn._hasEncListener = true;
    }

    // Drop to Scene button
    const dropBtn = el.querySelector('[data-action="dropToScene"]');
    if (dropBtn && !dropBtn._hasDropListener) {
      dropBtn.addEventListener('click', () => this._onDropToScene());
      dropBtn._hasDropListener = true;
    }

    // Restore last result if available
    if (state.lastResult) {
      this._renderEncounterResults(state.lastResult);
    }
    
    // Restore last monsters for drop to scene
    if (state.lastMonsters) {
      this._lastGeneratedMonsters = state.lastMonsters;
      // Show drop controls if monsters are available
      const dropControls = this.element.querySelector('.enc-drop-controls');
      if (dropControls && this._lastGeneratedMonsters?.length > 0) {
        dropControls.style.display = 'flex';
      }
    }
  }

  async _onGenerateEncounter() {
    const el = this.element;
    const location    = el.querySelector('#enc-location')?.value    ?? 'random';
    const monsterType = el.querySelector('#enc-monster-type')?.value ?? 'random';
    const rarity      = el.querySelector('#enc-rarity')?.value      ?? 'random';
    const challengeKey = el.querySelector('#enc-challenge')?.value  ?? 'good-fight';
    const naMode      = el.querySelector('input[name="enc-na-mode"]:checked')?.value ?? 'wandering';
    const numGroups   = parseInt(el.querySelector('#enc-groups')?.value ?? '1');

    // Collect party actors (including seguaci)
    const partyFolder   = game.folders?.find(f => f.type === 'Actor' && f.name.toLowerCase() === 'party');
    const seguaciFolder = game.folders?.find(f => f.type === 'Actor' && f.name.toLowerCase() === 'seguaci');
    const actors = [
      ...(partyFolder   ? game.actors.filter(a => a.type === 'character' && partyFolder.contents?.some(c => c.id === a.id))   : game.actors.filter(a => a.type === 'character')),
      ...(seguaciFolder ? game.actors.filter(a => a.type === 'character' && seguaciFolder.contents?.some(c => c.id === a.id)) : [])
    ];

    const genBtn = el.querySelector('[data-action="generateEncounter"]');
    if (genBtn) { genBtn.disabled = true; genBtn.textContent = game.i18n.localize('ENCOUNTER.Generating'); }

    try {
      const { EncounterGenerator } = await import('./pg-encounter.mjs');
      const result = await EncounterGenerator.generate({ location, monsterType, rarity, challengeKey, naMode, numGroups, actors });

      if (genBtn) { genBtn.disabled = false; genBtn.textContent = game.i18n.localize('ENCOUNTER.GenerateBtn'); }

      if (result.error) {
        ui.notifications.warn(result.error);
        return;
      }

      // Persist result so it survives tab switches
      this.encounterState.lastResult = result;
      this._renderEncounterResults(result);
    } catch (e) {
      console.error(`${MODULE_ID} | Encounter generation error:`, e);
      if (genBtn) { genBtn.disabled = false; genBtn.textContent = game.i18n.localize('ENCOUNTER.GenerateBtn'); }
      ui.notifications.error('Encounter generation failed. See console for details.');
    }
  }

  _updateTplDisplay() {
    const el = this.element;
    if (!el) return;
    const partyFolder   = game.folders?.find(f => f.type === 'Actor' && f.name.toLowerCase() === 'party');
    const seguaciFolder = game.folders?.find(f => f.type === 'Actor' && f.name.toLowerCase() === 'seguaci');
    const partyActors = [
      ...(partyFolder   ? game.actors.filter(a => a.type === 'character' && partyFolder.contents?.some(c => c.id === a.id))   : game.actors?.filter(a => a.type === 'character') ?? []),
      ...(seguaciFolder ? game.actors.filter(a => a.type === 'character' && seguaciFolder.contents?.some(c => c.id === a.id)) : [])
    ];
    const baseTpl = partyActors.reduce((s, a) => s + Number(a.system?.details?.level ?? 1), 0);
    const tplDisplay = el.querySelector('#enc-tpl-display');
    if (tplDisplay) tplDisplay.textContent = baseTpl || '—';

    // Calculate real TPL live
    import('./pg-encounter.mjs').then(({ EncounterGenerator }) => {
      const { realTPL, note } = EncounterGenerator.calculateRealTPL(partyActors);
      const realTpl = realTPL > 0 ? realTPL : baseTpl;
      this._liveRealTpl = realTpl;
      const realTplDisplay = el.querySelector('#enc-real-tpl-display');
      const tplNote        = el.querySelector('#enc-tpl-note');
      if (realTplDisplay) {
        realTplDisplay.textContent = realTpl || '—';
        // Remap: RC minimum is ~50% of max (floor(level/2)), so red starts at 50%
        // rescale: 50%→0 (red), 100%→1 (green)
        const raw = baseTpl > 0 ? Math.min(realTpl / baseTpl, 1) : 1;
        const ratio = Math.max(0, (raw - 0.5) / 0.5);
        const hue = Math.round(ratio * 120);
        realTplDisplay.style.color = realTpl ? `hsl(${hue}, 90%, 58%)` : '';
      }
      if (tplNote) tplNote.textContent = note || '';
      // Refresh footer if results are visible
      const totalHDDisplay = el.querySelector('#enc-total-hd-display');
      if (totalHDDisplay && totalHDDisplay.textContent) {
        totalHDDisplay.textContent = totalHDDisplay.textContent.replace(/Real TPL[^:]*:\s*\d+/, `${game.i18n.localize('ENCOUNTER.RealTPLShort')}: ${realTpl}`);
      }
    }).catch(() => {});
  }

  _renderEncounterResults(result) {
    const el = this.element;

    // Refresh TPL display with live data
    this._updateTplDisplay();

    const tplNote = el.querySelector('#enc-tpl-note');
    if (tplNote) tplNote.textContent = result.tplNote || '';

    // Challenge badge
    const badge = el.querySelector('#enc-challenge-badge');
    if (badge) {
      badge.textContent = game.i18n.localize(result.challengeResult.labelKey || 'ENCOUNTER.GoodFight');
      badge.style.background = result.color;
    }

    // Monster list
    const list = el.querySelector('#enc-monster-list');
    if (list) {
      list.innerHTML = '';
      for (const { monster, qty, groupHD } of result.groups) {
        const row = document.createElement('div');
        row.className = 'enc-monster-row';
        row.setAttribute('draggable', 'true');
        row.dataset.uuid = monster.uuid;
        row.innerHTML = `
          <img class="enc-monster-img enc-monster-clickable" src="${monster.img}" title="${monster.name}" data-uuid="${monster.uuid}" />
          <span class="enc-monster-name enc-monster-clickable" data-uuid="${monster.uuid}">${monster.name}</span>
          <span class="enc-monster-qty">×${qty}</span>
          <span class="enc-monster-hd">${game.i18n.format('ENCOUNTER.MonsterHD', { hd: monster.adjustedHD, adj: groupHD.toFixed(1) })}</span>
          <span class="enc-monster-drag" title="Drag to canvas">⠿</span>
        `;
        // Click handler — open actor sheet
        row.querySelectorAll('.enc-monster-clickable').forEach(el => {
          el.addEventListener('click', async (ev) => {
            ev.stopPropagation();
            try {
              const actor = await fromUuid(monster.uuid);
              if (actor) actor.sheet?.render(true);
            } catch (e) {
              console.warn(`${MODULE_ID} | Could not open actor sheet:`, e);
            }
          });
        });

        // Drag handler — Foundry V14 canvas drop format
        row.addEventListener('dragstart', (ev) => {
          const dragData = {
            type: 'Actor',
            uuid: monster.uuid
          };
          ev.dataTransfer.effectAllowed = 'copy';
          ev.dataTransfer.setData('text/plain', JSON.stringify(dragData));
          // Set drag image to monster portrait
          const img = row.querySelector('.enc-monster-img');
          if (img) ev.dataTransfer.setDragImage(img, 14, 14);
        });
        list.appendChild(row);
      }
    }

    // Footer
    const totalHDDisplay = el.querySelector('#enc-total-hd-display');
    const pctDisplay     = el.querySelector('#enc-pct-display');
    if (totalHDDisplay) totalHDDisplay.textContent = `${game.i18n.localize('ENCOUNTER.TotalAdjHD')}: ${result.totalAdjHD.toFixed(1)}  /  ${game.i18n.localize('ENCOUNTER.RealTPLShort')}: ${this._liveRealTpl ?? result.realTPL ?? result.tpl}`;
    if (pctDisplay)     pctDisplay.textContent     = `${(result.pct * 100).toFixed(0)}%  →  ${game.i18n.localize(result.challengeResult.labelKey || 'ENCOUNTER.GoodFight')}`;

    // Show results, hide empty state
    const resultsEl = el.querySelector('#enc-results');
    const emptyEl   = el.querySelector('#enc-empty');
    if (resultsEl) resultsEl.style.display = '';
    if (emptyEl)   emptyEl.style.display   = 'none';

    // Store monsters for drop-to-scene and show drop controls
    this._lastGeneratedMonsters = result.groups || [];
    const dropControls = el.querySelector('#enc-drop-controls');
    if (dropControls && this._lastGeneratedMonsters.length > 0) {
      dropControls.style.display = 'flex';
    }
  }

  // ==========================================
  // Drop to Scene - Inserisci nella Scena
  // ==========================================

  _onDropToScene() {
    // Check if there are monsters to drop
    if (!this._lastGeneratedMonsters || this._lastGeneratedMonsters.length === 0) {
      ui.notifications.warn(game.i18n.localize('ENCOUNTER.NoMonstersToDrop'));
      return;
    }

    // Check if a canvas is active
    if (!canvas?.ready || !canvas.scene) {
      ui.notifications.warn(game.i18n.localize('ENCOUNTER.NoActiveScene'));
      return;
    }

    // Show overlay and activate drop mode
    const overlay = this.element.querySelector('#enc-drop-overlay');
    if (overlay) overlay.style.display = 'flex';

    // Store reference to this for cleanup
    const self = this;

    // Create one-time click handler for canvas placement
    this._dropClickHandler = async (event) => {
      // Only handle left click
      if (event.button !== 0) return;

      // Get canvas coordinates from mouse position
      const { x, y } = canvas.mousePosition;
      if (!x || !y) return;

      // Hide overlay
      if (overlay) overlay.style.display = 'none';

      // Remove handlers
      canvas.app.view.removeEventListener('mousedown', self._dropClickHandler);
      window.removeEventListener('keydown', self._dropCancelHandler);
      self._dropClickHandler = null;
      self._dropCancelHandler = null;

      // Reset cursor
      if (canvas.app.view) canvas.app.view.style.cursor = '';

      await self._placeMonstersOnCanvas(x, y);
    };

    canvas.app.view.addEventListener('mousedown', this._dropClickHandler);

    // Also handle Escape key to cancel
    this._dropCancelHandler = (event) => {
      if (event.key === 'Escape') {
        // Prevent closing the window
        event.preventDefault();
        event.stopPropagation();

        if (overlay) overlay.style.display = 'none';
        canvas.app.view.removeEventListener('mousedown', self._dropClickHandler);
        window.removeEventListener('keydown', self._dropCancelHandler);
        self._dropClickHandler = null;
        self._dropCancelHandler = null;

        // Remove cursor styling
        if (canvas.app.view) canvas.app.view.style.cursor = '';

        ui.notifications.info(game.i18n.localize('ENCOUNTER.DropCancelled'));
      }
    };
    window.addEventListener('keydown', this._dropCancelHandler);

    // Change cursor to crosshair on canvas
    if (canvas.app.view) canvas.app.view.style.cursor = 'crosshair';

    ui.notifications.info(game.i18n.localize('ENCOUNTER.ClickMapToPlaceHint'));
  }

  async _placeMonstersOnCanvas(centerX, centerY) {
    const monsters = this._lastGeneratedMonsters;
    if (!monsters || monsters.length === 0) return;

    const scene = canvas.scene;
    const gridSize = canvas.grid.size || 50;
    const tokensToCreate = [];

    // Calculate positions in circular formation
    const radius = Math.max(gridSize * 1.5, (monsters.length * gridSize) / 4);

    for (let i = 0; i < monsters.length; i++) {
      const monster = monsters[i];
      const qty = monster.qty || 1;

      // For multiple monsters of same type, arrange in small cluster
      for (let j = 0; j < qty; j++) {
        let tx, ty;

        if (monsters.length === 1 && qty === 1) {
          // Single monster - place at center
          tx = centerX;
          ty = centerY;
        } else {
          // Multiple monsters - circular formation
          const angle = ((i * qty + j) / (monsters.length * qty)) * Math.PI * 2;
          const dist = radius * (0.5 + Math.random() * 0.5); // Random variation
          tx = centerX + Math.cos(angle) * dist;
          ty = centerY + Math.sin(angle) * dist;
        }

        // Snap to grid - get top-left of grid cell for v14
        const gridPosition = canvas.grid.getTopLeftPoint({ x: tx, y: ty });
        tx = gridPosition.x;
        ty = gridPosition.y;

        // Get actor to determine token size
        const monsterData = monster.monster;
        const monsterName = monsterData?.name || 'Unknown';
        const monsterUuid = monsterData?.uuid;
        
        try {
          const compendiumActor = await fromUuid(monsterUuid);
          if (!compendiumActor) continue;

          // Check if actor is from compendium (not world actor)
          let worldActor = compendiumActor;
          if (compendiumActor.pack) {
            const existingActor = game.actors.find(a => a.name === compendiumActor.name);
            if (existingActor) {
              worldActor = existingActor;
            } else {
              const actorData = compendiumActor.toObject();
              delete actorData._id;
              worldActor = await Actor.create(actorData);
            }
          }

          const tokenData = await worldActor.getTokenDocument({ x: tx, y: ty });
          const tokenObject = tokenData.toObject();
          tokenObject.actorId = worldActor.id;
          tokenObject.actorUuid = worldActor.uuid;
          tokensToCreate.push(tokenObject);
        } catch (e) {
          console.warn(`${MODULE_ID} | [DROP] Could not create token for ${monsterName}:`, e);
        }
      }
    }

    if (tokensToCreate.length > 0) {
      try {
        await scene.createEmbeddedDocuments('Token', tokensToCreate);
        ui.notifications.info(game.i18n.format('ENCOUNTER.MonstersPlaced', { count: tokensToCreate.length }));
      } catch (e) {
        console.error(`${MODULE_ID} | [DROP] Failed to place tokens:`, e);
        ui.notifications.error(game.i18n.localize('ENCOUNTER.PlaceFailed'));
      }
    } else {
      console.warn(`${MODULE_ID} | [DROP] No tokens to create!`);
    }
  }

  // ==========================================
  // Award XP Actions - Azioni Assegnazione PX
  // ==========================================
  
  static async _onCalculateShares(event) {
    const form = this.element.querySelector('.xp-award-form');
    if (!form) return;
    
    const globalXP = parseInt(form.querySelector('[name="global-xp-input"]')?.value) || 0;
    const mode = form.querySelector('[name="award-mode"]')?.value || 'equal';
    
    if (globalXP <= 0) {
      ui.notifications.warn(game.i18n.localize('NOTIFY.EnterValidXP'));
      return;
    }
    
    // Get all table rows (table is outside the form, search in the whole element)
    const rows = this.element.querySelectorAll('#xp-distribution-body tr');
    const actorShares = [];
    
    rows.forEach((row, index) => {
      const actorId = row.dataset.actorId;
      const shareInput = row.querySelector('.share-input');
      const baseInput = row.querySelector('.xp-base-input');
      const totalInput = row.querySelector('.xp-total-input');
      const bonusCell = row.querySelector('td:nth-child(4)');
      
      const shareValue = shareInput?.value || '0';
      const share = parseFloat(shareValue) || 0;
      const bonusText = bonusCell?.textContent || '0%';
      const bonusPercent = parseInt(bonusText) || 0;
      
      actorShares.push({
        actorId,
        share,
        bonusPercent,
        baseInput,
        totalInput,
        row
      });
    });
    
    // In share mode, check that actors without class have 0 share
    if (mode === 'share') {
      const actorsWithoutClassWithShare = actorShares.filter(s => {
        const actor = this.actors.find(a => a.id === s.actorId);
        return actor && (!actor.class || actor.class.trim() === '-') && s.share > 0;
      });
      
      if (actorsWithoutClassWithShare.length > 0) {
        ui.notifications.warn(game.i18n.localize('NOTIFY.ClassMissingZeroShare'));
        return;
      }
    }
    
    // Calculate XP distribution
    if (mode === 'equal') {
      // Equal distribution among actors with share > 0
      const eligibleActors = actorShares.filter(s => s.share > 0);
      if (eligibleActors.length === 0) {
        ui.notifications.warn(game.i18n.localize('NOTIFY.NoPositiveShares'));
        return;
      }
      
      const baseXP = Math.floor(globalXP / eligibleActors.length);
      
      eligibleActors.forEach(s => {
        const bonusXP = Math.floor(baseXP * s.bonusPercent / 100);
        const totalXP = baseXP + bonusXP;
        
        if (s.baseInput) s.baseInput.value = baseXP;
        if (s.totalInput) s.totalInput.value = totalXP;
      });
    } else if (mode === 'share') {
      // Proportional distribution based on shares
      const totalShares = actorShares.reduce((sum, s) => sum + s.share, 0);
      if (totalShares === 0) {
        ui.notifications.warn(game.i18n.localize('NOTIFY.SharesSumZero'));
        return;
      }
      
      actorShares.forEach(s => {
        if (s.share > 0) {
          const baseXP = Math.floor(globalXP * s.share / totalShares);
          const bonusXP = Math.floor(baseXP * s.bonusPercent / 100);
          const totalXP = baseXP + bonusXP;
          
          if (s.baseInput) s.baseInput.value = baseXP;
          if (s.totalInput) s.totalInput.value = totalXP;
        } else {
          if (s.baseInput) s.baseInput.value = 0;
          if (s.totalInput) s.totalInput.value = 0;
        }
      });
    }
    
    ui.notifications.info(game.i18n.localize('NOTIFY.XPForEncounter'));
  }
  
  _calculateDistribution(actors, totalXP, mode) {
    if (mode === 'equal') {
      const share = Math.floor(totalXP / actors.length);
      return actors.map(a => ({ ...a, xpShare: share }));
    } else if (mode === 'share') {
      const totalLevel = actors.reduce((sum, a) => sum + (a.level || 1), 0);
      return actors.map(a => {
        const share = Math.floor((totalXP * (a.level || 1)) / totalLevel);
        return { ...a, xpShare: share };
      });
    }
    return actors.map(a => ({ ...a, xpShare: 0 }));
  }
  
  static async _onStoreXP(event) {
    const rows = this.element.querySelectorAll('#xp-distribution-body tr');
    let storedCount = 0;
    let totalStored = 0;
    const awardedList = []; // Track awarded XP for chat message
    
    for (const row of rows) {
      const actorId = row.dataset.actorId;
      const totalInput = row.querySelector('.xp-total-input');
      const baseInput = row.querySelector('.xp-base-input');
      const bonusCell = row.querySelector('td:nth-child(4)');
      const pendingCell = row.querySelector('.xp-pending');
      const nameCell = row.querySelector('td:first-child');
      
      // Read total XP - either from total input or calculate from base + bonus
      let totalXP = parseInt(totalInput?.value) || 0;
      
      // If total is 0 but base has value (custom mode), calculate total with bonus
      if (totalXP === 0 && baseInput) {
        const baseXP = parseInt(baseInput.value) || 0;
        const bonusPercent = parseInt(bonusCell?.textContent) || 0;
        if (baseXP > 0) {
          const bonusXP = Math.floor(baseXP * bonusPercent / 100);
          totalXP = baseXP + bonusXP;
        }
      }
      
      if (totalXP > 0 && actorId) {
        // Get current pending and add new XP
        const currentPending = this._getPendingXP(actorId);
        const newPending = currentPending + totalXP;
        await this._setPendingXP(actorId, newPending);
        
        // Update the pending cell in the UI directly
        if (pendingCell) {
          pendingCell.textContent = newPending;
        }
        
        // Track for chat message
        const actorName = nameCell?.textContent?.trim() || 'Sconosciuto';
        awardedList.push({ name: actorName, xp: totalXP, newTotal: newPending });
        
        // Clear the calculated values
        if (baseInput) baseInput.value = 0;
        if (totalInput) totalInput.value = 0;
        
        storedCount++;
        totalStored += totalXP;
      }
    }
    
    // Reset the global XP input and clear saved values (skip in custom mode)
    const currentMode = this.element.querySelector('[name="award-mode"]')?.value || 'equal';
    if (currentMode !== 'custom') {
      const globalInput = this.element.querySelector('[name="global-xp-input"]');
      if (globalInput) {
        globalInput.value = 0;
        globalInput.classList.remove('editable-mode');
      }
      this._savedGlobalXP = 0;
      game.settings.set(MODULE_ID, 'globalXP', 0);
      // Flag to skip restore on next render
      this._skipRestoreXP = true;
    }
    
    if (storedCount > 0) {
      ui.notifications.info(game.i18n.format('NOTIFY.XPStoredCount', { total: totalStored, count: storedCount }));
      
      // Refresh pending tab count
      this.pendingCount = this.actors.filter(a => this._getPendingXP(a.id) > 0).length;
      this.render();
    } else {
      ui.notifications.warn(game.i18n.localize('NOTIFY.NoXPToStore'));
    }
  }
  
  /**
   * Create a chat message with XP award summary (GM only)
   */
  static async _createXPAwardChatMessage(awardedList, totalStored) {
    const gmUsers = game.users.filter(u => u.isGM).map(u => u.id);
    
    const listHtml = awardedList.map(item => 
      `<div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(139, 115, 85, 0.3);">
        <span><strong>${item.name}</strong></span>
        <span style="color: #ffd93d;">+${item.xp} PX</span>
      </div>`
    ).join('');
    
    const content = `
      <div style="background: url('systems/fantastic-depths/assets/img/grungegreen.jpg'); padding: 15px; border-radius: 8px; color: #f0e6d2; font-family: serif;">
        <h3 style="text-align: center; margin: 0 0 15px 0; color: #ffd93d; text-shadow: 1px 1px 2px #000;">🏆 ${game.i18n.localize('CHAT.XPAwardedTitle')}</h3>
        <div style="background: rgba(0,0,0,0.4); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
          ${listHtml}
        </div>
        <div style="text-align: center; font-size: 1.2em; padding-top: 10px; border-top: 2px solid rgba(139, 115, 85, 0.5);">
          <strong>${game.i18n.localize('CHAT.Total')}: <span style="color: #ffd93d;">${totalStored} ${game.i18n.localize('CHAT.XP')}</span></strong>
        </div>
        <div style="text-align: center; font-size: 0.9em; color: #aaa; margin-top: 10px;">
          ${game.i18n.localize('CHAT.XPWillBeAwarded')}
        </div>
      </div>
    `;
    
    await ChatMessage.create({
      content: content,
      whisper: gmUsers,
      speaker: { alias: game.i18n.localize('PGPXM.Title') }
    });
  }
  
  /**
   * Override _onKeyDown to handle ESC key specially during drop mode
   */
  _onKeyDown(event) {
    // If we're in drop mode, ESC should only cancel the drop, not close the window
    if (this._dropModeActive && event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this._cancelDropMode();
      return false;
    }
    
    // Otherwise, call parent implementation
    return super._onKeyDown(event);
  }
  
  /**
   * Cancel drop mode and restore normal UI state
   */
  _cancelDropMode() {
    if (!this._dropModeActive) return;
    
    this._dropModeActive = false;
    
    // Remove event listeners
    if (this._dropClickHandler) {
      canvas.app.view.removeEventListener('mousedown', this._dropClickHandler);
      this._dropClickHandler = null;
    }
    if (this._dropCancelHandler) {
      window.removeEventListener('keydown', this._dropCancelHandler);
      this._dropCancelHandler = null;
    }
    
    // Restore cursor
    if (canvas.app.view) canvas.app.view.style.cursor = '';
    
    // Hide overlay
    const overlay = this.element.querySelector('.enc-drop-overlay');
    if (overlay) overlay.classList.remove('active');
    
    ui.notifications.info(game.i18n.localize('ENCOUNTER.DropCancelled'));
  }
  
  async close(options={}) {
    // Save encounter state before closing
    this._saveEncounterState();
    
    // Clear global reference when closing
    globalThis.activePGPXApp = null;
    return super.close(options);
  }
  
  static async _onAwardNow(event) {
    // Award XP immediately to actors based on calculated totals
    const rows = this.element.querySelectorAll('#xp-distribution-body tr');
    let awardedCount = 0;
    let totalAwarded = 0;
    
    for (const row of rows) {
      const actorId = row.dataset.actorId;
      const totalInput = row.querySelector('.xp-total-input');
      const baseInput = row.querySelector('.xp-base-input');
      const bonusCell = row.querySelector('td:nth-child(4)');
      
      // Read total XP - either from total input or calculate from base + bonus
      let totalXP = parseInt(totalInput?.value) || 0;
      
      // If total is 0 but base has value (custom mode), calculate total with bonus
      if (totalXP === 0 && baseInput) {
        const baseXP = parseInt(baseInput.value) || 0;
        const bonusText = bonusCell?.textContent || '0%';
        const bonusPercent = parseInt(bonusText) || 0;
        if (baseXP > 0) {
          const bonusXP = Math.floor(baseXP * bonusPercent / 100);
          totalXP = baseXP + bonusXP;
        }
      }
      
      if (totalXP > 0 && actorId) {
        const actor = game.actors.get(actorId);
        
        if (actor) {
          // Get current XP from system.details.xp.value (FaDe system path)
          const currentXP = parseInt(actor.system?.details?.xp?.value) || 0;
          const newXP = currentXP + totalXP;
          
          // Update actor XP using FaDe system path
          try {
            await actor.update({ 'system.details.xp.value': newXP });
            awardedCount++;
            totalAwarded += totalXP;
          } catch (err) {
            console.error(`[DEBUG] Error updating ${actor.name}:`, err);
            ui.notifications.error(game.i18n.format('NOTIFY.ActorUpdateError', { name: actor.name, message: err.message }));
          }
        } else {
          console.warn(`[DEBUG] Actor not found: ${actorId}`);
        }
      }
    }
    
    if (awardedCount > 0) {
      ui.notifications.info(game.i18n.format('NOTIFY.XPAwardedCount', { count: awardedCount, total: totalAwarded }));
      // Refresh the app to show updated values
      await this.render(true);
    } else {
      ui.notifications.warn(game.i18n.localize('NOTIFY.NoXPToAward'));
    }
  }
  
  static async _onAwardPending(event) {
    // Award pending XP to selected actors
    const pendingItems = this.element.querySelectorAll('.pending-item');
    let awardedCount = 0;
    let totalAwarded = 0;
    const awardedList = []; // Track awarded XP for chat message
    
    for (const item of pendingItems) {
      const checkbox = item.querySelector('.pending-checkbox');
      const actorId = item.dataset.actorId;
      const pendingXP = parseInt(item.querySelector('.xp-pending')?.textContent) || 0;
      const nameCell = item.querySelector('.actor-name');
      
      // Only process if checkbox is checked and there's XP to award
      if (checkbox?.checked && actorId && pendingXP > 0) {
        const actor = game.actors.get(actorId);
        
        if (actor) {
          // Get current XP and add pending XP
          const currentXP = parseInt(actor.system?.details?.xp?.value) || 0;
          const newXP = currentXP + pendingXP;
          
          try {
            // Update actor XP
            await actor.update({ 'system.details.xp.value': newXP });
            
            // Clear pending XP
            await this._setPendingXP(actorId, 0);
            
            // Track for chat message
            const actorName = nameCell?.textContent?.trim()?.split(' - ')[0] || actor.name || 'Sconosciuto';
            awardedList.push({ name: actorName, xp: pendingXP, newTotal: newXP });
            
            awardedCount++;
            totalAwarded += pendingXP;
          } catch (err) {
            console.error(`${MODULE_ID} | Error awarding pending XP to ${actor.name}:`, err);
            ui.notifications.error(game.i18n.format('NOTIFY.ActorUpdateError', { name: actor.name, message: err.message }));
          }
        }
      }
    }
    
    if (awardedCount > 0) {
      ui.notifications.info(game.i18n.format('NOTIFY.XPPendingAwarded', { count: awardedCount, total: totalAwarded }));
      
      // Create chat message with summary (GM only)
      await PGPXManagerApp._createXPAwardNowChatMessage(awardedList, totalAwarded);
      
      // Refresh pending count and re-render
      this.pendingCount = this.actors.filter(a => this._getPendingXP(a.id) > 0).length;
      await this.render(true);
    } else {
      ui.notifications.warn(game.i18n.localize('NOTIFY.NoXPPendingSelected'));
    }
  }
  
  /**
   * Create a chat message with immediate XP award summary (GM only)
   */
  static async _createXPAwardNowChatMessage(awardedList, totalAwarded) {
    const gmUsers = game.users.filter(u => u.isGM).map(u => u.id);
    
    const listHtml = awardedList.map(item => 
      `<div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(139, 115, 85, 0.3);">
        <span><strong>${item.name}</strong></span>
        <span style="color: #ffd93d;">+${item.xp} PX</span>
      </div>`
    ).join('');
    
    const content = `
      <div style="background: url('systems/fantastic-depths/assets/img/grungegreen.jpg'); padding: 15px; border-radius: 8px; color: #f0e6d2; font-family: serif;">
        <h3 style="text-align: center; margin: 0 0 15px 0; color: #ffd93d; text-shadow: 1px 1px 2px #000;">🏆 ${game.i18n.localize('CHAT.XPAwardedTitle')}</h3>
        <div style="background: rgba(0,0,0,0.4); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
          ${listHtml}
        </div>
        <div style="text-align: center; font-size: 1.2em; padding-top: 10px; border-top: 2px solid rgba(139, 115, 85, 0.5);">
          <strong>${game.i18n.localize('CHAT.Total')}: <span style="color: #ffd93d;">${totalAwarded} ${game.i18n.localize('CHAT.XP')}</span></strong>
        </div>
        <div style="text-align: center; font-size: 0.9em; color: #aaa; margin-top: 10px;">
          ${game.i18n.localize('CHAT.XPAddedDirectly')}
        </div>
      </div>
    `;
    
    const isPublic = game.settings.get(MODULE_ID, 'pendingChatPublic');
    const messageData = {
      content: content,
      speaker: { alias: game.i18n.localize('PGPXM.Title') }
    };
    if (!isPublic) {
      messageData.whisper = gmUsers;
    }
    await ChatMessage.create(messageData);
  }
  
  static async _onChangeMode(event) {
    const select = event.target;
    const mode = select.value;
    const globalInput = this.element.querySelector('[name="global-xp-input"]');
    const shareInputs = this.element.querySelectorAll('.share-input');
    const baseInputs = this.element.querySelectorAll('.xp-base-input');
    const totalInputs = this.element.querySelectorAll('.xp-total-input');
    
    // Reset all yellow borders
    globalInput?.classList.remove('editable-mode');
    shareInputs.forEach(input => input.classList.remove('editable-mode'));
    baseInputs.forEach(input => input.classList.remove('editable-mode'));
    
    if (mode === 'equal') {
      // Equal mode: global editable, others non-editable
      if (globalInput) {
        globalInput.disabled = false;
        globalInput.classList.add('editable-mode');
      }
      shareInputs.forEach(input => { input.disabled = true; });
      baseInputs.forEach(input => { input.disabled = true; input.value = 0; });
      totalInputs.forEach(input => { input.disabled = true; });
    } else if (mode === 'share') {
      // Share mode: global and share editable, others non-editable
      if (globalInput) {
        globalInput.disabled = false;
        globalInput.classList.add('editable-mode');
      }
      shareInputs.forEach(input => {
        input.disabled = false;
        input.classList.add('editable-mode');
      });
      baseInputs.forEach(input => { input.disabled = true; input.value = 0; });
      totalInputs.forEach(input => { input.disabled = true; });
    } else if (mode === 'custom') {
      // Custom mode: only xp-total-input editable
      if (globalInput) {
        globalInput.disabled = true;
        globalInput.classList.remove('editable-mode');
      }
      shareInputs.forEach(input => {
        input.disabled = true;
        input.classList.remove('editable-mode');
      });
      baseInputs.forEach(input => { input.disabled = true; input.value = 0; });
      totalInputs.forEach(input => {
        input.disabled = false;
        input.readOnly = false;
        input.classList.add('editable-mode');
      });
    }
  }
  
  static async _onClearPending(event) {
    // Clear pending XP only for selected actors (checked checkboxes)
    const pendingItems = this.element.querySelectorAll('.pending-item');
    let clearedCount = 0;
    let totalCleared = 0;
    
    for (const item of pendingItems) {
      const checkbox = item.querySelector('.pending-checkbox');
      const actorId = item.dataset.actorId;
      const pendingXP = parseInt(item.querySelector('.xp-pending')?.textContent) || 0;
      
      // Only clear if checkbox is checked and there's XP to clear
      if (checkbox?.checked && actorId && pendingXP > 0) {
        await this._setPendingXP(actorId, 0);
        clearedCount++;
        totalCleared += pendingXP;
      }
    }
    
    if (clearedCount > 0) {
      ui.notifications.info(game.i18n.format('NOTIFY.XPClearedSelected', { count: clearedCount, total: totalCleared }));
      this.pendingCount = this.actors.filter(a => this._getPendingXP(a.id) > 0).length;
      await this.render(true);
    } else {
      ui.notifications.warn(game.i18n.localize('NOTIFY.NoXPPendingSelected'));
    }
  }
  
  static async _onResetValues(event) {
    // Reset all award values
    await this.render();
    ui.notifications.info(game.i18n.localize('NOTIFY.ValuesReset'));
  }
  
  static async _onAddTreasureXP(event) {
    // Open native App V2 dialog to add treasure XP value
    const { Dialog } = foundry.applications.api;
    
    const treasureValue = await new Promise((resolve) => {
      const dialog = new Dialog({
        window: {
          title: game.i18n.localize('AWARD.AddTreasureTitle'),
          resizable: false,
          minimizable: false
        },
        position: {
          width: 300,
          height: 'auto'
        },
        content: `
          <div class="treasure-xp-form">
            <div class="form-group">
              <label style="color: #ffd93d; font-weight: 600;">${game.i18n.localize('AWARD.TreasureValueLabel')}</label>
              <input type="number" id="treasure-xp-value" value="0" min="0" style="background: #2a2a2a; border: 1px solid rgba(255,255,255,0.2); color: #e0e0e0; padding: 8px; border-radius: 4px; width: 50%; text-align: right;">
            </div>
          </div>
        `,
        buttons: [
          {
            action: 'add',
            label: game.i18n.localize('AWARD.AddButton'),
            icon: 'fas fa-plus',
            callback: () => {
              const input = dialog.element.querySelector('#treasure-xp-value');
              const value = parseInt(input?.value) || 0;
              resolve(value);
            }
          },
          {
            action: 'cancel',
            label: game.i18n.localize('AWARD.CancelButton'),
            icon: 'fas fa-times',
            callback: () => resolve(0)
          }
        ],
        classes: ['fade-app', 'dialog']
      });
      // Add input limit after render
      dialog.addEventListener('render', () => {
        const input = dialog.element.querySelector('#treasure-xp-value');
        if (input) {
          input.addEventListener('beforeinput', (event) => {
            const currentValue = input.value.replace(/\D/g, '');
            const selectionLength = input.selectionEnd - input.selectionStart;
            const newLength = currentValue.length - selectionLength + (event.data?.length || 0);
            if (newLength > 8 && event.inputType !== 'deleteContentBackward' && event.inputType !== 'deleteContentForward') {
              event.preventDefault();
            }
          });
        }
      });
      
      dialog.render(true);
    });
    
    if (treasureValue > 0) {
      // Find the global XP input - try document first, then fallback
      let globalInput = document.querySelector('[name="global-xp-input"]');
      if (!globalInput) {
        globalInput = document.querySelector('.xp-global-input');
      }
      
      if (globalInput) {
        const currentValue = parseInt(globalInput.value) || 0;
        const newValue = currentValue + treasureValue;
        // Check against max limit (12 digits)
        const maxValue = 999999999999;
        globalInput.value = Math.min(newValue, maxValue);
        
        // Add editable-mode class to indicate custom value
        globalInput.classList.add('editable-mode');
        
        // Trigger change event to update calculations
        globalInput.dispatchEvent(new Event('change'));
        
        // Also update saved value for persistence
        const app = ui.windows?.[Object.keys(ui.windows).find(k => ui.windows[k].constructor.name === 'PGPXManagerApp')];
        if (app) {
          app._savedGlobalXP = parseInt(globalInput.value) || 0;
        }
        
        ui.notifications.info(game.i18n.localize('AWARD.TreasureAdded').replace('{value}', treasureValue));
      }
    }
  }
  
  static async _onShowWrestling(event) {
    // Show wrestling dialog from Fantastic Depths system
    if (game.fade?.registry?.getSystem('wrestling')?.showWrestlingDialog) {
      game.fade.registry.getSystem('wrestling').showWrestlingDialog();
    } else {
      ui.notifications.warn('Wrestling system not available.');
    }
  }
  
  static async _onShowShove(event) {
    // Show shove dialog from Fantastic Depths system
    if (game.fade?.registry?.getSystem('shove')?.showShoveDialog) {
      game.fade.registry.getSystem('shove').showShoveDialog();
    } else {
      ui.notifications.warn('Shove system not available.');
    }
  }
  
  static async _onShowAcrobatics(event) {
    // Execute acrobatics check macro
    await executeAcrobaticsCheck();
  }
  
  static async _onShowRollTableHelper(event) {
    // Show custom roll table dialog
    await RollTableDialog.show();
  }
  
  static async _onShowLightManager(event) {
    // Show light manager dialog from Fantastic Depths system
    if (game.fade?.LightManager?.showLightDialog) {
      game.fade.LightManager.showLightDialog();
    } else {
      ui.notifications.warn('Light Manager not available.');
    }
  }
  
  // ==========================================
  // Character Generator Actions
  // ==========================================
  
  static async _onGenerateCharacter(event) {
    // Get form data
    const form = this.element.querySelector('#pg-generator-form');
    if (!form) {
      ui.notifications.error(game.i18n.localize('NOTIFY.FormNotFound'));
      return;
    }
    
    const formData = new FormData(form);
    
    // Extract values using new field names
    const name = formData.get('char-name')?.trim() || '';
    const classId = formData.get('char-class');
    const levelSelect = formData.get('char-level-select');
    const levelFormula = formData.get('char-level-formula');
    const level = levelFormula?.trim() || levelSelect || '__RANDOM__';
    const alignment = formData.get('char-alignment') || '__RANDOM__';
    const equipment = formData.get('char-equipment') || '__GOLD_START__';
    const isRetainer = formData.get('char-is-retainer') === 'on';
    const sex = formData.get('char-sex') || null; // M or F, null if not selected
    const height = formData.get('char-height') || '__RANDOM__'; // Height selection
    const disposition = parseInt(formData.get('char-disposition')) ?? 1; // Token disposition (1=friendly, 0=neutral, -1=hostile, -2=secret)
    
    // Extract stats from stat-xxx fields
    const stats = {
      str: parseInt(formData.get('stat-str')) || 0,
      int: parseInt(formData.get('stat-int')) || 0,
      wis: parseInt(formData.get('stat-wis')) || 0,
      dex: parseInt(formData.get('stat-dex')) || 0,
      con: parseInt(formData.get('stat-con')) || 0,
      cha: parseInt(formData.get('stat-cha')) || 0
    };
    
    // Validate class selection
    if (!classId) {
      ui.notifications.error(game.i18n.localize('NOTIFY.SelectClass'));
      return;
    }
    
    // Check if any stats are 0 (not rolled)
    const hasZeroStats = Object.values(stats).some(s => s === 0);
    if (hasZeroStats) {
      const shouldRoll = await foundry.applications.api.DialogV2.confirm({
        window: { title: game.i18n.localize('DIALOG.ZeroStatsTitle') },
        content: `<p>${game.i18n.localize('DIALOG.ZeroStatsMessage')}</p>`,
        modal: true,
        buttons: [
          { action: 'yes', label: game.i18n.localize('DIALOG.Yes'), default: true },
          { action: 'no', label: game.i18n.localize('DIALOG.No') }
        ]
      });
      
      if (shouldRoll) {
        // Auto-roll missing stats
        const rollStat = () => {
          const dice = Array(4).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
          dice.sort((a, b) => b - a);
          return dice.slice(0, 3).reduce((a, b) => a + b, 0);
        };
        
        if (!stats.str) stats.str = rollStat();
        if (!stats.int) stats.int = rollStat();
        if (!stats.wis) stats.wis = rollStat();
        if (!stats.dex) stats.dex = rollStat();
        if (!stats.con) stats.con = rollStat();
        if (!stats.cha) stats.cha = rollStat();
        
        // Update form
        const statNames = ['str', 'int', 'wis', 'dex', 'con', 'cha'];
        statNames.forEach(stat => {
          const input = form.querySelector(`[name="stat-${stat}"]`);
          if (input) input.value = stats[stat];
        });
      } else {
        ui.notifications.warn(game.i18n.localize('NOTIFY.FillAllStats'));
        return;
      }
    }
    
    // Import and use PGGenerator
    const { PGGenerator } = await import('./pg-generator.mjs');
    const generator = new PGGenerator();
    
    const actor = await generator.generate({
      name,
      classId,
      level,
      alignment: alignment === '__RANDOM__' ? null : alignment,
      equipment,
      stats,
      isRetainer,
      folder: null,
      sex,
      height: height === '__RANDOM__' ? null : height,
      disposition
    });
    
    if (actor) {
      ui.notifications.info(game.i18n.format('NOTIFY.CharacterGenerated', { name: actor.name }));
      
      // Send summary to chat (GM only)
      await this.constructor._sendCharacterSummaryToChat(actor);
      
      await this.render();
    }
  }
  
  // Send character summary to chat (visible only to GM)
  static async _sendCharacterSummaryToChat(actor) {
    const useMetric = game.i18n.lang === 'it';

    // Get character data
    const className = actor.system?.details?.class?.name || actor.items.find(i => i.type === 'class')?.name || 'Sconosciuta';
    const level = actor.system?.details?.level || 1;
    // Get alignment (stored as full string in FaDe system) and translate
    const alignmentRaw = actor.system?.details?.alignment || actor.system?.alignment || '-';
    // Map both English (new) and Italian (legacy) alignment values to localized display
    const alignmentMap = {
      // English values (current)
      'Lawful': game.i18n.localize('ALIGNMENT.Lawful'),
      'Neutral': game.i18n.localize('ALIGNMENT.Neutral'),
      'Chaotic': game.i18n.localize('ALIGNMENT.Chaotic'),
      // Italian values (legacy characters)
      'Legale': game.i18n.localize('ALIGNMENT.Lawful'),
      'Neutrale': game.i18n.localize('ALIGNMENT.Neutral'),
      'Caotico': game.i18n.localize('ALIGNMENT.Chaotic')
    };
    const alignment = alignmentMap[alignmentRaw] || alignmentRaw;
    
    // Map sex to abbreviated form
    const sexMap = { 'Maschio': 'M', 'Femmina': 'F' };
    const sexFull = actor.system?.details?.sex || '-';
    const sex = sexMap[sexFull] || sexFull;
    
    // Get class icon based on class name
    const classIcons = {
      'guerriero': '⚔️', 'fighter': '⚔️',
      'mago': '🧙‍♂️', 'magic-user': '🧙‍♂️', 'wizard': '🧙‍♂️',
      'chierico': '⛪', 'cleric': '⛪',
      'ladro': '🗡️', 'thief': '🗡️', 'rogue': '🗡️',
      'paladino': '🛡️', 'paladin': '🛡️',
      'vendicatore': '⚡', 'avenger': '⚡',
      'druido': '🌿', 'druid': '🌿',
      'bardo': '🎵', 'bard': '🎵',
      'mistico': '👁️', 'mystic': '👁️', 'monk': '👁️',
      'elfo': '🏹', 'elf': '🏹',
      'nano': '⛏️', 'dwarf': '⛏️',
      'halfling': '🍃',
      'drago': '🐉', 'dragon': '🐉'
    };
    const classKey = className.toLowerCase();
    const classIcon = classIcons[classKey] || '👤';
    const height = actor.system?.details?.height || '-';
    const weight = actor.system?.details?.weight || '-';
    const movement = actor.system?.movement?.max || (useMetric ? 36 : 120);
    const hp = actor.system?.hp?.max || 0;
    const ac = actor.system?.ac?.value || 0;
    const thac0 = actor.system?.thac0?.value || 0;
    
    // Get stats - 3 letter abbreviations
    const stats = actor.system?.abilities || {};
    const statLabels = {
      str: game.i18n.localize('STATS.STR'),
      int: game.i18n.localize('STATS.INT'),
      wis: game.i18n.localize('STATS.WIS'),
      dex: game.i18n.localize('STATS.DEX'),
      con: game.i18n.localize('STATS.CON'),
      cha: game.i18n.localize('STATS.CHA')
    };
    const statOrder = ['str', 'int', 'dex', 'wis', 'con', 'cha'];
    const statRows = [];
    // First row: str, int, dex
    const firstRow = statOrder.slice(0, 3).map(key => {
      const val = stats[key];
      const score = val?.value || 0;
      const mod = val?.mod || 0;
      const modStr = mod >= 0 ? `+${mod}` : mod;
      return `<td style="padding: 3px 8px; text-align: left;">${statLabels[key]} <strong style="font-size: 1.3em;">${score}</strong> ${modStr}</td>`;
    }).join('');
    statRows.push(`<tr>${firstRow}</tr>`);
    // Second row: wis, con, cha
    const secondRow = statOrder.slice(3, 6).map(key => {
      const val = stats[key];
      const score = val?.value || 0;
      const mod = val?.mod || 0;
      const modStr = mod >= 0 ? `+${mod}` : mod;
      return `<td style="padding: 3px 8px; text-align: left;">${statLabels[key]} <strong style="font-size: 1.3em;">${score}</strong> ${modStr}</td>`;
    }).join('');
    statRows.push(`<tr>${secondRow}</tr>`);
    const statsTable = `<table style="width: 100%; background: transparent; border: none; font-size: 0.95em;"><tbody>${statRows.join('')}</tbody></table>`;
    
    // Get equipment summary
    const noneLabel = game.i18n.localize('CHAT.None');
    const weapons = actor.items.filter(i => i.type === 'weapon').map(i => i.name).join(', ') || noneLabel;
    const armors = actor.items.filter(i => i.type === 'armor').map(i => i.name).join(', ') || noneLabel;
    const otherItems = actor.items.filter(i => !['weapon', 'armor', 'class', 'ability'].includes(i.type)).length;
    
    // Build message content
    const unit = useMetric ? 'm' : 'ft';
    // Remove ' cm' from height display for cleaner look
    const heightDisplay = height ? height.replace(' cm', '') : '-';
    
    const content = `
<div class="character-summary" style="background: linear-gradient(rgba(30, 30, 30, 0.95), rgba(30, 30, 30, 0.95)), url('systems/fantastic-depths/assets/cover.webp'); background-size: cover; background-position: center; border: 2px solid #8b0000; border-radius: 8px; padding: 12px; margin: 8px 0;">
    <h2 style="color: #ff6b6b; margin: 0 0 10px 0; border-bottom: 1px solid #8b0000; padding-bottom: 5px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
    ${classIcon} ${actor.name}
  </h2>
  
  <div style="background: #1a1a1a; padding: 8px; border-radius: 4px; margin-bottom: 10px;">
    <strong style="color: #ffd700;">${game.i18n.localize('CHAT.AbilityScores')}:</strong><br>
    ${statsTable}
  </div>
  
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px;">
    <div><strong>${className}</strong></div>
    <div><strong>${alignment}</strong></div>
    <div><strong>${game.i18n.localize('CHAT.Level')}:</strong> ${level}</div>
  </div>
  
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px;">
    <div><strong>${game.i18n.localize('CHAT.Sex')}:</strong> ${sex}</div>
    <div><strong>${game.i18n.localize('CHAT.Height')}:</strong> ${heightDisplay}</div>
    <div><strong>${game.i18n.localize('CHAT.Weight')}:</strong> ${weight}</div>
  </div>
  
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; background: #1a1a1a; padding: 8px; border-radius: 4px;">
    <div><strong>${game.i18n.localize('PARTY.HP')}:</strong> ${hp}</div>
    <div><strong>${game.i18n.localize('PARTY.AC')}:</strong> ${ac}</div>
    <div><strong>THAC0:</strong> ${thac0}</div>
  </div>
  
  <div style="margin-bottom: 8px;">
    <strong>${game.i18n.localize('CHAT.Movement')}:</strong> ${movement}${unit}
  </div>
  
  <div style="font-size: 0.9em;">
    <div><strong>🗡️ ${game.i18n.localize('CHAT.Weapons')}:</strong> ${weapons}</div>
    <div><strong>🛡️ ${game.i18n.localize('CHAT.Armor')}:</strong> ${armors}</div>
  </div>
  
  <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #666; font-size: 0.8em; color: #999; text-align: center;">
    <div>${game.i18n.localize('CHAT.CreatedWith')}</div>
    <div>Mystara ${new Date().toLocaleString()}</div>
  </div>
</div>`;
    
    // Send whisper to GM
    await ChatMessage.create({
      content: content,
      whisper: [game.user.id],
      speaker: { alias: game.i18n.localize('CHAT.PCGenerator') }
    });
  }
  
  // ==========================================
  // Character Generator Actions
  // ==========================================
  
  static _onRollStats3d6(event) {
    const rollStat = () => Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    const stats = { str: rollStat(), int: rollStat(), wis: rollStat(), dex: rollStat(), con: rollStat(), cha: rollStat() };
    PGPXManagerApp._updateGenStats.call(this, stats);
    // Reset riserva to 0 on roll - user must manually lower stats to gain reserve points
    const form = this.element.querySelector('#pg-generator-form');
    const riservaInput = form?.querySelector('#riserva-points');
    if (riservaInput) riservaInput.value = 0;
    PGPXManagerApp._updateStatStyles.call(this);
  }
  
  static _onRollStats4d6(event) {
    const rollStat = () => {
      const dice = Array(4).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
      dice.sort((a, b) => b - a);
      return dice.slice(0, 3).reduce((a, b) => a + b, 0);
    };
    const stats = { str: rollStat(), int: rollStat(), wis: rollStat(), dex: rollStat(), con: rollStat(), cha: rollStat() };
    PGPXManagerApp._updateGenStats.call(this, stats);
    // Reset riserva to 0 on roll - user must manually lower stats to gain reserve points
    const form = this.element.querySelector('#pg-generator-form');
    const riservaInput = form?.querySelector('#riserva-points');
    if (riservaInput) riservaInput.value = 0;
    PGPXManagerApp._updateStatStyles.call(this);
  }
  
  static _onIncreaseStat(event) {
    const stat = event.target.dataset.stat;
    if (!stat) return;
    
    const form = this.element.querySelector('#pg-generator-form');
    const input = form?.querySelector(`#stat-${stat}`);
    const riservaInput = form?.querySelector('#riserva-points');
    if (!input || !riservaInput) return;
    
    const currentVal = parseInt(input.value) || 0;
    const riserva = parseInt(riservaInput.value) || 0;
    
    if (currentVal >= 18) return;
    
    // Official rule: 1 reserve point raises any stat by 1 point
    if (riserva < 1) return;
    
    input.value = currentVal + 1;
    riservaInput.value = riserva - 1;
    
    PGPXManagerApp._updateStatStyles.call(this);
  }
  
  static _onDecreaseStat(event) {
    const stat = event.target.dataset.stat;
    if (!stat) return;
    
    const form = this.element.querySelector('#pg-generator-form');
    const input = form?.querySelector(`#stat-${stat}`);
    const riservaInput = form?.querySelector('#riserva-points');
    if (!input || !riservaInput) return;
    
    const currentVal = parseInt(input.value) || 0;
    const riserva = parseInt(riservaInput.value) || 0;
    
    // Official rule: can only lower if stat > 10 (minimum result is 9)
    // Each decrease lowers by 2 points and gives 1 reserve point
    if (currentVal <= 10) return;
    
    // Calculate new value (lower by 2, but not below 9)
    const newVal = Math.max(9, currentVal - 2);
    const actualDecrease = currentVal - newVal;
    
    // Official rule: 1 reserve point for every 2 points lowered
    const gain = Math.floor(actualDecrease / 2);
    
    input.value = newVal;
    riservaInput.value = riserva + gain;
    
    PGPXManagerApp._updateStatStyles.call(this);
  }
  
  static _onResetRiserva(event) {
    const form = this.element.querySelector('#pg-generator-form');
    const riservaInput = form?.querySelector('#riserva-points');
    if (riservaInput) riservaInput.value = 0;
    
    // Reset all stats to rolled values
    Object.entries(this.genStats || {}).forEach(([stat, val]) => {
      const input = form?.querySelector(`#stat-${stat}`);
      if (input) input.value = val || '';
    });
    
    PGPXManagerApp._updateStatStyles.call(this);
  }
  
  static _onResetStats(event) {
    const form = this.element.querySelector('#pg-generator-form');
    const stats = ['str', 'int', 'wis', 'dex', 'con', 'cha'];
    stats.forEach(stat => {
      const input = form?.querySelector(`#stat-${stat}`);
      if (input) input.value = '';
    });
    
    const riservaInput = form?.querySelector('#riserva-points');
    if (riservaInput) riservaInput.value = 0;
    
    this.genStats = { str: 0, int: 0, wis: 0, dex: 0, con: 0, cha: 0 };
    PGPXManagerApp._updateStatStyles.call(this);
  }
  
  static async _onClassChange(event) {
    // Get the select element from the form directly
    const form = this.element.querySelector('#pg-generator-form');
    const classSelect = form?.querySelector('#char-class');
    
    if (!classSelect) {
      return;
    }
    
    // Use selectedIndex to get the actual selected value
    const selectedIndex = classSelect.selectedIndex;
    const selectedOption = classSelect.options[selectedIndex];
    
    if (!selectedOption) {
      return;
    }
    
    const classId = selectedOption.value;
    
    // Get class name from selected option text
    let className = null;
    if (classId && classId !== '__RANDOM__') {
      className = selectedOption.text?.toLowerCase()?.trim();
    }
    this.genCurrentClass = className;
    
    if (!classId || classId === '__RANDOM__') {
      PGPXManagerApp._updateStatStyles.call(this);
      return;
    }
    
    // Get class item from compendium to retrieve maxLevel
    let maxLevel = 36; // default
    let startLevel = 1; // default
    
    try {
      // Search for the class in compendiums
      for (const pack of game.packs) {
        if (pack.metadata?.type === 'Item' || pack.documentName === 'Item') {
          const classItem = await pack.getDocument(classId);
          if (classItem && classItem.type === 'class') {
            const classSystem = classItem.system || {};
            // Get maxLevel from class system data
            if (classSystem.maxLevel) {
              maxLevel = parseInt(classSystem.maxLevel) || 36;
            } else if (classSystem.levels && Array.isArray(classSystem.levels)) {
              maxLevel = classSystem.levels.length;
            }
            // Check for special classes that start at level 9
            const classNameLower = classItem.name?.toLowerCase() || '';
            if (/paladino|paladin|vendicatore|avenger|druido|druid/.test(classNameLower)) {
              startLevel = 9;
            }
            break;
          }
        }
      }
    } catch (err) {
      console.warn(`${MODULE_ID} | ⚠️ Could not retrieve class maxLevel:`, err);
    }
    
    // Update level dropdown with correct maxLevel
    const levelSelect = form?.querySelector('#char-level-select');
    if (levelSelect) {
      const currentValue = levelSelect.value;
      
      // Rebuild level options
      let html = '<option value="__RANDOM__"' + (currentValue === '__RANDOM__' ? ' selected' : '') + '>' + game.i18n.localize('GENERATOR.Random') + '</option>';
      
      for (let i = startLevel; i <= maxLevel; i++) {
        html += `<option value="${i}"${currentValue == i ? ' selected' : ''}>${i}</option>`;
      }
      levelSelect.innerHTML = html;
    }
    
    // Update height dropdown based on class race
    const heightSelect = form?.querySelector('#char-height');
    if (heightSelect && this.genCurrentClass) {
      const normalizedClass = this.genCurrentClass.toLowerCase();
      let raceGroup = 'height-human'; // default
      
      if (/nano|dwarf/.test(normalizedClass)) {
        raceGroup = 'height-dwarf';
      } else if (/elfo|elf/.test(normalizedClass)) {
        raceGroup = 'height-elf';
      } else if (/halfling/.test(normalizedClass)) {
        raceGroup = 'height-halfling';
      }
      
      // Show only options for the selected race, hide others
      const allOptions = heightSelect.querySelectorAll('option');
      const allOptgroups = heightSelect.querySelectorAll('optgroup');
      
      allOptions.forEach(opt => {
        if (opt.value === '__RANDOM__') {
          opt.style.display = '';
        } else {
          const optgroup = opt.parentElement;
          if (optgroup && optgroup.classList.contains(raceGroup)) {
            opt.style.display = '';
          } else {
            opt.style.display = 'none';
          }
        }
      });
      
      allOptgroups.forEach(og => {
        if (og.classList.contains(raceGroup)) {
          og.style.display = '';
        } else {
          og.style.display = 'none';
        }
      });
      
      // Reset to random if current selection is not valid for new race
      const currentHeight = heightSelect.value;
      if (currentHeight !== '__RANDOM__') {
        const selectedOpt = heightSelect.querySelector(`option[value="${currentHeight}"]`);
        if (selectedOpt && selectedOpt.style.display === 'none') {
          heightSelect.value = '__RANDOM__';
        }
      }
      
      // Update display text for metric system
      this._updateHeightDropdownForMetric();
    }
    
    // Update styles only - riserva should only change when user manually lowers stats
    PGPXManagerApp._updateStatStyles.call(this);
    
    // Auto-set alignment based on class restrictions
    const alignmentSelect = form?.querySelector('#char-alignment');
    if (alignmentSelect && className) {
      const normalizedClass = className.toLowerCase();
      
      // Remove any special options that might have been added previously (e.g., Mystic's 75% option)
      const specialOption = alignmentSelect.querySelector('option[value="__RANDOM_MISTIC__"]');
      if (specialOption) {
        specialOption.remove();
      }
      
      // Paladino and Chierico are always Lawful
      if (normalizedClass.includes('paladino') || normalizedClass.includes('paladin') ||
          normalizedClass.includes('chierico') || normalizedClass.includes('cleric')) {
        alignmentSelect.value = 'Lawful';
      }
      // Vendicatore is always Chaotic
      else if (normalizedClass.includes('vendicatore') || normalizedClass.includes('avenger')) {
        alignmentSelect.value = 'Chaotic';
      }
      // Mistico/Monk is 75% Lawful (random) - add special option
      else if (normalizedClass.includes('mistico') || normalizedClass.includes('mystic')) {
        const option = document.createElement('option');
        option.value = '__RANDOM_MISTIC__';
        option.text = `🎲 75% ${game.i18n.localize('ALIGNMENT.Lawful')}`;
        option.selected = true;
        alignmentSelect.appendChild(option);
        alignmentSelect.value = '__RANDOM_MISTIC__';
      }
      // No alignment restrictions - reset to random if it was a restricted value
      else {
        const currentAlignment = alignmentSelect.value;
        // If current alignment is a fixed value (Lawful/Chaotic) or the Mystic special option, reset to random
        if (currentAlignment === 'Lawful' || currentAlignment === 'Chaotic' || currentAlignment === '__RANDOM_MISTIC__') {
          alignmentSelect.value = '__RANDOM__';
        }
      }
    }
    
    // Auto-select "Kit Classe" equipment option when class is selected
    const equipmentSelect = form?.querySelector('#char-equipment');
    if (equipmentSelect && classId && classId !== '__RANDOM__') {
      equipmentSelect.value = '__CLASS_KIT__';
    }
  }
  
  // Helper methods for generator
  
  // Convert height from feet'inches" format to centimeters
  static _convertHeightToCm(heightStr) {
    if (!heightStr || typeof heightStr !== 'string') return heightStr;
    
    // Match pattern like "5'10" or "4'6" or "3'8" (with or without trailing quote)
    const match = heightStr.match(/(\d+)'(\d+)/);
    if (!match) return heightStr;
    
    const feet = parseInt(match[1], 10);
    const inches = parseInt(match[2], 10);
    
    // Convert to cm: 1 foot = 30.48 cm, 1 inch = 2.54 cm
    const totalCm = Math.round((feet * 30.48) + (inches * 2.54));
    
    return `${totalCm} cm`;
  }
  
  // Instance method wrapper for the static converter
  _convertHeightToCm(heightStr) {
    return this.constructor._convertHeightToCm(heightStr);
  }
  
  // Update height dropdown display text based on metric setting
  _updateHeightDropdownForMetric() {
    const heightSelect = this.element.querySelector('#char-height');
    if (!heightSelect) return;

    const useMetric = game.i18n.lang === 'it';
    const allOptions = heightSelect.querySelectorAll('option');
    
    allOptions.forEach((opt) => {
      if (opt.value === '__RANDOM__') return; // Skip random option
      
      // Get the imperial value from the value attribute (format: "5'10"|human")
      const valueParts = opt.value.split('|');
      const imperialValue = valueParts[0];
      
      if (useMetric) {
        // Convert to cm for display
        const cmValue = this._convertHeightToCm(imperialValue);
        opt.text = cmValue;
      } else {
        // Restore imperial display
        opt.text = imperialValue;
      }
    });
  }
  
  static _updateGenStats(stats) {
    this.genStats = { ...stats };
    const form = this.element.querySelector('#pg-generator-form');
    if (!form) return;
    
    Object.entries(stats).forEach(([stat, val]) => {
      const input = form.querySelector(`#stat-${stat}`);
      if (input && val > 0) input.value = val;
    });
  }
  
  static _updateRiservaFromStats(stats) {
    // Calculate riserva based on prime requisites
    const form = this.element.querySelector('#pg-generator-form');
    const classSelect = form?.querySelector('#char-class');
    const classId = classSelect?.value;
    
    if (!classId || classId === '__RANDOM__') {
      const riservaInput = form?.querySelector('#riserva-points');
      if (riservaInput) riservaInput.value = 0;
      // Still update buttons even without a class
      PGPXManagerApp._updateStatButtonStates.call(this, 0, null);
      return;
    }
    
    // Get class name from stored value (set in _onClassChange)
    let className = this.genCurrentClass;
    
    // If not stored, try to get it from the selected option text
    if (!className && classSelect) {
      const selectedOption = classSelect.options[classSelect.selectedIndex];
      if (selectedOption) {
        className = selectedOption.text?.toLowerCase();
      }
    }
    
    // If still not found, try game.items (for world classes)
    if (!className) {
      const classItem = game.items.get(classId);
      className = classItem?.name?.toLowerCase();
    }
    
    // If still not found, use empty requirements (basic functionality)
    let req = null;
    if (className) {
      const requirements = PGPXManagerApp._getClassRequirementsData();
      req = requirements[className];
    }
    
    let riserva = 0;
    
    // Calculate points from lowering non-prime-req stats
    // Official rule: for every 2 points lowered, you get 1 reserve point (2:1 ratio)
    if (req?.lowerable) {
      for (const stat of req.lowerable) {
        const statValue = stats[stat] || 0;
        if (statValue > 9) {
          const pointsLowered = statValue - 9;
          riserva += Math.floor(pointsLowered / 2); // 1 reserve point per 2 lowered
        }
      }
    }
    
    const riservaInput = form?.querySelector('#riserva-points');
    if (riservaInput) riservaInput.value = riserva;
    
    // Update button states
    PGPXManagerApp._updateStatButtonStates.call(this, riserva, req);
  }
  
  static _updateStatButtonStates(riserva, req) {
    const form = this.element.querySelector('#pg-generator-form');
    if (!form) return;
    
    const stats = ['str', 'int', 'wis', 'dex', 'con', 'cha'];
    // CON and CHA can NEVER be lowered or raised via exchange (official rules)
    const unlowerableStats = ['con', 'cha'];
    // Classes that can raise DEX (must have DEX as prime requisite)
    // Bardo, Ladro, Halfling, Mistico have DEX as prime requisite
    const dexRaisingClasses = ['bardo', 'ladro', 'thief', 'halfling', 'mistico', 'mystic'];
    
    stats.forEach(stat => {
      const plusBtn = form.querySelector(`.gen-stat-plus[data-stat="${stat}"]`);
      const minusBtn = form.querySelector(`.gen-stat-minus[data-stat="${stat}"]`);
      const input = form.querySelector(`#stat-${stat}`);
      if (!plusBtn || !minusBtn || !input) return;
      
      const val = parseInt(input.value) || 0;
      
      // CON and CHA can never be lowered or raised (official rules)
      if (unlowerableStats.includes(stat)) {
        plusBtn.disabled = true; // Never allow raising CON/CHA
        minusBtn.disabled = true; // Never allow lowering CON/CHA
        return;
      }
      
      // DEX special rule: cannot be lowered, can only be raised for specific classes
      if (stat === 'dex') {
        minusBtn.disabled = true; // DEX can never be lowered
        // DEX can only be raised for Bardo, Ladro, Halfling, Mistico
        const canRaiseDex = req?.primeReq?.includes('dex') && 
                            dexRaisingClasses.some(c => this.genCurrentClass?.includes(c));
        if (canRaiseDex) {
          plusBtn.disabled = val >= 18 || riserva < 1; // Cost 1 reserve point per 1 DEX increase
        } else {
          plusBtn.disabled = true; // Cannot raise DEX for other classes
        }
        return;
      }
      
      if (req) {
        const isPrimeReq = req.primeReq?.includes(stat);
        const isLowerable = req.lowerable?.includes(stat);
        
        // Official RC rule: reserve points can ONLY raise prime requisite stats
        // 1 reserve point raises prime requisite by 1 point
        plusBtn.disabled = val >= 18 || riserva < 1 || !isPrimeReq;
        // Enable minus only if stat > 10 AND is in lowerable list for this class
        // (minus lowers by 2 points, so minimum result is 9, and you can't lower if already at 10 or less)
        minusBtn.disabled = val <= 10 || !isLowerable;
      } else {
        // Basic functionality when no requirements - only allow lowering to 9
        plusBtn.disabled = val >= 18 || riserva < 1;
        minusBtn.disabled = val <= 9; // Can lower to 9 but not below
      }
    });
  }
  
  static _updateStatStyles() {
    const form = this.element.querySelector('#pg-generator-form');
    if (!form) return;
    
    const classSelect = form.querySelector('#char-class');
    const classId = classSelect?.value;
    
    if (!classId || classId === '__RANDOM__') {
      // Clear all styles
      const allLabels = form.querySelectorAll('.gen-stat-label');
      const allInputs = form.querySelectorAll('.gen-stat-input');
      allLabels.forEach(l => l.classList.remove('prime-req-label'));
      allInputs.forEach(i => i.classList.remove('prime-req', 'min-met'));
      return;
    }
    
    // Get class name directly from selected option by value - most reliable method
    let className = null;
    if (classSelect && classId) {
      const selectedOption = Array.from(classSelect.options).find(opt => opt.value === classId);
      if (selectedOption) {
        className = selectedOption.text?.toLowerCase()?.trim();
      }
    }
    
    // Fallback to stored value if available
    if (!className && this.genCurrentClass) {
      className = this.genCurrentClass;
    }
    
    // Last resort: try game.items (for world classes)
    if (!className) {
      const classItem = game.items.get(classId);
      className = classItem?.name?.toLowerCase()?.trim();
    }
    
    if (!className) return;
    
    const requirements = PGPXManagerApp._getClassRequirementsData();
    // Try exact match first, then partial match
    let req = requirements[className];
    if (!req) {
      // Try matching by partial name (e.g., "guerriero" matches "guerriero (variant)")
      const matchingKey = Object.keys(requirements).find(k => className.includes(k) || k.includes(className));
      if (matchingKey) req = requirements[matchingKey];
    }
    
    const stats = ['str', 'int', 'wis', 'dex', 'con', 'cha'];
    const riservaInput = form.querySelector('#riserva-points');
    const riserva = parseInt(riservaInput?.value) || 0;
    
    stats.forEach(stat => {
      const label = form.querySelector(`#stat-label-${stat}`);
      const input = form.querySelector(`#stat-${stat}`);
      const plusBtn = form.querySelector(`.gen-stat-plus[data-stat="${stat}"]`);
      const minusBtn = form.querySelector(`.gen-stat-minus[data-stat="${stat}"]`);
      const modEl = form.querySelector(`#stat-mod-${stat}`);
      if (!label || !input) return;
      
      const val = parseInt(input.value) || 0;
      
      // Update ability modifier display
      if (modEl && val > 0) {
        const mod = PGPXManagerApp._getAbilityMod(val);
        modEl.textContent = mod >= 0 ? `+${mod}` : `${mod}`;
      } else if (modEl) {
        modEl.textContent = '';
      }
      
      // Default: clear all color styles
      label.classList.remove('prime-req-label');
      input.classList.remove('prime-req-low', 'prime-req-met');
      
      // CON and CHA can never be lowered or raised (official rules)
      if (stat === 'con' || stat === 'cha') {
        if (plusBtn && minusBtn) {
          plusBtn.disabled = true; // Never allow raising CON/CHA
          minusBtn.disabled = true; // Never allow lowering CON/CHA
        }
        return;
      }
      
      // DEX special rule: cannot be lowered, can only be raised for specific classes
      if (stat === 'dex') {
        if (plusBtn && minusBtn) {
          minusBtn.disabled = true; // DEX can never be lowered
          // DEX can only be raised for Bardo, Ladro, Halfling, Mistico
          const dexRaisingClasses = ['bardo', 'ladro', 'thief', 'halfling', 'mistico', 'mystic'];
          const canRaiseDex = req?.primeReq?.includes('dex') && 
                              dexRaisingClasses.some(c => this.genCurrentClass?.includes(c));
          if (canRaiseDex) {
            plusBtn.disabled = val >= 18 || riserva < 1; // Cost 1 reserve point per 1 DEX increase
          } else {
            plusBtn.disabled = true;
          }
        }
        // Still apply color styles for prime requisites
        if (req?.primeReq?.includes('dex')) {
          label.classList.add('prime-req-label');
          const minDex = req.min?.dex || 9;
          if (val >= minDex) {
            input.classList.add('prime-req-met'); // Green - meets minimum
          } else {
            input.classList.add('prime-req-low'); // Yellow - below minimum
          }
        }
        return;
      }
      
      if (req) {
        const minVal = req.min?.[stat] || 9; // Default minimum is 9 for prime requisites
        const isPrimeReq = req.primeReq?.includes(stat);
        const isLowerable = req.lowerable?.includes(stat);
        
        // Only apply colors to prime requisites
        if (isPrimeReq) {
          // Blue label for prime requisite
          label.classList.add('prime-req-label');
          
          // Apply color based on whether minimum is met
          if (val >= minVal) {
            input.classList.add('prime-req-met'); // Green - meets minimum
          } else {
            input.classList.add('prime-req-low'); // Yellow - below minimum
          }
        }
        // Non-prime stats: white (no classes added)
        
        // Update button states with class-specific logic
        if (plusBtn && minusBtn) {
          // Official RC rule: reserve points can ONLY raise prime requisite stats
          // 1 reserve point raises prime requisite by 1 point
          plusBtn.disabled = val >= 18 || riserva < 1 || !isPrimeReq;
          // Enable minus only if stat > 10 and is lowerable for this class
          // (lowers by 2 points, gives 1 reserve point, min result is 9)
          minusBtn.disabled = val <= 10 || !isLowerable;
        }
      } else {
        // No requirements found - enable basic +/- functionality
        if (plusBtn && minusBtn) {
          plusBtn.disabled = val >= 18 || riserva < 1;
          minusBtn.disabled = val <= 10; // Can lower by 2 if stat > 10 (min result is 9)
        }
      }
    });
  }
  
  static _getClassRequirementsData() {
    return {
      'bardo': { primeReq: ['int', 'dex'], min: { dex: 12 }, lowerable: ['str', 'int', 'wis'] },
      'chierico': { primeReq: ['wis'], min: { wis: 9 }, lowerable: ['str', 'int'] },
      'cleric': { primeReq: ['wis'], min: { wis: 9 }, lowerable: ['str', 'int'] },
      'druido': { primeReq: ['wis'], min: { wis: 12 }, lowerable: ['str', 'int'] },
      'elfo': { primeReq: ['str', 'int'], min: { str: 9, int: 9 }, lowerable: ['str', 'int', 'wis'] },
      'elf': { primeReq: ['str', 'int'], min: { str: 9, int: 9 }, lowerable: ['str', 'int', 'wis'] },
      'guerriero': { primeReq: ['str'], min: { str: 9 }, lowerable: ['str', 'int', 'wis'] },
      'fighter': { primeReq: ['str'], min: { str: 9 }, lowerable: ['str', 'int', 'wis'] },
      'halfling': { primeReq: ['str', 'dex'], min: { str: 9, dex: 9 }, lowerable: ['str', 'int', 'wis'] },
      'ladro': { primeReq: ['dex'], min: { dex: 9 }, lowerable: ['str', 'int', 'wis'] },
      'thief': { primeReq: ['dex'], min: { dex: 9 }, lowerable: ['str', 'int', 'wis'] },
      'mago': { primeReq: ['int'], min: { int: 9 }, lowerable: ['str', 'wis'] },
      'mystic': { primeReq: ['str', 'dex'], min: { str: 9, dex: 9 }, lowerable: ['str', 'dex', 'int', 'wis'] },
      'mistico': { primeReq: ['str', 'dex'], min: { str: 9, dex: 9 }, lowerable: ['str', 'dex', 'int', 'wis'] },
      'nano': { primeReq: ['str'], min: { str: 9 }, lowerable: ['str', 'int', 'wis'] },
      'dwarf': { primeReq: ['str'], min: { str: 9 }, lowerable: ['str', 'int', 'wis'] },
      'paladino': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] },
      'paladino (c)': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] },
      'paladin': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] },
      'paladin (c)': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] },
      'vendicatore': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] },
      'vendicatore (c)': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] },
      'avenger': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] },
      'avenger (c)': { primeReq: ['str', 'wis'], min: { str: 9, wis: 13 }, lowerable: ['str', 'int'] }
    };
  }
  
  // Calculate ability modifier based on score
  static _getAbilityMod(score) {
    const s = Number(score) || 0;
    if (s <= 3) return -3;
    if (s <= 5) return -2;
    if (s <= 8) return -1;
    if (s <= 12) return 0;
    if (s <= 15) return +1;
    if (s <= 17) return +2;
    return +3;
  }
}

// ==========================================
// Roll Table Dialog - Custom dialog for rolling tables
// ==========================================

class RollTableDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: 'rolltable-dialog',
    classes: ['rolltable-dialog', 'fade-app', 'dialog'],
    tag: 'form',
    window: {
      title: 'ROLLTABLE.Title',
      resizable: false,
      minimizable: false
    },
    position: {
      width: 280,
      height: 'auto'
    },
    actions: {
      rollTable: RollTableDialog._onRollTable
    }
  };

  static PARTS = {
    content: {
      template: 'modules/fantastic-depths-dm-screen/templates/rolltable-dialog.html'
    },
    footer: {
      template: 'templates/generic/form-footer.hbs'
    }
  };

  constructor(options = {}) {
    super(options);
    this.tables = [];
    this.selectedTable = null;
    this.categories = [];
    this.selectedCategory = null;
  }

  async _prepareContext(options) {
    // Load tables from fade-compendiums.roll-table-compendium
    if (this.tables.length === 0) {
      const pack = game.packs.get('fade-compendiums.roll-table-compendium');
      if (pack) {
        // Get folders (categories) from the compendium
        const folders = pack.folders ? Array.from(pack.folders.values()) : [];
        
        // Helper to extract short ID from UUID if needed
        const extractId = (uuidOrId) => {
          if (!uuidOrId) return null;
          // If it contains dots, it's a full UUID, extract last part
          if (uuidOrId.includes('.')) {
            const parts = uuidOrId.split('.');
            return parts[parts.length - 1];
          }
          return uuidOrId;
        };
        
        this.categories = folders
          .filter(folder => !folder.folder) // Only top-level folders
          .map(folder => ({
            id: extractId(folder.id),
            name: folder.name
          }))
          .sort((a, b) => a.name.localeCompare(b.name, game.i18n.lang));

        // Build parent-child relationships
        const childrenMap = new Map(); // folderId -> [childFolderIds]
        
        for (const folder of folders) {
          const parentId = folder.folder?.id || null;
          if (parentId) {
            const shortParentId = extractId(parentId);
            const shortFolderId = extractId(folder.id);
            if (!childrenMap.has(shortParentId)) {
              childrenMap.set(shortParentId, []);
            }
            childrenMap.get(shortParentId).push(shortFolderId);
          }
        }

        // Get all tables
        const documents = await pack.getDocuments();
        this.tables = documents
          .map(doc => ({
            uuid: doc.uuid,
            name: doc.name,
            description: doc.description || '',
            formula: doc.formula || '1d20',
            folderId: extractId(doc.folder?.id) || null
          }))
          .sort((a, b) => a.name.localeCompare(b.name, game.i18n.lang));

        // Store maps for filtering
        this.childrenMap = childrenMap;
      }
    }

    // Get all descendant folder IDs for the selected category
    const getDescendantIds = (categoryId) => {
      const result = new Set([categoryId]);
      const children = this.childrenMap?.get(categoryId) || [];
      for (const childId of children) {
        const descendants = getDescendantIds(childId);
        descendants.forEach(id => result.add(id));
      }
      return result;
    };

    // Filter tables based on selected category (include all tables in sub-folders)
    const filteredTables = this.selectedCategory
      ? this.tables.filter(t => {
          const validFolderIds = getDescendantIds(this.selectedCategory);
          return validFolderIds.has(t.folderId);
        })
      : [];

    return {
      categories: this.categories,
      selectedCategory: this.selectedCategory,
      filteredTables: filteredTables,
      selectedTable: this.selectedTable,
      buttons: [
        { type: 'button', action: 'rollTable', label: game.i18n.localize('ROLLTABLE.Roll'), icon: 'fas fa-dice' }
      ]
    };
  }

  _onRender(context, options) {
    super._onRender(context, options);

    // Category select listener - load tables automatically
    const categorySelect = this.element.querySelector('#rolltable-category');
    if (categorySelect) {
      categorySelect.addEventListener('change', (event) => {
        const categoryId = event.target.value;
        this.selectedCategory = categoryId || null;
        this.selectedTable = null; // Reset table selection
        this.render();
      });
    }

    // Table select listener
    const tableSelect = this.element.querySelector('#rolltable-select');
    if (tableSelect) {
      tableSelect.addEventListener('change', (event) => {
        const uuid = event.target.value;
        if (uuid) {
          this.selectedTable = this.tables.find(t => t.uuid === uuid) || null;
          this.render();
        } else {
          this.selectedTable = null;
        }
      });
    }
  }
  
  close(options = {}) {
    return super.close(options);
  }

  static async _onRollTable(event, target) {
    event.preventDefault();
    
    const tableSelect = this.element.querySelector('#rolltable-select');
    const rollModeSelect = this.element.querySelector('#rolltable-mode');
    
    const tableUuid = tableSelect?.value;
    const rollMode = rollModeSelect?.value || 'publicroll';
    
    if (!tableUuid) {
      ui.notifications.warn(game.i18n.localize('ROLLTABLE.NoTableSelected'));
      return;
    }

    try {
      // Get the table document
      const table = await fromUuid(tableUuid);
      if (!table) {
        ui.notifications.error(game.i18n.localize('ROLLTABLE.RollTableError'));
        return;
      }

      // Map our mode values to Foundry's ChatMessage roll modes
      const gmIds = game.users.filter(u => u.isGM).map(u => u.id);

      if (rollMode === 'publicroll') {
        // Public: use native draw with explicit public roll mode
        await table.draw({ rollMode: 'publicroll', displayChat: true });
      } else {
        // For private modes, roll manually and create whispered message
        const rollResult = await table.roll();
        const results = rollResult.results;

        const messageData = {
          speaker: ChatMessage.getSpeaker({ alias: 'GM' })
        };

        if (rollMode === 'gmroll') {
          messageData.whisper = gmIds;
        } else if (rollMode === 'blindroll') {
          messageData.whisper = gmIds;
          messageData.blind = true;
        } else if (rollMode === 'selfroll') {
          messageData.whisper = [game.user.id];
        }

        await table.toMessage(results, messageData);
      }

      this.close();
    } catch (err) {
      console.error(`${MODULE_ID} | Error rolling table:`, err);
      ui.notifications.error(game.i18n.localize('ROLLTABLE.RollTableError'));
    }
  }

  static async show() {
    const dialog = new RollTableDialog();
    await dialog.render(true);
    return dialog;
  }
}

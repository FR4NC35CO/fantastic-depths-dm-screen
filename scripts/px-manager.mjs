// ==========================================
// PX Manager - XP Management Logic - Gestore PX - Logica Gestione PX
// ==========================================

const MODULE_ID = 'fantastic-depths-dm-screen';

export class PXManager {
  
  constructor(actors) {
    this.actors = actors;
    this.pendingXP = this._loadPendingXP();
  }
  
  // ==========================================
  // XP Storage Management - Gestione Memorizzazione PX
  // ==========================================
  
  _loadPendingXP() {
    return game.settings.get(MODULE_ID, 'pendingXP') || {};
  }
  
  async _savePendingXP(data) {
    await game.settings.set(MODULE_ID, 'pendingXP', data);
    this.pendingXP = data;
  }
  
  getPendingXP(actorId) {
    return this.pendingXP[actorId] || 0;
  }
  
  async setPendingXP(actorId, value) {
    const data = { ...this.pendingXP };
    data[actorId] = value;
    await this._savePendingXP(data);
  }
  
  async addPendingXP(actorId, amount) {
    const current = this.getPendingXP(actorId);
    await this.setPendingXP(actorId, current + amount);
  }
  
  async clearPendingXP(actorId) {
    const data = { ...this.pendingXP };
    delete data[actorId];
    await this._savePendingXP(data);
  }
  
  async clearAllPendingXP() {
    await this._savePendingXP({});
  }
  
  // ==========================================
  // XP Calculation - Calcolo PX
  // ==========================================
  
  calculateEqualShares(totalXP, actors) {
    const count = actors.length;
    if (count === 0) return [];
    
    const baseShare = Math.floor(totalXP / count);
    const remainder = totalXP - (baseShare * count);
    
    return actors.map((actor, index) => ({
      ...actor,
      xpShare: baseShare + (index < remainder ? 1 : 0),
      xpBonus: 0,
      xpTotal: baseShare + (index < remainder ? 1 : 0)
    }));
  }
  
  calculateLevelShares(totalXP, actors) {
    const totalLevel = actors.reduce((sum, a) => sum + (a.level || 1), 0);
    if (totalLevel === 0) return [];
    
    return actors.map(actor => {
      const level = actor.level || 1;
      const xpShare = Math.floor((totalXP * level) / totalLevel);
      return {
        ...actor,
        xpShare,
        xpBonus: 0,
        xpTotal: xpShare
      };
    });
  }
  
  calculateCustomShares(awards) {
    return awards.map(award => {
      const actor = this.actors.find(a => a.id === award.actorId);
      return {
        ...actor,
        xpShare: award.xp || 0,
        xpBonus: 0,
        xpTotal: award.xp || 0
      };
    });
  }
  
  // ==========================================
  // XP Awarding - Assegnazione PX
  // ==========================================
  
  async storeXPAsPending(distribution) {
    let storedCount = 0;
    
    for (const entry of distribution) {
      if (entry.xpTotal > 0) {
        await this.addPendingXP(entry.id, entry.xpTotal);
        storedCount++;
      }
    }
    
    return storedCount;
  }
  
  async awardXPNow(distribution) {
    let awardedCount = 0;
    let totalAwarded = 0;
    
    for (const entry of distribution) {
      if (entry.xpTotal <= 0) continue;
      
      const actor = game.actors.get(entry.id);
      if (!actor) continue;
      
      const currentXP = parseInt(actor.system?.details?.xp?.value) || 0;
      const newXP = currentXP + entry.xpTotal;
      
      try {
        await actor.update({ 'system.details.xp.value': newXP });
        awardedCount++;
        totalAwarded += entry.xpTotal;
        
        // Notify owner - Notifica proprietario
        if (actor.hasPlayerOwner) {
          const owner = game.users.find(u => u.character?.id === entry.id);
          if (owner && owner.active) {
            this._notifyOwner(owner, entry.name, entry.xpTotal);
          }
        }
      } catch (err) {
        console.error(`${MODULE_ID} | Error awarding XP to ${entry.name}:`, err);
      }
    }
    
    return { awardedCount, totalAwarded };
  }
  
  async awardPendingXP(actorIds) {
    const results = {
      awarded: [],
      skipped: []
    };
    
    for (const actorId of actorIds) {
      const pending = this.getPendingXP(actorId);
      if (pending <= 0) {
        results.skipped.push(actorId);
        continue;
      }
      
      const actor = game.actors.get(actorId);
      if (!actor) {
        results.skipped.push(actorId);
        continue;
      }
      
      // Check for missing class - Controlla classe mancante
      const className = actor.system?.details?.class || actor.system?.details?.className || '';
      if (!className || className.trim() === '') {
        ui.notifications.warn(`Attenzione! ${actor.name} non ha una classe assegnata.`);
        results.skipped.push(actorId);
        continue;
      }
      
      const currentXP = parseInt(actor.system?.details?.xp?.value) || 0;
      const newXP = currentXP + pending;
      
      try {
        await actor.update({ 'system.details.xp.value': newXP });
        await this.clearPendingXP(actorId);
        results.awarded.push({ actorId, name: actor.name, xp: pending });
      } catch (err) {
        console.error(`${MODULE_ID} | Error awarding pending XP to ${actor.name}:`, err);
        results.skipped.push(actorId);
      }
    }
    
    return results;
  }
  
  _notifyOwner(user, characterName, xpAmount) {
    // Send notification to player - Invia notifica al giocatore
    const message = {
      type: 'xp-awarded',
      character: characterName,
      xp: xpAmount
    };
    
    // Use Foundry's socket for notifications if available - Usa socket Foundry per notifiche se disponibile
    if (game.socket) {
      game.socket.emit(`module.${MODULE_ID}`, {
        userId: user.id,
        ...message
      });
    }
  }
  
  // ==========================================
  // Validation - Validazione
  // ==========================================
  
  validateActorsHaveClasses(actors) {
    const missing = actors.filter(a => {
      const className = a.class || '';
      return !className || className.trim() === '' || className === '-';
    });
    
    return {
      valid: missing.length === 0,
      missing
    };
  }
  
  // ==========================================
  // Statistics - Statistiche
  // ==========================================
  
  getPartyStats() {
    const liveActors = this.actors.filter(a => !a.isDead);
    const deadActors = this.actors.filter(a => a.isDead);
    const followers = this.actors.filter(a => a.isFollower);
    const characters = this.actors.filter(a => !a.isFollower);
    
    return {
      ltp: liveActors.reduce((sum, a) => sum + (a.level || 0), 0),
      characters: {
        total: characters.length,
        alive: characters.filter(a => !a.isDead).length,
        dead: characters.filter(a => a.isDead).length
      },
      followers: {
        total: followers.length,
        alive: followers.filter(a => !a.isDead).length,
        dead: followers.filter(a => a.isDead).length
      },
      pendingXP: this.actors.reduce((sum, a) => sum + this.getPendingXP(a.id), 0),
      averageLevel: liveActors.length > 0 
        ? (liveActors.reduce((sum, a) => sum + a.level, 0) / liveActors.length).toFixed(1)
        : 0
    };
  }
}

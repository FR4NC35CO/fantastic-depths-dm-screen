// === ACROBATICS CHECK by FR4NC35C0 for Fantastic Depths - SINGLE MESSAGE + 3D DICE ===

/**
 * Execute an acrobatics check for the selected token or user's character
 * Rolls 1d100 against a target of (3 * DEX + 2 * Level)
 */
export async function executeAcrobaticsCheck() {
  const actor = canvas.tokens.controlled[0]?.actor ?? game.user.character;
  if (!actor) {
    return ui.notifications.warn(game.i18n.localize('ACROBATICS.SelectToken'));
  }

  // Check if character is a Mystic (Acrobatics is a Mystic ability)
  const className = actor.system?.details?.class ?? '';
  const isMystic = /mystic|mistico/i.test(className);
  if (!isMystic) {
    return ui.notifications.warn(game.i18n.localize('ACROBATICS.MysticOnly'));
  }

  // Retrieve Dex and Level - optimized for Fantastic Depths
  const dex = Number(
    actor.system.abilities?.dex?.value ??
    actor.system.attributes?.dex?.value ??
    actor.system.abilities?.dex ??
    10
  );

  let lvl = Number(
    actor.system.class?.level ?? 
    actor.system.details?.level?.value ??
    actor.system.level?.value ??
    actor.system.details?.level ??
    actor.system.details?.lvl ??
    actor.system.class?.levels ??
    actor.system.details?.classLevel ??
    actor.system.details?.experience?.level ?? 
    1 // fallback to 1
  );

  const target = 3 * dex + 2 * lvl;

  // Create the Roll
  const roll = new Roll("1d100");
  await roll.evaluate();
  const rollTotal = roll.total;
  const isSuccess = rollTotal < target;
  const successText = isSuccess ? game.i18n.localize('ACROBATICS.Success') : game.i18n.localize('ACROBATICS.Failure');
  const color = isSuccess ? "#00ff00" : "#ff4444";

  // Content formatting
  const messageContent = `
<strong>${game.i18n.localize('ACROBATICS.Result')} d100 = ${rollTotal}</strong><br>
<em>${game.i18n.localize('ACROBATICS.Calc')}: ([3 * DEX] + [2 × Lvl]) = ${3*dex} + ${2*lvl} = ${target}</em>
<h2 style="color: ${color}; text-align: center; font-weight: bold;">
    ${successText}
</h2>
`;

  // Send message to Chat (Dice So Nice animation is handled automatically by toMessage)
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: game.i18n.localize('ACROBATICS.Flavor'),
    content: messageContent,
    rollMode: game.settings.get("core", "messageMode")
  });

  console.log(`${actor.name} | d100: ${rollTotal} | Obiettivo: ${target} | ${isSuccess ? "Successo" : "Fallimento"}`);
}

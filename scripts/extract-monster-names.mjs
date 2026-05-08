/**
 * extract-monster-names.mjs
 * Foundry VTT macro — paste in console or run as a Script macro.
 *
 * Step 1: Inspect a single actor to find which field holds the English name
 *         (the subtitle shown in the Bestiary sidebar).
 * Step 2: Extract the full IT→EN name mapping from the compendium.
 *
 * Run STEP_1 first to confirm the EN field, then STEP_2 for the full table.
 */

// ─── Extract full EN→IT name table from fade-compendiums.actor-compendium ────
// EN name is stored in flags.babele.originalName (confirmed from inspection)
async function extractMonsterNames() {
  const pack = game.packs.get('fade-compendiums.actor-compendium');
  if (!pack) { console.error('Compendium not found'); return; }

  const results = [];
  const index = await pack.getIndex();

  for (const entry of index.contents) {
    if (!['npc', 'monster'].includes(entry.type)) continue;
    const doc = await pack.getDocument(entry._id);
    const nameIT = doc.name;
    const nameEN = doc.flags?.babele?.originalName ?? '';
    results.push({ nameEN, nameIT });
  }

  // Sort alphabetically by EN name
  results.sort((a, b) => a.nameEN.localeCompare(b.nameEN));

  // Print as table in console
  console.log('=== MONSTER NAME TABLE (EN → IT) ===');
  console.table(results);

  // Copy-pastable text format
  const text = results.map(r => `${r.nameEN} → ${r.nameIT}`).join('\n');
  console.log('\n=== COPY-PASTE FORMAT ===\n' + text);

  return results;
}

// ─── RUN ─────────────────────────────────────────────────────────────────────
await extractMonsterNames();

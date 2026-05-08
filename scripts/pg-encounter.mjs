// ==========================================
// Encounter Generator
// RC Rules: Balancing Encounters (Chapter 7)
// ==========================================

const MODULE_ID = 'fantastic-depths-dm-screen';

// ── Challenge tables (RC) ────────────────────────────────────────────────────
const CHALLENGE_TARGETS = {
  'too-easy':            { min: 0.01, max: 0.10, label: 'Too Easy' },
  'minor':               { min: 0.10, max: 0.20, label: 'Minor' },
  'distraction':         { min: 0.20, max: 0.30, label: 'Distraction' },
  'good-fight':          { min: 0.30, max: 0.50, label: 'Good Fight' },
  'challenging':         { min: 0.50, max: 0.70, label: 'Challenging' },
  'major':               { min: 0.70, max: 0.90, label: 'Major' },
  'risky':               { min: 0.90, max: 1.10, label: 'Risky' },
  'extremely-dangerous': { min: 1.10, max: 9.99, label: 'Extremely Dangerous' }
};

// Challenge badge colours
const CHALLENGE_COLORS = {
  'too-easy':            '#888888',
  'minor':               '#aaaaaa',
  'distraction':         '#5b9bd5',
  'good-fight':          '#4caf50',
  'challenging':         '#ff9800',
  'major':               '#e65100',
  'risky':               '#d32f2f',
  'extremely-dangerous': '#7b1fa2'
};

// Challenge → Dungeon Level mapping (for dungeon encounter tables)
// Supports both English (Level1, Level2...) and Italian (1°, 2°, 3°, 4-5°, 6-7°, 8-10°)
const CHALLENGE_TO_DUNGEON_LEVEL = {
  'too-easy':            { level: 1,   tableFragment: 'level1|1°' },
  'minor':               { level: '1-2', tableFragment: 'level1|level2|1°|2°' },
  'distraction':         { level: 2,   tableFragment: 'level2|2°' },
  'good-fight':          { level: 3,   tableFragment: 'level3|3°' },
  'challenging':         { level: '4-5', tableFragment: 'level4-5|level4|level5|4-5°|4°|5°' },
  'major':               { level: '5-6', tableFragment: 'level5|level6|level6-7|5°|6°|6-7°' },
  'risky':               { level: '6-7', tableFragment: 'level6-7|level6|level7|6-7°|6°|7°' },
  'extremely-dangerous': { level: '8-10', tableFragment: 'level8-10|level8|level9|level10|8-10°|8°|9°|10°' }
};

// Location → encounter table name fragments (matches folder names in compendium)
const LOCATION_TABLE_MAP = {
  'random':    null,
  'dungeon':   'dungeon',
  'woods':     'woods',
  'plains':    'plains',
  'mountains': 'mountain',
  'swamp':     'swamp',
  'sea':       'sea',
  'city':      'city',
  'desert':    'desert',
  'arctic':    'arctic'
};

// Bilingual monster type mapping (English ↔ Italian)
// Allows matching monster types in both languages
const MONSTER_TYPE_BILINGUAL = {
  // English → Italian (for display)
  'Aberration': 'Aberrazione',
  'Animal': 'Animale',
  'Construct': 'Costrutto',
  'Construct, Enchanted': 'Costrutto, Incantato',
  'Demihuman': 'Semiumano',
  'Dragon': 'Drago',
  'Dragon-Kin': 'Dragonide',
  'Dragon-Kin, Planar Monster, Enchanted': 'Dragonide, Mostro Planare, Incantato',
  'Enchanted': 'Incantato',
  'Fey': 'Fata',
  'Giant': 'Gigante',
  'Giant Animal': 'Animale Gigante',
  'Giant Humanoid': 'Umanoide Gigante',
  'Human': 'Umano',
  'Humanoid': 'Umanoide',
  'Humanoid, Enchanted': 'Umanoide, Incantato',
  'Lowlife': 'Senza mente',
  'Lowlife, Enchanted': 'Senza mente, Incantato',
  'Monster': 'Mostro',
  'Monster, Dragon-Kin': 'Mostro, Dragonide',
  'Monster, Enchanted': 'Mostro, Incantato',
  'Monster, Planar Monster': 'Mostro, Mostro Planare',
  'Normal Animal': 'Animale Normale',
  'Ooze': 'Melma',
  'Planar': 'Planare',
  'Planar Monster': 'Mostro Planare',
  'Planar Monster, Enchanted': 'Mostro Planare, Incantato',
  'Prehistoric Animal': 'Animale Preistorico',
  'Undead': 'Non Morto',
  'Undead, Enchanted': 'Non Morto, Incantato',
  'Undead Construct, Enchanted': 'Costrutto Non Morto, Incantato',
  'Vermin': 'Verme',
  
  // Italian → English (for reverse lookup)
  'Aberrazione': 'Aberration',
  'Animale': 'Animal',
  'Costrutto': 'Construct',
  'Costrutto, Incantato': 'Construct, Enchanted',
  'Semiumano': 'Demihuman',
  'Drago': 'Dragon',
  'Dragonide': 'Dragon-Kin',
  'Dragonide, Mostro Planare, Incantato': 'Dragon-Kin, Planar Monster, Enchanted',
  'Incantato': 'Enchanted',
  'Fata': 'Fey',
  'Gigante': 'Giant',
  'Animale Gigante': 'Giant Animal',
  'Umanoide Gigante': 'Giant Humanoid',
  'Umano': 'Human',
  'Umanoide': 'Humanoid',
  'Umanoide, Incantato': 'Humanoid, Enchanted',
  'Senza mente': 'Lowlife',
  'Senza mente, Incantato': 'Lowlife, Enchanted',
  'Mostro': 'Monster',
  'Mostro, Dragonide': 'Monster, Dragon-Kin',
  'Mostro, Incantato': 'Monster, Enchanted',
  'Mostro, Mostro Planare': 'Monster, Planar Monster',
  'Animale Normale': 'Normal Animal',
  'Melma': 'Ooze',
  'Planare': 'Planar',
  'Mostro Planare': 'Planar Monster',
  'Mostro Planare, Incantato': 'Planar Monster, Enchanted',
  'Animale Preistorico': 'Prehistoric Animal',
  'Non Morto': 'Undead',
  'Non-Morto': 'Undead',
  'Non Morto, Incantato': 'Undead, Enchanted',
  'Non-Morto, Incantato': 'Undead, Enchanted',
  'Costrutto Non Morto, Incantato': 'Undead Construct, Enchanted',
  'Verme': 'Vermin'
};

// Monster Type translations (English → Italian)
// Maps English monster types from compendium to Italian for display
const MONSTER_TYPE_TRANSLATIONS = {
  'Aberration': 'Aberrazione',
  'Animal': 'Animale',
  'Construct': 'Costrutto',
  'Construct, Enchanted': 'Costrutto, Incantato',
  'Demihuman': 'Semiumano',
  'Dragon': 'Drago',
  'Dragon-Kin': 'Dragonide',
  'Dragon-Kin, Planar Monster, Enchanted': 'Dragonide, Mostro Planare, Incantato',
  'Enchanted': 'Incantato',
  'Fey': 'Fata',
  'Giant': 'Gigante',
  'Giant Animal': 'Animale Gigante',
  'Giant Humanoid': 'Umanoide Gigante',
  'Human': 'Umano',
  'Humanoid': 'Umanoide',
  'Humanoid, Enchanted': 'Umanoide, Incantato',
  'Lowlife': 'Senza mente',
  'Lowlife, Enchanted': 'Senza mente, Incantato',
  'Monster': 'Mostro',
  'Monster, Dragon-Kin': 'Mostro, Dragonide',
  'Monster, Enchanted': 'Mostro, Incantato',
  'Monster, Planar Monster': 'Mostro, Mostro Planare',
  'Normal Animal': 'Animale Normale',
  'Ooze': 'Melma',
  'Planar': 'Planare',
  'Planar Monster': 'Mostro Planare',
  'Planar Monster, Enchanted': 'Mostro Planare, Incantato',
  'Prehistoric Animal': 'Animale Preistorico',
  'Undead': 'Non Morto',
  'Undead, Enchanted': 'Non Morto, Incantato',
  'Undead Construct, Enchanted': 'Costrutto Non Morto, Incantato',
  'Vermin': 'Verme'
};

// Fallback terrain mapping for monsters without terrain data
// Maps monster names to appropriate terrain when terrain field is empty
const MONSTER_TERRAIN_FALLBACK = {
  'Cammello': 'Desert',
  'Camel': 'Desert',
  'Cavallo da Guerra': 'Plains',
  'Horse, War': 'Plains',
  'Cavallo da Tiro': 'Plains',
  'Horse, Draft': 'Plains',
  'Pony': 'Plains',
  'Mule': 'Plains',
  'Elefante Normale': 'Plains',
  'Elephant, Normal': 'Plains',
  'Donkey': 'Plains',
  'Asino': 'Plains',
  'Tafano Predatore': 'Spazi Aperti, Rovine, Boschi',
  'Killer Fly': 'Open, Ruins, Woods',
  'Volpe': 'Boschi, Pianure, Aperto',
  'Fox': 'Woods, Plains, Open',
  'Toporagno Gigante': 'Aperto, Rovine, Boschi',
  'Giant Shrew': 'Open, Ruins, Woods'
};

// Dungeon Level → allowed monster types (based on RC Rules Cyclopedia)
// Maps dungeon levels to appropriate monster types for that difficulty level
// Based on RC Rules Cyclopedia Dungeon Encounter Tables and actual compendium monsterType values.
// Each level includes the types of all RC monsters for that level (verified from compendium data).
// Note: compound types like "Undead, Enchanted" are matched by startsWith() in the filter.
const DUNGEON_LEVEL_MONSTER_TYPES = {
  // Bandit(Human), Beetle/Locust/Centipede/Spider(Lowlife), Ghoul/Skeleton/Zombie(Undead),
  // Goblin/Kobold/Orc/Troglodyte(Humanoid), Snake(Normal Animal), Lizard Gecko(Giant Animal),
  // Stirge/Uccello Stigeo(Monster)
  'dungeon-1': ['Human', 'Humanoid', 'Lowlife', 'Undead', 'Normal Animal', 'Giant Animal', 'Monster'],

  // + Gnoll/Hobgoblin/Neanderthal/Lizard Man(Humanoid), Gray Ooze/Carrion Crawler(Lowlife),
  // + Lizard Draco(Giant Animal), Snake Pit Viper(Normal Animal)
  'dungeon-2': ['Human', 'Humanoid', 'Lowlife', 'Undead', 'Normal Animal', 'Giant Animal', 'Monster'],

  // + Bugbear(Humanoid), Doppelganger/Harpy/Gelatinous Cube/Medusa/Thoul(Monster),
  // + Gargoyle/Living Statue(Construct), Ogre(Giant Humanoid), Wight(Undead),
  // + Shadow/Lycanthrope Wererat(Monster, Enchanted), Ochre Jelly(Lowlife)
  'dungeon-3': ['Human', 'Humanoid', 'Lowlife', 'Undead', 'Normal Animal', 'Giant Animal', 'Monster', 'Construct', 'Giant Humanoid'],

  // Blink Dog/Cockatrice/Displacer Beast/Hellhound/Hydra/Lycanthrope Werewolf/Rust Monster(Monster),
  // Mummy/Wraith(Undead), Hill Giant/Troll(Giant Humanoid), Gargoyle(Construct),
  // Caecilia/Ochre Jelly/Rhagodessa/Scorpion(Lowlife), Harpy/Medusa(Monster), NPC Party(Human)
  'dungeon-4-5': ['Human', 'Humanoid', 'Lowlife', 'Undead', 'Monster', 'Construct', 'Giant Humanoid'],

  // Basilisk/Cockatrice/Hellhound/Hydra/Lycanthrope/Manticore/Minotaur/Rust Monster(Monster),
  // Mummy/Spectre/Vampire(Undead), Hill+Stone Giant/Ogre/Troll(Giant Humanoid),
  // Salamander Flame(Planar Monster), Caecilia/Ochre Jelly/Spider(Lowlife)
  'dungeon-6-7': ['Human', 'Humanoid', 'Lowlife', 'Undead', 'Monster', 'Construct', 'Giant Humanoid', 'Planar Monster'],

  // Basilisk/Chimera/Devil Swine/Hydra/Lycanthrope/Rust Monster(Monster),
  // Spectre/Vampire(Undead), Giant(Giant Humanoid), Dragon(Dragon),
  // Golem/Living Statue(Construct), Purple Worm/Black Pudding/Spider(Lowlife),
  // Salamander(Planar Monster)
  'dungeon-8-10': ['Human', 'Humanoid', 'Lowlife', 'Undead', 'Monster', 'Construct', 'Giant Humanoid', 'Planar Monster', 'Dragon']
};

// Dungeon Level → HD range cap (based on RC Rules Cyclopedia tables)
// Overrides hdMax to prevent monsters too powerful for the dungeon level
const DUNGEON_LEVEL_HD_RANGE = {
  'dungeon-1': { min: 0.25, max: 2   },
  'dungeon-2': { min: 0.25, max: 3   },
  'dungeon-3': { min: 1,    max: 5   },
  'dungeon-4-5':  { min: 2,    max: 9   },
  'dungeon-6-7':  { min: 4,    max: 13  },
  'dungeon-8-10': { min: 6,    max: 20  },
};

// Dungeon Level → RC-exact monster whitelist (substring match on name, case-insensitive)
// Derived directly from RC Rules Cyclopedia Dungeon Encounter Tables
const DUNGEON_LEVEL_WHITELIST = {
  'dungeon-1': [
    'Bandito', 'Bandit',
    'Scarabeo di Fuoco', 'Beetle, Fire', 'Beetle Fire',
    'Locusta', 'Cave Locust', 'Locust',
    'Centopiedi', 'Centipede',
    'Ghoul',
    'Goblin',
    'Umano', 'Human',
    'Coboldo', 'Kobold',
    'Lucertola, Geco', 'Lizard Gecko',
    'Gruppo avventurieri', 'NPC Party', 'NPC',
    'Orchetto',
    'Scheletro', 'Skeleton',
    'Serpente, Cobra', 'Snake, Racer', 'Snake Racer', 'Serpente',
    'Ragno', 'Spider',
    'Stirge', 'Uccello Stigeo',
    'Troglodita', 'Troglodyte',
    'Zombie',
  ],
  'dungeon-2': [
    'Scarabeo, Olio', 'Beetle, Oil', 'Beetle Oil', 'Scarabeo Oleoso',
    'Verme-Iena', 'Carrion Crawler',
    'Ghoul',
    'Gnoll',
    'Goblin',
    'Melma Vischiosa', 'Gray Ooze', 'Grey Ooze',
    'Hobgoblin',
    'Umano', 'Human',
    'Lucertola, Draco',
    'Uomo Lucertola',
    'Uomo delle Caverne', 'Neanderthal',
    'Gruppo avventurieri', 'NPC Party', 'NPC',
    'Orchetto',
    'Scheletro', 'Skeleton',
    'Serpente, Vipera', 'Snake, Pit Viper', 'Snake Pit Viper',
    'Ragno, Vedova', 'Spider, Black Widow', 'Spider Black Widow',
    'Troglodita', 'Troglodyte',
    'Zombie',
  ],
  'dungeon-3': [
    'Scimmione Bianco', 'Ape, White', 'White Ape',
    'Scarabeo Tigrato', 'Beetle, Tiger', 'Beetle Tiger',
    'Bugbear',
    'Verme-Iena', 'Carrion Crawler',
    'Metamorfosis', 'Doppelganger',
    'Gargoyle',
    'Cubo Gelatinoso', 'Gelatinous Cube',
    'Arpia', 'Harpy',
    'Umano', 'Human',
    'Statua Animata', 'Living Statue',
    'Licantropo, Ratto', 'Lycanthrope, Wererat', 'Wererat',
    'Medusa',
    'Gruppo avventurieri', 'NPC Party', 'NPC',
    'Ameba Paglierina', 'Ochre Jelly',
    'Orco', 'Ogre',
    'Ombra', 'Shadow',
    'Ragno Gigante, Tarantola', 'Spider, Tarantella', 'Spider Tarantella',
    'Thoul',
    'Spettro',
  ],
  'dungeon-4-5': [
    'Molosso instabile', 'Blink Dog',
    'Caecilia',
    'Gallo serpente', 'Cockatrice',
    'Pantera Distorcente', 'Displacer Beast',
    'Gargoyle',
    'Gigante delle Colline', 'Giant, Hill', 'Hill Giant',
    'Arpia', 'Harpy',
    'Mastino infernale', 'Hellhound', 'Hell Hound',
    'Idra', 'Hydra',
    'Licantropo, Lupo', 'Lycanthrope, Werewolf', 'Werewolf',
    'Medusa',
    'Mummia', 'Mummy',
    'Gruppo avventurieri', 'NPC Party', 'NPC',
    'Ameba Paglierina', 'Ochre Jelly',
    'Rhagodessa',
    'Rugginofago', 'Rust Monster',
    'Sorpione Gigante', 'Scorpion, Giant', 'Giant Scorpion',
    'Troll',
    'Wraith',
  ],
  'dungeon-6-7': [
    'Basilisco', 'Basilisk',
    'Caecilia',
    'Cockatrice',
    'Gigante delle Colline', 'Giant, Hill', 'Hill Giant',
    'Gigante delle Rocce', 'Giant, Stone', 'Stone Giant',
    'Mastino infernale', 'Hellhound', 'Hell Hound',
    'Idra', 'Hydra',
    'Licantropo', 'Lycanthrope',
    'Manticora', 'Manticore',
    'Minotauro', 'Minotaur',
    'Mummia', 'Mummy',
    'Gruppo avventurieri', 'NPC Party', 'NPC',
    'Ameba Paglierina', 'Ochre Jelly',
    'Orco', 'Ogre',
    'Rugginofago', 'Rust Monster',
    'Necrospettro', 'Spectre',
    'Ragno Gigante, Tarantola', 'Spider, Tarantella', 'Spider Tarantella',
    'Salamandra', 'Salamander',
    'Troll',
    'Vampiro* (Umano)', 'Vampiro* (Lupo Nero)', 'Vampire* (Human)', 'Vampire* (Dire Wolf)',
  ],
  'dungeon-8-10': [
    'Basilisco', 'Basilisk',
    'Protoplasma nero', 'Black Pudding',
    'Chimera',
    'Verro diabolico', 'Devil Swine',
    'Drago', 'Dragon',
    'Gigante delle Colline', 'Gigante delle Rocce', 'Gigante del Fuoco', 'Gigante dei Ghiacci', 'Gigante delle Montagne', 'Gigante delle Nuvole', 'Gigante del Mare', 'Gigante delle Tempeste',
    'Giant, Hill', 'Giant, Stone', 'Giant, Fire', 'Giant, Frost', 'Giant, Mountain', 'Giant, Cloud', 'Giant, Sea', 'Giant, Storm',
    'Golem',
    'Idra', 'Hydra',
    'Statua Animata', 'Living Statue',
    'Licantropo', 'Lycanthrope',
    'Gruppo avventurieri', 'NPC Party', 'NPC',
    'Verme Purpureo', 'Purple Worm',
    'Rugginofago', 'Rust Monster',
    'Salamandra', 'Salamander',
    'Serpente', 'Snake',
    'Necrospettro', 'Spectre',
    'Ragno', 'Spider',
    'Vampiro* (Umano)', 'Vampiro* (Lupo Nero)', 'Vampire* (Human)', 'Vampire* (Dire Wolf)',
  ],
};

// City encounter whitelist — RC-inspired urban monster/NPC pool
// Includes Settled-terrain monsters + classic NPC adventurer types from compendium
const CITY_WHITELIST = [
  // Urban/Settled-specific monsters
  'Headsman', 'Boia',
  'Thug', 'Assassino',
  // Human NPC types
  'Human, Noble', 'Umano, Nobile',
  'Human, Brigand', 'Umano, Brigante',
  'Human, Trader', 'Umano, Carovaniere',
  'Berserker',
  'Bandit', 'Bandito',
  // Classic NPC adventurer parties
  'NPC Party', 'NPC', 'Gruppo avventurieri',
  'Dwarf', 'Nano',
  'Elf', 'Elfo',
  'Halfling',
  // Shapeshifters & infiltrators (thematically fit urban setting)
  'Doppleganger', 'Metamorfosis',
  'Lycanthrope, Wererat', 'Licantropo, Ratto Mannaro',
  'Lycanthrope, Devil Swine', 'Licantropo, Verro Diabolico',
];

// Location → preferred terrain keywords for filtering
// Maps dropdown location values to terrain keywords found in monster descriptions
// Includes both English and Italian keywords for bilingual support
const LOCATION_TERRAIN_MAP = {
  'city':           ['City', 'Urban', 'Village', 'Town', 'Città', 'Urbano', 'Abitato', 'Insediato', 'Settled'],
  'dungeon':        ['Dungeon', 'Caverna', 'Cripta', 'Crypt', 'Maze', 'Underground', 'Sotterraneo'],
  'cavern':         ['Cavern', 'Caverns', 'Crypt', 'Maze', 'Cave', 'Caves', 'Caverna', 'Caverne', 'Grotta', 'Cripta'],
  'ruins':          ['Ruins', 'Ruin', 'Rovine', 'Rovina'],
  'woods':          ['Woods', 'Woodlands', 'Wooded', 'Boschi', 'Bosco', 'Wood'],
  'forest':         ['Forest', 'Forests', 'Deep Forest', 'Jungle', 'Woods', 'Woodlands', 'Foresta', 'Foreste', 'Foreste Profonde', 'Giungla', 'Boschi', 'Bosco'],
  'jungle':         ['Jungle', 'Forest', 'Forests', 'Deep Forest', 'Woods', 'Woodlands', 'Tropical', 'Swamp', 'Swamps', 'Giungla', 'Foresta', 'Foreste', 'Boschi', 'Tropicale', 'Palude'],
  'plains':         ['Plains', 'Plain', 'Steppe', 'Prairie', 'Open', 'Pianure', 'Pianura', 'Steppa', 'Prateria', 'Aperto', 'Aperta', 'Spazi aperti'],
  'grassland':      ['Grassland', 'Plains', 'Plain', 'Steppe', 'Prairie', 'Open', 'Hill', 'Hills', 'Savanna', 'Prateria', 'Pianure', 'Pianura', 'Steppa', 'Aperto', 'Aperta', 'Colline', 'Collina'],
  'savanna':        ['Savanna', 'Plains', 'Plain', 'Steppe', 'Prairie', 'Open', 'Hill', 'Hills', 'Desert', 'Pianure', 'Pianura', 'Steppa', 'Aperto', 'Aperta', 'Colline', 'Collina', 'Deserto'],
  'mountains':      ['Mountain', 'Mountains', 'Cliff', 'Peak', 'Volcanoes', 'Snow-capped', 'Montagna', 'Montagne', 'Picco', 'Vulcani', 'Montagne innevate'],
  'hills':          ['Hills', 'Hill', 'Mountain', 'Wooded Hills', 'Colline', 'Collina', 'Montagna'],
  'swamp':          ['Swamp', 'Swamps', 'Bog', 'Fen', 'Wetland', 'Acquitrino', 'Acquitrini', 'Palude', 'Paludi'],
  'marsh':          ['Marsh', 'Marshes', 'Swamp', 'Swamps', 'Bog', 'Fen', 'Moor', 'Moors', 'River/Lake', 'River', 'Rivers', 'Coastal Rivers', 'Shore', 'Shores', 'Palude', 'Paludi', 'Acquitrino', 'Brughiere', 'Fiume', 'Fiumi', 'Riva'],
  'sea':            ['Sea', 'Ocean', 'Coastal', 'Deep Sea', 'Open Sea', 'Mare', 'Oceano', 'Mare Profondo', 'Costiero'],
  'ocean':          ['Ocean', 'Oceans', 'Sea', 'Seas', 'Deep Sea', 'Coastal', 'Open Sea', 'Submarine', 'Underwater', 'Coastal Rivers', 'Shore', 'Shores', 'River/Lake', 'Abyssal', 'Oceano', 'Oceani', 'Mare', 'Mari', 'Mare Profondo', 'Subacqueo', 'Costiero', 'Costa', 'Riva', 'Fiumi Costieri'],
  'lake':           ['Lake', 'Lakes', 'Large Lakes', 'River/Lake', 'River', 'Rivers', 'Swamp', 'Swamps', 'Coastal Rivers', 'Shore', 'Shores', 'Coastal', 'Coast', 'Lago', 'Laghi', 'Grandi Laghi', 'Fiume/Lago', 'Fiume', 'Fiumi', 'Palude', 'Riva', 'Costiero'],
  'river':          ['River', 'Rivers', 'River/Lake', 'Coastal Rivers', 'Shore', 'Fiume', 'Fiumi', 'Fiume/Lago', 'Rive', 'Fiumi Costieri'],
  'coast':          ['Coast', 'Coastal', 'Shore', 'Shores', 'Beach', 'Costa', 'Costiero', 'Riva', 'Rive', 'Spiaggia'],
  'beach':          ['Beach', 'Coast', 'Shore', 'Shores', 'Spiaggia', 'Costa', 'Riva', 'Rive'],
  'urban':          ['Urban', 'City', 'Town', 'Village', 'Settled', 'Abitato', 'Urbano', 'Città', 'Villaggio', 'Insediato'],
  'village':        ['Village', 'Town', 'Urban', 'Settled', 'Inhabited', 'Villaggio', 'Città', 'Urbano', 'Abitato', 'Insediato'],
  'desert':         ['Desert', 'Dunes', 'Barren', 'Deserto', 'Dune', 'Sabbia', 'Terre aride', 'Terre Aride'],
  'wasteland':      ['Wasteland', 'Barren', 'Cursed', 'Desert', 'Desolate', 'Terre Desolate', 'Terre aride', 'Terre Maledette', 'Terre Aride'],
  'arctic':         ['Arctic', 'Ice', 'Glacier', 'Icy', 'Snow-capped', 'Artico', 'Artide', 'Ghiaccio', 'Ghiacciaio', 'Caverne Ghiacciate'],
  'tundra':         ['Tundra', 'Arctic', 'Snow', 'Ice', 'Glacier', 'Cold', 'Open', 'Hill', 'Hills', 'Barren', 'Neve', 'Artico', 'Ghiaccio', 'Ghiacciaio', 'Freddo', 'Aperto', 'Aperta', 'Colline', 'Collina', 'Terre aride'],
  'snow':           ['Snow', 'Arctic', 'Tundra', 'Mountain', 'Mountains', 'Cold', 'Glacier', 'Ice', 'Neve', 'Artico', 'Tundra', 'Montagna', 'Montagne', 'Freddo', 'Ghiaccio', 'Ghiacciaio'],
  'open':           ['Open', 'Plains', 'Steppe', 'Wilderness', 'Aperto', 'Aperta', 'Spazi aperti', 'Pianure', 'Steppa', 'Natura selvaggia'],
  'variable':       ['Variable', 'Variabile'],
  'wilderness':     ['Wilderness', 'Wild', 'Natura selvaggia', 'Terreni selvaggi', 'natura selvaggia'],
  'barren-lands':   ['Barren Lands', 'Barren', 'Wasteland', 'Desolate', 'Terre Aride', 'Terre aride', 'Terre Desolate'],
  'underground':    ['Underground', 'Cavern', 'Caverns', 'Cave', 'Dungeon', 'Sottosuolo', 'Caverna', 'Caverne', 'Dungeon'],
  'settled':        ['Settled', 'Inhabited', 'Urban', 'City', 'Village', 'Abitato', 'Insediato', 'Urbano', 'Città'],
  'steppe':         ['Steppe', 'Plains', 'Plain', 'Grassland', 'Open', 'Hill', 'Hills', 'Desert', 'Barren', 'Prairie', 'Steppa', 'Pianure', 'Pianura', 'Prateria', 'Aperto', 'Aperta', 'Colline', 'Collina', 'Deserto', 'Terre aride'],
  'moors':          ['Moor', 'Moors', 'Marsh', 'Marshes', 'Swamp', 'Swamps', 'Bog', 'Fen', 'River/Lake', 'River', 'Rivers', 'Coastal Rivers', 'Shore', 'Shores', 'Open', 'Hill', 'Hills', 'Brughiere', 'Palude', 'Paludi', 'Acquitrino', 'Fiume', 'Riva'],
  'castle':         ['Castle', 'Castello', 'Ruins', 'Ruin', 'Rovine', 'Rovina', 'Settled', 'Abitato', 'Insediato'],
  'graveyard':      ['Graveyard', 'Graveyards', 'Crypt', 'Crypts', 'Tomb', 'Tombs', 'Ruins', 'Ruin', 'Haunted', 'Cursed', 'Undead', 'Cimiteri', 'Cripte', 'Tombe', 'Rovine', 'Rovina', 'Infestato', 'Maledetto'],
  'deep-sea':       ['Deep Sea', 'Ocean', 'Abyssal', 'Clouds or Deep Sea', 'Sea', 'Seas', 'Coastal', 'Coast', 'Shore', 'Shores', 'Submarine', 'Underwater', 'River/Lake', 'Mare Profondo', 'Oceano', 'Nuvole o Mare Profondo', 'Mare', 'Costiero', 'Costa', 'Riva', 'Subacqueo'],
  'deep-forest':    ['Deep Forest', 'Deep Forests', 'Forest', 'Woods', 'Foreste Profonde', 'Foresta', 'Boschi'],
  'cursed-lands':   ['Cursed Lands', 'Cursed', 'Haunted', 'Forgotten', 'Ruins', 'Ruin', 'Graveyard', 'Graveyards', 'Tomb', 'Tombs', 'Crypt', 'Crypts', 'Shrine', 'Terre Maledette', 'Infestato', 'Dimenticati', 'Rovine', 'Rovina', 'Cimiteri', 'Tombe', 'Cripte'],
  'elemental-air':  ['Plane of Air', 'Elemental Plane of Air', 'Clouds', 'Cloud', 'Aerial', 'Piano dell\'Aria', 'Piano Elementale dell\'Aria', 'Dimensione dell\'Aria', 'Nuvole', 'Aereo'],
  'elemental-earth':['Plane of Earth', 'Elemental Plane of Earth', 'Piano della Terra', 'Piano Elementale della Terra'],
  'elemental-fire': ['Plane of Fire', 'Elemental Plane of Fire', 'Lava', 'Magma', 'Piano del Fuoco', 'Piano Elementale del Fuoco', 'Lava'],
  'elemental-water':['Plane of Water', 'Elemental Plane of Water', 'Sea', 'Seas', 'Ocean', 'Submarine', 'Underwater', 'River/Lake', 'Coastal', 'Coast', 'Shore', 'Shores', 'Abyssal', 'Piano dell\'Acqua', 'Piano Elementale dell\'Acqua', 'Mare', 'Oceano', 'Subacqueo', 'Fiume', 'Lago', 'Costiero', 'Costa', 'Riva'],
  'any':            ['Any', 'Qualsiasi'],
  'random':         []
};

// Per-location monster TYPE exclusion
// For elemental planes: exclude Normal Animal except reptiles/serpents (thematically appropriate)
// The 'except' list contains name substrings that ARE allowed through despite the type exclusion.
// Note: this filter runs only when useLocation=true; it also applies in the type-only fallback path.
const ELEMENTAL_ANIMAL_EXCEPT = ['snake', 'serpente', 'serpent', 'caecilia', 'viper', 'python', 'rattler', 'racer', 'boa', 'cobra', 'lizard', 'lucertola', 'gecko', 'crocodile', 'coccodrillo'];
const LOCATION_TYPE_EXCLUDE = {
  'elemental-air':   [{ type: 'Normal Animal', except: ELEMENTAL_ANIMAL_EXCEPT }],
  'elemental-earth': [{ type: 'Normal Animal', except: ELEMENTAL_ANIMAL_EXCEPT }],
  'elemental-fire':  [{ type: 'Normal Animal', except: ELEMENTAL_ANIMAL_EXCEPT }],
  'elemental-water': [{ type: 'Normal Animal', except: ELEMENTAL_ANIMAL_EXCEPT }],
  'graveyard':       [
    { type: 'Normal Animal', except: [] },
    { type: 'Prehistoric Animal', except: [] },
  ],
  'wasteland':       [
    { type: 'Normal Animal', except: ['snake', 'serpent', 'serpente', 'viper', 'python', 'rattler', 'racer', 'lizard', 'lucertola', 'gecko'] },
  ],
  'wilderness':      [
    { type: 'Normal Animal', except: ['snake', 'serpent', 'serpente', 'viper', 'python', 'rattler', 'racer', 'boa', 'cobra', 'bear', 'orso', 'wolf', 'lupo', 'fox', 'volpe', 'deer', 'cervo', 'elk', 'alce', 'boar', 'cinghiale', 'hawk', 'falco', 'eagle', 'aquila', 'owl', 'gufo'] },
  ],
  'barren-lands':    [
    { type: 'Normal Animal', except: ['snake', 'serpent', 'serpente', 'viper', 'python', 'rattler', 'racer', 'lizard', 'lucertola', 'gecko'] },
  ],
  'jungle':          [
    { type: 'Normal Animal', except: ['snake', 'serpent', 'serpente', 'viper', 'python', 'rattler', 'racer', 'boa', 'cobra', 'lizard', 'lucertola', 'gecko', 'crocodile', 'coccodrillo', 'ape', 'scimmia', 'gorilla', 'baboon', 'leopard', 'tiger', 'jaguar', 'panther'] },
  ],
  'lake':            [
    { type: 'Normal Animal', except: ['frog', 'rana', 'toad', 'rospo', 'crocodile', 'coccodrillo', 'snake', 'serpent', 'serpente', 'viper', 'python', 'otter', 'lontra', 'beaver', 'castoro'] },
  ],
  'marsh':           [
    { type: 'Normal Animal', except: ['frog', 'rana', 'toad', 'rospo', 'crocodile', 'coccodrillo', 'snake', 'serpent', 'serpente', 'viper', 'python', 'otter', 'lontra'] },
  ],
  'swamp':           [
    { type: 'Normal Animal', except: ['frog', 'rana', 'toad', 'rospo', 'crocodile', 'coccodrillo', 'snake', 'serpent', 'serpente', 'viper', 'python', 'rattler', 'otter', 'lontra', 'lizard', 'lucertola', 'rat,', 'rat ', 'topo'] },
  ],
  'ocean':           [
    { type: 'Normal Animal', except: ['shark', 'squalo', 'whale', 'balena', 'dolphin', 'delfino', 'seal', 'foca', 'sea', 'marino', 'marina'] },
  ],
  'sea':             [
    { type: 'Normal Animal', except: ['shark', 'squalo', 'whale', 'balena', 'dolphin', 'delfino', 'seal', 'foca', 'sea', 'marino', 'marina'] },
  ],
  'river':           [
    { type: 'Normal Animal', except: ['frog', 'rana', 'toad', 'rospo', 'crocodile', 'coccodrillo', 'snake', 'serpent', 'serpente', 'viper', 'python', 'otter', 'lontra', 'beaver', 'castoro', 'crab', 'granchio'] },
  ],
  'ruins':           [
    { type: 'Normal Animal', except: ['snake', 'serpent', 'serpente', 'viper', 'python', 'rattler', 'racer', 'bat', 'pipistrello', 'rat,', 'rat ', 'topo', 'weasel', 'donnola', 'ferret', 'furetto'] },
  ],
  'underground':     [
    { type: 'Normal Animal', except: ['bat', 'pipistrello', 'rat,', 'rat ', 'topo', 'snake', 'serpent', 'serpente', 'viper', 'python', 'ape', 'scimmia', 'weasel', 'donnola', 'ferret', 'furetto'] },
  ],
  'settled':         [
    { type: 'Normal Animal', except: ['rat,', 'rat ', 'topo', 'dog,', 'dog ', 'cane', 'cat,', 'cat ', 'gatto', 'pipistrello', 'weasel', 'donnola'] },
  ],
  'city':            [
    { type: 'Normal Animal', except: ['rat,', 'rat ', 'topo', 'dog,', 'dog ', 'cane', 'cat,', 'cat ', 'gatto', 'pipistrello', 'weasel', 'donnola'] },
  ],
  'urban':           [
    { type: 'Normal Animal', except: ['rat,', 'rat ', 'topo', 'dog,', 'dog ', 'cane', 'cat,', 'cat ', 'gatto', 'pipistrello', 'weasel', 'donnola'] },
  ],
  'village':         [
    { type: 'Normal Animal', except: ['rat,', 'rat ', 'topo', 'dog,', 'dog ', 'cane', 'cat,', 'cat ', 'gatto', 'pipistrello', 'weasel', 'donnola'] },
  ],
  'snow':            [
    { type: 'Normal Animal', except: ['bear', 'orso', 'wolf', 'lupo', 'fox', 'volpe', 'seal', 'foca', 'mammoth', 'mammut', 'elk', 'alce', 'moose', 'raven', 'corvo', 'owl', 'gufo'] },
    { type: 'Prehistoric Animal', except: ['mammoth', 'mammut', 'bear', 'orso', 'rhino', 'rinoceronte', 'tiger', 'tigre', 'wolf', 'lupo'] },
  ],
  'arctic':          [
    { type: 'Normal Animal', except: ['bear', 'orso', 'wolf', 'lupo', 'fox', 'volpe', 'seal', 'foca', 'mammoth', 'mammut', 'elk', 'alce', 'moose', 'raven', 'corvo', 'owl', 'gufo'] },
  ],
  'tundra':          [
    { type: 'Normal Animal', except: ['bear', 'orso', 'wolf', 'lupo', 'fox', 'volpe', 'seal', 'foca', 'mammoth', 'mammut', 'elk', 'alce', 'moose', 'raven', 'corvo', 'owl', 'gufo'] },
    { type: 'Prehistoric Animal', except: ['mammoth', 'mammut', 'bear', 'orso', 'rhino', 'rinoceronte', 'tiger', 'tigre', 'wolf', 'lupo'] },
  ],
  'steppe':          [
    { type: 'Normal Animal', except: ['snake', 'serpent', 'serpente', 'viper', 'python', 'rattler', 'racer', 'horse', 'cavallo', 'wolf', 'lupo', 'fox', 'volpe', 'bear', 'orso', 'boar', 'cinghiale', 'bison', 'bisonte', 'buffalo', 'bufalo', 'hawk', 'falco', 'eagle', 'aquila'] },
    { type: 'Prehistoric Animal', except: ['horse', 'cavallo', 'bison', 'bisonte', 'wolf', 'lupo', 'mammoth', 'mammut'] },
  ],
  'savanna':         [
    { type: 'Normal Animal', except: ['snake', 'serpent', 'serpente', 'viper', 'python', 'rattler', 'racer', 'baboon', 'babbuino', 'lion', 'leone', 'cheetah', 'leopard', 'hyena', 'zebra', 'elephant', 'elefante', 'giraffe', 'giraffa', 'buffalo', 'bufalo', 'hawk', 'falco', 'eagle', 'aquila'] },
  ],
  'plains':          [
    { type: 'Normal Animal', except: ['snake', 'serpent', 'serpente', 'viper', 'python', 'rattler', 'racer', 'baboon', 'babbuino', 'horse', 'cavallo', 'wolf', 'lupo', 'bear', 'orso', 'boar', 'cinghiale', 'bison', 'bisonte', 'buffalo', 'bufalo', 'lion', 'leone', 'cheetah', 'leopard', 'hawk', 'falco', 'eagle', 'aquila'] },
  ],
  'open':            [
    { type: 'Normal Animal', except: ['snake', 'serpent', 'serpente', 'viper', 'python', 'rattler', 'racer', 'baboon', 'babbuino', 'horse', 'cavallo', 'wolf', 'lupo', 'bear', 'orso', 'boar', 'cinghiale', 'bison', 'bisonte', 'buffalo', 'bufalo', 'lion', 'leone', 'cheetah', 'leopard', 'hawk', 'falco', 'eagle', 'aquila'] },
  ],
};

// Per-location monster terrain exclusion substrings
// If monster terrain contains any of these strings, it is excluded from that location
const LOCATION_TERRAIN_EXCLUDE = {
  'plains':     ['costiero', 'coastal', 'mare aperto', 'open sea', 'oceano', 'ocean', 'lago', 'lake', 'fiume', 'river'],
  'grassland':  ['costiero', 'coastal', 'mare aperto', 'open sea', 'oceano', 'ocean', 'lago', 'lake', 'fiume', 'river'],
  'open':       ['costiero', 'coastal', 'mare aperto', 'open sea', 'oceano', 'ocean'],
  'snow':       ['volcanic', 'vulcanico', 'desert', 'deserto'],
  'arctic':     ['volcanic', 'vulcanico', 'desert', 'deserto'],
  'tundra':     ['volcanic', 'vulcanico', 'desert', 'deserto'],
  'steppe':     ['costiero', 'coastal', 'mare aperto', 'open sea', 'oceano', 'ocean', 'lago', 'lake', 'fiume', 'river', 'swamp', 'palude', 'marsh', 'arctic', 'artico', 'tundra', 'jungle', 'giungla', 'forest', 'foresta'],
};

export class EncounterGenerator {

  // ── Parse HD string → adjusted HD value (RC rules) ─────────────────────────
  // RC rule: additions to HD ÷ 5 (round up) added to HD count.
  // e.g. "4+3" → 4 + ceil(3/5) = 5; "2+2" → 2 + ceil(2/5) = 3; "9+3" → 10
  // Asterisks: each special ability = +0.5 adj HD.
  // "1-1" = less than 1 HD → 0.5; "XdY+Z" formula → X dice = X HD + ceil(Z/5)
  static parseAdjustedHD(hdString) {
    if (!hdString) return 1;
    const s = String(hdString).trim().toLowerCase();

    // Count asterisks (each = +0.5)
    const asterisks = (s.match(/\*/g) || []).length;

    // Strip asterisks and whitespace for numeric parsing
    const clean = s.replace(/\*/g, '').trim();

    let base = 0;

    // Handle "X-Y" range: "1-1" = less than 1 HD → 0.5, otherwise use lower bound
    if (/^\d+\s*-\s*\d+$/.test(clean)) {
      const parts = clean.split('-').map(Number);
      base = (parts[0] === 1 && parts[1] === 1) ? 0.5 : parts[0];
    }
    // Handle "X+Y" — RC rule: ceil(Y/5) added to X
    else if (/^\d+\s*\+\s*\d+$/.test(clean)) {
      const parts = clean.split('+').map(s => parseInt(s.trim()));
      base = parts[0] + Math.ceil(parts[1] / 5);
    }
    // Handle "XdY+Z" HP formula (FaDe stores HP formula in system.hp.hd for monsters)
    // Use X dice as HD, then apply RC addition rule to Z bonus points
    else if (/^\d+d\d+(\+\d+)?(-\d+)?$/.test(clean)) {
      const m = clean.match(/^(\d+)d\d+(?:\+(\d+))?(?:-(\d+))?$/);
      if (m) {
        const numDice = parseInt(m[1]);
        const bonus   = m[2] ? parseInt(m[2]) : 0;
        const penalty = m[3] ? parseInt(m[3]) : 0;
        const net = bonus - penalty;
        base = net > 0 ? numDice + Math.ceil(net / 5) : Math.max(0.5, numDice);
      }
    }
    // Handle plain number
    else if (/^\d+(\.\d+)?$/.test(clean)) {
      base = parseFloat(clean);
    }
    // Fallback: extract first number
    else {
      const m = clean.match(/(\d+)/);
      base = m ? parseInt(m[1]) : 1;
    }

    return base + asterisks * 0.5;
  }

  // ── Calculate Real TPL from party actors (RC Rules Cyclopedia) ──────────────
  // Rule: for every 1 HP of damage per experience level → -1 effective level
  //       minimum effective level = floor(level / 2)
  // Example: level 8, 40 max HP, 24 damage → hpPerLevel=5, 24/5=4 → level-4=4,
  //          but minimum is floor(8/2)=4 → effective level 4... RC example gives 5.
  //          RC example: 40 HP / 8 levels = 5 HP/level. 24 damage / 5 = 4.8 → floor = 4 steps? 
  //          But RC says 8-3=5: they use floor(damage/hpPerLevel) only up to level/2 min.
  //          Actually RC: "3 hit points for every experience level" = floor(24/8)=3 → level-3=5. ✓
  //          So hpPerLevel = floor(maxHP / level), reduction = floor(damage / hpPerLevel)
  static calculateRealTPL(actors) {
    let tpl = 0;
    let note = '';
    let reductions = 0;

    for (const actor of actors) {
      const level  = Number(actor.system?.details?.level || 1);
      const maxHP  = Number(actor.system?.hp?.max  || 1);
      const currHP = Number(actor.system?.hp?.value ?? maxHP);
      const damage = Math.max(0, maxHP - currHP);

      // RC: hpPerLevel = maxHP / level. "X HP for every experience level taken as damage"
      // RC example: lvl8, 40HP, 24 damage → 24/8 = 3 HP/level → 8-3 = 5th level
      // So: reduction = floor(damage / level) expressed as "damage per level unit"
      // But RC text says "1 HP of damage for every experience level" = hpPerLevel threshold
      // Correct: hpPerLevel = maxHP/level. Reduction = floor(damage / hpPerLevel).
      // RC example check: hpPerLevel=40/8=5. floor(24/5)=4. 8-4=4 ≠ 5 (RC says 5).
      // RC actually states floor(damage/level) as the reduction steps:
      // floor(24/8)=3 → 8-3=5 ✓
      const reduction = Math.floor(damage / level);
      // Minimum effective level = floor(level / 2)
      const minLevel = Math.floor(level / 2);
      const effectiveLevel = Math.max(minLevel, level - reduction);

      if (effectiveLevel < level) reductions++;
      tpl += effectiveLevel;
    }

    if (reductions > 0) {
      note = `(${reductions} PC${reductions > 1 ? 's' : ''} reduced for damage)`;
    }

    return { realTPL: tpl, note };
  }

  // ── Determine challenge label from percentage ────────────────────────────────
  static getChallengeLabel(pct) {
    for (const [key, range] of Object.entries(CHALLENGE_TARGETS)) {
      if (pct >= range.min && pct < range.max) return { key, label: range.label, labelKey: `ENCOUNTER.${key.charAt(0).toUpperCase() + key.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase())}` };
    }
    if (pct >= 1.10) return { key: 'extremely-dangerous', label: 'Extremely Dangerous', labelKey: 'ENCOUNTER.ExtremelyDangerous' };
    return { key: 'good-fight', label: 'Good Fight', labelKey: 'ENCOUNTER.GoodFight' };
  }

  // ── Roll a dice expression string (e.g. "2d6", "1d8+2") → average value ────
  static rollDiceExpr(expr) {
    if (!expr) return 1;
    const s = String(expr).trim().toLowerCase()
      .replace(/×/g, '*').replace(/[()]/g, '')  // normalize × and strip parens
      .replace(/\s+/g, ' ').trim();

    // Handle "0 NdX*Y" or "0 NdX" — strip leading "0 " and use the real expression
    // e.g. "0 (1d4 × 10)" → "1d4*10"
    const leadingZero = s.match(/^0\s+(.+)$/);
    const effective = leadingZero ? leadingZero[1].trim() : s;

    // Handle NdX*Y or NdX multiplied
    const mMul = effective.match(/^(\d+)d(\d+)(?:[+*](\d+))?/);
    if (mMul) {
      const num = parseInt(mMul[1]);
      const die = parseInt(mMul[2]);
      const mod = mMul[3] ? parseInt(mMul[3]) : 0;
      // Check if it's a multiplier (original had *) or addend
      const isMultiplier = /\d+d\d+\*\d+/.test(effective);
      const avg = num * (die + 1) / 2;
      return Math.max(1, Math.round(isMultiplier ? avg * mod : avg + mod));
    }
    const plain = parseInt(effective);
    return isNaN(plain) ? 1 : plain;
  }

  // ── Get all monster actors from compendium + world (excl. Party/Retainers) ──
  static async getAllMonsters() {
    const monsters = [];

    // 1) Compendium pack: fade-compendiums.actor-compendium
    const pack = game.packs?.find(p =>
      p.metadata.id === 'fade-compendiums.actor-compendium' ||
      p.collection === 'fade-compendiums.actor-compendium'
    );

    if (pack) {
      // Always re-index with required fields (pack may have been indexed without them)
      await pack.getIndex({ fields: ['type', 'system.hp.hd', 'system.details.rarity', 'system.details.monsterType', 'system.details.terrain', 'system.na'] });
      
      for (const entry of pack.index) {
        // Only npc/monster types
        if (entry.type && !['npc', 'monster', 'character'].includes(entry.type)) continue;
        // Skip non-monster entries
        if (entry.type === 'character') continue;

        monsters.push({
          id: entry._id,
          uuid: `Compendium.fade-compendiums.actor-compendium.Actor.${entry._id}`,
          name: entry.name,
          hd: entry.system?.hp?.hd ?? '1',
          adjustedHD: this.parseAdjustedHD(entry.system?.hp?.hd),
          rarity: entry.system?.details?.rarity ?? 'Common',
          monsterType: entry.system?.details?.monsterType ?? '',
          terrain: entry.system?.details?.terrain ?? '',
          naWandering: entry.system?.na?.wandering ?? entry.system?.na?.number ?? '1d6',
          naLair: entry.system?.na?.lair ?? entry.system?.na?.number ?? '1d6',
          img: entry.img ?? 'icons/svg/mystery-man.svg',
          source: 'compendium'
        });
      }
    }

    // 2) World actors — exclude Party and Retainers folders
    const excludedFolders = new Set(
      game.folders?.filter(f =>
        f.type === 'Actor' &&
        /^(party|retainers|seguaci)$/i.test(f.name)
      ).map(f => f.id) ?? []
    );

    for (const actor of game.actors ?? []) {
      if (actor.type === 'character') continue;
      if (excludedFolders.has(actor.folder?.id)) continue;

      monsters.push({
        id: actor.id,
        uuid: actor.uuid,
        name: actor.name,
        hd: actor.system?.hp?.hd ?? '1',
        adjustedHD: this.parseAdjustedHD(actor.system?.hp?.hd),
        rarity: actor.system?.details?.rarity ?? 'Common',
        monsterType: actor.system?.details?.monsterType ?? '',
        terrain: actor.system?.details?.terrain ?? '',
        naWandering: actor.system?.na?.wandering ?? '1d6',
        naLair: actor.system?.na?.lair ?? '1d6',
        img: actor.img ?? 'icons/svg/mystery-man.svg',
        source: 'world'
      });
    }

    return monsters;
  }

  // ── Get distinct monster types from all monsters ─────────────────────────────
  static async getMonsterTypes() {
    const monsters = await this.getAllMonsters();
    const types = [...new Set(monsters.map(m => m.monsterType).filter(Boolean))];
    // Return objects with raw English value and localized label, sorted by label
    const lang = game.i18n.lang ?? 'en';
    return types.map(type => ({
      value: type,
      label: (lang !== 'en' && MONSTER_TYPE_TRANSLATIONS[type]) ? MONSTER_TYPE_TRANSLATIONS[type] : type
    })).sort((a, b) => a.label.localeCompare(b.label, lang));
  }

  // ── Translate Italian monster type back to English for filtering ─────────────
  static _getEnglishMonsterType(displayType) {
    // If it's already an English key, return it directly
    if (MONSTER_TYPE_TRANSLATIONS[displayType]) return displayType;
    // Otherwise find English key by Italian value
    for (const [english, italian] of Object.entries(MONSTER_TYPE_TRANSLATIONS)) {
      if (italian === displayType) return english;
    }
    return displayType; // Return as-is if not found
  }

  // ── Get distinct terrains from all monsters (extracted from descriptions) ────
  static async getTerrains() {
    const monsters = await this.getAllMonsters();
    // Preload terrain data for compendium monsters that don't have it yet
    const pack = game.packs?.find(p =>
      p.metadata.id === 'fade-compendiums.actor-compendium' ||
      p.collection === 'fade-compendiums.actor-compendium'
    );
    if (pack) {
      const toLoad = monsters.filter(m => m.source === 'compendium' && !m.terrain);
      for (const monster of toLoad) {
        try {
          const fullActor = await pack.getDocument(monster.id);
          if (fullActor) {
            const desc = fullActor.system?.biography ?? '';
            // Match Terrain: in HTML format like "<b>Terrain:</b> Any" or "<strong>Terreno comune:</b> Rovine"
            // Supports both English (Terrain/Common Terrain) and Italian (Terreno/Terreno comune)
            const terrainMatch = desc.match(/<[^>]*>[\s]*[Tt](?:erreno(?:\s+comune)?|errain(?:\s+comune)?|erreno(?:\s+comune)?|ommon\s+[Tt]errain):[\s]*<\/[^>]*>([^<]+)/);
            if (terrainMatch) {
              // Clean up: remove trailing punctuation and normalize
              monster.terrain = terrainMatch[1].trim().replace(/[.;]$/, '');
            }
          }
        } catch (e) {}
      }
    }
    // Parse terrain values (they can be comma-separated like "Mountain, Hills")
    const terrainSet = new Set();
    for (const m of monsters) {
      if (m.terrain) {
        m.terrain.split(',').forEach(t => {
          const trimmed = t.trim();
          if (trimmed) terrainSet.add(trimmed);
        });
      }
    }
    return [...terrainSet].sort();
  }

  // ── Get encounter roll tables matching location and challenge ─────────────
  static async getEncounterTables(location, challengeKey = null) {
    const pack = game.packs?.find(p =>
      p.collection === 'fade-compendiums.roll-table-compendium' ||
      p.metadata.id === 'fade-compendiums.roll-table-compendium'
    );
    if (!pack) return [];

    if (!pack.indexed) await pack.getIndex();

    const fragment = location && location !== 'random' ? LOCATION_TABLE_MAP[location] : null;

    const tables = pack.index.filter(e => {
      const name = (e.name || '').toLowerCase();
      // Must contain 'encounter' (EN) or 'incontro' (IT)
      if (!name.includes('encounter') && !name.includes('incontro')) return false;
      if (fragment && !name.includes(fragment)) return false;
      return true;
    });

    // For dungeons, try to narrow down by dungeon level based on challenge
    if (location === 'dungeon' && challengeKey && challengeKey !== 'random' && tables.length > 0) {
      const levelInfo = CHALLENGE_TO_DUNGEON_LEVEL[challengeKey];
      if (levelInfo) {
        // Try to find tables matching the specific dungeon level
        const levelPatterns = levelInfo.tableFragment.split('|');
        const levelTables = tables.filter(t => {
          const name = (t.name || '').toLowerCase();
          return levelPatterns.some(pattern => name.includes(pattern.toLowerCase()));
        });
        // If we found specific level tables, use them; otherwise fall back to all dungeon tables
        if (levelTables.length > 0) {
          return levelTables;
        }
      }
    }

    return tables;
  }

  // ── Roll on a RollTable → get monster names ──────────────────────────────────
  static async rollOnTable(tableId) {
    const pack = game.packs?.find(p =>
      p.collection === 'fade-compendiums.roll-table-compendium' ||
      p.metadata.id === 'fade-compendiums.roll-table-compendium'
    );
    if (!pack) return [];

    try {
      const table = await pack.getDocument(tableId);
      if (!table) return [];

      // Manually roll without calling table.roll()/draw() which tries to update the locked compendium
      const results = table.results?.contents ?? [];
      if (results.length === 0) return [];

      // Build weighted pool
      const pool = [];
      for (const r of results) {
        const weight = r.weight ?? 1;
        for (let i = 0; i < weight; i++) pool.push(r);
      }
      if (pool.length === 0) return [];

      const picked = pool[Math.floor(Math.random() * pool.length)];
      // V13+: use name or description; avoid deprecated .text
      const raw = picked.name || picked.description || '';
      return raw ? [raw] : [];
    } catch (e) {
      console.warn(`${MODULE_ID} | Could not roll on table ${tableId}:`, e);
      return [];
    }
  }

  // ── Find monster by name (fuzzy) from pool ───────────────────────────────────
  static findMonsterByName(name, pool) {
    const n = name.toLowerCase().trim();
    return pool.find(m => m.name.toLowerCase() === n) ||
           pool.find(m => m.name.toLowerCase().includes(n)) ||
           pool.find(m => n.includes(m.name.toLowerCase()));
  }

  // ── Adjust monster quantity to hit target HD range ───────────────────────────
  static adjustQuantity(monster, targetHD, naMode) {
    const naExpr = naMode === 'lair' ? monster.naLair : monster.naWandering;
    const baseQty = this.rollDiceExpr(naExpr);

    // If NA is explicitly 0, return 0 (monster doesn't appear in this mode)
    if (baseQty === 0) return 0;

    const hdPerMonster = monster.adjustedHD;
    if (hdPerMonster <= 0) return Math.max(1, baseQty);

    // How many monsters to hit target HD?
    const idealQty = Math.round(targetHD / hdPerMonster);

    // For high-HD monsters (≥ targetHD), never suggest more than 1 unless na allows it
    if (hdPerMonster >= targetHD) return 1;

    // Clamp between 1 and the base na value (respect RC encounter numbers)
    return Math.max(1, Math.min(idealQty, baseQty));
  }

  // ── Preload real HD values for all compendium monsters in a pool ─────────────
  static async _preloadHD(pool) {
    const pack = game.packs?.find(p =>
      p.collection === 'fade-compendiums.actor-compendium' ||
      p.metadata.id === 'fade-compendiums.actor-compendium'
    );
    if (!pack) return;

    // Only load those whose HD is still unknown (index often missing system fields)
    const toLoad = pool.filter(m => m.source === 'compendium');
    for (const monster of toLoad) {
      try {
        const fullActor = await pack.getDocument(monster.id);
        if (fullActor) {
          const realHD = fullActor.system?.hp?.hd ?? monster.hd;
          monster.hd = realHD;
          monster.adjustedHD = this.parseAdjustedHD(realHD);
          // Get NA values - preserve 0 as valid value (don't fall back to default)
          const sysNA = fullActor.system?.na;
          if (sysNA?.wandering !== undefined) monster.naWandering = sysNA.wandering;
          if (sysNA?.lair !== undefined) monster.naLair = sysNA.lair;
          if (sysNA?.number !== undefined) {
            // Use number as fallback for both if specific values not set
            if (sysNA?.wandering === undefined) monster.naWandering = sysNA.number;
            if (sysNA?.lair === undefined) monster.naLair = sysNA.number;
          }
          monster.img = fullActor.img ?? monster.img;
          // Extract terrain from description HTML (e.g. "<b>Terrain:</b> Mountain, Hills" or "<b>Terreno:</b> Artico")
          // system.biography is a string (HTML) in FaDe system
          const desc = fullActor.system?.biography ?? '';
          // Match both "Terrain:" (English), "Terreno:" and "Terreno comune:" (Italian)
          const terrainMatch = desc.match(/<[^>]*>[\s]*(?:[Tt]erreno(?:\s+comune)?|[Tt]errain(?:\s+comune)?|[Cc]ommon\s+[Tt]errain):[\s]*<\/[^>]*>([^<]+)/);
          if (terrainMatch) {
            monster.terrain = terrainMatch[1].trim().replace(/[.;:]$/, '');
          }
          
          // Fallback: use predefined terrain mapping for known monsters
          // Apply if terrain is missing, empty, undefined, or contains only whitespace
          if ((!monster.terrain || monster.terrain.trim() === '') && MONSTER_TERRAIN_FALLBACK[monster.name]) {
            monster.terrain = MONSTER_TERRAIN_FALLBACK[monster.name];
          }
        }
      } catch (e) {}
    }
  }

  // ── Normalize monster type to English (bilingual support) ─────────────────────
  static _normalizeMonsterType(monsterType) {
    if (!monsterType) return null;
    
    // If it's already English, return as-is
    if (MONSTER_TYPE_BILINGUAL[monsterType]) {
      return monsterType;
    }
    
    // If it's Italian, convert to English
    const englishType = MONSTER_TYPE_BILINGUAL[monsterType];
    if (englishType) {
      return englishType;
    }
    
    // Unknown type, return as-is
    return monsterType;
  }

  // ── Check if monster terrain matches location terrain ────────────────────────
  // Handles special cases like "Any except X" and "Any" (both English and Italian)
  static _terrainMatches(monsterTerrain, locationTerrains, excludeSubstrings = []) {
    // Clean up: lowercase, trim, and remove trailing punctuation
    const mt = (monsterTerrain ?? '').toLowerCase().trim().replace(/[.;:]$/, '');
    if (!mt) return false;

    // Apply per-location exclusions: if monster terrain contains any excluded substring, reject
    if (excludeSubstrings.length > 0 && excludeSubstrings.some(ex => mt.includes(ex))) return false;

    // Special case: "Any except X, Y, Z" - matches everywhere EXCEPT the listed terrains
    // English: "Any except Arctic", Italian: "Qualsiasi eccetto Artico" or "qualsiasi tranne l'Artico"
    const exceptMatch = mt.match(/^any except (.+)$/i) || mt.match(/^qualsiasi(?:\s+\()?eccetto\s+(.+)$/i) || mt.match(/^qualsiasi\s+tranne\s+(?:l')?(.+)$/i);
    if (exceptMatch) {
      // Clean up excluded items: remove trailing punctuation, apostrophes, and parentheses
      const excludedList = exceptMatch[1].split(/,\s*/).map(t => t.toLowerCase().trim().replace(/[().;:'\s]+$/g, '').replace(/^[\s']+/g, ''));
      // Check if any location terrain overlaps with excluded terrain
      // (e.g., location "Snow" has terrains ["Snow", "Arctic", "Tundra"], 
      //  so "Any except Arctic" would exclude it because "Arctic" is in both lists)
      for (const lt of locationTerrains) {
        const ltLower = lt.toLowerCase();
        for (const ex of excludedList) {
          // Direct match or substring match
          if (ltLower === ex || ltLower.includes(ex) || ex.includes(ltLower)) {
            return false; // Excluded!
          }
        }
      }
      return true; // No overlap with excluded terrains
    }

    // Special case: "Any" - matches all locations
    if (mt === 'any' || mt === 'qualsiasi') return true;

    // Normal case: check if monster terrain includes any of the location terrains
    // Use word-boundary check to prevent 'Aperto' from matching 'mare aperto' etc.
    return locationTerrains.some(lt => {
      const kw = lt.toLowerCase();
      const idx = mt.indexOf(kw);
      if (idx === -1) return false;
      const before = idx > 0 ? mt[idx - 1] : ' ';
      const after  = idx + kw.length < mt.length ? mt[idx + kw.length] : ' ';
      return !/[a-zàáèéìíòóùú]/i.test(before) && !/[a-zàáèéìíòóùú]/i.test(after);
    });
  }

  // ── Main generate function ───────────────────────────────────────────────────
  static async generate({ location, monsterType, rarity, challengeKey, naMode, numGroups = 1, actors }) {
    // Handle random challenge selection
    let resolvedChallengeKey = challengeKey;
    if (challengeKey === 'random') {
      const challengeKeys = Object.keys(CHALLENGE_TARGETS);
      resolvedChallengeKey = challengeKeys[Math.floor(Math.random() * challengeKeys.length)];
    }
    const challenge = CHALLENGE_TARGETS[resolvedChallengeKey] ?? CHALLENGE_TARGETS['good-fight'];

    // Calculate TPL
    const baseTpl = actors.reduce((s, a) => s + Number(a.system?.details?.level ?? 1), 0);
    const { realTPL, note } = this.calculateRealTPL(actors);
    const tpl = realTPL > 0 ? realTPL : baseTpl;

    // Target total adjusted HD (midpoint of challenge range, capped at 1.5)
    const targetPct = (challenge.min + Math.min(challenge.max, 1.5)) / 2;
    let targetHD  = tpl * targetPct;

    // HD bounds - for dungeon levels, apply RC-table caps regardless of party strength
    const dungeonHdRange = DUNGEON_LEVEL_HD_RANGE[location];
    const hdMin = dungeonHdRange ? dungeonHdRange.min : 0.25;
    const hdMax = dungeonHdRange ? dungeonHdRange.max : targetHD * 2;

    // Get monster pool and preload real HD values
    const allMonsters = await this.getAllMonsters();
    await this._preloadHD(allMonsters);

    // Filter out monsters with NA=0 for the selected mode
    const naModeField = naMode === 'lair' ? 'naLair' : 'naWandering';
    const validMonsters = allMonsters.filter(m => {
      const naValue = m[naModeField];
      if (naValue === 0) return false;
      const naStr = String(naValue ?? '').trim();
      if (naStr === '0') return false;
      return true;
    });

    // Build location terrain keywords
    const isAnyNot  = location === 'any-not';
    const isAnyOnly = location === 'any-only';
    let locationTerrains = LOCATION_TERRAIN_MAP[location] ?? [];
    if (!isAnyNot && !isAnyOnly && locationTerrains.length === 0 && location !== 'random') {
      locationTerrains = [location.replace(/-/g, ' ')];
    }
    const hasLocationFilter = isAnyNot || isAnyOnly || locationTerrains.length > 0;
    const hasTypeFilter = monsterType && monsterType !== 'random';

    // Helper: check if a monster terrain is a pure "Any"/"Qualsiasi" (not a qualified Any like "Qualsiasi (preistorico)")
    const isAnyTerrain = m => {
      const mt = (m.terrain ?? '').toLowerCase().trim();
      // Must be exactly 'any' or 'qualsiasi', or start with 'any except'/'qualsiasi eccetto'
      // Do NOT match 'qualsiasi (preistorico)' or 'any (prehistoric)' as generic Any
      if (mt === 'any' || mt === 'qualsiasi') return true;
      if (mt.startsWith('any except') || mt.startsWith('qualsiasi eccetto') || mt.startsWith('qualsiasi tranne')) return true;
      if (mt.startsWith('variabile')) return true; // Lycanthrope: varies by animal form = any
      return false;
    };

    // Build candidate pool: apply LOCATION filter first, then optionally TYPE filter
    // Fallback strategy: LOCATION+TYPE → LOCATION only → TYPE only → all valid
    const buildPool = (useLocation, useType) => {
      let pool = validMonsters.filter(m => m.adjustedHD >= hdMin && m.adjustedHD <= hdMax);
      
      // Step 1: Apply LOCATION filter first
      if (useLocation) {
        // Special case: Dungeon levels - filter by RC whitelist (exact name match) when available
        if (location === 'city' && CITY_WHITELIST.length > 0) {
          pool = pool.filter(m => {
            const name = (m.name ?? '').toLowerCase();
            return CITY_WHITELIST.some(w => {
              const kw = w.toLowerCase();
              const idx = name.indexOf(kw);
              if (idx === -1) return false;
              if (idx > 0 && /[a-zàáèéìíòóùú]/i.test(name[idx - 1])) return false;
              const after = idx + kw.length;
              if (after < name.length && /[a-zàáèéìíòóùú]/i.test(name[after])) return false;
              return true;
            });
          });
        } else if (location.startsWith('dungeon-') && DUNGEON_LEVEL_WHITELIST[location]) {
          const whitelist = DUNGEON_LEVEL_WHITELIST[location];
          // Use word-boundary matching: the keyword must appear at start of name or after a non-letter char
          // This prevents 'Goblin' from matching 'Hobgoblin', 'Orco' from matching 'Orchetto', etc.
          pool = pool.filter(m => {
            const name = (m.name ?? '').toLowerCase();
            return whitelist.some(w => {
              const kw = w.toLowerCase();
              const idx = name.indexOf(kw);
              if (idx === -1) return false;
              // Check character before match is not a letter (word boundary)
              if (idx > 0 && /[a-zàáèéìíòóùú]/i.test(name[idx - 1])) return false;
              // Check character after match is not a letter (trailing word boundary)
              const after = idx + kw.length;
              if (after < name.length && /[a-zàáèéìíòóùú]/i.test(name[after])) return false;
              return true;
            });
          });
        } else if (isAnyOnly) {
          pool = pool.filter(m => isAnyTerrain(m));
        } else if (isAnyNot) {
          pool = pool.filter(m => !isAnyTerrain(m));
        } else if (hasLocationFilter) {
          pool = pool.filter(m => this._terrainMatches(m.terrain, locationTerrains, LOCATION_TERRAIN_EXCLUDE[location] ?? []));
        }
      }

      // Step 1b: Apply per-location TYPE exclusions (e.g. no Normal Animal on elemental planes)
      // Applied unconditionally (even in fallback paths) to always enforce thematic restrictions
      if (LOCATION_TYPE_EXCLUDE[location]) {
        for (const rule of LOCATION_TYPE_EXCLUDE[location]) {
          pool = pool.filter(m => {
            const types = (m.monsterType ?? '').toLowerCase();
            if (!types.includes(rule.type.toLowerCase())) return true;
            const name = (m.name ?? '').toLowerCase();
            return rule.except.some(ex => name.includes(ex.toLowerCase()));
          });
        }
      }

      // Step 2: Apply TYPE filter
      if (useType) {
        pool = this._filterMonsters(pool, monsterType, rarity);
        
        // Special case: Riding animals (horses, mules, camels, etc.) - only allowed when monsterType is Animal or Normal Animal
        if (monsterType !== 'random' && monsterType !== 'Animal' && monsterType !== 'Normal Animal') {
          pool = pool.filter(m => {
            const name = (m.name || '').toLowerCase();
            return !(name.includes('horse') || name.includes('cavallo') || 
                     name.includes('pony') || name.includes('pony') ||
                     name.includes('mule') || name.includes('mulo') ||
                     name.includes('donkey') || name.includes('asino') ||
                     name.includes('camel') || name.includes('cammello') ||
                     name.includes('elephant') || name.includes('elefante'));
          });
        }
      }
      
      return pool;
    };

    let pool = buildPool(hasLocationFilter, hasTypeFilter);
    if (pool.length === 0 && hasTypeFilter && hasLocationFilter) {
      // Fallback 1: LOCATION only (ignore type)
      pool = buildPool(true, false);
    }
    if (pool.length === 0 && hasLocationFilter) {
      // Fallback 2: TYPE only (ignore location)
      pool = buildPool(false, true);
    }
    if (pool.length === 0) {
      // Fallback 3: no filters
      pool = buildPool(false, false);
    }

    let candidates = this._pickDistinct(pool, numGroups, targetHD);

    if (candidates.length === 0) {
      return { error: 'No monsters found matching the selected criteria and challenge level.' };
    }

    // Deduplicate by name (use let for retry loop)
    let unique = [];
    let seen = new Set();
    for (const c of candidates) {
      if (!seen.has(c.name)) { seen.add(c.name); unique.push(c); }
    }

    // Build encounter groups and validate against challenge target
    let groups = [];
    let totalAdjHD = 0;
    let pct = 0;
    let challengeResult = null;
    let isValidChallenge = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      groups = [];
      totalAdjHD = 0;

      for (const monster of unique) {
        const qty = this.adjustQuantity(monster, targetHD / unique.length, naMode);
        const groupHD = monster.adjustedHD * qty;
        totalAdjHD += groupHD;
        groups.push({ monster, qty, groupHD });
      }

      pct = tpl > 0 ? totalAdjHD / tpl : 0;
      challengeResult = this.getChallengeLabel(pct);

      if (challengeKey !== 'random' && challengeKey !== 'casual') {
        const requestedChallenge = CHALLENGE_TARGETS[challengeKey];
        if (requestedChallenge) {
          const tolerance = 0.10;
          const minAllowed = requestedChallenge.min * (1 - tolerance);
          const maxAllowed = requestedChallenge.max * (1 + tolerance);
          isValidChallenge = pct >= minAllowed && pct <= maxAllowed;

          if (!isValidChallenge && attempts < maxAttempts) {
            if (pct < minAllowed) targetHD *= 1.2;
            else if (pct > maxAllowed) targetHD *= 0.8;
            // Re-pick with adjusted targetHD using same pool strategy
            let retryPool = buildPool(hasLocationFilter, hasTypeFilter);
            if (retryPool.length === 0 && hasTypeFilter && hasLocationFilter) retryPool = buildPool(true, false);
            if (retryPool.length === 0 && hasLocationFilter) retryPool = buildPool(false, true);
            if (retryPool.length === 0) retryPool = buildPool(false, false);
            candidates = this._pickDistinct(retryPool, numGroups, targetHD);
            unique.length = 0;
            seen.clear();
            for (const c of candidates) {
              if (!seen.has(c.name)) { seen.add(c.name); unique.push(c); }
            }
          } else {
            isValidChallenge = true;
          }
        } else {
          isValidChallenge = true;
        }
      } else {
        isValidChallenge = true;
      }

      attempts++;
    } while (!isValidChallenge && attempts < maxAttempts);

    console.log(`[ENCOUNTER] location=${location} | naMode=${naMode} | type=${monsterType??'any'} | rarity=${rarity??'any'} | challenge=${challengeResult?.key} | pct=${(pct*100).toFixed(0)}% | groups=${groups.length}`);
    groups.forEach((g, i) => console.log(`  [G${i+1}] ${g.monster?.name} x${g.qty} | type=${g.monster?.monsterType} | terrain="${g.monster?.terrain}" | HD=${g.monster?.hd} | adjHD=${g.monster?.adjustedHD}`));

    return {
      groups,
      totalAdjHD,
      tpl,
      baseTpl,
      realTPL,
      tplNote: note,
      pct,
      challengeResult,
      color: CHALLENGE_COLORS[challengeResult.key] ?? '#888'
    };
  }

  // ── Filter helpers ────────────────────────────────────────────────────────────
  static _filterMonsters(pool, monsterType, rarity) {
    let filtered = pool;
    if (monsterType && monsterType !== 'random') {
      // Translate Italian monsterType to English for filtering
      const englishType = this._getEnglishMonsterType(monsterType);
      // Exact match OR compound type that starts with the selected type followed by ", "
      // e.g. selecting "Monster" matches "Monster", "Monster, Enchanted", "Monster, Dragon-Kin"
      // but NOT "Planar Monster" or "Humanoid" when selecting "Human"
      filtered = filtered.filter(m => {
        // Normalize monster type from compendium (handles Italian types)
        const normalizedType = this._normalizeMonsterType(m.monsterType);
        const mt = (normalizedType ?? '').trim();
        return mt === englishType || mt.startsWith(englishType + ', ');
      });
    }
    if (rarity && rarity !== 'random') {
      const rarityLower = rarity.toLowerCase();
      filtered = filtered.filter(m => (m.rarity || '').toLowerCase() === rarityLower);
    }
    return filtered;
  }

  static _pickRandom(pool, count, targetHD) {
    return this._pickDistinct(pool, count, targetHD);
  }

  // Pick N distinct monsters. Weighted toward targetHD/N proximity but with randomness.
  static _pickDistinct(pool, count, targetHD) {
    if (pool.length === 0) return [];
    const n = Math.min(count, pool.length);
    const hdPerSlot = targetHD / n;

    // Assign weight: inverse of distance to hdPerSlot (closer = higher weight)
    // Use dist+1 with minimum 0.3 to keep reasonable variety (not too skewed toward exact HD)
    const weighted = pool.map(m => {
      const dist = Math.abs(m.adjustedHD - hdPerSlot);
      return { m, w: Math.max(0.3, 1 / (dist + 1)) };
    });

    // Weighted random pick without replacement
    const picked = [];
    const used = new Set();
    const available = [...weighted];

    while (picked.length < n && available.length > 0) {
      const total = available.reduce((s, e) => s + e.w, 0);
      let r = Math.random() * total;
      let idx = 0;
      for (let i = 0; i < available.length; i++) {
        r -= available[i].w;
        if (r <= 0) { idx = i; break; }
      }
      const entry = available[idx];
      if (!used.has(entry.m.name)) {
        used.add(entry.m.name);
        picked.push(entry.m);
      }
      available.splice(idx, 1);
    }
    return picked;
  }
}

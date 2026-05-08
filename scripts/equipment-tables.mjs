/**
 * Embedded Equipment Tables - Extracted from JSON roll tables
 * These tables are embedded in the module to avoid dependency on world roll tables
 * Tabelle Equipaggiamento Incorporate - Estratte da roll tables JSON
 * Queste tabelle sono incorporate nel modulo per evitare dipendenze dalle roll table del mondo
 */

// Helper to roll dice and get result from table - Helper per tirare i dadi e ottenere il risultato dalla tabella
export function rollOnTable(table) {
  const max = table.results.length;
  const roll = Math.floor(Math.random() * max);
  return table.results[roll];
}

// Bardo Strumenti Musicali (1d5) - Bard Musical Instruments (1d5)
export const BARDO_STRUMENTI = {
  name: 'Bardo Strumenti Musicali',
  formula: '1d5',
  results: [
    { name: 'Liuto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.SUoTA0yuWhZliNth' }, // Liuto
    { name: 'Flauto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.kdrx5M5qRUaYsJ9d' }, // Flauto
    { name: 'Arpa', uuid: 'Compendium.fade-compendiums.item-compendium.Item.o9vUy5yTb5ZbXQ1R' }, // Arpa
    { name: 'Fischietto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.1XXXTJP9Gmy4Uwrz' }, // Fischietto
    { name: 'Tamburo a mano', uuid: 'Compendium.fade-compendiums.item-compendium.Item.8f0Xsf5LakPG5ucZ' } // Tamburo a mano
  ]
};

// Bardo Armature (1d3) - Bard Armor (1d3)
export const BARDO_ARMATURE = {
  name: 'Bardo Armature',
  formula: '1d3',
  results: [
    { name: 'Armatura in cuoio', uuid: 'Compendium.fade-compendiums.item-compendium.Item.HcStaQSC3tAeJT1C' }, // Armatura in cuoio
    { name: 'Armatura a scaglie', uuid: 'Compendium.fade-compendiums.item-compendium.Item.HxBTw4p6CwLy703a' }, // Armatura a scaglie
    { name: 'Corazza di Maglia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.47MfICXoT0XOwcW7' } // Corazza di Maglia
  ]
};

// Armature generiche (1d8) - Generic Armor (1d8)
export const ARMATURE_GENERICHE = {
  name: 'Armature',
  formula: '1d8',
  results: [
    { name: 'Armatura Completa', uuid: 'Compendium.fade-compendiums.item-compendium.Item.29ttaX3ylwM3i2bQ' }, // Armatura Completa
    { name: 'Corazza di Maglia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.47MfICXoT0XOwcW7' }, // Corazza di Maglia
    { name: 'Corazza di piastre', uuid: 'Compendium.fade-compendiums.item-compendium.Item.4b2QGYNizDX7U82Q' }, // Corazza di piastre
    { name: 'Armatura in cuoio', uuid: 'Compendium.fade-compendiums.item-compendium.Item.HcStaQSC3tAeJT1C' }, // Armatura in cuoio
    { name: 'Armatura a scaglie', uuid: 'Compendium.fade-compendiums.item-compendium.Item.HxBTw4p6CwLy703a' }, // Armatura a scaglie
    { name: 'Corazza a Bande', uuid: 'Compendium.fade-compendiums.item-compendium.Item.vkFhqOwbeQJRupoe' }, // Corazza a Bande
    { name: 'Corazza a Bande', uuid: 'Compendium.fade-compendiums.item-compendium.Item.vkFhqOwbeQJRupoe' }, // Corazza a Bande (duplicate for weight)
    { name: 'Corazza a Bande', uuid: 'Compendium.fade-compendiums.item-compendium.Item.vkFhqOwbeQJRupoe' } // Corazza a Bande (duplicate for weight)
  ]
};

// Bardo Armi (1d40) - subset of most common weapons - Bard Weapons (1d40) - sottoinsieme delle armi più comuni
export const BARDO_ARMI = {
  name: 'Bardo Armi',
  formula: '1d40',
  results: [
    { name: 'Arco Lungo', uuid: 'Compendium.fade-compendiums.item-compendium.Item.0Jf2W2MElEhO23aX' }, // Arco Lungo
    { name: 'Giavellotto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.4PRKm7wgHL8tjrkB' }, // Giavellotto
    { name: 'Bola', uuid: 'Compendium.fade-compendiums.item-compendium.Item.4u775b0uMAQXFZp4' }, // Bola
    { name: 'Spada Corta', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5Ymnj5Zixi4qy6r3' }, // Spada Corta
    { name: 'Balestra Pesante', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5gDDZa2XZlNIhC11' }, // Balestra Pesante
    { name: 'Clava', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5n7QCvFzIN0lACPa' }, // Clava
    { name: 'Mazza', uuid: 'Compendium.fade-compendiums.item-compendium.Item.BPEBQB0DJ9Vm4E5A' }, // Mazza
    { name: 'Arco Corto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.CnlBl1rnFo1yEYZE' }, // Arco Corto
    { name: 'Balestra Leggera', uuid: 'Compendium.fade-compendiums.item-compendium.Item.F9MPYJFMoaKIuqeW' }, // Balestra Leggera
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' }, // Pugnale
    { name: 'Martello da lancio', uuid: 'Compendium.fade-compendiums.item-compendium.Item.HkT7WoeYJNCRi5JJ' }, // Martello da lancio
    { name: 'Martello da guerra', uuid: 'Compendium.fade-compendiums.item-compendium.Item.JbGxnUvAzBMKZuBX' }, // Martello da guerra
    { name: 'Accetta', uuid: 'Compendium.fade-compendiums.item-compendium.Item.KlE02jJDCz0W1OGA' }, // Accetta
    { name: 'Colpo senz\'armi', uuid: 'Compendium.fade-compendiums.item-compendium.Item.M3tlcSo9qIaqTad9' }, // Colpo senz'armi
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' }, // Spada (Long Sword)
    { name: 'Cerbottana Lunga', uuid: 'Compendium.fade-compendiums.item-compendium.Item.QlObHB7jky1RjHZf' }, // Cerbottana Lunga
    { name: 'Rete', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Uk3DSMfHhqPfh8AX' }, // Rete
    { name: 'Alabarda', uuid: 'Compendium.fade-compendiums.item-compendium.Item.2UWnXlZ2iehdlsuM' }, // Alabarda
    { name: 'Cerbottana Corta', uuid: 'Compendium.fade-compendiums.item-compendium.Item.YWqiQwzhVvxa35sU' }, // Cerbottana Corta
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' }, // Spada Bastarda (1M)
    { name: 'Scudo Appuntito', uuid: 'Compendium.fade-compendiums.item-compendium.Item.c1Pb7jq7pyg6uRn6' }, // Scudo Appuntito
    { name: 'Scudo Dentato', uuid: 'Compendium.fade-compendiums.item-compendium.Item.hShLOFsdthE8CIwc' }, // Scudo Dentato
    { name: 'Scudo Lanceolato', uuid: 'Compendium.fade-compendiums.item-compendium.Item.hzYAVJ6gLy56aebO' }, // Scudo Lanceolato
    { name: 'Fionda', uuid: 'Compendium.fade-compendiums.item-compendium.Item.mvbNrNhrCVQQy1BZ' }, // Fionda
    { name: 'Torcia (arma)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.qPeZPA3sF6rYkRAn' }, // Torcia (arma)
    { name: 'Scudo Laminato', uuid: 'Compendium.fade-compendiums.item-compendium.Item.qfCLTbwrUKRukz0d' }, // Scudo Laminato
    { name: 'Lancia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tfbRwWqAkCsIotTj' }, // Lancia
    { name: 'Frusta (3m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.trqy75Hh1uGnGQGk' }, // Frusta (3m)
    { name: 'Tridente', uuid: 'Compendium.fade-compendiums.item-compendium.Item.yxTxTKRhWTzhjYZu' }, // Tridente
    { name: 'Cestus', uuid: 'Compendium.fade-compendiums.item-compendium.Item.zuJutH4zGWRzZltK' }, // Cestus
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' }, // Duplicate for weight
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' }, // Duplicate
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' }, // Duplicate
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' }, // Duplicate
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' }, // Duplicate
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' }, // Duplicate
    { name: 'Clava', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5n7QCvFzIN0lACPa' }, // Duplicate
    { name: 'Clava', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5n7QCvFzIN0lACPa' }, // Duplicate
    { name: 'Clava', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5n7QCvFzIN0lACPa' }  // Duplicate
  ]
};

// Oggetti Extra (1d5) - usata da molte classi - Extra Items (1d5) - used by many classes
export const OGGETTI_EXTRA = {
  name: 'Oggetti Extra',
  formula: '1d5',
  results: [
    { name: 'Lanterna', uuid: 'Compendium.fade-compendiums.item-compendium.Item.vs1ucOaQKntekMID' }, // Lanterna
    { name: 'Sacco grande', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tRQlGfEauWD1j23t' }, // Sacco grande
    { name: 'Specchio', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5X6vLlD4YqWgVneV' }, // Specchio
    { name: 'Erbe anti-licantropi', uuid: 'Compendium.fade-compendiums.item-compendium.Item.DFoya9vSgnbmv714' }, // Erbe anti-licantropi
    { name: 'Sacco piccolo', uuid: 'Compendium.fade-compendiums.item-compendium.Item.I6Zxfqz3WklDdNBm' } // Sacco piccolo
  ]
};

// Chierico Armi (1d40) - solo armi permesse al chierico - Cleric Weapons (1d40) - only cleric-permitted weapons
export const CHIERICO_ARMI = {
  name: 'Chierico Armi',
  formula: '1d40',
  results: [
    { name: 'Clava', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5n7QCvFzIN0lACPa' }, // Clava
    { name: 'Mazza', uuid: 'Compendium.fade-compendiums.item-compendium.Item.BPEBQB0DJ9Vm4E5A' }, // Mazza
    { name: 'Martello da lancio', uuid: 'Compendium.fade-compendiums.item-compendium.Item.HkT7WoeYJNCRi5JJ' }, // Martello da lancio
    { name: 'Martello da guerra', uuid: 'Compendium.fade-compendiums.item-compendium.Item.JbGxnUvAzBMKZuBX' }, // Martello da guerra
    // Riproduci il peso - le armi permesse sono poche
    { name: 'Clava', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5n7QCvFzIN0lACPa' },
    { name: 'Mazza', uuid: 'Compendium.fade-compendiums.item-compendium.Item.BPEBQB0DJ9Vm4E5A' },
    { name: 'Martello da guerra', uuid: 'Compendium.fade-compendiums.item-compendium.Item.JbGxnUvAzBMKZuBX' },
    { name: 'Clava', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5n7QCvFzIN0lACPa' },
    { name: 'Mazza', uuid: 'Compendium.fade-compendiums.item-compendium.Item.BPEBQB0DJ9Vm4E5A' },
    { name: 'Martello da guerra', uuid: 'Compendium.fade-compendiums.item-compendium.Item.JbGxnUvAzBMKZuBX' }
  ]
};

// Elfo Armi (1d7) - preferenza per arco lungo, lancia e spade - Elf Weapons (1d7) - preference for long bow, spear, and swords
export const ELFO_ARMI = {
  name: 'Elfo Armi',
  formula: '1d7',
  results: [
    { name: 'Arco Lungo', uuid: 'Compendium.fade-compendiums.item-compendium.Item.0Jf2W2MElEhO23aX' }, // Arco Lungo (1-1)
    { name: 'Spada Bastarda (2M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.9fob9ePbWx5SsdkS' }, // Spada Bastarda (2M) (2-2)
    { name: 'Arco Corto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.CnlBl1rnFo1yEYZE' }, // Arco Corto (3-3)
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' }, // Pugnale (4-4)
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' }, // Spada (5-5)
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' }, // Spada Bastarda (1M) (6-6)
    // Lancia ha range 7-20 (14/20 = 70% probabilità) - duplicata 14 volte
    { name: 'Lancia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tfbRwWqAkCsIotTj' },
    { name: 'Lancia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tfbRwWqAkCsIotTj' },
    { name: 'Lancia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tfbRwWqAkCsIotTj' },
    { name: 'Lancia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tfbRwWqAkCsIotTj' },
    { name: 'Lancia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tfbRwWqAkCsIotTj' },
    { name: 'Lancia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tfbRwWqAkCsIotTj' }
  ]
};

// Guerriero Armi (1d99) - Full table from original fvtt-RollTable-guerriero-armi-NIkz6w1qZVEVbAPr.json - Fighter Weapons (1d99) - Tabella completa dall'originale
export const GUERRIERO_ARMI = {
  name: 'Guerriero Armi',
  formula: '1d99',
  results: [
    { name: 'Arco Lungo', uuid: 'Compendium.fade-compendiums.item-compendium.Item.0Jf2W2MElEhO23aX' },
    { name: 'Alabarda', uuid: 'Compendium.fade-compendiums.item-compendium.Item.2UWnXlZ2iehdlsuM' },
    { name: 'Giavellotto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.4PRKm7wgHL8tjrkB' },
    { name: 'Bola', uuid: 'Compendium.fade-compendiums.item-compendium.Item.4u775b0uMAQXFZp4' },
    { name: 'Spada Corta', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5Ymnj5Zixi4qy6r3' },
    { name: 'Balestra Pesante', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5gDDZa2XZlNIhC11' },
    { name: 'Clava', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5n7QCvFzIN0lACPa' },
    { name: 'Spada Bastarda (2M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.9fob9ePbWx5SsdkS' },
    { name: 'Bastone Ferrato', uuid: 'Compendium.fade-compendiums.item-compendium.Item.A4nQHbJt1qy5ByzL' },
    { name: 'Mazza', uuid: 'Compendium.fade-compendiums.item-compendium.Item.BPEBQB0DJ9Vm4E5A' },
    { name: 'Arco Corto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.CnlBl1rnFo1yEYZE' },
    { name: 'Arco Corto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.CnlBl1rnFo1yEYZE' },
    { name: 'Arco Corto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.CnlBl1rnFo1yEYZE' },
    { name: 'Arco Corto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.CnlBl1rnFo1yEYZE' },
    { name: 'Arco Corto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.CnlBl1rnFo1yEYZE' },
    { name: 'Balestra Leggera', uuid: 'Compendium.fade-compendiums.item-compendium.Item.F9MPYJFMoaKIuqeW' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Martello da lancio', uuid: 'Compendium.fade-compendiums.item-compendium.Item.HkT7WoeYJNCRi5JJ' },
    { name: 'Martello da guerra', uuid: 'Compendium.fade-compendiums.item-compendium.Item.JbGxnUvAzBMKZuBX' },
    { name: 'Accetta', uuid: 'Compendium.fade-compendiums.item-compendium.Item.KlE02jJDCz0W1OGA' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Rete (1.8 m x 1.8 m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.P1Kk60QR6X1bRO0H' },
    { name: 'Pugnale d\'argento', uuid: 'Compendium.fade-compendiums.item-compendium.Item.RhnuhtdZ2c0oJr6f' },
    { name: 'Manganello', uuid: 'Compendium.fade-compendiums.item-compendium.Item.RksAN1Xa2JeKa7Im' },
    { name: 'Cerbottana Lunga', uuid: 'Compendium.fade-compendiums.item-compendium.Item.SukXJbCes7SWyoC3' },
    { name: 'Picca', uuid: 'Compendium.fade-compendiums.item-compendium.Item.UV2uwnF90kcSTHnz' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Cerbottana Corta', uuid: 'Compendium.fade-compendiums.item-compendium.Item.YWqiQwzhVvxa35sU' },
    { name: 'Ascia Lunga a 2-mani', uuid: 'Compendium.fade-compendiums.item-compendium.Item.bdF776Lh1mZnFNEa' },
    { name: 'Ascia da Battaglia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.cmPtfMLPOc8Qdt2X' },
    { name: 'Ascia da Battaglia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.cmPtfMLPOc8Qdt2X' },
    { name: 'Ascia da Battaglia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.cmPtfMLPOc8Qdt2X' },
    { name: 'Ascia da Battaglia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.cmPtfMLPOc8Qdt2X' },
    { name: 'Ascia da Battaglia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.cmPtfMLPOc8Qdt2X' },
    { name: 'Ascia da Battaglia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.cmPtfMLPOc8Qdt2X' },
    { name: 'Ascia da Battaglia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.cmPtfMLPOc8Qdt2X' },
    { name: 'Ascia da Battaglia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.cmPtfMLPOc8Qdt2X' },
    { name: 'Ascia da Battaglia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.cmPtfMLPOc8Qdt2X' },
    { name: 'Ascia da Battaglia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.cmPtfMLPOc8Qdt2X' },
    { name: 'Lancia da cavaliere', uuid: 'Compendium.fade-compendiums.item-compendium.Item.gUUAH9zgkDIZn6FS' },
    { name: 'Arma Lunga', uuid: 'Compendium.fade-compendiums.item-compendium.Item.mFSAYtVaXT97kV7F' },
    { name: 'Fionda', uuid: 'Compendium.fade-compendiums.item-compendium.Item.mvbNrNhrCVQQy1BZ' },
    { name: 'Torcia (arma)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.qPeZPA3sF6rYkRAn' },
    { name: 'Lancia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tfbRwWqAkCsIotTj' },
    { name: 'Frusta (3m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.trqy75Hh1uGnGQGk' },
    { name: 'Tridente', uuid: 'Compendium.fade-compendiums.item-compendium.Item.yxTxTKRhWTzhjYZu' },
    { name: 'Spadone a 2 mani', uuid: 'Compendium.fade-compendiums.item-compendium.Item.zCLw6dqJW8j5LITE' },
    { name: 'Spadone a 2 mani', uuid: 'Compendium.fade-compendiums.item-compendium.Item.zCLw6dqJW8j5LITE' },
    { name: 'Spadone a 2 mani', uuid: 'Compendium.fade-compendiums.item-compendium.Item.zCLw6dqJW8j5LITE' },
    { name: 'Spadone a 2 mani', uuid: 'Compendium.fade-compendiums.item-compendium.Item.zCLw6dqJW8j5LITE' },
    { name: 'Spadone a 2 mani', uuid: 'Compendium.fade-compendiums.item-compendium.Item.zCLw6dqJW8j5LITE' },
    { name: 'Spadone a 2 mani', uuid: 'Compendium.fade-compendiums.item-compendium.Item.zCLw6dqJW8j5LITE' },
    { name: 'Spadone a 2 mani', uuid: 'Compendium.fade-compendiums.item-compendium.Item.zCLw6dqJW8j5LITE' },
    { name: 'Spadone a 2 mani', uuid: 'Compendium.fade-compendiums.item-compendium.Item.zCLw6dqJW8j5LITE' },
    { name: 'Spadone a 2 mani', uuid: 'Compendium.fade-compendiums.item-compendium.Item.zCLw6dqJW8j5LITE' },
    { name: 'Spadone a 2 mani', uuid: 'Compendium.fade-compendiums.item-compendium.Item.zCLw6dqJW8j5LITE' },
    { name: 'Cestus', uuid: 'Compendium.fade-compendiums.item-compendium.Item.zuJutH4zGWRzZltK' }
  ]
};

// Druido Armatura (1d3) - Solo armatura in cuoio - Druid Armor (1d3) - Only leather armor
export const DRUIDO_ARMATURA = {
  name: 'Druido Armatura',
  formula: '1d3',
  results: [
    { name: 'Armatura in cuoio', uuid: 'Compendium.fade-compendiums.item-compendium.Item.HcStaQSC3tAeJT1C' },
    { name: 'Armatura in cuoio', uuid: 'Compendium.fade-compendiums.item-compendium.Item.HcStaQSC3tAeJT1C' },
    { name: 'Armatura in cuoio', uuid: 'Compendium.fade-compendiums.item-compendium.Item.HcStaQSC3tAeJT1C' }
  ]
};

// Druido Armi (1d7) - Druid Weapons (1d7)
export const DRUIDO_ARMI = {
  name: 'Druido Armi',
  formula: '1d7',
  results: [
    { name: 'Clava', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5n7QCvFzIN0lACPa' },
    { name: 'Mazza', uuid: 'Compendium.fade-compendiums.item-compendium.Item.BPEBQB0DJ9Vm4E5A' },
    { name: 'Manganello', uuid: 'Compendium.fade-compendiums.item-compendium.Item.RksAN1Xa2JeKa7Im' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Dardo', uuid: 'Compendium.fade-compendiums.item-compendium.Item.MN8mfWCkVUD9fyl4' },
    { name: 'Lancia', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tfbRwWqAkCsIotTj' },
    { name: 'Fionda', uuid: 'Compendium.fade-compendiums.item-compendium.Item.mvbNrNhrCVQQy1BZ' }
  ]
};

// Druido Oggetti Extra (1d7) - Druid Extra Items (1d7)
export const DRUIDO_OGGETTI_EXTRA = {
  name: 'Druido Oggetti Extra',
  formula: '1d7',
  results: [
    { name: 'Corda (15 m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.PIGV0RDZ6Bw4sCpz' },
    { name: 'Erbe anti-licantropi', uuid: 'Compendium.fade-compendiums.item-compendium.Item.DFoya9vSgnbmv714' },
    { name: 'Sacco grande', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tRQlGfEauWD1j23t' },
    { name: 'Sacco piccolo', uuid: 'Compendium.fade-compendiums.item-compendium.Item.I6Zxfqz3WklDdNBm' },
    { name: 'Erbe Curative', uuid: 'Compendium.fade-compendiums.item-compendium.Item.BDDCMSSrpdDTXYEF' },
    { name: 'Pozione di Guarigione', uuid: 'Compendium.fade-compendiums.item-compendium.Item.pEWiuVNkUrvzUgQP' },
    { name: 'Acqua Santa', uuid: 'Compendium.fade-compendiums.item-compendium.Item.s1s11fJBFHCA0FYg' }
  ]
};

// Paladino Oggetti Extra (1d11) - Paladin Extra Items (1d11)
export const PALADINO_OGGETTI_EXTRA = {
  name: 'Paladino Oggetti Extra',
  formula: '1d11',
  results: [
    { name: 'Acqua Santa', uuid: 'Compendium.fade-compendiums.item-compendium.Item.s1s11fJBFHCA0FYg' },
    { name: 'Aglio', uuid: 'Compendium.fade-compendiums.item-compendium.Item.I5JmOxCehtMX75FD' },
    { name: 'Corda (15 m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.PIGV0RDZ6Bw4sCpz' },
    { name: 'Erbe anti-licantropi', uuid: 'Compendium.fade-compendiums.item-compendium.Item.DFoya9vSgnbmv714' },
    { name: 'Lanterna', uuid: 'Compendium.fade-compendiums.item-compendium.Item.vs1ucOaQKntekMID' },
    { name: 'Pioli (3) e mazzuolo', uuid: 'Compendium.fade-compendiums.item-compendium.Item.qavU41BikY2s4bg7' },
    { name: 'Sacco grande', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tRQlGfEauWD1j23t' },
    { name: 'Sacco piccolo', uuid: 'Compendium.fade-compendiums.item-compendium.Item.I6Zxfqz3WklDdNBm' },
    { name: 'Specchio', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5X6vLlD4YqWgVneV' },
    { name: 'Erbe Curative', uuid: 'Compendium.fade-compendiums.item-compendium.Item.BDDCMSSrpdDTXYEF' },
    { name: 'Pozione di Guarigione', uuid: 'Compendium.fade-compendiums.item-compendium.Item.pEWiuVNkUrvzUgQP' }
  ]
};

// Guerriero Armi Scudo (1d4) - Scudi speciali per guerrieri - Fighter Shield Weapons (1d4) - Special shields for fighters
export const GUERRIERO_ARMI_SCUDO = {
  name: 'Guerriero Armi Scudo',
  formula: '1d4',
  results: [
    { name: 'Scudo Appuntito', uuid: 'Compendium.fade-compendiums.item-compendium.Item.c1Pb7jq7pyg6uRn6' },
    { name: 'Scudo Dentato', uuid: 'Compendium.fade-compendiums.item-compendium.Item.hShLOFsdthE8CIwc' },
    { name: 'Scudo Lanceolato', uuid: 'Compendium.fade-compendiums.item-compendium.Item.hzYAVJ6gLy56aebO' },
    { name: 'Scudo Laminato', uuid: 'Compendium.fade-compendiums.item-compendium.Item.qfCLTbwrUKRukz0d' }
  ]
};

// Scudi (1d4) - Scudo base - Shields (1d4) - Base shield
export const SCUDI = {
  name: 'Scudi',
  formula: '1d4',
  results: [
    { name: 'Scudo', uuid: 'Compendium.fade-compendiums.item-compendium.Item.efbE0gN8tqL8K94z' },
    { name: '', uuid: '' }, // vuoto
    { name: '', uuid: '' }, // vuoto
    { name: '', uuid: '' }  // vuoto
  ]
};

// Chierico Armi Extra (1d40) - Cleric Extra Weapons (1d40)
export const CHIERICO_ARMI_EXTRA = {
  name: 'Chierico Armi Extra',
  formula: '1d40',
  results: [
    { name: 'Bola', uuid: 'Compendium.fade-compendiums.item-compendium.Item.4u775b0uMAQXFZp4' },
    { name: 'Bastone Ferrato', uuid: 'Compendium.fade-compendiums.item-compendium.Item.A4nQHbJt1qy5ByzL' },
    { name: 'Rete (1.8 m x 1.8 m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.P1Kk60QR6X1bRO0H' },
    { name: 'Manganello', uuid: 'Compendium.fade-compendiums.item-compendium.Item.RksAN1Xa2JeKa7Im' },
    { name: 'Cerbottana Corta', uuid: 'Compendium.fade-compendiums.item-compendium.Item.YWqiQwzhVvxa35sU' },
    { name: 'Fionda', uuid: 'Compendium.fade-compendiums.item-compendium.Item.mvbNrNhrCVQQy1BZ' },
    { name: 'Torcia (arma)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.qPeZPA3sF6rYkRAn' },
    { name: 'Frusta (3m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.trqy75Hh1uGnGQGk' },
    { name: 'Colpo senz\'armi', uuid: 'Compendium.fade-compendiums.item-compendium.Item.M3tlcSo9qIaqTad9' }
  ]
};

// Chierico Oggetti Extra (1d9) - Cleric Extra Items (1d9)
export const CHIERICO_OGGETTI_EXTRA = {
  name: 'Chierico Oggetti Extra',
  formula: '1d9',
  results: [
    { name: 'Aglio', uuid: 'Compendium.fade-compendiums.item-compendium.Item.I5JmOxCehtMX75FD' },
    { name: 'Acqua Santa', uuid: 'Compendium.fade-compendiums.item-compendium.Item.s1s11fJBFHCA0FYg' },
    { name: 'Erbe anti-licantropi', uuid: 'Compendium.fade-compendiums.item-compendium.Item.DFoya9vSgnbmv714' },
    { name: 'Lanterna', uuid: 'Compendium.fade-compendiums.item-compendium.Item.vs1ucOaQKntekMID' },
    { name: 'Pioli (3) e mazzuolo', uuid: 'Compendium.fade-compendiums.item-compendium.Item.qavU41BikY2s4bg7' },
    { name: 'Kit del Guaritore', uuid: 'Compendium.fade-compendiums.item-compendium.Item.acFVqCl0CMgg1R4W' },
    { name: 'Kit da Guaritore', uuid: 'Compendium.fade-compendiums.item-compendium.Item.bnP90iLwYpOQmJ4Z' },
    { name: 'Erbe Curative', uuid: 'Compendium.fade-compendiums.item-compendium.Item.BDDCMSSrpdDTXYEF' },
    { name: 'Pozione di Guarigione', uuid: 'Compendium.fade-compendiums.item-compendium.Item.pEWiuVNkUrvzUgQP' }
  ]
};

// Bardo Oggetti Extra (1d5) - Bard Extra Items (1d5)
export const BARDO_OGGETTI_EXTRA = {
  name: 'Bardo Oggetti Extra',
  formula: '1d5',
  results: [
    { name: 'Corda (15 m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.PIGV0RDZ6Bw4sCpz' },
    { name: 'Lente d\'ingrandimento', uuid: 'Compendium.fade-compendiums.item-compendium.Item.i2dMLIYGO8YRdhNO' },
    { name: 'Pertica (3m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.6DuXn1pQ8PmlyeAu' },
    { name: 'Rampino', uuid: 'Compendium.fade-compendiums.item-compendium.Item.HyFvaeMYhC2zDqb5' },
    { name: 'Vino', uuid: 'Compendium.fade-compendiums.item-compendium.Item.BripOKg5o8sJn1Fu' }
  ]
};

// Ladro Armi (1d12) - Thief Weapons (1d12)
export const LADRO_ARMI = {
  name: 'Ladro Armi',
  formula: '1d14',
  results: [
    { name: 'Arco Lungo', uuid: 'Compendium.fade-compendiums.item-compendium.Item.0Jf2W2MElEhO23aX' },
    { name: 'Giavellotto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.4PRKm7wgHL8tjrkB' },
    { name: 'Bola', uuid: 'Compendium.fade-compendiums.item-compendium.Item.4u775b0uMAQXFZp4' },
    { name: 'Spada Corta', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5Ymnj5Zixi4qy6r3' },
    { name: 'Balestra Pesante', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5gDDZa2XZlNIhC11' },
    { name: 'Clava', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5n7QCvFzIN0lACPa' },
    { name: 'Mazza', uuid: 'Compendium.fade-compendiums.item-compendium.Item.BPEBQB0DJ9Vm4E5A' },
    { name: 'Arco Corto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.CnlBl1rnFo1yEYZE' },
    { name: 'Balestra Leggera', uuid: 'Compendium.fade-compendiums.item-compendium.Item.F9MPYJFMoaKIuqeW' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Manganello', uuid: 'Compendium.fade-compendiums.item-compendium.Item.RksAN1Xa2JeKa7Im' },
    { name: 'Spada', uuid: 'Compendium.fade-compendiums.item-compendium.Item.OZA38dJ95QpcLMxh' },
    { name: 'Spada Bastarda (1M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.Y1BN5kWs27xDnOaq' },
    { name: 'Fionda', uuid: 'Compendium.fade-compendiums.item-compendium.Item.mvbNrNhrCVQQy1BZ' }
  ]
};

// Ladro Oggetti Casuali (1d7) - Thief Random Items (1d7)
export const LADRO_OGGETTI_CASUALI = {
  name: 'Ladro Oggetti Casuali',
  formula: '1d7',
  results: [
    { name: 'Corda (15 m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.PIGV0RDZ6Bw4sCpz' },
    { name: 'Pertica (3m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.6DuXn1pQ8PmlyeAu' },
    { name: 'Rampino', uuid: 'Compendium.fade-compendiums.item-compendium.Item.HyFvaeMYhC2zDqb5' },
    { name: 'Martello Piccolo', uuid: 'Compendium.fade-compendiums.item-compendium.Item.xode7LpmMtiBMy7U' },
    { name: 'Triboli (sacco da 20)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.LcV7QDgIcp6NWmFE' },
    { name: 'Mantello Lungo', uuid: 'Compendium.fade-compendiums.item-compendium.Item.4eM4HGzF2K7IK6P6' },
    { name: 'Porta Pergamena', uuid: 'Compendium.fade-compendiums.item-compendium.Item.JAzMmjQmuTEoy9L9' }
  ]
};

// Mago Armi (1d21) - Magic-User Weapons (1d21)
export const MAGO_ARMI = {
  name: 'Mago Armi',
  formula: '1d6',
  results: [
    { name: 'Fionda', uuid: 'Compendium.fade-compendiums.item-compendium.Item.mvbNrNhrCVQQy1BZ' },
    { name: 'Bastone Ferrato', uuid: 'Compendium.fade-compendiums.item-compendium.Item.A4nQHbJt1qy5ByzL' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' }
  ]
};

// Mago Oggetti Extra (1d9) - Magic-User Extra Items (1d9)
export const MAGO_OGGETTI_EXTRA = {
  name: 'Mago Oggetti Extra',
  formula: '1d9',
  results: [
    { name: 'Boccetta d\'inchiostro', uuid: 'Compendium.fade-compendiums.item-compendium.Item.rSvhFj4XuO1ihVIk' },
    { name: 'Borsa da cintura', uuid: 'Compendium.fade-compendiums.item-compendium.Item.uPzYlqM0twcQMGsM' },
    { name: 'Foglio di carta', uuid: 'Compendium.fade-compendiums.item-compendium.Item.c3K7FQMsMFqwELcl' },
    { name: 'Lanterna', uuid: 'Compendium.fade-compendiums.item-compendium.Item.vs1ucOaQKntekMID' },
    { name: 'Lente d\'ingrandimento', uuid: 'Compendium.fade-compendiums.item-compendium.Item.i2dMLIYGO8YRdhNO' },
    { name: 'Penna', uuid: 'Compendium.fade-compendiums.item-compendium.Item.fllzf2TGXt1KEs5F' },
    { name: 'Sacco grande', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tRQlGfEauWD1j23t' },
    { name: 'Fiala (vetro)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.xMQb13coGHtt8Zos' },
    { name: 'Porta Pergamena', uuid: 'Compendium.fade-compendiums.item-compendium.Item.JAzMmjQmuTEoy9L9' }
  ]
};

// Elfo Oggetti Extra (1d3) - Elf Extra Items (1d3)
export const ELFO_OGGETTI_EXTRA = {
  name: 'Elfo Oggetti Extra',
  formula: '1d3',
  results: [
    { name: 'Corda (15 m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.PIGV0RDZ6Bw4sCpz' },
    { name: 'Sacco grande', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tRQlGfEauWD1j23t' },
    { name: 'Specchio', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5X6vLlD4YqWgVneV' }
  ]
};

// Halfling Armi (1d6) - Halfling Weapons (1d6)
export const HALFLING_ARMI = {
  name: 'Halfling Armi',
  formula: '1d7',
  results: [
    { name: 'Bola', uuid: 'Compendium.fade-compendiums.item-compendium.Item.4u775b0uMAQXFZp4' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Manganello', uuid: 'Compendium.fade-compendiums.item-compendium.Item.RksAN1Xa2JeKa7Im' },
    { name: 'Balestra Leggera', uuid: 'Compendium.fade-compendiums.item-compendium.Item.F9MPYJFMoaKIuqeW' },
    { name: 'Cerbottana Corta', uuid: 'Compendium.fade-compendiums.item-compendium.Item.YWqiQwzhVvxa35sU' },
    { name: 'Fionda', uuid: 'Compendium.fade-compendiums.item-compendium.Item.mvbNrNhrCVQQy1BZ' },
    { name: 'Arco Corto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.CnlBl1rnFo1yEYZE' }
  ]
};

// Halfling Oggetti Extra (1d5) - Halfling Extra Items (1d5)
export const HALFLING_OGGETTI_EXTRA = {
  name: 'Halfling Oggetti Extra',
  formula: '1d5',
  results: [
    { name: 'Vino', uuid: 'Compendium.fade-compendiums.item-compendium.Item.BripOKg5o8sJn1Fu' },
    { name: 'Fischietto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.1XXXTJP9Gmy4Uwrz' },
    { name: 'Mantello Corto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.uX7HhwcR6lq92Te0' },
    { name: 'Borsa da cintura', uuid: 'Compendium.fade-compendiums.item-compendium.Item.uPzYlqM0twcQMGsM' },
    { name: 'Corda (15 m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.PIGV0RDZ6Bw4sCpz' }
  ]
};

// Nano Armi (1d10) - Dwarf Weapons (1d10)
export const NANO_ARMI = {
  name: 'Nano Armi',
  formula: '1d10',
  results: [
    { name: 'Bola', uuid: 'Compendium.fade-compendiums.item-compendium.Item.4u775b0uMAQXFZp4' },
    { name: 'Spada Corta', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5Ymnj5Zixi4qy6r3' },
    { name: 'Balestra Pesante', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5gDDZa2XZlNIhC11' },
    { name: 'Clava', uuid: 'Compendium.fade-compendiums.item-compendium.Item.5n7QCvFzIN0lACPa' },
    { name: 'Spada Bastarda (2M)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.9fob9ePbWx5SsdkS' },
    { name: 'Mazza', uuid: 'Compendium.fade-compendiums.item-compendium.Item.BPEBQB0DJ9Vm4E5A' },
    { name: 'Arco Corto', uuid: 'Compendium.fade-compendiums.item-compendium.Item.CnlBl1rnFo1yEYZE' },
    { name: 'Balestra Leggera', uuid: 'Compendium.fade-compendiums.item-compendium.Item.F9MPYJFMoaKIuqeW' },
    { name: 'Pugnale', uuid: 'Compendium.fade-compendiums.item-compendium.Item.GDdHrRnx7lkkKkmJ' },
    { name: 'Martello da lancio', uuid: 'Compendium.fade-compendiums.item-compendium.Item.HkT7WoeYJNCRi5JJ' }
  ]
};

// Nano Oggetti Extra (1d5) - Dwarf Extra Items (1d5)
export const NANO_OGGETTI_EXTRA = {
  name: 'Nano Oggetti Extra',
  formula: '1d5',
  results: [
    { name: 'Corda (15 m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.PIGV0RDZ6Bw4sCpz' },
    { name: 'Sacco grande', uuid: 'Compendium.fade-compendiums.item-compendium.Item.tRQlGfEauWD1j23t' },
    { name: 'Borsa da cintura', uuid: 'Compendium.fade-compendiums.item-compendium.Item.uPzYlqM0twcQMGsM' },
    { name: 'Pala', uuid: 'Compendium.fade-compendiums.item-compendium.Item.oS5aP2hUBCQniulf' },
    { name: 'Scrigno (Piccolo)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.dFlzyYsjgyQVfirS' }
  ]
};

// Mistico Oggetti Extra (1d2)
export const MISTICO_OGGETTI_EXTRA = {
  name: 'Mistico Oggetti Extra',
  formula: '1d2',
  results: [
    { name: 'Mantello Lungo', uuid: 'Compendium.fade-compendiums.item-compendium.Item.4eM4HGzF2K7IK6P6' },
    { name: 'Corda (15 m)', uuid: 'Compendium.fade-compendiums.item-compendium.Item.PIGV0RDZ6Bw4sCpz' }
  ]
};

// Table registry by ID for easy lookup
export const EQUIPMENT_TABLES = {
  '9Pk4ckAUhNdSZeoo': BARDO_STRUMENTI,        // Bardo strumenti musicali
  'qefII3Zunz8Gvg7t': BARDO_ARMATURE,        // Bardo armature
  'hEBnXuAZl6ZialtA': ARMATURE_GENERICHE,    // Armature generiche (tutte classi)
  'YOfTRPFY6iTK7UWY': BARDO_ARMI,            // Bardo armi
  'TheqtiqB1nviHVGm': BARDO_OGGETTI_EXTRA,   // Bardo oggetti extra
  'KO8OFvtVeXujoaWL': OGGETTI_EXTRA,         // Guerriero oggetti extra
  'dcqtCjWpj9srykEE': CHIERICO_ARMI,         // Chierico armi
  '9v5m06Zq3s9c2qfy': CHIERICO_ARMI_EXTRA,  // Chierico armi extra
  'gNhhqdX9bDaDLo6m': CHIERICO_OGGETTI_EXTRA, // Chierico oggetti extra
  'aATDPX9vntwYIhxO': ELFO_ARMI,             // Elfo armi
  'aUxhhOhaOaANMlWB': ELFO_OGGETTI_EXTRA,   // Elfo oggetti extra
  'c9UmJwIBRLwEttlh': GUERRIERO_ARMI,        // Guerriero armi (condivisa con Paladino/Vendicatore)
  'gUlCuiyg0YepNSqY': GUERRIERO_ARMI_SCUDO, // Guerriero armi scudo
  'xQsmdPaoqFMRW5C8': SCUDI,                 // Scudi base
  '9vWUsej1rMUDuF65': DRUIDO_ARMATURA,       // Druido armatura (SOLO cuoio)
  'cS7vWrh4LvNPMqD7': DRUIDO_ARMI,           // Druido armi
  'Rd2WQagbBWCD3zOb': DRUIDO_OGGETTI_EXTRA, // Druido oggetti extra
  '6ZMWLTmd52JTNFcv': PALADINO_OGGETTI_EXTRA, // Paladino oggetti extra
  '473Z4vxNmPPCQHsb': LADRO_ARMI,            // Ladro armi
  'VgFp7TiUZpaNdZU5': LADRO_OGGETTI_CASUALI, // Ladro oggetti casuali
  'zz6imLGmyofZaXfb': MAGO_ARMI,             // Mago armi
  'M43wMv24wUjwoj9c': MAGO_OGGETTI_EXTRA,   // Mago oggetti extra
  'WVxgQJiPM5TOqnzo': HALFLING_ARMI,         // Halfling armi
  'X58AUWGOVbNh14w7': HALFLING_OGGETTI_EXTRA, // Halfling oggetti extra
  'QvZzndSGsXUZ1Js1': NANO_ARMI,             // Nano armi
  'cZa3yE6JlXAHAMfs': NANO_OGGETTI_EXTRA,   // Nano oggetti extra
  'Bj10PzlLeaD98oUL': MISTICO_OGGETTI_EXTRA  // Mistico oggetti extra
};

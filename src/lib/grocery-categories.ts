/**
 * Dutch grocery item → category mapping.
 * Matches against item title (lowercase). First match wins.
 * Categories sorted in supermarket aisle order.
 */
const CATEGORY_MAP: Record<string, string[]> = {
  'Groente': [
    'tomaat', 'komkommer', 'paprika', 'wortel', 'ui', 'sla', 'salade',
    'spinazie', 'courgette', 'champignon', 'knoflook', 'gember',
    'broccoli', 'bloemkool', 'prei', 'selderij', 'aubergine',
  ],
  'Fruit': [
    'banaan', 'appel', 'peer', 'sinaasappel', 'mandarijn', 'watermeloen',
    'citroen', 'mango', 'aardbei', 'druif', 'kiwi', 'blödorange', 'ananas',
    'appelmoes',
  ],
  'Aardappelen': [
    'aardappel', 'friet',
  ],
  'Vlees & Vis': [
    'kip', 'gehakt', 'hamburger', 'salami', 'sucuk', 'merguez', 'döner',
    'kalf', 'lam', 'vlees', 'zalm', 'tonijn', 'fishstick', 'frikandel',
    'bout', 'vleugel', 'nugget',
  ],
  'Zuivel & Eieren': [
    'melk', 'kaas', 'yoghurt', 'karnemelk', 'roomboter', 'slagroom',
    'crème fraiche', 'eieren', 'vla', 'margerine', 'ayran', 'raclette',
  ],
  'Brood & Bakkerij': [
    'brood', 'brioche', 'tosti', 'krentenbol', 'durum', 'bamischuif',
    'croissant', 'pistolet', 'baguette',
  ],
  'Droge Waren': [
    'rijst', 'pasta', 'bloem', 'meel', 'suiker', 'zout', 'peper',
    'linzen', 'kikkererwt', 'bulgur', 'couscous', 'maizena', 'zetmeel',
    'poedersuiker', 'spliterwt', 'basmati', 'cornflake', 'noodle',
  ],
  'Kruiden & Specerijen': [
    'kruiden', 'komijn', 'paprika poeder', 'gemberpoeder', 'koriander',
    'peterselie', 'munt', 'sambal', 'curry', 'sate',
  ],
  'Sauzen & Smeersels': [
    'saus', 'ketchup', 'mayonaise', 'jam', 'chocoladepasta', 'pindakaas',
    'hagelslag', 'andalous', 'samurai', 'algerien', 'loumpia',
    'knoflook saus', 'siroop',
  ],
  'Dranken': [
    'sap', 'cola', 'water', 'frisdrank', 'ijsthee', 'thee', 'koffie',
    'chocolade melk', 'ayran',
  ],
  'Snacks & Snoep': [
    'chips', 'snoep', 'koek', 'chocolade', 'popcorn', 'ijs', 'cookie',
    'biscuit', 'cracker', 'frikandelbrood',
  ],
  'Diepvries': [
    'pizza', 'ijsjes', 'diepvries', 'ijsbak',
  ],
  'Schoonmaak': [
    'afwasmiddel', 'wasmiddel', 'vaatwas', 'bleek', 'dasty', 'wasverzachter',
    'keukenpapier', 'toiletpapier', 'vuilniszak', 'azijn',
  ],
  'Persoonlijke Verzorging': [
    'babydoek', 'babymelk', 'babypot', 'pleister', 'pyamapap',
    'sudo', 'shampoo', 'zeep', 'tandpasta',
  ],
  'Bakbenodigdheden': [
    'bakpapier', 'hamburger brood',
  ],
  'Olie & Azijn': [
    'olie', 'azijn', 'smen',
  ],
  'Noten': [
    'noot', 'cashew', 'amandel', 'pinda',
  ],
};

/** Categorize an item by its title */
export const categorizeItem = (title: string): string => {
  const lower = title.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return category;
    }
  }
  return 'Overig';
};

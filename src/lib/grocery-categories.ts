/**
 * Dutch grocery → supermarket category with emoji headers.
 * Category names mirror Dutch supermarket navigation (Jumbo/AH style):
 * aardappelen/groente/fruit are produce; juices/soda are drinks.
 * Multi-word matches first (longest keyword wins).
 */
const CATEGORIES: [string, string[]][] = [
  ['🥔 Aardappelen, Groente & Fruit', [
    'zoete aardappel', 'krieltjes', 'aardappelschijfjes', 'aardappelpartjes',
    'aardappel', 'friet aardappel',
    'snoeptomaat', 'cherrytomaat', 'tomaat', 'komkommer', 'paprika',
    'winterpeen', 'wortel', 'ui', 'rode ui', 'bosui', 'sla', 'salade',
    'spinazie', 'courgette', 'champignon', 'knoflook', 'gember',
    'broccoli', 'bloemkool', 'prei', 'selderij', 'aubergine', 'olijf',
    'avocado', 'asperge', 'boontjes', 'sperziebonen', 'doperwten',
    'spruiten', 'andijvie', 'rucola', 'paksoi', 'kool', 'mais',
    'banaan', 'bananen', 'appel', 'appels', 'peer', 'peren', 'sinaasappel', 'sinaasappels', 'mandarijn', 'mandarijnen', 'watermeloen',
    'meloen', 'citroen', 'limoen', 'mango', 'aardbei', 'aardbeien', 'druif', 'druiven', 'kiwi',
    'ananas', 'perzik', 'nectarine', 'blauwe bes', 'framboos', 'bramen',
    'appelmoes', 'fruit', 'groente', 'groenten',
  ]],
  ['🥗 Verse Maaltijden & Gemak', [
    'maaltijdsalade', 'verse pizza', 'verspakket', 'stamppot', 'soepgroente',
    'roerbakmix', 'maaltijdpakket', 'kant en klaar', 'wrap maaltijd',
  ]],
  ['🥩 Vlees, Vis & Vega', [
    'kipfilet', 'kipnuggets', 'kippenbouten', 'kipvleugels', 'hele kip',
    'gehakt', 'hamburger', 'frikandel', 'salami', 'sucuk', 'merguez',
    'döner', 'kalf', 'lam', 'rund', 'varken', 'worst', 'vlees',
    'zalm', 'tonijn', 'kabeljauw', 'garnalen', 'fishstick', 'vis',
    'vega burger', 'vegetarisch', 'vegan', 'tofu', 'tempeh',
  ]],
  ['🍞 Brood & Gebak', [
    'hamburger brood', 'tostibrood', 'krentenbollen', 'frikandelbrood',
    'brioche', 'durum', 'brood', 'croissant', 'pistolet', 'baguette',
    'stokbrood', 'bolletjes', 'wraps', 'tortilla', 'cake', 'gebak',
  ]],
  ['🥛 Zuivel, Boter & Eieren', [
    'roomboter naturel', 'roomboter zout', 'roomboter', 'slagroom',
    'yoghurt drink', 'yoghurt', 'crème fraiche', 'chocolade melk',
    'chocomel', 'karnemelk', 'geraspte kaas', 'raclette cheese', 'raclette',
    'melk', 'kaas', 'eieren', 'vla', 'margarine', 'margerine', 'kwark',
    'roomkaas', 'zuivel',
  ]],
  ['🧀 Vleeswaren, Kaas & Tapas', [
    'plakjes kaas', 'smeerkaas', 'vleeswaren', 'kipfilet beleg', 'kalkoenfilet',
    'ham', 'boterhamworst', 'hummus', 'tapenade', 'tapas',
  ]],
  ['🥫 Conserven, Soepen, Sauzen & Olie', [
    'knoflook saus', 'andalous saus', 'algerien saus', 'samurai saus',
    'loempia saus', 'loumpia saus', 'sambal saus', 'satesaus poeder',
    'pasta saus', 'tomatensaus', 'mayonaise', 'ketchup', 'saus', 'siroop',
    'zonnebloem olie', 'olijfolie', 'olijven groen', 'smen', 'azijn', 'olie',
    'blik tomaten', 'tomatenpuree', 'conserven', 'soep', 'bouillon',
  ]],
  ['🌍 Wereldkeukens, Kruiden, Pasta & Rijst', [
    'paprika poeder', 'koriander blad', 'peterselie blad', 'zwarte peper',
    'kefta kruiden', 'curry kruiden', 'munt blad', 'gemberpoeder', 'komijn',
    'peper', 'curry', 'kruiden', 'aardappel zetmeel', 'basmati rice',
    'pasta penne', 'pasta', 'bulgur', 'couscous', 'rijst', 'noodles',
    'mie', 'maizena', 'zetmeel', 'rode linzen', 'groene linzen',
    'kikkererwten', 'split erwten', 'linzen', 'erwten', 'wereldkeuken',
  ]],
  ['🥣 Ontbijt, Broodbeleg & Bakproducten', [
    'cornflakes', 'muesli', 'cruesli', 'havermout', 'ontbijtgranen',
    'hagelslag vlokken', 'hagelslag', 'jam', 'chocoladepasta', 'pindakaas',
    'honing', 'bloem', 'meel', 'suiker', 'zout', 'poedersuiker',
    'kristal suiker', 'suikerklontjes', 'bakpapier', 'bakmix',
  ]],
  ['🍪 Koek, Snoep, Chocolade & Chips', [
    'snoepjes', 'popcorn', 'chips', 'koek', 'snoep', 'chocolade',
    'reep', 'drop', 'nootjes', 'cashew nootjes', 'cashew', 'amandel',
    'noot', 'pinda',
  ]],
  ['☕ Koffie & Thee', [
    'verven thee', 'muntthee', 'groene thee', 'zwarte thee', 'thee',
    'koffiebonen', 'koffiecups', 'oploskoffie', 'koffie', 'cappuccino',
  ]],
  ['🥤 Frisdrank & Sappen', [
    'frisdrank limoen', 'frisdrank pommes', 'frisdrank tropical',
    'water met prik', 'sinaasappelsap', 'sinasappelsap', 'ananassap',
    'mangosap', 'multisap', 'appelsap', 'perensap', 'dubbeldrank',
    'waterflesjes', 'cola zero', 'ijsthee', 'cola', 'fanta', 'sprite',
    'sap', 'juice', 'water', 'frisdrank', 'limonade',
  ]],
  ['🍷 Bier & Wijn', [
    'bier', 'radler', 'wijn', 'rose', 'rosé', 'prosecco',
  ]],
  ['❄️ Diepvries', [
    'ijsbak cookie dough', 'ijsbak', 'ijsjes', 'frikandellen',
    'diepvries snacks', 'diepvries pizza', 'pizza', 'nuggets', 'diepvries', 'ijs',
  ]],
  ['💊 Drogisterij & Gezondheid', [
    'pleisters', 'sudo creme', 'sudocreme', 'sudo', 'shampoo', 'zeep',
    'douchegel', 'tandpasta', 'deodorant', 'paracetamol', 'vitamine',
  ]],
  ['👶 Baby & Kind', [
    'babydoekjes', 'babymelk', 'babypotjes', 'pyamapap', 'luiers',
  ]],
  ['🧼 Huishouden & Dieren', [
    'dikke bleek', 'vuilniszakken 30l', 'vuilniszakken', 'vuilniszak',
    'vaatwastablet', 'vaatwas', 'keukenpapier', 'toiletpapier',
    'wasverzachter', 'afwasmiddel', 'wasmiddel', 'bleek', 'dasty',
    'kattenvoer', 'hondenvoer', 'dierenvoer',
  ]],
  ['🧾 Non-food & Servicebalie', [
    'batterij', 'batterijen', 'lamp', 'kaars', 'aansteker', 'cadeaukaart',
  ]],
];

const singularizeDutch = (value: string): string => value
  .replace(/['’]s\b/g, '')
  .replace(/en\b/g, '')
  .replace(/s\b/g, '');

const normalize = (value: string): string => singularizeDutch(
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
);

// Build lookup: normalized keyword → category, sorted longest-first for multi-word priority.
const lookup = new Map<string, string>();
for (const [category, keywords] of CATEGORIES) {
  for (const kw of keywords) {
    lookup.set(normalize(kw), category);
  }
}
const sortedKeywords = [...lookup.keys()].sort((a, b) => b.length - a.length);

export const categorizeItem = (title: string): string => {
  const lower = normalize(title);
  for (const kw of sortedKeywords) {
    if (lower.includes(kw)) return lookup.get(kw)!;
  }
  return 'Overig';
};

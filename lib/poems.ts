export type PoemMeta = {
  id: string;
  title: string;
  author: string;
  year?: number;
  themes: string[]; // e.g., ["love","loss","nature","city","time","childhood","change","solitude","joy","anger","anxiety","hope","memory"]
  opening: string;
  linesSample?: string;
  link?: string;
};

export const POEMS: PoemMeta[] = [
  {
    id: "if",
    title: "If—",
    author: "Rudyard Kipling",
    year: 1910,
    themes: ["stoicism","advice","character","resilience","growth"],
    opening: "If you can keep your head when all about you",
    linesSample: "If you can keep your head when all about you / Are losing theirs and blaming it on you",
  },
  {
    id: "invictus",
    title: "Invictus",
    author: "William Ernest Henley",
    year: 1888,
    themes: ["resilience","suffering","courage","self","darkness","hope"],
    opening: "Out of the night that covers me",
  },
  {
    id: "daffodils",
    title: "I Wandered Lonely as a Cloud",
    author: "William Wordsworth",
    year: 1807,
    themes: ["nature","memory","joy","solitude","wonder"],
    opening: "I wandered lonely as a cloud",
  },
  {
    id: "still-i-rise",
    title: "Still I Rise",
    author: "Maya Angelou",
    year: 1978,
    themes: ["strength","identity","oppression","joy","defiance","resilience"],
    opening: "You may write me down in history",
  },
  {
    id: "wild-geese",
    title: "Wild Geese",
    author: "Mary Oliver",
    year: 1986,
    themes: ["belonging","self","nature","forgiveness","acceptance","solitude"],
    opening: "You do not have to be good.",
  },
  {
    id: "red-wheelbarrow",
    title: "The Red Wheelbarrow",
    author: "William Carlos Williams",
    year: 1923,
    themes: ["attention","everyday","nature","stillness"],
    opening: "so much depends / upon",
  },
  {
    id: "do-not-go-gentle",
    title: "Do not go gentle into that good night",
    author: "Dylan Thomas",
    year: 1951,
    themes: ["death","rage","family","time","resistance"],
    opening: "Do not go gentle into that good night",
  },
  {
    id: "love-after-love",
    title: "Love After Love",
    author: "Derek Walcott",
    year: 1976,
    themes: ["self","healing","love","solitude","homecoming","growth"],
    opening: "The time will come",
  },
  {
    id: "one-art",
    title: "One Art",
    author: "Elizabeth Bishop",
    year: 1976,
    themes: ["loss","memory","control","grief","wit"],
    opening: "The art of losing isn't hard to master",
  },
  {
    id: "sonnet-43",
    title: "How Do I Love Thee? (Sonnet 43)",
    author: "Elizabeth Barrett Browning",
    year: 1850,
    themes: ["love","devotion","time","faith"],
    opening: "How do I love thee? Let me count the ways.",
  },
  {
    id: "stopping-by-woods",
    title: "Stopping by Woods on a Snowy Evening",
    author: "Robert Frost",
    year: 1923,
    themes: ["duty","rest","nature","temptation","time"],
    opening: "Whose woods these are I think I know.",
  },
  {
    id: "ode-to-a-nightingale",
    title: "Ode to a Nightingale",
    author: "John Keats",
    year: 1819,
    themes: ["beauty","mortality","ecstasy","art","escape"],
    opening: "My heart aches, and a drowsy numbness pains",
  },
];

export type Recommendation = {
  poem: PoemMeta;
  score: number;
  matchedThemes: string[];
  matchedWords: string[];
};

export function recommendPoems(prompt: string, limit = 5): Recommendation[] {
  const words = tokenize(prompt);
  const signals = inferThemes(words);
  const recs = POEMS.map((poem) => {
    const matchedThemes = poem.themes.filter((t) => signals.has(t));
    const openingWords = tokenize(poem.opening);
    const matchedWords = intersect(words, openingWords).slice(0, 6);
    const score = matchedThemes.length * 3 + matchedWords.length * 1 + jaccard(words, openingWords) * 2;
    return { poem, score, matchedThemes, matchedWords } as Recommendation;
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return recs;
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z\s']/g, " ").split(/\s+/).filter(Boolean);
}

function intersect(a: string[], b: string[]): string[] {
  const sb = new Set(b);
  const out: string[] = [];
  for (const w of a) if (sb.has(w)) out.push(w);
  return Array.from(new Set(out));
}

function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a);
  const sb = new Set(b);
  let inter = 0;
  for (const w of sa) if (sb.has(w)) inter++;
  const union = sa.size + sb.size - inter;
  return union === 0 ? 0 : inter / union;
}

function inferThemes(words: string[]): Set<string> {
  const set = new Set<string>();
  const add = (t: string, keys: string[]) => {
    for (const k of keys) if (words.includes(k)) { set.add(t); break; }
  };
  add("love", ["love","beloved","heart","kiss","desire","romance"]);
  add("loss", ["loss","lost","gone","grief","mourn","grieve","bereft","funeral","death","died"]);
  add("nature", ["river","forest","tree","flowers","birds","sky","rain","snow","geese","nightingale","cloud"]);
  add("solitude", ["alone","lonely","solitude","isolation","empty"]);
  add("hope", ["hope","light","dawn","rise","rise","bright"]);
  add("resilience", ["resilience","resilient","courage","brave","strength","persist","endure","fight"]);
  add("self", ["self","myself","return","home","mirror","identity"]);
  add("time", ["time","days","years","evening","night","dawn"]);
  add("joy", ["joy","delight","happy","happiness","smile"]);
  add("memory", ["memory","remember","remembrance","recollect"]);
  add("death", ["death","dying","die","grave","night"]);
  add("beauty", ["beauty","beautiful","ecstasy","song","art"]);
  add("advice", ["if","then","wise","advice"]);
  add("growth", ["grow","growth","become","becoming","be"]);
  add("city", ["street","city","crowd","subway","traffic"]);
  add("anger", ["anger","rage","furious","burn"]);
  add("change", ["change","changed","turn","turning","become"]);
  add("forgiveness", ["forgive","forgiveness","mercy"]);
  add("family", ["father","mother","son","daughter","child","family"]);
  return set;
}



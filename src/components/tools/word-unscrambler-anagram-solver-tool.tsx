"use client";

import { useMemo, useState } from "react";

type Entry = { word: string; normalized: string };
const WORDS = [
  "a", "an", "as", "at", "be", "by", "do", "go", "he", "if", "in", "is", "it", "me", "my", "no", "of", "on", "or", "ox", "so", "to", "up", "us", "we",
  "act", "add", "age", "ago", "air", "all", "and", "ant", "any", "ape", "apt", "arc", "are", "arm", "art", "ash", "ask", "ate", "bad", "bag", "ban", "bar", "bat", "bay", "bed", "bee", "beg", "bet", "bid", "big", "bin", "bit", "bog", "box", "boy", "bud", "bug", "bun", "bus", "but", "buy", "can", "cap", "car", "cat", "cop", "cow", "cry", "cup", "cut", "dad", "dam", "day", "den", "dew", "did", "die", "dig", "dim", "dip", "dog", "dot", "dry", "due", "dug", "ear", "eat", "egg", "ego", "elf", "elk", "elm", "end", "era", "eve", "eye", "fan", "far", "fat", "fax", "fed", "fee", "few", "fig", "fin", "fit", "fix", "flu", "fly", "fog", "for", "fox", "fry", "fun", "fur", "gap", "gas", "gem", "get", "gig", "gin", "god", "got", "gum", "gun", "gut", "guy", "gym", "had", "ham", "has", "hat", "hay", "hen", "her", "hey", "hid", "him", "hip", "his", "hit", "hog", "hop", "hot", "how", "hub", "hug", "hum", "hut", "ice", "icy", "ill", "ink", "inn", "ion", "jam", "jar", "jaw", "jet", "job", "jog", "joy", "key", "kid", "kin", "kit", "lab", "lad", "lag", "lap", "law", "lay", "led", "leg", "let", "lid", "lie", "lip", "lit", "log", "lot", "low", "mad", "man", "map", "mat", "may", "men", "met", "mix", "mob", "mom", "mud", "mug", "nap", "net", "new", "nil", "nip", "nod", "nor", "not", "now", "nut", "oak", "oar", "odd", "off", "oil", "old", "one", "opt", "our", "out", "owe", "owl", "own", "pad", "pal", "pan", "pat", "paw", "pay", "pea", "pen", "pet", "pie", "pig", "pin", "pit", "pod", "pop", "pot", "pro", "pub", "pun", "pup", "put", "rag", "ram", "ran", "rap", "rat", "raw", "ray", "red", "rid", "rig", "rim", "rip", "rob", "rod", "rot", "row", "rub", "rug", "rum", "run", "sad", "sag", "sap", "sat", "saw", "say", "sea", "see", "set", "sew", "she", "shy", "sin", "sip", "sir", "sit", "six", "ski", "sky", "slab", "slam", "slap", "slat", "slaw", "slay", "sled", "slew", "slid", "slim", "slip", "slit", "slot", "slow", "slug", "smog", "snap", "snip", "snow", "soap", "sob", "son", "sop", "soy", "spa", "spy", "sub", "sum", "sun", "tag", "tan", "tap", "tar", "tax", "tea", "ten", "the", "tie", "tin", "tip", "toe", "ton", "too", "top", "toy", "try", "tub", "tug", "two", "use", "van", "vat", "vet", "via", "vie", "vow", "war", "was", "wax", "way", "web", "wed", "wet", "who", "why", "win", "wit", "won", "wow", "yak", "yam", "yes", "yet", "you", "zip", "zoo",
  "able", "acid", "aged", "also", "area", "army", "away", "baby", "back", "bake", "ball", "band", "bank", "base", "bath", "bear", "beat", "been", "beer", "bell", "belt", "best", "bill", "bird", "blue", "boat", "body", "bold", "book", "born", "both", "bulk", "burn", "busy", "cake", "call", "calm", "came", "camp", "card", "care", "case", "cash", "city", "club", "coal", "coat", "code", "cold", "come", "cook", "cool", "cope", "copy", "cost", "crew", "crop", "dark", "data", "date", "dawn", "days", "dead", "deal", "dear", "debt", "deep", "desk", "dial", "diet", "dirt", "dish", "disk", "does", "door", "dose", "down", "draw", "drop", "drug", "dual", "dust", "duty", "each", "earn", "east", "easy", "edge", "else", "even", "ever", "evil", "exam", "exit", "face", "fact", "fail", "fair", "fall", "fame", "farm", "fast", "fate", "fear", "feed", "feel", "feet", "fell", "felt", "file", "fill", "film", "find", "fine", "fire", "firm", "fish", "five", "flat", "flow", "food", "foot", "ford", "form", "fort", "four", "free", "from", "fuel", "full", "fund", "gain", "game", "gate", "gave", "gear", "gene", "gift", "girl", "give", "glad", "goal", "goes", "gold", "gone", "good", "gray", "grew", "grey", "grow", "hair", "half", "hall", "hand", "hang", "hard", "harm", "hate", "have", "head", "hear", "heat", "held", "hell", "help", "here", "hero", "hide", "high", "hill", "hint", "hire", "hold", "hole", "holy", "home", "hope", "host", "hour", "huge", "hung", "hunt", "hurt", "idea", "inch", "into", "iron", "item", "join", "jump", "just", "keen", "keep", "kept", "kick", "kind", "king", "knee", "knew", "know", "lack", "lady", "laid", "lake", "land", "lane", "last", "late", "lead", "leaf", "lean", "left", "less", "life", "lift", "like", "line", "link", "list", "live", "load", "loan", "lock", "logo", "long", "look", "lord", "lose", "loss", "lost", "love", "luck", "made", "mail", "main", "make", "male", "many", "mark", "mass", "meal", "mean", "meat", "meet", "menu", "mere", "mile", "milk", "mind", "mine", "miss", "mode", "mood", "moon", "more", "most", "move", "much", "must", "name", "near", "neck", "need", "news", "next", "nice", "nine", "node", "none", "nose", "note", "once", "only", "open", "oral", "over", "pace", "pack", "page", "paid", "pain", "pair", "pale", "palm", "park", "part", "pass", "past", "path", "peak", "pick", "pink", "plan", "play", "plot", "plus", "poem", "poet", "pool", "poor", "port", "post", "pull", "pure", "push", "race", "radio", "rain", "rank", "rare", "rate", "read", "real", "rent", "rest", "rice", "rich", "ride", "ring", "rise", "risk", "road", "rock", "role", "roll", "room", "root", "rose", "rule", "safe", "said", "sail", "sale", "salt", "same", "sand", "save", "scan", "seat", "seed", "seek", "seem", "seen", "self", "sell", "send", "sent", "ship", "shop", "shot", "show", "shut", "sick", "side", "sign", "silk", "sing", "site", "size", "skin", "slip", "slow", "snow", "soft", "soil", "sold", "sole", "some", "song", "soon", "sort", "soul", "star", "stay", "step", "stop", "such", "suit", "sure", "take", "tale", "talk", "tall", "tank", "task", "team", "tell", "tend", "term", "test", "text", "than", "that", "them", "then", "they", "thin", "this", "thus", "tide", "time", "tiny", "told", "tone", "took", "tool", "tour", "town", "tree", "true", "tune", "turn", "type", "unit", "upon", "used", "user", "vary", "vast", "verb", "very", "view", "vote", "wage", "wait", "wake", "walk", "wall", "want", "warm", "wash", "wave", "ways", "weak", "wear", "week", "well", "went", "were", "west", "what", "when", "wide", "wife", "wild", "will", "wind", "wine", "wing", "wire", "wise", "wish", "with", "wood", "word", "work", "yard", "yeah", "year", "your",
  "about", "above", "actor", "adapt", "admit", "adopt", "adult", "after", "again", "agent", "agree", "ahead", "alarm", "album", "alert", "alien", "align", "alive", "allow", "alone", "along", "alter", "among", "angel", "anger", "angle", "angry", "apart", "apple", "apply", "arena", "argue", "arise", "armed", "array", "arrow", "aside", "asset", "audio", "avoid", "award", "aware", "badly", "basic", "beach", "begin", "being", "below", "bench", "birth", "black", "blame", "blind", "block", "blood", "board", "brain", "brand", "bread", "break", "brief", "bring", "broad", "brown", "build", "built", "buyer", "cable", "carry", "catch", "cause", "chain", "chair", "chart", "cheap", "check", "chest", "chief", "child", "china", "choice", "choose", "civil", "claim", "class", "clean", "clear", "click", "clock", "close", "coach", "coast", "could", "count", "court", "cover", "craft", "crash", "cream", "crime", "cross", "crowd", "crown", "daily", "dance", "dated", "dealt", "death", "debug", "delay", "depth", "doing", "doubt", "dozen", "draft", "drama", "dream", "dress", "drink", "drive", "early", "earth", "eight", "elect", "email", "empty", "enemy", "enjoy", "enter", "entry", "equal", "error", "event", "every", "exact", "exist", "extra", "faith", "false", "fault", "favor", "fence", "fewer", "field", "fifth", "fifty", "fight", "final", "first", "fixed", "flash", "floor", "focus", "force", "frame", "frank", "fresh", "front", "fruit", "fully", "funny", "giant", "given", "glass", "globe", "going", "grace", "grade", "grand", "grant", "grass", "great", "green", "group", "guard", "guess", "guest", "guide", "happy", "heart", "heavy", "hello", "hence", "horse", "hotel", "house", "human", "image", "index", "input", "issue", "joint", "judge", "juice", "known", "label", "large", "later", "laugh", "layer", "learn", "least", "leave", "legal", "level", "light", "limit", "local", "logic", "loose", "lower", "lucky", "lunch", "major", "maker", "march", "match", "maybe", "media", "metal", "might", "minor", "model", "money", "month", "moral", "motor", "mount", "mouse", "mouth", "movie", "music", "needs", "never", "night", "noise", "north", "novel", "nurse", "occur", "offer", "often", "order", "other", "ought", "owner", "panel", "paper", "party", "peace", "phase", "phone", "photo", "piece", "pilot", "pitch", "place", "plain", "plane", "plant", "plate", "point", "power", "press", "price", "pride", "prime", "print", "prior", "prize", "proof", "proud", "prove", "quick", "quiet", "quite", "radio", "raise", "range", "rapid", "ratio", "reach", "react", "ready", "refer", "right", "river", "robot", "rough", "round", "route", "royal", "scale", "scene", "scope", "score", "sense", "serve", "seven", "shall", "shape", "share", "sharp", "sheet", "shelf", "shell", "shift", "shirt", "shock", "short", "shown", "sight", "since", "skill", "sleep", "small", "smart", "smile", "solid", "solve", "sorry", "sound", "south", "space", "speak", "speed", "spend", "spent", "split", "sport", "staff", "stage", "stand", "start", "state", "steam", "steel", "stick", "still", "stock", "stone", "store", "story", "study", "stuff", "style", "sugar", "suite", "super", "sweet", "table", "taken", "taste", "teach", "teeth", "thank", "their", "there", "these", "thick", "thing", "think", "third", "those", "three", "throw", "tight", "title", "today", "topic", "total", "touch", "tough", "track", "trade", "train", "treat", "trend", "trial", "trust", "truth", "under", "union", "until", "upper", "urban", "usage", "usual", "valid", "value", "video", "visit", "vital", "voice", "waste", "watch", "water", "wheel", "where", "which", "while", "white", "whole", "whose", "woman", "women", "world", "would", "write", "wrong", "young", "youth",
  "listen", "silent", "enlist", "inlets", "triangle", "integral", "alter", "later", "alert", "below", "elbow", "state", "taste", "night", "thing", "study", "dusty", "save", "vase", "evil", "vile", "veil", "live", "angel", "glean", "angle", "glean", "stressed", "desserts", "earth", "heart", "hater", "teacher", "cheater", "recuse", "secure", "rescue", "finder", "friend", "listen", "silent", "enlist", "rat", "tar", "art", "tea", "eat", "ate", "below", "elbow", "inch", "chin", "brag", "grab", "bored", "robed", "save", "vase", "dusty", "study", "night", "thing", "angel", "glean", "players", "parsley", "replays", "staple", "petals", "plates", "alert", "alter", "later", "react", "trace", "crate", "cater", "caret", "race", "care", "acre", "evil", "vile", "veil", "live", "opts", "stop", "pots", "tops", "post", "spot", "listen", "silent", "enlist", "inlets", "stone", "tones", "notes", "onset", "eat", "tea", "ate"
];

const DICTIONARY: Entry[] = [...new Set(WORDS.map((word) => word.toLowerCase()))].map((word) => ({
  word,
  normalized: word.split("").sort().join(""),
}));

function normalizeLetters(value: string): string {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}
function signature(value: string): string {
  return normalizeLetters(value).split("").sort().join("");
}
function canBuild(candidate: string, letters: string): boolean {
  const available = new Map<string, number>();
  for (const char of normalizeLetters(letters)) available.set(char, (available.get(char) ?? 0) + 1);
  for (const char of normalizeLetters(candidate)) {
    const count = available.get(char) ?? 0;
    if (!count) return false;
    available.set(char, count - 1);
  }
  return true;
}

export default function WordUnscramblerAnagramSolverTool() {
  const [letters, setLetters] = useState("listen");
  const [mode, setMode] = useState<"anagrams" | "words">("anagrams");
  const [minLength, setMinLength] = useState("2");
  const [maxLength, setMaxLength] = useState("12");
  const [allowShorterWords, setAllowShorterWords] = useState(true);
  const [exactOnly, setExactOnly] = useState(false);
  const [sort, setSort] = useState<"length" | "alpha">("length");
  const [query, setQuery] = useState("");

  const cleaned = normalizeLetters(letters);
  const results = useMemo(() => {
    if (!cleaned || cleaned.length > 16) return [];
    const min = Math.max(1, Number(minLength) || 1);
    const max = Math.min(16, Math.max(min, Number(maxLength) || 16));
    let list = DICTIONARY.filter(({ word, normalized }) => {
      if (word.length < min || word.length > max) return false;
      if (mode === "anagrams") return normalized === signature(cleaned);
      if (exactOnly) return normalized === signature(cleaned);
      return canBuild(word, cleaned) && (allowShorterWords || word.length === cleaned.length);
    });
    if (query.trim()) list = list.filter(({ word }) => word.includes(query.toLowerCase().trim()));
    list.sort((a, b) => sort === "alpha" ? a.word.localeCompare(b.word) : b.word.length - a.word.length || a.word.localeCompare(b.word));
    return list.slice(0, 250).map(({ word }) => word);
  }, [cleaned, mode, minLength, maxLength, allowShorterWords, exactOnly, sort, query]);

  async function copyResults() {
    try { await navigator.clipboard.writeText(results.join(", ")); } catch { /* Keep results selectable if clipboard is blocked. */ }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Scrambled letters</h2>
          <p className="mt-1 text-sm text-slate-500">Use English letters. Results come from a small built-in word list, so not every valid word is included.</p>
        </div>
        <label htmlFor="unscrambler-letters" className="mb-1.5 block text-sm font-medium">Letters</label>
        <input id="unscrambler-letters" value={letters} onChange={(e) => setLetters(e.target.value)} maxLength={32} placeholder="e.g. listen" className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700" />
        {cleaned.length > 16 && <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">For performance, enter 16 or fewer English letters.</p>}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="unscrambler-mode" className="mb-1.5 block text-sm font-medium">Search mode</label>
            <select id="unscrambler-mode" value={mode} onChange={(e) => setMode(e.target.value as "anagrams" | "words")} className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-sm dark:border-slate-700">
              <option value="anagrams">Exact anagrams — use every letter</option>
              <option value="words">Build words — use some or all letters</option>
            </select>
          </div>
          <div>
            <label htmlFor="unscrambler-sort" className="mb-1.5 block text-sm font-medium">Sort results</label>
            <select id="unscrambler-sort" value={sort} onChange={(e) => setSort(e.target.value as "length" | "alpha")} className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-sm dark:border-slate-700">
              <option value="length">Longest words first</option><option value="alpha">Alphabetical</option>
            </select>
          </div>
          <div>
            <label htmlFor="unscrambler-min" className="mb-1.5 block text-sm font-medium">Minimum word length</label>
            <input id="unscrambler-min" type="number" min="1" max="16" value={minLength} onChange={(e) => setMinLength(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-sm dark:border-slate-700" />
          </div>
          <div>
            <label htmlFor="unscrambler-max" className="mb-1.5 block text-sm font-medium">Maximum word length</label>
            <input id="unscrambler-max" type="number" min="1" max="16" value={maxLength} onChange={(e) => setMaxLength(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-sm dark:border-slate-700" />
          </div>
        </div>
        {mode === "words" && <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={allowShorterWords} onChange={(e) => setAllowShorterWords(e.target.checked)} />Allow words shorter than the supplied letters</label>}
        {mode === "words" && <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={exactOnly} onChange={(e) => setExactOnly(e.target.checked)} />Require exact anagram (use every letter)</label>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => { setLetters("listen"); setMode("anagrams"); setMinLength("2"); setMaxLength("12"); setAllowShorterWords(true); setExactOnly(false); setSort("length"); setQuery(""); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Reset</button>
          <button type="button" onClick={() => setLetters("triangle")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Try “triangle”</button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Results</h2>
            <p className="mt-1 text-sm text-slate-500">{results.length} result{results.length === 1 ? "" : "s"} shown (maximum 250)</p>
          </div>
          <button type="button" onClick={copyResults} disabled={!results.length} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40">Copy results</button>
        </div>
        <div className="mt-4">
          <label htmlFor="unscrambler-filter" className="mb-1.5 block text-sm font-medium">Filter results</label>
          <input id="unscrambler-filter" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter words by included letters/text…" className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-sm dark:border-slate-700" />
        </div>
        {results.length ? <div className="mt-4 flex flex-wrap gap-2">{results.map((word) => <span key={word} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800">{word}</span>)}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950">{cleaned.length > 16 ? "Shorten the input to 16 letters or fewer." : "No matching words found in the built-in dictionary. Try another input or relax the length filters."}</p>}
        <p className="mt-4 text-xs leading-5 text-slate-500">This tool uses a limited local word list and does not contact a dictionary API. Results are suggestions, not an exhaustive dictionary search.</p>
      </section>
    </div>
  );
}

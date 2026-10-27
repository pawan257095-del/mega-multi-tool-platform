"use client";

import { useMemo, useState } from "react";

type Category = "all" | "happy" | "love" | "sad" | "angry" | "shrug" | "cute" | "action";
type Face = { face: string; label: string; category: Exclude<Category, "all">; tags: string[] };

const faces: Face[] = [
  { face: "(＾▽＾)", label: "Big smile", category: "happy", tags: ["smile", "joy", "happy"] },
  { face: "(｡◕‿◕｡)", label: "Warm smile", category: "happy", tags: ["smile", "friendly"] },
  { face: "ヾ(＾-＾)ノ", label: "Celebration", category: "happy", tags: ["yay", "cheer", "party"] },
  { face: "ヽ(・∀・)ﾉ", label: "Excited", category: "happy", tags: ["excited", "wave"] },
  { face: "(≧▽≦)", label: "Laughing", category: "happy", tags: ["laugh", "fun"] },
  { face: "٩(◕‿◕｡)۶", label: "Cheerful", category: "happy", tags: ["cheer", "happy"] },
  { face: "(* ^ ω ^)", label: "Gentle smile", category: "happy", tags: ["smile", "soft"] },
  { face: "(ﾉ´ヮ`)ﾉ*: ･ﾟ", label: "Sparkles", category: "happy", tags: ["magic", "sparkle"] },
  { face: "(♡°▽°♡)", label: "Heart eyes", category: "love", tags: ["heart", "crush", "cute"] },
  { face: "(っ˘з(˘⌣˘ )", label: "Kiss", category: "love", tags: ["kiss", "affection"] },
  { face: "(｡♥‿♥｡)", label: "In love", category: "love", tags: ["love", "heart"] },
  { face: "♡(˃͈ દ ˂͈ ༶ )", label: "Blushing love", category: "love", tags: ["blush", "heart"] },
  { face: "(づ￣ ³￣)づ", label: "Hug", category: "love", tags: ["hug", "cuddle"] },
  { face: "(ಥ﹏ಥ)", label: "Crying", category: "sad", tags: ["cry", "tears"] },
  { face: "(╥_╥)", label: "Sad tears", category: "sad", tags: ["sad", "cry"] },
  { face: "(；⌣̀_⌣́)", label: "Disappointed", category: "sad", tags: ["disappointed", "upset"] },
  { face: "(｡•́︿•̀｡)", label: "Worried", category: "sad", tags: ["worried", "sad"] },
  { face: "(；ω；)", label: "Teary", category: "sad", tags: ["tears", "hurt"] },
  { face: "(╬ Ò﹏Ó)", label: "Furious", category: "angry", tags: ["angry", "mad"] },
  { face: "(ノಠ益ಠ)ノ彡┻━┻", label: "Flip table", category: "angry", tags: ["rage", "table flip"] },
  { face: "(＃`Д´)", label: "Annoyed", category: "angry", tags: ["annoyed", "mad"] },
  { face: "ಠ_ಠ", label: "Disapproval", category: "angry", tags: ["side eye", "no"] },
  { face: "¯\\_(ツ)_/¯", label: "Shrug", category: "shrug", tags: ["whatever", "unsure"] },
  { face: "┐(￣ヘ￣)┌", label: "What can you do", category: "shrug", tags: ["shrug", "confused"] },
  { face: "╮(￣ω￣;)╭", label: "Unsure shrug", category: "shrug", tags: ["unsure", "confused"] },
  { face: "(=^･ω･^=)", label: "Cat face", category: "cute", tags: ["cat", "kitty"] },
  { face: "(•ㅅ•)", label: "Little animal", category: "cute", tags: ["animal", "soft"] },
  { face: "ʕ•ᴥ•ʔ", label: "Bear", category: "cute", tags: ["bear", "animal"] },
  { face: "(｡･ω･｡)", label: "Cute face", category: "cute", tags: ["cute", "simple"] },
  { face: "૮ ˶ᵔ ᵕ ᵔ˶ ა", label: "Soft smile", category: "cute", tags: ["soft", "sweet"] },
  { face: "ᕕ( ᐛ )ᕗ", label: "Walking", category: "action", tags: ["walk", "go"] },
  { face: "┌( ಠ_ಠ)┘", label: "Marching", category: "action", tags: ["move", "march"] },
  { face: "ε=ε=ε=┌(；￣▽￣)┘", label: "Running away", category: "action", tags: ["run", "escape"] },
  { face: "(ง •̀_•́)ง", label: "Ready to fight", category: "action", tags: ["fight", "strong"] },
  { face: "┬─┬ノ( º _ ºノ)", label: "Set table back", category: "action", tags: ["table", "fix"] },
  { face: "ᕦ(ò_óˇ)ᕤ", label: "Strong", category: "action", tags: ["muscle", "power"] },
];

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All faces" }, { value: "happy", label: "Happy" }, { value: "love", label: "Love" },
  { value: "sad", label: "Sad" }, { value: "angry", label: "Angry" }, { value: "shrug", label: "Shrug" },
  { value: "cute", label: "Cute / Animals" }, { value: "action", label: "Actions" },
];

export default function KaomojiBoardTool() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copyStatus, setCopyStatus] = useState("");
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return faces.filter((item) => {
      const categoryMatch = category === "all" || item.category === category;
      const searchMatch = !term || `${item.face} ${item.label} ${item.tags.join(" ")}`.toLowerCase().includes(term);
      return categoryMatch && searchMatch;
    });
  }, [search, category]);

  async function copyFace(face: string) {
    try {
      await navigator.clipboard.writeText(face);
      setCopyStatus(`${face} copied.`);
    } catch {
      setCopyStatus("Clipboard access was blocked. Select the face text and copy it manually.");
    }
  }

  async function copyFavorites() {
    if (!favorites.length) {
      setCopyStatus("Add some favorites first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(favorites.join("\n"));
      setCopyStatus("Favorites copied.");
    } catch {
      setCopyStatus("Clipboard access was blocked. Copy favorites one at a time.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Find your expression</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Search by expression, label, or keyword, then copy a face into your message.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px]">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search smile, cat, hug, angry..." aria-label="Search kaomoji"
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)} aria-label="Filter by category"
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
            {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Showing {filtered.length} of {faces.length} kaomoji</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Kaomoji board</h3>
          <button type="button" onClick={() => void copyFavorites()} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-600">Copy favorites ({favorites.length})</button>
        </div>
        {filtered.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const isFavorite = favorites.includes(item.face);
            return <article key={item.face} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="min-h-12 break-words text-center text-2xl" aria-label={item.label}>{item.face}</div>
              <p className="mt-2 text-center text-sm font-medium">{item.label}</p>
              <p className="mt-1 text-center text-xs capitalize text-slate-500">{item.category}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => void copyFace(item.face)} className="flex-1 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700">Copy</button>
                <button type="button" aria-pressed={isFavorite} onClick={() => setFavorites((old) => isFavorite ? old.filter((value) => value !== item.face) : [...old, item.face])}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600">{isFavorite ? "★ Saved" : "☆ Save"}</button>
              </div>
            </article>;
          })}
        </div> : <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600">No matches. Try another keyword or choose “All faces”.</p>}
        {copyStatus && <p role="status" className="mt-4 text-sm text-slate-600 dark:text-slate-300">{copyStatus}</p>}
      </section>
      <p className="text-xs text-slate-500 dark:text-slate-400">Favorites are kept only while this page is open; they are not uploaded or saved to an account.</p>
    </div>
  );
}

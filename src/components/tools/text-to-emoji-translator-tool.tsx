"use client";

import { useMemo, useState } from "react";

type Density = "light" | "balanced" | "expressive";
type Tone = "friendly" | "funny" | "professional" | "romantic" | "motivational";

const phraseMap: Array<[RegExp, string]> = [
  [/\b(hello|hi|hey)\b/gi, "👋"],
  [/\b(bye|goodbye|see you)\b/gi, "👋"],
  [/\b(love|loving|loved)\b/gi, "❤️"],
  [/\b(happy|happiness|glad|joyful)\b/gi, "😊"],
  [/\b(sad|sadness|unhappy)\b/gi, "😢"],
  [/\b(laugh|laughing|funny|joke)\b/gi, "😂"],
  [/\b(laugh out loud|lol)\b/gi, "🤣"],
  [/\b(cry|crying|tears)\b/gi, "😭"],
  [/\b(angry|anger|mad)\b/gi, "😠"],
  [/\b(thank you|thanks|thankful)\b/gi, "🙏"],
  [/\b(please)\b/gi, "🙏"],
  [/\b(yes|yeah|yep|agree)\b/gi, "✅"],
  [/\b(no|nope|disagree)\b/gi, "❌"],
  [/\b(okay|ok|fine)\b/gi, "👌"],
  [/\b(good|great|excellent|awesome)\b/gi, "🌟"],
  [/\b(bad|terrible|awful)\b/gi, "👎"],
  [/\b(friend|friends|friendship)\b/gi, "🫂"],
  [/\b(family|parents|mom|mother|dad|father)\b/gi, "👨‍👩‍👧‍👦"],
  [/\b(home|house)\b/gi, "🏠"],
  [/\b(work|job|career)\b/gi, "💼"],
  [/\b(money|cash|payment|paid)\b/gi, "💰"],
  [/\b(buy|shopping|shop)\b/gi, "🛍️"],
  [/\b(food|eat|eating|hungry)\b/gi, "🍽️"],
  [/\b(pizza)\b/gi, "🍕"],
  [/\b(coffee)\b/gi, "☕"],
  [/\b(water|drink)\b/gi, "💧"],
  [/\b(sleep|sleepy|tired)\b/gi, "😴"],
  [/\b(health|healthy|fitness|gym|workout)\b/gi, "💪"],
  [/\b(book|study|learning|learn|education|exam)\b/gi, "📚"],
  [/\b(idea|ideas|think|thinking)\b/gi, "💡"],
  [/\b(smart|intelligent)\b/gi, "🧠"],
  [/\b(phone|call|calling)\b/gi, "📱"],
  [/\b(message|texting|chat)\b/gi, "💬"],
  [/\b(computer|laptop|coding|code|programming|developer)\b/gi, "💻"],
  [/\b(internet|online|website|web)\b/gi, "🌐"],
  [/\b(music|song|singing)\b/gi, "🎵"],
  [/\b(dance|dancing)\b/gi, "💃"],
  [/\b(travel|trip|vacation|holiday)\b/gi, "✈️"],
  [/\b(car|drive|driving)\b/gi, "🚗"],
  [/\b(train|railway)\b/gi, "🚆"],
  [/\b(rain|rainy)\b/gi, "🌧️"],
  [/\b(sun|sunny|sunshine)\b/gi, "☀️"],
  [/\b(weather|cloudy)\b/gi, "🌤️"],
  [/\b(nature|tree|forest)\b/gi, "🌳"],
  [/\b(flower|flowers)\b/gi, "🌸"],
  [/\b(dog|puppy)\b/gi, "🐶"],
  [/\b(cat|kitten)\b/gi, "🐱"],
  [/\b(birthday|party|celebrate|celebration)\b/gi, "🎉"],
  [/\b(congratulations|congrats)\b/gi, "🎊"],
  [/\b(success|successful|win|winning)\b/gi, "🏆"],
  [/\b(goal|goals|target)\b/gi, "🎯"],
  [/\b(motivation|motivated|inspire|inspired)\b/gi, "🚀"],
  [/\b(fire|amazing|lit)\b/gi, "🔥"],
  [/\b(beautiful|beauty|pretty)\b/gi, "😍"],
  [/\b(cute|adorable)\b/gi, "🥰"],
  [/\b(cool|nice)\b/gi, "😎"],
  [/\b(surprise|surprised|wow)\b/gi, "😲"],
  [/\b(scared|afraid|fear)\b/gi, "😨"],
  [/\b(confused|confusing)\b/gi, "🤔"],
  [/\b(wait|waiting)\b/gi, "⏳"],
  [/\b(time|clock|deadline)\b/gi, "⏰"],
  [/\b(fast|quick|quickly)\b/gi, "⚡"],
  [/\b(world|earth|planet)\b/gi, "🌍"],
  [/\b(heart|hearts)\b/gi, "💖"],
  [/\b(star|stars)\b/gi, "⭐"],
  [/\b(fireworks)\b/gi, "🎆"],
  [/\b(hope|hopeful)\b/gi, "🌈"],
  [/\b(peace|calm)\b/gi, "🕊️"],
  [/\b(pray|prayer)\b/gi, "🙏"],
  [/\b(important|urgent)\b/gi, "❗"],
  [/\b(question|why|how)\b/gi, "❓"],
];

const toneExtras: Record<Tone, string> = {
  friendly: " 😊🤝",
  funny: " 😂🤣",
  professional: " ✅📌",
  romantic: " 💖🥰",
  motivational: " 🚀💪",
};

function translate(input: string, density: Density, tone: Tone): string {
  if (!input.trim()) return "";
  let result = input;
  const used = new Set<string>();
  for (const [pattern, emoji] of phraseMap) {
    pattern.lastIndex = 0;
    if (pattern.test(result)) {
      pattern.lastIndex = 0;
      result = result.replace(pattern, (match) => {
        used.add(emoji);
        if (density === "light") return `${match} ${emoji}`;
        if (density === "expressive") return `${emoji}${emoji}`;
        return `${match} ${emoji}`;
      });
    }
  }
  if (density === "expressive") result += toneExtras[tone];
  return result;
}

export default function TextToEmojiTranslatorTool() {
  const [input, setInput] = useState("");
  const [density, setDensity] = useState<Density>("balanced");
  const [tone, setTone] = useState<Tone>("friendly");
  const output = useMemo(() => translate(input, density, tone), [input, density, tone]);

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      // Clipboard access can be blocked by browser permissions.
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-lg font-semibold">Your text</h2>
          <p className="mt-1 text-sm text-slate-500">Translate common words and phrases into emoji-enhanced text.</p>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: Hey friend, good luck with your exam! You can do it."
          aria-label="Text to translate"
          className="min-h-64 w-full resize-y rounded-xl border border-slate-300 bg-transparent p-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="emoji-density" className="mb-1.5 block text-sm font-medium">Emoji density</label>
            <select id="emoji-density" value={density} onChange={(e) => setDensity(e.target.value as Density)} className="w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2.5 text-sm dark:border-slate-700">
              <option value="light">Light — preserve wording</option>
              <option value="balanced">Balanced — add relevant emoji</option>
              <option value="expressive">Expressive — extra emoji flair</option>
            </select>
          </div>
          <div>
            <label htmlFor="emoji-tone" className="mb-1.5 block text-sm font-medium">Tone</label>
            <select id="emoji-tone" value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2.5 text-sm dark:border-slate-700">
              <option value="friendly">Friendly</option><option value="funny">Funny</option><option value="professional">Professional</option><option value="romantic">Romantic</option><option value="motivational">Motivational</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setInput("")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Clear</button>
          <button type="button" onClick={() => setInput("Hey friend, good luck with your exam! Keep learning, stay healthy, and believe in yourself. You can achieve your goals!") } className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Try sample</button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Emoji-enhanced text</h2>
            <p className="mt-1 text-sm text-slate-500">Output updates automatically.</p>
          </div>
          <button type="button" onClick={copyOutput} disabled={!output} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">Copy output</button>
        </div>
        <div className="min-h-64 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-base leading-8 dark:border-slate-800 dark:bg-slate-950">
          {output || <span className="text-sm text-slate-400">Your translated text will appear here.</span>}
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">This is a keyword-based helper, not a language-understanding AI translator. Unrecognized words remain unchanged, and emoji meaning can vary by context or platform.</p>
      </section>
    </div>
  );
}

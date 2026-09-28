/**
 * Input-script detection for detect(): the walk only transliterates
 * systems whose source script matches the input — loading all 288 maps
 * per request exceeds the Workers CPU budget (1102s in production).
 * Ranges cover exactly the source scripts present in the corpus.
 */

type ScriptName = string

const SCRIPT_RANGES: ReadonlyArray<
  readonly [ScriptName, ReadonlyArray<readonly [number, number]>]
> = [
  [
    "Latn",
    [
      [0x41, 0x5a],
      [0x61, 0x7a],
      [0xc0, 0xff],
      [0x100, 0x24f],
    ],
  ],
  [
    "Grek",
    [
      [0x370, 0x3ff],
      [0x1f00, 0x1fff],
    ],
  ],
  ["Cyrl", [[0x400, 0x52f]]],
  ["Armn", [[0x530, 0x58f]]],
  ["Hebr", [[0x590, 0x5ff]]],
  [
    "Arab",
    [
      [0x600, 0x6ff],
      [0x750, 0x77f],
      [0xfb50, 0xfdff],
      [0xfe70, 0xfeff],
    ],
  ],
  ["Deva", [[0x900, 0x97f]]],
  ["Beng", [[0x980, 0x9ff]]],
  ["Guru", [[0xa00, 0xa7f]]],
  ["Gujr", [[0xa80, 0xaff]]],
  ["Orya", [[0xb00, 0xb7f]]],
  ["Taml", [[0xb80, 0xbff]]],
  ["Telu", [[0xc00, 0xc7f]]],
  ["Kana", [[0xc80, 0xcff]]],
  ["Mlym", [[0xd00, 0xd7f]]],
  ["Sinh", [[0xd80, 0xdff]]],
  ["Thaa", [[0x780, 0x7bf]]],
  ["Thai", [[0xe00, 0xe7f]]],
  [
    "Geor",
    [
      [0x10a0, 0x10ff],
      [0x1c90, 0x1cbf],
    ],
  ],
  ["Ethi", [[0x1200, 0x137f]]],
  ["Mong", [[0x1800, 0x18af]]],
  [
    "Hang",
    [
      [0x1100, 0x11ff],
      [0x3130, 0x318f],
      [0xac00, 0xd7af],
    ],
  ],
  [
    "Hrkt",
    [
      [0x3040, 0x309f],
      [0x30a0, 0x30ff],
      [0x31f0, 0x31ff],
    ],
  ],
  [
    "Hani",
    [
      [0x2e80, 0x2eff],
      [0x3400, 0x4dbf],
      [0x4e00, 0x9fff],
      [0xf900, 0xfaff],
      [0x20000, 0x2a6df],
    ],
  ],
]

function scriptOfCodePoint(cp: number): ScriptName | null {
  for (const [script, ranges] of SCRIPT_RANGES) {
    for (const [lo, hi] of ranges) {
      if (cp >= lo && cp <= hi) return script
    }
  }
  return null
}

export function detectInputScript(input: string): ScriptName | null {
  const counts = new Map<ScriptName, number>()
  for (const ch of input) {
    const script = scriptOfCodePoint(ch.codePointAt(0)!)
    if (script) counts.set(script, (counts.get(script) ?? 0) + 1)
  }
  let best: ScriptName | null = null
  let bestWeighted = 0
  for (const [script, n] of counts) {
    // A Latin majority is the weakest signal: one stray non-Latin letter
    // outranks any amount of Latin.
    const weighted = script === "Latn" ? n - 0.5 : n
    if (weighted > bestWeighted) {
      best = script
      bestWeighted = weighted
    }
  }
  return best
}

// Detected script → corpus source_script values that can legitimately
// process it ("Kana" is Kannada in this corpus; "Kore" is the mixed
// Hangul+Latin jamo family; "Hrkt" is Japanese kana).
const FAMILIES: Readonly<Record<ScriptName, readonly string[]>> = {
  Latn: ["Latn"],
  Grek: ["Grek"],
  Cyrl: ["Cyrl"],
  Armn: ["Armn"],
  Hebr: ["Hebr"],
  Arab: ["Arab"],
  Deva: ["Deva"],
  Beng: ["Beng"],
  Guru: ["Guru"],
  Gujr: ["Gujr"],
  Orya: ["Orya"],
  Taml: ["Taml"],
  Telu: ["Telu"],
  Kana: ["Kana"],
  Mlym: ["Mlym"],
  Sinh: ["Sinh"],
  Thai: ["Thai"],
  Thaa: ["Thaa"],
  Ethi: ["Ethi"],
  Mong: ["Mong"],
  Geor: ["Geor"],
  Hang: ["Hang", "Kore"],
  Hrkt: ["Hrkt", "Kore"],
  Hani: ["Hani", "Hans", "Kore", "Hrkt"],
}

export function sourceMatchesScript(sourceScript: string | undefined, detected: string): boolean {
  const family = FAMILIES[detected]
  return !!sourceScript && !!family && family.includes(sourceScript)
}

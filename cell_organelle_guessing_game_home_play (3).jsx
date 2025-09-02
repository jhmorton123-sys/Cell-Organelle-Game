import React, { useEffect, useMemo, useState } from "react";

/**
 * Cell Organelle Guessing Game — Tablet‑friendly React app
 * v1.2 — adds:
 *   • Art reveal modes: Always vs Only on wrong answer
 *   • Art style: Built‑in SVGs or teacher‑supplied image URLs per organelle
 *   • Self‑tests for basic sanity checks
 *
 * Teacher notes:
 *  - To use REAL images/icons, add an `img` URL per organelle below (ORGANELLES[].img) and set Art Style → "Real Images".
 *  - To show the picture only when a student gets it wrong, set Art Reveal → "Only on wrong answer".
 *  - All settings persist per‑device via localStorage.
 */

// ------------------------ Data ------------------------

type Organelle = {
  name: string;
  aliases?: string[]; // accepted answers besides the formal name
  in: "plant" | "animal" | "both";
  emoji?: string;
  function: string;
  clues: string[]; // ordered from most cryptic → most obvious
  img?: string; // optional: public URL to a diagram/icon (teacher supplied)
};

const ORGANELLES: Organelle[] = [
  {
    name: "Nucleus",
    aliases: ["control center"],
    in: "both",
    emoji: "🧠",
    function: "Holds DNA; controls cell activities.",
    clues: [
      "I'm like the principal's office for the cell.",
      "I store the genome—cell's master plan.",
      "I control what the cell does.",
      "I contain the DNA.",
    ],
    img: "", // ← optional
  },
  {
    name: "Nucleolus",
    aliases: ["rRNA factory"],
    in: "both",
    emoji: "🔴",
    function: "Builds ribosome pieces (rRNA).",
    clues: [
      "I'm a VIP room inside the principal's office.",
      "I assemble parts used to make protein factories.",
      "I make rRNA and ribosomal subunits.",
    ],
    img: "",
  },
  {
    name: "Ribosome",
    aliases: ["ribosomes"],
    in: "both",
    emoji: "⚙️",
    function: "Protein synthesis (reads mRNA).",
    clues: [
      "Tiny chefs that follow a recipe (mRNA).",
      "Some of us float; some of us ride the ER.",
      "We build proteins from amino acids.",
    ],
    img: "",
  },
  {
    name: "Rough Endoplasmic Reticulum",
    aliases: ["rough er", "rER", "rough endoplasmic reticulum"],
    in: "both",
    emoji: "🧵",
    function: "Folds and modifies proteins; dotted with ribosomes.",
    clues: [
      "A maze of membranes wearing polka‑dot ribosomes.",
      "Proteins enter me for folding and finishing.",
      "I'm the 'rough' version of a famous hallway system.",
    ],
    img: "",
  },
  {
    name: "Smooth Endoplasmic Reticulum",
    aliases: ["smooth er", "sER", "smooth endoplasmic reticulum"],
    in: "both",
    emoji: "🥛",
    function: "Makes lipids; detox; calcium storage.",
    clues: [
      "I'm smooth—no ribosomes on my walls.",
      "I craft lipids and help with detox.",
      "I'm the 'smooth' version of the ER hallways.",
    ],
    img: "",
  },
  {
    name: "Golgi Apparatus",
    aliases: ["golgi", "golgi body", "golgi complex"],
    in: "both",
    emoji: "📦",
    function: "Sorts, packages, and ships proteins and lipids.",
    clues: [
      "I slap labels and barcodes on cellular packages.",
      "I modify, sort, and ship molecules in vesicles.",
      "I'm the cell's post office.",
    ],
    img: "",
  },
  {
    name: "Lysosome",
    aliases: ["lysosomes"],
    in: "animal",
    emoji: "🧪",
    function: "Digestive sacs; break down waste and invaders.",
    clues: [
      "I’m the clean‑up crew with enzymes.",
      "I digest broken parts and invaders.",
      "Mostly in animal cells.",
    ],
    img: "",
  },
  {
    name: "Peroxisome",
    aliases: ["peroxisomes"],
    in: "both",
    emoji: "🧴",
    function: "Detoxify harmful byproducts; break down fatty acids.",
    clues: [
      "I bubble with reactions that detox the cell.",
      "I break down fatty acids and neutralize peroxide.",
    ],
    img: "",
  },
  {
    name: "Mitochondrion",
    aliases: ["mitochondria", "powerhouse"],
    in: "both",
    emoji: "🔋",
    function: "Cellular respiration; makes ATP (energy).",
    clues: [
      "Students keep calling me the powerhouse… and they're not wrong.",
      "I turn glucose + oxygen into usable ATP.",
      "Double membrane + folded inner cristae.",
    ],
    img: "",
  },
  {
    name: "Chloroplast",
    aliases: ["chloroplasts"],
    in: "plant",
    emoji: "🌿",
    function: "Photosynthesis; makes glucose using sunlight.",
    clues: [
      "I'm green and love the sun.",
      "I turn light energy into glucose.",
      "Found in plants (and some protists).",
    ],
    img: "",
  },
  {
    name: "Cell Membrane",
    aliases: ["plasma membrane", "membrane"],
    in: "both",
    emoji: "🚪",
    function: "Selectively permeable barrier; maintains homeostasis.",
    clues: [
      "I’m the bouncer—selective about who gets in/out.",
      "Phospholipid bilayer with proteins.",
      "Controls transport: diffusion, osmosis, active transport.",
    ],
    img: "",
  },
  {
    name: "Cell Wall",
    aliases: ["wall"],
    in: "plant",
    emoji: "🧱",
    function: "Rigid support and protection outside the membrane.",
    clues: [
      "I keep plant cells sturdy and upright.",
      "Made of cellulose in plants.",
      "Outside the cell membrane.",
    ],
    img: "",
  },
  {
    name: "Cytoplasm",
    aliases: ["cytosol"],
    in: "both",
    emoji: "🌊",
    function: "Gel‑like interior where organelles sit and reactions happen.",
    clues: [
      "I’m the jelly where everything floats.",
      "Many reactions happen in me.",
      "I fill the cell between membrane and nucleus.",
    ],
    img: "",
  },
  {
    name: "Vacuole",
    aliases: ["central vacuole", "vacuoles"],
    in: "both",
    emoji: "💧",
    function: "Storage of water and materials; big and central in plants.",
    clues: [
      "I’m storage—especially water. Bigger in plants.",
      "I help maintain turgor pressure.",
      "Central version dominates plant cells.",
    ],
    img: "",
  },
  {
    name: "Vesicle",
    aliases: ["vesicles"],
    in: "both",
    emoji: "📫",
    function: "Small transport bubbles moving cargo around.",
    clues: [
      "Tiny packages for delivery.",
      "I bud from ER/Golgi to move cargo.",
    ],
    img: "",
  },
  {
    name: "Cytoskeleton",
    aliases: ["microtubules", "microfilaments", "intermediate filaments"],
    in: "both",
    emoji: "🕸️",
    function: "Cell shape, movement, and internal highways.",
    clues: [
      "I’m the scaffolding and the road system.",
      "Microtubules, microfilaments, and more.",
      "I help cells move and divide.",
    ],
    img: "",
  },
  {
    name: "Centrioles",
    aliases: ["centriole", "centrosome"],
    in: "animal",
    emoji: "🎯",
    function: "Organize spindle fibers during cell division.",
    clues: [
      "I’m the organizer for cell division in animals.",
      "I help pull chromosomes apart.",
    ],
    img: "",
  },
];

// ------------------------ Helpers ------------------------

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

// ------------------------ Settings ------------------------

type Settings = {
  mode: "multiple" | "type";
  difficulty: "easy" | "medium" | "hard";
  rounds: number; // questions per game
  timePerQuestion: number; // seconds
  includePlantOnly: boolean; // include plant‑only organelles
  includeAnimalOnly: boolean; // include animal‑only organelles
  hintsAllowed: boolean;
  artReveal: "always" | "onWrong";
  artStyle: "svg" | "image";
};

const DEFAULT_SETTINGS: Settings = {
  mode: "multiple",
  difficulty: "medium",
  rounds: 10,
  timePerQuestion: 25,
  includePlantOnly: true,
  includeAnimalOnly: true,
  hintsAllowed: true,
  artReveal: "always",
  artStyle: "svg",
};

const useLocal = <T,>(key: string, initial: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
};

// ------------------------ Components ------------------------

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
      {children}
    </span>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full h-3 bg-gray-200 rounded-2xl overflow-hidden shadow-inner">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// Visual: lightweight SVGs per organelle (no labels) + blur that eases as clues reveal
function OrganelleArt({ name, clarity = 0.3 }: { name: string; clarity?: number }) {
  // clarity in [0,1] → less blur with more clarity
  const blur = Math.max(0, 6 - Math.round(clarity * 6));
  const n = name.toLowerCase();
  const commonSvgProps = { viewBox: "0 0 200 140", className: "w-full h-40" } as const;

  if (n.includes("mitochond")) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        <defs>
          <linearGradient id="mitoG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b"/>
            <stop offset="100%" stopColor="#f97316"/>
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="70" rx="80" ry="40" fill="url(#mitoG)" stroke="#b45309" strokeWidth="3"/>
        <path d="M30 55 C60 35, 85 80, 110 60 S150 40, 170 80" fill="none" stroke="#7c2d12" strokeWidth="4"/>
        <path d="M30 80 C60 100, 85 55, 110 85 S150 100, 170 60" fill="none" stroke="#7c2d12" strokeWidth="4"/>
      </svg>
    );
  }
  if (n.includes("chloroplast")) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        <defs>
          <linearGradient id="chlG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22c55e"/>
            <stop offset="100%" stopColor="#16a34a"/>
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="70" rx="85" ry="45" fill="url(#chlG)" stroke="#14532d" strokeWidth="3"/>
        {[50,70,90].map((y,i)=> (
          <rect key={i} x="45" y={y} width="110" height="12" rx="6" fill="#065f46" opacity="0.85" />
        ))}
      </svg>
    );
  }
  if (n.includes("nucleus")) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        <circle cx="100" cy="70" r="58" fill="#93c5fd" stroke="#2563eb" strokeWidth="3"/>
        <circle cx="120" cy="60" r="18" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="2"/>
        <circle cx="120" cy="60" r="6" fill="#1e3a8a" />
      </svg>
    );
  }
  if (n.includes("golgi")) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        {[0,1,2,3].map((i)=> (
          <path key={i} d={`M40 ${40+i*18} C 90 ${20+i*18}, 130 ${60+i*18}, 160 ${35+i*18}`} fill="none" stroke="#a855f7" strokeWidth={8 - i} strokeLinecap="round"/>
        ))}
      </svg>
    );
  }
  if (n.includes("rough endoplasmic") || (n.includes("rough") && n.includes("er"))) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        <path d="M20 40 Q60 20, 100 40 T180 40" fill="none" stroke="#0ea5e9" strokeWidth="6"/>
        <path d="M20 70 Q60 50, 100 70 T180 70" fill="none" stroke="#0ea5e9" strokeWidth="6"/>
        <path d="M20 100 Q60 80, 100 100 T180 100" fill="none" stroke="#0ea5e9" strokeWidth="6"/>
        {Array.from({length:18}).map((_,i)=> (
          <circle key={i} cx={20 + (i%9)*18} cy={ i<9? 35:95 } r="3" fill="#1f2937"/>
        ))}
      </svg>
    );
  }
  if (n.includes("smooth endoplasmic") || (n.includes("smooth") && n.includes("er"))) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        <path d="M15 40 Q60 10, 110 40 T185 40" fill="none" stroke="#38bdf8" strokeWidth="6"/>
        <path d="M15 75 Q60 45, 110 75 T185 75" fill="none" stroke="#38bdf8" strokeWidth="6"/>
        <path d="M15 110 Q60 80, 110 110 T185 110" fill="none" stroke="#38bdf8" strokeWidth="6"/>
      </svg>
    );
  }
  if (n.includes("ribosome")) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        <path d="M20 100 C60 40, 140 40, 180 100" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 4"/>
        {Array.from({length:10}).map((_,i)=> (
          <g key={i} transform={`translate(${30+i*14}, ${80 - (i%2)*10})`}>
            <ellipse cx="0" cy="0" rx="8" ry="6" fill="#64748b" />
            <circle cx="0" cy="-5" r="4" fill="#94a3b8" />
          </g>
        ))}
      </svg>
    );
  }
  if (n.includes("lysosome")) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        <circle cx="100" cy="70" r="40" fill="#fca5a5" stroke="#ef4444" strokeWidth="3"/>
        {Array.from({length:6}).map((_,i)=> (
          <polygon key={i} points={`${90+i*4},60 ${100+i*4},70 ${90+i*4},80`} fill="#7f1d1d" opacity="0.7" />
        ))}
      </svg>
    );
  }
  if (n.includes("vacuole")) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        <ellipse cx="110" cy="70" rx="65" ry="40" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="3"/>
        <circle cx="140" cy="55" r="10" fill="#e0f2fe" />
      </svg>
    );
  }
  if (n.includes("vesicle")) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        <circle cx="70" cy="70" r="18" fill="#fde68a" stroke="#f59e0b" strokeWidth="3"/>
        <path d="M88 70 L130 70" stroke="#374151" strokeWidth="3" markerEnd="url(#arrow)"/>
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#374151" />
          </marker>
        </defs>
      </svg>
    );
  }
  if (n.includes("cell membrane") || n === "membrane" || n.includes("plasma membrane")) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        <rect x="20" y="30" width="160" height="80" fill="#ecfeff" stroke="#0891b2" strokeWidth="3" rx="10"/>
        {[35,55,75,95].map((y,i)=> (
          <g key={i}>
            {Array.from({length:8}).map((_,j)=> (
              <circle key={j} cx={40+j*16} cy={y} r="3" fill="#0ea5e9" />
            ))}
          </g>
        ))}
      </svg>
    );
  }
  if (n.includes("cell wall")) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        <rect x="10" y="15" width="180" height="110" fill="#dcfce7" stroke="#16a34a" strokeWidth="10" rx="8"/>
        <rect x="30" y="35" width="140" height="70" fill="#f0fdf4" stroke="#22c55e" strokeWidth="3" rx="8"/>
      </svg>
    );
  }
  if (n.includes("cytoskeleton")) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        <path d="M10 120 C30 60, 80 90, 120 30 S170 60, 190 20" fill="none" stroke="#6b7280" strokeWidth="4"/>
        <path d="M10 20 C40 70, 90 50, 120 110 S160 90, 190 120" fill="none" stroke="#9ca3af" strokeWidth="3"/>
        <path d="M40 30 L60 50 M120 60 L140 80 M80 90 L100 110" stroke="#111827" strokeWidth="3"/>
      </svg>
    );
  }
  if (n.includes("centriole")) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        <g transform="translate(70,70) rotate(-25)">
          <rect x="-30" y="-12" width="60" height="24" fill="#fcd34d" stroke="#d97706" strokeWidth="3" rx="6"/>
          {Array.from({length:6}).map((_,i)=> (
            <rect key={i} x={-26 + i*9} y={-10} width="6" height="20" fill="#f59e0b" />
          ))}
        </g>
        <g transform="translate(120,70) rotate(65)">
          <rect x="-30" y="-12" width="60" height="24" fill="#fcd34d" stroke="#d97706" strokeWidth="3" rx="6"/>
          {Array.from({length:6}).map((_,i)=> (
            <rect key={i} x={-26 + i*9} y={-10} width="6" height="20" fill="#f59e0b" />
          ))}
        </g>
      </svg>
    );
  }
  if (n.includes("peroxisome")) {
    return (
      <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
        <circle cx="100" cy="70" r="35" fill="#dbeafe" stroke="#60a5fa" strokeWidth="3"/>
        <circle cx="85" cy="60" r="6" fill="#3b82f6" />
        <circle cx="115" cy="80" r="4" fill="#3b82f6" />
        <circle cx="105" cy="55" r="5" fill="#2563eb" />
      </svg>
    );
  }
  // default / cytoplasm
  return (
    <svg {...commonSvgProps} style={{ filter: `blur(${blur}px)` }}>
      <rect x="10" y="10" width="180" height="120" rx="10" fill="#e2e8f0"/>
      <circle cx="60" cy="70" r="6" fill="#94a3b8"/>
      <circle cx="90" cy="90" r="4" fill="#94a3b8"/>
      <circle cx="140" cy="60" r="5" fill="#94a3b8"/>
    </svg>
  );
}

// Single question generator based on settings
function useQuestionPool(settings: Settings) {
  const pool = useMemo(() => {
    let items = ORGANELLES.filter((o) => {
      if (!settings.includePlantOnly && o.in === "plant") return false;
      if (!settings.includeAnimalOnly && o.in === "animal") return false;
      return true;
    });
    return shuffle(items);
  }, [settings.includeAnimalOnly, settings.includePlantOnly]);
  return pool;
}

// Scoring rules
const SCORE_CORRECT = 100;
const STREAK_BONUS = 15; // per streak step
const HINT_COST = 20; // subtract when revealing a hint

// Clamp clues by difficulty: fewer clues at start for harder modes
function visibleClueCount(diff: Settings["difficulty"]) {
  if (diff === "easy") return 2;
  if (diff === "hard") return 0;
  return 1; // medium
}

// Helper to decide whether to show art in Play
function shouldShowArt(settings: Settings, feedback: null | {correct: boolean}) {
  if (settings.artReveal === "always") return true;
  // onWrong → only after an incorrect attempt
  return !!(feedback && feedback.correct === false);
}

// ------------------------ Main App ------------------------

export default function App() {
  const [settings, setSettings] = useLocal<Settings>(
    "organelle_game_settings_v2",
    DEFAULT_SETTINGS
  );
  const [highScore, setHighScore] = useLocal<number>(
    "organelle_game_highscore_v1",
    0
  );
  const [screen, setScreen] = useState<"menu" | "play" | "result">("menu");
  const pool = useQuestionPool(settings);

  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timePerQuestion);
  const [revealedClues, setRevealedClues] = useState<number>(
    visibleClueCount(settings.difficulty)
  );
  const [answer, setAnswer] = useState("");
  const [choices, setChoices] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<
    null | { correct: boolean; expected: string }
  >(null);
  const [history, setHistory] = useState<
    { name: string; correct: boolean; your?: string }[]
  >([]);

  const current = pool[roundIndex % pool.length];

  // Build multiple choice distractors based on difficulty
  useEffect(() => {
    if (settings.mode !== "multiple") return;
    const distractorCount = settings.difficulty === "easy" ? 2 : 3;
    const others = shuffle(
      ORGANELLES.filter((o) => o.name !== current.name)
        .filter((o) => (settings.difficulty === "hard" ? o.in === current.in : true))
        .map((o) => o.name)
    ).slice(0, distractorCount);
    const opts = shuffle([current.name, ...others]);
    setChoices(opts);
  }, [current, settings.mode, settings.difficulty]);

  // Timer
  useEffect(() => {
    if (screen !== "play" || feedback) return; // pause on feedback
    setTimeLeft(settings.timePerQuestion);
  }, [roundIndex, screen]);

  useEffect(() => {
    if (screen !== "play" || feedback) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, screen, feedback]);

  // Start game
  const startGame = () => {
    setRoundIndex(0);
    setScore(0);
    setStreak(0);
    setHistory([]);
    setFeedback(null);
    setAnswer("");
    setRevealedClues(visibleClueCount(settings.difficulty));
    setScreen("play");
  };

  // Normalize acceptance of aliases
  const matches = (input: string, org: Organelle) => {
    const n = normalize(input);
    const names = [org.name, ...(org.aliases || [])].map(normalize);
    return names.includes(n);
  };

  const handleSubmit = (choice?: string) => {
    const expected = current.name;
    const userInput = settings.mode === "multiple" ? choice || "" : answer;
    const isCorrect = matches(userInput, current);

    let delta = 0;
    if (isCorrect) {
      delta = SCORE_CORRECT + streak * STREAK_BONUS + Math.ceil((timeLeft / settings.timePerQuestion) * 40);
    } else {
      delta = 0;
    }

    setScore((s) => s + delta);
    setStreak((s) => (isCorrect ? s + 1 : 0));
    setFeedback({ correct: isCorrect, expected });
    setHistory((h) => [
      ...h,
      { name: expected, correct: isCorrect, your: settings.mode === "multiple" ? userInput : answer },
    ]);
  };

  const nextQuestion = () => {
    const last = feedback;
    setFeedback(null);
    setAnswer("");
    setRevealedClues(visibleClueCount(settings.difficulty));

    if (roundIndex + 1 >= settings.rounds) {
      // End game
      const newHigh = Math.max(highScore, score + (last?.correct ? 0 : 0));
      setHighScore(newHigh);
      setScreen("result");
    } else {
      setRoundIndex((i) => i + 1);
      setTimeLeft(settings.timePerQuestion);
    }
  };

  const useHint = () => {
    if (!settings.hintsAllowed) return;
    const more = current.clues.length - revealedClues;
    if (more <= 0) return;
    setRevealedClues((c) => c + 1);
    setScore((s) => Math.max(0, s - HINT_COST));
  };

  const percent = Math.round(((roundIndex + (feedback ? 1 : 0)) / settings.rounds) * 100);

  // ------------------------ UI Blocks ------------------------

  const Header = () => (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🧬</span>
        <h1 className="text-xl sm:text-2xl font-bold">Cell Organelle Challenge</h1>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Tag>High Score: {highScore}</Tag>
        <Tag>Score: {score}</Tag>
        <Tag>Streak: {streak}</Tag>
      </div>
    </div>
  );

  const Menu = () => (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <Header />
      <div className="grid md:grid-cols-2 gap-4">
        {/* Mode */}
        <div className="p-4 rounded-2xl border bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Mode</h2>
          <div className="flex gap-2 flex-wrap">
            {(["multiple", "type"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSettings({ ...settings, mode: m })}
                className={`px-3 py-2 rounded-xl border ${
                  settings.mode === m ? "bg-indigo-600 text-white" : "bg-gray-50"
                }`}
              >
                {m === "multiple" ? "Multiple Choice" : "Type Answer"}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="p-4 rounded-2xl border bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Difficulty</h2>
          <div className="flex gap-2 flex-wrap">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setSettings({ ...settings, difficulty: d })}
                className={`px-3 py-2 rounded-xl border ${
                  settings.difficulty === d ? "bg-indigo-600 text-white" : "bg-gray-50"
                }`}
              >
                {d[0].toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Easy: Fewer distractors & more initial clues • Hard: More distractors, fewer clues
          </p>
        </div>

        {/* Rounds & Time */}
        <div className="p-4 rounded-2xl border bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Game Length</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Rounds
              <input
                type="number"
                min={5}
                max={30}
                value={settings.rounds}
                onChange={(e) => setSettings({ ...settings, rounds: Number(e.target.value) })}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </label>
            <label className="text-sm">Seconds per question
              <input
                type="number"
                min={10}
                max={90}
                value={settings.timePerQuestion}
                onChange={(e) => setSettings({ ...settings, timePerQuestion: Number(e.target.value) })}
                className="mt-1 w-full border rounded-xl px-3 py-2"
              />
            </label>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 rounded-2xl border bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Content</h2>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.includePlantOnly}
                onChange={(e) => setSettings({ ...settings, includePlantOnly: e.target.checked })}
              />
              Include plant‑only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.includeAnimalOnly}
                onChange={(e) => setSettings({ ...settings, includeAnimalOnly: e.target.checked })}
              />
              Include animal‑only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.hintsAllowed}
                onChange={(e) => setSettings({ ...settings, hintsAllowed: e.target.checked })}
              />
              Allow hints (‑{HINT_COST} pts)
            </label>
          </div>
        </div>

        {/* Visuals */}
        <div className="p-4 rounded-2xl border bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Visuals</h2>
          <div className="flex gap-2 flex-wrap">
            <div className="space-y-2">
              <div className="text-sm font-medium">Art Reveal</div>
              {(["always", "onWrong"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setSettings({ ...settings, artReveal: r })}
                  className={`px-3 py-2 rounded-xl border ${settings.artReveal === r ? "bg-indigo-600 text-white" : "bg-gray-50"}`}
                >
                  {r === "always" ? "Always" : "Only on wrong answer"}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Art Style</div>
              {(["svg", "image"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSettings({ ...settings, artStyle: s })}
                  className={`px-3 py-2 rounded-xl border ${settings.artStyle === s ? "bg-indigo-600 text-white" : "bg-gray-50"}`}
                >
                  {s === "svg" ? "Built‑in SVGs" : "Real Images"}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">To use Real Images, paste a public image URL into each organelle’s <code>img</code> field in the code (top of file).</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Tip: Tablets work best in landscape. Add to home screen for a full‑screen feel.
        </div>
        <button
          onClick={startGame}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold shadow-lg hover:brightness-110"
        >
          Start Game ▶
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Built for Mr. Morton's classes • v1.2 — art reveal modes + image URLs
      </div>
    </div>
  );

  const Play = () => (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <Header />

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar value={settings.timePerQuestion - timeLeft} max={settings.timePerQuestion} />
          <div className="mt-1 text-xs text-gray-500">Time left: {timeLeft}s</div>
        </div>
        <div className="text-xs"><Tag>Round {roundIndex + 1} / {settings.rounds}</Tag></div>
      </div>

      <div className="p-4 rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl">{current.emoji || ""}</div>
          <div className="text-sm text-gray-500">{current.in === "both" ? "Plant & Animal" : current.in === "plant" ? "Plant‑only" : "Animal‑only"}</div>
        </div>

        {/* Visual area (conditional based on settings.artReveal) */}
        {shouldShowArt(settings, feedback) && (
          <div className="mb-3 rounded-2xl border bg-slate-50 p-2">
            {settings.artStyle === "image" && current.img ? (
              <img src={current.img} alt={current.name} className="w-full h-40 object-contain" />
            ) : (
              <OrganelleArt name={current.name} clarity={(revealedClues + 1) / Math.max(1, current.clues.length)} />
            )}
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span>{settings.artStyle === "image" ? "Teacher‑supplied diagram" : "Built‑in SVG hint"}</span>
              <span>Clarity: {Math.round(((revealedClues + 1) / Math.max(1, current.clues.length)) * 100)}%</span>
            </div>
          </div>
        )}

        <h2 className="font-semibold mb-2">Who am I?</h2>
        <ul className="list-disc ml-5 space-y-2">
          {current.clues.slice(0, revealedClues + 1).map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          {settings.hintsAllowed && (
            <button onClick={useHint} className="px-3 py-2 rounded-xl border bg-yellow-50 hover:bg-yellow-100">Reveal another clue (‑{HINT_COST})</button>
          )}
          <button onClick={() => setRevealedClues((c) => Math.min(c + 99, current.clues.length))} className="px-3 py-2 rounded-xl border">Show all clues</button>
        </div>
      </div>

      {/* Answer area */}
      {settings.mode === "multiple" ? (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
          {choices.map((opt) => (
            <button
              key={opt}
              disabled={!!feedback}
              onClick={() => handleSubmit(opt)}
              className={`p-4 rounded-2xl border shadow-sm text-left hover:shadow-md transition ${
                feedback && normalize(opt) === normalize(current.name) && "border-green-500"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            autoFocus
            value={answer}
            disabled={!!feedback}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            className="flex-1 px-4 py-3 rounded-2xl border"
            placeholder="Type the organelle name…"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!!feedback}
            className="px-4 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow"
          >
            Submit
          </button>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`p-4 rounded-2xl border ${feedback.correct ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
          {feedback.correct ? (
            <div className="font-semibold">✅ Correct! {current.name}</div>
          ) : (
            <div>
              <div className="font-semibold">❌ Not quite.</div>
              <div className="text-sm">Answer: <span className="font-semibold">{feedback.expected}</span></div>
            </div>
          )}
          <div className="text-sm mt-2 text-gray-700">Why: {current.function}</div>
          <div className="mt-3 flex gap-2">
            <button onClick={nextQuestion} className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50">Next ▶</button>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mt-2">
        <ProgressBar value={roundIndex + (feedback ? 1 : 0)} max={settings.rounds} />
        <div className="text-xs text-gray-500 mt-1">Game progress: {percent}%</div>
      </div>
    </div>
  );

  const Result = () => {
    const correct = history.filter((h) => h.correct).length;
    const missed = history.filter((h) => !h.correct);
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <Header />
        <div className="p-6 rounded-2xl border bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-2">Final Score: {score}</h2>
          <div className="text-sm text-gray-600 mb-3">You answered {correct} / {settings.rounds} correctly.</div>
          {score > highScore ? (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">🏆 New high score! Great job!</div>
          ) : (
            <div className="text-sm text-gray-500">High score to beat: {highScore}</div>
          )}
          <div className="mt-4 flex gap-2">
            <button onClick={() => setScreen("menu")} className="px-4 py-3 rounded-2xl border bg-white">Back to Menu</button>
            <button onClick={startGame} className="px-4 py-3 rounded-2xl bg-indigo-600 text-white">Play Again</button>
          </div>
        </div>

        {missed.length > 0 && (
          <div className="p-6 rounded-2xl border bg-white shadow-sm">
            <h3 className="font-semibold mb-3">Review the tough ones</h3>
            <ul className="space-y-3">
              {missed.map((m, idx) => {
                const org = ORGANELLES.find((o) => o.name === m.name)!;
                return (
                  <li key={idx} className="p-3 rounded-xl border">
                    <div className="font-semibold flex items-center gap-2">{org.emoji} {org.name}</div>
                    <div className="text-sm text-gray-700">{org.function}</div>
                    <div className="text-xs text-gray-500 mt-1">Accepted answers: {[org.name, ...(org.aliases||[])].join(", ")}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Tip: Screenshot this page to upload your score to Google Classroom if Mr. Morton asks!
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 p-4 sm:p-6">
      {screen === "menu" && <Menu />}
      {screen === "play" && <Play />}
      {screen === "result" && <Result />}
    </div>
  );
}

// ------------------------ Self-tests (dev) ------------------------

function runSelfTests() {
  try {
    const names = new Set<string>();
    for (const o of ORGANELLES) {
      if (names.has(o.name)) console.error("[Test] Duplicate organelle name:", o.name);
      names.add(o.name);
      if (!o.clues || o.clues.length === 0) console.error("[Test] No clues for:", o.name);
    }

    // visibleClueCount bounds
    if (visibleClueCount("easy") < 1) console.error("[Test] Easy should show >=1 clue");
    if (visibleClueCount("hard") !== 0) console.error("[Test] Hard should start at 0 clues");

    // Art reveal logic
    const tmpSettings: Settings = { ...DEFAULT_SETTINGS, artReveal: "onWrong" };
    if (shouldShowArt(tmpSettings, null) !== false) console.error("[Test] onWrong should hide art before answer");
    if (shouldShowArt(tmpSettings, {correct:false}) !== true) console.error("[Test] onWrong should show art after wrong");
    if (shouldShowArt(tmpSettings, {correct:true}) !== false) console.error("[Test] onWrong should hide art after correct");

    // normalize utility
    if (normalize("  Golgi-Body  ") !== "golgibody") console.error("[Test] normalize failed");

    console.log("[Self-tests] Completed.");
  } catch (e) {
    console.error("[Self-tests] Error:", e);
  }
}

runSelfTests();

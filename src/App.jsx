import { useState, useEffect, useRef, useCallback } from "react";

const G = {
  bg: "#0A0A0A", text: "#F5F0E8", dim: "#9A9488", dimmer: "#4A4640",
  gold: "#C8A96E", goldDim: "#7A6640", rose: "#C87E7E", teal: "#6E9EA8",
  glow: "rgba(200,169,110,0.12)", panel: "#0D0D0B", border: "#1E1C18",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=EB+Garamond:ital,wght@0,400;1,400&family=Cinzel:wght@300;400&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes twinkle{0%,100%{opacity:0;}50%{opacity:var(--mo,0.3);}}
@keyframes breathe{0%,100%{opacity:0.3;}50%{opacity:0.85;}}
@keyframes voidPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,169,110,0.06);}50%{box-shadow:0 0 40px 16px rgba(200,169,110,0.04);}}
.star{position:absolute;width:1px;height:1px;border-radius:50%;background:#9A9488;animation:twinkle var(--dur,4s) ease-in-out infinite;opacity:0;}
.wisdom{font-family:'Cormorant Garamond',serif;font-style:italic;line-height:1.85;}
.cinzel{font-family:'Cinzel',serif;}
.fade-up{animation:fadeUp 0.9s ease both;}
.fade-in{animation:fadeIn 0.6s ease both;}
.breathe{animation:breathe 2s ease-in-out infinite;}
textarea:focus,button:focus{outline:none;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#2A2820;border-radius:2px;}
.void-circle{animation:voidPulse 2.2s ease-in-out infinite;}
.prac-body{max-height:0;overflow:hidden;transition:max-height 1.1s cubic-bezier(0.4,0,0.2,1);}
.prac-body.open{max-height:900px;}

/* ── RESPONSIVE SHELL ── */
/* Mobile first — bottom nav */
.app-shell{display:flex;flex-direction:column;width:100vw;height:100vh;overflow:hidden;}
.sidebar{display:none;}
.main-content{display:flex;flex-direction:column;flex:1;overflow:hidden;}
.content-scroll{flex:1;overflow-y:auto;overflow-x:hidden;}
.mobile-nav{display:flex;position:fixed;bottom:0;left:0;right:0;height:64px;
  background:linear-gradient(to top,#0A0A0A 70%,transparent);
  align-items:center;justify-content:center;
  gap:clamp(0.5rem,4vw,2rem);z-index:50;padding:0 0.5rem;}
.mobile-topbar{display:flex;align-items:center;justify-content:space-between;
  padding:1rem 1.25rem 0;flex-shrink:0;}

/* Tablet and up — show sidebar */
@media(min-width:768px){
  .app-shell{flex-direction:row;}
  .sidebar{display:flex;flex-direction:column;width:220px;flex-shrink:0;
    border-right:1px solid #1E1C18;background:#0C0C0A;
    position:relative;overflow:hidden;}
  .mobile-nav{display:none;}
  .mobile-topbar{display:none;}
  .main-content{flex:1;min-width:0;}
}

/* Desktop — wider sidebar */
@media(min-width:1024px){
  .sidebar{width:260px;}
}

/* Mobile grids — stack to single column */
@media(max-width:767px){
  .two-col{grid-template-columns:1fr !important;}
  .three-col{grid-template-columns:1fr !important;}
  .tarot-grid{grid-template-columns:repeat(3,1fr) !important;}
}

/* Nav item hover */
.nav-item{transition:all 0.6s cubic-bezier(0.4,0,0.2,1);}
.nav-item:hover .nav-label{color:#9A9488 !important;}
`;

/* ─── DATA ─── */
const DOORS_FB = {
  grief: [
    { tradition: "Sufi · The Way of Longing", text: 'The Sufis call grief "Shawq" — the sacred ache of separation. It is not a wound to be healed, but a fire that proves the heart is alive. Rumi wrote that the flute weeps because it was cut from the reed bed. Your tears, too, are a form of music.', question: 'What is it, exactly, that you are separated from — and is some part of you still reaching toward it?' },
    { tradition: "Zen · The Gate of Impermanence", text: 'In the zendo, we sit with what is. Not what was, not what should be. Grief is the mind insisting that something impermanent should have been permanent. This is not a flaw in you — it is what love looks like when the beloved changes form.', question: 'If you could sit beside your grief — not inside it, but beside it — what would you notice about its shape?' },
    { tradition: "Kejawen · The Returning Water", text: 'In Javanese mysticism, sorrow is understood as water finding its level. You cannot stop water by clenching your hands. The water returns to its source — and so, in time, do you.', question: 'Where in your body does this grief live, and has it shifted at all since you first arrived here?' },
  ],
  fear: [
    { tradition: "Buddhism · Facing the Demons", text: 'Milarepa encountered demons in his cave. He tried arguing, attacking, fleeing — none worked. Finally, he walked into the mouth of the largest demon and found, inside it, only the echo of his own voice.', question: 'If you were to stop running from this fear — just for one breath — what is the very first thing you would see?' },
    { tradition: "Agnostic Philosophy · The Edge of the Known", text: 'Fear lives at the boundary of the self — the edge where the known ends and the unknown begins. This edge is uncomfortable precisely because you care. You would not fear losing what you do not love.', question: 'What does your fear tell you about what matters most to you?' },
    { tradition: "Sufi · The Beloved Behind the Veil", text: 'Sufis speak of the Beloved hidden behind seventy veils — and one of those veils is fear itself. The mystics did not conquer fear. They fell in love with something larger than it, and fear stepped aside.', question: 'Is there something you love large enough to walk toward instead of away from?' },
  ],
  default: [
    { tradition: "Zen · Beginner's Mind", text: "In the beginner's mind there are many possibilities. In the expert's mind there are few. You have arrived here with something — even if its name is unclear. The Compass does not need to know what it is to make space for it.", question: 'If you were to name what brought you here — not explain it, simply name it — what single word would you choose?' },
    { tradition: "Sufi · The Hidden Treasure", text: 'There is a hadith the Sufis love: "I was a hidden treasure, and I longed to be known." Whatever stirs in you — the seeking, the wondering, the ache — it is the hidden treasure longing to be recognized.', question: 'What in you is longing to be known — perhaps even by yourself?' },
    { tradition: "Taoism · The Valley Spirit", text: 'The valley does not announce itself. It simply remains open. Whatever fills it — rain, shadow, mist, or light — the valley does not judge the gift. You, too, may simply remain open for a time.', question: 'What would it feel like to ask nothing of this moment — to simply let it be?' },
  ],
};
function matchDoors(t) {
  if (/grief|loss|died|death|mourn|miss|gone/i.test(t)) return DOORS_FB.grief;
  if (/fear|afraid|anxious|anxiety|scare|terrif/i.test(t)) return DOORS_FB.fear;
  return DOORS_FB.default;
}

const HEXAGRAMS = [
  { name: "I · The Creative", text: "The dragon rises. What you carry has the force of beginning — raw, unformed, seeking its shape. This is not a time for retreat. The heavens move and ask you to move with them.", question: "What in you has been waiting to begin?" },
  { name: "II · The Receptive", text: "The earth receives without grasping. There is great strength in the one who does not insist. This is a time to be soft, to listen, to let what comes arrive without forcing it into a shape already decided.", question: "What might come to you, if you stopped reaching?" },
  { name: "XI · Peace", text: "Heaven descends; earth rises. The great and small find their proportion. What has been effortful may now soften. This is not complacency — it is the recognition that some things are, for this moment, in right relationship.", question: "Where in your life is something quietly in harmony, perhaps unnoticed?" },
  { name: "XXIX · The Abysmal", text: "Water falls and does not stop. Pass through — do not resist. The abyss is not punishment; it is depth. And depth, in time, becomes the source from which others drink.", question: "Can you trust that falling has a floor?" },
  { name: "XLVIII · The Well", text: "The water changes, but the well does not. Something in you is a well — a source that does not diminish when others draw from it. The question is whether the rope is long enough to reach it.", question: "How deep must you go before you touch what is unchanging in you?" },
];

const TAROT = [
  { name: "The Fool", sym: "☀", meaning: "Beginnings that trust themselves. Stepping from the cliff not in ignorance, but in faith." },
  { name: "The High Priestess", sym: "☽", meaning: "The knowledge that does not speak — it waits. The answer lives below the surface." },
  { name: "The Tower", sym: "⚡", meaning: "What falls was never a foundation. The clearing is frightening and necessary." },
  { name: "The Star", sym: "★", meaning: "Hope after devastation. You are pouring yourself out, and you are not running dry." },
  { name: "The Hermit", sym: "◎", meaning: "The light you seek is the light you carry. Turn it inward." },
  { name: "The Moon", sym: "◑", meaning: "The path is lit, but dimly. Trust the instinct that moves beneath reason." },
  { name: "Judgement", sym: "♩", meaning: "A call to become. The old version of you has done its work. Listen for what calls next." },
  { name: "The World", sym: "◉", meaning: "Completion. Not perfection — but wholeness. You have arrived, and the arriving was the point." },
  { name: "Strength", sym: "∞", meaning: "The lion is not conquered by force but by gentleness. What in you responds to kindness more than command?" },
  { name: "The Hanged Man", sym: "⊗", meaning: "Surrender is not defeat. The one who lets go sees the world differently." },
  { name: "Death", sym: "◈", meaning: "Transformation. Not loss — but change so complete it can feel like loss. What new form stirs?" },
  { name: "Temperance", sym: "≈", meaning: "The alchemy of patience. Two streams becoming one. Not urgency — integration." },
];

const VOID_FB = [
  { text: 'There is a word in Japanese — "ma" — the sacred pause between notes. What you carry may live in the ma. Not in what happened, and not yet in what comes next. In the space between.', question: 'Can you rest, for a moment, in the between?' },
  { text: 'The mystics agree: the void is not empty. It is full of a silence so complete it feels like sound. What you sent has already been received — not answered, but held.', question: 'What would it mean to be heard without being understood?' },
  { text: 'The Tao that can be named is not the eternal Tao. You may be touching something older than words.', question: 'If this feeling were a color — or a weather — what would it be?' },
];

const SHADOW_QS = [
  "What do you most dislike seeing in others — and when, if ever, have you glimpsed that same quality in yourself?",
  "What do you believe about yourself that you have never said aloud?",
  "What have you been forgiven for that you have not yet forgiven yourself for?",
  "What part of you did you leave behind in order to be acceptable to others?",
  "What do you want that you are ashamed of wanting?",
  "What grief have you been tending alone, that you have told no one about?",
];
const SHADOW_MIRRORS = [
  "What you have written holds more than you perhaps intended. The shadow does not ask for resolution. It asks only for witness. You have witnessed it.",
  "There is something raw in what you have shared. Raw is not broken. Raw is honest. And honesty, in this chamber, is the only currency.",
  "The one who could look at this is the one who can eventually carry it differently.",
  "What you call a flaw, the shadow calls a wound that learned to protect itself.",
];

const TALISMAN_LINES = [
  "You carried more than you were given credit for.",
  "The path did not abandon you. You are standing on it now.",
  "Something in you refused to stop. Call it grace or stubbornness — it kept you here.",
  "The wound you walked with was not a detour. It was the road.",
  "The compass was inside you. You were looking for someone to tell you it was there.",
  "There is light in you that predates your memory of it.",
  "The wandering was not wasted. Every pilgrim finds this out, eventually.",
];

const PRACTICES = [
  { tradition: "Zen Buddhism", title: "The Practice of Just Sitting", duration: "10–20 minutes", steps: ["Find a place where you will not be interrupted. Sit, or lie down if sitting brings pain.", "Set no intention for this time. You are not here to solve anything. You are here only to be.", "When thoughts arise — notice: 'thinking.' Then return to the breath, which has never stopped returning to you.", "If emotions surface, let them surface. Emotions that are witnessed do not ask to be fixed; they ask only to be seen.", "When the time is complete, sit for one additional moment before moving."] },
  { tradition: "Sufi Mysticism", title: "The Remembrance Breath (Zikr)", duration: "5–15 minutes", steps: ["Sit comfortably. Close your eyes if it feels safe.", "With each inhale, silently say 'La' — meaning: no, nothing, release.", "With each exhale, silently say 'Hu' — the divine breath, formless and full.", "La — Hu. La — Hu. Nothing — Everything. Release — Receive.", "Continue until you feel the breath breathing you, rather than you breathing it. That is enough."] },
  { tradition: "Taoist Philosophy", title: "Walking Without Destination", duration: "15–30 minutes", steps: ["Step outside, or find a space where you can walk freely.", "Decide before you begin: you will not go anywhere in particular.", "Walk more slowly than feels natural. Allow your gaze to soften.", "If your mind begins to plan or narrate: notice it, and return to the sensation of your feet.", "When you feel complete, stop. Stand still for a moment before turning back."] },
  { tradition: "Kabbalistic Contemplation", title: "The Practice of Kavvanah — Holy Attention", duration: "10 minutes", steps: ["Choose one object near you — a cup, a stone, a leaf, a flame, a window.", "Look at it as if you have never seen it before. You have not — not this exact version of it, in this light.", "Ask: what is this, really? Not its name or function, but its essence.", "Notice the moment when your usual mind gives up and something quieter takes over.", "Before you end, offer the object a moment of acknowledgment. It exists. You exist. This is a form of holiness."] },
  { tradition: "Shadow Integration · Jungian", title: "The Letter You Will Not Send", duration: "20 minutes", steps: ["Think of someone who irritates you — not someone who has harmed you, simply someone who provokes reaction.", "Write them a letter — one you will never send. Say everything. Use no filter.", "Read it back as if reading about yourself. Underline every criticism.", "For each phrase, ask: is there any version of this that lives in me?", "Fold the letter. You may burn it, bury it, or keep it. What matters is what you found."] },
  { tradition: "Kejawen · Javanese Mysticism", title: "Nrimo — The Practice of Receiving", duration: "Throughout the day", steps: ["Nrimo means: receiving what is without adding the burden of resistance.", "Name three things that are true about your current circumstances — not aspirational, simply true.", "For each, say: 'This is. I receive it. I do not dissolve into it, but I do not fight it either.'", "Carry this posture through the day. Notice the moment of resistance before it becomes reaction.", "In that moment, exhale. Then: 'This is. I receive it.'"] },
];

/* ─── AI ─── */
async function callClaude(system, user, maxTokens = 600) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] })
  });
  const d = await res.json();
  return d.content.map(b => b.text || "").join("").trim();
}

/* ─── SMALL COMPONENTS ─── */
function Stars({ count = 120 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("div"); s.className = "star";
      s.style.left = Math.random() * 100 + "%"; s.style.top = Math.random() * 100 + "%";
      s.style.setProperty("--dur", (3 + Math.random() * 6) + "s");
      s.style.setProperty("--mo", (0.08 + Math.random() * 0.35).toFixed(2));
      s.style.animationDelay = (Math.random() * 8) + "s";
      if (Math.random() > 0.85) { s.style.width = "2px"; s.style.height = "2px"; }
      ref.current.appendChild(s);
    }
  }, []);
  return <div ref={ref} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }} />;
}

function Divider() {
  return <div style={{ width: "100%", height: 1, background: `linear-gradient(to right,transparent,${G.dimmer},transparent)`, margin: "2rem 0", opacity: 0.35 }} />;
}

function SoftBtn({ children, onClick, color, extraStyle = {} }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: h ? G.glow : "transparent",
        border: `1px solid ${h ? G.goldDim : G.dimmer}`,
        color: h ? G.gold : (color || G.dim),
        fontFamily: "Cinzel, serif", fontWeight: 300, fontSize: "0.7rem", letterSpacing: "0.22em",
        textTransform: "uppercase", padding: "0.8rem 2rem", cursor: "pointer", transition: "all 0.6s",
        ...extraStyle
      }}>
      {children}
    </button>
  );
}

function ReadingCard({ tradition, text, question }) {
  return (
    <div className="fade-up" style={{ borderLeft: `1px solid ${G.goldDim}`, padding: "1.75rem 2rem", margin: "1.5rem 0", background: "rgba(200,169,110,0.02)" }}>
      <div style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: G.goldDim, marginBottom: "1rem", fontFamily: "Cinzel,serif" }}>{tradition}</div>
      <div className="wisdom" style={{ fontSize: "1.15rem", color: G.text, lineHeight: 1.95 }}>{text}</div>
      {question && <div className="wisdom" style={{ fontSize: "1rem", color: G.gold, marginTop: "1.25rem", lineHeight: 1.7 }}>{question}</div>}
    </div>
  );
}

/* ─── LANDING ─── */
function Landing({ onEnter }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 50% 55%,#0F0D09,#0A0A0A 70%)" }}>
      <Stars count={180} />
      {/* Decorative lines */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.06 }}>
        <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <circle cx="720" cy="450" r="340" stroke="#C8A96E" strokeWidth="0.5" fill="none" />
          <circle cx="720" cy="450" r="220" stroke="#C8A96E" strokeWidth="0.5" fill="none" />
          <line x1="380" y1="450" x2="1060" y2="450" stroke="#C8A96E" strokeWidth="0.5" />
          <line x1="720" y1="110" x2="720" y2="790" stroke="#C8A96E" strokeWidth="0.5" />
        </svg>
      </div>
      <div style={{ textAlign: "center", zIndex: 1, maxWidth: 680, padding: "3rem" }}>
        <div className="cinzel" style={{ fontSize: "0.72rem", color: G.goldDim, letterSpacing: "0.55em", animation: "fadeUp 2s ease both", animationDelay: "0.3s", marginBottom: "3rem", textTransform: "uppercase" }}>
          ✦ &nbsp; The Pilgrim's Compass &nbsp; ✦
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2.2rem,4.5vw,4rem)", fontWeight: 300, fontStyle: "italic", color: G.text, lineHeight: 1.3, animation: "fadeUp 2s ease both", animationDelay: "1s", marginBottom: "2rem" }}>
          You have wandered far.<br />Rest here.
        </h1>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.1rem,2vw,1.35rem)", fontStyle: "italic", color: G.dim, animation: "fadeUp 2s ease both", animationDelay: "2.2s", marginBottom: "4rem", lineHeight: 1.85 }}>
          No maps are required. No credentials. No destinations.<br />
          Only the honest weight of what you carry.
        </p>
        <div style={{ animation: "fadeUp 2s ease both", animationDelay: "3.4s" }}>
          <SoftBtn onClick={onEnter} color={G.gold} extraStyle={{ fontSize: "0.72rem", padding: "1.1rem 3.5rem", letterSpacing: "0.35em" }}>
            Enter the Compass
          </SoftBtn>
        </div>
      </div>
    </div>
  );
}

/* ─── THRESHOLD ─── */
function ChamberThreshold({ onSave }) {
  const [txt, setTxt] = useState("");
  const [doors, setDoors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(null);
  const [saved, setSaved] = useState(false);

  const seek = async () => {
    if (!txt.trim()) return;
    setLoading(true); setDoors([]); setActive(null);
    try {
      const raw = await callClaude(
        `You are the Pilgrim's Compass — a spiritual guide speaking with infinite gentleness. Given a pilgrim's words, suggest exactly 3 doors from different traditions (Sufism, Zen, Taoism, Kabbalah, Kejawen, Buddhism, Jungian, Agnostic, etc.). Never diagnose, advise, or judge. Use warm poetic prose. Respond ONLY with valid JSON, no markdown: {"doors":[{"tradition":"Name · Subtitle","text":"2-3 sentence reflection","question":"One open gentle question"},...]}`
        , `A pilgrim writes: "${txt}"`, 900
      );
      setDoors(JSON.parse(raw.replace(/```json|```/g, "").trim()).doors);
    } catch { setDoors(matchDoors(txt)); }
    setLoading(false);
  };

  const save = () => { if (!active) return; onSave(active); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div>
      <h2 className="wisdom" style={{ fontSize: "clamp(1.6rem,2.5vw,2.2rem)", color: G.text, marginBottom: "0.75rem" }}>
        What brings you to this threshold today?
      </h2>
      <p style={{ fontSize: "0.9rem", color: G.dim, lineHeight: 1.7, marginBottom: "2rem" }}>
        Speak plainly or speak in riddles. There is no wrong way to begin.
      </p>
      <textarea value={txt} onChange={e => setTxt(e.target.value)} rows={5}
        placeholder="Let the words come as they will…"
        style={{
          width: "100%", background: "rgba(255,255,255,0.02)", border: `1px solid ${G.border}`,
          borderBottom: `1px solid ${G.dimmer}`, color: G.text,
          fontFamily: "'Cormorant Garamond',serif", fontSize: "1.25rem", fontStyle: "italic",
          padding: "1.25rem", resize: "none", lineHeight: 1.8, display: "block",
          borderRadius: "2px"
        }} />
      <div style={{ marginTop: "1.5rem" }}><SoftBtn onClick={seek} color={G.gold}>Seek the doors ↓</SoftBtn></div>

      {loading && <p className="wisdom breathe" style={{ color: G.dimmer, marginTop: "2.5rem", fontSize: "1rem" }}>The compass is listening…</p>}

      {doors.length > 0 && (
        <div style={{ marginTop: "2.5rem" }}>
          <Divider />
          <p className="cinzel" style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: G.dimmer, marginBottom: "1.25rem" }}>Three doors open before you</p>
          <div className="three-col" className="tarot-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
            {doors.map((d, i) => {
              const [h, setH] = useState(false);
              return (
                <div key={i} className="fade-up" onClick={() => setActive(d)}
                  onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                  style={{
                    border: `1px solid ${h ? G.goldDim : G.border}`, padding: "1.5rem", cursor: "pointer",
                    background: h ? G.glow : "transparent", transition: "all 0.7s", animationDelay: `${i * 0.12}s`,
                    borderRadius: "2px"
                  }}>
                  <div className="cinzel" style={{ fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: G.goldDim, marginBottom: "0.6rem" }}>{d.tradition}</div>
                  <div className="wisdom" style={{ fontSize: "1rem", color: G.text, marginBottom: "0.75rem", lineHeight: 1.7 }}>{d.text.split(". ")[0]}…</div>
                  <div className="wisdom" style={{ fontSize: "0.9rem", color: G.dim }}>→ {d.question}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {active && (
        <div className="fade-up" style={{ borderLeft: `1px solid ${G.goldDim}`, padding: "2rem 2rem 2rem 2.5rem", margin: "2rem 0", background: "rgba(200,169,110,0.02)" }}>
          <div className="cinzel" style={{ fontSize: "0.6rem", letterSpacing: "0.28em", textTransform: "uppercase", color: G.goldDim, marginBottom: "1rem" }}>{active.tradition}</div>
          <div className="wisdom" style={{ fontSize: "1.2rem", color: G.text, lineHeight: 1.95 }}>{active.text}</div>
          <div className="wisdom" style={{ fontSize: "1.05rem", color: G.gold, marginTop: "1.25rem", lineHeight: 1.7 }}>{active.question}</div>
          <div style={{ marginTop: "1.5rem" }}><SoftBtn onClick={save} color={G.gold}>{saved ? "Saved to the journal ✓" : "Save to the journal"}</SoftBtn></div>
        </div>
      )}
    </div>
  );
}

/* ─── ORACLE ─── */
function ChamberOracle() {
  const [tab, setTab] = useState("iching");
  const [hexLines, setHexLines] = useState([true, false, true, false, true, true]);
  const [hex, setHex] = useState(null);
  const castHex = () => { const p = Array.from({ length: 6 }, () => Math.random() > 0.5); setHexLines(p); setHex(HEXAGRAMS[Math.floor(Math.random() * HEXAGRAMS.length)]); };

  const [cards, setCards] = useState(null);
  const [tReading, setTReading] = useState(null);
  const [tLoad, setTLoad] = useState(false);
  const drawTarot = async () => {
    const drawn = []; while (drawn.length < 3) { const c = TAROT[Math.floor(Math.random() * TAROT.length)]; if (!drawn.find(x => x.name === c.name)) drawn.push(c); }
    setCards(drawn); setTReading(null); setTLoad(true);
    try {
      const raw = await callClaude(`You are the Pilgrim's Compass reading a 3-card tarot spread. Speak with poetic gentleness. Do not predict — only reflect. 3-4 sentences, then one open question. Respond ONLY with valid JSON: {"text":"...","question":"..."}`
        , `Past: ${drawn[0].name} — ${drawn[0].meaning}\nPresent: ${drawn[1].name} — ${drawn[1].meaning}\nApproaching: ${drawn[2].name} — ${drawn[2].meaning}`, 400);
      setTReading(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch { setTReading({ text: `${drawn[0].name} carries what came before. ${drawn[1].name} holds where you stand. ${drawn[2].name} gestures at what approaches — not as fate, but as tendency.`, question: "Which card feels most like an arrival, and which most like an unfinished sentence?" }); }
    setTLoad(false);
  };

  const [voidTxt, setVoidTxt] = useState("");
  const [voidR, setVoidR] = useState(null);
  const [voidL, setVoidL] = useState(false);
  const askVoid = async () => {
    setVoidL(true); setVoidR(null);
    try {
      const raw = await callClaude(`You are the Void — an apophatic oracle. Do not answer directly — echo back transformed, deeper, stranger. Never advise or diagnose. Respond ONLY with valid JSON: {"text":"2-4 poetic sentences","question":"One haunting open question"}`
        , voidTxt ? `A pilgrim sends: "${voidTxt}"` : "A pilgrim sends silence.", 350);
      setVoidR(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch { setVoidR(VOID_FB[Math.floor(Math.random() * VOID_FB.length)]); }
    setVoidL(false);
  };

  const tabSt = (t) => ({
    background: "none", border: "none",
    borderBottom: `1px solid ${tab === t ? G.gold : "transparent"}`,
    color: tab === t ? G.gold : G.dimmer,
    fontFamily: "Cinzel, serif", fontWeight: 300, fontSize: "0.65rem",
    letterSpacing: "0.25em", textTransform: "uppercase", padding: "0.85rem 1.75rem",
    cursor: "pointer", marginBottom: "-1px", transition: "all 0.6s"
  });

  return (
    <div>
      <h2 className="cinzel" style={{ fontSize: "1.6rem", fontWeight: 300, color: G.gold, marginBottom: "0.6rem", letterSpacing: "0.08em" }}>The Oracle Circle</h2>
      <p style={{ fontSize: "0.88rem", color: G.dim, lineHeight: 1.7 }}>Three instruments of listening. No instrument tells the future — they reflect the present.</p>
      <Divider />
      <div style={{ display: "flex", borderBottom: `1px solid ${G.dimmer}`, marginBottom: "2.5rem" }}>
        {[["iching", "I Ching"], ["tarot", "Tarot"], ["void", "The Void"]].map(([t, l]) => <button key={t} style={tabSt(t)} onClick={() => setTab(t)}>{l}</button>)}
      </div>

      {tab === "iching" && (
        <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>
          <div>
            <p className="wisdom" style={{ fontSize: "1.05rem", color: G.dim, marginBottom: "2rem", lineHeight: 1.75 }}>Cast the yarrow. Ask nothing specific. Ask everything in general.</p>
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {hexLines.map((solid, i) => (
                  <div key={i} style={{ position: "relative", height: 3, width: 100 }}>
                    {solid ? <div style={{ height: 3, background: G.gold }} /> : <>
                      <div style={{ position: "absolute", left: 0, top: 0, height: 3, width: "38%", background: G.gold }} />
                      <div style={{ position: "absolute", right: 0, top: 0, height: 3, width: "38%", background: G.gold }} /></>}
                  </div>
                ))}
              </div>
              {hex && <div className="cinzel" style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: G.dimmer, marginTop: "0.75rem" }}>{hex.name}</div>}
            </div>
            <SoftBtn onClick={castHex} color={G.gold}>Cast the hexagram</SoftBtn>
          </div>
          <div>
            {hex && <ReadingCard tradition="I CHING · HEAVEN AND EARTH" text={hex.text} question={hex.question} />}
          </div>
        </div>
      )}

      {tab === "tarot" && (
        <div>
          <p className="wisdom" style={{ fontSize: "1.05rem", color: G.dim, marginBottom: "2rem" }}>Three cards: what was, what is, what approaches. Do not fear any card.</p>
          <div className="tarot-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
            {["Past", "Present", "Approaching"].map((pos, i) => {
              const c = cards?.[i];
              return (
                <div key={i} style={{ border: `1px solid ${c ? G.goldDim : G.border}`, padding: "2rem 1.5rem", textAlign: "center", minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "border-color 0.8s", background: "rgba(255,255,255,0.01)" }}>
                  <div className="cinzel" style={{ fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: G.dimmer, marginBottom: "0.75rem" }}>{pos}</div>
                  {c ? <><div style={{ fontSize: "1.6rem", marginBottom: "0.6rem", opacity: 0.6 }}>{c.sym}</div>
                    <div className="cinzel" style={{ fontSize: "0.85rem", color: G.gold, marginBottom: "0.5rem", letterSpacing: "0.05em" }}>{c.name}</div>
                    <div className="wisdom" style={{ fontSize: "0.85rem", fontStyle: "normal", color: G.dim, lineHeight: 1.6 }}>{c.meaning}</div></>
                    : <div style={{ fontSize: "1.6rem", color: G.dimmer }}>✦</div>}
                </div>
              );
            })}
          </div>
          {tLoad && <p className="wisdom breathe" style={{ color: G.dimmer }}>Reading the spread…</p>}
          {tReading && <ReadingCard tradition="TAROT · THE THREE RIVERS" text={tReading.text} question={tReading.question} />}
          <SoftBtn onClick={drawTarot} color={G.gold}>Draw the cards</SoftBtn>
        </div>
      )}

      {tab === "void" && (
        <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>
          <div>
            <p className="wisdom" style={{ fontSize: "1.05rem", color: G.dim, marginBottom: "0.6rem" }}>The Void does not explain. It echoes.</p>
            <p style={{ fontSize: "0.85rem", color: G.dim, marginBottom: "1.5rem" }}>Write your question — or your silence — into the circle.</p>
            <textarea value={voidTxt} onChange={e => setVoidTxt(e.target.value)} rows={4}
              placeholder="What do you hold that has no name?…"
              style={{
                width: "100%", background: "rgba(255,255,255,0.02)", border: `1px solid ${G.border}`,
                color: G.text, fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", fontStyle: "italic",
                padding: "1rem", resize: "none", lineHeight: 1.7, display: "block", marginBottom: "1.5rem"
              }} />
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1.5rem" }}>
              <div onClick={askVoid} className={voidL ? "void-circle" : ""}
                style={{
                  width: 140, height: 140, borderRadius: "50%", border: `1px solid ${voidL ? G.goldDim : G.dimmer}`,
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  transition: "all 0.8s", userSelect: "none"
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = G.goldDim}
                onMouseLeave={e => { if (!voidL) e.currentTarget.style.borderColor = G.dimmer; }}>
                <span className="wisdom" style={{ fontSize: "0.9rem", color: voidL ? G.gold : G.dimmer, textAlign: "center", lineHeight: 1.7, whiteSpace: "pre" }}>
                  {voidL ? "…" : "Ask\nthe Void"}
                </span>
              </div>
            </div>
          </div>
          <div>
            {voidR && <ReadingCard tradition="THE VOID · APOPHATIC ORACLE" text={voidR.text} question={voidR.question} />}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── PRACTICE ─── */
function ChamberPractice() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <h2 className="cinzel" style={{ fontSize: "1.6rem", fontWeight: 300, color: G.gold, marginBottom: "0.6rem", letterSpacing: "0.08em" }}>The Practice Ground</h2>
      <p style={{ fontSize: "0.88rem", color: G.dim, lineHeight: 1.7 }}>Not remedies. Not solutions. Only invitations to be present with what is.</p>
      <Divider />
      <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        {PRACTICES.map((p, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)}
            style={{ border: `1px solid ${open === i ? G.goldDim : G.border}`, padding: "1.75rem", cursor: "pointer", transition: "border-color 0.7s, background 0.7s", background: open === i ? "rgba(200,169,110,0.03)" : "transparent", gridColumn: open === i ? "1 / -1" : "auto" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem" }}>
              <div>
                <div className="cinzel" style={{ fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: G.teal, marginBottom: "0.4rem" }}>{p.tradition}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: G.text }}>{p.title}</div>
              </div>
              <div style={{ color: G.dimmer, fontSize: "1.3rem", transition: "transform 0.7s", transform: open === i ? "rotate(45deg)" : "none", flexShrink: 0 }}>+</div>
            </div>
            <div className={`prac-body${open === i ? " open" : ""}`}>
              <div style={{ paddingTop: "1.75rem", display: "grid", gridTemplateColumns: open === i ? "repeat(auto-fill,minmax(280px,1fr))" : "1fr", gap: "0.75rem" }}>
                {p.steps.map((s, si) => (
                  <div key={si} style={{ borderLeft: `1px solid ${G.dimmer}`, paddingLeft: "1.25rem", paddingBottom: "0.25rem" }}>
                    <span className="cinzel" style={{ fontSize: "0.6rem", color: G.dimmer, letterSpacing: "0.1em" }}>{si + 1}. </span>
                    <span className="wisdom" style={{ fontSize: "0.98rem", color: G.dim }}>{s}</span>
                  </div>
                ))}
                <div className="cinzel" style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: G.dimmer, marginTop: "0.5rem", gridColumn: "1 / -1" }}>⏱ {p.duration}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SHADOW ─── */
function ChamberShadow() {
  const [entered, setEntered] = useState(false);
  const [qi, setQi] = useState(() => Math.floor(Math.random() * SHADOW_QS.length));
  const [txt, setTxt] = useState("");
  const [mirror, setMirror] = useState(null);
  const [load, setLoad] = useState(false);

  const reflect = async () => {
    if (!txt.trim()) return;
    setLoad(true);
    try {
      const r = await callClaude(`You are a gentle mirror in the Shadow Foundry. Witness what the pilgrim wrote with deep gentleness. Never diagnose, advise, fix, or judge. Reflect with poetic presence, 3-4 sentences. End with presence, not a question.`
        , `Question: "${SHADOW_QS[qi]}"\nPilgrim wrote: "${txt}"`, 300);
      setMirror(r);
    } catch { setMirror(SHADOW_MIRRORS[Math.floor(Math.random() * SHADOW_MIRRORS.length)]); }
    setLoad(false);
  };

  if (!entered) return (
    <div>
      <h2 className="cinzel" style={{ fontSize: "1.6rem", fontWeight: 300, color: G.rose, marginBottom: "2.5rem", letterSpacing: "0.08em" }}>The Shadow Foundry</h2>
      <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", padding: "2rem 0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", color: G.rose, opacity: 0.4, marginBottom: "2rem" }}>☽</div>
          <SoftBtn onClick={() => setEntered(true)} color={G.rose} extraStyle={{ borderColor: "#5A3030" }}>I am ready to look</SoftBtn>
        </div>
        <div>
          <p className="wisdom" style={{ fontSize: "1.15rem", color: G.dim, lineHeight: 1.95 }}>
            What lives in the shadow is not evil.<br />It is simply the part of you that has not yet been welcomed home.<br /><br />
            This chamber asks honest questions.<br />You are not required to answer them.<br />But if you do — answer slowly.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="cinzel" style={{ fontSize: "1.6rem", fontWeight: 300, color: G.rose, marginBottom: "2rem", letterSpacing: "0.08em" }}>The Shadow Foundry</h2>
      <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
        <div>
          <p className="wisdom" style={{ fontSize: "1.15rem", color: G.text, lineHeight: 1.8, marginBottom: "1.5rem" }}>{SHADOW_QS[qi]}</p>
          <textarea value={txt} onChange={e => setTxt(e.target.value)} rows={6}
            placeholder="Whatever arises, it is allowed here…"
            style={{
              width: "100%", background: "rgba(200,126,126,0.03)", border: "none", borderBottom: "1px solid #3A2A2A",
              color: G.text, fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", fontStyle: "italic",
              padding: "1rem", resize: "none", lineHeight: 1.7, display: "block"
            }} />
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <SoftBtn onClick={reflect} color={G.rose} extraStyle={{ borderColor: "#5A3030" }}>Reflect this back to me</SoftBtn>
            <SoftBtn onClick={() => { setQi((qi + 1) % SHADOW_QS.length); setTxt(""); setMirror(null); }} extraStyle={{ fontSize: "0.62rem" }}>Another question</SoftBtn>
          </div>
        </div>
        <div>
          {load && <p className="wisdom breathe" style={{ color: G.dimmer }}>The mirror is listening…</p>}
          {mirror && (
            <div className="fade-up" style={{ border: "1px solid #3A2A2A", padding: "2rem", background: "rgba(200,126,126,0.03)" }}>
              <div className="wisdom" style={{ fontSize: "1.1rem", color: G.rose, lineHeight: 1.95, opacity: 0.9 }}>{mirror}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── JOURNAL ─── */
function ChamberJournal({ entries, onClear }) {
  return (
    <div>
      <h2 className="cinzel" style={{ fontSize: "1.6rem", fontWeight: 300, color: G.gold, marginBottom: "0.6rem", letterSpacing: "0.08em" }}>The Journal of Thresholds</h2>
      <p style={{ fontSize: "0.88rem", color: G.dim, lineHeight: 1.7 }}>What you have carried here. What you have set down. All of it yours.</p>
      <Divider />
      {entries.length === 0
        ? <p className="wisdom" style={{ color: G.dimmer, textAlign: "center", padding: "4rem 0", fontSize: "1.1rem" }}>Nothing yet. What you bring here, you may keep here.</p>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: "1rem" }}>
          {entries.map((e, i) => (
            <div key={i} style={{ border: `1px solid ${G.border}`, padding: "1.5rem", background: "rgba(255,255,255,0.01)" }}>
              <div className="cinzel" style={{ fontSize: "0.58rem", letterSpacing: "0.18em", color: G.dimmer, marginBottom: "0.6rem" }}>{e.date} · {e.tradition}</div>
              <div className="wisdom" style={{ fontSize: "1rem", color: G.dim, lineHeight: 1.7 }}>{e.text.slice(0, 160)}…</div>
              <div className="wisdom" style={{ fontSize: "0.9rem", color: G.goldDim, marginTop: "0.6rem" }}>{e.question}</div>
            </div>
          ))}
        </div>
      }
      {entries.length > 0 && <div style={{ marginTop: "2rem" }}><SoftBtn onClick={onClear} extraStyle={{ fontSize: "0.62rem", opacity: 0.5 }}>Release all entries</SoftBtn></div>}
    </div>
  );
}

/* ─── RETURN ─── */
function ChamberReturn() {
  const svgs = [
    <svg viewBox="0 0 160 160" width="140" height="140"><g stroke="#C8A96E" strokeWidth="1" fill="none" opacity="0.8"><circle cx="80" cy="80" r="55" opacity="0.25" /><circle cx="80" cy="80" r="38" opacity="0.18" /><line x1="80" y1="25" x2="80" y2="135" opacity="0.4" /><line x1="25" y1="80" x2="135" y2="80" opacity="0.4" /><line x1="41" y1="41" x2="119" y2="119" opacity="0.22" /><line x1="119" y1="41" x2="41" y2="119" opacity="0.22" /><circle cx="80" cy="80" r="5" fill="#C8A96E" opacity="0.6" /><polygon points="80,30 74,74 80,64 86,74" fill="#C8A96E" opacity="0.5" /></g></svg>,
    <svg viewBox="0 0 160 160" width="140" height="140"><g stroke="#C8A96E" strokeWidth="0.8" fill="none" opacity="0.7"><circle cx="80" cy="32" r="10" opacity="0.45" /><circle cx="52" cy="58" r="10" opacity="0.45" /><circle cx="108" cy="58" r="10" opacity="0.45" /><circle cx="52" cy="95" r="10" opacity="0.45" /><circle cx="108" cy="95" r="10" opacity="0.45" /><circle cx="80" cy="120" r="10" opacity="0.45" /><circle cx="80" cy="76" r="10" opacity="0.35" /><line x1="80" y1="42" x2="80" y2="66" /><line x1="80" y1="42" x2="52" y2="48" /><line x1="80" y1="42" x2="108" y2="48" /><line x1="52" y1="68" x2="52" y2="85" /><line x1="108" y1="68" x2="108" y2="85" /><line x1="52" y1="105" x2="80" y2="110" /><line x1="108" y1="105" x2="80" y2="110" /></g></svg>,
    <svg viewBox="0 0 160 160" width="140" height="140"><g stroke="#C8A96E" strokeWidth="0.8" fill="none" opacity="0.7"><circle cx="80" cy="80" r="60" opacity="0.15" /><polygon points="80,24 130,110 30,110" opacity="0.42" /><polygon points="80,136 30,50 130,50" opacity="0.42" /><circle cx="80" cy="80" r="6" fill="#C8A96E" opacity="0.5" /></g></svg>,
    <svg viewBox="0 0 160 160" width="140" height="140"><g stroke="#C8A96E" strokeWidth="2" fill="none" opacity="0.75"><path d="M 80 28 A 52 52 0 1 1 55 125" strokeLinecap="round" opacity="0.8" /><circle cx="80" cy="80" r="4" fill="#C8A96E" opacity="0.4" /></g></svg>,
  ];
  const [line, setLine] = useState(null);
  const [si, setSi] = useState(0);
  const gen = () => { setLine(TALISMAN_LINES[Math.floor(Math.random() * TALISMAN_LINES.length)]); setSi(Math.floor(Math.random() * svgs.length)); };
  return (
    <div>
      <h2 className="cinzel" style={{ fontSize: "1.6rem", fontWeight: 300, color: G.gold, marginBottom: "0.6rem", letterSpacing: "0.08em" }}>The Return</h2>
      <p style={{ fontSize: "0.88rem", color: G.dim, lineHeight: 1.7 }}>You do not leave the same as you arrived. No one does.</p>
      <Divider />
      <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", padding: "2rem 0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 240, height: 240, borderRadius: "50%", border: `1px solid ${G.goldDim}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2.5rem", boxShadow: "0 0 60px rgba(200,169,110,0.06)" }}>
            {svgs[si]}
          </div>
          <SoftBtn onClick={gen} color={G.gold}>Receive your talisman</SoftBtn>
        </div>
        <div>
          <p className="wisdom" style={{ fontSize: "1.4rem", color: G.gold, lineHeight: 1.75, marginBottom: "2rem" }}>
            {line || "Press to receive your talisman."}
          </p>
          <p style={{ fontSize: "0.9rem", color: G.dim, fontStyle: "italic", lineHeight: 1.8 }}>
            A talisman is not magic. It is a reminder that you were here,<br />and that being here took courage.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── SILENCE ─── */
function ChamberSilence() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <p className="wisdom" style={{ fontSize: "3rem", color: G.dim, marginBottom: "2.5rem", opacity: 0.5 }}>☽</p>
        <p className="wisdom" style={{ fontSize: "2rem", color: G.text, marginBottom: "1.5rem" }}>This chamber holds no words.</p>
        <p className="wisdom" style={{ fontSize: "1.1rem", color: G.dim, marginBottom: "3rem", lineHeight: 1.95 }}>
          Sit with whatever has arisen.<br />Let the compass rest.<br />Let yourself rest.
        </p>
        <div style={{ height: 1, width: 48, background: G.goldDim, margin: "0 auto 2.5rem", opacity: 0.4 }} />
        <p className="wisdom" style={{ fontSize: "1rem", color: G.dimmer, lineHeight: 1.8 }}>
          The light is in you.<br />It has always been in you.
        </p>
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
const CHAMBERS = [
  { id: "threshold", label: "Threshold", sym: "⊕" },
  { id: "oracle", label: "Oracle", sym: "◎" },
  { id: "practice", label: "Practice", sym: "≈" },
  { id: "shadow", label: "Shadow", sym: "☽" },
  { id: "journal", label: "Journal", sym: "✦" },
  { id: "return", label: "Return", sym: "◉" },
  { id: "silence", label: "Silence", sym: "·" },
];
const CNAMES = { threshold: "The Threshold", oracle: "The Oracle Circle", practice: "The Practice Ground", shadow: "The Shadow Foundry", journal: "The Journal of Thresholds", return: "The Return", silence: "The Great Silence" };

export default function PilgrimsCompass() {
  const [screen, setScreen] = useState("landing");
  const [chamber, setChamber] = useState("threshold");
  const [journal, setJournal] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => { try { const s = localStorage.getItem("compass_journal"); if (s) setJournal(JSON.parse(s)); } catch { } }, []);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [chamber]);

  const saveEntry = useCallback((door) => {
    setJournal(prev => {
      const next = [{ date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), ...door }, ...prev].slice(0, 40);
      try { localStorage.setItem("compass_journal", JSON.stringify(next)); } catch { }
      return next;
    });
  }, []);

  const clearJournal = () => { if (window.confirm("Release all entries to the void?")) { setJournal([]); try { localStorage.removeItem("compass_journal"); } catch { } } };

  return (
    <div style={{ width: "100vw", height: "100vh", background: G.bg, color: G.text, fontFamily: "Inter, sans-serif", fontWeight: 300, overflow: "hidden", position: "relative" }}>
      <style>{css}</style>

      {screen === "landing" ? (
        <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
          <Landing onEnter={() => setScreen("app")} />
        </div>
      ) : (
        <div className="app-shell">

          {/* ── SIDEBAR (tablet/desktop only) ── */}
          <div className="sidebar">
            <Stars count={40} />
            <div style={{ padding: "2.5rem 2rem 2rem", borderBottom: `1px solid ${G.border}`, position: "relative", zIndex: 1 }}>
              <div className="cinzel" style={{ fontSize: "0.6rem", letterSpacing: "0.45em", color: G.goldDim, textTransform: "uppercase", marginBottom: "0.5rem" }}>The Pilgrim's</div>
              <div className="cinzel" style={{ fontSize: "1.3rem", fontWeight: 300, color: G.gold, letterSpacing: "0.15em" }}>Compass</div>
              <div style={{ width: 32, height: 1, background: G.goldDim, marginTop: "1rem", opacity: 0.5 }} />
            </div>
            <nav style={{ flex: 1, padding: "1.5rem 0", position: "relative", zIndex: 1 }}>
              {CHAMBERS.map(c => {
                const active = chamber === c.id;
                return (
                  <div key={c.id} className="nav-item" onClick={() => setChamber(c.id)}
                    style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.9rem 2rem", cursor: "pointer", background: active ? "rgba(200,169,110,0.05)" : "transparent", borderRight: active ? `1px solid ${G.gold}` : "1px solid transparent", transition: "all 0.5s" }}>
                    <span style={{ fontSize: "0.9rem", color: active ? G.gold : G.dimmer, opacity: active ? 1 : 0.6, transition: "all 0.5s", width: "1.2rem", textAlign: "center" }}>{c.sym}</span>
                    <span className="nav-label cinzel" style={{ fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: active ? G.gold : G.dimmer, transition: "color 0.5s" }}>{c.label}</span>
                  </div>
                );
              })}
            </nav>
            <div style={{ padding: "1.5rem 2rem 2rem", borderTop: `1px solid ${G.border}`, position: "relative", zIndex: 1 }}>
              <p className="wisdom" style={{ fontSize: "0.8rem", color: G.dimmer, lineHeight: 1.7, opacity: 0.7 }}>"The wound is the place where the light enters you."</p>
              <p className="cinzel" style={{ fontSize: "0.55rem", letterSpacing: "0.2em", color: G.dimmer, marginTop: "0.5rem", opacity: 0.5 }}>— Rumi</p>
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="main-content">

            {/* Mobile top bar */}
            <div className="mobile-topbar" style={{ borderBottom: `1px solid ${G.border}`, paddingBottom: "1rem" }}>
              <div>
                <div className="cinzel" style={{ fontSize: "0.55rem", letterSpacing: "0.4em", color: G.goldDim, textTransform: "uppercase" }}>The Pilgrim's</div>
                <div className="cinzel" style={{ fontSize: "1rem", color: G.gold, letterSpacing: "0.15em" }}>Compass</div>
              </div>
              <span className="cinzel" style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: G.dimmer }}>{CNAMES[chamber]}</span>
            </div>

            {/* Desktop top bar */}
            <div style={{ flexShrink: 0, padding: "1.5rem 2.5rem", borderBottom: `1px solid ${G.border}`, display: "none", alignItems: "center", justifyContent: "space-between" }}
              className="desktop-topbar">
              <span className="cinzel" style={{ fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase", color: G.dimmer }}>{CNAMES[chamber]}</span>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {CHAMBERS.map(c => (
                  <div key={c.id} onClick={() => setChamber(c.id)} style={{ width: 6, height: 6, borderRadius: "50%", background: chamber === c.id ? G.gold : G.dimmer, cursor: "pointer", transition: "all 0.5s", boxShadow: chamber === c.id ? `0 0 8px ${G.gold}` : "none" }} title={c.label} />
                ))}
              </div>
            </div>

            {/* Scrollable chamber */}
            <div ref={scrollRef} className="content-scroll"
              style={{ padding: "clamp(1.25rem,4vw,3rem)", paddingBottom: "calc(clamp(1.25rem,4vw,3rem) + 64px)" }}>
              <div className="fade-in" key={chamber}>
                {chamber === "threshold" && <ChamberThreshold onSave={saveEntry} />}
                {chamber === "oracle" && <ChamberOracle />}
                {chamber === "practice" && <ChamberPractice />}
                {chamber === "shadow" && <ChamberShadow />}
                {chamber === "journal" && <ChamberJournal entries={journal} onClear={clearJournal} />}
                {chamber === "return" && <ChamberReturn />}
                {chamber === "silence" && <ChamberSilence />}
              </div>
            </div>
          </div>

          {/* ── MOBILE BOTTOM NAV ── */}
          <nav className="mobile-nav">
            {CHAMBERS.map(c => {
              const active = chamber === c.id;
              return (
                <div key={c.id} onClick={() => setChamber(c.id)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", cursor: "pointer", padding: "0.3rem 0.2rem", userSelect: "none" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: active ? G.gold : G.dimmer, boxShadow: active ? `0 0 7px ${G.gold}` : "none", transition: "all 0.5s" }} />
                  <span className="cinzel" style={{ fontSize: "0.42rem", letterSpacing: "0.1em", textTransform: "uppercase", color: active ? G.goldDim : G.dimmer, transition: "color 0.5s", whiteSpace: "nowrap" }}>{c.label}</span>
                </div>
              );
            })}
          </nav>

        </div>
      )}
    </div>
  );
}
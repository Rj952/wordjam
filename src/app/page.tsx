"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const GRADE_BANDS = [
  { id: "seedling", label: "Seedling", emoji: "🌱", grades: "Pre-K – Grade K", ages: "Ages 3–5", desc: "Songs, sounds & very first words in Patwa and English", color: "#FFB900", bg: "rgba(255,185,0,0.1)", skills: ["Phonological Awareness", "Oral Vocabulary", "Listening"] },
  { id: "sprout",   label: "Sprout",   emoji: "🌿", grades: "Grades 1–2",     ages: "Ages 6–7",  desc: "Phonics foundations with Jamaican Creole bridges",       color: "#00BF68", bg: "rgba(0,191,104,0.1)",  skills: ["Phonics", "Sight Words", "Creole–SJE Bridge"] },
  { id: "sapling",  label: "Sapling",  emoji: "🌳", grades: "Grades 3–5",     ages: "Ages 8–10", desc: "Fluency, vocabulary expansion & comprehension",          color: "#009B55", bg: "rgba(0,155,85,0.1)",   skills: ["Reading Fluency", "Vocabulary", "Comprehension"] },
  { id: "branch",   label: "Branch",   emoji: "🌲", grades: "Grades 6–8",     ages: "Ages 11–13",desc: "Critical literacy, code-switching & analytical reading",  color: "#1E90FF", bg: "rgba(30,144,255,0.1)", skills: ["Critical Literacy", "Code-Switching", "Analysis"] },
  { id: "canopy",   label: "Canopy",   emoji: "🏔️", grades: "Grades 9–11",    ages: "Ages 14–17",desc: "Academic writing, research literacy & digital discourse", color: "#9D4EDD", bg: "rgba(157,78,221,0.1)", skills: ["Academic Writing", "Research", "Digital Discourse"] },
];
const STORY_PATWA = [
  "Anansi did love fi tell story more dan anyting inna di world.",
  "One bright mawnin, im climb up im web — high, high inna di Blue Mountain sky, where di cloud dem touch di tallest treetop.",
  '"Mi rich!" Anansi seh, lookin dung pon di whole a Jamaica. "Mi have more story dan anybody inna di whole wide world."',
  "But den a likkle hummingbird fly up beside him. 'Anansi,' she seh soft-soft, 'story is fi share — not fi keep to yuhself.'",
];

const STORY_SJE = [
  "Anansi loved to tell stories more than anything else in the world.",
  "One bright morning, he climbed up his web — high, high into the Blue Mountain sky, where the clouds touched the tallest treetops.",
  '"I am rich!" Anansi said, looking down at all of Jamaica. "I have more stories than anyone in the whole wide world."',
  "But then a little hummingbird flew up beside him. 'Anansi,' she said softly, 'stories are meant to be shared — not kept for yourself.'",
];

const VOCAB = [
  { patwa: "pickney", sje: "child / children", origin: "From English 'pickaninny'" },
  { patwa: "im",      sje: "he / him / his",   origin: "Gender-neutral pronoun" },
  { patwa: "mawnin",  sje: "morning",           origin: "Phonological vowel shift" },
  { patwa: "inna",    sje: "in / into / inside",origin: "Creole prepositional form" },
];

const BADGES = [
  { name: "First Word",     emoji: "⭐", earned: true,  color: "#FFB900" },
  { name: "Anansi Scholar", emoji: "🕷️", earned: true,  color: "#009B55" },
  { name: "Patwa Bridge",   emoji: "🌉", earned: true,  color: "#1E90FF" },
  { name: "Blue Mountain",  emoji: "🏔️", earned: false, color: "#9D4EDD" },
  { name: "Word Master",    emoji: "📚", earned: false, color: "#C4622D" },
  { name: "Storyteller",    emoji: "🎙️", earned: false, color: "#FFB900" },
];

const SKILLS_PROGRESS = [
  { name: "Phonics & Decoding",       pct: 82, color: "#FFB900" },
  { name: "Reading Fluency",          pct: 71, color: "#009B55" },
  { name: "Vocabulary (Patwa–SJE)",   pct: 65, color: "#1E90FF" },
  { name: "Comprehension",            pct: 78, color: "#9D4EDD" },
  { name: "Writing Expression",       pct: 54, color: "#C4622D" },
];

const STUDENTS = [
  { name: "Kezia Brown",     band: "Sapling", progress: 78, streak: 12, grade: "Gr. 4" },
  { name: "Jahmai Williams", band: "Sprout",  progress: 65, streak: 7,  grade: "Gr. 2" },
  { name: "Tamara Reid",     band: "Branch",  progress: 89, streak: 21, grade: "Gr. 7" },
  { name: "Darius Campbell", band: "Seedling",progress: 45, streak: 3,  grade: "K" },
  { name: "Naomi Clarke",    band: "Canopy",  progress: 92, streak: 30, grade: "Gr. 10" },
];

const BAND_COLORS: Record<string, string> = { Seedling:"#FFB900", Sprout:"#00BF68", Sapling:"#009B55", Branch:"#1E90FF", Canopy:"#9D4EDD" };

const COMPREHENSION_QS = [
  { q: "Why does Anansi say he is rich?", type: "Literal", options: ["He has a lot of gold","He has more stories than anyone","He lives on Blue Mountain","He owns many webs"], correct: 1 },
  { q: "What does the hummingbird mean when she says stories are meant to be shared?", type: "Inferential", options: ["She wants Anansi to stop climbing","Knowledge gains power when shared with others","She is afraid of Anansi","Stories should be sold"], correct: 1 },
];

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.wj{font-family:'DM Sans',sans-serif;background:#080A08;min-height:100vh;color:#FFF8E7;overflow-x:hidden;}
.wj-h{font-family:'Abril Fatface',serif;}
.hover-lift{transition:transform .2s ease,box-shadow .2s ease;cursor:pointer;}
.hover-lift:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.5)!important;}
.band-card{transition:all .25s ease;cursor:pointer;}
.band-card:hover{transform:translateY(-5px);}
.btn-g{background:#FFB900;color:#080A08;border:none;padding:12px 28px;border-radius:100px;font-weight:700;font-size:14px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;}
.btn-g:hover{background:#FFD454;transform:scale(1.02);}
.btn-o{background:transparent;color:#FFF8E7;border:1.5px solid rgba(255,248,231,.22);padding:12px 28px;border-radius:100px;font-weight:500;font-size:14px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;}
.btn-o:hover{border-color:#FFB900;color:#FFB900;}
.nav-i{color:rgba(255,248,231,.55);cursor:pointer;font-size:14px;font-weight:500;transition:color .2s;}
.nav-i:hover{color:#FFB900;}
.nav-a{color:#FFF8E7!important;}
.pbar{height:6px;background:rgba(255,248,231,.08);border-radius:3px;overflow:hidden;}
.pfill{height:100%;border-radius:3px;transition:width .9s ease;}
.jms{height:3px;background:linear-gradient(90deg,#000 0%,#FFB900 40%,#009B55 70%,#000 100%);}
.tab-btn{padding:9px 18px;border-radius:100px;border:none;cursor:pointer;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;transition:all .2s;}
@keyframes float{0%,100%{transform:translateY(0)rotate(0)}40%{transform:translateY(-14px)rotate(2deg)}70%{transform:translateY(-6px)rotate(-1deg)}}
.f1{animation:float 5s ease-in-out infinite}
.f2{animation:float 7s ease-in-out infinite 1.2s}
.f3{animation:float 6s ease-in-out infinite 2.4s}
.f4{animation:float 4.5s ease-in-out infinite .7s}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#333;border-radius:3px}
.skip-link{position:absolute;top:-40px;left:0;background:#FFB900;color:#080A08;padding:8px 16px;text-decoration:none;z-index:100;border-radius:0 0 8px 0;font-weight:600;font-size:13px;}
.skip-link:focus{top:0;}
`;

function AuthModal({ isOpen, onClose, onAuth }: { isOpen: boolean; onClose: () => void; onAuth: (email: string, password: string, name: string, role: string, gradeBand: string) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("learner");
  const [gradeBand, setGradeBand] = useState("sapling");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onAuth(email, password, name, role, gradeBand);
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }} onClick={onClose}>
      <div style={{ background:"#111411", borderRadius:20, padding:40, maxWidth:420, width:"90%", border:"1px solid rgba(255,248,231,.1)" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"transparent", border:"none", fontSize:20, cursor:"pointer", color:"rgba(255,248,231,.5)" }}>×</button>

        <h2 className="wj-h" style={{ fontSize:26, color:"#FFF8E7", marginBottom:8 }}>
          {mode === "signin" ? "Welcome Back" : "Join WordJam"}
        </h2>
        <p style={{ color:"rgba(255,248,231,.5)", fontSize:13, marginBottom:24 }}>
          {mode === "signin" ? "Sign in to your account" : "Create a new account"}
        </p>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required={mode === "signup"}
              style={{ padding:"12px 16px", borderRadius:10, background:"rgba(255,248,231,.05)", border:"1px solid rgba(255,248,231,.1)", color:"#FFF8E7", fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none" }}
              aria-label="Your name"
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding:"12px 16px", borderRadius:10, background:"rgba(255,248,231,.05)", border:"1px solid rgba(255,248,231,.1)", color:"#FFF8E7", fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none" }}
            aria-label="Email address"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding:"12px 16px", borderRadius:10, background:"rgba(255,248,231,.05)", border:"1px solid rgba(255,248,231,.1)", color:"#FFF8E7", fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none" }}
            aria-label="Password"
          />

          {mode === "signup" && (
            <>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"rgba(255,248,231,.7)", marginBottom:8 }}>Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={{ width:"100%", padding:"10px 14px", borderRadius:8, background:"rgba(255,248,231,.05)", border:"1px solid rgba(255,248,231,.1)", color:"#FFF8E7", fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer" }} aria-label="Select role">
                  <option value="learner">Learner</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"rgba(255,248,231,.7)", marginBottom:8 }}>Grade Band</label>
                <select value={gradeBand} onChange={e => setGradeBand(e.target.value)} style={{ width:"100%", padding:"10px 14px", borderRadius:8, background:"rgba(255,248,231,.05)", border:"1px solid rgba(255,248,231,.1)", color:"#FFF8E7", fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer" }} aria-label="Select grade band">
                  {GRADE_BANDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                </select>
              </div>
            </>
          )}

          {error && <div style={{ padding:12, borderRadius:8, background:"rgba(255,80,80,.15)", border:"1px solid rgba(255,80,80,.3)", color:"#ff6060", fontSize:12 }}>{error}</div>}

          <button type="submit" disabled={loading} className="btn-g" style={{ marginTop:8, fontSize:14, padding:"14px 24px" }}>
            {loading ? "Loading..." : (mode === "signin" ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div style={{ marginTop:20, textAlign:"center" }}>
          <span style={{ color:"rgba(255,248,231,.5)", fontSize:13 }}>
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }} style={{ background:"none", border:"none", color:"#FFB900", cursor:"pointer", fontSize:13, fontWeight:600 }}>
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

function LandingView({ navigate }: { navigate: (v: string) => void }) {
  return (
    <div>
      <section style={{ minHeight:"calc(100vh - 62px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 40px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:700, height:450, background:"radial-gradient(ellipse,rgba(0,155,85,.13) 0%,rgba(255,185,0,.07) 45%,transparent 70%)", pointerEvents:"none" }}/>
        <div className="f1" style={{ position:"absolute", top:"15%", left:"10%", fontSize:52, opacity:.55 }} aria-hidden="true">🌿</div>
        <div className="f2" style={{ position:"absolute", top:"18%", right:"9%",  fontSize:40, opacity:.45 }} aria-hidden="true">📖</div>
        <div className="f3" style={{ position:"absolute", bottom:"28%", left:"7%", fontSize:36, opacity:.45 }} aria-hidden="true">🕷️</div>
        <div className="f4" style={{ position:"absolute", bottom:"25%", right:"11%",fontSize:44, opacity:.4 }} aria-hidden="true">🌺</div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,155,85,.14)", border:"1px solid rgba(0,155,85,.3)", borderRadius:100, padding:"8px 18px", marginBottom:28, fontSize:13, fontWeight:600, color:"#00BF68" }}>
          🇯🇲 Jamaica&apos;s Creole-Affirming Literacy Platform
        </div>
        <h1 className="wj-h" style={{ fontSize:"clamp(56px,9vw,100px)", textAlign:"center", lineHeight:1, color:"#FFF8E7", marginBottom:10, letterSpacing:-1 }}>
          WORD<span style={{ color:"#FFB900" }}>JAM</span>
        </h1>
        <div className="jms" style={{ width:220, margin:"0 auto 26px" }}/>
        <p style={{ fontSize:"clamp(17px,2.5vw,22px)", textAlign:"center", color:"rgba(255,248,231,.7)", maxWidth:560, lineHeight:1.6, marginBottom:14, fontStyle:"italic" }}>
          &quot;Every word. Every voice. Every yard.&quot;
        </p>
        <p style={{ fontSize:15, textAlign:"center", color:"rgba(255,248,231,.5)", maxWidth:500, lineHeight:1.7, marginBottom:48 }}>
          Bridging Jamaican Patwa and Standard English for learners from Early Childhood through Grade 11. Culturally rooted. AI-powered. NSC-aligned.
        </p>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center", marginBottom:80 }}>
          <button className="btn-g" onClick={() => navigate("bands")} style={{ fontSize:15, padding:"15px 36px" }} aria-label="Choose your learning level">Choose Your Level 🌱</button>
          <button className="btn-o" onClick={() => navigate("read")} style={{ fontSize:15, padding:"15px 36px" }} aria-label="Read a story">Read a Story</button>
        </div>
        <div style={{ display:"flex", gap:52, flexWrap:"wrap", justifyContent:"center" }}>
          {[["5","Grade Bands"],["200+","Cultural Stories"],["2","Language Modes"],["AI-Powered","Writing Feedback"]].map(([n,l])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div className="wj-h" style={{ fontSize:28, color:"#FFB900" }}>{n}</div>
              <div style={{ fontSize:12, color:"rgba(255,248,231,.45)", marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding:"80px 40px", background:"#0D0F0D" }}>
        <h2 className="wj-h" style={{ textAlign:"center", fontSize:36, marginBottom:48, color:"#FFF8E7" }}>
          How <span style={{ color:"#FFB900" }}>WORDJAM</span> Works
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:18, maxWidth:1100, margin:"0 auto" }}>
          {[
            { icon:"🌉", title:"Creole Bridge Reader",   desc:"Toggle between Jamaican Patwa and Standard English. Same story, both tongues — neither inferior.", color:"#FFB900" },
            { icon:"🤖", title:"AI Writing Coach",       desc:"Claude-powered feedback that honours code-switching and celebrates Creole voice as sophisticated skill.", color:"#009B55" },
            { icon:"🎙️", title:"Oral Literacy Lab",      desc:"Record Anansi retellings, oral reports & yard stories. AI analyses fluency with cultural affirmation.", color:"#1E90FF" },
            { icon:"🗺️", title:"Jamaica Journey Map",    desc:"Gamified parish-to-parish progress. Earn 'Maroon Scholar' and 'Blue Mountain Reader' badges.", color:"#9D4EDD" },
            { icon:"🏫", title:"Teacher Command Centre", desc:"NSC-aligned assignment builder, class dashboards, and AI-pre-scored writing review queues.", color:"#C4622D" },
            { icon:"🏠", title:"Family Literacy Portal", desc:"Parent summaries in Patwa and English, plus 'Yard Time' reading activities for home.", color:"#00BF68" },
          ].map(f=>(
            <div key={f.title} className="hover-lift" style={{ background:"#111411", borderRadius:16, padding:26, border:"1px solid rgba(255,248,231,.07)" }}>
              <div style={{ fontSize:34, marginBottom:14 }} aria-hidden="true">{f.icon}</div>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8, color:f.color }}>{f.title}</h3>
              <p style={{ fontSize:13, color:"rgba(255,248,231,.6)", lineHeight:1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding:"80px 40px", textAlign:"center", background:"linear-gradient(135deg,rgba(0,155,85,.13) 0%,rgba(255,185,0,.07) 100%)", borderTop:"1px solid rgba(255,185,0,.1)" }}>
        <p style={{ fontSize:12, color:"#009B55", fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>🇯🇲 Rooted in Jamaica. Built for the World.</p>
        <h2 className="wj-h" style={{ fontSize:40, color:"#FFF8E7", marginBottom:18 }}>Ready to Start the Journey?</h2>
        <p style={{ color:"rgba(255,248,231,.6)", marginBottom:36, fontSize:15 }}>Free for learners. Powerful tools for teachers. Insights for families.</p>
        <button className="btn-g" onClick={() => navigate("bands")} style={{ fontSize:15, padding:"15px 38px" }} aria-label="Pick your grade band">Pick Your Grade Band →</button>
      </section>
    </div>
  );
}

function GradeBandsView({ navigate, activeBand, setActiveBand }: { navigate: (v: string) => void; activeBand: string | null; setActiveBand: (v: string | null) => void }) {
  return (
    <div style={{ minHeight:"100vh", padding:"56px 40px" }}>
      <div style={{ maxWidth:1000, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <p style={{ color:"#009B55", fontWeight:700, fontSize:12, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>YOUR LEARNING PATH</p>
          <h2 className="wj-h" style={{ fontSize:40, color:"#FFF8E7", marginBottom:10 }}>Choose Your <span style={{ color:"#FFB900" }}>Grade Band</span></h2>
          <p style={{ color:"rgba(255,248,231,.5)", fontSize:15, maxWidth:460, margin:"0 auto" }}>Five pathways from first sounds to academic mastery — all rooted in Jamaican culture.</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {GRADE_BANDS.map((band,i)=>(
            <div key={band.id} className="band-card"
              onClick={()=>setActiveBand(activeBand===band.id?null:band.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if(e.key==="Enter" || e.key===" ") setActiveBand(activeBand===band.id?null:band.id); }}
              style={{ background:activeBand===band.id?band.bg:"#111411", border:`1.5px solid ${activeBand===band.id?band.color+"55":"rgba(255,248,231,.07)"}`, borderRadius:16, padding:"22px 26px", display:"flex", alignItems:"center", gap:22, flexWrap:"wrap", cursor:"pointer" }}>
              <div className="wj-h" style={{ fontSize:44, color:band.color, opacity:.25, minWidth:36, lineHeight:1 }}>{i+1}</div>
              <div style={{ fontSize:38 }} aria-hidden="true">{band.emoji}</div>
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  <span className="wj-h" style={{ fontSize:20, color:band.color }}>{band.label}</span>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100, background:band.color+"22", color:band.color }}>{band.ages}</span>
                </div>
                <div style={{ fontSize:12, color:"rgba(255,248,231,.45)", marginBottom:5 }}>{band.grades}</div>
                <div style={{ fontSize:14, color:"rgba(255,248,231,.75)", lineHeight:1.5 }}>{band.desc}</div>
              </div>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap", minWidth:190 }}>
                {band.skills.map(s=>(
                  <span key={s} style={{ fontSize:11, padding:"4px 11px", borderRadius:100, fontWeight:500, background:"rgba(255,248,231,.05)", color:"rgba(255,248,231,.55)", border:"1px solid rgba(255,248,231,.1)" }}>{s}</span>
                ))}
              </div>
              <button className="btn-g" onClick={e=>{e.stopPropagation();navigate("read");}}
                style={{ padding:"11px 22px", fontSize:13, background:band.color, whiteSpace:"nowrap" }}
                aria-label={`Start ${band.label} level`}>
                Start →
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop:36, padding:20, borderRadius:12, background:"rgba(0,155,85,.08)", border:"1px solid rgba(0,155,85,.22)", display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:22 }} aria-hidden="true">📋</span>
          <p style={{ fontSize:13, color:"rgba(255,248,231,.7)", lineHeight:1.6 }}>
            <strong style={{ color:"#009B55" }}>NSC-Aligned:</strong> All grade bands are mapped to Jamaica&apos;s National Standards Curriculum literacy benchmarks. Teachers can view alignment in the Command Centre.
          </p>
        </div>
      </div>
    </div>
  );
}

function StoryLibraryView({ navigate, user }: { navigate: (v: string) => void; user: any }) {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data, error } = await supabase.from("stories").select("*");
        if (error) throw error;
        setStories(data || []);
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchStories();
  }, []);

  return (
    <div style={{ minHeight:"100vh", padding:"48px 40px" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ marginBottom:40 }}>
          <p style={{ color:"rgba(255,248,231,.45)", fontSize:13, marginBottom:8 }}>STORY COLLECTION</p>
          <h2 className="wj-h" style={{ fontSize:38, color:"#FFF8E7", marginBottom:8 }}>Jamaican Tales & Caribbean Stories</h2>
          <p style={{ color:"rgba(255,248,231,.6)", fontSize:14 }}>Culturally rooted narratives in Patwa and Standard English</p>
        </div>

        {loading && <div style={{ textAlign:"center", color:"rgba(255,248,231,.5)", padding:"60px 20px" }}>Loading stories...</div>}
        {error && <div style={{ padding:20, borderRadius:12, background:"rgba(255,80,80,.1)", border:"1px solid rgba(255,80,80,.2)", color:"#ff6060" }}>{error}</div>}

        {!loading && stories.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:20 }}>
            {stories.map(story => (
              <div key={story.id} className="hover-lift" style={{ background:"#111411", borderRadius:16, overflow:"hidden", border:"1px solid rgba(255,248,231,.07)", cursor:"pointer" }} onClick={() => navigate(`story:${story.id}`)}>
                <div style={{ background:"linear-gradient(135deg,#FFB900,#009B55)", height:140, display:"flex", alignItems:"center", justifyContent:"center", fontSize:64 }} aria-hidden="true">{story.cover_emoji}</div>
                <div style={{ padding:20 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#FFB900", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>{story.origin_country} {story.origin_flag}</div>
                  <h3 style={{ fontSize:16, fontWeight:700, color:"#FFF8E7", marginBottom:8, lineHeight:1.3 }}>{story.title}</h3>
                  <p style={{ fontSize:12, color:"rgba(255,248,231,.5)", marginBottom:12 }}>{story.summary}</p>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:10, padding:"3px 10px", borderRadius:100, background:"rgba(255,185,0,.1)", color:"#FFB900" }}>Level: {story.difficulty_level}</span>
                    <span style={{ fontSize:10, padding:"3px 10px", borderRadius:100, background:"rgba(0,155,85,.1)", color:"#009B55" }}>{story.word_count} words</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && stories.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,248,231,.5)" }}>
            <div style={{ fontSize:40, marginBottom:16 }}>📖</div>
            <p>Stories loading soon. Check back shortly!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StoryReaderView({ navigate, storyId, user }: { navigate: (v: string) => void; storyId: string; user: any }) {
  const [story, setStory] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [vocab, setVocab] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("single");
  const [showPatwa, setShowPatwa] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        const [storyRes, pagesRes, vocabRes, qRes] = await Promise.all([
          supabase.from("stories").select("*").eq("id", storyId).single(),
          supabase.from("story_pages").select("*").eq("story_id", storyId).order("page_number"),
          supabase.from("vocabulary").select("*").eq("story_id", storyId),
          supabase.from("comprehension_questions").select("*").eq("story_id", storyId),
        ]);

        if (storyRes.data) setStory(storyRes.data);
        if (pagesRes.data) setPages(pagesRes.data);
        if (vocabRes.data) setVocab(vocabRes.data);
        if (qRes.data) setQuestions(qRes.data);
      } catch (err: any) {
        console.error("Error fetching story:", err);
      }
      setLoading(false);
    };
    fetchStoryData();
  }, [storyId]);

  const handleQuizSubmit = async () => {
    if (!user || !story) return;
    try {
      const { data: profile } = await supabase.from("learner_profiles").select("id").eq("auth_user_id", user.id).single();
      if (profile) {
        await supabase.from("reading_progress").insert({
          learner_id: profile.id,
          story_id: story.id,
          current_page: pages.length,
          completed: true,
          quiz_score: Object.values(answers).filter((a, i) => a === questions[i]?.correct_index).length,
          quiz_total: questions.length,
        });
      }
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  if (loading) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,248,231,.5)" }}>Loading story...</div>;

  if (!story) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,248,231,.5)" }}>Story not found</div>;

  const useHardcodedAnansi = storyId === "anansi";
  const storyPages = useHardcodedAnansi ? STORY_PATWA.map((text, i) => ({ page_number: i+1, text, bg_color: "#111411" })) : pages;
  const storyPagesSJE = useHardcodedAnansi ? STORY_SJE : [];

  const LangBtn = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} style={{ padding:"9px 18px", borderRadius:100, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif", transition:"all .2s", background:active?"#FFB900":"transparent", color:active?"#080A08":"rgba(255,248,231,.6)" }} aria-pressed={active}>{label}</button>
  );

  return (
    <div style={{ minHeight:"100vh", padding:"48px 40px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ marginBottom:30 }}>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <span style={{ fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:100, background:"rgba(255,185,0,.14)", color:"#FFB900", letterSpacing:1, textTransform:"uppercase" }}>Anansi Series</span>
            <span style={{ fontSize:12, color:"rgba(255,248,231,.4)", alignSelf:"center" }}>{story.difficulty_level}</span>
          </div>
          <h1 className="wj-h" style={{ fontSize:34, color:"#FFF8E7", marginBottom:7 }}>{story.title}</h1>
          <p style={{ fontSize:13, color:"rgba(255,248,231,.45)" }}>{story.summary}</p>
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:26, flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", background:"#111411", borderRadius:100, padding:4, border:"1px solid rgba(255,248,231,.1)" }}>
            <LangBtn label="🇯🇲 Patwa" active={showPatwa && mode==="single"} onClick={()=>{setShowPatwa(true);setMode("single");}}/>
            <LangBtn label="🎓 English" active={!showPatwa && mode==="single"} onClick={()=>{setShowPatwa(false);setMode("single");}}/>
            <LangBtn label="⇄ Side by Side" active={mode==="split"} onClick={()=>setMode("split")}/>
          </div>
        </div>

        {mode==="split" ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:36 }}>
            {[true,false].map(isPatwa=>(
              <div key={String(isPatwa)} style={{ background:"#111411", borderRadius:16, padding:26, border:`1.5px solid ${isPatwa?"rgba(255,185,0,.2)":"rgba(0,155,85,.2)"}` }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:isPatwa?"#FFB900":"#009B55", marginBottom:18, paddingBottom:12, borderBottom:`1px solid ${isPatwa?"rgba(255,185,0,.14)":"rgba(0,155,85,.14)"}` }}>
                  {isPatwa?"🇯🇲 Jamaican Patwa":"🎓 Standard English"}
                </div>
                {(isPatwa?storyPages:storyPagesSJE.length>0?storyPagesSJE:STORY_SJE).map((p: any,i: number)=>{
                  const text = typeof p === "string" ? p : p.text;
                  return (<p key={i} style={{ fontSize:15, lineHeight:1.85, color:"rgba(255,248,231,.9)", marginBottom:14, fontStyle:text.startsWith('"')?"italic":"normal" }}>{text}</p>);
                })}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background:"#111411", borderRadius:16, padding:34, marginBottom:36, border:"1px solid rgba(255,248,231,.07)" }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:showPatwa?"#FFB900":"#009B55", marginBottom:22, paddingBottom:14, borderBottom:"1px solid rgba(255,248,231,.07)" }}>
              {showPatwa?"🇯🇲 Jamaican Patwa":"🎓 Standard Jamaican English"}
            </div>
            {(showPatwa?storyPages:storyPagesSJE.length>0?storyPagesSJE:STORY_SJE).map((p: any,i: number)=>{
              const text = typeof p === "string" ? p : p.text;
              return (<p key={i} style={{ fontSize:17, lineHeight:1.9, color:"rgba(255,248,231,.9)", marginBottom:20, fontStyle:text.startsWith('"')?"italic":"normal" }}>{text}</p>);
            })}
          </div>
        )}

        {showPatwa && mode==="single" && (
          <div style={{ marginBottom:32, padding:22, borderRadius:14, background:"rgba(255,185,0,.06)", border:"1px solid rgba(255,185,0,.2)" }}>
            <h4 style={{ fontSize:12, fontWeight:700, color:"#FFB900", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>🔤 Patwa Vocabulary Spotlight</h4>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:10 }}>
              {(vocab.length > 0 ? vocab : VOCAB).map((v: any)=>(
                <div key={v.patwa || v.word} style={{ background:"#111411", borderRadius:10, padding:"13px 15px", border:"1px solid rgba(255,248,231,.07)" }}>
                  <div style={{ fontSize:16, fontWeight:700, color:"#FFB900", marginBottom:4 }}>{v.patwa || v.word}</div>
                  <div style={{ fontSize:13, color:"rgba(255,248,231,.8)", marginBottom:5 }}>→ {v.sje || v.definition}</div>
                  <div style={{ fontSize:11, color:"rgba(255,248,231,.38)" }}>{v.origin || v.part_of_speech}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {questions.length > 0 && (
          <div style={{ marginBottom:32 }}>
            <h3 className="wj-h" style={{ fontSize:22, color:"#FFF8E7", marginBottom:18 }}>Check Your Understanding</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {(questions.length > 0 ? questions : COMPREHENSION_QS).map((q: any,qi: number)=>(
                <div key={qi} style={{ background:"#111411", borderRadius:14, padding:24, border:"1px solid rgba(255,248,231,.07)" }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:100, background:"rgba(255,185,0,.14)", color:"#FFB900", letterSpacing:1, textTransform:"uppercase", marginBottom:12, display:"inline-block" }}>{q.difficulty_level || "Question"}</span>
                  <p style={{ fontSize:15, color:"#FFF8E7", fontWeight:500, marginBottom:14 }}>{q.question || q.q}</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {(q.options || q.options || []).map((opt: string,oi: number)=>{
                      const sel = answers[qi]===oi;
                      const correct = oi===(q.correct_index ?? q.correct);
                      return (
                        <button key={oi} onClick={()=>setAnswers(a=>({...a,[qi]:oi}))}
                          style={{ textAlign:"left", padding:"11px 15px", borderRadius:10, cursor:"pointer", fontSize:13, fontFamily:"'DM Sans',sans-serif", transition:"all .2s",
                            background: sel?(correct?"rgba(0,155,85,.2)":"rgba(255,80,80,.14)"):"rgba(255,248,231,.04)",
                            border: `1.5px solid ${sel?(correct?"#009B55":"#ff5050"):"rgba(255,248,231,.09)"}`,
                            color:"#FFF8E7" }}
                          aria-pressed={sel}>
                          {opt} {sel && (correct?" ✅":" ❌")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-g" onClick={handleQuizSubmit} style={{ marginTop:20, padding:"14px 28px", fontSize:14 }}>Submit Quiz & Earn XP</button>
          </div>
        )}

        <div style={{ textAlign:"center", padding:28, borderRadius:14, background:"linear-gradient(135deg,rgba(157,78,221,.12),rgba(30,144,255,.08))", border:"1px solid rgba(157,78,221,.22)" }}>
          <div style={{ fontSize:28, marginBottom:10 }} aria-hidden="true">🤖</div>
          <h4 style={{ fontSize:17, fontWeight:700, color:"#FFF8E7", marginBottom:7 }}>Ready to Write About This Story?</h4>
          <p style={{ fontSize:13, color:"rgba(255,248,231,.6)", marginBottom:20 }}>Use the AI Writing Studio — respond in Patwa, English, or both. Claude gives culturally-affirming feedback.</p>
          <button className="btn-g" style={{ background:"#9D4EDD" }} onClick={() => navigate("write")}>Open AI Writing Studio ✍️</button>
        </div>
      </div>
    </div>
  );
}

function WritingStudioView({ navigate, user }: { navigate: (v: string) => void; user: any }) {
  const [content, setContent] = useState("");
  const [gradeLevel, setGradeLevel] = useState("3-5");
  const [writingType, setWritingType] = useState("narrative");
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Please write something first!");
      return;
    }
    setLoading(true);
    setError("");
    setFeedback(null);

    try {
      const res = await fetch("/api/ai/writing-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, gradeLevel, gradeBand: "sapling", writingType }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setFeedback(data.feedback);
        if (user) {
          const { data: profile } = await supabase.from("learner_profiles").select("id").eq("auth_user_id", user.id).single();
          if (profile) {
            await supabase.from("user_writings").insert({
              learner_id: profile.id,
              title: content.substring(0, 50),
              content,
              writing_type: writingType,
              grade_band: "sapling",
              ai_feedback: data.feedback,
              points_earned: 15,
            });
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to get feedback");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", padding:"48px 40px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ marginBottom:32 }}>
          <p style={{ color:"rgba(255,248,231,.45)", fontSize:13, marginBottom:8 }}>CREATIVE EXPRESSION</p>
          <h2 className="wj-h" style={{ fontSize:38, color:"#FFF8E7", marginBottom:8 }}>AI Writing Studio</h2>
          <p style={{ color:"rgba(255,248,231,.6)", fontSize:14 }}>Write in Patwa, English, or code-switch. Get culturally affirming feedback from Claude.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:24 }}>
          <div>
            <div style={{ background:"#111411", borderRadius:16, padding:24, border:"1px solid rgba(255,248,231,.07)" }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(255,248,231,.7)", marginBottom:12 }}>Writing Type</label>
              <select value={writingType} onChange={e => setWritingType(e.target.value)} style={{ width:"100%", padding:"11px 14px", borderRadius:10, background:"rgba(255,248,231,.05)", border:"1px solid rgba(255,248,231,.1)", color:"#FFF8E7", fontFamily:"'DM Sans',sans-serif", cursor:"pointer", marginBottom:16 }}>
                <option value="narrative">Narrative / Story</option>
                <option value="descriptive">Descriptive</option>
                <option value="expository">Expository / Informative</option>
                <option value="persuasive">Persuasive / Opinion</option>
              </select>

              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(255,248,231,.7)", marginBottom:12 }}>Grade Level (for feedback)</label>
              <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} style={{ width:"100%", padding:"11px 14px", borderRadius:10, background:"rgba(255,248,231,.05)", border:"1px solid rgba(255,248,231,.1)", color:"#FFF8E7", fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}>
                <option value="1-2">Grades 1-2</option>
                <option value="3-5">Grades 3-5</option>
                <option value="6-8">Grades 6-8</option>
                <option value="9-11">Grades 9-11</option>
              </select>
            </div>
          </div>

          <div style={{ background:"#111411", borderRadius:16, padding:24, border:"1px solid rgba(255,248,231,.07)" }}>
            <div style={{ fontSize:13, color:"rgba(255,248,231,.6)", lineHeight:1.6 }}>
              <p style={{ marginBottom:12 }}><strong style={{ color:"#FFB900" }}>Pro Tips:</strong></p>
              <ul style={{ paddingLeft:16, display:"flex", flexDirection:"column", gap:6 }}>
                <li>Use Patwa freely — it's a sophisticated language</li>
                <li>Code-switch if it feels natural to your story</li>
                <li>Include sensory details & dialogue</li>
                <li>Claude will celebrate your authentic voice</li>
              </ul>
            </div>
          </div>
        </div>

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your story, poem, reflection, or idea here. Use Patwa, English, or both..."
          style={{ width:"100%", minHeight:300, padding:20, borderRadius:16, background:"#111411", border:"1.5px solid rgba(255,248,231,.1)", color:"#FFF8E7", fontFamily:"'DM Sans',sans-serif", fontSize:15, lineHeight:1.7, resize:"vertical", outline:"none" }}
          aria-label="Writing area"
        />

        <div style={{ display:"flex", gap:12, marginTop:20, marginBottom:32 }}>
          <button className="btn-g" onClick={handleSubmit} disabled={loading} style={{ flex:1, padding:"15px 28px", fontSize:14 }}>
            {loading ? "Getting Feedback..." : "Get AI Feedback 🤖"}
          </button>
          <button className="btn-o" onClick={() => { setContent(""); setFeedback(null); }} style={{ padding:"15px 28px", fontSize:14 }}>Clear</button>
        </div>

        {error && <div style={{ padding:16, borderRadius:12, background:"rgba(255,80,80,.15)", border:"1px solid rgba(255,80,80,.3)", color:"#ff6060", marginBottom:24 }}>{error}</div>}

        {feedback && (
          <div style={{ background:"#111411", borderRadius:16, padding:28, border:"1px solid rgba(255,248,231,.07)" }}>
            <h3 className="wj-h" style={{ fontSize:22, color:"#FFB900", marginBottom:20 }}>Claude's Feedback</h3>
            <div style={{ color:"rgba(255,248,231,.85)", lineHeight:1.7, fontSize:14 }}>
              {typeof feedback === "string" ? (
                <p>{feedback}</p>
              ) : (
                <div>
                  {feedback.strengths && (
                    <div style={{ marginBottom:16 }}>
                      <h4 style={{ color:"#00BF68", fontWeight:600, marginBottom:8 }}>Strengths:</h4>
                      <p>{feedback.strengths}</p>
                    </div>
                  )}
                  {feedback.improvements && (
                    <div style={{ marginBottom:16 }}>
                      <h4 style={{ color:"#FFB900", fontWeight:600, marginBottom:8 }}>Areas to Grow:</h4>
                      <p>{feedback.improvements}</p>
                    </div>
                  )}
                  {feedback.encouragement && (
                    <div>
                      <h4 style={{ color:"#9D4EDD", fontWeight:600, marginBottom:8 }}>Encouragement:</h4>
                      <p>{feedback.encouragement}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="btn-g" style={{ marginTop:20 }} onClick={() => setFeedback(null)}>Close Feedback</button>
          </div>
        )}
      </div>
    </div>
  );
}

function CreoleBridgeView({ navigate }: { navigate: (v: string) => void }) {
  const [text, setText] = useState("");
  const [direction, setDirection] = useState("patwa-sje");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError("Please enter some text");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/creole-bridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, direction, gradeBand: "sapling" }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.bridge);
      }
    } catch (err: any) {
      setError(err.message || "Translation failed");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", padding:"48px 40px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ marginBottom:32 }}>
          <p style={{ color:"rgba(255,248,231,.45)", fontSize:13, marginBottom:8 }}>LANGUAGE BRIDGING</p>
          <h2 className="wj-h" style={{ fontSize:38, color:"#FFF8E7", marginBottom:8 }}>Creole Bridge Tool</h2>
          <p style={{ color:"rgba(255,248,231,.6)", fontSize:14 }}>Translate between Jamaican Patwa and Standard English with linguistic explanations.</p>
        </div>

        <div style={{ background:"#111411", borderRadius:16, padding:28, border:"1px solid rgba(255,248,231,.07)", marginBottom:24 }}>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(255,248,231,.7)", marginBottom:12 }}>Translation Direction</label>
            <div style={{ display:"flex", gap:8 }}>
              {[
                { id:"patwa-sje", label:"🇯🇲 Patwa → 🎓 English" },
                { id:"sje-patwa", label:"🎓 English → 🇯🇲 Patwa" }
              ].map(opt => (
                <button key={opt.id} onClick={() => setDirection(opt.id)} style={{ flex:1, padding:"12px 16px", borderRadius:10, border:`2px solid ${direction===opt.id?"#FFB900":"rgba(255,248,231,.1)"}`, background:direction===opt.id?"rgba(255,185,0,.1)":"transparent", color:direction===opt.id?"#FFB900":"rgba(255,248,231,.6)", cursor:"pointer", fontWeight:600, fontSize:13, fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={direction==="patwa-sje"?"Enter Jamaican Patwa text...":"Enter Standard English text..."}
            style={{ width:"100%", minHeight:200, padding:16, borderRadius:10, background:"rgba(255,248,231,.03)", border:"1px solid rgba(255,248,231,.1)", color:"#FFF8E7", fontFamily:"'DM Sans',sans-serif", fontSize:14, lineHeight:1.6, resize:"vertical", outline:"none", marginBottom:16 }}
            aria-label="Text to translate"
          />

          <button className="btn-g" onClick={handleTranslate} disabled={loading} style={{ width:"100%", padding:"15px 24px", fontSize:14 }}>
            {loading ? "Translating..." : "Translate & Explain 🌉"}
          </button>
        </div>

        {error && <div style={{ padding:16, borderRadius:12, background:"rgba(255,80,80,.15)", border:"1px solid rgba(255,80,80,.3)", color:"#ff6060", marginBottom:24 }}>{error}</div>}

        {result && (
          <div style={{ background:"#111411", borderRadius:16, padding:28, border:"1px solid rgba(255,248,231,.07)" }}>
            <h3 className="wj-h" style={{ fontSize:22, color:"#00BF68", marginBottom:20 }}>Translation & Explanation</h3>
            <div style={{ color:"rgba(255,248,231,.85)", lineHeight:1.7, fontSize:14 }}>
              {typeof result === "string" ? (
                <p>{result}</p>
              ) : (
                <div>
                  {result.translation && (
                    <div style={{ marginBottom:16, padding:16, borderRadius:10, background:"rgba(0,155,85,.08)", border:"1px solid rgba(0,155,85,.2)" }}>
                      <h4 style={{ color:"#00BF68", fontWeight:700, marginBottom:8 }}>Translation:</h4>
                      <p style={{ fontSize:16, color:"#FFF8E7" }}>{result.translation}</p>
                    </div>
                  )}
                  {result.explanation && (
                    <div>
                      <h4 style={{ color:"#FFB900", fontWeight:700, marginBottom:8 }}>Linguistic Notes:</h4>
                      <p>{result.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="btn-o" onClick={() => setResult(null)} style={{ marginTop:20, width:"100%", padding:"12px 24px" }}>Close Translation</button>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardView({ user }: { user: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [writings, setWritings] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;
      try {
        const [pRes, wRes, progRes, badgeRes] = await Promise.all([
          supabase.from("learner_profiles").select("*").eq("auth_user_id", user.id).single(),
          supabase.from("user_writings").select("*").eq("learner_id", user.id).order("created_at", { ascending: false }).limit(3),
          supabase.from("reading_progress").select("*").eq("learner_id", user.id).order("created_at", { ascending: false }).limit(5),
          supabase.from("learner_achievements").select("*").eq("learner_id", user.id),
        ]);
        if (pRes.data) setProfile(pRes.data);
        if (wRes.data) setWritings(wRes.data);
        if (progRes.data) setProgress(progRes.data);
        if (badgeRes.data) setBadges(badgeRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
      setLoading(false);
    };
    fetchDashboard();
  }, [user]);

  if (loading) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,248,231,.5)" }}>Loading dashboard...</div>;

  if (!profile) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,248,231,.5)" }}>Sign in to view your dashboard</div>;

  return (
    <div style={{ minHeight:"100vh", padding:"48px 40px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ marginBottom:38 }}>
          <p style={{ color:"rgba(255,248,231,.45)", fontSize:14, marginBottom:4 }}>Good to see you, {profile.name} 🌅</p>
          <h2 className="wj-h" style={{ fontSize:36, color:"#FFF8E7" }}>Your Learning Journey</h2>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))", gap:14, marginBottom:36 }}>
          {[
            { icon:"🔥", value: profile.current_streak || "0", label:"Day Streak",    color:"#FFB900" },
            { icon:"📖", value: progress.length, label:"Stories Read",  color:"#009B55" },
            { icon:"🔤", value: "214", label:"Words Learned", color:"#1E90FF" },
            { icon:"🏅", value: badges.length || "0", label:"Badges Earned", color:"#9D4EDD" },
            { icon:"✍️", value: writings.length, label:"Pieces Written",color:"#C4622D" },
          ].map(s=>(
            <div key={s.label} style={{ background:"#111411", borderRadius:14, padding:"20px 22px", border:`1px solid ${s.color}22` }}>
              <div style={{ fontSize:26, marginBottom:8 }} aria-hidden="true">{s.icon}</div>
              <div className="wj-h" style={{ fontSize:30, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:12, color:"rgba(255,248,231,.45)", marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
          <div style={{ background:"#111411", borderRadius:16, padding:28, border:"1px solid rgba(255,248,231,.07)" }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:"#FFF8E7", marginBottom:22 }}>Skills Progress</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:17 }}>
              {SKILLS_PROGRESS.map(sk=>(
                <div key={sk.name}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                    <span style={{ fontSize:13, color:"rgba(255,248,231,.8)" }}>{sk.name}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:sk.color }}>{sk.pct}%</span>
                  </div>
                  <div className="pbar"><div className="pfill" style={{ width:`${sk.pct}%`, background:sk.color }}/></div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:"#111411", borderRadius:16, padding:28, border:"1px solid rgba(255,248,231,.07)" }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:"#FFF8E7", marginBottom:22 }}>Badge Collection</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
              {BADGES.map(b=>(
                <div key={b.name} style={{ textAlign:"center" }}>
                  <div style={{ width:54, height:54, borderRadius:"50%", margin:"0 auto 7px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, background:b.earned?`${b.color}20`:"rgba(255,248,231,.04)", border:`2px solid ${b.earned?b.color:"rgba(255,248,231,.1)"}`, filter:b.earned?"none":"grayscale(100%) opacity(.3)" }} aria-label={b.earned ? `${b.name} badge earned` : `${b.name} badge locked`}>{b.emoji}</div>
                  <div style={{ fontSize:10, color:b.earned?"rgba(255,248,231,.7)":"rgba(255,248,231,.25)", lineHeight:1.3 }}>{b.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background:"#111411", borderRadius:16, padding:26, border:"1px solid rgba(255,248,231,.07)" }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:"#FFF8E7", marginBottom:18 }}>Recent Activity</h3>
          {progress.length > 0 || writings.length > 0 ? (
            <div>
              {progress.map((p, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:15, padding:"14px 0", borderBottom:i<progress.length-1?"1px solid rgba(255,248,231,.06)":"none" }}>
                  <div style={{ width:40, height:40, borderRadius:10, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", background:"#FFB90014", flexShrink:0 }} aria-hidden="true">📖</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, color:"rgba(255,248,231,.85)", fontWeight:500 }}><span style={{ color:"#FFB900" }}>Read:</span> Story ({p.quiz_score}/{p.quiz_total} correct)</div>
                    <div style={{ fontSize:11, color:"rgba(255,248,231,.38)", marginTop:2 }}>Recently</div>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#FFB900" }}>+15 pts</div>
                </div>
              ))}
              {writings.map((w, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:15, padding:"14px 0", borderBottom:i<writings.length-1?"1px solid rgba(255,248,231,.06)":"none" }}>
                  <div style={{ width:40, height:40, borderRadius:10, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", background:"#009B5514", flexShrink:0 }} aria-hidden="true">✍️</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, color:"rgba(255,248,231,.85)", fontWeight:500 }}><span style={{ color:"#009B55" }}>Wrote:</span> {w.title.substring(0, 40)}</div>
                    <div style={{ fontSize:11, color:"rgba(255,248,231,.38)", marginTop:2 }}>Recently</div>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#009B55" }}>+{w.points_earned} pts</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color:"rgba(255,248,231,.5)", textAlign:"center", padding:"30px 20px" }}>
              No activity yet. Start reading or writing to see your progress here!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeacherView() {
  const [tab, setTab] = useState("roster");
  const TabBtn = ({ id, label }: { id: string; label: string }) => (
    <button className="tab-btn" onClick={()=>setTab(id)} style={{ background:tab===id?"#FFB900":"transparent", color:tab===id?"#080A08":"rgba(255,248,231,.6)" }} role="tab" aria-selected={tab===id}>{label}</button>
  );
  return (
    <div style={{ minHeight:"100vh", padding:"48px 40px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:32, flexWrap:"wrap", gap:16 }}>
          <div>
            <p style={{ color:"rgba(255,248,231,.4)", fontSize:13, marginBottom:4 }}>Teacher Dashboard</p>
            <h2 className="wj-h" style={{ fontSize:34, color:"#FFF8E7" }}>Command Centre</h2>
            <p style={{ color:"rgba(255,248,231,.45)", fontSize:13, marginTop:4 }}>Class 4B · Sapling Band · 24 Learners</p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn-o" style={{ padding:"10px 18px", fontSize:13 }} aria-label="Export class report">📤 Export Report</button>
            <button className="btn-g" style={{ padding:"10px 18px", fontSize:13 }} aria-label="Create new assignment">+ New Assignment</button>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:12, marginBottom:28 }}>
          {[
            { label:"Class Avg. Progress",         value:"73%",    color:"#FFB900" },
            { label:"Active This Week",             value:"19/24",  color:"#009B55" },
            { label:"Assignments Pending Review",   value:"7",      color:"#1E90FF" },
            { label:"Longest Class Streak",         value:"21 days",color:"#9D4EDD" },
          ].map(s=>(
            <div key={s.label} style={{ background:"#111411", borderRadius:12, padding:"18px 20px", border:`1px solid ${s.color}20` }}>
              <div className="wj-h" style={{ fontSize:26, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:"rgba(255,248,231,.45)", marginTop:4, lineHeight:1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:4, marginBottom:22, background:"#111411", borderRadius:100, padding:4, width:"fit-content", border:"1px solid rgba(255,248,231,.07)" }} role="tablist">
          <TabBtn id="roster"      label="👥 Roster"/>
          <TabBtn id="assignments" label="📋 Assignments"/>
          <TabBtn id="ai-queue"    label="🤖 AI Review Queue"/>
        </div>

        {tab==="roster" && (
          <div style={{ background:"#111411", borderRadius:16, border:"1px solid rgba(255,248,231,.07)", overflow:"hidden" }}>
            <div style={{ padding:"14px 22px", borderBottom:"1px solid rgba(255,248,231,.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, fontWeight:600, color:"rgba(255,248,231,.55)" }}>5 of 24 learners shown</span>
              <input placeholder="🔍 Search learners..." style={{ background:"rgba(255,248,231,.05)", border:"1px solid rgba(255,248,231,.1)", borderRadius:100, padding:"8px 15px", fontSize:12, color:"#FFF8E7", fontFamily:"'DM Sans',sans-serif", outline:"none" }} aria-label="Search learners"/>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"rgba(255,248,231,.03)" }}>
                  {["Learner","Grade","Band","Progress","Streak","Action"].map(h=>(
                    <th key={h} style={{ padding:"12px 20px", textAlign:"left", fontSize:10, fontWeight:700, color:"rgba(255,248,231,.35)", letterSpacing:1, textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STUDENTS.map(s=>(
                  <tr key={s.name} style={{ borderTop:"1px solid rgba(255,248,231,.05)" }}>
                    <td style={{ padding:"15px 20px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:"50%", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", background:`${BAND_COLORS[s.band]}20`, color:BAND_COLORS[s.band], fontWeight:700 }}>{s.name[0]}</div>
                        <span style={{ fontSize:14, fontWeight:600, color:"#FFF8E7" }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:"15px 20px", fontSize:13, color:"rgba(255,248,231,.55)" }}>{s.grade}</td>
                    <td style={{ padding:"15px 20px" }}>
                      <span style={{ fontSize:11, padding:"3px 10px", borderRadius:100, fontWeight:600, background:`${BAND_COLORS[s.band]}18`, color:BAND_COLORS[s.band] }}>{s.band}</span>
                    </td>
                    <td style={{ padding:"15px 20px", minWidth:130 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div className="pbar" style={{ flex:1 }}><div className="pfill" style={{ width:`${s.progress}%`, background:BAND_COLORS[s.band] }}/></div>
                        <span style={{ fontSize:12, fontWeight:700, color:BAND_COLORS[s.band], minWidth:32 }}>{s.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding:"15px 20px" }}>
                      <span style={{ fontSize:13, color:s.streak>=14?"#FFB900":"rgba(255,248,231,.55)" }}>
                        {s.streak>=14?"🔥":""} {s.streak}d
                      </span>
                    </td>
                    <td style={{ padding:"15px 20px" }}>
                      <button style={{ fontSize:12, padding:"6px 14px", borderRadius:100, cursor:"pointer", background:"rgba(255,248,231,.06)", border:"1px solid rgba(255,248,231,.1)", color:"rgba(255,248,231,.7)", fontFamily:"'DM Sans',sans-serif" }} aria-label={`View ${s.name} details`}>View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab==="assignments" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { title:"Anansi Story Retelling — Oral Recording",        due:"Apr 15, 2026", type:"Oral Literacy",  submitted:18, total:24, color:"#1E90FF" },
              { title:"My Community Narrative — Written Essay",         due:"Apr 18, 2026", type:"Writing",        submitted:22, total:24, color:"#009B55" },
              { title:"Patwa Proverb Interpretation — Discussion Post", due:"Apr 22, 2026", type:"Comprehension",  submitted:5,  total:24, color:"#FFB900" },
            ].map((a,i)=>(
              <div key={i} style={{ background:"#111411", borderRadius:14, padding:"20px 24px", border:"1px solid rgba(255,248,231,.07)", display:"flex", alignItems:"center", gap:18, flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:200 }}>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:`${a.color}18`, color:a.color, fontWeight:700, letterSpacing:1 }}>{a.type.toUpperCase()}</span>
                  <h4 style={{ fontSize:15, fontWeight:600, color:"#FFF8E7", margin:"7px 0 4px" }}>{a.title}</h4>
                  <p style={{ fontSize:12, color:"rgba(255,248,231,.4)" }}>Due: {a.due}</p>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div className="wj-h" style={{ fontSize:22, color:a.color }}>{a.submitted}/{a.total}</div>
                  <div style={{ fontSize:10, color:"rgba(255,248,231,.35)" }}>Submitted</div>
                </div>
                <div style={{ minWidth:100 }}>
                  <div className="pbar"><div className="pfill" style={{ width:`${(a.submitted/a.total)*100}%`, background:a.color }}/></div>
                </div>
                <button className="btn-g" style={{ padding:"10px 18px", fontSize:12, background:a.color }}>Review</button>
              </div>
            ))}
          </div>
        )}

        {tab==="ai-queue" && (
          <div>
            <div style={{ padding:18, borderRadius:12, marginBottom:18, background:"rgba(157,78,221,.08)", border:"1px solid rgba(157,78,221,.22)", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:22 }} aria-hidden="true">🤖</span>
              <p style={{ fontSize:13, color:"rgba(255,248,231,.7)" }}><strong style={{ color:"#9D4EDD" }}>AI Pre-Scoring Active.</strong> Claude has reviewed 7 submissions and flagged items for your attention. Scores are suggestions — you make the final call.</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { learner:"Tamara Reid",     assignment:"My Community Narrative", score:"87/100", flag:"Excellent Creole code-switching. Recommend highest praise.",          color:"#009B55" },
                { learner:"Jahmai Williams", assignment:"My Community Narrative", score:"61/100", flag:"Strong Patwa voice. SJE sentence structure needs support.",           color:"#FFB900" },
                { learner:"Darius Campbell", assignment:"My Community Narrative", score:"44/100", flag:"Limited vocabulary range. Recommend vocabulary intervention session.", color:"#ff6060" },
              ].map((item,i)=>(
                <div key={i} style={{ background:"#111411", borderRadius:12, padding:"17px 22px", border:"1px solid rgba(255,248,231,.07)", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:600, color:"#FFF8E7", marginBottom:3 }}>{item.learner}</div>
                    <div style={{ fontSize:12, color:"rgba(255,248,231,.45)", marginBottom:7 }}>{item.assignment}</div>
                    <div style={{ fontSize:13, color:"rgba(255,248,231,.7)", fontStyle:"italic" }}>💬 AI: {item.flag}</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div className="wj-h" style={{ fontSize:22, color:item.color }}>{item.score}</div>
                    <div style={{ fontSize:10, color:"rgba(255,248,231,.35)" }}>AI Score</div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button className="btn-o" style={{ padding:"9px 15px", fontSize:12 }}>View Work</button>
                    <button className="btn-g" style={{ padding:"9px 15px", fontSize:12 }}>Confirm</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Admin Dashboard ─── */
function AdminView({ user }: { user: any }) {
  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [writings, setWritings] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, writingsRes, storiesRes, activityRes] = await Promise.all([
        supabase.from("learner_profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_writings").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("stories").select("*").order("created_at", { ascending: false }),
        supabase.from("daily_activity").select("*").order("activity_date", { ascending: false }).limit(100),
      ]);
      setUsers(usersRes.data || []);
      setWritings(writingsRes.data || []);
      setStories(storiesRes.data || []);
      setActivity(activityRes.data || []);
    } catch (e) { console.error("Admin data load error:", e); }
    setLoading(false);
  };

  const updateUserRole = async (profileId: string, newRole: string) => {
    await supabase.from("learner_profiles").update({ role: newRole }).eq("id", profileId);
    setUsers(prev => prev.map(u => u.id === profileId ? { ...u, role: newRole } : u));
    setEditingUser(null);
  };

  const deleteUser = async (profileId: string, authUserId: string) => {
    await supabase.from("learner_profiles").delete().eq("id", profileId);
    setUsers(prev => prev.filter(u => u.id !== profileId));
  };

  const totalXP = users.reduce((sum, u) => sum + (u.xp || 0), 0);
  const teacherCount = users.filter(u => u.role === "teacher").length;
  const learnerCount = users.filter(u => u.role === "learner").length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const totalWritings = writings.length;
  const totalStories = stories.length;
  const avgXP = users.length > 0 ? Math.round(totalXP / users.length) : 0;
  const activeToday = activity.filter(a => {
    const d = new Date(a.activity_date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;
  const totalWordsLearned = activity.reduce((sum, a) => sum + (a.words_learned || 0), 0);

  const filteredUsers = users.filter(u =>
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TabBtn = ({ id, label }: { id: string; label: string }) => (
    <button className="tab-btn" onClick={() => setTab(id)} style={{ background: tab === id ? "#FFB900" : "transparent", color: tab === id ? "#080A08" : "rgba(255,248,231,.6)" }} role="tab" aria-selected={tab === id}>{label}</button>
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚙️</div>
          <p style={{ color: "rgba(255,248,231,.6)", fontSize: 14 }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "48px 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ color: "rgba(255,248,231,.4)", fontSize: 13, marginBottom: 4 }}>Admin Dashboard</p>
            <h2 className="wj-h" style={{ fontSize: 34, color: "#FFF8E7" }}>Platform Control Centre</h2>
            <p style={{ color: "rgba(255,248,231,.45)", fontSize: 13, marginTop: 4 }}>Signed in as {user?.email} · Admin</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-o" onClick={loadAdminData} style={{ padding: "10px 18px", fontSize: 13 }}>🔄 Refresh Data</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Users", value: String(users.length), color: "#FFB900", icon: "👥" },
            { label: "Learners", value: String(learnerCount), color: "#009B55", icon: "📚" },
            { label: "Teachers", value: String(teacherCount), color: "#1E90FF", icon: "🏫" },
            { label: "Admins", value: String(adminCount), color: "#9D4EDD", icon: "🛡️" },
            { label: "Stories in Library", value: String(totalStories), color: "#C4622D", icon: "📖" },
            { label: "Student Writings", value: String(totalWritings), color: "#FFB900", icon: "✏️" },
            { label: "Avg XP per User", value: String(avgXP), color: "#009B55", icon: "⭐" },
            { label: "Words Learned (All)", value: String(totalWordsLearned), color: "#1E90FF", icon: "🔤" },
          ].map(s => (
            <div key={s.label} style={{ background: "#111411", borderRadius: 12, padding: "18px 20px", border: `1px solid ${s.color}20` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="wj-h" style={{ fontSize: 26, color: s.color }}>{s.value}</div>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,248,231,.45)", marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: 4, marginBottom: 22, background: "#111411", borderRadius: 100, padding: 4, width: "fit-content", border: "1px solid rgba(255,248,231,.07)", flexWrap: "wrap" }} role="tablist">
          <TabBtn id="overview" label="📊 Overview" />
          <TabBtn id="users" label="👥 User Management" />
          <TabBtn id="content" label="📖 Content" />
          <TabBtn id="writings" label="✏️ Writing Review" />
          <TabBtn id="activity" label="📈 Activity Log" />
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Role Distribution */}
            <div style={{ background: "#111411", borderRadius: 16, padding: "24px 28px", border: "1px solid rgba(255,248,231,.07)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#FFF8E7", marginBottom: 18 }}>User Role Distribution</h3>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { role: "Learners", count: learnerCount, color: "#009B55" },
                  { role: "Teachers", count: teacherCount, color: "#1E90FF" },
                  { role: "Admins", count: adminCount, color: "#9D4EDD" },
                ].map(r => (
                  <div key={r.role} style={{ flex: 1, minWidth: 150 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "rgba(255,248,231,.7)" }}>{r.role}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.count}</span>
                    </div>
                    <div className="pbar" style={{ height: 8 }}>
                      <div className="pfill" style={{ width: users.length > 0 ? `${(r.count / users.length) * 100}%` : "0%", background: r.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grade Band Distribution */}
            <div style={{ background: "#111411", borderRadius: 16, padding: "24px 28px", border: "1px solid rgba(255,248,231,.07)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#FFF8E7", marginBottom: 18 }}>Grade Band Distribution</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {GRADE_BANDS.map(band => {
                  const count = users.filter(u => u.grade_band === band.id).length;
                  return (
                    <div key={band.id} style={{ flex: 1, minWidth: 140, background: band.bg, borderRadius: 12, padding: "16px 18px", border: `1px solid ${band.color}20`, textAlign: "center" }}>
                      <div style={{ fontSize: 28 }}>{band.emoji}</div>
                      <div className="wj-h" style={{ fontSize: 22, color: band.color, marginTop: 6 }}>{count}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,248,231,.5)", marginTop: 2 }}>{band.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Users by XP */}
            <div style={{ background: "#111411", borderRadius: 16, padding: "24px 28px", border: "1px solid rgba(255,248,231,.07)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#FFF8E7", marginBottom: 18 }}>Top Users by XP</h3>
              {users.sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 5).map((u, i) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < 4 ? "1px solid rgba(255,248,231,.05)" : "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "rgba(255,185,0,.2)" : "rgba(255,248,231,.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: i === 0 ? "#FFB900" : "rgba(255,248,231,.5)" }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#FFF8E7" }}>{u.name || "Unnamed"}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,248,231,.4)", marginLeft: 8 }}>{u.email}</span>
                  </div>
                  <span className="wj-h" style={{ fontSize: 18, color: "#FFB900" }}>{u.xp || 0} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {tab === "users" && (
          <div style={{ background: "#111411", borderRadius: 16, border: "1px solid rgba(255,248,231,.07)", overflow: "hidden" }}>
            <div style={{ padding: "14px 22px", borderBottom: "1px solid rgba(255,248,231,.07)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,248,231,.55)" }}>{filteredUsers.length} of {users.length} users</span>
              <input
                placeholder="🔍 Search by name, email, or role..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ background: "rgba(255,248,231,.05)", border: "1px solid rgba(255,248,231,.1)", borderRadius: 100, padding: "8px 15px", fontSize: 12, color: "#FFF8E7", fontFamily: "'DM Sans',sans-serif", outline: "none", minWidth: 250 }}
                aria-label="Search users"
              />
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(255,248,231,.03)" }}>
                    {["User", "Email", "Role", "Grade Band", "XP", "Streak", "Joined", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "rgba(255,248,231,.35)", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderTop: "1px solid rgba(255,248,231,.05)" }}>
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", background: u.role === "admin" ? "rgba(157,78,221,.2)" : u.role === "teacher" ? "rgba(30,144,255,.2)" : "rgba(0,155,85,.2)", color: u.role === "admin" ? "#9D4EDD" : u.role === "teacher" ? "#1E90FF" : "#009B55", fontWeight: 700 }}>{(u.name || "?")[0].toUpperCase()}</div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#FFF8E7" }}>{u.name || "Unnamed"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 18px", fontSize: 12, color: "rgba(255,248,231,.55)" }}>{u.email || "—"}</td>
                      <td style={{ padding: "13px 18px" }}>
                        {editingUser === u.id ? (
                          <select
                            defaultValue={u.role}
                            onChange={e => updateUserRole(u.id, e.target.value)}
                            onBlur={() => setEditingUser(null)}
                            autoFocus
                            style={{ background: "#111411", border: "1px solid rgba(255,248,231,.2)", borderRadius: 6, padding: "4px 8px", fontSize: 12, color: "#FFF8E7", fontFamily: "'DM Sans',sans-serif" }}
                          >
                            <option value="learner">learner</option>
                            <option value="teacher">teacher</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <span
                            onClick={() => setEditingUser(u.id)}
                            style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600, cursor: "pointer", background: u.role === "admin" ? "rgba(157,78,221,.15)" : u.role === "teacher" ? "rgba(30,144,255,.15)" : "rgba(0,155,85,.15)", color: u.role === "admin" ? "#9D4EDD" : u.role === "teacher" ? "#1E90FF" : "#009B55" }}
                            title="Click to change role"
                          >
                            {u.role || "learner"}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <span style={{ fontSize: 11, color: BAND_COLORS[u.grade_band?.charAt(0).toUpperCase() + u.grade_band?.slice(1)] || "rgba(255,248,231,.5)" }}>{u.grade_band || "—"}</span>
                      </td>
                      <td style={{ padding: "13px 18px", fontSize: 13, fontWeight: 600, color: "#FFB900" }}>{u.xp || 0}</td>
                      <td style={{ padding: "13px 18px", fontSize: 13, color: (u.current_streak || 0) >= 7 ? "#FFB900" : "rgba(255,248,231,.55)" }}>
                        {(u.current_streak || 0) >= 7 ? "🔥 " : ""}{u.current_streak || 0}d
                      </td>
                      <td style={{ padding: "13px 18px", fontSize: 11, color: "rgba(255,248,231,.4)" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => setEditingUser(u.id)}
                            style={{ fontSize: 11, padding: "5px 12px", borderRadius: 100, cursor: "pointer", background: "rgba(255,248,231,.06)", border: "1px solid rgba(255,248,231,.1)", color: "rgba(255,248,231,.7)", fontFamily: "'DM Sans',sans-serif" }}
                          >Edit</button>
                          {u.role !== "admin" && (
                            <button
                              onClick={() => { if (confirm(`Delete user ${u.name || u.email}? This cannot be undone.`)) deleteUser(u.id, u.auth_user_id); }}
                              style={{ fontSize: 11, padding: "5px 12px", borderRadius: 100, cursor: "pointer", background: "rgba(255,60,60,.08)", border: "1px solid rgba(255,60,60,.2)", color: "#ff6060", fontFamily: "'DM Sans',sans-serif" }}
                            >Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTENT TAB */}
        {tab === "content" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: 18, borderRadius: 12, marginBottom: 6, background: "rgba(255,185,0,.06)", border: "1px solid rgba(255,185,0,.15)", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>📖</span>
              <p style={{ fontSize: 13, color: "rgba(255,248,231,.7)" }}><strong style={{ color: "#FFB900" }}>{totalStories} stories</strong> in the library. Stories are sourced from Caribbean folklore, original narratives, and culturally-rooted content.</p>
            </div>
            {stories.map(s => (
              <div key={s.id} style={{ background: "#111411", borderRadius: 14, padding: "20px 24px", border: "1px solid rgba(255,248,231,.07)", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: s.cover_gradient || "linear-gradient(135deg,#FFB900,#009B55)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{s.cover_emoji || "📚"}</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: "#FFF8E7", marginBottom: 4 }}>{s.title}</h4>
                  <p style={{ fontSize: 12, color: "rgba(255,248,231,.45)" }}>{s.origin_country} {s.origin_flag} · {s.word_count || "?"} words · Difficulty: {s.difficulty_level || "?"}/5</p>
                  <p style={{ fontSize: 12, color: "rgba(255,248,231,.35)", marginTop: 4 }}>{s.summary?.substring(0, 120)}{(s.summary?.length || 0) > 120 ? "..." : ""}</p>
                </div>
                <div style={{ textAlign: "center", minWidth: 80 }}>
                  <div style={{ fontSize: 10, padding: "3px 10px", borderRadius: 100, background: "rgba(255,248,231,.06)", color: "rgba(255,248,231,.5)" }}>{(s.age_groups || []).join(", ")}</div>
                </div>
              </div>
            ))}
            {stories.length === 0 && (
              <div style={{ textAlign: "center", padding: 48, color: "rgba(255,248,231,.35)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p>No stories in the library yet.</p>
              </div>
            )}
          </div>
        )}

        {/* WRITINGS TAB */}
        {tab === "writings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: 18, borderRadius: 12, marginBottom: 6, background: "rgba(157,78,221,.06)", border: "1px solid rgba(157,78,221,.15)", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>✏️</span>
              <p style={{ fontSize: 13, color: "rgba(255,248,231,.7)" }}><strong style={{ color: "#9D4EDD" }}>{totalWritings} student writings</strong> submitted. Review AI feedback and moderate content.</p>
            </div>
            {writings.map(w => {
              const author = users.find(u => u.id === w.learner_id || u.auth_user_id === w.learner_id);
              return (
                <div key={w.id} style={{ background: "#111411", borderRadius: 14, padding: "20px 24px", border: "1px solid rgba(255,248,231,.07)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 100, background: "rgba(30,144,255,.12)", color: "#1E90FF", fontWeight: 700, letterSpacing: 1 }}>{(w.writing_type || "ESSAY").toUpperCase()}</span>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 100, background: "rgba(255,248,231,.06)", color: "rgba(255,248,231,.5)" }}>{w.grade_band || "—"}</span>
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 600, color: "#FFF8E7" }}>{w.title || "Untitled"}</h4>
                      <p style={{ fontSize: 12, color: "rgba(255,248,231,.4)", marginTop: 2 }}>by {author?.name || "Unknown"} · {w.created_at ? new Date(w.created_at).toLocaleDateString() : "—"}</p>
                    </div>
                    {w.points_earned != null && (
                      <div style={{ textAlign: "center" }}>
                        <div className="wj-h" style={{ fontSize: 20, color: "#FFB900" }}>+{w.points_earned}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,248,231,.35)" }}>XP</div>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,248,231,.6)", lineHeight: 1.6, maxHeight: 60, overflow: "hidden" }}>{w.content?.substring(0, 250)}{(w.content?.length || 0) > 250 ? "..." : ""}</p>
                  {w.ai_feedback && (
                    <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(157,78,221,.06)", border: "1px solid rgba(157,78,221,.1)" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#9D4EDD" }}>🤖 AI Feedback:</span>
                      <p style={{ fontSize: 12, color: "rgba(255,248,231,.55)", marginTop: 4 }}>{typeof w.ai_feedback === "string" ? w.ai_feedback : JSON.stringify(w.ai_feedback).substring(0, 200)}</p>
                    </div>
                  )}
                </div>
              );
            })}
            {writings.length === 0 && (
              <div style={{ textAlign: "center", padding: 48, color: "rgba(255,248,231,.35)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p>No student writings submitted yet.</p>
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {tab === "activity" && (
          <div style={{ background: "#111411", borderRadius: 16, border: "1px solid rgba(255,248,231,.07)", overflow: "hidden" }}>
            <div style={{ padding: "14px 22px", borderBottom: "1px solid rgba(255,248,231,.07)" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,248,231,.55)" }}>Recent activity across all users (last 100 entries)</span>
            </div>
            {activity.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(255,248,231,.03)" }}>
                    {["Date", "Stories Read", "Games Played", "Words Learned", "XP Earned", "Minutes Active"].map(h => (
                      <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "rgba(255,248,231,.35)", letterSpacing: 1, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activity.slice(0, 25).map((a, i) => (
                    <tr key={a.id || i} style={{ borderTop: "1px solid rgba(255,248,231,.05)" }}>
                      <td style={{ padding: "12px 18px", fontSize: 13, color: "#FFF8E7" }}>{a.activity_date || "—"}</td>
                      <td style={{ padding: "12px 18px", fontSize: 13, color: "rgba(255,248,231,.6)" }}>{a.stories_read || 0}</td>
                      <td style={{ padding: "12px 18px", fontSize: 13, color: "rgba(255,248,231,.6)" }}>{a.games_played || 0}</td>
                      <td style={{ padding: "12px 18px", fontSize: 13, color: "#1E90FF", fontWeight: 600 }}>{a.words_learned || 0}</td>
                      <td style={{ padding: "12px 18px", fontSize: 13, color: "#FFB900", fontWeight: 600 }}>{a.xp_earned || 0}</td>
                      <td style={{ padding: "12px 18px", fontSize: 13, color: "rgba(255,248,231,.6)" }}>{a.minutes_active || 0}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: 48, color: "rgba(255,248,231,.35)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p>No activity recorded yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WordJam() {
  const [view, setView] = useState("landing");
  const [visible, setVisible] = useState(true);
  const [showPatwa, setShowPatwa] = useState(true);
  const [activeBand, setActiveBand] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchUserRole(user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) fetchUserRole(session.user.id);
      else setUserRole(null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUserRole = async (authUserId: string) => {
    const { data } = await supabase.from("learner_profiles").select("role").eq("auth_user_id", authUserId).single();
    setUserRole(data?.role || null);
  };

  const navigate = (next: string) => {
    setVisible(false);
    setTimeout(() => { setView(next); setVisible(true); }, 210);
  };

  const handleAuth = async (email: string, password: string, name: string, role: string, gradeBand: string) => {
    const isSignUp = !user;
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from("learner_profiles").insert({
            auth_user_id: data.user.id,
            name,
            email,
            role,
            age_group: gradeBand,
            xp: 0,
            current_streak: 0,
            longest_streak: 0,
          });
          setUser(data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(data.user);
      }
    } catch (err: any) {
      throw new Error(err.message || "Authentication failed");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("landing");
  };

  const fadeCSS = `
    .fade-page{opacity:${visible?1:0};transform:translateY(${visible?0:12}px);transition:opacity .22s ease,transform .22s ease;}
  `;

  const currentStoryId = view.startsWith("story:") ? view.split(":")[1] : null;

  return (
    <div className="wj">
      <style>{GLOBAL_CSS + fadeCSS}</style>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, height:62, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 36px", background:"rgba(8,10,8,.9)", backdropFilter:"blur(18px)", borderBottom:"1px solid rgba(255,185,0,.1)" }} role="navigation" aria-label="Main navigation">
        <div onClick={()=>navigate("landing")} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} role="button" tabIndex={0} onKeyDown={e => { if(e.key==="Enter" || e.key===" ") navigate("landing"); }} aria-label="WordJam home">
          <div style={{ width:33, height:33, borderRadius:8, background:"linear-gradient(135deg,#FFB900,#009B55)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:900, color:"#080A08", fontFamily:"Abril Fatface,serif" }}>W</div>
          <span className="wj-h" style={{ fontSize:19, color:"#FFF8E7", letterSpacing:.5 }}>WORD<span style={{ color:"#FFB900" }}>JAM</span></span>
        </div>
        <div style={{ display:"flex", gap:28 }}>
          {[["Learn","bands"],["Stories","read"],["Write","write"],["My Progress","dashboard"],["Teachers","teacher"],
            ...(userRole === "admin" ? [["Admin","admin"]] : [])
          ].map(([l,t])=>(
            <span key={t} className={`nav-i${view===t?" nav-a":""}`} onClick={()=>navigate(t)} role="button" tabIndex={0} onKeyDown={e => { if(e.key==="Enter" || e.key===" ") navigate(t); }} style={t==="admin"?{color:view==="admin"?"#9D4EDD":"rgba(157,78,221,.7)"}:{}}>{l}{t==="admin"?" 🛡️":""}</span>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {user ? (
            <>
              <span style={{ color:"rgba(255,248,231,.6)", fontSize:13, display:"flex", alignItems:"center" }}>{user.email}</span>
              <button className="btn-o" onClick={handleLogout} style={{ padding:"9px 18px", fontSize:13 }}>Sign Out</button>
            </>
          ) : (
            <>
              <button className="btn-o" onClick={() => setAuthModalOpen(true)} style={{ padding:"9px 18px", fontSize:13 }}>Sign In</button>
              <button className="btn-g" onClick={() => setAuthModalOpen(true)} style={{ padding:"9px 18px", fontSize:13 }}>Start Free 🎉</button>
            </>
          )}
        </div>
      </nav>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onAuth={handleAuth}/>

      <main id="main-content" className="fade-page" style={{ paddingTop:62 }}>
        {view==="landing"   && <LandingView navigate={navigate}/>}
        {view==="bands"     && <GradeBandsView navigate={navigate} activeBand={activeBand} setActiveBand={setActiveBand}/>}
        {view==="read"      && <StoryLibraryView navigate={navigate} user={user}/>}
        {currentStoryId && <StoryReaderView navigate={navigate} storyId={currentStoryId} user={user}/>}
        {view==="write"     && <WritingStudioView navigate={navigate} user={user}/>}
        {view==="bridge"    && <CreoleBridgeView navigate={navigate}/>}
        {view==="dashboard" && <DashboardView user={user}/>}
        {view==="teacher"   && <TeacherView/>}
        {view==="admin"     && userRole === "admin" && <AdminView user={user}/>}
      </main>
    </div>
  );
}


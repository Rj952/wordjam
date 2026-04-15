"use client";

import { useState } from "react";

// ═══════════════════════════════════════════════
// WORDJAM — Jamaican Creole Literacy Platform
// ═══════════════════════════════════════════════

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
`;

function LandingView({ navigate }: { navigate: (v: string) => void }) {
  return (
    <div>
      <section style={{ minHeight:"calc(100vh - 62px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 40px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:700, height:450, background:"radial-gradient(ellipse,rgba(0,155,85,.13) 0%,rgba(255,185,0,.07) 45%,transparent 70%)", pointerEvents:"none" }}/>
        <div className="f1" style={{ position:"absolute", top:"15%", left:"10%", fontSize:52, opacity:.55 }}>🌿</div>
        <div className="f2" style={{ position:"absolute", top:"18%", right:"9%",  fontSize:40, opacity:.45 }}>📖</div>
        <div className="f3" style={{ position:"absolute", bottom:"28%", left:"7%", fontSize:36, opacity:.45 }}>🕷️</div>
        <div className="f4" style={{ position:"absolute", bottom:"25%", right:"11%",fontSize:44, opacity:.4 }}>🌺</div>
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
          <button className="btn-g" onClick={() => navigate("bands")} style={{ fontSize:15, padding:"15px 36px" }}>Choose Your Level 🌱</button>
          <button className="btn-o" onClick={() => navigate("read")} style={{ fontSize:15, padding:"15px 36px" }}>Read a Story</button>
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
              <div style={{ fontSize:34, marginBottom:14 }}>{f.icon}</div>
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
        <button className="btn-g" onClick={() => navigate("bands")} style={{ fontSize:15, padding:"15px 38px" }}>Pick Your Grade Band →</button>
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
              style={{ background:activeBand===band.id?band.bg:"#111411", border:`1.5px solid ${activeBand===band.id?band.color+"55":"rgba(255,248,231,.07)"}`, borderRadius:16, padding:"22px 26px", display:"flex", alignItems:"center", gap:22, flexWrap:"wrap" }}>
              <div className="wj-h" style={{ fontSize:44, color:band.color, opacity:.25, minWidth:36, lineHeight:1 }}>{i+1}</div>
              <div style={{ fontSize:38 }}>{band.emoji}</div>
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
                style={{ padding:"11px 22px", fontSize:13, background:band.color, whiteSpace:"nowrap" }}>
                Start →
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop:36, padding:20, borderRadius:12, background:"rgba(0,155,85,.08)", border:"1px solid rgba(0,155,85,.22)", display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:22 }}>📋</span>
          <p style={{ fontSize:13, color:"rgba(255,248,231,.7)", lineHeight:1.6 }}>
            <strong style={{ color:"#009B55" }}>NSC-Aligned:</strong> All grade bands are mapped to Jamaica&apos;s National Standards Curriculum literacy benchmarks. Teachers can view alignment in the Command Centre.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReadingView({ showPatwa, setShowPatwa }: { showPatwa: boolean; setShowPatwa: (v: boolean) => void }) {
  const [mode, setMode] = useState("single");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const LangBtn = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} style={{ padding:"9px 18px", borderRadius:100, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif", transition:"all .2s", background:active?"#FFB900":"transparent", color:active?"#080A08":"rgba(255,248,231,.6)" }}>{label}</button>
  );
  return (
    <div style={{ minHeight:"100vh", padding:"48px 40px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ marginBottom:30 }}>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <span style={{ fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:100, background:"rgba(255,185,0,.14)", color:"#FFB900", letterSpacing:1, textTransform:"uppercase" }}>Anansi Series · Sapling Level</span>
            <span style={{ fontSize:12, color:"rgba(255,248,231,.4)", alignSelf:"center" }}>Grades 3–5 · Ages 8–10</span>
          </div>
          <h1 className="wj-h" style={{ fontSize:34, color:"#FFF8E7", marginBottom:7 }}>Anansi an di Hummingbird</h1>
          <p style={{ fontSize:13, color:"rgba(255,248,231,.45)" }}>Retold in Jamaican Patwa and Standard Jamaican English</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:26, flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", background:"#111411", borderRadius:100, padding:4, border:"1px solid rgba(255,248,231,.1)" }}>
            <LangBtn label="🇯🇲 Patwa" active={showPatwa && mode==="single"} onClick={()=>{setShowPatwa(true);setMode("single");}}/>
            <LangBtn label="🎓 English" active={!showPatwa && mode==="single"} onClick={()=>{setShowPatwa(false);setMode("single");}}/>
            <LangBtn label="⇄ Side by Side" active={mode==="split"} onClick={()=>setMode("split")}/>
          </div>
          <button style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(0,155,85,.12)", border:"1.5px solid rgba(0,155,85,.3)", color:"#00BF68", padding:"10px 20px", borderRadius:100, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            🎧 Listen (Jamaican Voice)
          </button>
        </div>
        {mode==="split" ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:36 }}>
            {[true,false].map(isPatwa=>(
              <div key={String(isPatwa)} style={{ background:"#111411", borderRadius:16, padding:26, border:`1.5px solid ${isPatwa?"rgba(255,185,0,.2)":"rgba(0,155,85,.2)"}` }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:isPatwa?"#FFB900":"#009B55", marginBottom:18, paddingBottom:12, borderBottom:`1px solid ${isPatwa?"rgba(255,185,0,.14)":"rgba(0,155,85,.14)"}` }}>
                  {isPatwa?"🇯🇲 Jamaican Patwa":"🎓 Standard English"}
                </div>
                {(isPatwa?STORY_PATWA:STORY_SJE).map((p,i)=>(
                  <p key={i} style={{ fontSize:15, lineHeight:1.85, color:"rgba(255,248,231,.9)", marginBottom:14, fontStyle:p.startsWith('"')?"italic":"normal" }}>{p}</p>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background:"#111411", borderRadius:16, padding:34, marginBottom:36, border:"1px solid rgba(255,248,231,.07)" }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:showPatwa?"#FFB900":"#009B55", marginBottom:22, paddingBottom:14, borderBottom:"1px solid rgba(255,248,231,.07)" }}>
              {showPatwa?"🇯🇲 Jamaican Patwa":"🎓 Standard Jamaican English"}
            </div>
            {(showPatwa?STORY_PATWA:STORY_SJE).map((p,i)=>(
              <p key={i} style={{ fontSize:17, lineHeight:1.9, color:"rgba(255,248,231,.9)", marginBottom:20, fontStyle:p.startsWith('"')?"italic":"normal" }}>{p}</p>
            ))}
          </div>
        )}
        {showPatwa && mode==="single" && (
          <div style={{ marginBottom:32, padding:22, borderRadius:14, background:"rgba(255,185,0,.06)", border:"1px solid rgba(255,185,0,.2)" }}>
            <h4 style={{ fontSize:12, fontWeight:700, color:"#FFB900", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>🔤 Patwa Vocabulary Spotlight</h4>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:10 }}>
              {VOCAB.map(v=>(
                <div key={v.patwa} style={{ background:"#111411", borderRadius:10, padding:"13px 15px", border:"1px solid rgba(255,248,231,.07)" }}>
                  <div style={{ fontSize:16, fontWeight:700, color:"#FFB900", marginBottom:4 }}>{v.patwa}</div>
                  <div style={{ fontSize:13, color:"rgba(255,248,231,.8)", marginBottom:5 }}>→ {v.sje}</div>
                  <div style={{ fontSize:11, color:"rgba(255,248,231,.38)" }}>{v.origin}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ marginBottom:32 }}>
          <h3 className="wj-h" style={{ fontSize:22, color:"#FFF8E7", marginBottom:18 }}>Check Your Understanding</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {COMPREHENSION_QS.map((q,qi)=>(
              <div key={qi} style={{ background:"#111411", borderRadius:14, padding:24, border:"1px solid rgba(255,248,231,.07)" }}>
                <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:100, background:q.type==="Literal"?"rgba(255,185,0,.14)":"rgba(30,144,255,.14)", color:q.type==="Literal"?"#FFB900":"#1E90FF", letterSpacing:1, textTransform:"uppercase", marginBottom:12, display:"inline-block" }}>{q.type}</span>
                <p style={{ fontSize:15, color:"#FFF8E7", fontWeight:500, marginBottom:14 }}>{q.q}</p>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {q.options.map((opt,oi)=>{
                    const sel = answers[qi]===oi;
                    const correct = oi===q.correct;
                    return (
                      <button key={oi} onClick={()=>setAnswers(a=>({...a,[qi]:oi}))}
                        style={{ textAlign:"left", padding:"11px 15px", borderRadius:10, cursor:"pointer", fontSize:13, fontFamily:"'DM Sans',sans-serif", transition:"all .2s",
                          background: sel?(correct?"rgba(0,155,85,.2)":"rgba(255,80,80,.14)"):"rgba(255,248,231,.04)",
                          border: `1.5px solid ${sel?(correct?"#009B55":"#ff5050"):"rgba(255,248,231,.09)"}`,
                          color:"#FFF8E7" }}>
                        {opt} {sel && (correct?" ✅":" ❌")}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign:"center", padding:28, borderRadius:14, background:"linear-gradient(135deg,rgba(157,78,221,.12),rgba(30,144,255,.08))", border:"1px solid rgba(157,78,221,.22)" }}>
          <div style={{ fontSize:28, marginBottom:10 }}>🤖</div>
          <h4 style={{ fontSize:17, fontWeight:700, color:"#FFF8E7", marginBottom:7 }}>Ready to Write About This Story?</h4>
          <p style={{ fontSize:13, color:"rgba(255,248,231,.6)", marginBottom:20 }}>Use the AI Writing Studio — respond in Patwa, English, or both. Claude gives culturally-affirming feedback.</p>
          <button className="btn-g" style={{ background:"#9D4EDD" }}>Open AI Writing Studio ✍️</button>
        </div>
      </div>
    </div>
  );
}

function DashboardView() {
  return (
    <div style={{ minHeight:"100vh", padding:"48px 40px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ marginBottom:38 }}>
          <p style={{ color:"rgba(255,248,231,.45)", fontSize:14, marginBottom:4 }}>Good morning, Kezia 🌅</p>
          <h2 className="wj-h" style={{ fontSize:36, color:"#FFF8E7" }}>Your Learning Journey</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))", gap:14, marginBottom:36 }}>
          {[
            { icon:"🔥", value:"12",  label:"Day Streak",    color:"#FFB900" },
            { icon:"📖", value:"47",  label:"Stories Read",  color:"#009B55" },
            { icon:"🔤", value:"214", label:"Words Learned", color:"#1E90FF" },
            { icon:"🏅", value:"3/6", label:"Badges Earned", color:"#9D4EDD" },
            { icon:"✍️", value:"8",   label:"Pieces Written",color:"#C4622D" },
          ].map(s=>(
            <div key={s.label} style={{ background:"#111411", borderRadius:14, padding:"20px 22px", border:`1px solid ${s.color}22` }}>
              <div style={{ fontSize:26, marginBottom:8 }}>{s.icon}</div>
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
                  <div style={{ width:54, height:54, borderRadius:"50%", margin:"0 auto 7px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, background:b.earned?`${b.color}20`:"rgba(255,248,231,.04)", border:`2px solid ${b.earned?b.color:"rgba(255,248,231,.1)"}`, filter:b.earned?"none":"grayscale(100%) opacity(.3)" }}>{b.emoji}</div>
                  <div style={{ fontSize:10, color:b.earned?"rgba(255,248,231,.7)":"rgba(255,248,231,.25)", lineHeight:1.3 }}>{b.name}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:18, padding:"12px 15px", borderRadius:10, background:"rgba(157,78,221,.08)", border:"1px solid rgba(157,78,221,.2)", fontSize:12, color:"rgba(255,248,231,.7)" }}>
              🏔️ <strong style={{ color:"#9D4EDD" }}>Next:</strong> Read 3 more stories to unlock &quot;Blue Mountain Reader&quot;
            </div>
          </div>
        </div>
        <div style={{ background:"#111411", borderRadius:16, padding:26, border:"1px solid rgba(255,248,231,.07)" }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:"#FFF8E7", marginBottom:18 }}>Recent Activity</h3>
          {[
            { icon:"📖", act:"Read",     title:"Anansi an di Hummingbird",              time:"Today, 9:14am",    pts:"+15 pts", color:"#FFB900" },
            { icon:"✍️", act:"Wrote",    title:"My Favourite Yard Memory (narrative)",  time:"Yesterday",        pts:"+22 pts", color:"#009B55" },
            { icon:"🎙️", act:"Recorded", title:"Oral retelling of Anansi story",        time:"2 days ago",       pts:"+18 pts", color:"#1E90FF" },
            { icon:"🔤", act:"Mastered", title:"10 new Patwa vocabulary words",         time:"3 days ago",       pts:"+10 pts", color:"#9D4EDD" },
          ].map((a,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:15, padding:"14px 0", borderBottom:i<3?"1px solid rgba(255,248,231,.06)":"none" }}>
              <div style={{ width:40, height:40, borderRadius:10, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", background:`${a.color}14`, flexShrink:0 }}>{a.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, color:"rgba(255,248,231,.85)", fontWeight:500 }}><span style={{ color:a.color }}>{a.act}:</span> {a.title}</div>
                <div style={{ fontSize:11, color:"rgba(255,248,231,.38)", marginTop:2 }}>{a.time}</div>
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:a.color }}>{a.pts}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeacherView() {
  const [tab, setTab] = useState("roster");
  const TabBtn = ({ id, label }: { id: string; label: string }) => (
    <button className="tab-btn" onClick={()=>setTab(id)} style={{ background:tab===id?"#FFB900":"transparent", color:tab===id?"#080A08":"rgba(255,248,231,.6)" }}>{label}</button>
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
            <button className="btn-o" style={{ padding:"10px 18px", fontSize:13 }}>📤 Export Report</button>
            <button className="btn-g" style={{ padding:"10px 18px", fontSize:13 }}>+ New Assignment</button>
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
        <div style={{ display:"flex", gap:4, marginBottom:22, background:"#111411", borderRadius:100, padding:4, width:"fit-content", border:"1px solid rgba(255,248,231,.07)" }}>
          <TabBtn id="roster"      label="👥 Roster"/>
          <TabBtn id="assignments" label="📋 Assignments"/>
          <TabBtn id="ai-queue"    label="🤖 AI Review Queue"/>
        </div>
        {tab==="roster" && (
          <div style={{ background:"#111411", borderRadius:16, border:"1px solid rgba(255,248,231,.07)", overflow:"hidden" }}>
            <div style={{ padding:"14px 22px", borderBottom:"1px solid rgba(255,248,231,.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, fontWeight:600, color:"rgba(255,248,231,.55)" }}>5 of 24 learners shown</span>
              <input placeholder="🔍 Search learners..." style={{ background:"rgba(255,248,231,.05)", border:"1px solid rgba(255,248,231,.1)", borderRadius:100, padding:"8px 15px", fontSize:12, color:"#FFF8E7", fontFamily:"'DM Sans',sans-serif", outline:"none" }}/>
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
                      <button style={{ fontSize:12, padding:"6px 14px", borderRadius:100, cursor:"pointer", background:"rgba(255,248,231,.06)", border:"1px solid rgba(255,248,231,.1)", color:"rgba(255,248,231,.7)", fontFamily:"'DM Sans',sans-serif" }}>View →</button>
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
              <span style={{ fontSize:22 }}>🤖</span>
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

export default function WordJam() {
  const [view, setView] = useState("landing");
  const [visible, setVisible] = useState(true);
  const [showPatwa, setShowPatwa] = useState(true);
  const [activeBand, setActiveBand] = useState<string | null>(null);

  const navigate = (next: string) => {
    setVisible(false);
    setTimeout(() => { setView(next); setVisible(true); }, 210);
  };

  const fadeCSS = `
    .fade-page{opacity:${visible?1:0};transform:translateY(${visible?0:12}px);transition:opacity .22s ease,transform .22s ease;}
  `;

  return (
    <div className="wj">
      <style>{GLOBAL_CSS + fadeCSS}</style>
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, height:62, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 36px", background:"rgba(8,10,8,.9)", backdropFilter:"blur(18px)", borderBottom:"1px solid rgba(255,185,0,.1)" }}>
        <div onClick={()=>navigate("landing")} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          <div style={{ width:33, height:33, borderRadius:8, background:"linear-gradient(135deg,#FFB900,#009B55)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:900, color:"#080A08", fontFamily:"Abril Fatface,serif" }}>W</div>
          <span className="wj-h" style={{ fontSize:19, color:"#FFF8E7", letterSpacing:.5 }}>WORD<span style={{ color:"#FFB900" }}>JAM</span></span>
        </div>
        <div style={{ display:"flex", gap:28 }}>
          {[["Learn","bands"],["Stories","read"],["My Progress","dashboard"],["Teachers","teacher"]].map(([l,t])=>(
            <span key={t} className={`nav-i${view===t?" nav-a":""}`} onClick={()=>navigate(t)}>{l}</span>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn-o" style={{ padding:"9px 18px", fontSize:13 }}>Sign In</button>
          <button className="btn-g" style={{ padding:"9px 18px", fontSize:13 }}>Start Free 🎉</button>
        </div>
      </nav>
      <div className="fade-page" style={{ paddingTop:62 }}>
        {view==="landing"   && <LandingView navigate={navigate}/>}
        {view==="bands"     && <GradeBandsView navigate={navigate} activeBand={activeBand} setActiveBand={setActiveBand}/>}
        {view==="read"      && <ReadingView showPatwa={showPatwa} setShowPatwa={setShowPatwa}/>}
        {view==="dashboard" && <DashboardView/>}
        {view==="teacher"   && <TeacherView/>}
      </div>
    </div>
  );
}

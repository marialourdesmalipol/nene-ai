import { useState, useRef, useEffect } from "react";

/* ─── Tokens ─────────────────────────────────────────────────── */
const C = {
  rose:       "#C97B9F",
  roseDark:   "#8F4D6E",
  roseMid:    "#B5698C",
  rosePale:   "#F2D4E2",
  roseFaint:  "#FBF0F5",
  lilac:      "#9B7DBF",
  lilacPale:  "#EDE6F8",
  cream:      "#FDF8F2",
  sand:       "#F4EAD5",
  warmWhite:  "#FEFCFA",
  text:       "#261520",
  textMid:    "#6B4A5C",
  textLight:  "#B39AAA",
  border:     "#EDE0E8",
  white:      "#FFFFFF",
  green:      "#6BAF90",
  greenPale:  "#D6EFE4",
  amber:      "#C98A32",
  amberPale:  "#FEF0D6",
  red:        "#BE5555",
  redPale:    "#FCEAEA",
  sidebarBg:  "#2A1622",
};

const SERIF = `'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif`;
const SANS  = `'Trebuchet MS','Segoe UI',Tahoma,Geneva,sans-serif`;

const STATES = {
  idle:      { color:"#BBA8B8", glow:"#BBA8B8", label:"Nene is resting…",   active:false },
  listening: { color:C.green,   glow:"#4D9A78", label:"Nene is listening…", active:true  },
  thinking:  { color:C.amber,   glow:"#C98A32", label:"Nene is thinking…",  active:true  },
  speaking:  { color:C.lilac,   glow:"#7A5CAA", label:"Nene is speaking…",  active:true  },
};

const TRANSCRIPT = [
  { role:"nene", text:"Hi Lola! Ako si Nene, ang apo mong laging nandito para sa\u2019yo. Kumusta ka today? Kumain ka na ba ng breakfast?" },
  { role:"lola", text:"Nene! Kumusta ka rin. Masakit ulo ko kanina, pero okay na ngayon." },
  { role:"nene", text:"Ay Lola, I will let your family know about that headache po. Please sit down and rest muna. Ininom mo na ba ang Losartan mo ngayong umaga?" },
  { role:"lola", text:"Hindi pa\u2026 nakalimutan ko." },
  { role:"nene", text:"Sige po Lola, inumin mo na agad kasama ang breakfast mo ha. Ingat po!" },
];

const ALERTS = [
  { sev:"amber", time:"10:23 AM", msg:"Headache reported \u2014 Lola mentioned head pain" },
  { sev:"green", time:"10:26 AM", msg:"Took Losartan \u2014 medication confirmed" },
  { sev:"amber", time:"10:28 AM", msg:"Losartan was not yet taken at check-in time" },
];

const MEDS = [
  { name:"Losartan 50mg",   sub:"Blood Pressure", status:"taken",   note:"Taken 10:26 AM" },
  { name:"Metformin 500mg", sub:"Diabetes",        status:"pending", note:"After lunch"     },
];

const CHECKIN = [
  { label:"Mood",  val:"Okay",              ok:true  },
  { label:"Sleep", val:"Good",              ok:true  },
  { label:"Meal",  val:"Not yet",           ok:false },
  { label:"Pain",  val:"Headache 10:23 AM", ok:false },
];

/* ─── Responsive hook ────────────────────────────────────────── */
function useWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

/* ─── Global styles ──────────────────────────────────────────── */
const STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes nn-halo {
    0%,100%{transform:scale(1);opacity:.16;} 50%{transform:scale(1.5);opacity:0;}
  }
  @keyframes nn-halo2 {
    0%,100%{transform:scale(1);opacity:.1;} 50%{transform:scale(1.25);opacity:0;}
  }
  @keyframes nn-breathe {
    0%,100%{transform:scale(1);} 50%{transform:scale(1.045);}
  }
  @keyframes nn-bar {
    0%,100%{transform:scaleY(.25);} 50%{transform:scaleY(1);}
  }
  @keyframes nn-blink {
    0%,100%{opacity:1;} 50%{opacity:.25;}
  }
  .nn-halo  { animation: nn-halo  2.8s ease-in-out infinite; }
  .nn-halo2 { animation: nn-halo2 2.8s ease-in-out infinite .4s; }
  .nn-face  { animation: nn-breathe 3.4s ease-in-out infinite; }
  .nn-b1{animation:nn-bar .75s ease-in-out infinite 0s;}
  .nn-b2{animation:nn-bar .75s ease-in-out infinite .15s;}
  .nn-b3{animation:nn-bar .75s ease-in-out infinite .3s;}
  .nn-b4{animation:nn-bar .75s ease-in-out infinite .45s;}
  .nn-b5{animation:nn-bar .75s ease-in-out infinite .6s;}
  .nn-live { animation: nn-blink 1.5s ease-in-out infinite; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: ${C.rosePale}; border-radius: 3px; }
  .nav-btn:hover { background: rgba(201,123,159,0.12) !important; }
  .tab-btn:active { opacity: 0.7; }
`;

/* ─── NeneFace ───────────────────────────────────────────────── */
function NeneFace({ state, size = 140 }) {
  const cfg = STATES[state] || STATES.idle;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      {cfg.active && <>
        <div className="nn-halo"  style={{ position:"absolute", inset:-size*.15, borderRadius:"50%", background:cfg.color, pointerEvents:"none" }}/>
        <div className="nn-halo2" style={{ position:"absolute", inset:-size*.07, borderRadius:"50%", background:cfg.color, pointerEvents:"none" }}/>
      </>}
      <div className="nn-face" style={{
        width:size, height:size, borderRadius:"50%",
        background:`radial-gradient(circle at 38% 32%, #fff 0%, ${cfg.color}44 45%, ${cfg.color}BB 100%)`,
        boxShadow:`0 8px 36px ${cfg.glow}55, 0 2px 10px ${cfg.glow}22`,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <svg width={size*.56} height={size*.56} viewBox="0 0 90 90" fill="none">
          <ellipse cx="45" cy="16" rx="11" ry="9"  fill="white" fillOpacity=".75"/>
          <ellipse cx="36" cy="22" rx="5"  ry="7"  fill="white" fillOpacity=".5"/>
          <ellipse cx="54" cy="22" rx="5"  ry="7"  fill="white" fillOpacity=".5"/>
          <ellipse cx="45" cy="40" rx="22" ry="24" fill="white" fillOpacity=".88"/>
          {state === "idle" ? (
            <>
              <path d="M34 38 Q37 35.5 40 38" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M50 38 Q53 35.5 56 38" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" fill="none"/>
            </>
          ) : (
            <>
              <circle cx="37" cy="38" r="4" fill={cfg.color} fillOpacity=".9"/>
              <circle cx="53" cy="38" r="4" fill={cfg.color} fillOpacity=".9"/>
              <circle cx="38.4" cy="36.8" r="1.4" fill="white"/>
              <circle cx="54.4" cy="36.8" r="1.4" fill="white"/>
            </>
          )}
          <path d="M37 49 Q45 57 53 49" stroke={cfg.color} strokeWidth="2.3" strokeLinecap="round" fill="none"/>
          <path d="M23 70 Q45 61 67 70" stroke="white" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" fill="none"/>
          {state === "speaking" && [28,35,42,49,56].map((x,i) => (
            <rect key={i} className={`nn-b${i+1}`}
              x={x} y="72" width="4.5" height="10" rx="2.2"
              fill={cfg.color} fillOpacity=".85"
              style={{ transformOrigin:`${x+2.25}px 82px` }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

/* ─── Shared card ────────────────────────────────────────────── */
function Card({ title, children }) {
  return (
    <div style={{
      background:C.white, borderRadius:14, padding:"18px 20px",
      boxShadow:"0 2px 16px rgba(42,22,34,.05)", border:`1px solid ${C.border}`,
    }}>
      <div style={{
        fontFamily:SANS, fontSize:8, fontWeight:700, letterSpacing:2.5,
        color:C.textLight, textTransform:"uppercase", marginBottom:12,
        paddingBottom:10, borderBottom:`1px solid ${C.border}`,
      }}>{title}</div>
      {children}
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      display:"inline-block", padding:"2px 9px", borderRadius:20,
      background:`${color}22`, color,
      fontSize:9, fontWeight:700, fontFamily:SANS, letterSpacing:1.2, textTransform:"uppercase",
    }}>{label}</span>
  );
}

/* ─── Sidebar (laptop only) ──────────────────────────────────── */
function Sidebar({ view, onSwitch }) {
  return (
    <div style={{
      width:220, flexShrink:0, background:C.sidebarBg,
      display:"flex", flexDirection:"column", padding:"36px 0 28px",
    }}>
      <div style={{ padding:"0 28px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
          <div style={{ flex:1, height:"1px", background:`linear-gradient(to right,transparent,${C.rose}66)` }}/>
          <div style={{ width:4, height:4, borderRadius:"50%", background:C.rose, opacity:.6 }}/>
          <div style={{ flex:1, height:"1px", background:`linear-gradient(to left,transparent,${C.rose}66)` }}/>
        </div>
        <div style={{ fontFamily:SERIF, fontSize:28, letterSpacing:8, textTransform:"uppercase", color:C.roseMid, textAlign:"center", lineHeight:1 }}>Nene</div>
        <div style={{ fontFamily:SANS, fontSize:8, letterSpacing:2.5, textTransform:"uppercase", color:"#7A5C6A", textAlign:"center", marginTop:7 }}>The apo that never forgets</div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:8 }}>
          <div style={{ flex:1, height:"1px", background:`linear-gradient(to right,transparent,#4A2E3A)` }}/>
          <div style={{ flex:1, height:"1px", background:`linear-gradient(to left,transparent,#4A2E3A)` }}/>
        </div>
      </div>

      <div style={{ flex:1, padding:"0 16px", display:"flex", flexDirection:"column", gap:4 }}>
        {[
          { id:"elder",     label:"Companion", sub:"Lola's screen" },
          { id:"dashboard", label:"Dashboard", sub:"Family view"   },
        ].map(n => {
          const active = view === n.id;
          return (
            <button key={n.id} className="nav-btn" onClick={() => onSwitch(n.id)} style={{
              width:"100%", padding:"12px 14px", borderRadius:10,
              border:"none", cursor:"pointer", textAlign:"left",
              background: active ? `linear-gradient(135deg,${C.rose}22,${C.lilac}18)` : "transparent",
              borderLeft: active ? `2px solid ${C.rose}` : "2px solid transparent",
              transition:"all .18s",
            }}>
              <div style={{ fontFamily:SANS, fontSize:13, fontWeight:700, letterSpacing:.4, color: active ? C.rose : "#7A5C6A" }}>{n.label}</div>
              <div style={{ fontFamily:SANS, fontSize:10, color:"#5A3C4A", marginTop:2 }}>{n.sub}</div>
            </button>
          );
        })}
      </div>

      <div style={{ padding:"0 28px" }}>
        <div style={{ height:1, background:"#3A2230", marginBottom:14 }}/>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div className="nn-live" style={{ width:6, height:6, borderRadius:"50%", background:C.green }}/>
          <span style={{ fontFamily:SANS, fontSize:9, color:"#5A3C4A", letterSpacing:1.5, textTransform:"uppercase" }}>Connected</span>
        </div>
        <div style={{ fontFamily:SANS, fontSize:8, color:"#4A2E3A", letterSpacing:1.5, textTransform:"uppercase", marginTop:8 }}>Voice · Vision · Care</div>
      </div>
    </div>
  );
}

/* ─── Mobile top bar ─────────────────────────────────────────── */
function MobileTopBar({ view }) {
  return (
    <div style={{
      background:C.sidebarBg, padding:"14px 20px 12px",
      display:"flex", flexDirection:"column", alignItems:"center", gap:2, flexShrink:0,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
        <div style={{ flex:1, height:"1px", width:28, background:`linear-gradient(to right,transparent,${C.rose}55)` }}/>
        <div style={{ width:3, height:3, borderRadius:"50%", background:C.rose, opacity:.6 }}/>
        <div style={{ flex:1, height:"1px", width:28, background:`linear-gradient(to left,transparent,${C.rose}55)` }}/>
      </div>
      <div style={{ fontFamily:SERIF, fontSize:22, letterSpacing:7, textTransform:"uppercase", color:C.roseMid, lineHeight:1 }}>Nene</div>
      <div style={{ fontFamily:SANS, fontSize:7, letterSpacing:2.5, textTransform:"uppercase", color:"#7A5C6A" }}>
        {view === "elder" ? "Companion · Lola's Screen" : "Family Dashboard"}
      </div>
    </div>
  );
}

/* ─── Mobile bottom tab bar ──────────────────────────────────── */
function MobileTabBar({ view, onSwitch }) {
  const tabs = [
    { id:"elder",     label:"Companion", icon:(
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    )},
    { id:"dashboard", label:"Dashboard", icon:(
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    )},
  ];
  return (
    <div style={{
      background:C.sidebarBg, borderTop:`1px solid #3D2232`,
      display:"flex", flexShrink:0,
    }}>
      {tabs.map(t => {
        const active = view === t.id;
        return (
          <button key={t.id} className="tab-btn" onClick={() => onSwitch(t.id)} style={{
            flex:1, padding:"10px 0 12px", border:"none", cursor:"pointer",
            background:"transparent",
            borderTop: active ? `2px solid ${C.rose}` : "2px solid transparent",
            display:"flex", flexDirection:"column", alignItems:"center", gap:4,
            color: active ? C.rose : "#7A5C6A",
            transition:"all .18s",
          }}>
            {t.icon}
            <span style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:.5 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Elder / Companion content ──────────────────────────────── */
function ElderContent({ isMobile }) {
  const [state, setState]   = useState("idle");
  const [lines, setLines]   = useState([]);
  const [active, setActive] = useState(false);
  const scrollRef = useRef(null);
  const timer     = useRef(null);
  const idx       = useRef(0);
  const cfg = STATES[state];

  function scrollBottom() {
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 60);
  }

  function playNext() {
    if (idx.current >= TRANSCRIPT.length) { setState("listening"); return; }
    const m = TRANSCRIPT[idx.current];
    if (m.role === "nene") {
      setState("thinking");
      timer.current = setTimeout(() => {
        setState("speaking");
        setLines(l => [...l, m]); scrollBottom();
        idx.current++;
        timer.current = setTimeout(playNext, 2700);
      }, 950);
    } else {
      setState("listening");
      timer.current = setTimeout(() => {
        setLines(l => [...l, m]); scrollBottom();
        idx.current++;
        timer.current = setTimeout(playNext, 700);
      }, 2000);
    }
  }

  function start() { setActive(true); setLines([]); idx.current = 0; setState("listening"); playNext(); }
  function end()   { clearTimeout(timer.current); setActive(false); setState("idle"); }

  const avatarSize = isMobile ? 120 : 140;
  const pad        = isMobile ? "24px 20px 32px" : "40px 40px 48px";
  const maxW       = isMobile ? "100%" : 680;

  return (
    <div style={{
      flex:1, overflowY:"auto",
      background:`linear-gradient(170deg, ${C.cream} 0%, ${C.sand} 55%, ${C.roseFaint} 100%)`,
    }}>
      <div style={{ maxWidth:maxW, width:"100%", margin:"0 auto", padding:pad, display:"flex", flexDirection:"column", gap:0 }}>

        {/* Top row: avatar + controls */}
        <div style={{
          display:"flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "center" : "flex-start",
          gap: isMobile ? 20 : 28,
          marginBottom:28,
        }}>
          {/* Avatar */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
            <div style={{
              padding:"4px 14px", borderRadius:20,
              background: active ? `${cfg.color}18` : "rgba(255,255,255,0.6)",
              border:`1px solid ${active ? cfg.color+"44" : C.border}`,
              display:"flex", alignItems:"center", gap:6,
            }}>
              {active && <div className="nn-live" style={{ width:5, height:5, borderRadius:"50%", background:cfg.color }}/>}
              <span style={{ fontFamily:SANS, fontSize:9, letterSpacing:2, textTransform:"uppercase", color: active ? cfg.color : C.textLight }}>
                {active ? "Live Session" : "Offline"}
              </span>
            </div>
            <NeneFace state={state} size={avatarSize}/>
          </div>

          {/* Controls */}
          <div style={{ flex:1, width: isMobile ? "100%" : "auto" }}>
            <div style={{ fontFamily:SERIF, fontSize: isMobile ? 18 : 20, fontStyle:"italic", color:C.textMid, marginBottom:14, letterSpacing:.3, textAlign: isMobile ? "center" : "left" }}>
              {cfg.label}
            </div>

            {/* Legend */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 16px", marginBottom:18 }}>
              {[
                { key:"listening", label:"Listening" },
                { key:"thinking",  label:"Thinking"  },
                { key:"speaking",  label:"Speaking"  },
                { key:"idle",      label:"Resting"   },
              ].map(({ key, label }) => (
                <div key={key} style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:STATES[key].color, flexShrink:0 }}/>
                  <span style={{ fontFamily:SANS, fontSize: isMobile ? 12 : 11, color:C.textMid }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={active ? end : start} style={{
                flex:1, height: isMobile ? 52 : 46, borderRadius:12, border:"none", cursor:"pointer",
                background: active ? `linear-gradient(135deg,#C07070,#8E4848)` : `linear-gradient(135deg,${C.green},#4D9070)`,
                color:"white", fontSize: isMobile ? 15 : 13, fontWeight:700, fontFamily:SANS, letterSpacing:.8,
                boxShadow: active ? "0 4px 16px rgba(160,70,70,.25)" : "0 4px 16px rgba(70,150,110,.28)",
                transition:"all .2s",
              }}>
                {active ? "End Session" : "Talk to Nene"}
              </button>
              <button style={{
                flex:1, height: isMobile ? 52 : 46, borderRadius:12, border:"none", cursor:"pointer",
                background:`linear-gradient(135deg,${C.lilac},#7550A8)`,
                color:"white", fontSize: isMobile ? 15 : 13, fontWeight:700, fontFamily:SANS, letterSpacing:.8,
                boxShadow:"0 4px 16px rgba(120,80,180,.25)",
              }}>
                Show Nene
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <div style={{ flex:1, height:1, background:`linear-gradient(to right,transparent,${C.rosePale})` }}/>
          <div style={{ fontFamily:SANS, fontSize:9, letterSpacing:2, textTransform:"uppercase", color:C.textLight, padding:"0 10px" }}>Conversation</div>
          <div style={{ flex:1, height:1, background:`linear-gradient(to left,transparent,${C.rosePale})` }}/>
        </div>

        {/* Chat box */}
        <div style={{
          background:"rgba(255,255,255,0.72)", borderRadius:18,
          border:`1px solid ${C.rosePale}`,
          boxShadow:"0 4px 24px rgba(180,120,150,0.07)",
          overflow:"hidden", minHeight: isMobile ? 260 : 320,
          display:"flex", flexDirection:"column",
        }}>
          <div style={{
            padding:"12px 20px", background:"rgba(255,255,255,0.5)",
            borderBottom:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div style={{ fontFamily:SANS, fontSize:10, letterSpacing:1.5, textTransform:"uppercase", color:C.textLight }}>Live Transcript</div>
            {active && (
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div className="nn-live" style={{ width:5, height:5, borderRadius:"50%", background:cfg.color }}/>
                <span style={{ fontFamily:SANS, fontSize:9, color:cfg.color, letterSpacing:1 }}>Recording</span>
              </div>
            )}
          </div>

          <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:"18px 20px", display:"flex", flexDirection:"column", gap:14 }}>
            {lines.length === 0 ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"28px 0" }}>
                <div style={{ fontFamily:SERIF, fontSize:14, fontStyle:"italic", color:C.textLight, textAlign:"center" }}>
                  {active ? "Starting session\u2026" : "The conversation will appear here once you begin."}
                </div>
              </div>
            ) : lines.map((m, i) => {
              const isNene = m.role === "nene";
              return (
                <div key={i} style={{ display:"flex", justifyContent: isNene ? "flex-start" : "flex-end" }}>
                  <div style={{
                    maxWidth: isMobile ? "88%" : "75%",
                    background: isNene ? `linear-gradient(135deg,${C.lilacPale},${C.roseFaint})` : C.white,
                    border:`1px solid ${isNene ? C.rosePale : C.border}`,
                    borderRadius: isNene ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                    padding:"12px 16px",
                    boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", marginBottom:5, color: isNene ? C.lilac : C.rose }}>
                      {isNene ? "Nene" : "Lola"}
                    </div>
                    <div style={{ fontFamily:SERIF, fontSize: isMobile ? 15 : 14, color:C.text, lineHeight:1.65 }}>
                      {m.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard content ──────────────────────────────────────── */
function DashboardContent({ isMobile }) {
  const aStyle = {
    amber: { dot:C.amber,  bg:C.amberPale, label:"Concern"   },
    green: { dot:C.green,  bg:C.greenPale, label:"Good"      },
    red:   { dot:C.red,    bg:C.redPale,   label:"Emergency" },
  };
  const mIcon  = { taken:"\u2713", pending:"\u2026", missed:"\u2717" };
  const mColor = { taken:C.green, pending:C.amber, missed:C.red };
  const mBg    = { taken:C.greenPale, pending:C.amberPale, missed:C.redPale };

  return (
    <div style={{ flex:1, overflowY:"auto", background:"#F5EFF5" }}>
      {/* Header */}
      <div style={{
        background:C.white, borderBottom:`1px solid ${C.border}`,
        padding: isMobile ? "14px 20px" : "18px 36px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:10,
      }}>
        <div>
          <div style={{ fontFamily:SERIF, fontSize: isMobile ? 18 : 22, color:C.text, letterSpacing:.5 }}>Family Dashboard</div>
          <div style={{ fontFamily:SANS, fontSize: isMobile ? 10 : 11, color:C.textLight, marginTop:3 }}>
            March 16, 2026 &nbsp;&middot;&nbsp; Today&rsquo;s Summary
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div className="nn-live" style={{ width:7, height:7, borderRadius:"50%", background:C.green, boxShadow:`0 0 0 3px ${C.greenPale}` }}/>
          <span style={{ fontFamily:SANS, fontSize: isMobile ? 11 : 12, color:C.green, fontWeight:700 }}>Connected</span>
        </div>
      </div>

      <div style={{ padding: isMobile ? "16px 16px 40px" : "28px 36px 48px", display:"flex", flexDirection:"column", gap:14 }}>

        {/* Row 1 — stacked on mobile, 3-col on laptop */}
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap:14 }}>
          <Card title="Today's Check-in">
            {CHECKIN.map((r,i) => (
              <div key={i} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"8px 0", borderBottom: i < CHECKIN.length-1 ? `1px solid ${C.border}` : "none",
              }}>
                <span style={{ fontFamily:SANS, fontSize: isMobile ? 13 : 12, color:C.textMid }}>{r.label}</span>
                <span style={{ fontFamily:SANS, fontSize: isMobile ? 13 : 12, fontWeight:700, color: r.ok ? C.text : C.red }}>{r.val}</span>
              </div>
            ))}
          </Card>

          <Card title="Medication Today">
            {MEDS.map((m,i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"9px 0", borderBottom: i < MEDS.length-1 ? `1px solid ${C.border}` : "none",
              }}>
                <div style={{
                  width:30, height:30, borderRadius:"50%", flexShrink:0,
                  background:mBg[m.status], display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:14, fontWeight:700, color:mColor[m.status],
                }}>{mIcon[m.status]}</div>
                <div>
                  <div style={{ fontFamily:SANS, fontSize: isMobile ? 14 : 13, fontWeight:700, color:C.text }}>{m.name}</div>
                  <div style={{ fontFamily:SANS, fontSize:10, color:C.textLight, marginTop:1 }}>{m.sub} &middot; {m.note}</div>
                </div>
              </div>
            ))}
          </Card>

          <Card title="Quick Stats">
            {[
              { label:"Last check-in",  val:"10:28 AM"          },
              { label:"Session length", val:"6 min"             },
              { label:"Alerts today",   val:"2 concerns"        },
              { label:"Next reminder",  val:"Metformin (lunch)" },
            ].map((s,i,arr) => (
              <div key={i} style={{
                display:"flex", justifyContent:"space-between",
                padding:"8px 0", borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none",
              }}>
                <span style={{ fontFamily:SANS, fontSize: isMobile ? 13 : 12, color:C.textMid }}>{s.label}</span>
                <span style={{ fontFamily:SANS, fontSize: isMobile ? 13 : 12, fontWeight:700, color:C.text }}>{s.val}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Row 2 — stacked on mobile, 2-col on laptop */}
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.6fr", gap:14 }}>
          <Card title="Alerts">
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {ALERTS.map((a,i) => {
                const s = aStyle[a.sev];
                return (
                  <div key={i} style={{
                    display:"flex", gap:12, padding:"12px 14px", borderRadius:10,
                    background:s.bg, border:`1px solid ${s.dot}33`,
                  }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:s.dot, marginTop:5, flexShrink:0 }}/>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <Badge label={s.label} color={s.dot}/>
                        <span style={{ fontFamily:SANS, fontSize:10, color:C.textLight }}>{a.time}</span>
                      </div>
                      <div style={{ fontFamily:SANS, fontSize: isMobile ? 13 : 12, color:C.text, lineHeight:1.5 }}>{a.msg}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Conversation Log">
            <div style={{ display:"flex", flexDirection:"column", gap:14, maxHeight: isMobile ? "none" : 300, overflowY: isMobile ? "visible" : "auto", paddingRight:4 }}>
              {TRANSCRIPT.map((m,i) => {
                const isNene = m.role === "nene";
                return (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{
                      width:28, height:28, borderRadius:"50%", flexShrink:0, marginTop:2,
                      background: isNene ? C.lilacPale : C.roseFaint,
                      border:`1px solid ${C.rosePale}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:SANS, fontSize:9, fontWeight:700,
                      color: isNene ? C.lilac : C.rose,
                    }}>
                      {isNene ? "N" : "L"}
                    </div>
                    <div>
                      <span style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", color: isNene ? C.lilac : C.rose }}>
                        {isNene ? "Nene" : "Lola"}
                      </span>
                      <div style={{ fontFamily:SERIF, fontSize: isMobile ? 14 : 13, color:C.text, lineHeight:1.65, marginTop:2 }}>
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─── Root ───────────────────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState("elder");
  const width   = useWidth();
  const isMobile = width < 768;

  return (
    <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row", height:"100vh", overflow:"hidden" }}>
      <style>{STYLES}</style>

      {/* Mobile: top bar only. Laptop: full sidebar */}
      {isMobile
        ? <MobileTopBar view={view}/>
        : <Sidebar view={view} onSwitch={setView}/>
      }

      {/* Main content */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {view === "elder"
          ? <ElderContent isMobile={isMobile}/>
          : <DashboardContent isMobile={isMobile}/>
        }
      </div>

      {/* Mobile: bottom tab bar */}
      {isMobile && <MobileTabBar view={view} onSwitch={setView}/>}
    </div>
  );
}

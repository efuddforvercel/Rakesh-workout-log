import { useState, useEffect } from "react";

const INITIAL_CATEGORIES = {
  "Upper Body": [
    "Arnold Press", "Barbell Row", "Bench Press", "Cable Fly", "Chest Dip",
    "Dumbbell Curl", "Dumbbell Fly", "Face Pull", "Incline Bench", "Lat Pulldown",
    "Overhead Press", "Pull-Up", "Rear Delt Fly", "Shrug", "Tricep Dip",
    "Tricep Pushdown", "Upright Row"
  ].sort(),
  "Core": [
    "Ab Wheel", "Bicycle Crunch", "Cable Crunch", "Dead Bug", "Hanging Leg Raise",
    "Hollow Hold", "Oblique Crunch", "Pallof Press", "Plank", "Russian Twist",
    "Side Plank", "Toe Touch", "V-Up"
  ].sort(),
  "Lower Body": [
    "Bulgarian Split Squat", "Calf Raise", "Deadlift", "Glute Bridge", "Good Morning",
    "Hack Squat", "Hip Thrust", "Leg Curl", "Leg Extension", "Leg Press",
    "Lunge", "Romanian Deadlift", "Squat", "Step-Up", "Sumo Deadlift"
  ].sort(),
  "Aerobic": [
    "Cycling", "Elliptical", "HIIT Sprint", "Jump Rope", "Rowing",
    "Running", "Stair Climber", "Swimming", "Treadmill"
  ].sort(),
};

const CATEGORY_COLORS = {
  "Upper Body": { tag: "#2d6a2d", tagBg: "#dff0df", tagBorder: "#a8d0a8" },
  "Core":       { tag: "#b56a00", tagBg: "#fdf0dc", tagBorder: "#e0b870" },
  "Lower Body": { tag: "#a01060", tagBg: "#fce8f3", tagBorder: "#e0a0cc" },
  "Aerobic":    { tag: "#0070a0", tagBg: "#dff0fa", tagBorder: "#90cce8" },
};

const CATEGORY_ORDER = ["Upper Body", "Core", "Lower Body", "Aerobic"];

const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const today = () => new Date().toISOString().split("T")[0];

const SAMPLE_HISTORY = [
  {
    id: 1, date: "2026-03-10", name: "Push Day",
    exercises: [
      { name: "Bench Press", category: "Upper Body", sets: [{ reps: 8, weight: 185 }, { reps: 8, weight: 195 }, { reps: 6, weight: 205 }] },
      { name: "Overhead Press", category: "Upper Body", sets: [{ reps: 8, weight: 115 }, { reps: 7, weight: 115 }, { reps: 6, weight: 120 }] },
    ]
  },
  {
    id: 2, date: "2026-03-12", name: "Pull Day",
    exercises: [
      { name: "Barbell Row", category: "Upper Body", sets: [{ reps: 8, weight: 155 }, { reps: 8, weight: 165 }, { reps: 8, weight: 165 }] },
      { name: "Deadlift", category: "Lower Body", sets: [{ reps: 5, weight: 275 }, { reps: 5, weight: 295 }, { reps: 3, weight: 315 }] },
    ]
  },
  {
    id: 3, date: "2026-03-14", name: "Cardio",
    exercises: [
      { name: "Running", category: "Aerobic", duration: 30, distance: 3.2, unit: "mi" },
    ]
  },
  {
    id: 4, date: "2026-03-16", name: "Leg Day",
    exercises: [
      { name: "Hip Thrust", category: "Lower Body", sets: [{ reps: 10, weight: 185 }, { reps: 10, weight: 205 }, { reps: 8, weight: 225 }] },
      { name: "Leg Press", category: "Lower Body", sets: [{ reps: 10, weight: 360 }, { reps: 10, weight: 380 }, { reps: 8, weight: 400 }] },
      { name: "Squat", category: "Lower Body", sets: [{ reps: 5, weight: 225 }, { reps: 5, weight: 245 }, { reps: 3, weight: 265 }] },
    ]
  },
];

function CategoryTag({ category }) {
  const c = CATEGORY_COLORS[category];
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 1, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
      background: c.tagBg, color: c.tag, border: `1px solid ${c.tagBorder}` }}>
      {category}
    </span>
  );
}

function sortExercises(exercises) {
  return [...exercises].sort((a, b) => {
    const ci = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (ci !== 0) return ci;
    return a.name.localeCompare(b.name);
  });
}

function groupByCategory(exercises) {
  const groups = {};
  for (const cat of CATEGORY_ORDER) {
    const exs = exercises.filter(e => e.category === cat);
    if (exs.length > 0) groups[cat] = exs;
  }
  return groups;
}

export default function WorkoutTracker() {
  const [view, setView] = useState("dashboard");

  const [categories, setCategories] = useState(() => {
    try { const s = localStorage.getItem("ironlog_categories"); return s ? JSON.parse(s) : INITIAL_CATEGORIES; } catch { return INITIAL_CATEGORIES; }
  });
  const [history, setHistory] = useState(() => {
    try { const s = localStorage.getItem("ironlog_history"); return s ? JSON.parse(s) : SAMPLE_HISTORY; } catch { return SAMPLE_HISTORY; }
  });

  useEffect(() => { try { localStorage.setItem("ironlog_categories", JSON.stringify(categories)); } catch {} }, [categories]);
  useEffect(() => { try { localStorage.setItem("ironlog_history", JSON.stringify(history)); } catch {} }, [history]);

  const exportToCSV = () => {
    const rows = [["Date", "Workout", "Category", "Exercise", "Type", "Set", "Reps", "Weight (lbs)", "Duration (min)", "Distance", "Unit"]];
    [...history].sort((a, b) => a.date.localeCompare(b.date)).forEach(w => {
      w.exercises.forEach(ex => {
        if (ex.sets) {
          ex.sets.forEach((s, i) => {
            rows.push([w.date, w.name, ex.category, ex.name, "Strength", i + 1, s.reps, s.weight, "", "", ""]);
          });
        } else {
          rows.push([w.date, w.name, ex.category, ex.name, "Aerobic", "", "", "", ex.duration, ex.distance, ex.unit]);
        }
      });
    });
    const csv = rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ironlog_workouts.csv"; a.click();
    URL.revokeObjectURL(url);
  };
  const [workout, setWorkout] = useState({ name: "", date: today(), exercises: [] });
  const [showExLib, setShowExLib] = useState(false);
  const [libTab, setLibTab] = useState("Upper Body");
  const [customName, setCustomName] = useState("");
  const [customCat, setCustomCat] = useState("Upper Body");
  const [customType, setCustomType] = useState("strength");
  const [libMode, setLibMode] = useState("library");
  const [progressEx, setProgressEx] = useState("Bench Press");
  const [progressCat, setProgressCat] = useState("Upper Body");
  // Library management
  const [libMgmtTab, setLibMgmtTab] = useState("Upper Body");
  const [newExName, setNewExName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);



  const isAerobic = (name) => categories["Aerobic"]?.includes(name);

  const addToLibrary = () => {
    const name = newExName.trim();
    if (!name) return;
    if (Object.values(categories).flat().some(n => n.toLowerCase() === name.toLowerCase())) return;
    setCategories(prev => ({
      ...prev,
      [libMgmtTab]: [...prev[libMgmtTab], name].sort()
    }));
    setNewExName("");
  };

  const deleteFromLibrary = (cat, name) => {
    setCategories(prev => ({
      ...prev,
      [cat]: prev[cat].filter(n => n !== name)
    }));
    setConfirmDelete(null);
  };

  const saveWorkout = () => {
    if (!workout.name || workout.exercises.length === 0) return;
    setHistory(h => [{ ...workout, id: Date.now(), exercises: sortExercises(workout.exercises) }, ...h]);
    setWorkout({ name: "", date: today(), exercises: [] });
    setView("history");
  };

  const addCustomExercise = () => {
    const name = customName.trim();
    if (!name) return;
    const alreadyAdded = workout.exercises.some(e => e.name.toLowerCase() === name.toLowerCase());
    if (alreadyAdded) return;
    const aerobic = customType === "aerobic";
    const ex = aerobic
      ? { name, category: customCat, duration: "", distance: "", unit: "mi" }
      : { name, category: customCat, sets: [{ reps: "", weight: "" }] };
    setWorkout(w => ({ ...w, exercises: sortExercises([...w.exercises, ex]) }));
    setCustomName("");
    setShowExLib(false);
  };

  const addExercise = (name, category) => {
    const ex = isAerobic(name)
      ? { name, category, duration: "", distance: "", unit: "mi" }
      : { name, category, sets: [{ reps: "", weight: "" }] };
    setWorkout(w => ({ ...w, exercises: sortExercises([...w.exercises, ex]) }));
    setShowExLib(false);
  };

  const updateSet = (ei, si, field, val) => {
    setWorkout(w => {
      const exs = [...w.exercises];
      exs[ei] = { ...exs[ei], sets: exs[ei].sets.map((s, i) => i === si ? { ...s, [field]: val } : s) };
      return { ...w, exercises: exs };
    });
  };

  const addSet = (ei) => {
    setWorkout(w => {
      const exs = [...w.exercises];
      const last = exs[ei].sets.at(-1);
      exs[ei] = { ...exs[ei], sets: [...exs[ei].sets, { ...last }] };
      return { ...w, exercises: exs };
    });
  };

  const updateCardio = (ei, field, val) => {
    setWorkout(w => {
      const exs = [...w.exercises];
      exs[ei] = { ...exs[ei], [field]: val };
      return { ...w, exercises: exs };
    });
  };

  const removeExercise = (ei) => {
    setWorkout(w => ({ ...w, exercises: w.exercises.filter((_, i) => i !== ei) }));
  };

  const allStrengthLogs = history.flatMap(w => w.exercises.filter(e => !isAerobic(e.name)));
  const uniqueStrengthExs = [...new Set(allStrengthLogs.map(e => e.name))];
  const thisWeek = history.filter(w => {
    const d = new Date(w.date), now = new Date();
    const sow = new Date(now); sow.setDate(now.getDate() - now.getDay());
    return d >= sow;
  }).length;
  const recentWorkouts = [...history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const pbsByCategory = CATEGORY_ORDER.filter(c => c !== "Aerobic").map(cat => ({
    cat,
    pbs: (categories[cat] || []).filter(name => uniqueStrengthExs.includes(name)).map(name => ({
      name,
      best: Math.max(...history.flatMap(w => w.exercises.filter(e => e.name === name).flatMap(e => e.sets?.map(s => Number(s.weight) || 0) || [0])))
    }))
  })).filter(g => g.pbs.length > 0);

  const filteredStrength = categories[progressCat] || [];
  const progressData = history
    .filter(w => w.exercises.some(e => e.name === progressEx))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(w => {
      const ex = w.exercises.find(e => e.name === progressEx);
      const val = ex.sets ? Math.max(...ex.sets.map(s => Number(s.weight) || 0)) : Number(ex.distance) || 0;
      return { date: w.date, value: val };
    });
  const maxVal = Math.max(...progressData.map(d => d.value), 1);
  const cc = CATEGORY_COLORS[progressCat];

  return (
    <div style={{ fontFamily: "'DM Mono','Courier New',monospace", background: "#f5f0e8", minHeight: "100vh", color: "#1a1714" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#e8e2d9}::-webkit-scrollbar-thumb{background:#2d6a2d;border-radius:2px}
        .nav-btn{background:none;border:none;cursor:pointer;font-family:inherit;font-size:11px;letter-spacing:.15em;text-transform:uppercase;padding:10px 18px;color:#7a6f63;transition:all .2s;border-bottom:2px solid transparent}
        .nav-btn.active{color:#2d6a2d;border-bottom:2px solid #2d6a2d}.nav-btn:hover{color:#2d6a2d}
        nav::-webkit-scrollbar{display:none}nav{-ms-overflow-style:none;scrollbar-width:none}
        .card{background:#ede8df;border:1px solid #d8d0c4;border-radius:2px;padding:20px}
        .accent-btn{background:#2d6a2d;color:#f5f0e8;border:none;cursor:pointer;font-family:inherit;font-size:11px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;padding:10px 20px;border-radius:2px;transition:all .15s}
        .accent-btn:hover{background:#3a8a3a;transform:translateY(-1px)}
        .ghost-btn{background:none;border:1px solid #c0b8ae;cursor:pointer;font-family:inherit;font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:8px 16px;border-radius:2px;color:#7a6f63;transition:all .15s}
        .ghost-btn:hover{border-color:#2d6a2d;color:#2d6a2d}
        .input{background:#faf7f2;border:1px solid #c0b8ae;border-radius:2px;color:#1a1714;font-family:inherit;font-size:13px;padding:8px 12px;width:100%;outline:none;transition:border .15s}
        .input:focus{border-color:#2d6a2d}
        .ex-lib-item{padding:9px 12px;cursor:pointer;border-radius:2px;font-size:12px;transition:all .12s;color:#7a6f63}
        .ex-lib-item:hover{background:#d8d0c4;color:#1a1714}
        .remove-btn{background:none;border:none;cursor:pointer;color:#a09080;font-size:18px;transition:color .15s;padding:0 4px}
        .remove-btn:hover{color:#ff4444}
        select.input option{background:#faf7f2}
      `}</style>

      {/* Header */}
      <div style={{ background: "#e8e2d8", borderBottom: "1px solid #d0c8bc", padding: "0 16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ padding: "12px 0 4px", fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: ".06em", color: "#2d6a2d" }}>
            Rakesh's Workout Log
          </div>
          <nav style={{ display: "flex", overflowX: "auto", gap: 0, WebkitOverflowScrolling: "touch" }}>
            {["dashboard","log","history","progress","library"].map(v => (
              <button key={v} className={`nav-btn${view===v?" active":""}`} onClick={() => setView(v)}
                style={{ whiteSpace: "nowrap", padding: "8px 14px" }}>{v}</button>
            ))}
          </nav>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: ".05em" }}>YOUR STATS</div>
              <div style={{ color: "#9a8f83", fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", marginTop: 2 }}>Overview · All Time</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
              {[
                { label: "Total Workouts", value: history.length, color: "#2d6a2d" },
                { label: "This Week", value: thisWeek, color: "#1a1714" },
                { label: "Exercises Tracked", value: uniqueStrengthExs.length, color: "#1a1714" },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: "16px 20px" }}>
                  <div style={{ color: "#9a8f83", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 44, color: s.color, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="card">
                <div style={{ color: "#9a8f83", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 16 }}>Recent Workouts</div>
                {recentWorkouts.map(w => (
                  <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #d0c8bc" }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#1a1714", marginBottom: 3 }}>{w.name}</div>
                      <div style={{ fontSize: 11, color: "#9a8f83" }}>{w.exercises.length} exercise{w.exercises.length !== 1 ? "s" : ""}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#7a6f63" }}>{formatDate(w.date)}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ overflowY: "auto", maxHeight: 340 }}>
                <div style={{ color: "#9a8f83", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 }}>Personal Bests</div>
                {pbsByCategory.map(({ cat, pbs }) => (
                  <div key={cat}>
                    <div style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: CATEGORY_COLORS[cat].tag, margin: "12px 0 6px", paddingBottom: 4, borderBottom: `1px solid ${CATEGORY_COLORS[cat].tagBorder}` }}>{cat}</div>
                    {pbs.map(({ name, best }) => (
                      <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #d8d0c8" }}>
                        <div style={{ fontSize: 12, color: "#2a2420" }}>{name}</div>
                        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: CATEGORY_COLORS[cat].tag }}>
                          {best} <span style={{ fontSize: 10, color: "#7a6f63" }}>lbs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <button className="accent-btn" style={{ padding: "14px 36px", fontSize: 12 }} onClick={() => setView("log")}>+ LOG NEW WORKOUT</button>
            </div>
          </div>
        )}

        {/* LOG */}
        {view === "log" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: ".05em" }}>LOG WORKOUT</div>
            </div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
                <input className="input" placeholder="Workout name (e.g. Push Day)" value={workout.name}
                  onChange={e => setWorkout(w => ({ ...w, name: e.target.value }))} />
                <input className="input" type="date" value={workout.date} style={{ width: 150 }}
                  onChange={e => setWorkout(w => ({ ...w, date: e.target.value }))} />
              </div>
            </div>

            {(() => {
              const groups = groupByCategory(workout.exercises);
              return CATEGORY_ORDER.map(cat => {
                if (!groups[cat]) return null;
                const col = CATEGORY_COLORS[cat];
                return (
                  <div key={cat}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 10px" }}>
                      <span style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: col.tag }}>{cat}</span>
                      <div style={{ flex: 1, height: 1, background: col.tagBorder }} />
                    </div>
                    {groups[cat].map(ex => {
                      const ei = workout.exercises.indexOf(ex);
                      return (
                        <div key={ex.name} className="card" style={{ marginBottom: 10, borderLeft: `2px solid ${col.tagBorder}` }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                            <span style={{ fontSize: 14, color: "#1a1714", fontWeight: 500 }}>{ex.name}</span>
                            <button className="remove-btn" onClick={() => removeExercise(ei)}>×</button>
                          </div>
                          {ex.sets != null ? (
                            <div>
                              <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 1fr auto", gap: 8, marginBottom: 8, color: "#9a8f83", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase" }}>
                                <span>Set</span><span>Reps</span><span>Weight (lbs)</span><span />
                              </div>
                              {ex.sets.map((s, si) => (
                                <div key={si} style={{ display: "grid", gridTemplateColumns: "36px 1fr 1fr auto", gap: 8, marginBottom: 6, alignItems: "center" }}>
                                  <span style={{ color: "#7a6f63", fontSize: 12 }}>{si + 1}</span>
                                  <input className="input" type="number" placeholder="8" value={s.reps} onChange={e => updateSet(ei, si, "reps", e.target.value)} />
                                  <input className="input" type="number" placeholder="135" value={s.weight} onChange={e => updateSet(ei, si, "weight", e.target.value)} />
                                  <button className="remove-btn" style={{ fontSize: 14 }} onClick={() => {
                                    setWorkout(w => { const exs=[...w.exercises]; exs[ei]={...exs[ei],sets:exs[ei].sets.filter((_,i)=>i!==si)}; return {...w,exercises:exs}; });
                                  }}>×</button>
                                </div>
                              ))}
                              <button className="ghost-btn" style={{ marginTop: 8, fontSize: 10 }} onClick={() => addSet(ei)}>+ Add Set</button>
                            </div>
                          ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10 }}>
                              <div>
                                <div style={{ color: "#9a8f83", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>Duration (min)</div>
                                <input className="input" type="number" placeholder="30" value={ex.duration} onChange={e => updateCardio(ei, "duration", e.target.value)} />
                              </div>
                              <div>
                                <div style={{ color: "#9a8f83", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>Distance</div>
                                <input className="input" type="number" placeholder="3.1" value={ex.distance} onChange={e => updateCardio(ei, "distance", e.target.value)} />
                              </div>
                              <div>
                                <div style={{ color: "#9a8f83", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>Unit</div>
                                <select className="input" value={ex.unit} onChange={e => updateCardio(ei, "unit", e.target.value)}>
                                  <option>mi</option><option>km</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}

            <div style={{ display: "flex", gap: 10, marginTop: 16, marginBottom: 20 }}>
              <button className="ghost-btn" onClick={() => setShowExLib(!showExLib)}>+ Add Exercise</button>
            </div>

            {showExLib && (
              <div className="card" style={{ marginBottom: 20 }}>
                {/* Mode toggle */}
                <div style={{ display: "flex", gap: 0, marginBottom: 18, borderBottom: "1px solid #d0c8bc" }}>
                  {[["library", "From Library"], ["custom", "Custom Exercise"]].map(([mode, label]) => (
                    <button key={mode} onClick={() => setLibMode(mode)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                        fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", padding: "0 0 12px 0", marginRight: 24,
                        color: libMode === mode ? "#2d6a2d" : "#9a8f83",
                        borderBottom: libMode === mode ? "2px solid #2d6a2d" : "2px solid transparent",
                        transition: "all .15s" }}>
                      {label}
                    </button>
                  ))}
                </div>

                {libMode === "library" ? (
                  <>
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                      {CATEGORY_ORDER.map(cat => {
                        const col = CATEGORY_COLORS[cat];
                        const active = libTab === cat;
                        return (
                          <button key={cat} onClick={() => setLibTab(cat)}
                            style={{ padding: "7px 14px", borderRadius: 2, border: "1px solid", fontSize: 10, letterSpacing: ".08em", cursor: "pointer", fontFamily: "inherit",
                              background: active ? col.tag : "transparent", color: active ? "#f5f0e8" : col.tag, borderColor: active ? col.tag : col.tagBorder }}>
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                      {(categories[libTab] || []).map(name => {
                        const added = workout.exercises.some(e => e.name === name);
                        return (
                          <div key={name} className="ex-lib-item" onClick={() => !added && addExercise(name, libTab)}
                            style={{ opacity: added ? 0.35 : 1, cursor: added ? "default" : "pointer" }}>
                            {name}{added && <span style={{ fontSize: 10, color: "#7a6f63" }}> · added</span>}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <div style={{ color: "#9a8f83", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 6 }}>Exercise Name</div>
                      <input className="input" placeholder="e.g. Farmers Carry, Sled Push…" value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addCustomExercise()} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <div style={{ color: "#9a8f83", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 6 }}>Category</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {CATEGORY_ORDER.map(cat => {
                            const col = CATEGORY_COLORS[cat];
                            const active = customCat === cat;
                            return (
                              <button key={cat} onClick={() => { setCustomCat(cat); if (cat === "Aerobic") setCustomType("aerobic"); else setCustomType("strength"); }}
                                style={{ padding: "8px 12px", borderRadius: 2, border: "1px solid", fontSize: 11, letterSpacing: ".06em", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                                  background: active ? col.tagBg : "transparent", color: active ? col.tag : "#7a6f63", borderColor: active ? col.tag : "#c0b8ae" }}>
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: "#9a8f83", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 6 }}>Type</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {[["strength", "Strength (sets & reps)"], ["aerobic", "Aerobic (time & distance)"]].map(([t, label]) => (
                            <button key={t} onClick={() => setCustomType(t)}
                              disabled={customCat === "Aerobic"}
                              style={{ padding: "8px 12px", borderRadius: 2, border: "1px solid", fontSize: 11, letterSpacing: ".06em", cursor: customCat === "Aerobic" ? "default" : "pointer",
                                fontFamily: "inherit", textAlign: "left", opacity: customCat === "Aerobic" && t === "strength" ? 0.3 : 1,
                                background: customType === t ? "#d8d0c4" : "transparent",
                                color: customType === t ? "#1a1714" : "#7a6f63",
                                borderColor: customType === t ? "#a09080" : "#c0b8ae" }}>
                              {label}
                            </button>
                          ))}
                        </div>
                        <div style={{ marginTop: 20 }}>
                          <button className="accent-btn" style={{ width: "100%", opacity: customName.trim() ? 1 : 0.4 }}
                            onClick={addCustomExercise} disabled={!customName.trim()}>
                            Add to Workout
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button className="accent-btn" style={{ padding: "14px 32px", fontSize: 12, opacity: (!workout.name || workout.exercises.length === 0) ? 0.4 : 1 }}
              onClick={saveWorkout} disabled={!workout.name || workout.exercises.length === 0}>
              SAVE WORKOUT
            </button>
          </div>
        )}

        {/* HISTORY */}
        {view === "history" && (
          <div>
            <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: ".05em" }}>WORKOUT HISTORY</div>
                <div style={{ color: "#9a8f83", fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", marginTop: 2 }}>{history.length} sessions logged</div>
              </div>
              <button className="ghost-btn" onClick={exportToCSV} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                ↓ Export to CSV
              </button>
            </div>
            {[...history].sort((a,b) => b.date.localeCompare(a.date)).map(w => {
              const groups = groupByCategory(w.exercises);
              return (
                <div key={w.id} className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 15, color: "#1a1714", fontWeight: 500, marginBottom: 4 }}>{w.name}</div>
                      <div style={{ color: "#7a6f63", fontSize: 11 }}>{formatDate(w.date)}</div>
                    </div>
                    <div style={{ color: "#9a8f83", fontSize: 11 }}>{w.exercises.length} exercise{w.exercises.length !== 1 ? "s" : ""}</div>
                  </div>
                  {CATEGORY_ORDER.map(cat => {
                    if (!groups[cat]) return null;
                    const col = CATEGORY_COLORS[cat];
                    return (
                      <div key={cat} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: col.tag, marginBottom: 6 }}>{cat}</div>
                        {groups[cat].map((ex, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", background: "#e8e2d8", borderRadius: 2, marginBottom: 4, borderLeft: `2px solid ${col.tagBorder}` }}>
                            <span style={{ fontSize: 12, color: "#2a2420" }}>{ex.name}</span>
                            <span style={{ color: "#7a6f63", fontSize: 11 }}>
                              {ex.sets
                                ? `${ex.sets.length} sets · ${Math.max(...ex.sets.map(s=>Number(s.weight)||0))} lbs max`
                                : `${ex.duration} min · ${ex.distance} ${ex.unit}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* PROGRESS */}
        {view === "progress" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: ".05em" }}>PROGRESS</div>
              <div style={{ color: "#9a8f83", fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", marginTop: 2 }}>Max weight over time</div>
            </div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ color: "#9a8f83", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 14 }}>Select Exercise</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                {CATEGORY_ORDER.filter(c => c !== "Aerobic").map(cat => {
                  const col = CATEGORY_COLORS[cat];
                  const active = progressCat === cat;
                  return (
                    <button key={cat} onClick={() => { setProgressCat(cat); setProgressEx((categories[cat] || [])[0]); }}
                      style={{ padding: "7px 14px", borderRadius: 2, border: "1px solid", fontSize: 10, letterSpacing: ".08em", cursor: "pointer", fontFamily: "inherit",
                        background: active ? col.tag : "transparent", color: active ? "#f5f0e8" : col.tag, borderColor: active ? col.tag : col.tagBorder }}>
                      {cat}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {filteredStrength.map(name => (
                  <button key={name} onClick={() => setProgressEx(name)}
                    style={{ padding: "6px 12px", borderRadius: 2, border: "1px solid", fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                      background: progressEx === name ? cc.tag : "transparent",
                      color: progressEx === name ? "#f5f0e8" : "#9a8f83",
                      borderColor: progressEx === name ? cc.tag : "#c0b8ae" }}>
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {progressData.length > 0 ? (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: "#1a1714", letterSpacing: ".05em", marginBottom: 6 }}>{progressEx}</div>
                    <CategoryTag category={progressCat} />
                  </div>
                  {progressData.length > 1 && (
                    <div style={{ color: cc.tag, fontSize: 13 }}>+{progressData.at(-1).value - progressData[0].value} lbs since first log</div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160 }}>
                  {progressData.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                        <div style={{ width: "100%", background: cc.tag, borderRadius: "2px 2px 0 0",
                          height: `${Math.max(6, (d.value / maxVal) * 100)}%`, transition: "all .3s" }} />
                      </div>
                      <div style={{ color: "#7a6f63", fontSize: 9, textAlign: "center", whiteSpace: "nowrap" }}>
                        {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div style={{ color: cc.tag, fontSize: 11, fontWeight: 500 }}>{d.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Sessions", value: progressData.length },
                    { label: "Peak Weight", value: `${Math.max(...progressData.map(d=>d.value))} lbs` },
                    { label: "Starting Weight", value: `${progressData[0]?.value} lbs` },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#e8e2d8", padding: "12px 14px", borderRadius: 2 }}>
                      <div style={{ color: "#9a8f83", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: "#1a1714" }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign: "center", padding: 40, color: "#9a8f83" }}>
                No data logged yet for {progressEx}. Add it to a workout to see progress here.
              </div>
            )}
          </div>
        )}
        {/* LIBRARY */}
        {view === "library" && (() => {
          const col = CATEGORY_COLORS[libMgmtTab];
          const exList = categories[libMgmtTab] || [];
          const trimmed = newExName.trim();
          const duplicate = trimmed ? Object.values(categories).flat().some(n => n.toLowerCase() === trimmed.toLowerCase()) : false;
          return (
            <div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: ".05em" }}>EXERCISE LIBRARY</div>
                <div style={{ color: "#9a8f83", fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", marginTop: 2 }}>
                  {Object.values(categories).flat().length} exercises across {CATEGORY_ORDER.length} categories
                </div>
              </div>

              {/* Category tabs */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {CATEGORY_ORDER.map(cat => {
                  const c = CATEGORY_COLORS[cat];
                  const active = libMgmtTab === cat;
                  return (
                    <button key={cat} onClick={() => { setLibMgmtTab(cat); setNewExName(""); setConfirmDelete(null); }}
                      style={{ padding: "8px 16px", borderRadius: 2, border: "1px solid", fontSize: 11, letterSpacing: ".08em",
                        cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                        background: active ? c.tag : "transparent",
                        color: active ? "#f5f0e8" : c.tag,
                        borderColor: active ? c.tag : c.tagBorder }}>
                      {cat} <span style={{ opacity: 0.65, fontSize: 10 }}>({(categories[cat] || []).length})</span>
                    </button>
                  );
                })}
              </div>

              {/* Add new exercise — full width, always on top */}
              <div className="card" style={{ marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ color: col.tag, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 6 }}>
                    Add to {libMgmtTab}
                  </div>
                  <input className="input" placeholder="e.g. Farmers Carry…" value={newExName}
                    onChange={e => setNewExName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addToLibrary()} />
                  {duplicate && <div style={{ fontSize: 11, color: "#f5a742", marginTop: 6 }}>Already exists in library.</div>}
                </div>
                <button className="accent-btn"
                  style={{ flexShrink: 0, padding: "10px 24px", opacity: (trimmed && !duplicate) ? 1 : 0.35 }}
                  onClick={addToLibrary} disabled={!trimmed || duplicate}>
                  + Add
                </button>
              </div>

              {/* Exercise list — full width, scrollable */}
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "13px 18px", borderBottom: "1px solid #d0c8bc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: col.tag }}>{libMgmtTab}</span>
                  <span style={{ fontSize: 11, color: "#9a8f83" }}>{exList.length} exercise{exList.length !== 1 ? "s" : ""}</span>
                </div>
                {exList.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center", color: "#9a8f83", fontSize: 13 }}>
                    No exercises yet — add one above.
                  </div>
                ) : (
                  exList.map(name => (
                    <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "11px 18px", borderBottom: "1px solid #d8d0c8",
                      background: confirmDelete === name ? "#1a0f0f" : "transparent" }}>
                      <span style={{ fontSize: 13, color: "#2a2420" }}>{name}</span>
                      {confirmDelete === name ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, color: "#cc2222" }}>Remove?</span>
                          <button onClick={() => deleteFromLibrary(libMgmtTab, name)}
                            style={{ background: "#cc2222", color: "#fff", border: "none", cursor: "pointer",
                              fontFamily: "inherit", fontSize: 10, letterSpacing: ".1em", padding: "5px 10px", borderRadius: 2 }}>
                            Yes
                          </button>
                          <button onClick={() => setConfirmDelete(null)} className="ghost-btn" style={{ padding: "5px 10px", fontSize: 10 }}>
                            No
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(name)} className="ghost-btn"
                          style={{ padding: "4px 12px", fontSize: 10, color: "#c05050", borderColor: "#e0c8c8" }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#cc2222"; e.currentTarget.style.borderColor = "#ff4444"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "#c05050"; e.currentTarget.style.borderColor = "#e0c8c8"; }}>
                          Delete
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}

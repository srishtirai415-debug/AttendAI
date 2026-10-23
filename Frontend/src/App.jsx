
import { useState } from "react";
import {
  Activity, ArrowUpRight, Bell, BookOpen, BrainCircuit,
  CalendarDays, Check, ChevronDown, CircleHelp, Clock3,
  Download, Fingerprint, LayoutDashboard, LogOut, Menu,
  Moon, Plus, Search, Settings, ShieldCheck, Sparkles,
  Sun, Users, X,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { api } from "./services/api";
import "./App.css";

const initialStudents = [
  { id: "AI001", name: "Aarav Sharma", course: "Computer Science", time: "09:02 AM", status: "Present" },
  { id: "AI002", name: "Ananya Verma", course: "Computer Science", time: "09:04 AM", status: "Present" },
  { id: "AI003", name: "Rohan Singh", course: "Information Technology", time: "—", status: "Absent" },
  { id: "AI004", name: "Priya Gupta", course: "Computer Science", time: "09:08 AM", status: "Present" },
  { id: "AI005", name: "Kabir Mishra", course: "Information Technology", time: "09:11 AM", status: "Late" },
  { id: "AI006", name: "Meera Patel", course: "Computer Science", time: "—", status: "Absent" },
];

const weeklyData = [
  { day: "Mon", rate: 84 },
  { day: "Tue", rate: 91 },
  { day: "Wed", rate: 87 },
  { day: "Thu", rate: 95 },
  { day: "Fri", rate: 89 },
  { day: "Sat", rate: 97 },
  { day: "Sun", rate: 93 },
];

function AuthPage({ mode, onModeChange, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const result = mode === "login"
        ? await api.login({ email, password })
        : await api.register({ name, email, password });

      if (result?.token) {
        localStorage.setItem("attendai_token", result.token);
      }

      onLogin(result?.user || { name: name || email.split("@")[0], email });
    } catch (err) {
      setError(
        "Unable to connect to the authentication API. Check your backend URL and route names."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-orb orb-one" />
      <div className="auth-orb orb-two" />

      <section className="auth-brand">
        <div className="brand-mark"><Fingerprint size={27} /></div>
        <span>Attend<span className="brand-accent">AI</span></span>
        <span className="brand-pill">INTELLIGENCE, IN EVERY PRESENCE</span>
      </section>

      <section className="auth-card">
        <div className="eyebrow"><Sparkles size={15} /> SMART CAMPUS PLATFORM</div>
        <h1>{mode === "login" ? "Welcome back." : "Create your space."}</h1>
        <p className="muted">
          {mode === "login"
            ? "Your classroom insights are waiting."
            : "Start making attendance smarter."}
        </p>

        <form onSubmit={submit}>
          {mode === "register" && (
            <label>Full name
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Your full name" required />
            </label>
          )}
          <label>Email address
            <input type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@college.edu" required />
          </label>
          <label>Password
            <input type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password" minLength={6} required />
          </label>

          {error && <p className="error-message">{error}</p>}

          <button className="primary-button full-button" disabled={busy}>
            {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            <ArrowUpRight size={17} />
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? "New to AttendAI?" : "Already have an account?"}
          <button className="text-button"
            onClick={() => onModeChange(mode === "login" ? "register" : "login")}>
            {mode === "login" ? " Create account" : " Sign in"}
          </button>
        </p>
        <div className="secure-note"><ShieldCheck size={15} /> Secure campus access</div>
      </section>
      <p className="auth-footer">ATTENDAI © 2026 · BUILT FOR SMARTER CAMPUSES</p>
    </main>
  );
}

function Sidebar({ page, setPage, onLogout, mobileOpen, setMobileOpen }) {
  const navItems = [
    { id: "Overview", icon: LayoutDashboard },
    { id: "Attendance", icon: CalendarDays },
    { id: "Students", icon: Users },
    { id: "AI Insights", icon: BrainCircuit },
    { id: "Settings", icon: Settings },
  ];

  return (
    <>
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark"><Fingerprint size={23} /></div>
          <span>Attend<span className="brand-accent">AI</span></span>
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)}><X /></button>
        </div>

        <div className="workspace">
          <div className="workspace-icon"><BookOpen size={19} /></div>
          <div><strong>Campus workspace</strong><small>Academic portal</small></div>
          <ChevronDown size={15} />
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id}
                className={`nav-item ${page === item.id ? "nav-active" : ""}`}
                onClick={() => { setPage(item.id); setMobileOpen(false); }}>
                <Icon size={18} /> <span>{item.id}</span>
                {item.id === "AI Insights" && <span className="nav-new">AI</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="ai-mini-card">
            <div className="ai-mini-icon"><Sparkles size={18} /></div>
            <strong>AI Lab</strong>
            <p>Explore smarter attendance insights.</p>
            <button onClick={() => { setPage("AI Insights"); setMobileOpen(false); }}>
              Explore insights <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="nav-item logout-button" onClick={onLogout}>
            <LogOut size={18} /> Sign out
          </button>
          <div className="sidebar-version">ATTENDAI <span>v1.0</span></div>
        </div>
      </aside>
    </>
  );
}

function StatCard({ title, value, note, icon: Icon, tone, trend }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className={`stat-icon ${tone}`}><Icon size={19} /></span>
        <span className="trend"><ArrowUpRight size={14} /> {trend}</span>
      </div>
      <p className="stat-title">{title}</p>
      <div className="stat-value">{value}</div>
      <p className="stat-note">{note}</p>
    </article>
  );
}

function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState("Overview");
  const [theme, setTheme] = useState("aurora");
  const [dark, setDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState(initialStudents);
  const [showAdd, setShowAdd] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", course: "Computer Science" });
  const [notice, setNotice] = useState("");
  const [aiSummary, setAiSummary] = useState(
    "Attendance is trending upward this week. Review late arrivals and students with repeated absences."
  );

  const present = students.filter(s => s.status === "Present").length;
  const absent = students.filter(s => s.status === "Absent").length;
  const filtered = students.filter(s =>
    `${s.name} ${s.id} ${s.course} ${s.status}`.toLowerCase().includes(query.toLowerCase())
  );

  async function addStudent(e) {
    e.preventDefault();
    const student = {
      id: `AI${String(Date.now()).slice(-4)}`,
      name: newStudent.name.trim(),
      course: newStudent.course,
      time: "—",
      status: "Absent",
    };
    if (!student.name) return;

    try {
      await api.markAttendance({ studentName: student.name, course: student.course });
      setNotice("Attendance API request completed.");
    } catch {
      setNotice("Demo mode: student added locally. Connect your actual student API to save it permanently.");
    }

    setStudents(current => [...current, student]);
    setNewStudent({ name: "", course: "Computer Science" });
    setShowAdd(false);
  }

  async function analyze() {
    setPage("AI Insights");
    try {
      const result = await api.getDashboard();
      if (result?.insights || result?.summary) {
        setAiSummary(result.insights || result.summary);
        setNotice("Latest insights loaded from the backend.");
      } else {
        setNotice("The API responded. Map its response fields to display live AI insights.");
      }
    } catch {
      setNotice("Showing a sample insight. Connect your AI analysis endpoint to load real results.");
    }
  }

  function exportCsv() {
    const csv = [
      "Student ID,Name,Course,Arrival,Status",
      ...filtered.map(s => [s.id, s.name, s.course, s.time, s.status]
        .map(v => `"${String(v).replaceAll('"', '""')}"`).join(","))
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendai-attendance.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const greetingName = user?.name || user?.fullName || user?.email?.split("@")[0] || "Admin";

  return (
    <div className={`app-shell ${dark ? "dark-mode" : "light-mode"} theme-${theme}`}>
      <Sidebar page={page} setPage={setPage} onLogout={onLogout}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="main-panel">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileOpen(true)}><Menu /></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div>
          <div className="topbar-actions">
            <span className="live-indicator"><i /> System online</span>
            <button className="icon-button" title="Toggle light/dark mode"
              onClick={() => setDark(v => !v)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="icon-button" title="Notifications" onClick={() => setNotice("You're all caught up!")}>
              <Bell size={18} />
            </button>
            <div className="avatar">{greetingName.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <div className="page-content">
          {notice && <div className="notice">{notice}<button onClick={() => setNotice("")}><X size={15}/></button></div>}

          {page === "Overview" && <>
            <div className="welcome-row">
              <div>
                <div className="eyebrow"><Sparkles size={14} /> YOUR CAMPUS, INTELLIGENTLY CONNECTED</div>
                <h1>Good to see you, {greetingName} <span className="wave">✳</span></h1>
                <p className="muted">Here's what's happening with your campus today.</p>
              </div>
              <button className="primary-button" onClick={() => { setPage("Attendance"); setShowAdd(true); }}>
                <Plus size={17} /> Mark attendance
              </button>
            </div>

            <section className="hero-card">
              <div className="hero-content">
                <div className="hero-tag"><span /> INTELLIGENCE OVER ROUTINE</div>
                <h2>Every presence<br />tells a <span>story.</span></h2>
                <p>Turn everyday attendance into meaningful insights with your smart campus workspace.</p>
                <button className="hero-button" onClick={analyze}>Explore AI insights <ArrowUpRight size={16} /></button>
              </div>
              <div className="hero-visual">
                <div className="orbit orbit-a" /><div className="orbit orbit-b" />
                <div className="core-glow"><BrainCircuit size={55} strokeWidth={1.25} /></div>
                <div className="float-chip chip-a"><Activity size={15} /> Live analytics</div>
                <div className="float-chip chip-b"><ShieldCheck size={15} /> Smart monitoring</div>
                <div className="float-chip chip-c"><Sparkles size={14} /> AI enabled</div>
              </div>
              <div className="hero-index">01 — ATTENDANCE INTELLIGENCE</div>
            </section>

            <div className="section-heading">
              <div><h2>Today's overview</h2><p className="muted">A quick look at your attendance metrics.</p></div>
              <span className="date-chip"><CalendarDays size={15} /> {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>

            <section className="stats-grid">
              <StatCard title="Total students" value="248" note="Registered in this workspace" icon={Users} tone="cyan" trend="+12 this month" />
              <StatCard title="Present today" value={`${present + 236}`} note="Across all registered classes" icon={Check} tone="green" trend="+4.8%" />
              <StatCard title="Absent today" value={`${absent + 8}`} note="May need follow-up" icon={Clock3} tone="orange" trend="Review" />
              <StatCard title="Attendance rate" value="94.2%" note="Average across this week" icon={Activity} tone="violet" trend="+2.4%" />
            </section>

            <section className="analytics-grid">
              <article className="panel chart-panel">
                <div className="panel-heading"><div><h3>Attendance activity</h3><p className="muted">Weekly attendance trend</p></div>
                  <span className="chart-legend"><i /> Attendance</span></div>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData} margin={{ top: 12, right: 4, left: -20, bottom: 0 }}>
                      <defs><linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient></defs>
                      <CartesianGrid stroke="var(--grid-line)" vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" }} />
                      <Area type="monotone" dataKey="rate" name="Attendance %" stroke="var(--accent)" strokeWidth={2.5} fill="url(#attendanceFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="panel insight-panel">
                <div className="panel-heading"><div className="ai-heading"><span className="ai-icon"><BrainCircuit size={19}/></span><div><h3>AI snapshot</h3><p className="muted">Attendance intelligence</p></div></div><span className="ai-badge">BETA</span></div>
                <div className="insight-score"><span>94</span><small>/ 100</small><span className="score-label">HEALTH SCORE</span></div>
                <div className="score-track"><span /></div>
                <p className="insight-copy">Attendance health is looking strong. A few patterns are worth exploring before the week ends.</p>
                <div className="insight-row"><span className="insight-dot green-dot"/><span>Weekly consistency</span><strong>Strong</strong></div>
                <div className="insight-row"><span className="insight-dot amber-dot"/><span>Late arrivals</span><strong>Review</strong></div>
                <button className="secondary-button full-button" onClick={analyze}>View AI insights <ArrowUpRight size={15}/></button>
              </article>
            </section>

            <StudentTable students={students.slice(0, 4)} query={query} setQuery={setQuery}
              exportCsv={exportCsv} onSeeAll={() => setPage("Students")} compact />
          </>}

          {page === "Attendance" && <>
            <div className="welcome-row"><div><div className="eyebrow">DAILY RECORDS</div><h1>Attendance</h1><p className="muted">Manage today's attendance records.</p></div>
              <button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={17}/> Add record</button></div>
            <div className="stats-grid">
              <StatCard title="Present" value={present} note="In current demo records" icon={Check} tone="green" trend="Today"/>
              <StatCard title="Absent" value={absent} note="In current demo records" icon={Clock3} tone="orange" trend="Today"/>
              <StatCard title="Late" value={students.filter(s=>s.status==="Late").length} note="In current demo records" icon={Activity} tone="violet" trend="Today"/>
              <StatCard title="Total records" value={students.length} note="In current demo records" icon={Users} tone="cyan" trend="Today"/>
            </div>
            <StudentTable students={filtered} query={query} setQuery={setQuery} exportCsv={exportCsv}/>
          </>}

          {page === "Students" && <>
            <div className="welcome-row"><div><div className="eyebrow">CAMPUS DIRECTORY</div><h1>Students</h1><p className="muted">Search and review student records.</p></div>
              <button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={17}/> Add student</button></div>
            <StudentTable students={filtered} query={query} setQuery={setQuery} exportCsv={exportCsv}/>
          </>}

          {page === "AI Insights" && <>
            <div className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> INTELLIGENCE CENTER</div><h1>AI Insights</h1><p className="muted">Understand the patterns behind attendance.</p></div><button className="primary-button" onClick={analyze}><Activity size={16}/> Refresh analysis</button></div>
            <div className="insights-grid">
              <article className="panel big-insight"><span className="ai-icon"><BrainCircuit size={24}/></span><h2>Your attendance intelligence</h2><p>{aiSummary}</p><div className="demo-warning">Sample insight until your real AI endpoint is connected.</div></article>
              <article className="panel"><h3>Weekly consistency</h3><div className="big-number">94.2%</div><p className="muted">Illustrative demo metric</p><div className="score-track"><span/></div></article>
              <article className="panel"><h3>Follow-up needed</h3><div className="big-number">{absent}</div><p className="muted">Absent students in current demo records</p></article>
            </div>
          </>}

          {page === "Settings" && <>
            <div className="welcome-row"><div><div className="eyebrow">PERSONALIZE YOUR WORKSPACE</div><h1>Settings</h1><p className="muted">Make AttendAI feel like yours.</p></div></div>
            <section className="panel settings-panel"><h3>Appearance</h3><p className="muted">Choose a color identity for your dashboard.</p>
              <div className="theme-options">
                {[["aurora","Neural Aurora"],["ocean","Cyber Ocean"],["violet","Quantum Violet"],["ember","Solar Ember"]].map(([id,label])=>
                  <button key={id} className={`theme-option ${theme===id?"theme-selected":""}`} onClick={()=>setTheme(id)}>
                    <span className={`theme-swatch swatch-${id}`}/>{label}{theme===id&&<Check size={16}/>}
                  </button>)}
              </div>
              <div className="settings-divider"/>
              <h3>Display mode</h3><div className="theme-options">
                <button className={`theme-option ${dark?"theme-selected":""}`} onClick={()=>setDark(true)}><Moon size={17}/> Dark</button>
                <button className={`theme-option ${!dark?"theme-selected":""}`} onClick={()=>setDark(false)}><Sun size={17}/> Light</button>
              </div>
            </section>
          </>}

          <footer className="page-footer"><span>© 2026 AttendAI · Smart campus intelligence</span><span><CircleHelp size={14}/> Made for better learning</span></footer>
        </div>
      </main>

      {showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
        <form className="modal-card" onSubmit={addStudent} onClick={e=>e.stopPropagation()}>
          <div className="modal-heading"><div><h2>Add attendance record</h2><p className="muted">Create a demo record for your workspace.</p></div><button type="button" className="icon-button" onClick={()=>setShowAdd(false)}><X/></button></div>
          <label>Student name<input value={newStudent.name} onChange={e=>setNewStudent({...newStudent,name:e.target.value})} placeholder="Enter student name" required/></label>
          <label>Course<select value={newStudent.course} onChange={e=>setNewStudent({...newStudent,course:e.target.value})}><option>Computer Science</option><option>Information Technology</option><option>Electronics</option><option>Mechanical Engineering</option></select></label>
          <p className="muted modal-hint">Demo note: the backend attendance route may require a student ID and a different payload.</p>
          <button className="primary-button full-button"><Plus size={17}/> Save record</button>
        </form>
      </div>}
    </div>
  );
}

function StudentTable({ students, query, setQuery, exportCsv, onSeeAll, compact = false }) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading table-heading"><div><h3>{compact ? "Recent attendance" : "Attendance records"}</h3><p className="muted">{compact ? "Latest activity from the demo workspace" : "Search and export the current demo records"}</p></div>
        <button className="secondary-button export-button" onClick={exportCsv}><Download size={15}/> Export CSV</button></div>
      <div className="table-tools"><div className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search students..." /></div>
        {onSeeAll && <button className="text-button" onClick={onSeeAll}>View all <ArrowUpRight size={14}/></button>}</div>
      <div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>COURSE</th><th>ARRIVAL</th><th>STATUS</th></tr></thead>
        <tbody>{students.length ? students.map(s=><tr key={s.id}><td><div className="student-cell"><span className="student-avatar">{s.name.charAt(0)}</span><strong>{s.name}</strong></div></td><td className="id-cell">{s.id}</td><td>{s.course}</td><td>{s.time}</td><td><span className={`status status-${s.status.toLowerCase()}`}><i/>{s.status}</span></td></tr>)
        : <tr><td colSpan="5" className="empty-cell">No students match your search.</td></tr>}</tbody></table></div>
      <div className="table-foot">Showing {students.length} demo record{students.length!==1?"s":""}</div>
    </section>
  );
}

export default function App() {
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("attendai_user")) || null; }
    catch { return null; }
  });

  function login(userData) {
    setUser(userData);
    localStorage.setItem("attendai_user", JSON.stringify(userData));
  }

  function logout() {
    localStorage.removeItem("attendai_user");
    localStorage.removeItem("attendai_token");
    setUser(null);
    setMode("login");
  }

  if (!user) {
    return <AuthPage mode={mode} onModeChange={setMode} onLogin={login}/>;
  }

  return <Dashboard user={user} onLogout={logout}/>;
}

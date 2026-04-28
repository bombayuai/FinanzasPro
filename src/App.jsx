import { useState, useEffect, useCallback } from "react";
import {
  PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

/* ── Paleta ── */
const C = {
  bg: "#0a0e1a", card: "#111827", border: "#1f2937",
  accent: "#00d4aa", accentDim: "#00d4aa18", gold: "#f59e0b",
  red: "#ef4444", blue: "#3b82f6", purple: "#8b5cf6",
  text: "#f1f5f9", muted: "#64748b",
};
const SCOLS  = [C.accent, C.blue, C.purple, C.gold];
const CCOLS  = [C.gold, "#627eea", "#9945ff", "#3468d1"];
const CICONS = { BTC: "₿", ETH: "Ξ", SOL: "◎", ADA: "₳" };
const CG_IDS = { BTC: "bitcoin", ETH: "ethereum", SOL: "solana", ADA: "cardano" };

/* ── Datos iniciales ── */
const initAcciones = [
  { id:1, symbol:"AAPL", nombre:"Apple",     cantidad:15,  precio:189.5,  cambio:0, precioCompra:170  },
  { id:2, symbol:"NVDA", nombre:"NVIDIA",    cantidad:8,   precio:875.2,  cambio:0, precioCompra:800  },
  { id:3, symbol:"MSFT", nombre:"Microsoft", cantidad:12,  precio:420.8,  cambio:0, precioCompra:400  },
  { id:4, symbol:"TSLA", nombre:"Tesla",     cantidad:20,  precio:175.3,  cambio:0, precioCompra:160  },
];
const initCrypto = [
  { id:1, symbol:"BTC", nombre:"Bitcoin",  cantidad:0.45, precio:64200, cambio:0, precioCompra:58000 },
  { id:2, symbol:"ETH", nombre:"Ethereum", cantidad:3.2,  precio:3180,  cambio:0, precioCompra:2900  },
  { id:3, symbol:"SOL", nombre:"Solana",   cantidad:25,   precio:168,   cambio:0, precioCompra:140   },
  { id:4, symbol:"ADA", nombre:"Cardano",  cantidad:1500, precio:0.48,  cambio:0, precioCompra:0.40  },
];
const initGastos = [
  { id:1, categoria:"Renta",           monto:900, fecha:"2026-04-01", icon:"🏠" },
  { id:2, categoria:"Comida",          monto:320, fecha:"2026-04-05", icon:"🍔" },
  { id:3, categoria:"Transporte",      monto:150, fecha:"2026-04-08", icon:"🚗" },
  { id:4, categoria:"Entretenimiento", monto:220, fecha:"2026-04-12", icon:"🎬" },
  { id:5, categoria:"Salud",           monto:180, fecha:"2026-04-15", icon:"💊" },
  { id:6, categoria:"Servicios",       monto:290, fecha:"2026-04-20", icon:"💡" },
];
const historial = [
  { mes:"Nov", balance:71000, inv:35000 },
  { mes:"Dic", balance:74500, inv:37200 },
  { mes:"Ene", balance:78200, inv:39100 },
  { mes:"Feb", balance:80100, inv:40500 },
  { mes:"Mar", balance:83900, inv:41800 },
  { mes:"Abr", balance:87420, inv:43200 },
];

/* ── Helpers ── */
const fmt = (n, d = 2) =>
  Number(n).toLocaleString("es-MX", { minimumFractionDigits: d, maximumFractionDigits: d });

/* ── Componentes UI ── */
function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: 18, ...style,
    }}>{children}</div>
  );
}

function Badge({ val }) {
  const pos = val >= 0;
  return (
    <span style={{
      background: pos ? "#00d4aa18" : "#ef444418",
      border: `1px solid ${pos ? "#00d4aa44" : "#ef444444"}`,
      borderRadius: 6, padding: "3px 9px",
      color: pos ? C.accent : C.red, fontWeight: 700, fontSize: 12,
    }}>
      {pos ? "+" : ""}{fmt(val, 2)}%
    </span>
  );
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block", width: 12, height: 12,
      border: `2px solid ${C.border}`, borderTop: `2px solid ${C.accent}`,
      borderRadius: "50%", animation: "spin .7s linear infinite",
    }} />
  );
}

function Tag({ children, color }) {
  return (
    <span style={{
      background: `${color}18`, border: `1px solid ${color}44`,
      color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600,
    }}>{children}</span>
  );
}

const Tip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div style={{ background: "#1f2937", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ color: C.muted, fontSize: 12, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600, fontSize: 13 }}>
          {p.name}: ${fmt(p.value)}
        </p>
      ))}
    </div>
  ) : null;

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000bb",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 300, backdropFilter: "blur(6px)",
    }}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 20, padding: 26, width: "min(370px, 92vw)",
        maxHeight: "88vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17 }}>{title}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inp = {
  width: "100%", background: "#1f2937", border: `1px solid ${C.border}`,
  borderRadius: 10, padding: "10px 14px", color: C.text,
  fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box",
};

function Fld({ label, children }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ color: C.muted, fontSize: 12, display: "block", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

function Btn({ onClick, children, bg = C.accent, tc = "#000", full = false, style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: bg, color: tc, border: "none", borderRadius: 10,
      padding: "10px 16px", fontWeight: 700, cursor: "pointer",
      fontSize: 13, fontFamily: "'DM Sans',sans-serif",
      width: full ? "100%" : "auto", ...style,
    }}>{children}</button>
  );
}

/* ── App principal ── */
export default function App() {
  const [tab, setTab]         = useState("dashboard");
  const [acciones, setAcciones] = useState(initAcciones);
  const [crypto, setCrypto]   = useState(initCrypto);
  const [gastos, setGastos]   = useState(initGastos);
  const [loading, setLoading] = useState({ c: false, s: false });
  const [updated, setUpdated] = useState(null);
  const [bal, setBal]         = useState(0);

  /* modals */
  const [mGasto, setMGasto] = useState(false);
  const [mEdit,  setMEdit]  = useState(null);
  const [mAdd,   setMAdd]   = useState(null);

  /* forms */
  const [fGasto, setFGasto] = useState({ categoria: "", monto: "", icon: "💳" });
  const [fInv,   setFInv]   = useState({});
  const [fAdd,   setFAdd]   = useState({ symbol: "", nombre: "", cantidad: "", precioCompra: "" });

  /* Totales */
  const totA = acciones.reduce((s, a) => s + a.cantidad * a.precio, 0);
  const totC = crypto.reduce((s, c) => s + c.cantidad * c.precio, 0);
  const totG = gastos.reduce((s, g) => s + g.monto, 0);
  const balance = 44220 + totA + totC;

  /* Animar balance al montar */
  useEffect(() => {
    let v = 0;
    const step = balance / 70;
    const iv = setInterval(() => {
      v += step;
      if (v >= balance) { setBal(balance); clearInterval(iv); }
      else setBal(v);
    }, 16);
    return () => clearInterval(iv);
  }, []);

  /* Precios crypto en tiempo real */
  const fetchCrypto = useCallback(async () => {
    setLoading(l => ({ ...l, c: true }));
    try {
      const ids = Object.values(CG_IDS).join(",");
      const r = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      const d = await r.json();
      setCrypto(prev => prev.map(c => {
        const id = CG_IDS[c.symbol];
        if (d[id]) return { ...c, precio: d[id].usd, cambio: parseFloat((d[id].usd_24h_change || 0).toFixed(2)) };
        return c;
      }));
      setUpdated(new Date());
    } catch (e) { console.warn("CoinGecko:", e); }
    setLoading(l => ({ ...l, c: false }));
  }, []);

  /* Precios acciones simulados (Yahoo Finance requiere proxy server) */
  const fetchStocks = useCallback(() => {
    setLoading(l => ({ ...l, s: true }));
    setTimeout(() => {
      setAcciones(prev => prev.map(a => {
        const d = (Math.random() - 0.48) * 2;
        return { ...a, precio: parseFloat((a.precio * (1 + d / 100)).toFixed(2)), cambio: parseFloat(d.toFixed(2)) };
      }));
      setUpdated(new Date());
      setLoading(l => ({ ...l, s: false }));
    }, 700);
  }, []);

  useEffect(() => {
    fetchCrypto();
    fetchStocks();
    const iv = setInterval(() => { fetchCrypto(); fetchStocks(); }, 60000);
    return () => clearInterval(iv);
  }, []);

  /* Gastos por categoría */
  const gastoCat = gastos.reduce((acc, g) => {
    const f = acc.find(x => x.name === g.categoria);
    if (f) f.value += g.monto;
    else acc.push({ name: g.categoria, value: g.monto, color: SCOLS[acc.length % 4] });
    return acc;
  }, []);

  /* Acciones */
  function addGasto() {
    if (!fGasto.categoria || !fGasto.monto) return;
    setGastos(g => [{
      id: Date.now(), categoria: fGasto.categoria,
      monto: parseFloat(fGasto.monto),
      fecha: new Date().toISOString().split("T")[0],
      icon: fGasto.icon,
    }, ...g]);
    setFGasto({ categoria: "", monto: "", icon: "💳" });
    setMGasto(false);
  }

  function openEdit(type, item) { setFInv({ ...item }); setMEdit({ type }); }

  function saveEdit() {
    const u = { ...fInv, cantidad: parseFloat(fInv.cantidad), precioCompra: parseFloat(fInv.precioCompra) };
    if (mEdit.type === "accion") setAcciones(p => p.map(a => a.id === fInv.id ? u : a));
    else setCrypto(p => p.map(c => c.id === fInv.id ? u : c));
    setMEdit(null);
  }

  function delEdit() {
    if (mEdit.type === "accion") setAcciones(p => p.filter(a => a.id !== fInv.id));
    else setCrypto(p => p.filter(c => c.id !== fInv.id));
    setMEdit(null);
  }

  function addInv() {
    if (!fAdd.symbol || !fAdd.cantidad) return;
    const base = {
      id: Date.now(), symbol: fAdd.symbol.toUpperCase(),
      nombre: fAdd.nombre || fAdd.symbol,
      cantidad: parseFloat(fAdd.cantidad),
      precioCompra: parseFloat(fAdd.precioCompra || 0),
      precio: parseFloat(fAdd.precioCompra || 0),
      cambio: 0,
    };
    if (mAdd === "accion") setAcciones(p => [...p, base]);
    else setCrypto(p => [...p, base]);
    setFAdd({ symbol: "", nombre: "", cantidad: "", precioCompra: "" });
    setMAdd(null);
  }

  const tabs = [
    { id: "dashboard", l: "Dashboard", i: "⬡" },
    { id: "gastos",    l: "Gastos",    i: "💸" },
    { id: "acciones",  l: "Acciones",  i: "📈" },
    { id: "crypto",    l: "Crypto",    i: "₿"  },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 4px; }
        .hov:hover { background: #1f293766 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        borderBottom: `1px solid ${C.border}`, padding: "13px 18px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, background: C.bg, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, background: C.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🚀</div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17 }}>FinanzasPro</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {updated && (
            <span style={{ color: C.muted, fontSize: 11 }}>
              Act. {updated.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => { fetchCrypto(); fetchStocks(); }}
            style={{ background: C.accentDim, border: `1px solid ${C.accent}44`, color: C.accent, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}
          >
            {(loading.c || loading.s) ? <Spinner /> : "⟳"} Actualizar
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "0 18px", display: "flex", gap: 2, overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none",
            borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent",
            color: tab === t.id ? C.accent : C.muted,
            padding: "11px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
            transition: "all .2s", fontFamily: "'DM Sans',sans-serif",
          }}>
            {t.i} {t.l}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "22px 14px" }}>

        {/* ════ DASHBOARD ════ */}
        {tab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ background: "linear-gradient(135deg,#111827,#0e1f30)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, background: `${C.accent}06`, borderRadius: "50%", border: `1px solid ${C.accent}12` }} />
              <p style={{ color: C.muted, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Balance Total</p>
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 42, fontWeight: 800, color: C.accent, letterSpacing: -2 }}>${fmt(bal)}</p>
              <p style={{ color: C.muted, fontSize: 12, marginTop: 5 }}>↑ +4.2% vs mes anterior</p>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              {[
                { l: "Gastos del Mes", v: totG,       col: C.red,    i: "💸" },
                { l: "Inversiones",    v: totA + totC, col: C.blue,   i: "📊" },
                { l: "Acciones",       v: totA,        col: C.accent, i: "📈" },
                { l: "Crypto",         v: totC,        col: C.gold,   i: "₿"  },
              ].map(s => (
                <Card key={s.l}>
                  <p style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>{s.i} {s.l}</p>
                  <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: s.col }}>${fmt(s.v)}</p>
                </Card>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 14 }}>
              <Card>
                <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 12, fontSize: 13 }}>Evolución Patrimonial</p>
                <ResponsiveContainer width="100%" height={185}>
                  <AreaChart data={historial}>
                    <defs>
                      <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={C.accent} stopOpacity={.28} />
                        <stop offset="95%" stopColor={C.accent} stopOpacity={0}   />
                      </linearGradient>
                      <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={C.blue} stopOpacity={.28} />
                        <stop offset="95%" stopColor={C.blue} stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="mes" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<Tip />} />
                    <Area type="monotone" dataKey="balance" name="Balance"     stroke={C.accent} fill="url(#gA)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="inv"     name="Inversiones" stroke={C.blue}   fill="url(#gB)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Gastos</p>
                <ResponsiveContainer width="100%" height={135}>
                  <PieChart>
                    <Pie data={gastoCat} dataKey="value" cx="50%" cy="50%" innerRadius={36} outerRadius={58} paddingAngle={3}>
                      {gastoCat.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={v => [`$${fmt(v)}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 6 }}>
                  {gastoCat.slice(0, 4).map((c, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.color }} />
                        <span style={{ fontSize: 10, color: C.muted }}>{c.name}</span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600 }}>${fmt(c.value, 0)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card>
              <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 10, fontSize: 13 }}>Últimas Transacciones</p>
              {gastos.slice(0, 5).map(g => (
                <div key={g.id} className="hov" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 8px", borderRadius: 8, transition: "background .15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ fontSize: 20 }}>{g.icon}</span>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 13 }}>{g.categoria}</p>
                      <p style={{ color: C.muted, fontSize: 11 }}>{g.fecha}</p>
                    </div>
                  </div>
                  <p style={{ color: C.red, fontWeight: 600, fontSize: 14 }}>-${fmt(g.monto)}</p>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ════ GASTOS ════ */}
        {tab === "gastos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22 }}>Mis Gastos</h2>
                <p style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Total: <span style={{ color: C.red, fontWeight: 600 }}>${fmt(totG)}</span></p>
              </div>
              <Btn onClick={() => setMGasto(true)}>+ Agregar</Btn>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Card>
                <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 10, fontSize: 13 }}>Por Categoría</p>
                <ResponsiveContainer width="100%" height={165}>
                  <BarChart data={gastoCat} layout="vertical">
                    <XAxis type="number" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} width={62} />
                    <Tooltip content={<Tip />} />
                    <Bar dataKey="value" name="Monto" radius={[0, 4, 4, 0]}>
                      {gastoCat.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Distribución</p>
                <ResponsiveContainer width="100%" height={165}>
                  <PieChart>
                    <Pie data={gastoCat} dataKey="value" cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3}>
                      {gastoCat.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={v => [`$${fmt(v)}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card>
              <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 10, fontSize: 13 }}>Historial</p>
              {gastos.map(g => (
                <div key={g.id} className="hov" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px", borderBottom: `1px solid ${C.border}33`, borderRadius: 8, transition: "background .15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: "#1f2937", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{g.icon}</div>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 13 }}>{g.categoria}</p>
                      <p style={{ color: C.muted, fontSize: 11 }}>{g.fecha}</p>
                    </div>
                  </div>
                  <p style={{ color: C.red, fontWeight: 700, fontSize: 14 }}>-${fmt(g.monto)}</p>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ════ ACCIONES ════ */}
        {tab === "acciones" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22 }}>Acciones</h2>
                <p style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                  Total: <span style={{ color: C.blue, fontWeight: 600 }}>${fmt(totA)}</span>
                  {loading.s && <span style={{ color: C.muted }}> · actualizando <Spinner /></span>}
                </p>
              </div>
              <Btn onClick={() => setMAdd("accion")}>+ Agregar</Btn>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 13 }}>
              {acciones.map((a, i) => {
                const val    = a.cantidad * a.precio;
                const gan    = val - a.cantidad * a.precioCompra;
                const ganPct = ((a.precio - a.precioCompra) / a.precioCompra) * 100;
                const col    = SCOLS[i % 4];
                return (
                  <Card key={a.id} style={{ cursor: "pointer" }} onClick={() => openEdit("accion", a)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 36, height: 36, background: `${col}18`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 11, color: col }}>{a.symbol}</div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 14 }}>{a.symbol}</p>
                          <p style={{ color: C.muted, fontSize: 11 }}>{a.nombre}</p>
                        </div>
                      </div>
                      <Badge val={a.cambio} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 9 }}>
                      <div><p style={{ color: C.muted, fontSize: 10 }}>Precio</p><p style={{ fontWeight: 600, fontSize: 13 }}>${fmt(a.precio)}</p></div>
                      <div><p style={{ color: C.muted, fontSize: 10 }}>Cant.</p><p style={{ fontWeight: 600, fontSize: 13 }}>{a.cantidad}</p></div>
                      <div><p style={{ color: C.muted, fontSize: 10 }}>Valor</p><p style={{ fontWeight: 700, fontSize: 13, color: col }}>${fmt(val)}</p></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Tag color={gan >= 0 ? C.accent : C.red}>{gan >= 0 ? "+" : ""}{fmt(ganPct, 1)}% (${fmt(gan)})</Tag>
                      <span style={{ color: C.muted, fontSize: 11 }}>✎ editar</span>
                    </div>
                    <div style={{ marginTop: 9, height: 3, background: "#1f2937", borderRadius: 2 }}>
                      <div style={{ width: `${Math.min((val / totA) * 100, 100)}%`, height: "100%", background: col, borderRadius: 2 }} />
                    </div>
                    <p style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{((val / totA) * 100).toFixed(1)}% del portafolio</p>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ CRYPTO ════ */}
        {tab === "crypto" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22 }}>Crypto</h2>
                <p style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                  Total: <span style={{ color: C.gold, fontWeight: 600 }}>${fmt(totC)}</span>
                  {loading.c && <span style={{ animation: "pulse 1.2s infinite", color: C.accent }}> ● en vivo</span>}
                </p>
              </div>
              <Btn onClick={() => setMAdd("crypto")}>+ Agregar</Btn>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 13 }}>
              {crypto.map((c, i) => {
                const val    = c.cantidad * c.precio;
                const gan    = val - c.cantidad * c.precioCompra;
                const ganPct = ((c.precio - c.precioCompra) / c.precioCompra) * 100;
                const col    = CCOLS[i % CCOLS.length];
                return (
                  <Card key={c.id} style={{ borderColor: `${col}33`, cursor: "pointer" }} onClick={() => openEdit("crypto", c)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${col}18`, border: `2px solid ${col}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: col, fontWeight: 700 }}>{CICONS[c.symbol] || "?"}</div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 14 }}>{c.symbol}</p>
                          <p style={{ color: C.muted, fontSize: 11 }}>{c.nombre}</p>
                        </div>
                      </div>
                      <Badge val={c.cambio} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 9 }}>
                      <div><p style={{ color: C.muted, fontSize: 10 }}>Precio</p><p style={{ fontWeight: 600, fontSize: 12 }}>${fmt(c.precio)}</p></div>
                      <div><p style={{ color: C.muted, fontSize: 10 }}>Cant.</p><p style={{ fontWeight: 600, fontSize: 12 }}>{c.cantidad}</p></div>
                      <div><p style={{ color: C.muted, fontSize: 10 }}>Valor</p><p style={{ fontWeight: 700, fontSize: 12, color: col }}>${fmt(val)}</p></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Tag color={gan >= 0 ? C.accent : C.red}>{gan >= 0 ? "+" : ""}{fmt(ganPct, 1)}% (${fmt(gan)})</Tag>
                      <span style={{ color: C.muted, fontSize: 11 }}>✎ editar</span>
                    </div>
                    <div style={{ marginTop: 9, height: 3, background: "#1f2937", borderRadius: 2 }}>
                      <div style={{ width: `${Math.min((val / totC) * 100, 100)}%`, height: "100%", background: col, borderRadius: 2 }} />
                    </div>
                    <p style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{((val / totC) * 100).toFixed(1)}% del portafolio</p>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: Agregar Gasto ── */}
      {mGasto && (
        <Modal title="Nuevo Gasto" onClose={() => setMGasto(false)}>
          <Fld label="Ícono">
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {["🏠","🍔","🚗","🎬","💊","👕","💡","✈️","🎮","💳","🛒","📱"].map(e => (
                <button key={e} onClick={() => setFGasto(f => ({ ...f, icon: e }))}
                  style={{ background: fGasto.icon === e ? C.accentDim : "#1f2937", border: `1px solid ${fGasto.icon === e ? C.accent : "transparent"}`, borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontSize: 18 }}>
                  {e}
                </button>
              ))}
            </div>
          </Fld>
          <Fld label="Categoría"><input value={fGasto.categoria} onChange={e => setFGasto(f => ({ ...f, categoria: e.target.value }))} placeholder="Ej: Comida" style={inp} /></Fld>
          <Fld label="Monto"><input type="number" value={fGasto.monto} onChange={e => setFGasto(f => ({ ...f, monto: e.target.value }))} placeholder="0.00" style={inp} /></Fld>
          <Btn onClick={addGasto} full>Agregar Gasto</Btn>
        </Modal>
      )}

      {/* ── MODAL: Editar Inversión ── */}
      {mEdit && (
        <Modal title={`Editar ${mEdit.type === "accion" ? "Acción" : "Crypto"}`} onClose={() => setMEdit(null)}>
          <Fld label="Símbolo"><input value={fInv.symbol} onChange={e => setFInv(f => ({ ...f, symbol: e.target.value.toUpperCase() }))} style={inp} /></Fld>
          <Fld label="Nombre"><input value={fInv.nombre} onChange={e => setFInv(f => ({ ...f, nombre: e.target.value }))} style={inp} /></Fld>
          <Fld label="Cantidad"><input type="number" value={fInv.cantidad} onChange={e => setFInv(f => ({ ...f, cantidad: e.target.value }))} style={inp} /></Fld>
          <Fld label="Precio de Compra (USD)"><input type="number" value={fInv.precioCompra} onChange={e => setFInv(f => ({ ...f, precioCompra: e.target.value }))} style={inp} /></Fld>
          <div style={{ background: "#1f2937", borderRadius: 10, padding: "11px 14px", marginBottom: 14 }}>
            <p style={{ color: C.muted, fontSize: 11, marginBottom: 3 }}>Precio actual (tiempo real)</p>
            <p style={{ fontWeight: 700, fontSize: 17, color: C.accent }}>${fmt(fInv.precio)}</p>
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <Btn onClick={saveEdit} style={{ flex: 1 }}>Guardar</Btn>
            <Btn onClick={delEdit} bg={C.red} tc="#fff" style={{ flex: 1 }}>Eliminar</Btn>
          </div>
        </Modal>
      )}

      {/* ── MODAL: Agregar Inversión ── */}
      {mAdd && (
        <Modal title={`Nueva ${mAdd === "accion" ? "Acción" : "Crypto"}`} onClose={() => setMAdd(null)}>
          <Fld label="Símbolo (ej: AAPL, BTC)"><input value={fAdd.symbol} onChange={e => setFAdd(f => ({ ...f, symbol: e.target.value.toUpperCase() }))} placeholder="BTC" style={inp} /></Fld>
          <Fld label="Nombre"><input value={fAdd.nombre} onChange={e => setFAdd(f => ({ ...f, nombre: e.target.value }))} placeholder="Bitcoin" style={inp} /></Fld>
          <Fld label="Cantidad"><input type="number" value={fAdd.cantidad} onChange={e => setFAdd(f => ({ ...f, cantidad: e.target.value }))} placeholder="0" style={inp} /></Fld>
          <Fld label="Precio de Compra (USD)"><input type="number" value={fAdd.precioCompra} onChange={e => setFAdd(f => ({ ...f, precioCompra: e.target.value }))} placeholder="0.00" style={inp} /></Fld>
          <Btn onClick={addInv} full>Agregar</Btn>
        </Modal>
      )}
    </div>
  );
}

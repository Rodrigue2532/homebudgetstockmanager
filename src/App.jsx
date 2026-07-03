import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { supabase, APP_STATE_ID } from "./supabaseClient";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
} from "recharts";
import {
  LayoutGrid, Wallet, Package, ShoppingCart, BarChart3, Settings,
  Menu, X, Bell, Moon, Sun, Plus, TrendingUp, TrendingDown,
  AlertTriangle, AlertOctagon, CheckCircle2, Trash2, Search,
  ArrowUpCircle, ArrowDownCircle, Baby, UtensilsCrossed, Home as HomeIcon,
  Car, User, HeartPulse, Gamepad2, MoreHorizontal, PiggyBank,
  ChevronDown, Banknote, Users, ClipboardList, RefreshCw, Filter,
  ArrowUpDown, Pencil, CalendarDays, PackageX, PackageMinus, PackagePlus,
} from "lucide-react";

/* ============================================================================
   CONSTANTES & DONNÉES DE RÉFÉRENCE
============================================================================ */

const INITIAL_BALANCE = 0;

const CATEGORY_META = {
  "Alimentation": { color: "#F59E0B", icon: UtensilsCrossed },
  "Bébés": { color: "#60A5FA", icon: Baby },
  "Maison": { color: "#2563EB", icon: HomeIcon },
  "Transport": { color: "#64748B", icon: Car },
  "Personnels": { color: "#1E3A8A", icon: User },
  "Santé": { color: "#10B981", icon: HeartPulse },
  "Loisirs": { color: "#FBBF24", icon: Gamepad2 },
  "Divers": { color: "#94A3B8", icon: MoreHorizontal },
  "Economie": { color: "#059669", icon: PiggyBank },
};
const CATEGORY_LIST = Object.keys(CATEGORY_META);

const SUBCATEGORIES = {
  "Alimentation": ["Supermarché", "Marché", "Boulangerie", "Boucherie"],
  "Bébés": ["Couches & lingettes", "Lait & alimentation", "Vêtements", "Santé bébé", "Jouets"],
  "Maison": ["Loyer", "Électricité & eau", "Entretien maison", "Ameublement", "Internet"],
  "Transport": ["Carburant", "Transport en commun", "Entretien véhicule", "Taxi / Bolt"],
  "Personnels": ["Salaire nounou", "Habillement", "Coiffure & soins", "Téléphone"],
  "Santé": ["Pharmacie", "Consultation médicale", "Mutuelle / Assurance"],
  "Loisirs": ["Sorties", "Restaurant", "Abonnements"],
  "Divers": ["Imprévu", "Cadeaux", "Don"],
  "Economie": ["Épargne", "Investissement"],
};

const STOCK_CATEGORY_META = {
  "Bébé": { color: "#60A5FA" },
  "Hygiène": { color: "#10B981" },
  "Alimentation": { color: "#F59E0B" },
  "Entretien": { color: "#2563EB" },
  "Maison": { color: "#64748B" },
};

const INITIAL_BUDGETS = {
  "Alimentation": 0, "Bébés": 0, "Maison": 0, "Transport": 0,
  "Personnels": 0, "Santé": 0, "Loisirs": 0, "Divers": 0, "Economie": 0,
};

const INITIAL_PRODUCTS = [];

const INITIAL_RECURRING = [];

function genTransactions() {
  const rows = [];
  let n = 1;
  const add = (date, type, category, subcategory, amount, comment, account = "Espèces", contributor = null) => {
    rows.push({ id: "t" + n++, date, type, category, subcategory, amount, comment, account, contributor });
  };

  const months = [
    { key: "2026-04", days: 30 },
    { key: "2026-05", days: 31 },
    { key: "2026-06", days: 29 },
  ];

  months.forEach(({ key, days }, mi) => {
    add(`${key}-02`, "revenu", "Economie", "Épargne", 45000, "Revenu de Rodrigue", "Espèces", "Rodrigue");
    add(`${key}-03`, "revenu", "Economie", "Épargne", 28000, "Revenu de Liantsoa", "Espèces", "Liantsoa");
    if (mi === 1) add(`${key}-18`, "revenu", "Economie", "Épargne", 9500, "Revenu de Rodrigue", "Espèces", "Rodrigue");
    if (mi === 2) add(`${key}-15`, "revenu", "Economie", "Épargne", 12500, "Revenu de Rodrigue", "Espèces", "Rodrigue");

    add(`${key}-05`, "depense", "Maison", "Loyer", 14000, "Loyer du mois");
    add(`${key}-04`, "depense", "Alimentation", "Supermarché", 4200, "Courses Winner's");
    add(`${key}-09`, "depense", "Alimentation", "Marché", 1350, "Légumes & fruits marché");
    add(`${key}-16`, "depense", "Alimentation", "Supermarché", 3800, "Courses mensuelles");
    add(`${key}-23`, "depense", "Alimentation", "Boucherie", 1620, "Viande & poulet");
    add(`${key}-07`, "depense", "Bébés", "Couches & lingettes", 900, "Couches taille 2 x2");
    add(`${key}-12`, "depense", "Bébés", "Lait & alimentation", 980, "Lait infantile");
    add(`${key}-20`, "depense", "Bébés", "Santé bébé", 650, "Vitamines & sirop");
    add(`${key}-10`, "depense", "Maison", "Électricité & eau", 2150, "Facture CEB/CWA");
    add(`${key}-10`, "depense", "Maison", "Internet", 2200, "My.T Internet + ligne");
    add(`${key}-14`, "depense", "Transport", "Carburant", 2800, "Plein essence");
    add(`${key}-26`, "depense", "Transport", "Carburant", 2600, "Plein essence");
    add(`${key}-19`, "depense", "Transport", "Entretien véhicule", mi === 0 ? 3200 : 0, mi === 0 ? "Vidange + freins" : "—");
    add(`${key}-28`, "depense", "Personnels", "Salaire nounou", 7000, "Nounou Abigail/Siloé");
    add(`${key}-28`, "depense", "Personnels", "Salaire nounou", 6500, "Nounou (2e)");
    add(`${key}-22`, "depense", "Santé", "Pharmacie", 980, "Pharmacie famille");
    add(`${key}-13`, "depense", "Loisirs", "Restaurant", 1450, "Sortie en famille");
    add(`${key}-06`, "depense", "Divers", "Imprévu", mi === 2 ? 1800 : 600, "Dépense imprévue");

    if (mi === 0) add(`${key}-25`, "depense", "Alimentation", "Supermarché", 2900, "Courses complément");
    if (mi === 2) {
      add(`${key}-08`, "depense", "Alimentation", "Supermarché", 5100, "Grosses courses du mois");
      add(`${key}-27`, "depense", "Loisirs", "Sorties", 2200, "Anniversaire Abigail");
    }
  });

  return rows.filter((r) => r.amount > 0);
}

function genMovements() {
  const rows = [];
  let n = 1;
  const add = (date, productId, type, quantity, price = 0) => {
    rows.push({ id: "m" + n++, date, productId, type, quantity, price });
  };
  const months = ["2026-04", "2026-05", "2026-06"];

  const plan = {
    p1: { in: [3, 2, 2], out: [4, 4, 3] },
    p2: { in: [2, 2, 1], out: [2, 1, 2] },
    p3: { in: [2, 2, 2], out: [2, 2, 2] },
    p4: { in: [1, 1, 1], out: [1, 1, 1] },
    p5: { in: [1, 1, 0], out: [1, 1, 1] },
    p6: { in: [2, 1, 1], out: [1, 1, 1] },
    p7: { in: [3, 2, 2], out: [2, 2, 2] },
    p8: { in: [2, 1, 1], out: [1, 1, 1] },
    p9: { in: [2, 1, 1], out: [1, 1, 1] },
    p10: { in: [3, 2, 2], out: [2, 2, 2] },
    p11: { in: [10, 5, 5], out: [4, 4, 4] },
    p12: { in: [5, 3, 3], out: [3, 3, 3] },
    p13: { in: [3, 2, 2], out: [2, 2, 2] },
    p14: { in: [2, 1, 1], out: [1, 1, 1] },
  };

  months.forEach((key, mi) => {
    Object.entries(plan).forEach(([pid, sched]) => {
      const product = INITIAL_PRODUCTS.find((p) => p.id === pid);
      if (sched.in[mi] > 0) add(`${key}-0${3 + mi}`, pid, "entree", sched.in[mi], product.avgPrice);
      if (sched.out[mi] > 0) add(`${key}-${15 + mi}`, pid, "sortie", sched.out[mi]);
    });
  });

  return rows;
}

const INITIAL_TRANSACTIONS = [];
const INITIAL_MOVEMENTS = [];
const CURRENT_MONTH = "2026-06";

const MONTH_LABELS = {
  "2026-01": "Jan 2026", "2026-02": "Fév 2026", "2026-03": "Mar 2026",
  "2026-04": "Avr 2026", "2026-05": "Mai 2026", "2026-06": "Juin 2026",
  "2026-07": "Juil 2026",
};

/* ============================================================================
   HELPERS
============================================================================ */

const fmt = (n) => `Ar ${Math.round(n || 0).toLocaleString("fr-FR")}`;
const monthKey = (d) => d.slice(0, 7);
const uid = (p = "x") => `${p}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;

function useTheme(isDark) {
  return useMemo(() => ({
    appBg: isDark ? "bg-slate-950" : "bg-slate-50",
    sidebarBg: isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
    headerBg: isDark ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200",
    card: isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
    cardHover: isDark ? "hover:border-slate-700" : "hover:border-slate-300",
    text: isDark ? "text-slate-100" : "text-slate-900",
    textMuted: isDark ? "text-slate-400" : "text-slate-500",
    textFaint: isDark ? "text-slate-500" : "text-slate-400",
    border: isDark ? "border-slate-800" : "border-slate-200",
    hoverBg: isDark ? "hover:bg-slate-800" : "hover:bg-slate-50",
    inputBg: isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900",
    tableHeadBg: isDark ? "bg-slate-800/60" : "bg-slate-50",
    rowHover: isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50",
    modalBg: isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
    overlay: "bg-slate-950/60",
  }), [isDark]);
}

/* ============================================================================
   PETITS COMPOSANTS RÉUTILISABLES
============================================================================ */

function ProgressRing({ pct, color, size = 56, stroke = 6, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(pct, 100);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c - (clamped / 100) * c} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.7s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

function StockBar({ ratio, theme }) {
  const pct = Math.min(ratio * 100, 100);
  const color = ratio <= 0.34 ? "#EF4444" : ratio <= 1 ? "#F59E0B" : "#10B981";
  return (
    <div className={`h-1.5 w-full rounded-full ${theme.border} bg-current/10 overflow-hidden`}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    green: "bg-emerald-100 text-emerald-700",
    orange: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function IconBadge({ Icon, color }) {
  return (
    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}1A` }}>
      <Icon size={19} style={{ color }} />
    </div>
  );
}

function Modal({ title, onClose, children, theme, wide }) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme.overlay}`} onClick={onClose}>
      <div
        className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-2xl border ${theme.modalBg} ${theme.text} shadow-2xl animate-[fadeIn_0.18s_ease]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${theme.border}`}>
          <h3 className="font-semibold text-base">{title}</h3>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${theme.hoverBg}`}><X size={18} /></button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel, theme }) {
  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 ${theme.overlay}`} onClick={onCancel}>
      <div className={`w-full max-w-sm rounded-2xl border ${theme.modalBg} ${theme.text} p-5 shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={19} className="text-red-600" />
          </div>
          <p className="text-sm leading-snug">{message}</p>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onCancel} className={`px-4 py-2 rounded-xl text-sm font-medium border ${theme.border} ${theme.hoverBg}`}>Annuler</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition">Confirmer</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-3.5">
      <span className="block text-xs font-medium mb-1.5 opacity-70">{label}</span>
      {children}
    </label>
  );
}

function inputCls(theme) {
  return `w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition ${theme.inputBg}`;
}

function Toast({ toast, theme }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[70] animate-[slideUp_0.25s_ease]">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl ${theme.modalBg} ${theme.text}`}>
        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
        <span className="text-sm font-medium">{toast}</span>
      </div>
    </div>
  );
}

/* ============================================================================
   APP PRINCIPALE
============================================================================ */

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const theme = useTheme(isDark);
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [movements, setMovements] = useState(INITIAL_MOVEMENTS);
  const [recurring, setRecurring] = useState(INITIAL_RECURRING);
  const [shoppingExtra, setShoppingExtra] = useState([]);
  const [shoppingChecked, setShoppingChecked] = useState({});

  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [reportMonth, setReportMonth] = useState(CURRENT_MONTH);

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  /* ---------- Persistance Supabase ---------- */

  const [dataLoaded, setDataLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | error
  const saveTimeout = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const { data, error } = await supabase
          .from("app_state")
          .select("data")
          .eq("id", APP_STATE_ID)
          .maybeSingle();
        if (!cancelled && !error && data && data.data) {
          const d = data.data;
          if (d.transactions) setTransactions(d.transactions);
          if (d.budgets) setBudgets(d.budgets);
          if (d.products) setProducts(d.products);
          if (d.movements) setMovements(d.movements);
          if (d.recurring) setRecurring(d.recurring);
          if (d.shoppingExtra) setShoppingExtra(d.shoppingExtra);
          if (d.shoppingChecked) setShoppingChecked(d.shoppingChecked);
        }
      } catch (e) {
        console.error("Erreur de chargement Supabase:", e);
      } finally {
        if (!cancelled) setDataLoaded(true);
      }
    }
    loadData();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", loadData);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", loadData);
    };
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSyncStatus("syncing");
    saveTimeout.current = setTimeout(async () => {
      const payload = { transactions, budgets, products, movements, recurring, shoppingExtra, shoppingChecked };
      const { error } = await supabase
        .from("app_state")
        .upsert({ id: APP_STATE_ID, data: payload, updated_at: new Date().toISOString() });
      setSyncStatus(error ? "error" : "idle");
      if (error) console.error("Erreur de sauvegarde Supabase:", error);
    }, 900);
    return () => clearTimeout(saveTimeout.current);
  }, [transactions, budgets, products, movements, recurring, shoppingExtra, shoppingChecked, dataLoaded]);

  /* ---------- Calculs dérivés ---------- */

  const balance = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (t.type === "revenu" ? t.amount : -t.amount), INITIAL_BALANCE);
  }, [transactions]);

  const monthTx = useCallback((mk) => transactions.filter((t) => monthKey(t.date) === mk), [transactions]);

  const currentMonthExpenses = useMemo(
    () => monthTx(CURRENT_MONTH).filter((t) => t.type === "depense").reduce((s, t) => s + t.amount, 0),
    [monthTx]
  );
  const currentMonthIncome = useMemo(
    () => monthTx(CURRENT_MONTH).filter((t) => t.type === "revenu").reduce((s, t) => s + t.amount, 0),
    [monthTx]
  );
  const totalBudget = useMemo(() => Object.values(budgets).reduce((a, b) => a + b, 0), [budgets]);
  const budgetRemaining = totalBudget - currentMonthExpenses;

  const budgetUsage = useMemo(() => {
    return CATEGORY_LIST.map((cat) => {
      const spent = monthTx(CURRENT_MONTH)
        .filter((t) => t.type === "depense" && t.category === cat)
        .reduce((s, t) => s + t.amount, 0);
      const budget = budgets[cat] || 0;
      const pct = budget > 0 ? (spent / budget) * 100 : 0;
      return { category: cat, spent, budget, pct, remaining: budget - spent };
    }).sort((a, b) => b.pct - a.pct);
  }, [monthTx, budgets]);

  const expensesByCategory = useMemo(() => {
    return CATEGORY_LIST.map((cat) => ({
      name: cat,
      value: monthTx(CURRENT_MONTH).filter((t) => t.type === "depense" && t.category === cat).reduce((s, t) => s + t.amount, 0),
      color: CATEGORY_META[cat].color,
    })).filter((d) => d.value > 0);
  }, [monthTx]);

  const monthlyTrend = useMemo(() => {
    const keys = ["2026-04", "2026-05", "2026-06"];
    return keys.map((k) => ({
      month: MONTH_LABELS[k] || k,
      Dépenses: monthTx(k).filter((t) => t.type === "depense").reduce((s, t) => s + t.amount, 0),
      Revenus: monthTx(k).filter((t) => t.type === "revenu").reduce((s, t) => s + t.amount, 0),
    }));
  }, [monthTx]);

  const stockValue = useMemo(() => products.reduce((s, p) => s + p.currentStock * p.avgPrice, 0), [products]);
  const outOfStock = useMemo(() => products.filter((p) => p.currentStock === 0), [products]);
  const lowStock = useMemo(() => products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock), [products]);

  const consumption = useCallback((productId) => {
    const keys = ["2026-04", "2026-05", "2026-06"];
    const monthlyOut = keys.map((k) =>
      movements.filter((m) => m.productId === productId && m.type === "sortie" && monthKey(m.date) === k)
        .reduce((s, m) => s + m.quantity, 0)
    );
    const withData = monthlyOut.filter((v) => v > 0);
    const avgMonthly = withData.length ? withData.reduce((a, b) => a + b, 0) / withData.length : 0;
    return {
      monthly: monthlyOut[monthlyOut.length - 1] || 0,
      weekly: avgMonthly / 4.33,
      average: avgMonthly,
    };
  }, [movements]);

  const recurringDue = useMemo(() => recurring.filter((r) => !r.paidMonths.includes(CURRENT_MONTH)), [recurring]);

  const alerts = useMemo(() => {
    const list = [];
    budgetUsage.forEach((b) => {
      if (b.pct >= 100) list.push({ id: "bud-" + b.category, level: "danger", text: `Budget ${b.category} dépassé (${Math.round(b.pct)}%)` });
      else if (b.pct >= 90) list.push({ id: "bud-" + b.category, level: "warning", text: `Budget ${b.category} bientôt atteint (${Math.round(b.pct)}%)` });
    });
    outOfStock.forEach((p) => list.push({ id: "out-" + p.id, level: "danger", text: `Rupture de stock : ${p.name}` }));
    lowStock.forEach((p) => list.push({ id: "low-" + p.id, level: "warning", text: `Stock bas : ${p.name} (${p.currentStock} ${p.unit})` }));
    recurringDue.forEach((r) => list.push({ id: "rec-" + r.id, level: "warning", text: `${r.label} à payer (${fmt(r.amount)})` }));
    return list;
  }, [budgetUsage, outOfStock, lowStock, recurringDue]);

  const shoppingList = useMemo(() => {
    const fromStock = [...outOfStock, ...lowStock].map((p) => ({
      id: p.id, name: p.name, sub: `${p.currentStock}/${p.minStock} ${p.unit}`, fromStock: true,
      checked: !!shoppingChecked[p.id],
    }));
    const extras = shoppingExtra.map((e) => ({ ...e, sub: "Ajout manuel", fromStock: false, checked: !!shoppingChecked[e.id] }));
    return [...fromStock, ...extras];
  }, [outOfStock, lowStock, shoppingExtra, shoppingChecked]);

  /* ---------- Actions ---------- */

  const addTransaction = (tx) => {
    setTransactions((prev) => [{ ...tx, id: uid("t") }, ...prev]);
    notify(tx.type === "revenu" ? "Revenu ajouté" : "Dépense ajoutée");
    setModal(null);
  };

  const deleteTransaction = (id) => {
    setConfirm({
      message: "Supprimer cette transaction ? Cette action est irréversible.",
      onConfirm: () => {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        setConfirm(null);
        notify("Transaction supprimée");
      },
    });
  };

  const addStockEntry = ({ productId, date, quantity, price }) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, currentStock: p.currentStock + quantity, avgPrice: price || p.avgPrice } : p)));
    setMovements((prev) => [{ id: uid("m"), date, productId, type: "entree", quantity, price }, ...prev]);
    notify("Entrée de stock enregistrée");
    setModal(null);
  };

  const addStockExit = ({ productId, date, quantity }) => {
    const product = products.find((p) => p.id === productId);
    const finalQty = Math.min(quantity, product.currentStock);
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, currentStock: Math.max(0, p.currentStock - quantity) } : p)));
    setMovements((prev) => [{ id: uid("m"), date, productId, type: "sortie", quantity: finalQty }, ...prev]);
    notify("Sortie de stock enregistrée");
    setModal(null);
  };

  const addProduct = (p) => {
    setProducts((prev) => [...prev, { ...p, id: uid("p") }]);
    notify("Produit ajouté au stock");
    setModal(null);
  };

  const deleteProduct = (id) => {
    setConfirm({
      message: "Supprimer ce produit et son historique ? Cette action est irréversible.",
      onConfirm: () => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setMovements((prev) => prev.filter((m) => m.productId !== id));
        setConfirm(null);
        notify("Produit supprimé");
      },
    });
  };

  const toggleShoppingChecked = (id) => setShoppingChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const addShoppingItem = (name) => setShoppingExtra((prev) => [...prev, { id: uid("s"), name, checked: false }]);
  const removeShoppingItem = (id) => setShoppingExtra((prev) => prev.filter((s) => s.id !== id));

  const togglePaid = (recId) => {
    setRecurring((prev) => prev.map((r) => {
      if (r.id !== recId) return r;
      const has = r.paidMonths.includes(CURRENT_MONTH);
      return { ...r, paidMonths: has ? r.paidMonths.filter((m) => m !== CURRENT_MONTH) : [...r.paidMonths, CURRENT_MONTH] };
    }));
  };

  /* ---------- Navigation ---------- */

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "finances", label: "Finances", icon: Wallet },
    { id: "stock", label: "Stock", icon: Package },
    { id: "shopping", label: "Liste de courses", icon: ShoppingCart },
    { id: "reports", label: "Rapports", icon: BarChart3 },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  const viewTitle = NAV.find((n) => n.id === activeView)?.label || "";

  /* ============================================================================
     RENDU
  ============================================================================ */

  return (
    <div className={`h-full min-h-[700px] w-full flex ${theme.appBg} ${theme.text} font-sans`} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lexend:wght@500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        @keyframes fadeIn { from { opacity:0; transform: scale(0.97); } to { opacity:1; transform: scale(1); } }
        @keyframes slideUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
        .font-display { font-family: 'Lexend', sans-serif; }
        .font-mono-num { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? "#334155" : "#cbd5e1"}; border-radius: 8px; }
      `}</style>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-slate-950/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 w-64 border-r flex flex-col transition-transform duration-300 ${theme.sidebarBg} ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className={`h-16 flex items-center gap-2.5 px-5 border-b ${theme.border}`}>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shrink-0">
            <HomeIcon size={18} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="font-display font-semibold text-sm">Home Budget</p>
            <p className={`text-[11px] ${theme.textMuted}`}>& Stock Manager</p>
          </div>
          <button className="ml-auto lg:hidden p-1" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30" : `${theme.textMuted} ${theme.hoverBg}`
                }`}
              >
                <Icon size={18} />
                {item.label}
                {item.id === "settings" && alerts.length > 0 && false}
              </button>
            );
          })}
        </nav>

        <div className={`px-4 py-4 border-t ${theme.border}`}>
          <div className={`flex items-center gap-2.5 px-2 py-2 rounded-xl ${theme.hoverBg}`}>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
              <Users size={16} className="text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium">Famille Rodrigue & Liantsoa</p>
              <p className={`text-[11px] ${theme.textMuted}`}>6 personnes · Maurice</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* HEADER */}
        <header className={`h-16 shrink-0 flex items-center gap-3 px-4 lg:px-6 border-b backdrop-blur ${theme.headerBg}`}>
          <button className={`lg:hidden p-2 rounded-lg ${theme.hoverBg}`} onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <h1 className="font-display font-semibold text-lg">{viewTitle}</h1>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setModal({ type: "transaction" })}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm shadow-blue-600/30"
            >
              <Plus size={16} /> Ajouter
            </button>

            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className={`relative p-2.5 rounded-xl ${theme.hoverBg}`}
              >
                <Bell size={19} />
                {alerts.length > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{alerts.length}</span>
                )}
              </button>
              {notifOpen && (
                <div className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl z-50 ${theme.modalBg} animate-[fadeIn_0.15s_ease]`}>
                  <div className={`px-4 py-3 border-b font-medium text-sm ${theme.border}`}>Notifications ({alerts.length})</div>
                  <div className="max-h-80 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <p className={`px-4 py-6 text-sm text-center ${theme.textMuted}`}>Tout est sous contrôle 🎉</p>
                    ) : alerts.map((a) => (
                      <div key={a.id} className={`flex items-start gap-2.5 px-4 py-3 border-b last:border-0 ${theme.border}`}>
                        {a.level === "danger" ? <AlertOctagon size={16} className="text-red-500 mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />}
                        <span className="text-sm leading-snug">{a.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setIsDark((v) => !v)} className={`p-2.5 rounded-xl ${theme.hoverBg}`}>
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeView === "dashboard" && (
            <DashboardView
              theme={theme} balance={balance} currentMonthExpenses={currentMonthExpenses}
              budgetRemaining={budgetRemaining} totalBudget={totalBudget} stockValue={stockValue}
              outOfStock={outOfStock} lowStock={lowStock} expensesByCategory={expensesByCategory}
              monthlyTrend={monthlyTrend} alerts={alerts} transactions={transactions}
              isDark={isDark}
            />
          )}
          {activeView === "finances" && (
            <FinancesView
              theme={theme} budgetUsage={budgetUsage} transactions={transactions} balance={balance}
              recurring={recurring} recurringDue={recurringDue} togglePaid={togglePaid}
              onAdd={() => setModal({ type: "transaction" })} onDelete={deleteTransaction}
              currentMonthIncome={currentMonthIncome} currentMonthExpenses={currentMonthExpenses}
            />
          )}
          {activeView === "stock" && (
            <StockView
              theme={theme} products={products} movements={movements} consumption={consumption}
              onStockIn={() => setModal({ type: "stockIn" })} onStockOut={() => setModal({ type: "stockOut" })}
              onAddProduct={() => setModal({ type: "product" })} onDeleteProduct={deleteProduct}
              reportMonth={reportMonth} setReportMonth={setReportMonth}
            />
          )}
          {activeView === "shopping" && (
            <ShoppingView
              theme={theme} list={shoppingList} onToggle={toggleShoppingChecked}
              onAdd={addShoppingItem} onRemove={removeShoppingItem}
            />
          )}
          {activeView === "reports" && (
            <ReportsView
              theme={theme} expensesByCategory={expensesByCategory} monthlyTrend={monthlyTrend}
              budgetUsage={budgetUsage} products={products} movements={movements} consumption={consumption}
              isDark={isDark} transactions={transactions}
            />
          )}
          {activeView === "settings" && (
            <SettingsView
              theme={theme} budgets={budgets} setBudgets={setBudgets} isDark={isDark} setIsDark={setIsDark}
              notify={notify} recurring={recurring} setRecurring={setRecurring}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      {modal?.type === "transaction" && (
        <TransactionModal theme={theme} onClose={() => setModal(null)} onSubmit={addTransaction} />
      )}
      {modal?.type === "stockIn" && (
        <StockInModal theme={theme} products={products} onClose={() => setModal(null)} onSubmit={addStockEntry} />
      )}
      {modal?.type === "stockOut" && (
        <StockOutModal theme={theme} products={products} onClose={() => setModal(null)} onSubmit={addStockExit} />
      )}
      {modal?.type === "product" && (
        <ProductModal theme={theme} onClose={() => setModal(null)} onSubmit={addProduct} />
      )}

      {confirm && <ConfirmDialog theme={theme} message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      <Toast toast={toast} theme={theme} />

      {/* Bouton mobile flottant pour ajouter */}
      <button
        onClick={() => setModal({ type: "transaction" })}
        className="sm:hidden fixed bottom-5 right-5 h-14 w-14 rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-600/40 flex items-center justify-center z-30"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

/* ============================================================================
   DASHBOARD
============================================================================ */

function KpiCard({ theme, label, value, sub, Icon, color, trend }) {
  return (
    <div className={`rounded-2xl border p-4 transition-all ${theme.card} ${theme.cardHover} hover:shadow-lg hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between mb-3">
        <IconBadge Icon={Icon} color={color} />
        {trend != null && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
      <p className={`text-xs font-medium ${theme.textMuted} mb-1`}>{label}</p>
      <p className="font-mono-num text-xl font-semibold tracking-tight">{value}</p>
      {sub && <p className={`text-xs mt-1 ${theme.textFaint}`}>{sub}</p>}
    </div>
  );
}

function DashboardView({ theme, balance, currentMonthExpenses, budgetRemaining, totalBudget, stockValue, outOfStock, lowStock, expensesByCategory, monthlyTrend, alerts, transactions, isDark }) {
  const recent = transactions.slice(0, 6);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Bonjour Rodrigue 👋</h2>
        <p className={`text-sm ${theme.textMuted}`}>Voici la situation de votre foyer pour Juin 2026.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard theme={theme} label="Solde disponible" value={fmt(balance)} Icon={Wallet} color="#2563EB" sub="Compte espèces" />
        <KpiCard theme={theme} label="Dépenses du mois" value={fmt(currentMonthExpenses)} Icon={ArrowDownCircle} color="#EF4444" sub={`sur ${fmt(totalBudget)} budgétisé`} />
        <KpiCard theme={theme} label="Budget restant" value={fmt(budgetRemaining)} Icon={PiggyBank} color="#10B981" sub={budgetRemaining < 0 ? "Dépassement !" : "Ce mois-ci"} />
        <KpiCard theme={theme} label="Valeur du stock" value={fmt(stockValue)} Icon={Package} color="#F59E0B" sub="Tous produits" />
        <KpiCard theme={theme} label="Produits en rupture" value={outOfStock.length} Icon={PackageX} color="#EF4444" sub="À racheter d'urgence" />
        <KpiCard theme={theme} label="Stock bientôt épuisé" value={lowStock.length} Icon={AlertTriangle} color="#F59E0B" sub="Sous le seuil minimum" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`lg:col-span-2 rounded-2xl border p-5 ${theme.card}`}>
          <h3 className="font-display font-semibold text-sm mb-4">Évolution mensuelle des dépenses</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, border: "none", fontSize: 13 }} />
              <Area type="monotone" dataKey="Revenus" stroke="#10B981" fill="url(#revGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Dépenses" stroke="#EF4444" fill="url(#depGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-2xl border p-5 ${theme.card}`}>
          <h3 className="font-display font-semibold text-sm mb-2">Dépenses par catégorie</h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={expensesByCategory} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2}>
                {expensesByCategory.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, border: "none", fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {expensesByCategory.slice(0, 6).map((e) => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                <span className={`truncate ${theme.textMuted}`}>{e.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-5 ${theme.card}`}>
          <h3 className="font-display font-semibold text-sm mb-4">Alertes actives</h3>
          {alerts.length === 0 ? (
            <p className={`text-sm ${theme.textMuted} flex items-center gap-2`}><CheckCircle2 size={16} className="text-emerald-500" /> Rien à signaler, tout va bien !</p>
          ) : (
            <div className="space-y-2.5">
              {alerts.slice(0, 6).map((a) => (
                <div key={a.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl ${a.level === "danger" ? "bg-red-500/10" : "bg-amber-500/10"}`}>
                  {a.level === "danger" ? <AlertOctagon size={16} className="text-red-500 shrink-0" /> : <AlertTriangle size={16} className="text-amber-500 shrink-0" />}
                  <span className="text-sm">{a.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`rounded-2xl border p-5 ${theme.card}`}>
          <h3 className="font-display font-semibold text-sm mb-4">Transactions récentes</h3>
          <div className="space-y-1">
            {recent.map((t) => {
              const isIncome = t.type === "revenu";
              const meta = CATEGORY_META[t.category];
              const Icon = isIncome ? ArrowUpCircle : meta.icon;
              const color = isIncome ? "#10B981" : meta.color;
              return (
                <div key={t.id} className={`flex items-center gap-3 py-2 px-1 rounded-xl ${theme.rowHover}`}>
                  <IconBadge Icon={Icon} color={color} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.comment}</p>
                    <p className={`text-xs ${theme.textMuted}`}>{isIncome ? (t.contributor || "Revenu") : t.category} · {t.date}</p>
                  </div>
                  <span className={`font-mono-num text-sm font-semibold shrink-0 ${isIncome ? "text-emerald-500" : ""}`}>
                    {isIncome ? "+" : "-"}{fmt(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   FINANCES
============================================================================ */

function FinancesView({ theme, budgetUsage, transactions, recurring, recurringDue, togglePaid, onAdd, onDelete, currentMonthIncome, currentMonthExpenses }) {
  const [sortBy, setSortBy] = useState("date");
  const [filterCat, setFilterCat] = useState("Toutes");
  const [filterType, setFilterType] = useState("Tous");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let rows = [...transactions];
    if (filterCat !== "Toutes") rows = rows.filter((t) => t.category === filterCat);
    if (filterType !== "Tous") rows = rows.filter((t) => t.type === filterType);
    if (search.trim()) rows = rows.filter((t) => t.comment.toLowerCase().includes(search.toLowerCase()));
    rows.sort((a, b) => {
      if (sortBy === "date") return b.date.localeCompare(a.date);
      if (sortBy === "amount") return b.amount - a.amount;
      if (sortBy === "category") return a.category.localeCompare(b.category);
      return 0;
    });
    return rows;
  }, [transactions, filterCat, filterType, search, sortBy]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`rounded-2xl border p-4 ${theme.card}`}>
          <p className={`text-xs font-medium ${theme.textMuted} mb-1`}>Revenus du mois</p>
          <p className="font-mono-num text-lg font-semibold text-emerald-500">{fmt(currentMonthIncome)}</p>
        </div>
        <div className={`rounded-2xl border p-4 ${theme.card}`}>
          <p className={`text-xs font-medium ${theme.textMuted} mb-1`}>Dépenses du mois</p>
          <p className="font-mono-num text-lg font-semibold text-red-500">{fmt(currentMonthExpenses)}</p>
        </div>
        <div className={`rounded-2xl border p-4 ${theme.card}`}>
          <p className={`text-xs font-medium ${theme.textMuted} mb-1`}>Compte Espèces</p>
          <p className="font-mono-num text-lg font-semibold flex items-center gap-1.5"><Banknote size={16} className="text-blue-500" /> Actif</p>
        </div>
      </div>

      {/* Budgets */}
      <div>
        <h3 className="font-display font-semibold text-base mb-3">Budgets par catégorie</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetUsage.map((b) => {
            const meta = CATEGORY_META[b.category];
            const color = b.pct >= 100 ? "#EF4444" : b.pct >= 90 ? "#F59E0B" : meta.color;
            return (
              <div key={b.category} className={`rounded-2xl border p-4 flex items-center gap-4 ${theme.card} ${theme.cardHover} transition`}>
                <ProgressRing pct={b.pct} color={color} size={58}>
                  <meta.icon size={18} style={{ color }} />
                </ProgressRing>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{b.category}</p>
                  <p className={`text-xs ${theme.textMuted}`}>{fmt(b.spent)} / {fmt(b.budget)}</p>
                  <p className={`text-xs font-medium ${b.remaining < 0 ? "text-red-500" : "text-emerald-500"}`}>
                    {b.remaining < 0 ? `Dépassé de ${fmt(-b.remaining)}` : `${fmt(b.remaining)} restant`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charges récurrentes */}
      <div>
        <h3 className="font-display font-semibold text-base mb-3">Charges récurrentes — Juin 2026</h3>
        <div className={`rounded-2xl border ${theme.card} overflow-hidden`}>
          {recurring.map((r, i) => {
            const paid = r.paidMonths.includes("2026-06");
            return (
              <div key={r.id} className={`flex items-center gap-3 px-4 py-3 ${i !== recurring.length - 1 ? `border-b ${theme.border}` : ""}`}>
                <button onClick={() => togglePaid(r.id)} className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition ${paid ? "bg-emerald-500 border-emerald-500" : `${theme.border}`}`}>
                  {paid && <CheckCircle2 size={14} className="text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className={`text-xs ${theme.textMuted}`}>Échéance le {r.dueDay} · {r.category}</p>
                </div>
                <span className="font-mono-num text-sm font-semibold">{fmt(r.amount)}</span>
                <Badge tone={paid ? "green" : "orange"}>{paid ? "Payé" : "À payer"}</Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="font-display font-semibold text-base">Transactions</h3>
          <button onClick={onAdd} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition">
            <Plus size={16} /> Nouvelle transaction
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${theme.inputBg} flex-1 min-w-[180px]`}>
            <Search size={15} className="opacity-50" />
            <input className="bg-transparent outline-none w-full" placeholder="Rechercher un commentaire…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className={`px-3 py-2 rounded-xl border text-sm ${theme.inputBg}`}>
            <option>Toutes</option>
            {CATEGORY_LIST.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={`px-3 py-2 rounded-xl border text-sm ${theme.inputBg}`}>
            <option>Tous</option>
            <option value="revenu">Revenus</option>
            <option value="depense">Dépenses</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`px-3 py-2 rounded-xl border text-sm ${theme.inputBg}`}>
            <option value="date">Trier par date</option>
            <option value="amount">Trier par montant</option>
            <option value="category">Trier par catégorie</option>
          </select>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${theme.card}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={theme.tableHeadBg}>
                <tr className={`text-left ${theme.textMuted}`}>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Catégorie</th>
                  <th className="px-4 py-3 font-medium">Commentaire</th>
                  <th className="px-4 py-3 font-medium text-right">Montant</th>
                  <th className="px-4 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 40).map((t) => {
                  const meta = CATEGORY_META[t.category];
                  return (
                    <tr key={t.id} className={`border-t ${theme.border} ${theme.rowHover}`}>
                      <td className="px-4 py-2.5 whitespace-nowrap">{t.date}</td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />{t.category}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        {t.comment}
                        {t.type === "revenu" && t.contributor ? (
                          <Badge tone="blue">{t.contributor}</Badge>
                        ) : (
                          <span className={`text-xs ${theme.textFaint}`}> · {t.subcategory}</span>
                        )}
                      </td>
                      <td className={`px-4 py-2.5 text-right font-mono-num font-medium whitespace-nowrap ${t.type === "revenu" ? "text-emerald-500" : ""}`}>
                        {t.type === "revenu" ? "+" : "-"}{fmt(t.amount)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => onDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className={`text-center py-8 text-sm ${theme.textMuted}`}>Aucune transaction ne correspond aux filtres.</p>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   STOCK
============================================================================ */

function StockView({ theme, products, movements, consumption, onStockIn, onStockOut, onAddProduct, onDeleteProduct, reportMonth, setReportMonth }) {
  const [tab, setTab] = useState("produits");
  const [filterCat, setFilterCat] = useState("Toutes");
  const stockCats = Object.keys(STOCK_CATEGORY_META);

  const filteredProducts = filterCat === "Toutes" ? products : products.filter((p) => p.category === filterCat);

  const ledger = useMemo(() => {
    const sorted = [...movements].sort((a, b) => a.date.localeCompare(b.date));
    const running = {};
    return sorted.map((m) => {
      const p = products.find((x) => x.id === m.productId);
      running[m.productId] = (running[m.productId] || 0) + (m.type === "entree" ? m.quantity : -m.quantity);
      return { ...m, productName: p?.name || "?", unit: p?.unit || "", running: running[m.productId] };
    }).reverse();
  }, [movements, products]);

  const monthlyReport = useMemo(() => {
    return products.map((p) => {
      const entries = movements.filter((m) => m.productId === p.id && m.type === "entree" && monthKey(m.date) === reportMonth).reduce((s, m) => s + m.quantity, 0);
      const exits = movements.filter((m) => m.productId === p.id && m.type === "sortie" && monthKey(m.date) === reportMonth).reduce((s, m) => s + m.quantity, 0);
      const stockFinal = p.currentStock;
      const stockDebut = stockFinal - entries + exits;
      return { ...p, stockDebut, entries, exits, stockFinal };
    });
  }, [products, movements, reportMonth]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 p-1 rounded-xl bg-slate-500/10">
          {[["produits", "Produits"], ["historique", "Historique"], ["rapport", "Rapport mensuel"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${tab === id ? `${theme.card} shadow-sm` : theme.textMuted}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onStockIn} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition">
            <PackagePlus size={16} /> Entrée
          </button>
          <button onClick={onStockOut} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition">
            <PackageMinus size={16} /> Sortie
          </button>
          <button onClick={onAddProduct} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border ${theme.border} ${theme.hoverBg}`}>
            <Plus size={16} /> Produit
          </button>
        </div>
      </div>

      {tab === "produits" && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["Toutes", ...stockCats].map((c) => (
              <button key={c} onClick={() => setFilterCat(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border ${filterCat === c ? "bg-blue-600 text-white border-blue-600" : `${theme.border} ${theme.hoverBg}`}`}>
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const ratio = p.minStock > 0 ? p.currentStock / p.minStock : 1;
              const cons = consumption(p.id);
              const color = STOCK_CATEGORY_META[p.category]?.color || "#64748B";
              const statusTone = p.currentStock === 0 ? "red" : ratio <= 1 ? "orange" : "green";
              return (
                <div key={p.id} className={`rounded-2xl border p-4 ${theme.card} ${theme.cardHover} transition`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className={`text-xs ${theme.textMuted}`}>{p.category} · {p.unit}</p>
                    </div>
                    <button onClick={() => onDeleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500"><Trash2 size={13} /></button>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-mono-num text-2xl font-bold">{p.currentStock}</span>
                    <span className={`text-xs ${theme.textMuted}`}>min. {p.minStock}</span>
                    <Badge tone={statusTone}>{p.currentStock === 0 ? "Rupture" : ratio <= 1 ? "Bas" : "OK"}</Badge>
                  </div>
                  <StockBar ratio={ratio} theme={theme} />
                  <div className={`flex justify-between text-xs mt-3 pt-3 border-t ${theme.border} ${theme.textMuted}`}>
                    <span>Conso/mois : <b className={theme.text}>{cons.monthly}</b></span>
                    <span>Conso/sem. : <b className={theme.text}>{cons.weekly.toFixed(1)}</b></span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "historique" && (
        <div className={`rounded-2xl border overflow-hidden ${theme.card}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={theme.tableHeadBg}>
                <tr className={`text-left ${theme.textMuted}`}>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Produit</th>
                  <th className="px-4 py-3 font-medium text-right">Entrée</th>
                  <th className="px-4 py-3 font-medium text-right">Sortie</th>
                  <th className="px-4 py-3 font-medium text-right">Stock restant</th>
                </tr>
              </thead>
              <tbody>
                {ledger.slice(0, 50).map((m) => (
                  <tr key={m.id} className={`border-t ${theme.border} ${theme.rowHover}`}>
                    <td className="px-4 py-2.5 whitespace-nowrap">{m.date}</td>
                    <td className="px-4 py-2.5">{m.productName} <span className={`text-xs ${theme.textFaint}`}>{m.unit}</span></td>
                    <td className="px-4 py-2.5 text-right font-mono-num text-emerald-500">{m.type === "entree" ? `+${m.quantity}` : "—"}</td>
                    <td className="px-4 py-2.5 text-right font-mono-num text-red-500">{m.type === "sortie" ? `-${m.quantity}` : "—"}</td>
                    <td className="px-4 py-2.5 text-right font-mono-num font-medium">{m.running}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "rapport" && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={16} className={theme.textMuted} />
            <select value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className={`px-3 py-2 rounded-xl border text-sm ${theme.inputBg}`}>
              {["2026-04", "2026-05", "2026-06"].map((k) => <option key={k} value={k}>{MONTH_LABELS[k]}</option>)}
            </select>
          </div>
          <div className={`rounded-2xl border overflow-hidden ${theme.card}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={theme.tableHeadBg}>
                  <tr className={`text-left ${theme.textMuted}`}>
                    <th className="px-4 py-3 font-medium">Produit</th>
                    <th className="px-4 py-3 font-medium text-right">Stock début</th>
                    <th className="px-4 py-3 font-medium text-right">Entrées</th>
                    <th className="px-4 py-3 font-medium text-right">Consommation</th>
                    <th className="px-4 py-3 font-medium text-right">Stock final</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyReport.map((p) => (
                    <tr key={p.id} className={`border-t ${theme.border} ${theme.rowHover}`}>
                      <td className="px-4 py-2.5">{p.name}</td>
                      <td className="px-4 py-2.5 text-right font-mono-num">{p.stockDebut}</td>
                      <td className="px-4 py-2.5 text-right font-mono-num text-emerald-500">+{p.entries}</td>
                      <td className="px-4 py-2.5 text-right font-mono-num text-red-500">-{p.exits}</td>
                      <td className="px-4 py-2.5 text-right font-mono-num font-semibold">{p.stockFinal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   LISTE DE COURSES
============================================================================ */

function ShoppingView({ theme, list, onToggle, onAdd, onRemove }) {
  const [newItem, setNewItem] = useState("");
  const checkedCount = list.filter((i) => i.checked).length;

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Liste de courses</h2>
          <p className={`text-sm ${theme.textMuted}`}>Générée automatiquement selon le stock minimum.</p>
        </div>
        <Badge tone="blue">{checkedCount}/{list.length}</Badge>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={newItem} onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && newItem.trim()) { onAdd(newItem.trim()); setNewItem(""); } }}
          placeholder="Ajouter un article…" className={`flex-1 px-3 py-2.5 rounded-xl border text-sm ${theme.inputBg}`}
        />
        <button
          onClick={() => { if (newItem.trim()) { onAdd(newItem.trim()); setNewItem(""); } }}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${theme.card}`}>
        {list.length === 0 ? (
          <div className="py-12 text-center">
            <ClipboardList size={28} className={`mx-auto mb-2 ${theme.textFaint}`} />
            <p className={`text-sm ${theme.textMuted}`}>Aucun article pour le moment.</p>
          </div>
        ) : list.map((item, i) => (
          <div key={item.id} className={`flex items-center gap-3 px-4 py-3 ${i !== list.length - 1 ? `border-b ${theme.border}` : ""}`}>
            <button onClick={() => onToggle(item.id)} className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${item.checked ? "bg-emerald-500 border-emerald-500" : theme.border}`}>
              {item.checked && <CheckCircle2 size={13} className="text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${item.checked ? `line-through ${theme.textFaint}` : ""}`}>{item.name}</p>
              <p className={`text-xs ${theme.textMuted}`}>{item.sub}</p>
            </div>
            {item.fromStock && <Badge tone="orange">Stock bas</Badge>}
            {!item.fromStock && (
              <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500"><Trash2 size={14} /></button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   RAPPORTS
============================================================================ */

function ReportsView({ theme, expensesByCategory, monthlyTrend, budgetUsage, products, movements, consumption, isDark, transactions }) {
  const productConsumption = useMemo(() => {
    return products.map((p) => ({ name: p.name, qty: consumption(p.id).average })).sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [products, consumption]);

  const mostUsed = useMemo(() => {
    const totals = {};
    movements.filter((m) => m.type === "sortie").forEach((m) => { totals[m.productId] = (totals[m.productId] || 0) + m.quantity; });
    return Object.entries(totals).map(([id, qty]) => ({ name: products.find((p) => p.id === id)?.name || id, qty }))
      .sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [movements, products]);

  const budgetVsSpent = budgetUsage.map((b) => ({ name: b.category, Budget: b.budget, Dépensé: b.spent }));

  const contributionTrend = useMemo(() => {
    const keys = ["2026-04", "2026-05", "2026-06"];
    return keys.map((k) => {
      const monthRevenues = transactions.filter((t) => t.type === "revenu" && monthKey(t.date) === k);
      const rodrigue = monthRevenues.filter((t) => t.contributor === "Rodrigue").reduce((s, t) => s + t.amount, 0);
      const liantsoa = monthRevenues.filter((t) => t.contributor === "Liantsoa").reduce((s, t) => s + t.amount, 0);
      return { month: MONTH_LABELS[k] || k, Rodrigue: rodrigue, Liantsoa: liantsoa };
    });
  }, [transactions]);

  const contributionTotals = useMemo(() => {
    const rodrigue = contributionTrend.reduce((s, m) => s + m.Rodrigue, 0);
    const liantsoa = contributionTrend.reduce((s, m) => s + m.Liantsoa, 0);
    const total = rodrigue + liantsoa;
    return { rodrigue, liantsoa, total, pctR: total ? (rodrigue / total) * 100 : 0, pctL: total ? (liantsoa / total) * 100 : 0 };
  }, [contributionTrend]);

  const axisStyle = { fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" };
  const gridColor = isDark ? "#1e293b" : "#e2e8f0";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard theme={theme} title="Répartition des dépenses">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={expensesByCategory} dataKey="value" nameKey="name" outerRadius={90} label={({ name }) => name}>
                {expensesByCategory.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, border: "none", fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard theme={theme} title="Évolution mensuelle">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, border: "none", fontSize: 13 }} />
              <Bar dataKey="Revenus" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Dépenses" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className={`rounded-2xl border p-5 lg:col-span-2 ${theme.card}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-display font-semibold text-sm">Contribution mensuelle — Rodrigue vs Liantsoa</h3>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" />Rodrigue · {fmt(contributionTotals.rodrigue)} ({contributionTotals.pctR.toFixed(0)}%)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Liantsoa · {fmt(contributionTotals.liantsoa)} ({contributionTotals.pctL.toFixed(0)}%)</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={contributionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, border: "none", fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Rodrigue" fill="#2563EB" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Liantsoa" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <ChartCard theme={theme} title="Budget par catégorie : budget vs dépensé">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={budgetVsSpent} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <YAxis type="category" dataKey="name" tick={{ ...axisStyle, fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, border: "none", fontSize: 13 }} />
              <Bar dataKey="Budget" fill="#cbd5e1" radius={[0, 6, 6, 0]} barSize={9} />
              <Bar dataKey="Dépensé" fill="#2563EB" radius={[0, 6, 6, 0]} barSize={9} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard theme={theme} title="Produits les plus consommés (par quantité)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mostUsed} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ ...axisStyle, fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 13 }} />
              <Bar dataKey="qty" fill="#F59E0B" radius={[0, 6, 6, 0]} barSize={12} name="Quantité totale" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ theme, title, children }) {
  return (
    <div className={`rounded-2xl border p-5 ${theme.card}`}>
      <h3 className="font-display font-semibold text-sm mb-3">{title}</h3>
      {children}
    </div>
  );
}

/* ============================================================================
   PARAMÈTRES
============================================================================ */

function SettingsView({ theme, budgets, setBudgets, isDark, setIsDark, notify, recurring, setRecurring }) {
  const [localBudgets, setLocalBudgets] = useState(budgets);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newCharge, setNewCharge] = useState({ label: "", amount: "", category: CATEGORY_LIST[0], dueDay: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const saveBudgets = () => {
    setBudgets(localBudgets);
    notify("Budgets mis à jour");
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setEditDraft({ label: r.label, amount: r.amount, category: r.category, dueDay: r.dueDay });
  };

  const saveEdit = (id) => {
    if (!editDraft.label.trim() || !editDraft.amount) return;
    setRecurring((prev) => prev.map((r) => (r.id === id ? { ...r, ...editDraft, amount: Number(editDraft.amount), dueDay: Number(editDraft.dueDay) || r.dueDay } : r)));
    setEditingId(null);
    notify("Charge fixe mise à jour");
  };

  const addCharge = () => {
    if (!newCharge.label.trim() || !newCharge.amount) return;
    setRecurring((prev) => [
      ...prev,
      {
        id: uid("r"), label: newCharge.label.trim(), amount: Number(newCharge.amount),
        category: newCharge.category, dueDay: Number(newCharge.dueDay) || 1, paidMonths: [],
      },
    ]);
    setNewCharge({ label: "", amount: "", category: CATEGORY_LIST[0], dueDay: "" });
    setShowAdd(false);
    notify("Charge fixe ajoutée");
  };

  const confirmDelete = () => {
    setRecurring((prev) => prev.filter((r) => r.id !== deleteTarget));
    setDeleteTarget(null);
    notify("Charge fixe supprimée");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className={`rounded-2xl border p-5 flex items-center justify-between ${theme.card}`}>
        <div className="flex items-center gap-3">
          <IconBadge Icon={isDark ? Sun : Moon} color="#2563EB" />
          <div>
            <p className="text-sm font-medium">Mode sombre</p>
            <p className={`text-xs ${theme.textMuted}`}>Adapte l'interface pour le confort visuel</p>
          </div>
        </div>
        <button onClick={() => setIsDark(!isDark)} className={`w-12 h-7 rounded-full p-1 transition ${isDark ? "bg-blue-600" : "bg-slate-300"}`}>
          <div className={`h-5 w-5 rounded-full bg-white transition-transform ${isDark ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>

      <div className={`rounded-2xl border p-5 ${theme.card}`}>
        <div className="flex items-center gap-3 mb-4">
          <IconBadge Icon={Users} color="#10B981" />
          <div>
            <p className="text-sm font-medium">Composition du foyer</p>
            <p className={`text-xs ${theme.textMuted}`}>6 personnes à Maurice</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {["Père (Rodrigue)", "Mère (Liantsoa)", "Abigail · 2 ans", "Siloé · 8 mois", "Nounou 1", "Nounou 2"].map((m) => (
            <div key={m} className={`px-3 py-2 rounded-xl text-center ${theme.tableHeadBg}`}>{m}</div>
          ))}
        </div>
      </div>

      <div className={`rounded-2xl border p-5 ${theme.card}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <IconBadge Icon={PiggyBank} color="#F59E0B" />
            <div>
              <p className="text-sm font-medium">Budgets mensuels</p>
              <p className={`text-xs ${theme.textMuted}`}>Ajustez le budget alloué par catégorie</p>
            </div>
          </div>
          <button onClick={saveBudgets} className="px-3.5 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition">Enregistrer</button>
        </div>
        <div className="space-y-2.5">
          {CATEGORY_LIST.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat} className="flex items-center gap-3">
                <IconBadge Icon={meta.icon} color={meta.color} />
                <span className="text-sm flex-1">{cat}</span>
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border ${theme.inputBg}`}>
                  <span className="text-xs opacity-60">Ar</span>
                  <input
                    type="number" value={localBudgets[cat]}
                    onChange={(e) => setLocalBudgets((p) => ({ ...p, [cat]: Number(e.target.value) }))}
                    className="w-24 bg-transparent outline-none text-right font-mono-num text-sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`rounded-2xl border p-5 ${theme.card}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <IconBadge Icon={Banknote} color="#2563EB" />
            <div>
              <p className="text-sm font-medium">Charges fixes récurrentes</p>
              <p className={`text-xs ${theme.textMuted}`}>Modifiez les montants ou ajoutez une nouvelle charge</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <Plus size={15} /> Ajouter
          </button>
        </div>

        {showAdd && (
          <div className={`rounded-xl border p-4 mb-4 ${theme.tableHeadBg} ${theme.border}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <Field label="Libellé">
                <input value={newCharge.label} onChange={(e) => setNewCharge((p) => ({ ...p, label: e.target.value }))} placeholder="Ex : Abonnement assurance" className={inputCls(theme)} />
              </Field>
              <Field label="Montant (Ar)">
                <input type="number" value={newCharge.amount} onChange={(e) => setNewCharge((p) => ({ ...p, amount: e.target.value }))} placeholder="0" className={inputCls(theme)} />
              </Field>
              <Field label="Catégorie">
                <select value={newCharge.category} onChange={(e) => setNewCharge((p) => ({ ...p, category: e.target.value }))} className={inputCls(theme)}>
                  {CATEGORY_LIST.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Jour d'échéance">
                <input type="number" min="1" max="31" value={newCharge.dueDay} onChange={(e) => setNewCharge((p) => ({ ...p, dueDay: e.target.value }))} placeholder="Ex : 5" className={inputCls(theme)} />
              </Field>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} className={`px-3.5 py-2 rounded-xl text-sm font-medium border ${theme.border} ${theme.hoverBg}`}>Annuler</button>
              <button onClick={addCharge} className="px-3.5 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition">Enregistrer la charge</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {recurring.length === 0 && (
            <p className={`text-sm text-center py-6 ${theme.textMuted}`}>Aucune charge fixe enregistrée.</p>
          )}
          {recurring.map((r) => {
            const meta = CATEGORY_META[r.category];
            const isEditing = editingId === r.id;
            return (
              <div key={r.id} className={`rounded-xl border p-3 ${theme.border}`}>
                {isEditing ? (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <Field label="Libellé">
                        <input value={editDraft.label} onChange={(e) => setEditDraft((p) => ({ ...p, label: e.target.value }))} className={inputCls(theme)} />
                      </Field>
                      <Field label="Montant (Ar)">
                        <input type="number" value={editDraft.amount} onChange={(e) => setEditDraft((p) => ({ ...p, amount: e.target.value }))} className={inputCls(theme)} />
                      </Field>
                      <Field label="Catégorie">
                        <select value={editDraft.category} onChange={(e) => setEditDraft((p) => ({ ...p, category: e.target.value }))} className={inputCls(theme)}>
                          {CATEGORY_LIST.map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </Field>
                      <Field label="Jour d'échéance">
                        <input type="number" min="1" max="31" value={editDraft.dueDay} onChange={(e) => setEditDraft((p) => ({ ...p, dueDay: e.target.value }))} className={inputCls(theme)} />
                      </Field>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId(null)} className={`px-3.5 py-2 rounded-xl text-sm font-medium border ${theme.border} ${theme.hoverBg}`}>Annuler</button>
                      <button onClick={() => saveEdit(r.id)} className="px-3.5 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition">Enregistrer</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <IconBadge Icon={meta.icon} color={meta.color} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.label}</p>
                      <p className={`text-xs ${theme.textMuted}`}>Échéance le {r.dueDay} · {r.category}</p>
                    </div>
                    <span className="font-mono-num text-sm font-semibold shrink-0">{fmt(r.amount)}</span>
                    <button onClick={() => startEdit(r)} className={`p-1.5 rounded-lg shrink-0 ${theme.hoverBg}`}><Pencil size={14} /></button>
                    <button onClick={() => setDeleteTarget(r.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 shrink-0"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`rounded-2xl border p-5 ${theme.card}`}>
        <div className="flex items-center gap-3 mb-1">
          <IconBadge Icon={RefreshCw} color="#64748B" />
          <div>
            <p className="text-sm font-medium">Données de démonstration</p>
            <p className={`text-xs ${theme.textMuted}`}>Cette version utilise des données fictives, sans backend. Vos modifications restent actives pendant cette session.</p>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          theme={theme}
          message="Supprimer cette charge fixe ? Cette action est irréversible."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

/* ============================================================================
   MODALS — FORMULAIRES
============================================================================ */

function TransactionModal({ theme, onClose, onSubmit }) {
  const [type, setType] = useState("depense");
  const [date, setDate] = useState("2026-06-29");
  const [category, setCategory] = useState(CATEGORY_LIST[0]);
  const [subcategory, setSubcategory] = useState(SUBCATEGORIES[CATEGORY_LIST[0]][0]);
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [contributor, setContributor] = useState("Rodrigue");

  const subs = SUBCATEGORIES[category] || [];
  const isRevenu = type === "revenu";

  const submit = () => {
    if (!amount || Number(amount) <= 0) return;
    onSubmit({
      type, date, category,
      subcategory: "",
      amount: Number(amount),
      comment: isRevenu ? `Revenu de ${contributor}` : (comment || category),
      contributor: isRevenu ? contributor : null,
      account: "Espèces",
    });
  };

  return (
    <Modal title="Nouvelle transaction" onClose={onClose} theme={theme}>
      <div className="flex gap-2 mb-4 p-1 rounded-xl bg-slate-500/10">
        <button onClick={() => setType("depense")} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${type === "depense" ? "bg-red-500 text-white" : theme.textMuted}`}>
          <ArrowDownCircle size={15} /> Dépense
        </button>
        <button onClick={() => setType("revenu")} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${type === "revenu" ? "bg-emerald-500 text-white" : theme.textMuted}`}>
          <ArrowUpCircle size={15} /> Revenu
        </button>
      </div>

      <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls(theme)} /></Field>
      <Field label="Montant (Ar)"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={inputCls(theme)} /></Field>

      {isRevenu && (
        <Field label="Ajouté par">
          <div className="flex gap-2 p-1 rounded-xl bg-slate-500/10">
            {["Rodrigue", "Liantsoa"].map((person) => (
              <button
                key={person} type="button" onClick={() => setContributor(person)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${
                  contributor === person ? "bg-emerald-500 text-white" : theme.textMuted
                }`}
              >
                <User size={14} /> {person}
              </button>
            ))}
          </div>
        </Field>
      )}

      {!isRevenu && (
        <Field label="Catégorie">
          <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(SUBCATEGORIES[e.target.value][0]); }} className={inputCls(theme)}>
            {CATEGORY_LIST.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      )}
      {!isRevenu && (
        <Field label="Commentaire"><input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ex : Courses au supermarché" className={inputCls(theme)} /></Field>
      )}

      <button onClick={submit} className="w-full mt-2 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition">
        Ajouter
      </button>
    </Modal>
  );
}

function StockInModal({ theme, products, onClose, onSubmit }) {
  const [productId, setProductId] = useState(products[0]?.id);
  const [date, setDate] = useState("2026-06-29");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const submit = () => {
    if (!quantity || Number(quantity) <= 0) return;
    onSubmit({ productId, date, quantity: Number(quantity), price: Number(price) || 0 });
  };

  return (
    <Modal title="Entrée de stock (achat)" onClose={onClose} theme={theme}>
      <Field label="Produit">
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className={inputCls(theme)}>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
        </select>
      </Field>
      <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls(theme)} /></Field>
      <Field label="Quantité"><input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" className={inputCls(theme)} /></Field>
      <Field label="Prix unitaire (Rs, optionnel)"><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className={inputCls(theme)} /></Field>
      <button onClick={submit} className="w-full mt-2 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition">
        Enregistrer l'entrée
      </button>
    </Modal>
  );
}

function StockOutModal({ theme, products, onClose, onSubmit }) {
  const [productId, setProductId] = useState(products[0]?.id);
  const [date, setDate] = useState("2026-06-29");
  const [quantity, setQuantity] = useState("");
  const product = products.find((p) => p.id === productId);

  const submit = () => {
    if (!quantity || Number(quantity) <= 0) return;
    onSubmit({ productId, date, quantity: Number(quantity) });
  };

  return (
    <Modal title="Sortie de stock (consommation)" onClose={onClose} theme={theme}>
      <Field label="Produit">
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className={inputCls(theme)}>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.unit}) — stock : {p.currentStock}</option>)}
        </select>
      </Field>
      <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls(theme)} /></Field>
      <Field label="Quantité"><input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" className={inputCls(theme)} /></Field>
      {product && Number(quantity) > product.currentStock && (
        <p className="text-xs text-amber-500 -mt-2 mb-3">⚠ Quantité supérieure au stock disponible ({product.currentStock}). Le stock sera ramené à 0.</p>
      )}
      <button onClick={submit} className="w-full mt-2 py-2.5 rounded-xl text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition">
        Enregistrer la sortie
      </button>
    </Modal>
  );
}

function ProductModal({ theme, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(Object.keys(STOCK_CATEGORY_META)[0]);
  const [unit, setUnit] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [avgPrice, setAvgPrice] = useState("");

  const submit = () => {
    if (!name.trim() || !unit.trim()) return;
    onSubmit({
      name: name.trim(), category, unit: unit.trim(),
      currentStock: Number(currentStock) || 0, minStock: Number(minStock) || 1, avgPrice: Number(avgPrice) || 0,
    });
  };

  return (
    <Modal title="Ajouter un produit au stock" onClose={onClose} theme={theme}>
      <Field label="Nom du produit"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Café moulu" className={inputCls(theme)} /></Field>
      <Field label="Catégorie">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls(theme)}>
          {Object.keys(STOCK_CATEGORY_META).map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Unité"><input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Ex : paquet, kg, bouteille" className={inputCls(theme)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Stock actuel"><input type="number" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} placeholder="0" className={inputCls(theme)} /></Field>
        <Field label="Stock minimum"><input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} placeholder="0" className={inputCls(theme)} /></Field>
      </div>
      <Field label="Prix moyen (Rs)"><input type="number" value={avgPrice} onChange={(e) => setAvgPrice(e.target.value)} placeholder="0" className={inputCls(theme)} /></Field>
      <button onClick={submit} className="w-full mt-2 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition">
        Ajouter le produit
      </button>
    </Modal>
  );
}

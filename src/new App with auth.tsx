import { useState, useRef, useEffect } from "react";
import {
  Truck,
  DollarSign,
  Route,
  Fuel,
  Calculator,
  TrendingUp,
  Clock,
  Gauge,
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  RotateCcw,
  Bike,
  Package,
  Car,
  ShoppingBag,
  History,
  Trash2,
  Lock,
  X,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const WEAR_COST_PER_MILE = 0.3;
const AVG_SPEED_MPH = 25;
const WHOP_URL = "https://whop.com/routemax-pro-profit-vqsu-2/routemax-pro/";

type PresetKey = "doordash" | "amazonflex" | "ubereats" | "instacart" | "custom";

type Preset = {
  key: PresetKey;
  label: string;
  icon: typeof Bike;
  payout: string;
  mileage: string;
  gasPrice: string;
  mpg: string;
  accent: string;
  bg: string;
};

const PRESETS: Preset[] = [
  { key: "doordash", label: "DoorDash", icon: Bike, payout: "8", mileage: "10", gasPrice: "3.50", mpg: "22", accent: "text-red-400", bg: "bg-red-500/15 border-red-500/30" },
  { key: "amazonflex", label: "Amazon Flex", icon: Package, payout: "108", mileage: "80", gasPrice: "3.50", mpg: "22", accent: "text-sky-400", bg: "bg-sky-500/15 border-sky-500/30" },
  { key: "ubereats", label: "UberEats", icon: Car, payout: "12", mileage: "12", gasPrice: "3.50", mpg: "22", accent: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
  { key: "instacart", label: "Instacart", icon: ShoppingBag, payout: "18", mileage: "15", gasPrice: "3.50", mpg: "22", accent: "text-green-400", bg: "bg-green-500/15 border-green-500/30" },
];

type Results = {
  netProfit: number;
  fuelCost: number;
  wearCost: number;
  totalCost: number;
  hours: number;
  hourlyEarnings: number;
  payout: number;
  mileage: number;
  gasPrice: number;
  mpg: number;
  returnMileage: number;
  returnFuelCost: number;
  returnWearCost: number;
  returnCost: number;
  effectiveMileage: number;
};

type RouteHistoryRow = {
  id: string;
  payout: number;
  mileage: number;
  gas_price: number;
  mpg: number;
  fuel_cost: number;
  wear_cost: number;
  total_cost: number;
  net_profit: number;
  hours: number;
  hourly_earnings: number;
  created_at: string;
};

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatNumber(n: number, digits = 1): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function App() {
  const [payout, setPayout] = useState("");
  const [mileage, setMileage] = useState("");
  const [gasPrice, setGasPrice] = useState("");
  const [mpg, setMpg] = useState("22");
  const [activePreset, setActivePreset] = useState<PresetKey>("custom");
  const [returnTripEnabled, setReturnTripEnabled] = useState(false);
  const [returnMileage, setReturnMileage] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<RouteHistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auth + premium state
  const [session, setSession] = useState<Session | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const signedInEmail = session?.user?.email ?? null;

  const fetchHistory = async () => {
    if (!supabase) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from("route_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error && data) setHistory(data as RouteHistoryRow[]);
    } catch {
      // history is best-effort; never break the calculator
    }
    setHistoryLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      let { data } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", userId)
        .maybeSingle();
      if (!data) {
        // Profile row missing (older account) — create it, default not premium
        await supabase.from("profiles").insert({ id: userId });
        const retry = await supabase
          .from("profiles")
          .select("is_premium")
          .eq("id", userId)
          .maybeSingle();
        data = retry.data;
      }
      setIsPremium(data?.is_premium === true);
    } catch {
      setIsPremium(false);
    }
  };

  // Session init + auth state listener
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        fetchProfile(data.session.user.id);
        fetchHistory();
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
        fetchHistory();
      } else {
        setIsPremium(false);
        setHistory([]);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const deleteHistoryItem = async (id: string) => {
    if (!supabase) return;
    try {
      await supabase.from("route_history").delete().eq("id", id);
      setHistory((h) => h.filter((row) => row.id !== id));
    } catch {
      // ignore
    }
  };

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthError("");
    setAuthInfo("");
    setAuthOpen(true);
  };

  const handleAuth = async () => {
    if (!supabase) return;
    const email = authEmail.trim();
    if (!email || !authPassword) {
      setAuthError("Enter your email and password.");
      return;
    }
    setAuthBusy(true);
    setAuthError("");
    setAuthInfo("");
    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password: authPassword });
        if (error) throw error;
        if (!data.session) {
          // Email confirmation required — ask them to check inbox
          setAuthInfo("Account created! Check your email to confirm, then sign in.");
        } else {
          setAuthOpen(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: authPassword });
        if (error) throw error;
        setAuthOpen(false);
      }
      setAuthEmail("");
      setAuthPassword("");
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    }
    setAuthBusy(false);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.key);
    setPayout(preset.payout);
    setMileage(preset.mileage);
    setGasPrice(preset.gasPrice);
    setMpg(preset.mpg);
    setResults(null);
    setError("");
  };

  const handlePresetClick = (preset: Preset) => {
    if (activePreset === preset.key) {
      setActivePreset("custom");
    } else {
      applyPreset(preset);
    }
  };

  const clearPreset = () => {
    setActivePreset("custom");
  };

  const handleManualChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    if (activePreset !== "custom") {
      setActivePreset("custom");
    }
  };

  const handleCalculate = async () => {
    const payoutNum = parseFloat(payout);
    const mileageNum = parseFloat(mileage);
    const gasNum = parseFloat(gasPrice);
    const mpgNum = parseFloat(mpg);
    const returnNum = returnTripEnabled ? parseFloat(returnMileage) : 0;

    if (!payoutNum || payoutNum <= 0) {
      setError("Enter a valid order payout");
      setResults(null);
      return;
    }
    if (!mileageNum || mileageNum <= 0) {
      setError("Enter your total mileage");
      setResults(null);
      return;
    }
    if (!gasNum || gasNum <= 0) {
      setError("Enter the current gas price");
      setResults(null);
      return;
    }
    if (!mpgNum || mpgNum <= 0) {
      setError("Enter your vehicle's MPG");
      setResults(null);
      return;
    }
    if (returnTripEnabled && (!returnNum || returnNum <= 0)) {
      setError("Enter return trip mileage or disable the toggle");
      setResults(null);
      return;
    }

    setError("");

    const effectiveMileage = mileageNum + returnNum;
    const wearCost = mileageNum * WEAR_COST_PER_MILE;
    const fuelCost = (mileageNum / mpgNum) * gasNum;
    const returnWearCost = returnNum * WEAR_COST_PER_MILE;
    const returnFuelCost = (returnNum / mpgNum) * gasNum;
    const returnCost = returnWearCost + returnFuelCost;
    const totalCost = wearCost + fuelCost + returnCost;
    const netProfit = payoutNum - totalCost;
    const hours = effectiveMileage / AVG_SPEED_MPH;
    const hourlyEarnings = netProfit / hours;

    setResults({
      netProfit, fuelCost, wearCost, totalCost, hours, hourlyEarnings,
      payout: payoutNum, mileage: mileageNum, gasPrice: gasNum, mpg: mpgNum,
      returnMileage: returnNum, returnFuelCost, returnWearCost, returnCost,
      effectiveMileage,
    });

    // Auto-save to route history — premium feature only
    if (supabase && isPremium) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("route_history").insert({
            user_id: user.id,
            payout: payoutNum,
            mileage: mileageNum,
            gas_price: gasNum,
            mpg: mpgNum,
            fuel_cost: fuelCost + returnFuelCost,
            wear_cost: wearCost + returnWearCost,
            total_cost: totalCost,
            net_profit: netProfit,
            hours,
            hourly_earnings: hourlyEarnings,
          });
          fetchHistory();
        }
      } catch {
        // never block the calculator on a save failure
      }
    }
  };

  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      {/* Ambient gradient backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-72 h-72 sm:w-96 sm:h-96 bg-emerald-500/10 rounded-full blur-[100px] sm:blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-64 h-64 sm:w-80 sm:h-80 bg-teal-500/8 rounded-full blur-[80px] sm:blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 sm:w-72 sm:h-72 bg-cyan-500/6 rounded-full blur-[80px] sm:blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-20 sm:pb-32 safe-top safe-bottom">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 sm:mb-8 animate-fade-in">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-400 border-2 border-[#0a0a0f] flex items-center justify-center">
                <Zap className="w-2 h-2 text-[#0a0a0f]" strokeWidth={3} />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight leading-none truncate">
                RouteMax <span className="shimmer-text">Pro</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 font-medium mt-0.5">True Profit Calculator</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isSupabaseConfigured && (
              signedInEmail ? (
                <button
                  onClick={handleSignOut}
                  className="px-2.5 sm:px-3 py-1.5 rounded-full bg-zinc-800/60 border border-zinc-700/50 text-[10px] sm:text-[11px] font-semibold text-zinc-400 active:scale-95 transition-transform"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => openAuth("signin")}
                  className="px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] sm:text-[11px] font-semibold text-emerald-400 active:scale-95 transition-transform"
                >
                  Sign In
                </button>
              )
            )}
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-400">Free Tool</span>
            </div>
          </div>
        </header>

        {/* Hero tagline */}
        <div className="mb-5 sm:mb-6 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <h2 className="text-2xl sm:text-[28px] font-extrabold leading-[1.15] tracking-tight">
            Know your <span className="text-emerald-400">real</span> earnings
            <br />before you drive.
          </h2>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Stop guessing. Factor in fuel, wear &amp; tear, and time to see what every route is truly worth.
          </p>
        </div>

        {/* Platform Presets */}
        <div className="mb-4 sm:mb-5 animate-fade-in-up" style={{ animationDelay: "0.07s" }}>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Quick Presets</span>
            {activePreset !== "custom" && (
              <button
                onClick={clearPreset}
                className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((preset) => {
              const isActive = activePreset === preset.key;
              const Icon = preset.icon;
              return (
                <button
                  key={preset.key}
                  onClick={() => handlePresetClick(preset)}
                  className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl border transition-all active:scale-95 ${
                    isActive
                      ? preset.bg
                      : "glass border-transparent hover:border-zinc-700/50"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? preset.accent : "text-zinc-500"}`} strokeWidth={2.5} />
                  <span className={`text-[9px] sm:text-[10px] font-bold leading-none ${isActive ? preset.accent : "text-zinc-500"}`}>
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input card */}
        <div
          className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Payout */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
              Total Order Payout
            </label>
            <div className="glass-input rounded-xl sm:rounded-2xl flex items-center px-3 sm:px-4 py-3 sm:py-3.5">
              <span className="text-zinc-500 font-bold text-base sm:text-lg mr-1 flex-shrink-0">$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={payout}
                onChange={(e) => handleManualChange(setPayout, e.target.value)}
                className="flex-1 min-w-0 w-0 bg-transparent text-base sm:text-lg font-bold text-white placeholder-zinc-600 outline-none ml-1"
              />
            </div>
          </div>

          {/* Mileage */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
              <Route className="w-3.5 h-3.5 flex-shrink-0" />
              Estimated Total Mileage
            </label>
            <div className="glass-input rounded-xl sm:rounded-2xl flex items-center px-3 sm:px-4 py-3 sm:py-3.5">
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={mileage}
                onChange={(e) => handleManualChange(setMileage, e.target.value)}
                className="flex-1 min-w-0 w-0 bg-transparent text-base sm:text-lg font-bold text-white placeholder-zinc-600 outline-none"
              />
              <span className="text-zinc-500 font-semibold text-sm flex-shrink-0 pl-2">miles</span>
            </div>
          </div>

          {/* Gas Price */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
              <Fuel className="w-3.5 h-3.5 flex-shrink-0" />
              Local Gas Price
            </label>
            <div className="glass-input rounded-xl sm:rounded-2xl flex items-center px-3 sm:px-4 py-3 sm:py-3.5">
              <span className="text-zinc-500 font-bold text-base sm:text-lg mr-1 flex-shrink-0">$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                step="0.01"
                value={gasPrice}
                onChange={(e) => handleManualChange(setGasPrice, e.target.value)}
                className="flex-1 min-w-0 w-0 bg-transparent text-base sm:text-lg font-bold text-white placeholder-zinc-600 outline-none ml-1"
              />
              <span className="text-zinc-500 font-semibold text-sm flex-shrink-0 pl-2">/gal</span>
            </div>
          </div>

          {/* MPG */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
              <Gauge className="w-3.5 h-3.5 flex-shrink-0" />
              Vehicle Fuel Economy
            </label>
            <div className="glass-input rounded-xl sm:rounded-2xl flex items-center px-3 sm:px-4 py-3 sm:py-3.5">
              <input
                type="number"
                inputMode="decimal"
                placeholder="22"
                value={mpg}
                onChange={(e) => handleManualChange(setMpg, e.target.value)}
                className="flex-1 min-w-0 w-0 bg-transparent text-base sm:text-lg font-bold text-white placeholder-zinc-600 outline-none"
              />
              <span className="text-zinc-500 font-semibold text-sm flex-shrink-0 pl-2">mpg</span>
            </div>
          </div>

          {/* Unpaid Return Trip Toggle */}
          <div className="pt-1">
            <button
              onClick={() => setReturnTripEnabled((v) => !v)}
              className={`w-full flex items-center justify-between rounded-xl border transition-all px-4 py-3 ${
                returnTripEnabled
                  ? "bg-cyan-500/10 border-cyan-500/30"
                  : "glass-input border-zinc-800/60"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  returnTripEnabled ? "bg-cyan-500/15" : "bg-zinc-800/40"
                }`}>
                  <RotateCcw className={`w-4 h-4 ${returnTripEnabled ? "text-cyan-400" : "text-zinc-500"}`} strokeWidth={2.5} />
                </div>
                <div className="text-left min-w-0">
                  <div className={`text-sm font-bold ${returnTripEnabled ? "text-cyan-300" : "text-zinc-300"}`}>
                    Unpaid Return Trip
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Factor in deadhead miles back
                  </div>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full flex items-center transition-colors flex-shrink-0 ${
                returnTripEnabled ? "bg-cyan-500/40" : "bg-zinc-700"
              }`}>
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  returnTripEnabled ? "translate-x-[18px]" : "translate-x-0.5"
                }`} />
              </div>
            </button>

            {returnTripEnabled && (
              <div className="mt-3 animate-fade-in">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                  <RotateCcw className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" />
                  Return Trip Mileage
                </label>
                <div className="glass-input rounded-xl sm:rounded-2xl flex items-center px-3 sm:px-4 py-3 sm:py-3.5">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={returnMileage}
                    onChange={(e) => setReturnMileage(e.target.value)}
                    className="flex-1 min-w-0 w-0 bg-transparent text-base sm:text-lg font-bold text-white placeholder-zinc-600 outline-none"
                  />
                  <span className="text-zinc-500 font-semibold text-sm flex-shrink-0 pl-2">miles</span>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-400 font-medium bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 animate-fade-in">
              {error}
            </div>
          )}

          {/* Calculate button */}
          <button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-[#0a0a0f] font-bold text-base py-3.5 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-transform hover:shadow-emerald-500/40 hover:from-emerald-300 hover:to-teal-400"
          >
            <Calculator className="w-5 h-5" strokeWidth={2.5} />
            Calculate True Profit
          </button>
        </div>

        {/* Results */}
        {results && (
          <div ref={resultsRef} className="mt-5 sm:mt-6 space-y-4 animate-fade-in-up scroll-mt-4">
            {/* Net Profit — hero result */}
            <div className="relative glass rounded-2xl sm:rounded-3xl p-5 sm:p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 sm:w-32 sm:h-32 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    True Net Profit
                  </span>
                </div>
                <div
                  className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
                    results.netProfit >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {formatCurrency(results.netProfit)}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formatNumber(results.hours)} hrs total drive time</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-zinc-600" />
                  <div className="text-xs text-zinc-500">
                    {formatNumber(results.effectiveMileage, 0)} mi total
                  </div>
                </div>
              </div>
            </div>

            {/* Return trip breakdown (only if return mileage > 0) */}
            {results.returnMileage > 0 && (
              <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3 border border-cyan-500/15">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    Unpaid Return Trip Cost
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Fuel className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" />
                    <span className="text-xs text-zinc-500">Return Fuel</span>
                  </div>
                  <span className="text-sm font-bold text-amber-400 flex-shrink-0">
                    −{formatCurrency(results.returnFuelCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Gauge className="w-3.5 h-3.5 text-orange-400/70 flex-shrink-0" />
                    <span className="text-xs text-zinc-500">Return Wear</span>
                  </div>
                  <span className="text-sm font-bold text-orange-400 flex-shrink-0">
                    −{formatCurrency(results.returnWearCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-800/60">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-semibold text-cyan-400">Total Return Cost</span>
                  </div>
                  <span className="text-sm font-extrabold text-red-400 flex-shrink-0">
                    −{formatCurrency(results.returnCost)}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 leading-relaxed pt-1">
                  {formatNumber(results.returnMileage, 0)} unpaid miles added to your trip costs.
                </div>
              </div>
            )}

            {/* Hourly earnings */}
            <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-cyan-400" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Projected Hourly Earnings
                    </div>
                    <div
                      className={`text-xl sm:text-2xl font-extrabold mt-0.5 ${
                        results.hourlyEarnings >= 0 ? "text-white" : "text-red-400"
                      }`}
                    >
                      {formatCurrency(results.hourlyEarnings)}
                      <span className="text-sm font-medium text-zinc-500">/hr</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">
                    Avg Speed
                  </div>
                  <div className="text-sm font-bold text-zinc-400">{AVG_SPEED_MPH} mph</div>
                </div>
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Cost Breakdown
              </div>

              {/* Fuel cost */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <Fuel className="w-4.5 h-4.5 text-amber-400" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-200">Total Fuel Cost</div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {formatNumber(results.effectiveMileage, 0)} mi ÷ {formatNumber(results.mpg, 0)} mpg × gas
                    </div>
                  </div>
                </div>
                <div className="text-base sm:text-lg font-bold text-amber-400 flex-shrink-0">
                  {formatCurrency(results.fuelCost + results.returnFuelCost)}
                </div>
              </div>

              <div className="h-px bg-zinc-800/60" />

              {/* Wear & tear */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                    <Gauge className="w-4.5 h-4.5 text-orange-400" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-200">Vehicle Wear &amp; Tear</div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {formatCurrency(WEAR_COST_PER_MILE)} per mile standard rate
                    </div>
                  </div>
                </div>
                <div className="text-base sm:text-lg font-bold text-orange-400 flex-shrink-0">
                  {formatCurrency(results.wearCost + results.returnWearCost)}
                </div>
              </div>

              <div className="h-px bg-zinc-800/60" />

              {/* Total cost */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4.5 h-4.5 text-red-400" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-200">Total Trip Cost</div>
                    <div className="text-[11px] text-zinc-500 truncate">Fuel + wear &amp; tear{results.returnMileage > 0 ? " + return" : ""}</div>
                  </div>
                </div>
                <div className="text-base sm:text-lg font-bold text-red-400 flex-shrink-0">
                  −{formatCurrency(results.totalCost)}
                </div>
              </div>
            </div>

            {/* Profit verdict badge */}
            <div
              className={`rounded-2xl px-4 sm:px-5 py-4 flex items-center gap-3 ${
                results.netProfit >= 0
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  results.netProfit >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"
                }`}
              >
                {results.netProfit >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
                ) : (
                  <TrendingUp className="w-5 h-5 text-red-400 rotate-180" strokeWidth={2.5} />
                )}
              </div>
              <div className="min-w-0">
                <div
                  className={`text-sm font-bold ${
                    results.netProfit >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {results.netProfit >= 0 ? "Profitable Route" : "This Route Loses Money"}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {results.netProfit >= 0
                    ? `You keep ${formatCurrency(results.netProfit)} after all costs.`
                    : `You'd lose ${formatCurrency(Math.abs(results.netProfit))}. Consider declining.`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Route History — premium feature */}
        {isSupabaseConfigured && (
          <div className="mt-5 sm:mt-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Recent Routes
              </span>
              <div className="flex items-center gap-1.5">
                {isPremium && (
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Premium
                  </span>
                )}
                {historyLoading && (
                  <span className="text-[10px] text-zinc-600 font-medium">Loading…</span>
                )}
              </div>
            </div>

            {!signedInEmail ? (
              /* Not signed in — prompt to sign in */
              <div className="glass rounded-2xl p-5 text-center border border-amber-500/15">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-5 h-5 text-amber-400" strokeWidth={2.5} />
                </div>
                <p className="text-sm font-bold text-white">Route History is Premium</p>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Sign in to unlock your saved routes, tax tracking and earnings reports.
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openAuth("signin")}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-sm font-bold text-emerald-400 active:scale-[0.98] transition-transform"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuth("signup")}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-sm font-bold text-[#0a0a0f] active:scale-[0.98] transition-transform"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            ) : !isPremium ? (
              /* Signed in but not premium — upgrade prompt */
              <div className="glass rounded-2xl p-5 text-center border border-amber-500/15">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-5 h-5 text-amber-400" strokeWidth={2.5} />
                </div>
                <p className="text-sm font-bold text-white">Route History is Premium</p>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Upgrade to auto-save every route, export your tax mileage log and see earnings reports.
                </p>
                <a
                  href={WHOP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-sm font-extrabold text-[#0f0f16] active:scale-[0.98] transition-transform"
                >
                  Upgrade to Premium
                </a>
                <p className="text-[10px] text-zinc-600 mt-2.5">
                  Already paid? Make sure you signed in with your purchase email.
                </p>
              </div>
            ) : history.length === 0 && !historyLoading ? (
              <div className="glass rounded-2xl p-5 text-center">
                <History className="w-6 h-6 text-zinc-600 mx-auto mb-2" strokeWidth={2} />
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Routes you calculate are saved here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((row) => (
                  <div
                    key={row.id}
                    className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-extrabold ${
                          row.net_profit >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {formatCurrency(row.net_profit)}
                        <span className="text-[10px] font-medium text-zinc-500 ml-1.5">
                          net
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                        {formatShortDate(row.created_at)} · {formatCurrency(row.payout)} payout · {formatNumber(row.hourly_earnings)}/hr
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHistoryItem(row.id)}
                      aria-label="Delete route"
                      className="w-8 h-8 rounded-lg bg-zinc-800/40 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
                    >
                      <Trash2 className="w-4 h-4 text-zinc-600" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Premium upgrade button */}
        <div className="mt-6 sm:mt-8 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <a
            href={WHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
            <div className="relative bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-2xl p-[1.5px] active:scale-[0.98] transition-transform">
              <div className="bg-[#0f0f16] rounded-2xl px-4 sm:px-5 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-[#0f0f16]" strokeWidth={2.5} />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-sm font-extrabold text-white">
                      Upgrade to Premium
                    </div>
                    <div className="text-[11px] text-zinc-500 font-medium">
                      Unlock route history, tax tracking &amp; more
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </div>
            </div>
          </a>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-zinc-600 mt-6 leading-relaxed px-4">
          Estimates use a standard $0.30/mi wear cost and 25 mph average speed.
          Actual earnings may vary. RouteMax Pro is not financial advice.
        </p>
      </div>

      {/* Auth modal */}
      {authOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setAuthOpen(false)}
        >
          <div
            className="w-full sm:max-w-sm bg-[#101018] border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-extrabold text-white">
                {authMode === "signin" ? "Welcome back" : "Create your account"}
              </h3>
              <button
                onClick={() => setAuthOpen(false)}
                aria-label="Close"
                className="w-8 h-8 rounded-lg bg-zinc-800/60 flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              {authMode === "signin"
                ? "Sign in to access your premium route history."
                : "One account keeps your route history safe across devices."}
            </p>

            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 mb-4">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setAuthMode(m); setAuthError(""); setAuthInfo(""); }}
                  className={`py-2 rounded-lg text-sm font-bold transition-all ${
                    authMode === m
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "text-zinc-500 border border-transparent"
                  }`}
                >
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Email */}
            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
              Email
            </label>
            <div className="glass-input rounded-xl flex items-center px-4 py-3 mb-3">
              <input
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="you@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="flex-1 min-w-0 w-0 bg-transparent text-base font-semibold text-white placeholder-zinc-600 outline-none"
              />
            </div>

            {/* Password */}
            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
              Password
            </label>
            <div className="glass-input rounded-xl flex items-center px-4 py-3 mb-4">
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAuth(); }}
                className="flex-1 min-w-0 w-0 bg-transparent text-base font-semibold text-white placeholder-zinc-600 outline-none"
              />
            </div>

            {authError && (
              <div className="text-sm text-red-400 font-medium bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-3 animate-fade-in">
                {authError}
              </div>
            )}
            {authInfo && (
              <div className="text-sm text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 mb-3 animate-fade-in">
                {authInfo}
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={authBusy}
              className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-[#0a0a0f] font-bold text-base py-3.5 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {authBusy ? "Please wait…" : authMode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

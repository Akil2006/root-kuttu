import { useLocation, useNavigate } from "react-router-dom";
import {
  Sprout, Droplets, FlaskConical, CloudRain, ArrowLeft,
  CheckCircle2, RefreshCw, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

interface FormData {
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  ph: string;
  location: string;
  season: string;
}

const getCropResult = (data: FormData) => {
  const n = parseFloat(data.nitrogen) || 0;
  const season = data.season;
  const cropMap: Record<string, { name: string; emoji: string; yield: string }> = {
    kharif: n < 40 ? { name: "Rice", emoji: "🌾", yield: "4.5 tons/hectare" } : n < 80 ? { name: "Maize", emoji: "🌽", yield: "3.8 tons/hectare" } : { name: "Cotton", emoji: "🏵️", yield: "2.5 tons/hectare" },
    rabi: n < 40 ? { name: "Wheat", emoji: "🌾", yield: "3.2 tons/hectare" } : n < 80 ? { name: "Mustard", emoji: "🌿", yield: "1.8 tons/hectare" } : { name: "Chickpea", emoji: "🫘", yield: "2.0 tons/hectare" },
    zaid: n < 40 ? { name: "Watermelon", emoji: "🍉", yield: "25 tons/hectare" } : n < 80 ? { name: "Cucumber", emoji: "🥒", yield: "15 tons/hectare" } : { name: "Moong", emoji: "🌱", yield: "1.2 tons/hectare" },
  };
  return cropMap[season] || { name: "Rice", emoji: "🌾", yield: "4.5 tons/hectare" };
};

const getIrrigation = (season: string) => {
  const map: Record<string, { amount: string; frequency: string; method: string; tip: string }> = {
    kharif: { amount: "3–4 liters/sq meter", frequency: "Every 3–4 days", method: "Drip irrigation", tip: "Increase water during flowering" },
    rabi: { amount: "3–4 liters/sq meter", frequency: "Every 5–7 days", method: "Sprinkler system", tip: "Increase water during flowering" },
    zaid: { amount: "4–5 liters/sq meter", frequency: "Every 2–3 days", method: "Drip irrigation", tip: "Increase water during fruiting" },
  };
  return map[season] || map.kharif;
};

const getFertilizer = (data: FormData) => {
  const n = parseFloat(data.nitrogen) || 0;
  const p = parseFloat(data.phosphorus) || 0;
  return {
    npk: n < 50 ? "NPK 10-26-26" : "NPK 20-20-20",
    quantity: "50 kg per acre",
    timing: "Apply at sowing",
    nStatus: n < 50 ? `Add Urea (46-0-0) — your N is low (${data.nitrogen} kg/ha)` : `Nitrogen level is adequate ✅ (${data.nitrogen} kg/ha)`,
    pStatus: p < 30 ? `Add SSP — your P is low (${data.phosphorus} kg/ha)` : `Phosphorus level is good ✅ (${data.phosphorus} kg/ha)`,
  };
};

const getWeather = (season: string) => {
  const map: Record<string, { season: string; badge: string; temp: string; risk: string }> = {
    kharif: { season: "Monsoon Season", badge: "🌧️ Rainy", temp: "28–35°C", risk: "Heavy rain may cause waterlogging" },
    rabi: { season: "Winter Season", badge: "❄️ Cool", temp: "10–25°C", risk: "Frost risk in early morning" },
    zaid: { season: "Summer Season", badge: "☀️ Hot", temp: "35–45°C", risk: "Heat stress possible during afternoon" },
  };
  return map[season] || map.kharif;
};

const Results = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const data = (state as FormData) || {
    nitrogen: "50", phosphorus: "40", potassium: "45",
    ph: "6.5", location: "Your Area", season: "kharif",
  };

  const ph = parseFloat(data.ph) || 7;
  const seasonLabel = data.season.charAt(0).toUpperCase() + data.season.slice(1);
  const crop = getCropResult(data);
  const irrigation = getIrrigation(data.season);
  const fertilizer = getFertilizer(data);
  const weather = getWeather(data.season);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl py-6 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Home
          </button>
          <Button variant="outline" size="sm" className="rounded-full text-xs gap-1" onClick={() => navigate("/input")}>
            <RefreshCw className="h-3 w-3" /> New Input
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold">Your Farm Recommendations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Based on your soil data for <strong>{data.location || "your area"}</strong> in <strong>{seasonLabel}</strong> season
          </p>
        </div>

        <div className="space-y-4">
          {/* Recommended Crop */}
          <div className="bg-card rounded-xl p-6 shadow-sm border animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Sprout className="h-5 w-5 text-primary" /></div>
              <h2 className="text-lg font-bold">🌾 Recommended Crop</h2>
            </div>
            <div className="bg-muted/40 rounded-lg p-4 mb-4 flex items-center gap-4">
              <span className="text-5xl">{crop.emoji}</span>
              <div><p className="text-2xl font-extrabold">{crop.name}</p><p className="text-sm text-muted-foreground">Best match for your soil</p></div>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed">
              <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Season: <strong>{seasonLabel}</strong></span></li>
              <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Expected yield: <strong>{crop.yield}</strong></span></li>
            </ul>
          </div>

          {/* Irrigation */}
          <div className="bg-card rounded-xl p-6 shadow-sm border animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Droplets className="h-5 w-5 text-primary" /></div>
              <h2 className="text-lg font-bold">💧 Irrigation Advice</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "💧 Amount", value: irrigation.amount },
                { label: "📅 Frequency", value: irrigation.frequency },
                { label: "🌸 Tip", value: irrigation.tip },
                { label: "🌿 Method", value: irrigation.method },
              ].map((item, i) => (
                <div key={i} className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                  <p className="font-bold text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fertilizer */}
          <div className="bg-card rounded-xl p-6 shadow-sm border animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><FlaskConical className="h-5 w-5 text-primary" /></div>
              <h2 className="text-lg font-bold">🧪 Fertilizer Guide</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-muted/40 rounded-lg p-3 text-center"><p className="text-xs text-muted-foreground mb-0.5">Formula</p><p className="font-bold text-sm">{fertilizer.npk}</p></div>
              <div className="bg-muted/40 rounded-lg p-3 text-center"><p className="text-xs text-muted-foreground mb-0.5">Quantity</p><p className="font-bold text-sm">{fertilizer.quantity}</p></div>
              <div className="bg-muted/40 rounded-lg p-3 text-center"><p className="text-xs text-muted-foreground mb-0.5">Timing</p><p className="font-bold text-sm">{fertilizer.timing}</p></div>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed">
              <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>{fertilizer.nStatus}</span></li>
              <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>{fertilizer.pStatus}</span></li>
              <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>pH Level: <strong>{data.ph}</strong> — {ph < 6 ? "Too acidic, add lime" : ph > 8 ? "Too alkaline, add gypsum" : "Optimal range ✅"}</span></li>
            </ul>
          </div>

          {/* Weather */}
          <div className="bg-card rounded-xl p-6 shadow-sm border animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><CloudRain className="h-5 w-5 text-primary" /></div>
                <h2 className="text-lg font-bold">🌦️ Weather & Risk Alerts</h2>
              </div>
              <span className="text-xs bg-muted px-3 py-1 rounded-full font-medium">{weather.badge}</span>
            </div>
            <div className="bg-muted/40 rounded-lg p-4">
              <p className="font-bold text-sm mb-1">{weather.season}</p>
              <p className="text-sm text-muted-foreground">🌡️ Temperature: <strong>{weather.temp}</strong></p>
              <p className="text-sm text-muted-foreground mt-1">⚠️ {weather.risk}</p>
            </div>
          </div>

          {/* Soil Summary */}
          <div className="bg-card rounded-xl p-6 shadow-sm border animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-primary" /></div>
              <h2 className="text-lg font-bold">📊 Your Soil Data Summary</h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Nitrogen (N)", value: data.nitrogen, unit: "kg/ha" },
                { label: "Phosphorus (P)", value: data.phosphorus, unit: "kg/ha" },
                { label: "Potassium (K)", value: data.potassium, unit: "kg/ha" },
                { label: "pH Level", value: data.ph, unit: "" },
              ].map((s, i) => (
                <div key={i} className="bg-muted/40 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-xl font-extrabold text-primary">{s.value || "—"}</p>
                  {s.unit && <p className="text-[10px] text-muted-foreground">{s.unit}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button size="lg" className="text-base py-6 px-8 font-bold rounded-full gap-2" onClick={() => navigate("/input")}>
            <Sprout className="h-5 w-5" /> Get New Recommendation
          </Button>
        </div>

        <footer className="text-center py-6 mt-4">
          <p className="text-xs text-muted-foreground">Made for Farmers, with ❤️</p>
        </footer>
      </div>
    </div>
  );
};

export default Results;

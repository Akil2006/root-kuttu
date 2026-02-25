import { useNavigate } from "react-router-dom";
import {
  Sprout, Droplets, ArrowLeft,
  AlertTriangle, Clock, Leaf, Bug, FlaskConical
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const FarmPulse = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-5xl py-6 px-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        <div className="text-center mb-6">
          <div className="icon-circle icon-circle-green mx-auto mb-3"><Sprout className="h-7 w-7" /></div>
          <h1 className="text-2xl font-extrabold">Farm Pulse</h1>
          <p className="text-muted-foreground text-sm mt-1">Your real-time farm dashboard — soil, crop & irrigation insights</p>
        </div>

        <div className="bg-accent/15 border border-accent/30 rounded-lg px-4 py-3 flex items-center gap-3 mb-6 animate-fade-up">
          <AlertTriangle className="h-5 w-5 text-accent shrink-0" />
          <p className="text-sm font-medium">🔥 Heat wave warning for next week — protect crops with mulching</p>
        </div>

        <h2 className="text-lg font-bold mb-3">📋 Today's Advisory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {[
            { icon: Droplets, circle: "icon-circle-blue", title: "Water Today", badge: "NOW", badgeColor: "text-info bg-info/10", desc: "Soil moisture is low. Irrigate your wheat field this evening." },
            { icon: Clock, circle: "icon-circle-orange", title: "Delay Sowing", badge: "WAIT", badgeColor: "text-warning bg-warning/10", desc: "Heavy rain expected in 3 days. Wait before sowing rice." },
            { icon: Bug, circle: "icon-circle-red", title: "High Pest Risk", badge: "ALERT", badgeColor: "text-destructive bg-destructive/10", desc: "Aphid infestation likely in mustard crops. Apply neem spray." },
            { icon: FlaskConical, circle: "icon-circle-green", title: "Apply Fertilizer", badge: "DO", badgeColor: "text-success bg-success/10", desc: "Nitrogen level is low. Apply 50kg Urea per acre." },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-lg p-4 shadow-sm border flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={`icon-circle ${item.circle} shrink-0`} style={{ width: 40, height: 40 }}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm">{item.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Soil Health */}
          <div className="bg-card rounded-xl p-5 shadow-sm border animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-base font-bold mb-3">🌱 Soil Health</h2>
            <div className="space-y-4">
              {[
                { label: "Soil Moisture", value: "38%", pct: 38, color: "bg-info" },
                { label: "Soil Temp", value: "28°C", pct: 56, color: "bg-warning" },
                { label: "Nitrogen", value: "45kg/ha", pct: 45, color: "bg-success" },
                { label: "Phosphorus", value: "32kg/ha", pct: 32, color: "bg-icon-green" },
                { label: "Potassium", value: "58kg/ha", pct: 58, color: "bg-accent" },
                { label: "pH Level", value: "6.5", pct: 65, color: "bg-info" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-bold">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crop Health */}
          <div className="bg-card rounded-xl p-5 shadow-sm border animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-base font-bold mb-1">🌾 Crop Health</h2>
            <p className="text-[10px] text-muted-foreground mb-3">NDVI Index</p>
            <div className="space-y-4">
              {[
                { name: "Wheat", ndvi: 0.78, status: "Healthy", statusColor: "text-success" },
                { name: "Rice", ndvi: 0.52, status: "Moderate", statusColor: "text-warning" },
                { name: "Mustard", ndvi: 0.35, status: "Stressed", statusColor: "text-destructive" },
              ].map((crop, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-extrabold text-primary">{crop.ndvi}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{crop.name}</p>
                    <p className={`text-xs font-semibold ${crop.statusColor}`}>{crop.status}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <h3 className="text-base font-bold mb-3">💧 Irrigation</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-info" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Next Watering</p>
                    <p className="text-sm font-bold">Today, 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <Droplets className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Recommended</p>
                    <p className="text-sm font-bold">2,500 liters/acre</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl p-5 shadow-sm border animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-base font-bold mb-3">💡 Smart Farm Tips</h2>
            <ul className="space-y-3 text-sm">
              {[
                "Apply mulch around crops to reduce water evaporation by 30%",
                "Rotate crops each season to maintain soil nutrients naturally",
                "Use neem oil spray weekly to prevent common pest infestations",
                "Install drip irrigation to save up to 60% water vs flood irrigation",
                "Test soil pH every 3 months for optimal crop growth",
              ].map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <Leaf className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-sm border animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-base font-bold mb-3">📅 Seasonal Calendar</h2>
            <div className="space-y-3">
              {[
                { season: "Kharif (Jun–Oct)", crops: "Rice, Maize, Cotton, Sugarcane", active: true },
                { season: "Rabi (Nov–Mar)", crops: "Wheat, Mustard, Chickpea, Barley", active: false },
                { season: "Zaid (Mar–Jun)", crops: "Watermelon, Cucumber, Moong", active: false },
              ].map((s, i) => (
                <div key={i} className={`rounded-lg p-3 border ${s.active ? "bg-primary/5 border-primary/20" : "bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm">{s.season}</p>
                    {s.active && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">CURRENT</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{s.crops}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-bold mb-2">📊 Market Prices (per quintal)</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { crop: "🌾 Wheat", price: "₹2,275" },
                  { crop: "🌾 Rice", price: "₹2,183" },
                  { crop: "🌽 Maize", price: "₹2,090" },
                ].map((m, i) => (
                  <div key={i} className="bg-muted/40 rounded-lg p-2 text-center">
                    <p className="text-xs">{m.crop}</p>
                    <p className="font-bold text-sm text-primary">{m.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <Button size="lg" className="text-base py-6 px-8 font-bold rounded-full gap-2" onClick={() => navigate("/input")}>
            <Sprout className="h-5 w-5" /> Get Personalized Advice
          </Button>
        </div>

        <footer className="text-center py-6 mt-4">
          <p className="text-xs text-muted-foreground">Smart Farm Advisor — Your personal farming assistant 🌿</p>
        </footer>
      </div>
    </div>
  );
};

export default FarmPulse;

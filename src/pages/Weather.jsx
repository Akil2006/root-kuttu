import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, CloudRain, Sun, Cloud, CloudSnow, CloudLightning,
  Droplets, Wind, Thermometer, Gauge, Sunrise, Sunset,
  AlertTriangle, Info, AlertCircle, Send, CheckCircle2, Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const getWeatherInfo = (code) => {
  if (code === 0) return { label: "Clear Sky", icon: Sun, emoji: "☀️" };
  if (code <= 3) return { label: "Partly Cloudy", icon: Cloud, emoji: "⛅" };
  if (code <= 48) return { label: "Foggy", icon: Gauge, emoji: "🌫️" };
  if (code <= 57) return { label: "Drizzle", icon: CloudRain, emoji: "🌦️" };
  if (code <= 67) return { label: "Rain", icon: CloudRain, emoji: "🌧️" };
  if (code <= 77) return { label: "Snow", icon: CloudSnow, emoji: "❄️" };
  if (code <= 82) return { label: "Rain Showers", icon: CloudRain, emoji: "🌧️" };
  if (code <= 86) return { label: "Snow Showers", icon: CloudSnow, emoji: "🌨️" };
  return { label: "Thunderstorm", icon: CloudLightning, emoji: "⛈️" };
};

const Weather = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [current, setCurrent] = useState(null);
  const [daily, setDaily] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("Detecting location...");
  const [alerts, setAlerts] = useState([]);
  const [alertEmail, setAlertEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (user?.email) setAlertEmail(user.email);
  }, [user]);

  const handleSendAlert = async () => {
    const trimmed = alertEmail.trim();
    if (!trimmed || !trimmed.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!current) {
      toast.error("Weather data not loaded yet. Please wait.");
      return;
    }

    setSendingEmail(true);
    setEmailSent(false);

    try {
      const payload = {
        to_email: trimmed,
        to_name: user?.user_metadata?.full_name || "Farmer",
        location: locationName,
        alerts: alerts,
        current_temp: Math.round(current.temperature),
        rain_chance: daily.length > 1 ? daily[1].precipProb : 0,
        wind_speed: current.windSpeed,
        precipitation: current.precipitation,
        tomorrow_max: daily.length > 1 ? Math.round(daily[1].maxTemp) : 0,
        tomorrow_min: daily.length > 1 ? Math.round(daily[1].minTemp) : 0,
        tomorrow_rain_prob: daily.length > 1 ? daily[1].precipProb : 0,
      };

      const res = await fetch("http://localhost:5000/api/send-weather-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send alert");
      }

      setEmailSent(true);
      toast.success(`✅ Weather alert delivered to ${trimmed}`);
    } catch (err) {
      console.error("Send alert error:", err);
      toast.error(`Failed to send: ${err.message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure,is_day` +
          `&hourly=temperature_2m,weather_code,precipitation` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,sunrise,sunset,precipitation_probability_max` +
          `&timezone=auto&forecast_days=7`
        );
        const data = await res.json();

        const c = {
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code,
          apparentTemp: data.current.apparent_temperature,
          precipitation: data.current.precipitation,
          pressure: data.current.surface_pressure,
          isDay: data.current.is_day,
        };
        setCurrent(c);

        const dailyData = data.daily.time.map((d, i) => ({
          date: d,
          maxTemp: data.daily.temperature_2m_max[i],
          minTemp: data.daily.temperature_2m_min[i],
          weatherCode: data.daily.weather_code[i],
          precipSum: data.daily.precipitation_sum[i],
          windMax: data.daily.wind_speed_10m_max[i],
          sunrise: data.daily.sunrise[i],
          sunset: data.daily.sunset[i],
          precipProb: data.daily.precipitation_probability_max[i],
        }));
        setDaily(dailyData);

        const now = new Date();
        setHourly(
          data.hourly.time
            .map((t, i) => ({
              time: t,
              temp: data.hourly.temperature_2m[i],
              weatherCode: data.hourly.weather_code[i],
              precipitation: data.hourly.precipitation[i],
            }))
            .filter((h) => new Date(h.time) >= now)
            .slice(0, 24)
        );

        const newAlerts = [];
        if (dailyData.length > 1) {
          const tm = dailyData[1];
          newAlerts.push({ type: "info", emoji: "📅", title: "Tomorrow's Forecast", message: `High ${Math.round(tm.maxTemp)}°C / Low ${Math.round(tm.minTemp)}°C · Rain chance: ${tm.precipProb}%` });
          if (tm.precipSum > 5 || tm.precipProb > 60 || c.precipitation > 5)
            newAlerts.push({ type: "warning", emoji: "🌧️", title: "Heavy Rain Alert", message: "Heavy rain expected. Protect your crops and avoid field work." });
          if (tm.maxTemp > 38 || c.temperature > 38)
            newAlerts.push({ type: "danger", emoji: "🔥", title: "Heatwave Alert", message: `Extreme heat (${Math.round(c.temperature)}°C). Irrigate crops early morning or evening.` });
          if (tm.windMax > 50 || c.windSpeed > 40)
            newAlerts.push({ type: "warning", emoji: "💨", title: "Strong Wind Alert", message: "High winds! Do not spray pesticides. Secure farm equipment." });
        }
        if (c.weatherCode >= 95)
          newAlerts.push({ type: "danger", emoji: "⛈️", title: "Thunderstorm Warning", message: "Active thunderstorm! Stay indoors. Do not work in open fields." });

        setAlerts(newAlerts);
      } catch (err) {
        console.error("Weather fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setLocationName(`${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E`); fetchWeather(pos.coords.latitude, pos.coords.longitude); },
        () => { 
          setLocationName("New Delhi, India (default)"); 
          toast.info("Location access denied. Showing weather for New Delhi.");
          fetchWeather(28.61, 77.23); 
        }
      );
    } else { 
      setLocationName("New Delhi, India (default)"); 
      fetchWeather(28.61, 77.23); 
    }
  }, []);

  const dayName = (d) => { 
    const dt = new Date(d); 
    return dt.toDateString() === new Date().toDateString() ? "Today" : dt.toLocaleDateString("en", { weekday: "short" }); 
  };
  const formatHr = (t) => new Date(t).toLocaleTimeString("en", { hour: "numeric", hour12: true });
  const formatTime = (t) => new Date(t).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: true });

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <CloudRain className="h-12 w-12 text-primary animate-bounce" />
        <p className="text-muted-foreground font-semibold">Fetching live weather data...</p>
      </div>
    </div>
  );

  if (!current) return null;

  const weatherInfo = getWeatherInfo(current.weatherCode);
  const extremeCount = alerts.filter(a => a.type !== "info").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-5xl py-6 px-4">

        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="icon-circle icon-circle-red mx-auto mb-3"><CloudRain className="h-7 w-7" /></div>
          <h1 className="text-2xl font-extrabold">Live Weather</h1>
          <p className="text-muted-foreground text-sm mt-1">📍 {locationName}</p>
        </div>

        {/* ═══ EMAIL ALERT PANEL ═══ */}
        <div className={`rounded-2xl p-5 mb-6 border-2 shadow-md transition-all ${extremeCount > 0 ? "bg-red-50 border-red-300" : "bg-emerald-50 border-emerald-200"}`}>
          <div className="flex items-center gap-2 mb-1">
            {extremeCount > 0 ? <AlertCircle className="h-5 w-5 text-red-600" /> : <Send className="h-5 w-5 text-emerald-600" />}
            <h2 className="font-bold text-base text-gray-800">
              {extremeCount > 0 ? `🚨 ${extremeCount} Extreme Alert${extremeCount > 1 ? "s" : ""}! Send Warning Email` : "📨 Send Weather Alert Email"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Enter your email below and click <strong>Send Alert</strong> — a full weather report will be delivered directly to your inbox.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="weather-alert-email"
              type="email"
              placeholder="Enter email address..."
              value={alertEmail}
              onChange={e => { setAlertEmail(e.target.value); setEmailSent(false); }}
              onKeyDown={e => e.key === "Enter" && handleSendAlert()}
              className="flex-1 bg-white border-gray-300 text-sm"
            />
            <Button
              id="send-weather-alert-btn"
              onClick={handleSendAlert}
              disabled={sendingEmail || !alertEmail.trim()}
              className={`flex items-center gap-2 px-6 shrink-0 text-white font-semibold ${extremeCount > 0 ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
            >
              {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : emailSent ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              {sendingEmail ? "Sending..." : emailSent ? "Sent" : "Send Alert"}
            </Button>
          </div>

          {/* Extreme alert tags */}
          {extremeCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {alerts.filter(a => a.type !== "info").map((a, i) => (
                <span key={i} className={`text-[11px] font-bold px-2 py-1 rounded-full ${a.type === "danger" ? "bg-red-200 text-red-800" : "bg-orange-200 text-orange-800"}`}>
                  {a.emoji} {a.title}
                </span>
              ))}
            </div>
          )}

          {/* Success message */}
          {emailSent && (
            <div className="mt-3 text-xs text-green-700 bg-green-100 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Weather alert successfully sent to <strong>{alertEmail}</strong>! Check your inbox. 📬
            </div>
          )}
        </div>

        {/* Alert Banners */}
        {alerts.length > 0 && (
          <div className="space-y-3 mb-6 animate-fade-down">
            {alerts.map((alert, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border-2 shadow-sm
                ${alert.type === "danger" ? "bg-red-50 border-red-300" : alert.type === "warning" ? "bg-orange-50 border-orange-300" : "bg-blue-50 border-blue-200"}`}>
                <span className="text-2xl">{alert.emoji}</span>
                <div className="flex-1">
                  <h3 className={`font-bold text-sm ${alert.type === "danger" ? "text-red-700" : alert.type === "warning" ? "text-orange-700" : "text-blue-700"}`}>{alert.title}</h3>
                  <p className="text-xs mt-0.5 text-muted-foreground">{alert.message}</p>
                </div>
                {alert.type === "danger" && <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
                {alert.type === "warning" && <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />}
                {alert.type === "info" && <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />}
              </div>
            ))}
          </div>
        )}

        {/* Current Conditions */}
        <div className="bg-card rounded-xl p-6 shadow-sm border mb-6 animate-fade-up">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-6xl">{weatherInfo.emoji}</span>
              <div>
                <p className="text-5xl font-extrabold">{Math.round(current.temperature)}°C</p>
                <p className="text-muted-foreground font-semibold">{weatherInfo.label}</p>
                <p className="text-xs text-muted-foreground">Feels like {Math.round(current.apparentTemp)}°C</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              {[
                { icon: Droplets, label: "Humidity", value: `${current.humidity}%`, color: "text-blue-500" },
                { icon: Wind, label: "Wind", value: `${current.windSpeed} km/h`, color: "text-teal-500" },
                { icon: CloudRain, label: "Precipitation", value: `${current.precipitation} mm`, color: "text-purple-500" },
                { icon: Gauge, label: "Pressure", value: `${Math.round(current.pressure)} hPa`, color: "text-orange-500" },
              ].map((item, i) => (
                <div key={i} className="bg-muted/40 rounded-lg p-3 text-center">
                  <item.icon className={`h-5 w-5 mx-auto mb-1 ${item.color}`} />
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  <p className="font-bold text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hourly */}
        <div className="bg-card rounded-xl p-5 shadow-sm border mb-6">
          <h2 className="text-base font-bold mb-3">⏰ Next 24 Hours</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {hourly.map((h, i) => {
              const info = getWeatherInfo(h.weatherCode);
              return (
                <div key={i} className="flex flex-col items-center min-w-[60px] bg-muted/30 rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground">{formatHr(h.time)}</p>
                  <span className="text-lg my-1">{info.emoji}</span>
                  <p className="text-xs font-bold">{Math.round(h.temp)}°</p>
                  {h.precipitation > 0 && <p className="text-[10px] text-blue-500">{h.precipitation}mm</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day */}
        <div className="bg-card rounded-xl p-5 shadow-sm border mb-6">
          <h2 className="text-base font-bold mb-3">📅 7-Day Forecast</h2>
          <div className="space-y-2">
            {daily.map((d, i) => {
              const info = getWeatherInfo(d.weatherCode);
              return (
                <div key={i} className="flex items-center justify-between bg-muted/20 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3 w-24"><span className="text-lg">{info.emoji}</span><p className="font-bold text-sm">{dayName(d.date)}</p></div>
                  <p className="text-xs text-muted-foreground hidden md:block">{info.label}</p>
                  <div className="flex items-center gap-2">
                    {d.precipSum > 0 && <span className="text-[10px] text-blue-500 flex items-center gap-1"><Droplets className="h-3 w-3" />{d.precipSum}mm</span>}
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Wind className="h-3 w-3" />{Math.round(d.windMax)}km/h</span>
                  </div>
                  <div className="text-right"><span className="font-bold text-sm">{Math.round(d.maxTemp)}°</span><span className="text-muted-foreground text-xs"> / {Math.round(d.minTemp)}°</span></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Farmer Tips */}
        <div className="bg-card rounded-xl p-5 shadow-sm border mb-6">
          <h2 className="text-base font-bold mb-3">🌾 Weather Tips for Farmers</h2>
          <ul className="space-y-2 text-sm">
            {current.temperature > 35 && <li className="flex gap-2 text-muted-foreground"><Thermometer className="h-4 w-4 text-destructive shrink-0 mt-0.5" />🔥 High temperature! Irrigate crops early morning or evening.</li>}
            {current.humidity > 70 && <li className="flex gap-2 text-muted-foreground"><Droplets className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />💧 High humidity — watch for fungal diseases.</li>}
            {current.windSpeed > 20 && <li className="flex gap-2 text-muted-foreground"><Wind className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />💨 Strong winds — avoid spraying pesticides today.</li>}
            {current.precipitation > 0 && <li className="flex gap-2 text-muted-foreground"><CloudRain className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />🌧️ Rain detected — skip irrigation today.</li>}
            {daily.length > 1 && daily[1].precipProb > 50 && <li className="flex gap-2 text-muted-foreground"><CloudRain className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />🌧️ High rain chance tomorrow ({daily[1].precipProb}%) — postpone irrigation.</li>}
            <li className="flex gap-2 text-muted-foreground"><Sun className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />Check 7-day forecast before sowing or harvesting.</li>
          </ul>
        </div>

        <footer className="text-center py-6 mt-4">
          <p className="text-xs text-muted-foreground">Weather by Open-Meteo 🌍</p>
        </footer>
      </div>
    </div>
  );
};

export default Weather;

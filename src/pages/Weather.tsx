import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, CloudRain, Sun, Cloud, CloudSnow, CloudLightning,
  Droplets, Wind, Thermometer, Gauge, Sunrise, Sunset,
  AlertTriangle, Info, AlertCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";

interface WeatherData {
  temperature: number; humidity: number; windSpeed: number; weatherCode: number;
  apparentTemp: number; precipitation: number; pressure: number; visibility: number; uvIndex: number; isDay: number;
}
interface DailyForecast {
  date: string; maxTemp: number; minTemp: number; weatherCode: number;
  precipSum: number; windMax: number; sunrise: string; sunset: string;
  precipProb: number;
}
interface HourlyForecast { time: string; temp: number; weatherCode: number; precipitation: number; }

interface WeatherAlert {
  type: "warning" | "info" | "danger";
  title: string;
  message: string;
}

const getWeatherInfo = (code: number) => {
  if (code === 0) return { label: "Clear Sky", icon: Sun, emoji: "☀️" };
  if (code <= 3) return { label: "Partly Cloudy", icon: Cloud, emoji: "⛅" };
  if (code <= 48) return { label: "Foggy", icon: Cloud, emoji: "🌫️" };
  if (code <= 57) return { label: "Drizzle", icon: CloudRain, emoji: "🌦️" };
  if (code <= 67) return { label: "Rain", icon: CloudRain, emoji: "🌧️" };
  if (code <= 77) return { label: "Snow", icon: CloudSnow, emoji: "❄️" };
  if (code <= 82) return { label: "Rain Showers", icon: CloudRain, emoji: "🌧️" };
  if (code <= 86) return { label: "Snow Showers", icon: CloudSnow, emoji: "🌨️" };
  return { label: "Thunderstorm", icon: CloudLightning, emoji: "⛈️" };
};

const Weather = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState<WeatherData | null>(null);
  const [daily, setDaily] = useState<DailyForecast[]>([]);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("Your Location");
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure,is_day&hourly=temperature_2m,weather_code,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,sunrise,sunset,precipitation_probability_max&timezone=auto&forecast_days=7`
        );
        const data = await res.json();

        const currentData: WeatherData = {
          temperature: data.current.temperature_2m, humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m, weatherCode: data.current.weather_code,
          apparentTemp: data.current.apparent_temperature, precipitation: data.current.precipitation,
          pressure: data.current.surface_pressure, visibility: 10, uvIndex: 5, isDay: data.current.is_day,
        };
        setCurrent(currentData);

        const dailyData: DailyForecast[] = data.daily.time.map((d: string, i: number) => ({
          date: d, maxTemp: data.daily.temperature_2m_max[i], minTemp: data.daily.temperature_2m_min[i],
          weatherCode: data.daily.weather_code[i], precipSum: data.daily.precipitation_sum[i],
          windMax: data.daily.wind_speed_10m_max[i], sunrise: data.daily.sunrise[i], sunset: data.daily.sunset[i],
          precipProb: data.daily.precipitation_probability_max[i],
        }));
        setDaily(dailyData);

        const now = new Date();
        setHourly(data.hourly.time.map((t: string, i: number) => ({
          time: t, temp: data.hourly.temperature_2m[i], weatherCode: data.hourly.weather_code[i], precipitation: data.hourly.precipitation[i],
        })).filter((h: HourlyForecast) => new Date(h.time) >= now).slice(0, 24));

        // Generate Alerts
        const newAlerts: WeatherAlert[] = [];

        // 1. Tomorrow's Forecast Alert
        if (dailyData.length > 1) {
          const tomorrow = dailyData[1];
          newAlerts.push({
            type: "info",
            title: "Tomorrow's Forecast",
            message: `Rain probability: ${tomorrow.precipProb}%, Temperature: ${Math.round(tomorrow.maxTemp)}°C`,
          });

          // 2. Extreme Rain Alert
          if (tomorrow.precipSum > 5 || tomorrow.precipProb > 60) {
            newAlerts.push({
              type: "warning",
              title: "Heavy Rain Expected",
              message: "Heavy rain expected tomorrow morning – avoid irrigation today.",
            });
          }

          // 3. Heatwave Alert
          if (tomorrow.maxTemp > 38) {
            newAlerts.push({
              type: "danger",
              title: "Heatwave Alert",
              message: "Extreme heat expected! Ensure proper hydration for yourself and crops.",
            });
          }
        }

        // 4. Current Extreme Weather
        if (currentData.temperature > 40) {
          newAlerts.push({
            type: "danger",
            title: "Extreme Heat",
            message: "Local heatwave active. Avoid outdoor work during peak hours.",
          });
        }

        setAlerts(newAlerts);

      } catch (err) { console.error("Weather fetch failed:", err); } finally { setLoading(false); }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocationName(`Lat ${pos.coords.latitude.toFixed(2)}, Lon ${pos.coords.longitude.toFixed(2)}`); fetchWeather(pos.coords.latitude, pos.coords.longitude); },
        () => { setLocationName("New Delhi, India"); fetchWeather(28.61, 77.23); }
      );
    } else { setLocationName("New Delhi, India"); fetchWeather(28.61, 77.23); }
  }, []);

  const dayName = (dateStr: string) => { const d = new Date(dateStr); const today = new Date(); if (d.toDateString() === today.toDateString()) return "Today"; return d.toLocaleDateString("en", { weekday: "short" }); };
  const formatHour = (timeStr: string) => new Date(timeStr).toLocaleTimeString("en", { hour: "numeric", hour12: true });
  const formatTime = (timeStr: string) => new Date(timeStr).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: true });

  if (loading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="flex items-center justify-center py-32"><div className="text-center">
        <CloudRain className="h-12 w-12 text-primary mx-auto mb-4 animate-bounce" />
        <p className="text-muted-foreground font-semibold">Fetching live weather data...</p>
      </div></div>
    </div>
  );

  if (!current) return null;
  const weatherInfo = getWeatherInfo(current.weatherCode);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-5xl py-6 px-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        <div className="text-center mb-6">
          <div className="icon-circle icon-circle-red mx-auto mb-3"><CloudRain className="h-7 w-7" /></div>
          <h1 className="text-2xl font-extrabold">Live Weather</h1>
          <p className="text-muted-foreground text-sm mt-1">📍 {locationName}</p>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="space-y-3 mb-6 animate-fade-down">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 shadow-sm ${alert.type === "danger" ? "bg-destructive/10 border-destructive animate-pulse-subtle" :
                  alert.type === "warning" ? "bg-warning/10 border-warning" :
                    "bg-info/10 border-info"
                  }`}
              >
                <div className="mt-0.5">
                  {alert.type === "danger" && <AlertCircle className="h-5 w-5 text-destructive" />}
                  {alert.type === "warning" && <AlertTriangle className="h-5 w-5 text-warning" />}
                  {alert.type === "info" && <Info className="h-5 w-5 text-info" />}
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${alert.type === "danger" ? "text-destructive" :
                    alert.type === "warning" ? "text-warning-foreground" :
                      "text-info-foreground"
                    }`}>
                    {alert.title}
                  </h3>
                  <p className="text-xs mt-0.5 text-muted-foreground leading-relaxed font-medium">
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current */}
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
                { icon: Droplets, label: "Humidity", value: `${current.humidity}%`, color: "text-info" },
                { icon: Wind, label: "Wind", value: `${current.windSpeed} km/h`, color: "text-icon-teal" },
                { icon: CloudRain, label: "Precipitation", value: `${current.precipitation} mm`, color: "text-icon-purple" },
                { icon: Gauge, label: "Pressure", value: `${Math.round(current.pressure)} hPa`, color: "text-icon-purple" },
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

        {/* Sunrise/Sunset */}
        {daily.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="bg-card rounded-xl p-4 shadow-sm border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-icon-orange/10 flex items-center justify-center"><Sunrise className="h-5 w-5 text-icon-orange" /></div>
              <div><p className="text-xs text-muted-foreground">Sunrise</p><p className="font-bold text-sm">{formatTime(daily[0].sunrise)}</p></div>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-sm border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-icon-purple/10 flex items-center justify-center"><Sunset className="h-5 w-5 text-icon-purple" /></div>
              <div><p className="text-xs text-muted-foreground">Sunset</p><p className="font-bold text-sm">{formatTime(daily[0].sunset)}</p></div>
            </div>
          </div>
        )}

        {/* Hourly */}
        <div className="bg-card rounded-xl p-5 shadow-sm border mb-6 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-base font-bold mb-3">⏰ Next 24 Hours</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {hourly.map((h, i) => {
              const info = getWeatherInfo(h.weatherCode);
              return (
                <div key={i} className="flex flex-col items-center min-w-[60px] bg-muted/30 rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground">{formatHour(h.time)}</p>
                  <span className="text-lg my-1">{info.emoji}</span>
                  <p className="text-xs font-bold">{Math.round(h.temp)}°</p>
                  {h.precipitation > 0 && <p className="text-[10px] text-info">{h.precipitation}mm</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day */}
        <div className="bg-card rounded-xl p-5 shadow-sm border mb-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-base font-bold mb-3">📅 7-Day Forecast</h2>
          <div className="space-y-2">
            {daily.map((d, i) => {
              const info = getWeatherInfo(d.weatherCode);
              return (
                <div key={i} className="flex items-center justify-between bg-muted/20 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3 w-24"><span className="text-lg">{info.emoji}</span><p className="font-bold text-sm">{dayName(d.date)}</p></div>
                  <p className="text-xs text-muted-foreground hidden md:block">{info.label}</p>
                  <div className="flex items-center gap-2">
                    {d.precipSum > 0 && <span className="text-[10px] text-info flex items-center gap-1"><Droplets className="h-3 w-3" />{d.precipSum}mm</span>}
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Wind className="h-3 w-3" />{Math.round(d.windMax)}km/h</span>
                  </div>
                  <div className="text-right"><span className="font-bold text-sm">{Math.round(d.maxTemp)}°</span><span className="text-muted-foreground text-xs"> / {Math.round(d.minTemp)}°</span></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-card rounded-xl p-5 shadow-sm border animate-fade-up" style={{ animationDelay: "0.25s" }}>
          <h2 className="text-base font-bold mb-3">🌾 Weather Tips for Farmers</h2>
          <ul className="space-y-2 text-sm">
            {current.temperature > 35 && <li className="flex gap-2 text-muted-foreground"><Thermometer className="h-4 w-4 text-destructive shrink-0 mt-0.5" />🔥 High temperature! Irrigate crops in early morning or evening.</li>}
            {current.humidity > 70 && <li className="flex gap-2 text-muted-foreground"><Droplets className="h-4 w-4 text-info shrink-0 mt-0.5" />💧 High humidity — watch for fungal diseases.</li>}
            {current.windSpeed > 20 && <li className="flex gap-2 text-muted-foreground"><Wind className="h-4 w-4 text-icon-teal shrink-0 mt-0.5" />💨 Strong winds — avoid spraying pesticides today.</li>}
            {current.precipitation > 0 && <li className="flex gap-2 text-muted-foreground"><CloudRain className="h-4 w-4 text-icon-purple shrink-0 mt-0.5" />🌧️ Rain detected — skip irrigation today.</li>}
            {daily.length > 1 && daily[1].precipProb > 50 && <li className="flex gap-2 text-muted-foreground"><CloudRain className="h-4 w-4 text-info shrink-0 mt-0.5" />🌧️ High chance of rain tomorrow ({daily[1].precipProb}%) — consider postponing irrigation.</li>}
            <li className="flex gap-2 text-muted-foreground"><Sun className="h-4 w-4 text-warning shrink-0 mt-0.5" />Check the 7-day forecast before sowing or harvesting.</li>
          </ul>
        </div>

        <footer className="text-center py-6 mt-4"><p className="text-xs text-muted-foreground">Weather data powered by Open-Meteo 🌍</p></footer>
      </div>
    </div>
  );
};

export default Weather;

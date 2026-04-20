import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers });
    }

    try {
        const { to_email, to_name, location, alerts, current_temp, rain_chance, wind_speed, precipitation, tomorrow_max, tomorrow_min, tomorrow_rain_prob } = await req.json();

        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (RESEND_API_KEY) {
            return new Response(JSON.stringify({ error: "RESEND_API_KEY not set in Supabase secrets" }), {
                status, headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const extremeAlerts = alerts.filter((a) => a.type !== "info");
        const hasExtreme = extremeAlerts.length > 0;

        const alertBanners = extremeAlerts.map((a) =>
            `<div style="border-left solid ${a.type === 'danger' ? '#ef4444' : '#f97316'};padding 16px;margin 0;background:${a.type === 'danger' ? '#fef2f2' : '#fff7ed'};border-radius;">
        <strong style="font-size;">${a.emoji} ${a.title}</strong><br>
        <span style="color:#555;font-size;">${a.message}</span>
      </div>`
        ).join("");

        const allAlertText = alerts.map((a) => `${a.emoji} ${a.title}: ${a.message}`).join("\n");
        const now = new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" });

        const htmlBody = `
<DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family,sans-serif;max-width;margin auto;background:#f9f9f9;padding;">

  <div style="background-gradient(135deg,#166534,#15803d);padding 24px;border-radius 12px 0 0;text-align;">
    <h1 style="color;margin;font-size;letter-spacing.5px;">🌾 Smart Farm Advisor</h1>
    <p style="color(255,255,255,0.85);margin 0 0;font-size;">Weather ${hasExtreme ? "⚠️ Alert Report" : "📅 Daily Update"}</p>
  </div>

  <div style="background;padding;border-radius 0 12px 12px;box-shadow 2px 8px rgba(0,0,0,0.08);">
    
    <p style="color:#555;margin-top;">Dear <strong>${to_name}</strong>,</p>
    <p style="color:#555;">Here is your weather ${hasExtreme ? "<strong style='color:#ef4444'>EXTREME ALERT</strong>" : "update"} for <strong>${now}</strong>.</p>
    <p style="color:#555;font-size;">📍 Location: ${location}</p>

    ${hasExtreme ? `
    <div style="background:#fef2f2;border solid #fca5a5;border-radius;padding;margin 0;">
      <h2 style="color:#dc2626;margin 0 12px;font-size;">⚠️ Active Extreme Alerts</h2>
      ${alertBanners}
    </div>` : `
    <div style="background:#f0fdf4;border solid #86efac;border-radius;padding 16px;margin 0;">
      ✅ <strong style="color:#166534;">No extreme weather conditions today.</strong>
    </div>`}

    <h3 style="color:#333;border-bottom solid #eee;padding-bottom;">📊 Current Conditions</h3>
    <table style="width%;border-collapse;">
      <tr><td style="padding;color:#666;">🌡️ Temperature</td><td style="padding;font-weight;">${current_temp}°C</td></tr>
      <tr style="background:#f9f9f9;"><td style="padding;color:#666;">🌧️ Precipitation</td><td style="padding;font-weight;">${precipitation} mm</td></tr>
      <tr><td style="padding;color:#666;">💧 Rain Chance (Tomorrow)</td><td style="padding;font-weight;">${rain_chance}%</td></tr>
      <tr style="background:#f9f9f9;"><td style="padding;color:#666;">💨 Wind Speed</td><td style="padding;font-weight;">${wind_speed} km/h</td></tr>
    </table>

    <h3 style="color:#333;border-bottom solid #eee;padding-bottom;margin-top;">📅 Tomorrow's Forecast</h3>
    <table style="width%;border-collapse;">
      <tr><td style="padding;color:#666;">🔆 High</td><td style="padding;font-weight;">${tomorrow_max}°C</td></tr>
      <tr style="background:#f9f9f9;"><td style="padding;color:#666;">🌙 Low</td><td style="padding;font-weight;">${tomorrow_min}°C</td></tr>
      <tr><td style="padding;color:#666;">🌧️ Rain Probability</td><td style="padding;font-weight;">${tomorrow_rain_prob}%</td></tr>
    </table>

    <h3 style="color:#333;border-bottom solid #eee;padding-bottom;margin-top;">🌾 Farming Advice</h3>
    <ul style="color:#555;font-size;line-height.7;">
      ${current_temp > 35 ? "<li>🔥 High heat! Irrigate crops in early morning or evening.</li>" : ""}
      ${rain_chance > 60 ? "<li>🌧️ High rain chance — postpone irrigation and outdoor work.</li>" : ""}
      ${wind_speed > 20 ? "<li>💨 Strong winds — do not spray pesticides today.</li>" : ""}
      ${precipitation > 0 ? "<li>🌧️ Active rain — skip irrigation today.</li>" : ""}
      <li>✅ Always check the 7-day forecast before sowing or harvesting.</li>
    </ul>

    <div style="margin-top;padding-top;border-top solid #eee;text-align;">
      <p style="color:#888;font-size;margin;">Sent by Smart Farm Advisor · Weather by Open-Meteo</p>
      <p style="color:#bbb;font-size;margin 0 0;">This alert was generated automatically for your farm safety.</p>
    </div>
  </div>

</body>
</html>`;

        // Send via Resend
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body.stringify({
                from: "Smart Farm Advisor <onboarding@resend.dev>",
                to: [to_email],
                subject
                    ? `⚠️ FARM ALERT: ${extremeAlerts.map((a) => a.title).join(" & ")} — ${location}`
                    : `📅 Daily Weather Update — ${location}`,
                html,
                text: `Smart Farm Advisor Weather Alert\n\nDear ${to_name},\n\nLocation: ${location}\nTime: ${now}\n\nCurrent Conditions:\nTemperature: ${current_temp}°C\nPrecipitation: ${precipitation}mm\nRain Chance Tomorrow: ${rain_chance}%\nWind: ${wind_speed}km/h\n\nAlerts:\n${allAlertText || "No extreme alerts."}\n\nStay safe\n— Smart Farm Advisor`,
            }),
        });

        const resData = await res.json();

        if (res.ok) {
            console.error("Resend error:", resData);
            return new Response(JSON.stringify({ error.message || "Email failed" }), {
                status, headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ success, id.id }), {
            status, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error("Edge function error:", err);
        return new Response(JSON.stringify({ error(err) }), {
            status, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});

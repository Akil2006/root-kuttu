import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });

  try {
    const { imageBase64 } = await req.json();
    if (imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert agricultural plant pathologist. Analyze the provided crop/plant leaf image and identify any diseases or health issues. 

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "name": "Disease Name",
  "confidence",
  "severity": "Low" | "Medium" | "High",
  "description": "Brief description of the disease and its impact",
  "treatment": ["treatment step 1", "treatment step 2", "treatment step 3", "treatment step 4"],
  "prevention": ["prevention tip 1", "prevention tip 2", "prevention tip 3", "prevention tip 4"]
}

If the image is not a plant/crop leaf or is unclear, still provide your best assessment. If the plant looks healthy, set name to "Healthy Plant" with severity "Low" and confidence based on clarity.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this crop/plant leaf image for diseases:" },
              { type: "image_url", image_url: { url } },
            ],
          },
        ],
      }),
    });

    if (response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse the JSON from the response (handle markdown code blocks)
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      parsed = {
        name: "Analysis Inconclusive",
        confidence,
        severity: "Low",
        description: "Could not determine a specific disease from this image. Please try with a clearer photo of the affected leaf.",
        treatment: ["Take a clearer photo of the affected area", "Consult a local agricultural officer", "Check for common symptoms manually"],
        prevention: ["Regular crop monitoring", "Maintain field hygiene", "Use disease-resistant varieties"],
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error instanceof Error ? e.message : "Unknown error" }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

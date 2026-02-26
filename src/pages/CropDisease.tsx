import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Upload, Leaf, AlertTriangle, Shield, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DiseaseResult {
  name: string;
  confidence: number;
  severity: "Low" | "Medium" | "High";
  description: string;
  treatment: string[];
  prevention: string[];
}

const CropDisease = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-crop-disease", {
        body: { imageBase64: imagePreview },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      toast.error(err.message || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const severityColor = (s: string) => {
    if (s === "Low") return "text-success bg-success/10";
    if (s === "Medium") return "text-warning bg-warning/10";
    return "text-destructive bg-destructive/10";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl py-6 px-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        <div className="text-center mb-6">
          <div className="icon-circle icon-circle-purple mx-auto mb-3"><Camera className="h-7 w-7" /></div>
          <h1 className="text-2xl font-extrabold">Crop Disease Detection</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload a photo of your crop leaf — AI will identify diseases and suggest treatment</p>
        </div>

        {/* Upload Area */}
        <div className="bg-card rounded-xl shadow-sm border p-6 mb-6 animate-fade-up">
          <input type="file" ref={fileInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

          {!imagePreview ? (
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Upload Crop Photo</h3>
              <p className="text-sm text-muted-foreground mb-4">Take a photo or upload an image of the affected leaf</p>
              <Button variant="outline" className="rounded-full gap-2"><Camera className="h-4 w-4" /> Choose Photo</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden">
                <img src={imagePreview} alt="Crop" className="w-full max-h-80 object-cover rounded-xl" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-full gap-2" onClick={() => { setImagePreview(null); setResult(null); }}>
                  <Upload className="h-4 w-4" /> Change Photo
                </Button>
                <Button className="flex-1 rounded-full gap-2 font-bold" onClick={analyzeImage} disabled={analyzing}>
                  {analyzing ? (<><Leaf className="h-4 w-4 animate-spin" /> Analyzing with AI...</>) : (<><Leaf className="h-4 w-4" /> Analyze Disease</>)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-4 animate-fade-up">
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">🔬 {result.name}</h2>
                    <p className="text-xs text-muted-foreground">AI Confidence: {result.confidence}%</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${severityColor(result.severity)}`}>{result.severity} Severity</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.description}</p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Sprout className="h-5 w-5 text-primary" /></div>
                <h2 className="text-lg font-bold">💊 Recommended Treatment</h2>
              </div>
              <ul className="space-y-2">
                {result.treatment.map((t, i) => (
                  <li key={i} className="flex gap-2 text-sm"><span className="text-primary font-bold">•</span><span className="text-muted-foreground leading-relaxed">{t}</span></li>
                ))}
              </ul>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center"><Shield className="h-5 w-5 text-success" /></div>
                <h2 className="text-lg font-bold">🛡️ Prevention Tips</h2>
              </div>
              <ul className="space-y-2">
                {result.prevention.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm"><span className="text-success font-bold">•</span><span className="text-muted-foreground leading-relaxed">{p}</span></li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <footer className="text-center py-6 mt-4">
          <p className="text-xs text-muted-foreground">🔬 Disease detection powered by AI analysis</p>
        </footer>
      </div>
    </div>
  );
};

export default CropDisease;

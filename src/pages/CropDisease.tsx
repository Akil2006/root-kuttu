import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Upload, Leaf, AlertTriangle, Shield, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

interface DiseaseResult {
  name: string;
  confidence: number;
  severity: "Low" | "Medium" | "High";
  description: string;
  treatment: string[];
  prevention: string[];
}

const diseaseDatabase: Record<string, DiseaseResult> = {
  default: {
    name: "Leaf Blight",
    confidence: 87,
    severity: "Medium",
    description: "Leaf blight is a common fungal disease that causes brown, irregular lesions on leaves. It spreads quickly in warm, humid conditions.",
    treatment: [
      "Apply Mancozeb (2.5g/L water) spray every 7 days",
      "Remove and destroy infected leaves immediately",
      "Apply copper-based fungicide as preventive measure",
      "Ensure proper spacing between plants for air circulation",
    ],
    prevention: [
      "Use disease-resistant seed varieties",
      "Practice crop rotation every season",
      "Avoid overhead irrigation — use drip instead",
      "Keep field clean and weed-free",
      "Apply neem oil spray weekly as preventive",
    ],
  },
  yellow: {
    name: "Yellow Mosaic Virus",
    confidence: 92,
    severity: "High",
    description: "Yellow mosaic virus causes yellow patches on leaves, reducing photosynthesis and crop yield significantly. Spread by whiteflies.",
    treatment: [
      "Remove and burn infected plants immediately",
      "Control whitefly population with insecticides",
      "Apply Imidacloprid (0.3ml/L) spray",
      "Use yellow sticky traps to monitor whiteflies",
    ],
    prevention: [
      "Plant virus-resistant varieties",
      "Use insect-proof nets in nurseries",
      "Control weed hosts near the field",
      "Early sowing to avoid peak whitefly season",
    ],
  },
  brown: {
    name: "Brown Spot Disease",
    confidence: 84,
    severity: "Medium",
    description: "Brown spot is a fungal disease causing circular brown lesions with yellow halos on leaves. Common in rice and wheat crops.",
    treatment: [
      "Spray Tricyclazole (0.6g/L) at first symptom",
      "Apply potash fertilizer to strengthen plants",
      "Remove lower infected leaves",
      "Maintain adequate soil nutrition",
    ],
    prevention: [
      "Balanced fertilizer application (avoid excess nitrogen)",
      "Use certified, treated seeds",
      "Ensure proper drainage in fields",
      "Maintain optimal plant spacing",
    ],
  },
};

const CropDisease = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    // Simulated analysis — picks a random disease
    setTimeout(() => {
      const keys = Object.keys(diseaseDatabase);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      setResult(diseaseDatabase[randomKey]);
      setAnalyzing(false);
    }, 2000);
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
          <div className="icon-circle icon-circle-purple mx-auto mb-3">
            <Camera className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold">Crop Disease Detection</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload a photo of your crop leaf to identify diseases and get treatment advice</p>
        </div>

        {/* Upload Area */}
        <div className="bg-card rounded-xl shadow-sm border p-6 mb-6 animate-fade-up">
          <input type="file" ref={fileInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

          {!imagePreview ? (
            <div
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Upload Crop Photo</h3>
              <p className="text-sm text-muted-foreground mb-4">Take a photo or upload an image of the affected leaf</p>
              <Button variant="outline" className="rounded-full gap-2">
                <Camera className="h-4 w-4" /> Choose Photo
              </Button>
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
                  {analyzing ? (
                    <><Leaf className="h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Leaf className="h-4 w-4" /> Analyze Disease</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-4 animate-fade-up">
            {/* Disease Card */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">🔬 {result.name}</h2>
                    <p className="text-xs text-muted-foreground">Confidence: {result.confidence}%</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${severityColor(result.severity)}`}>
                  {result.severity} Severity
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.description}</p>
            </div>

            {/* Treatment */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sprout className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">💊 Recommended Treatment</h2>
              </div>
              <ul className="space-y-2">
                {result.treatment.map((t, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-primary font-bold">•</span>
                    <span className="text-muted-foreground leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prevention */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-success" />
                </div>
                <h2 className="text-lg font-bold">🛡️ Prevention Tips</h2>
              </div>
              <ul className="space-y-2">
                {result.prevention.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-success font-bold">•</span>
                    <span className="text-muted-foreground leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <footer className="text-center py-6 mt-4">
          <p className="text-xs text-muted-foreground">🔬 Disease detection powered by smart analysis</p>
        </footer>
      </div>
    </div>
  );
};

export default CropDisease;

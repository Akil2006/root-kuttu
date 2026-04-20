import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Sprout, Beaker, Atom, CircleDot, MapPin, CalendarDays, ArrowRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";

const fields = [
  { id: "nitrogen", label: "Nitrogen (N) Value", tip: "Amount of nitrogen in your soil. Get this from a soil test report. Normal: 20-80.", placeholder: "Enter nitrogen value (0-100)", icon: Beaker, circle: "icon-circle-green" },
  { id: "phosphorus", label: "Phosphorus (P) Value", tip: "Amount of phosphorus in soil. Helps roots and flowers grow. Normal: 10-60.", placeholder: "Enter phosphorus value (0-100)", icon: Atom, circle: "icon-circle-orange" },
  { id: "potassium", label: "Potassium (K) Value", tip: "Amount of potassium. Helps crop resist disease. Normal: 20-80.", placeholder: "Enter potassium value (0-100)", icon: Sprout, circle: "icon-circle-blue" },
  { id: "ph", label: "Soil pH Value", tip: "How acidic or alkaline your soil is. Normal range is 5.5 to 7.5.", placeholder: "Enter pH value (0-14)", icon: CircleDot, circle: "icon-circle-teal" },
];

const FarmerInput = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nitrogen: "", phosphorus: "", potassium: "", ph: "", location: "", season: "" });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Save data directly to MongoDB backend
      await fetch("http://localhost:5000/api/soil-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
    } catch (err) {
      console.error("Failed to save to database:", err);
    } finally {
      setSaving(false);
      navigate("/results", { state: form });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-xl py-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="icon-circle icon-circle-green mx-auto mb-3">
              <ClipboardList className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold">Enter Your Soil Details</h1>
            <p className="text-muted-foreground text-sm mt-1">Tell us about your soil and we'll help you grow better crops</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map(f => (
              <div key={f.id}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${f.circle}`}>
                    <f.icon className="h-4 w-4" />
                  </div>
                  <Label htmlFor={f.id} className="text-sm font-bold">{f.label}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[240px] text-sm">{f.tip}</TooltipContent>
                  </Tooltip>
                </div>
                <Input id={f.id} type="number" step="any" placeholder={f.placeholder} className="text-sm py-5 bg-background" value={form[f.id]} onChange={e => update(f.id, e.target.value)} required />
              </div>
            ))}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center icon-circle-red">
                  <MapPin className="h-4 w-4" />
                </div>
                <Label htmlFor="location" className="text-sm font-bold">Location (City/District)</Label>
              </div>
              <Input id="location" placeholder="Enter your city or district" className="text-sm py-5 bg-background" value={form.location} onChange={e => update("location", e.target.value)} required />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center icon-circle-purple">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <Label className="text-sm font-bold">Growing Season</Label>
              </div>
              <Select value={form.season} onValueChange={v => update("season", v)} required>
                <SelectTrigger className="text-sm py-5 bg-background">
                  <SelectValue placeholder="Select growing season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kharif">🌧️ Kharif (June – October)</SelectItem>
                  <SelectItem value="rabi">❄️ Rabi (November – March)</SelectItem>
                  <SelectItem value="zaid">☀️ Zaid (March – June)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" size="lg" className="w-full text-base py-6 font-bold rounded-full mt-4 gap-2">
              Get My Recommendation <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FarmerInput;

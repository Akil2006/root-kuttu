import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sprout, Mail, Lock, User, ArrowRight, Eye, EyeOff, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", location: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    if (registeredUsers.includes(form.email)) {
      toast.error("This email is already registered. Please login instead.");
      return;
    }
    registeredUsers.push(form.email);
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
    toast.success("Account created! Please login to continue 🌾");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="bg-primary text-primary-foreground flex flex-col items-center justify-center p-8 md:w-1/2">
        <Sprout className="h-16 w-16 mb-4 animate-float" />
        <h1 className="text-3xl font-extrabold text-center">Join Smart<br />Farming Today! 🌱</h1>
        <p className="mt-3 text-center opacity-90 max-w-xs text-sm">
          Create your free account and start getting personalized farming advice based on your soil and weather.
        </p>
        <div className="flex gap-6 mt-8 text-4xl">
          <span>🌾</span><span>💧</span><span>☀️</span><span>🌿</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-extrabold mb-1">🌱 Create Account</h2>
          <p className="text-muted-foreground text-sm mb-6">Start your smart farming journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-bold flex items-center gap-2 mb-1.5">
                <User className="h-4 w-4 text-muted-foreground" /> Full Name
              </Label>
              <Input placeholder="Enter your name" className="py-5 bg-background" value={form.name} onChange={e => update("name", e.target.value)} required />
            </div>
            <div>
              <Label className="text-sm font-bold flex items-center gap-2 mb-1.5">
                <MapPin className="h-4 w-4 text-muted-foreground" /> Village / District
              </Label>
              <Input placeholder="Enter your location" className="py-5 bg-background" value={form.location} onChange={e => update("location", e.target.value)} required />
            </div>
            <div>
              <Label className="text-sm font-bold flex items-center gap-2 mb-1.5">
                <Mail className="h-4 w-4 text-muted-foreground" /> Email
              </Label>
              <Input type="email" placeholder="farmer@example.com" className="py-5 bg-background" value={form.email} onChange={e => update("email", e.target.value)} required />
            </div>
            <div>
              <Label className="text-sm font-bold flex items-center gap-2 mb-1.5">
                <Lock className="h-4 w-4 text-muted-foreground" /> Password
              </Label>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} placeholder="Create a password" className="py-5 pr-10 bg-background" value={form.password} onChange={e => update("password", e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full py-6 font-bold rounded-full text-base gap-2">
              Create Account <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">Login 🔐</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

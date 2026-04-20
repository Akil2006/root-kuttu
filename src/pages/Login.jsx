import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sprout, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Welcome back, farmer! 🌾");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="bg-primary text-primary-foreground flex flex-col items-center justify-center p-8 md:w-1/2">
        <Sprout className="h-16 w-16 mb-4 animate-float" />
        <h1 className="text-3xl font-extrabold text-center">Welcome Back,<br />Farmer! 🌾</h1>
        <p className="mt-3 text-center opacity-90 max-w-xs text-sm">
          Login to access your personalized crop recommendations and smart farming tools.
        </p>
        <div className="flex gap-6 mt-8 text-4xl">
          <span>🌱</span><span>🌧️</span><span>🧪</span><span>🌾</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-extrabold mb-1">🔐 Login</h2>
          <p className="text-muted-foreground text-sm mb-6">Enter your details to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-bold flex items-center gap-2 mb-1.5">
                <Mail className="h-4 w-4 text-muted-foreground" /> Email
              </Label>
              <Input id="email" type="email" placeholder="farmer@example.com" className="py-5 bg-background" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-bold flex items-center gap-2 mb-1.5">
                <Lock className="h-4 w-4 text-muted-foreground" /> Password
              </Label>
              <div className="relative">
                <Input id="password" type={showPw ? "text" : "password"} placeholder="Enter your password" className="py-5 pr-10 bg-background" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full py-6 font-bold rounded-full text-base gap-2" disabled={loading}>
              {loading ? "Logging in..." : "Login"} <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-bold hover:underline">Sign Up 🌱</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

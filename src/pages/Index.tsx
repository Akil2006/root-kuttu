import { useNavigate } from "react-router-dom";
import { Sprout, Droplets, FlaskConical, CloudRain, ArrowRight, Camera, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const allCards = [
  {
    icon: Sprout,
    circle: "icon-circle-green",
    title: "Low Crop Yield",
    desc: "Not getting enough harvest from your land? Get expert advice on the right crop.",
    link: "/advisory/low-yield",
  },
  {
    icon: Droplets,
    circle: "icon-circle-blue",
    title: "Water Wastage",
    desc: "Using too much or too little water? Learn the perfect irrigation schedule.",
    link: "/advisory/water-wastage",
  },
  {
    icon: FlaskConical,
    circle: "icon-circle-orange",
    title: "High Fertilizer Cost",
    desc: "Spending too much on fertilizers? Know exactly what your soil needs.",
    link: "/advisory/fertilizer-cost",
  },
  {
    icon: CloudRain,
    circle: "icon-circle-red",
    title: "Weather Uncertainty",
    desc: "Worried about rain or drought? Get early weather alerts for your area.",
    link: "/weather",
  },
  {
    icon: Sprout,
    circle: "icon-circle-green",
    title: "Farm Pulse",
    desc: "Know which crop will grow best in your soil and season.",
    link: "/farm-pulse",
  },
  {
    icon: Camera,
    circle: "icon-circle-purple",
    title: "Crop Disease Check",
    desc: "Upload a photo of your crop and get instant disease diagnosis.",
    link: "/crop-disease",
  },
  {
    icon: Users,
    circle: "icon-circle-teal",
    title: "Community Forum",
    desc: "Connect with fellow farmers, share tips and ask questions.",
    link: "/community",
  },
  {
    icon: Wallet,
    circle: "icon-circle-orange",
    title: "Expense Tracker",
    desc: "Track your farm costs and calculate your profit/loss.",
    link: "/expenses",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="text-center py-12 px-4">
        <div className="icon-circle icon-circle-green mx-auto mb-4 animate-float">
          <Sprout className="h-8 w-8" />
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
          Smart Farming Advice for<br />Every Farmer
        </h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-base md:text-lg">
          Tell us about your soil and get personalized crop, water,
          and fertilizer guidance — all in simple language.
        </p>
      </section>

      {/* Problem Cards */}
      <section className="container max-w-4xl pb-12">
        <h2 className="text-xl font-bold text-center mb-2">
          🌾 Common Farmer Problems
        </h2>
        <p className="text-center text-muted-foreground text-sm mb-8">
          We understand your challenges. Our system helps you solve these:
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allCards.map((p, i) => (
            <div
              key={i}
              className={`bg-card rounded-lg p-5 text-center shadow-sm border hover:shadow-md transition-shadow animate-fade-up ${p.link ? "cursor-pointer" : ""}`}
              style={{ animationDelay: `${i * 0.08}s` }}
              onClick={() => p.link && navigate(p.link)}
            >
              <div className={`icon-circle ${p.circle} mx-auto mb-3`}>
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm mb-1">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container max-w-2xl pb-16">
        <div className="bg-card rounded-xl p-8 text-center shadow-sm border">
          <h3 className="text-xl font-bold mb-2">🚀 Ready to Improve Your Farming?</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Just answer a few simple questions about your soil and we'll give you expert advice.
          </p>
          <Button
            size="lg"
            className="text-base px-8 py-6 font-bold rounded-full shadow-lg gap-2"
            onClick={() => navigate("/input")}
          >
            Get Smart Farming Advice <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto text-center py-6 border-t">
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <Sprout className="h-4 w-4" />
          <span className="font-semibold">Smart Farm Advisor</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Helping farmers make data-driven decisions for better yields. 🇮🇳
        </p>
      </footer>
    </div>
  );
};

export default Index;

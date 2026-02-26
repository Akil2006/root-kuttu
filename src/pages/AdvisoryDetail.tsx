import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Sprout, Droplets, FlaskConical, AlertCircle, Info, Target,
    Calendar, ClipboardCheck, Beaker, Recycle, CloudRain, Check
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface SubOption {
    label: string;
    answer: string;
}

interface AdvisorySection {
    id: string;
    title: string;
    icon: any;
    content: string;
    subOptions?: SubOption[];
}

const advisoryContent = {
    "low-yield": {
        title: "Low Crop Yield",
        subtitle: "Expert tips to maximize your harvest",
        icon: Sprout,
        circle: "icon-circle-green",
        description: "How to Improve Yield",
        stats: [
            { label: "Avg. Yield Loss Due to Poor Seed", value: "20-25%", desc: "Poor quality seed causes substantial loss" },
            { label: "Yield Boost from Soil Testing", value: "+30%", desc: "Informed nutrient management" },
            { label: "Recommended Crop Rotation Cycle", value: "3 Seasons", desc: "Maintains soil fertility naturally" },
            { label: "Ideal Soil pH for Most Crops", value: "6.0-7.5", desc: "Best nutrient availability range" },
        ],
        sections: [
            {
                id: "yield-1",
                title: "Choose the Right Crop",
                icon: Sprout,
                content: "Selecting the right crop for your land starts with understanding your soil type.",
                subOptions: [
                    { label: "Clay Soil", answer: "Clay soil retains water well. Best crops: Rice, Wheat, and Cotton. Ensure good drainage to prevent waterlogging." },
                    { label: "Sandy Soil", answer: "Sandy soil drains quickly. Best crops: Groundnut, Potato, and Watermelon. Use frequent, light irrigation." },
                    { label: "Loamy Soil", answer: "Loamy soil is the most fertile. Best crops: Vegetables, Pulses, and Sugarcane. It has a perfect balance of moisture and air." },
                ]
            },
            {
                id: "yield-2",
                title: "Optimize Planting Season",
                icon: Calendar,
                content: "Timing your sowing with the right season ensures maximum growth potential.",
                subOptions: [
                    { label: "Kharif (June–Oct)", answer: "Sown at the start of the monsoon. Major crops: Rice, Maize, Pearl Millet, and Soybeans." },
                    { label: "Rabi (Nov–Mar)", answer: "Sown in winter after the monsoon. Major crops: Wheat, Mustard, Barley, and Gram." },
                    { label: "Zaid (Mar–Jun)", answer: "Short summer season crops. Major crops: Cucumber, Watermelon, Bitter Gourd, and Fodder crops." },
                ]
            },

            {
                id: "yield-3",
                title: "Use Quality Seeds",
                icon: Target,
                content: "Seeds are the most important investment. Don't save money on poor quality seeds.",
                subOptions: [
                    { label: "Certified Seeds", answer: "Certified seeds are tested for high germination and purity. They often come with a blue tag indicating quality from government labs." },
                    { label: "Hybrid Seeds", answer: "Hybrid seeds are bred for specific traits like high yield or disease resistance. They perform best but cannot be saved for next year's sowing." },
                    { label: "Traditional Seeds", answer: "Indigenous seeds are well-adapted to local climate and pests. You can save and reuse them, making them a low-cost, sustainable choice." },
                ]
            },
            {
                id: "yield-4",
                title: "Integrated Pest Management",
                icon: ClipboardCheck,
                content: "Control pests without relying purely on expensive chemicals.",
                subOptions: [
                    { label: "Biological Control", answer: "Using natural enemies like ladybugs or neem-based sprays to keep pest populations under control without harming the environment." },
                    { label: "Crop Rotation", answer: "Changing crops every season breaks the life cycle of pests that live in the soil, naturally reducing the need for pesticides." },
                    { label: "Minimal Pesticide", answer: "Use chemical pesticides only as a last resort. Spot-treat affected areas instead of spraying the entire field to save costs and protect soil health." },
                ]
            },
        ],
    },
    "water-wastage": {

        title: "Water Wastage",
        subtitle: "Smart water management for your farm",
        icon: Droplets,
        circle: "icon-circle-blue",
        description: "How to Reduce Water Wastage",
        stats: [
            { label: "Water Saved with Drip Irrigation", value: "30-50%", desc: "Drastic reduction in wastage" },
            { label: "Agriculture's Share of Water Use", value: "80%", desc: "Farmers have the largest impact" },
            { label: "Over-Irrigation Yield Loss", value: "~15%", desc: "Too much water is as bad as too little" },
            { label: "Evaporation Reduced by Mulching", value: "25%", desc: "Keeps the soil cool and moist" },
        ],
        sections: [
            {
                id: "water-1",
                title: "Drip Irrigation",
                icon: Droplets,
                content: "Drip irrigation is the gold standard for saving water while keeping plants healthy.",
                subOptions: [
                    { label: "Small Farm (<2 acres)", answer: "Family drip kits are affordable and easy to install. They can save up to 1,000 liters of water per day." },
                    { label: "Medium Farm (2-10 acres)", answer: "A solar-powered drip system reduces electricity costs and ensures plants get water even during power cuts." },
                    { label: "Large Farm (>10 acres)", answer: "Automated drip systems with central controllers allow you to irrigate multiple zones precisely based on time and volume." },
                ]
            },
            {
                id: "water-2",
                title: "Rainwater Harvesting",
                icon: CloudRain,
                content: "Every drop of rain you catch is free water for your future crops.",
                subOptions: [
                    { label: "Farm Ponds", answer: "Dig a lined pond at the lowest point. It can store enough water to save a crop during a 15-day dry spell." },
                    { label: "Rooftop Collection", answer: "Divert rain from your shed roof into a tank or recharge pit to boost your borewell levels." },
                    { label: "Check Dams", answer: "Build small barriers in natural drains to slow down water and allow it to soak into the soil." },
                ]
            },
            {
                id: "water-3",
                title: "Soil Moisture Sensors",
                icon: Target,
                content: "Stop guessing. Let sensors tell you when your soil is thirsty.",
                subOptions: [
                    { label: "Manual Tensiometer", answer: "A simple, low-cost tool that measures how hard roots are working to pull water from the soil." },
                    { label: "Digital Sensor", answer: "Provides real-time moisture readings to your phone. Best for high-value vegetable crops." },
                    { label: "Satellite-Based", answer: "Larger farms can use satellite data to see which parts of the field need more water." },
                ]
            },
            {
                id: "water-4",
                title: "Mulching",
                icon: Recycle,
                content: "Protect the soil surface from the hot sun to keep the water inside.",
                subOptions: [
                    { label: "Straw Mulch", answer: "Use crop waste like rice straw. It keeps soil 5°C cooler and decomposes into organic manure." },
                    { label: "Plastic Mulch", answer: "Silver-black plastic prevents 99% of evaporation and completely stops weed growth." },
                    { label: "Live Mulch", answer: "Grow short cover crops like Beans between rows. They protect the soil and add Nitrogen." },
                ]
            },
        ],
    },
    "fertilizer-cost": {
        title: "High Fertilizer Cost",
        subtitle: "Reduce costs without compromising yield",
        icon: FlaskConical,
        circle: "icon-circle-orange",
        description: "How to Cut Fertilizer Costs",
        stats: [
            { label: "Savings from Soil Testing", value: "₹5,000+", desc: "Avoid buying nutrients you don't need" },
            { label: "Chemical Reduction with Organics", value: "40-60%", desc: "Using natural fertilizers effectively" },
            { label: "Fertilizer Saved by Precision", value: "20%", desc: "Right amount at the right time" },
            { label: "Avg. Soil Test Cost", value: "₹300", desc: "A small investment for huge savings" },
        ],
        sections: [
            {
                id: "fert-1",
                title: "Get a Soil Test",
                icon: Beaker,
                content: "Don't treat your soil blindly. A test is the only way to know what's really needed.",
                subOptions: [
                    { label: "Where to Test?", answer: "Visit the local Govt. Agriculture Office or KVK. You can often get tests done for around ₹100-300 per sample." },
                    { label: "What Does It Show?", answer: "It reveals NPK levels, micronutrients (Zinc, Boron), and pH level. This prevents buying fertilizers you already have." },
                    { label: "How Often?", answer: "Test your soil every 2 years or before changing a major crop (e.g., from grains to vegetables)." },
                ]
            },
            {
                id: "fert-2",
                title: "Use Organic Alternatives",
                icon: Recycle,
                content: "Replace expensive chemicals with powerful natural nutrient sources.",
                subOptions: [
                    { label: "Vermicompost", answer: "Earthworm compost is 5x richer than normal manure. Use 2 tons per acre to significantly reduce Urea dependence." },
                    { label: "Green Manure", answer: "Grow 'Dhaincha' and bury it 40 days later. It adds 60kg of Nitrogen per acre for just the cost of seed." },
                    { label: "Bio-Fertilizers", answer: "Phosphate Solubilizing Bacteria (PSB) makes fixed phosphorus in soil available to plants, potentially saving ₹1,500/acre." },
                ]
            },
            {
                id: "fert-3",
                title: "Crop Residue Recycling",
                icon: Recycle,
                content: "Your waste is actually worth thousands in nutrients if handled correctly.",
                subOptions: [
                    { label: "In-Situ Decomposition", answer: "Spray waste decomposer on stubble and till it in. This avoids burning and restores organic carbon back to the soil." },
                    { label: "Composting", answer: "Turn crop remains into high-quality compost. It provides a slow release of nutrients throughout the season." },
                    { label: "Biochar", answer: "Smoldering waste in limited air creates Biochar, which holds water and nutrients in sandy soils for years." },
                ]
            },
            {
                id: "fert-4",
                title: "Precision Application",
                icon: Target,
                content: "Apply fertilizer where it matters—near the roots, not in the paths.",
                subOptions: [
                    { label: "Band Placement", answer: "Apply fertilizer in a 2-inch band next to the seed row. This ensures the crop gets it before the weeds do." },
                    { label: "Split Dosing", answer: "Instead of one big dose, apply 1/3rd at sowing, 1/3rd at knee-height, and 1/3rd at flowering for 20% better uptake." },
                    { label: "Leaf Color Chart", answer: "A simple ₹50 plastic chart. Compare leaf color to the chart to see if your crop actually needs more Nitrogen today." },
                ]
            },
        ],
    }
};

const AdvisoryDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [selectedSubOptions, setSelectedSubOptions] = useState<Record<string, string>>({});
    const content = advisoryContent[slug as keyof typeof advisoryContent];

    if (!content) {
        return (
            <div className="min-h-screen bg-background text-center py-20">
                <Navbar />
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Content Not Found</h1>
                <Button onClick={() => navigate("/")} className="mt-4">Back to Home</Button>
            </div>
        );
    }

    const handleSubOptionClick = (sectionId: string, optionLabel: string) => {
        setSelectedSubOptions(prev => ({
            ...prev,
            [sectionId]: prev[sectionId] === optionLabel ? "" : optionLabel
        }));
    };

    const Icon = content.icon;

    return (
        <div className="min-h-screen bg-background pb-12">
            <Navbar />
            <div className="container max-w-4xl py-6 px-4">
                <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 font-medium">
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>

                <div className="flex flex-col items-center text-center mb-8">
                    <div className={`icon-circle ${content.circle} mb-3 shadow-sm`}>
                        <Icon className="h-7 w-7" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{content.title}</h1>
                    <p className="text-muted-foreground text-sm font-semibold mt-1">{content.subtitle}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
                    {content.stats.map((s, i) => (
                        <div key={i} className="bg-card rounded-xl p-4 shadow-sm border text-center flex flex-col items-center justify-center min-h-[140px] animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                            <p className="text-2xl font-black text-primary mb-1">{s.value}</p>
                            <p className="text-[10px] font-bold text-foreground/80 leading-tight mb-1 uppercase tracking-wide">{s.label}</p>
                            <p className="text-[9px] text-muted-foreground leading-tight px-1 font-medium">{s.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Sections Heading */}
                <div className="flex items-center gap-2 mb-6 border-b pb-2">
                    {slug === "low-yield" && <Info className="h-5 w-5 text-success" />}
                    {slug === "water-wastage" && <Info className="h-5 w-5 text-info" />}
                    {slug === "fertilizer-cost" && <Info className="h-5 w-5 text-warning" />}
                    <h2 className="text-xl font-extrabold tracking-tight">{content.description}</h2>
                </div>

                {/* Collapsible Sections (Accordion) */}
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {content.sections.map((section, i) => {
                        const SectionIcon = section.icon;
                        const currentSelected = selectedSubOptions[section.id];

                        return (
                            <AccordionItem
                                key={section.id}
                                value={section.id}
                                className="bg-card rounded-xl px-6 border shadow-sm overflow-hidden animate-fade-up transition-all hover:shadow-md"
                                style={{ animationDelay: `${(i + 2) * 0.08}s` }}
                            >
                                <AccordionTrigger className="hover:no-underline py-5 [&[data-state=open]]:border-b [&[data-state=open]]:mb-4">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <SectionIcon className="h-5 w-5 text-primary" />
                                        </div>
                                        <span className="text-[15px] font-extrabold tracking-tight">{section.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6">
                                    <p className="text-muted-foreground text-sm leading-relaxed font-medium mb-6">
                                        {section.content}
                                    </p>

                                    {section.subOptions && (
                                        <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-muted/30">
                                            <p className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest">Select an option:</p>
                                            <div className="space-y-2">
                                                {section.subOptions.map((opt) => (
                                                    <button
                                                        key={opt.label}
                                                        onClick={() => handleSubOptionClick(section.id, opt.label)}
                                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${currentSelected === opt.label
                                                            ? "bg-primary/5 border-primary text-primary font-extrabold shadow-sm"
                                                            : "bg-card hover:bg-muted/30 border-muted hover:border-muted-foreground/20 text-foreground/80"
                                                            }`}
                                                    >
                                                        <span className="text-sm">{opt.label}</span>
                                                        {currentSelected === opt.label && <Check className="h-4 w-4 text-primary animate-in zoom-in" />}
                                                    </button>
                                                ))}
                                            </div>

                                            {currentSelected && (
                                                <div className="mt-4 p-5 bg-card rounded-xl border-t-4 border-primary shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary mt-0.5">
                                                            <Info className="h-4 w-4" />
                                                        </div>
                                                        <p className="text-[13px] text-foreground/90 leading-relaxed font-semibold">
                                                            {section.subOptions.find(o => o.label === currentSelected)?.answer}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>

                <div className="mt-16 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground opacity-50 mb-2">
                        <Sprout className="h-4 w-4" />
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black">Smart Farm Advisor</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground/80 font-bold">Empowering farmers with precision data 🌾</p>
                </div>
            </div>
        </div>
    );
};

export default AdvisoryDetail;

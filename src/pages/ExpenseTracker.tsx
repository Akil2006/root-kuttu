import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, Plus, Trash2, TrendingUp, TrendingDown, IndianRupee, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  type: "expense" | "income";
  date: string;
}

const expenseCategories = ["Seeds", "Fertilizer", "Pesticide", "Labor", "Equipment", "Transport", "Irrigation", "Other"];
const incomeCategories = ["Crop Sale", "Government Subsidy", "Insurance Claim", "Other Income"];

const ExpenseTracker = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem("farm_expenses");
    return saved ? JSON.parse(saved) : [
      { id: "1", category: "Seeds", description: "Wheat seeds - 50kg", amount: 2500, type: "expense", date: "2026-02-20" },
      { id: "2", category: "Fertilizer", description: "DAP 50kg", amount: 1800, type: "expense", date: "2026-02-18" },
      { id: "3", category: "Labor", description: "Field preparation - 3 workers", amount: 3000, type: "expense", date: "2026-02-15" },
      { id: "4", category: "Crop Sale", description: "Rice - 10 quintals", amount: 21830, type: "income", date: "2026-02-10" },
      { id: "5", category: "Government Subsidy", description: "PM-Kisan installment", amount: 2000, type: "income", date: "2026-02-01" },
    ];
  });

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"expense" | "income">("expense");
  const [form, setForm] = useState({ category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0] });

  useEffect(() => {
    localStorage.setItem("farm_expenses", JSON.stringify(expenses));
  }, [expenses]);

  const totalExpenses = expenses.filter(e => e.type === "expense").reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = expenses.filter(e => e.type === "income").reduce((sum, e) => sum + e.amount, 0);
  const profit = totalIncome - totalExpenses;

  const handleAdd = () => {
    if (!form.category || !form.description || !form.amount) {
      toast.error("Please fill all fields");
      return;
    }
    const entry: Expense = {
      id: Date.now().toString(),
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount),
      type: formType,
      date: form.date,
    };
    setExpenses([entry, ...expenses]);
    setForm({ category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
    setShowForm(false);
    toast.success(`${formType === "expense" ? "Expense" : "Income"} added! 📝`);
  };

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
    toast.success("Entry deleted");
  };

  const categoryByExpense = expenseCategories.map(cat => ({
    name: cat,
    total: expenses.filter(e => e.type === "expense" && e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl py-6 px-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        <div className="text-center mb-6">
          <div className="icon-circle icon-circle-orange mx-auto mb-3"><Wallet className="h-7 w-7" /></div>
          <h1 className="text-2xl font-extrabold">Farm Expense Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your costs and calculate profit/loss</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl p-4 shadow-sm border text-center animate-fade-up">
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-[10px] text-muted-foreground mb-1">Total Expenses</p>
            <p className="text-lg font-extrabold text-destructive">₹{totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-sm border text-center animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <p className="text-[10px] text-muted-foreground mb-1">Total Income</p>
            <p className="text-lg font-extrabold text-success">₹{totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-sm border text-center animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className={`w-8 h-8 rounded-full ${profit >= 0 ? "bg-success/10" : "bg-destructive/10"} flex items-center justify-center mx-auto mb-2`}>
              <IndianRupee className={`h-4 w-4 ${profit >= 0 ? "text-success" : "text-destructive"}`} />
            </div>
            <p className="text-[10px] text-muted-foreground mb-1">{profit >= 0 ? "Profit" : "Loss"}</p>
            <p className={`text-lg font-extrabold ${profit >= 0 ? "text-success" : "text-destructive"}`}>₹{Math.abs(profit).toLocaleString()}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryByExpense.length > 0 && (
          <div className="bg-card rounded-xl p-5 shadow-sm border mb-6 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Expense Breakdown</h2>
            </div>
            <div className="space-y-3">
              {categoryByExpense.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">{cat.name}</span>
                    <span className="text-xs font-bold">₹{cat.total.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${(cat.total / totalExpenses) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Button / Form */}
        {!showForm ? (
          <div className="flex gap-3 mb-6">
            <Button className="flex-1 rounded-full gap-2 font-bold" onClick={() => { setFormType("expense"); setShowForm(true); }}>
              <Plus className="h-4 w-4" /> Add Expense
            </Button>
            <Button variant="outline" className="flex-1 rounded-full gap-2 font-bold" onClick={() => { setFormType("income"); setShowForm(true); }}>
              <Plus className="h-4 w-4" /> Add Income
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-xl p-5 shadow-sm border mb-6 animate-fade-up">
            <h3 className="font-bold text-sm mb-4">
              {formType === "expense" ? "💸 Add Expense" : "💰 Add Income"}
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-bold mb-1">Category</Label>
                <Select value={form.category} onValueChange={v => setForm(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {(formType === "expense" ? expenseCategories : incomeCategories).map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-bold mb-1">Description</Label>
                <Input placeholder="e.g. Wheat seeds 50kg" className="bg-background" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold mb-1">Amount (₹)</Label>
                  <Input type="number" placeholder="0" className="bg-background" value={form.amount} onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs font-bold mb-1">Date</Label>
                  <Input type="date" className="bg-background" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button className="flex-1 rounded-full font-bold" onClick={handleAdd}>Save</Button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction List */}
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-sm font-bold">📋 Recent Transactions</h2>
          </div>
          <div className="divide-y">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${e.type === "expense" ? "bg-destructive/10" : "bg-success/10"}`}>
                    {e.type === "expense" ? <TrendingDown className="h-4 w-4 text-destructive" /> : <TrendingUp className="h-4 w-4 text-success" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{e.description}</p>
                    <p className="text-[10px] text-muted-foreground">{e.category} · {e.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-extrabold ${e.type === "expense" ? "text-destructive" : "text-success"}`}>
                    {e.type === "expense" ? "-" : "+"}₹{e.amount.toLocaleString()}
                  </p>
                  <button onClick={() => handleDelete(e.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="text-center py-6 mt-4">
          <p className="text-xs text-muted-foreground">💰 Track your farm finances smartly</p>
        </footer>
      </div>
    </div>
  );
};

export default ExpenseTracker;

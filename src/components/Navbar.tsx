import { Link, useNavigate } from "react-router-dom";
import { Sprout, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/farm-pulse", label: "Farm Pulse" },
    { to: "/weather", label: "Weather" },
    { to: "/crop-disease", label: "Disease Check" },
    { to: "/community", label: "Community" },
    { to: "/expenses", label: "Expenses" },
  ];

  return (
    <nav className="bg-primary py-3 px-4">
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary-foreground">
          <Sprout className="h-6 w-6" />
          <span className="text-lg font-extrabold tracking-tight">Smart Farm Advisor</span>
        </Link>

        {/* Desktop nav */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-primary-foreground/80 hover:text-primary-foreground text-sm font-semibold transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="text-primary-foreground/90 hover:text-primary-foreground text-sm font-semibold transition-colors flex items-center gap-1 ml-2"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        )}

        {/* Mobile menu toggle */}
        {isLoggedIn && (
          <button
            className="md:hidden text-primary-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {isLoggedIn && menuOpen && (
        <div className="md:hidden mt-3 pb-2 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block text-primary-foreground/80 hover:text-primary-foreground text-sm font-semibold py-1 px-2"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-primary-foreground/90 hover:text-primary-foreground text-sm font-semibold flex items-center gap-1 px-2 py-1"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  session: null,
  loading: true,
  login: async () => ({ error: null }),
  signup: async () => ({ error: null }),
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage if present
  useEffect(() => {
    const token = localStorage.getItem("root_kuttu_token");
    const storedUser = localStorage.getItem("root_kuttu_user");
    
    if (token && storedUser) {
      setSession({ access_token: token });
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { error: data.message || "Login failed" };
      }
      
      const sessionData = { access_token: data.token };
      const userData = {
        id: data.email,
        email: data.email,
        user_metadata: { full_name: data.name, location: data.location }
      };
      
      setSession(sessionData);
      setUser(userData);
      
      localStorage.setItem("root_kuttu_token", data.token);
      localStorage.setItem("root_kuttu_user", JSON.stringify(userData));
      
      return { error: null };
    } catch (err) {
      return { error: "Network error connecting to backend" };
    }
  };

  const signup = async (email, password, fullName, location) => {
    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: fullName, location })
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { error: data.message || "Signup failed" };
      }
      return { error: null };
    } catch (err) {
      return { error: "Network error connecting to backend" };
    }
  };

  const logout = async () => {
    setSession(null);
    setUser(null);
    localStorage.removeItem("root_kuttu_token");
    localStorage.removeItem("root_kuttu_user");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!session, user, session, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

import { createContext, useContext, useEffect, useState } from "react";


type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  primaryRole: string;
}

type AuthContextType = {

  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = `${import.meta.env.VITE_API_URL}`


  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Not authenticated");

        const data = await res.json();

        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch {
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  if (loading) return null; // or spinner

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {

    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
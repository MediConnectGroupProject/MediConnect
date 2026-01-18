import { createContext, useContext, useEffect, useState } from "react";
import { Spinner } from "../components/ui/spinner";


import { MockApi } from "../services/mockApi";
import type { User } from "../types";




type AuthContextType = {

  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        // MOCK MODE: Use MockApi
        const user = await MockApi.getCurrentUser();
        // const res = await fetch(`${API_URL}/auth/me`, {
        //   credentials: "include",
        // });

        // if (!res.ok) throw new Error("Not authenticated");

        // const data = await res.json();
        
        if (user) {
             setUser(user as User);
        }

        // setUser(data.user);
        // localStorage.setItem("user", JSON.stringify(data.user));
      } catch {
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  if (loading) return <Spinner />; // or spinner

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
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
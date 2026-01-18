import { createContext, useContext, useEffect, useState } from "react";
import { Spinner } from "../components/ui/spinner";


import { getMe, logoutUser } from "../api/authApi";
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
        // REAL API MODE
        const data = await getMe();
        
        if (data?.user) {
             setUser(data.user as User);
        }

      } catch {
        setUser(null);
        // localStorage.removeItem("user"); // managed by cookie now mostly, but can keep for fallback if logic exists
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  if (loading) return <Spinner />; // or spinner

  const logout = async () => {
    try {
        await logoutUser();
    } catch (e) {
        console.error(e);
    }
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
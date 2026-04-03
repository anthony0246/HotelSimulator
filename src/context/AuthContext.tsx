"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Session {
  id: number;
  name: string;
  email: string;
  role: "customer" | "employee";
  hotelid?: number;
  hotelname?: string;
  roles?: string[];
}

interface AuthContextType {
  session: Session | null;
  login: (s: Session) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ehotels_session");
      if (stored) setSession(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
  }, []);

  const login = (s: Session) => {
    setSession(s);
    localStorage.setItem("ehotels_session", JSON.stringify(s));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem("ehotels_session");
  };

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

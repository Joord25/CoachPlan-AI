"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, GoogleAuthProvider, User } from "firebase/auth";
import { auth } from "./firebase";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true, loginWithGoogle: async () => {}, logout: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }), []);

  const loginWithGoogle = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (e: unknown) { if ((e as { code?: string }).code !== "auth/popup-closed-by-user") console.error(e); }
  };

  const logout = () => fbSignOut(auth);

  return <Ctx.Provider value={{ user, loading, loginWithGoogle, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "customer" | "brand";

export type Address = {
  id: string;
  label: string;
  fullName: string;
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
};

export type User = {
  id: string;
  email: string;
  password: string; // demo only — see NOTE
  role: Role;
  firstName: string;
  lastName: string;
  brandName?: string;
  brandTagline?: string;
  brandLocation?: string;
  addresses: Address[];
  createdAt: string;
};

/**
 * DEMO-ONLY AUTH STORE
 * --------------------
 * This is a frontend-only investor prototype. Passwords are stored in
 * localStorage in plaintext and no real signing / hashing is performed.
 * When wiring a real backend (Lovable Cloud / Supabase), replace this
 * store with real Supabase auth. The public API of the hook is designed
 * so that swap is a drop-in.
 */

type Session = { id: string; issuedAt: number; expiresAt: number };

type AuthContextType = {
  user: User | null;
  ready: boolean;
  users: User[];
  signup: (data: Omit<User, "id" | "addresses" | "createdAt">) => { ok: true } | { ok: false; error: string };
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  addAddress: (a: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  updateProfile: (patch: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "frashioncart.users";
const SESSION_KEY = "frashioncart.session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    // Backwards compat: previously we stored just the user id.
    if (!raw.startsWith("{")) {
      const legacy: Session = { id: raw, issuedAt: Date.now(), expiresAt: Date.now() + SESSION_TTL_MS };
      localStorage.setItem(SESSION_KEY, JSON.stringify(legacy));
      return legacy;
    }
    const s = JSON.parse(raw) as Session;
    if (!s.expiresAt || s.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function writeSession(userId: string) {
  const s: Session = { id: userId, issuedAt: Date.now(), expiresAt: Date.now() + SESSION_TTL_MS };
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      const parsed: User[] = raw ? JSON.parse(raw) : [];
      setUsers(parsed);
      const session = readSession();
      if (session) {
        const found = parsed.find(u => u.id === session.id);
        if (found) setUser(found);
      }
    } catch {}
    setReady(true);
  }, []);

  const persist = (next: User[]) => {
    setUsers(next);
    try { localStorage.setItem(USERS_KEY, JSON.stringify(next)); } catch {}
  };

  const signup: AuthContextType["signup"] = (data) => {
    const email = data.email.trim().toLowerCase();
    if (!email || !data.password) return { ok: false, error: "Email and password are required." };
    if (users.some(u => u.email === email)) return { ok: false, error: "An account with that email already exists." };
    const newUser: User = {
      ...data,
      email,
      id: `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    const next = [...users, newUser];
    persist(next);
    setUser(newUser);
    writeSession(newUser.id);
    return { ok: true };
  };

  const login: AuthContextType["login"] = (email, password) => {
    const found = users.find(u => u.email === email.trim().toLowerCase() && u.password === password);
    if (!found) return { ok: false, error: "Invalid email or password." };
    setUser(found);
    writeSession(found.id);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(SESSION_KEY); } catch {}
  };

  const updateUser = (patch: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...patch };
    const next = users.map(u => u.id === user.id ? updated : u);
    persist(next);
    setUser(updated);
  };

  const addAddress: AuthContextType["addAddress"] = (a) => {
    if (!user) return;
    const address: Address = { ...a, id: `a_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}` };
    updateUser({ addresses: [...user.addresses, address] });
  };

  const removeAddress: AuthContextType["removeAddress"] = (id) => {
    if (!user) return;
    updateUser({ addresses: user.addresses.filter(a => a.id !== id) });
  };

  const updateProfile: AuthContextType["updateProfile"] = (patch) => updateUser(patch);

  return (
    <AuthContext.Provider value={{ user, ready, users, signup, login, logout, addAddress, removeAddress, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

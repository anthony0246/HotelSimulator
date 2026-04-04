"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { session, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to the right page
  useEffect(() => {
    if (session?.role === "customer") router.replace("/customer/search");
    else if (session?.role === "employee") router.replace("/employee/checkin");
  }, [session, router]);

  const submit = async (role: "customer" | "employee") => {
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Invalid email or password");
      return;
    }

    login(data);
    router.push(role === "customer" ? "/customer/search" : "/employee/checkin");
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to e-Hotels</h1>

        <form
          onSubmit={e => { e.preventDefault(); submit("customer"); }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. alice1@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="password123"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition text-sm">
              {loading ? "Signing in…" : "Sign In as Customer"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => submit("employee")}
              className="bg-gray-700 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition text-sm">
              {loading ? "Signing in…" : "Sign In as Employee"}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Demo — all passwords are <span className="font-mono">password123</span><br />
          Customer: <span className="font-mono">alice1@email.com</span>, <span className="font-mono">brian2@email.com</span>…<br />
          Employee: <span className="font-mono">james1@ehotels.com</span>, <span className="font-mono">patricia2@ehotels.com</span>…
        </p>
      </div>
    </div>
  );
}

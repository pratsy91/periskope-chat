"use client";
import { FaUserCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!username) {
      setError("Username is required");
      setLoading(false);
      return;
    }
    // Check if user exists
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("id, username")
      .eq("username", username)
      .limit(1);
    if (fetchError) {
      setError("Error connecting to server");
      setLoading(false);
      return;
    }
    let userId = users && users.length > 0 ? users[0].id : null;
    // If user does not exist, sign up (insert)
    if (!userId) {
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([{ username }])
        .select("id")
        .single();
      if (insertError || !newUser) {
        setError("Could not sign up. Try again.");
        setLoading(false);
        return;
      }
      userId = newUser.id;
    }
    // Store user id and login flag
    if (typeof window !== "undefined") {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username);
      router.replace("/");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
      <div className="bg-white shadow-lg rounded-xl p-10 flex flex-col items-center w-[350px] border border-[#e6e6e6]">
        <span className="text-[#25d366] mb-6"><FaUserCircle size={64} /></span>
        <h1 className="text-2xl font-semibold mb-2 text-[#222]">Sign in to Periskope</h1>
        <p className="text-sm text-[#888] mb-6">Enter your credentials to continue</p>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="border border-[#e6e6e6] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#25d366] bg-[#fafbfc] text-[#222]"
          />
          <input
            type="password"
            placeholder="Password (not used)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border border-[#e6e6e6] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#25d366] bg-[#fafbfc] text-[#222]"
            autoComplete="off"
          />
          <button
            type="submit"
            className="mt-2 bg-[#25d366] hover:bg-[#1fa855] text-white font-semibold rounded-lg py-2 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Loading..." : "Login / Sign Up"}
          </button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
} 
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
  const [isSignup, setIsSignup] = useState(false);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (!e.target.value && !password) {
      setError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (!e.target.value && !username) {
      setError("");
    } else if (isSignup && e.target.value.length > 0 && e.target.value.length < 5) {
      setError("Password must be at least 5 characters long");
    } else if (isSignup && e.target.value.length >= 5) {
      setError("");
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!username || !password) {
      setError("Username and password are required");
      setLoading(false);
      return;
    }

    if (isSignup && password.length < 5) {
      setError("Password must be at least 5 characters long");
      setLoading(false);
      return;
    }

    if (isSignup) {
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        setError("Error checking username");
        setLoading(false);
        return;
      }

      if (existingUser) {
        setError("Username already exists. Please login instead.");
        setLoading(false);
        return;
      }

      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([{ username, password }])
        .select("id")
        .single();

      if (insertError || !newUser) {
        setError("Could not create account. Try again.");
        setLoading(false);
        return;
      }

      // Store user info and redirect
      if (typeof window !== "undefined") {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("userId", newUser.id);
        localStorage.setItem("username", username);
        router.replace("/");
      }
    } else {
      // Login flow
      const { data: user, error: loginError } = await supabase
        .from("users")
        .select("id, password")
        .eq("username", username)
        .single();

      if (loginError || !user) {
        setError("User not found. Please sign up first.");
        setLoading(false);
        return;
      }

      if (user.password !== password) {
        setError("Incorrect password");
        setLoading(false);
        return;
      }

      // Store user info and redirect
      if (typeof window !== "undefined") {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("userId", user.id);
        localStorage.setItem("username", username);
        router.replace("/");
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
      <div className="bg-white shadow-lg rounded-xl p-10 flex flex-col items-center w-[350px] border border-[#e6e6e6]">
        <span className="text-[#25d366] mb-6"><FaUserCircle size={64} /></span>
        <h1 className="text-2xl font-semibold mb-2 text-[#222]">
          {isSignup ? "Create Account" : "Sign in to Periskope"}
        </h1>
        <p className="text-sm text-[#888] mb-6">
          {isSignup ? "Create a new account" : "Enter your credentials to continue"}
        </p>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
            className="border border-[#e6e6e6] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#25d366] bg-[#fafbfc] text-[#222]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            className="border border-[#e6e6e6] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#25d366] bg-[#fafbfc] text-[#222]"
          />
          <button
            type="submit"
            className="mt-2 bg-[#25d366] hover:bg-[#1fa855] text-white font-semibold rounded-lg py-2 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Loading..." : (isSignup ? "Sign Up" : "Login")}
          </button>
          <div className="h-6 flex items-center justify-center">
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            className="text-[#25d366] hover:text-[#1fa855] text-sm mt-2"
          >
            {isSignup ? "Already have an account? Login" : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
} 
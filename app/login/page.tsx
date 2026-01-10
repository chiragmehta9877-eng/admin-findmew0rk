'use client';

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiMail, FiLock, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

// 1. Create a separate component for the form logic that uses searchParams
function LoginForm() {
  const router = useRouter();
  const { status } = useSession();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [uiError, setUiError] = useState("");

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  useEffect(() => {
    if (errorMsg === "AccessDenied") {
        setUiError("Access Denied! Your account is either blocked or does not exist.");
    }
  }, [errorMsg]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUiError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setUiError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
      <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/50 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800">Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-2">Enter your credentials to access the admin panel.</p>
        </div>

        {/* Error Message Alert */}
        {uiError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center gap-2 border border-red-100 animate-pulse">
                <FiAlertCircle size={18} /> {uiError}
            </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@company.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
                {loading ? "Signing in..." : "Sign In with Email"}
            </button>
        </form>

        <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-xs text-slate-400 font-bold uppercase">Or continue with</span>
            <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* Google Button */}
        <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3"
        >
            <FcGoogle size={22} /> Sign in with Google
        </button>

        <div className="text-center mt-6 text-xs text-slate-400">
            Protected by Super Admin. Unauthorized access is prohibited.
        </div>

      </div>
  );
}

// 2. Main Page Component wraps the Form in Suspense
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      {/* 3. Suspense Boundary Added Here */}
      <Suspense fallback={<div className="text-slate-500 animate-pulse">Loading Login...</div>}>
        <LoginForm />
      </Suspense>

    </div>
  );
}
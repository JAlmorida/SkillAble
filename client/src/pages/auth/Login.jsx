import { Button } from "@/components/ui/button";
import { School } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "@/features/api/authApi";
import Input from "@/components/ui/input";
import ForgotPasswordModal from "./ForgotPasswordModal";
import toast, { Toaster } from "react-hot-toast"; // Add Toaster import

const Login = () => {
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [showForgot, setShowForgot] = useState(false);

  const [
    loginUser,
    { error: loginError, isLoading: loginIsLoading },
  ] = useLoginUserMutation();
  const navigate = useNavigate();

  const changeInputHandler = (e) => {
    const { name, value } = e.target;
    setLoginInput({ ...loginInput, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await loginUser(loginInput).unwrap();
      toast.success(result.message || "Login successful.");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    } catch (error) {
      const errorMessage =
        error.data?.message || error.message || "Login Failed";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col-reverse lg:flex-row overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-blue-400 opacity-30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-purple-400 opacity-20 rounded-full blur-3xl animate-pulse-slower" />
        <div className="absolute top-1/2 left-1/2 w-[120px] h-[120px] md:w-[200px] md:h-[200px] bg-pink-400 opacity-10 rounded-full blur-2xl animate-pulse" style={{ transform: "translate(-50%, -50%)" }} />
      </div>
      
      {/* Login Form */}
      <div className="flex flex-1 flex-col justify-center items-center px-4 py-8 sm:py-12 md:px-8">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in">
          <div className="mb-4 flex items-center gap-2 justify-center">
            <School className="size-8 text-primary animate-bounce-slow" />
            <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 tracking-wider animate-gradient-x">
              SKillAble
            </span>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 animate-fade-in">
                Welcome Back
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Sign in to your account to continue your learning journey
              </p>
            </div>
            {loginError && (
              <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded px-3 py-2 mb-2 text-sm">
                {loginError.data?.message || loginError.message || "Login Failed"}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="Example@example.com"
                className="w-full"
                value={loginInput.email}
                onChange={changeInputHandler}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full"
                value={loginInput.password}
                onChange={changeInputHandler}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full transition-transform duration-200 hover:scale-105 hover:shadow-lg"
              disabled={loginIsLoading}
            >
              {loginIsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <div className="text-center mt-2">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:underline font-semibold"
                >
                  Create one
                </Link>
              </p>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="
                  mt-3
                  flex items-center justify-center gap-1
                  text-sm font-medium
                  text-blue-500 dark:text-blue-400
                  hover:text-blue-700 dark:hover:text-blue-300
                  hover:underline
                  transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  group
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-blue-400 group-hover:text-blue-600 dark:text-blue-300 dark:group-hover:text-blue-200 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v.01M12 13a4 4 0 100-8 4 4 0 000 8zm0 0v4m0 0h.01" />
                </svg>
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Illustration */}
      <div className="flex flex-1 items-center justify-center py-8 lg:py-0">
        <div className="max-w-xs sm:max-w-sm md:max-w-md p-4 animate-float w-full">
          <div className="relative aspect-square max-w-xs sm:max-w-sm md:max-w-md mx-auto">
            <img
              src="/i.png"
              alt="Language connection illustration"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center space-y-2 mt-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Connect with learning partners
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Make friends, and improve together
            </p>
          </div>
        </div>
      </div>
      
      {/* Animations */}
      <style>
        {`
          @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.5; } }
          @keyframes pulse-slower { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.4; } }
          @keyframes fade-in { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none; } }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
          @keyframes gradient-x { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
          .animate-pulse-slow { animation: pulse-slow 6s infinite; }
          .animate-pulse-slower { animation: pulse-slower 10s infinite; }
          .animate-fade-in { animation: fade-in 1s ease; }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 4s ease-in-out infinite; }
          .animate-bounce-slow { animation: bounce 2s infinite; }
        `}
      </style>
      
      <ForgotPasswordModal open={showForgot} onClose={() => setShowForgot(false)} />
      
      {/* Toast Container - Add this! */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default Login;

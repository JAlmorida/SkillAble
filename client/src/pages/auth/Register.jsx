import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegisterUserMutation } from "@/features/api/authApi";
import { Loader2, School } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useGetAuthUserQuery } from "@/features/api/authApi";
import Input from "@/components/ui/input";

const Register = () => {
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();
  const { refetch } = useGetAuthUserQuery();
  const navigate = useNavigate();

  const changeInputHandler = (e) => {
    const { name, value } = e.target;
    setSignupInput((prev) => ({ ...prev, [name]: value }));
  };
  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      const result = await registerUser(signupInput);
      if (result?.data?.success) {
        toast.success(result.data.message || "Signup successful.");
        navigate("/onboarding"); // Redirect to onboarding after successful registration
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Signup Failed");
    }
    // Optionally reset form here if desired
    // setSignupInput({ name: "", email: "", password: "", confirmPassword: "", gender: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await completeOnBoarding(formState).unwrap();
      toast.success("Profile onboarded successfully");
      refetch(); // This will update the user state with isOnboarded: true
    } catch (error) {
      toast.error(error?.data?.message || "Onboarding failed");
    }
  };

  useEffect(() => {
    if (registerIsSuccess && registerData) {
      toast.success(registerData.message || "Signup successful.");
    }
    if (registerError) {
      const errorMessage =
        registerError.data?.message || registerError.message || "Signup Failed";
      toast.error(errorMessage);
    }
  }, [registerIsSuccess, registerData, registerError]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="relative h-screen w-screen flex flex-col-reverse lg:flex-row overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-blue-400 opacity-30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-purple-400 opacity-20 rounded-full blur-3xl animate-pulse-slower" />
        <div className="absolute top-1/2 left-1/2 w-[120px] h-[120px] md:w-[200px] md:h-[200px] bg-pink-400 opacity-10 rounded-full blur-2xl animate-pulse" style={{ transform: "translate(-50%, -50%)" }} />
      </div>
      {/* Register Form */}
      <div className="flex flex-1 flex-col justify-center items-center px-4 py-8 sm:py-12 md:px-8">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in">
          <div className="mb-4 flex items-center gap-2 justify-center">
            <School className="size-8 text-primary animate-bounce-slow" />
            <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 tracking-wider animate-gradient-x">
              SkillAble
            </span>
          </div>
          <form onSubmit={handleRegistration} className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 animate-fade-in">
                Create an Account
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Join SkillAble and start your learning adventure!
              </p>
            </div>
            {registerError && (
              <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded px-3 py-2 mb-2 text-sm">
                {registerError.data?.message || registerError.message || "Signup Failed"}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Name</label>
              <Input
                type="text"
                name="name"
                placeholder="Your name here"
                className="w-full"
                value={signupInput.name}
                onChange={changeInputHandler}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="Example@gmail.com"
                className="w-full"
                value={signupInput.email}
                onChange={changeInputHandler}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
              <Input
                type="password"
                name="password"
                placeholder="********"
                className="w-full"
                value={signupInput.password}
                onChange={changeInputHandler}
                required
              />
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="accent-primary w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-150"
              />
              <label htmlFor="terms" className="text-xs leading-tight ml-2 select-none">
                I agree to the{" "}
                <span className="text-primary hover:underline cursor-pointer">
                  terms of service
                </span>{" "}
                and{" "}
                <span className="text-primary hover:underline cursor-pointer">
                  privacy policy
                </span>
              </label>
            </div>
            <Button
              className="w-full transition-transform duration-200 hover:scale-105 hover:shadow-lg"
              type="submit"
              disabled={registerIsLoading}
            >
              {registerIsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
            <div className="text-center mt-2">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-semibold"
                >
                  Sign in
                </Link>
              </p>
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
    </div>
  );
};

export default Register;

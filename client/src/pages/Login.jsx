// rbSUvLLaPZCPuaKo
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { School, ShipWheelIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useLoginUserMutation,
} from "@/features/api/authApi";

const Login = () => {
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });

  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
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
      // Wait for the next tick to ensure Redux state is updated
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    } catch (error) {
      const errorMessage = error.data?.message || error.message || "Login Failed";
      toast.error(errorMessage);
    }
  };

  return (
    <div className=" flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* LOGIN FORM SECTION */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <School className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              SKillAble
            </span>
          </div>

          {/* ERROR MESSAGE DISPLAY */}
          {loginError && (
            <div className="alert alert-error mb-4">
              <span>{loginError.data?.message || loginError.message || "Login Failed"}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Welcome Back</h2>
                  <p className="text-sm opacity-70">
                    Sign in to your account to continue your learning journey
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Example@example.com"
                      className="input input-bordered w-full"
                      value={loginInput.email}
                      onChange={changeInputHandler}
                      required
                    />
                  </div>

                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <Input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full"
                      value={loginInput.password}
                      onChange={changeInputHandler}
                      required
                    />
                  </div>

                  <Button type="submit" className="btn btn-primary w-full" disabled={loginIsLoading}>
                    {loginIsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <div className="text-center mt-4">
                    <p className="text-sm">
                      Don't have an account?{" "}
                      <Link to="/register" className="text-primary hover:underline">
                        Create one
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/i.png" alt="Language connection illustration" className="w-full h-full" />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Connect with learning partners</h2>
              <p className="opacity-70">
                Make friends, and improve together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
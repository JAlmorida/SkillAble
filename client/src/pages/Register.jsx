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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterUserMutation } from "@/features/api/authApi";
import { Loader2, School } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
        navigate("/login");
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Signup Failed");
    }
    // Optionally reset form here if desired
    // setSignupInput({ name: "", email: "", password: "", confirmPassword: "", gender: "" });
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

  return (
    <div className="flex items-center justify-center overflow-hidden h-screen">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <School className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              SkillAble
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {registerError && (
            <div className="alert alert-error mb-4">
              <span>
                {registerError.data?.message || registerError.message}
              </span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleRegistration}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">
                    Join SkillAble and start your learning adventure!
                  </p>
                </div>

                <div className="space-y-3">
                  {/* NAME */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Name</span>
                    </label>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Your name here"
                      className="input input-bordered w-full"
                      value={signupInput.name}
                      onChange={changeInputHandler}
                      required
                    />
                  </div>
                  {/* EMAIL */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Example@gmail.com"
                      className="input input-bordered w-full"
                      value={signupInput.email}
                      onChange={changeInputHandler}
                      required
                    />
                  </div>
                  {/* PASSWORD */}
                  <div className="form-control w-full">
                    <span className="label-text">Password</span>
                    <Input
                      type="password"
                      name="password"
                      placeholder="********"
                      className="input input-bordered w-full"
                      value={signupInput.password}
                      onChange={changeInputHandler}
                      required
                    />
                  </div>

                  <div>
                    <Checkbox required />
                    <span className="text-xs leading-tight mt-2 ml-2">
                      I agree to the{" "}
                      <span className="text-primary hover:underline">
                        terms of service
                      </span>{" "}
                      and{" "}
                      <span className="text-primary hover:underline">
                        privacy policy
                      </span>
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
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

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* SIGNUP FORM - RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/i.png"
                alt="Language connection illustration"
                className="w-full h-full"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with learning partners
              </h2>
              <p className="opacity-70">Make friends, and improve together</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

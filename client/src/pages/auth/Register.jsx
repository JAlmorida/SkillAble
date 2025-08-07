import { Button } from "@/components/ui/button";
import { Loader2, School, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "@/components/ui/input";
import EmailConfirmationModal from "./EmailConfirmationModal";
import ReCAPTCHA from "react-google-recaptcha";
import { 
  useRegisterUserMutation,
  useGetAuthUserQuery,
  useConfirmEmailMutation, 
  useResendConfirmationMutation, 
} from "@/features/api/authApi";
import { getPasswordRequirements } from "@/utils/passwordValidation";

const Register = () => {
  const [signupInput, setSignupInput] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState(getPasswordRequirements(""));

  const [confirmEmail, { isLoading: confirmLoading }] = useConfirmEmailMutation();
  const [resendConfirmation, { isLoading: resendLoading }] = useResendConfirmationMutation();

  const isDarkMode = document.documentElement.classList.contains("dark");

  const changeInputHandler = (e) => {
    const { name, value } = e.target;
    setSignupInput((prev) => ({ ...prev, [name]: value }));
    if (name === "password") {
      setPasswordRequirements(getPasswordRequirements(value));
    }
  };
  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!Object.values(passwordRequirements).every(Boolean)) {
      toast.error("Password does not meet requirements.");
      return;
    }
    if (signupInput.password !== signupInput.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA.");
      return;
    }
    try {
      const result = await registerUser({ ...signupInput, recaptchaToken });
      if (result?.data?.success) {
        setRegisteredEmail(signupInput.email);
        setShowConfirmModal(true);
        // Do NOT redirect yet
      } else if (result?.error?.data?.pendingConfirmation) {
        // <-- Handle pending confirmation
        setRegisteredEmail(signupInput.email);
        setShowConfirmModal(true);
        toast.info(result.error.data.message || "Please confirm your email.");
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Signup Failed");
    }
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

  const handleConfirm = async (code) => {
    try {
      await confirmEmail({ email: registeredEmail, code }).unwrap();
      toast.success("Email confirmed! Redirecting to login...");
      setTimeout(() => {
        setShowConfirmModal(false);
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Invalid or expired code");
    }
  };

  const handleResendConfirmation = async () => {
    try {
      await resendConfirmation(registeredEmail).unwrap();
      toast.success("Confirmation code resent!");
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to resend confirmation.");
    }
  };

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
        <div className="w-full max-w-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in"
             style={{ maxHeight: "90vh", overflowY: "auto" }}>
          <div className="mb-2 flex items-center gap-2 justify-center">
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
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">First Name</label>
                <Input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  className="w-full"
                  value={signupInput.firstName}
                  onChange={changeInputHandler}
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Last Name</label>
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  className="w-full"
                  value={signupInput.lastName}
                  onChange={changeInputHandler}
                  required
                />
              </div>
            </div>
            <div>
              <label>Email</label>
              <Input
                type="email"
                name="email"
                value={signupInput.email}
                onChange={changeInputHandler}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Password</label>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="********"
                  className="w-full"
                  value={signupInput.password}
                  onChange={changeInputHandler}
                  required
                />
                <button
                  type="button"
                  className="text-gray-500 border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-[#23232a] hover:bg-gray-100 dark:hover:bg-[#23232a]/80 transition"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password requirements feedback here */}
              <div className="mb-2">
                <div className="border rounded p-3 text-xs bg-white dark:bg-zinc-800">
                  <div className={passwordRequirements.length ? "text-green-600" : "text-red-600"}>
                    {passwordRequirements.length ? "✓" : "✗"} At least 8 characters
                  </div>
                  <div className={passwordRequirements.atLeastThreeTypes ? "text-green-600" : "text-red-600"}>
                    {passwordRequirements.atLeastThreeTypes ? "✓" : "✗"} At least 3 of the following:
                    <ul className="ml-4">
                      <li className={passwordRequirements.lowercase ? "text-green-600" : "text-red-600"}>
                        {passwordRequirements.lowercase ? "✓" : "✗"} Lower case letters (a-z)
                      </li>
                      <li className={passwordRequirements.uppercase ? "text-green-600" : "text-red-600"}>
                        {passwordRequirements.uppercase ? "✓" : "✗"} Upper case letters (A-Z)
                      </li>
                      <li className={passwordRequirements.number ? "text-green-600" : "text-red-600"}>
                        {passwordRequirements.number ? "✓" : "✗"} Numbers (0-9)
                      </li>
                      <li className={passwordRequirements.special ? "text-green-600" : "text-red-600"}>
                        {passwordRequirements.special ? "✓" : "✗"} Special characters (e.g. !@#$%^&*)
                      </li>
                    </ul>
                  </div>
                  <div className={passwordRequirements.noTripleRepeat ? "text-green-600" : "text-red-600"}>
                    {passwordRequirements.noTripleRepeat ? "✓" : "✗"} No more than 2 identical characters in a row
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Confirm Password</label>
              <div className="flex items-center gap-2">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="********"
                  className="w-full"
                  value={signupInput.confirmPassword}
                  onChange={changeInputHandler}
                  required
                />
                <button
                  type="button"
                  className="text-gray-500 border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-[#23232a] hover:bg-gray-100 dark:hover:bg-[#23232a]/80 transition"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
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
            <div className="w-full flex justify-center">
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                theme={isDarkMode ? "dark" : "light"}
                onChange={token => setRecaptchaToken(token)}
              />
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

      {/* Email Confirmation Modal */}
      <EmailConfirmationModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        loading={confirmLoading}
        email={registeredEmail}
        onResend={handleResendConfirmation}
      />
    </div>
  );
};

export default Register;

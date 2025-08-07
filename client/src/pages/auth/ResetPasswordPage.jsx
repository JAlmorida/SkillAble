import { useResetPasswordMutation, useValidateResetTokenQuery } from "@/features/api/authApi";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPasswordRequirements } from "@/utils/passwordValidation";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState(getPasswordRequirements(""));
  const [resetPassword, { isLoading, isSuccess, error }] = useResetPasswordMutation();
  const { data, isLoading: isValidating } = useValidateResetTokenQuery(token);

  // Countdown logic
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    if (!data?.expiresAt) return;
    const expiresAt = new Date(data.expiresAt);
    const interval = setInterval(() => {
      const diff = expiresAt - new Date();
      if (diff <= 0) {
        setCountdown("00:00");
        clearInterval(interval);
      } else {
        const min = String(Math.floor(diff / 60000)).padStart(2, "0");
        const sec = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
        setCountdown(`${min}:${sec}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [data?.expiresAt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Object.values(passwordRequirements).every(Boolean)) {
      alert("Password does not meet requirements.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    await resetPassword({ token, password });
  };

  if (isValidating) return <div>Loading...</div>;
  if (!data?.valid) return <div className="text-red-600 text-center">Link expired or invalid.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#111112] px-2">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-[#18181b] rounded-xl shadow-2xl p-4 sm:p-6 flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100 text-center">
          Reset Password
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">New Password</label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="border border-gray-300 dark:border-gray-700 rounded-md p-2 w-full bg-white dark:bg-[#23232a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setPasswordRequirements(getPasswordRequirements(e.target.value));
              }}
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
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              className="border border-gray-300 dark:border-gray-700 rounded-md p-2 w-full bg-white dark:bg-[#23232a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Password requirements */}
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
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-md px-4 py-2 font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
          disabled={isLoading}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
        {isSuccess && (
          <p className="text-green-600 dark:text-green-400 text-center">
            Password reset successful! You can now log in.
          </p>
        )}
        {error && (
          <p className="text-red-600 dark:text-red-400 text-center">
            {error.data?.message || "Error"}
          </p>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;

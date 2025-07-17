import { useResetPasswordMutation } from "@/features/api/authApi";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [resetPassword, { isLoading, isSuccess, error }] = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await resetPassword({ token, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#111112] px-2">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-[#18181b] rounded-xl shadow-2xl p-4 sm:p-6 flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100 text-center">
          Reset Password
        </h2>
        <input
          type="password"
          placeholder="Enter new password"
          className="border border-gray-300 dark:border-gray-700 rounded-md p-2 w-full bg-white dark:bg-[#23232a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
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

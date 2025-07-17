import React, { useState } from "react";
import { useForgotPasswordMutation } from "@/features/api/authApi";

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 transition-colors">
      <div className="bg-white dark:bg-[#18181b] rounded-xl shadow-2xl w-full max-w-md mx-4 sm:mx-0 p-4 sm:p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h2>
        {children}
      </div>
    </div>
  );
};

const ForgotPasswordModal = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading, isSuccess, error }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
  };

  React.useEffect(() => {
    if (!open) setEmail("");
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Forgot Password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="border border-gray-300 dark:border-gray-700 rounded-md p-2 w-full bg-white dark:bg-[#23232a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-md px-4 py-2 font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
        {isSuccess && (
          <p className="text-green-600 dark:text-green-400 text-center">
            Check your email for the reset link.
          </p>
        )}
        {error && (
          <p className="text-red-600 dark:text-red-400 text-center">
            {error.data?.message || "Error"}
          </p>
        )}
      </form>
    </Modal>
  );
};

export default ForgotPasswordModal;

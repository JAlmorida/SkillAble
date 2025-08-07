import React, { useState, useEffect, useRef } from "react";
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

  // 30-second resend timer state
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (resendCooldown > 0) return;
    await forgotPassword(email);
    setResendCooldown(30); // Start 30s timer
  };

  // Countdown effect
  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [resendCooldown]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setEmail("");
      setResendCooldown(0);
      clearInterval(timerRef.current);
    }
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
          disabled={isLoading || resendCooldown > 0}
        >
          {isLoading
            ? "Sending..."
            : resendCooldown > 0
              ? `Wait ${resendCooldown}s`
              : "Send Reset Link"}
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

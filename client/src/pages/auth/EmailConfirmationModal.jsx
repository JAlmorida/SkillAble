import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

const RESEND_COOLDOWN = 30; // seconds

const EmailConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  loading,
  email,
  onResend, // function to call when resending
}) => {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const timerRef = useRef();

  // Handle resend cooldown countdown
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
      setConfirmationCode("");
      setResendCooldown(0);
      setResendLoading(false);
      clearInterval(timerRef.current);
    }
  }, [open]);

  // Handler for resend button
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    try {
      await onResend(); // parent should handle actual resend logic
      setResendCooldown(RESEND_COOLDOWN);
    } catch (err) {
      // Optionally show error toast/message here
    } finally {
      setResendLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">Email Confirmation</h2>
        <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
          Enter the 6-digit code sent to <span className="font-semibold">{email}</span>.
        </p>
        <input
          type="text"
          maxLength={6}
          value={confirmationCode}
          onChange={e => setConfirmationCode(e.target.value)}
          className="w-full mb-4 p-2 border rounded bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
          placeholder="Confirmation code"
        />
        <div className="flex justify-between items-center mb-2">
          <Button
            onClick={() => onConfirm(confirmationCode)}
            disabled={loading || confirmationCode.length !== 6}
          >
            {loading ? "Confirming..." : "Confirm"}
          </Button>
          <Button
            variant="link"
            className="text-blue-600 dark:text-blue-400 underline px-0"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resendLoading}
            type="button"
          >
            {resendLoading
              ? "Resending..."
              : resendCooldown > 0
                ? `Resend (${resendCooldown}s)`
                : "Resend Confirmation"}
          </Button>
        </div>
        <Button variant="secondary" onClick={onClose} disabled={loading} className="w-full mt-2">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EmailConfirmationModal;

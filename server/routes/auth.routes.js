import express from "express";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  confirmEmail,
  resendConfirmation,
  validateResetToken,
} from "../controllers/auth.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/confirm-email", confirmEmail);
router.post("/resend-confirmation", resendConfirmation);
router.get("/validate-reset-token/:token", validateResetToken);

router.route("/me").get(isAuthenticated, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;

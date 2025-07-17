import express from "express";
import {
  register,
  login,
  logout,
  onboard,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);

router.route("/onboarding").post(isAuthenticated, onboard);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.route("/me").get(isAuthenticated, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;

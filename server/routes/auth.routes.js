import express from "express";
import {
  register,
  login,
  logout,
  onboard,
} from "../controllers/auth.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);

router.route("/onboarding").post(isAuthenticated, onboard);

router.route("/me").get(isAuthenticated, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;

import express from "express";
import {
  connectMobileWallet,
  getContent,
  getContentById,
  addComment,
} from "../controllers/appController.js";
import appAuth from "../middleware/auth.js";

const router = express.Router();

router.post("/connect-wallet", connectMobileWallet);
router.post("/add-comment/:contentId", [appAuth], addComment);
router.get("/get-content", getContent);
router.get("/get-content/:id", getContentById);

export default router;

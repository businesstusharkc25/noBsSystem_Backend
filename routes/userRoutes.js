import express from "express";
import {
  connectWallet,
  changeCurrentChannel,
} from "../controllers/userController.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/connect-wallet", connectWallet);
router.post("/change-current-channel", auth, changeCurrentChannel);

export default router;

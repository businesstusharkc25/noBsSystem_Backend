import express from "express";
import appAuth from "../middleware/auth.js";
import multer from "multer";
import {
  createChannel,
  deleteChannel,
  editChannel,
  getChannel,
  getAllChannel,
} from "../controllers/channelController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

const uploadFields = upload.fields([
  { name: "channelLogo", maxCount: 1 },
  { name: "channelCoverImage", maxCount: 1 },
]);

router.post("/create-channel", [appAuth, uploadFields], createChannel);
router.get("/get-channel/:channelId", [appAuth], getChannel);
router.get("/get-channels", [appAuth], getAllChannel);
router.put("/update-channel/:channelId", [appAuth, uploadFields], editChannel);
router.delete("/delete-channel/:channelId", [appAuth], deleteChannel);

export default router;

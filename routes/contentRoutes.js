import express from "express";
import multer from "multer";
import {
  addContentController,
  deleteContentController,
  updateContentController,
  getContentController,
  getContentById,
} from "../controllers/contentController.js";
import appAuth from "../middleware/auth.js";

const upload = multer({
  storage: multer.memoryStorage(),
});

const updateFields = upload.fields([
  { name: "videoFile", maxCount: 1 },
  { name: "thumbnailFile", maxCount: 1 },
  { name: "podcastFile", maxCount: 1 },
]);
const router = express.Router();

router.get("/get-all", [appAuth], getContentController);

router.get("/get-content/:id", [appAuth], getContentById);

router.post("/add-content", [appAuth, updateFields], addContentController);

router.put(
  "/update-content/:contentId",
  [appAuth, updateFields],
  updateContentController
);

router.delete("/delete-content/:id", appAuth, deleteContentController);

export default router;

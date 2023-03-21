import express from "express";
import {
  addMembershipController,
  getMembershipsController,
  deleteMembershipController,
  getMembershipByIdController,
  updateMembershipController,
} from "../controllers/membershipController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/add-membership", auth, addMembershipController);

router.get("/get-memberships", auth, getMembershipsController);
router.get("/get-membership/:id", auth, getMembershipByIdController);
router.put("/update-membership/:id", auth, updateMembershipController);

router.delete("/delete-membership/:id", auth, deleteMembershipController);

export default router;

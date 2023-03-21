import mongoose from "mongoose";

const membershipSchema = mongoose.Schema({
  id: { type: Number, required: true, default: 0 },
  creatorId: { type: mongoose.SchemaTypes.ObjectId, default: "" },
  createdBy: { type: String, required: true, default: "" },
  createdAt: { type: String, required: true, default: Date.now },
  membershipName: { type: String, required: true, default: "" },
  totalMembers: { type: Number, default: 0 },
  perks: { type: [String], required: true },
  price: { type: Number, required: true, default: 0 },
  status: { type: String, default: "draft" },
  channelId: { type: mongoose.SchemaTypes.ObjectId, default: "" },
});

export default mongoose.model(
  "membership_collection",
  membershipSchema,
  "membership_collection"
);

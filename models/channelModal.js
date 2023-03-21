import mongoose from "mongoose";

const channelSchema = mongoose.Schema({
  id: { type: Number, default: 0 },
  channelHandle: { type: String, default: "", required: true },
  channelName: { type: String, default: "", required: true },
  channelDescription: { type: String, default: "", required: true },
  channelLogoUrl: { type: String, default: "" },
  channelCoverImageUrl: { type: String, default: "" },
  membershipHoldersCount: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },
  channelCreatedAt: { type: Number, required: true, default: Date.now },
  creatorAccountAddress: { type: String, default: "", required: true },
  creatorId: { type: mongoose.SchemaTypes.ObjectId, default: null },
});

export default mongoose.model(
  "channel_collection",
  channelSchema,
  "channel_collection"
);

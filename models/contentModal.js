import mongoose from "mongoose";

const contentSchema = mongoose.Schema({
  id: { type: Number, required: true },
  channelId: { type: mongoose.SchemaTypes.ObjectId, default: "" },
  newsTitle: { type: String, default: null },
  newsBody: { type: String, default: null },
  isMemberOnly: { type: Boolean, required: true, default: false },
  thumbnailUrl: { type: String, default: null },
  status: { type: String, required: true, default: "draft" },
  contentCategory: { type: String, default: null },
  views: { type: Number, default: 0 },
  creatorId: { type: mongoose.SchemaTypes.ObjectId, default: null },
  creatorAccountAddress: { type: String, default: null, required: true },
  createdAt: { type: Number, required: true, default: Date.now },
  amountRaised: { type: Number, default: 0 },
  contentType: { type: String, default: null },
  contentUrl: { type: String, default: null },
  contentFileName: { type: String, default: null },
  thumbnailFileName: { type: String, default: null },
});

export default mongoose.model(
  "content_collection",
  contentSchema,
  "content_collection"
);

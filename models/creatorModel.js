import mongoose from "mongoose";

const creatorSchema = mongoose.Schema({
  accountAddress: { type: String, required: true },
  createdAt: { type: String, required: true, default: Date.now },
});

export default mongoose.model(
  "creators_collection",
  creatorSchema,
  "creators_collection"
);

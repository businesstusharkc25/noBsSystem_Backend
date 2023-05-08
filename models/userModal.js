import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  accountAddress: { type: String, required: true },
  createdAt: { type: String, required: true, default: Date.now },
});

export default mongoose.model("user_collection", userSchema, "user_collection");

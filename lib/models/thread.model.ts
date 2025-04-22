import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
  createdAt: { type: Date, default: Date.now },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Thread" },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Thread" }],
});

// Add method to convert to plain object
threadSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

delete mongoose.models.Thread;

const Thread = mongoose.model("Thread", threadSchema);

export default Thread;

import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  community: { type: String, ref: "Community" },
  createdAt: { type: Date, default: Date.now },
  parentId: { type: String },
  children: [{ type: String, ref: "Thread" }],
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

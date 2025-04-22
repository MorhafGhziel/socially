import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  bio: String,
  onboarded: { type: Boolean, default: false },
  threads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Thread" }],
  communities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],
});

// Add method to convert to plain object
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id?.toString() || obj.id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

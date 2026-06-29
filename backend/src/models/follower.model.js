import mongoose from "mongoose";

const { Schema, model } = mongoose;

const followerSchema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

followerSchema.index({ follower: 1, following: 1 }, { unique: true });
followerSchema.index({ following: 1 });

export default model("Follower", followerSchema);
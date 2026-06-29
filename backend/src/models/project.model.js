import mongoose from "mongoose";
import { PROJECT_STATUS } from "../constants/project-status.js";
import { PROJECT_CATEGORIES } from "../constants/project-categories.js";

const { Schema, model } = mongoose;

const projectSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
    },

    coverImage: {
      type: String,
      required: true,
    },

    images: [String],

    techStack: [String],

    demoLink: String,

    githubLink: String,

    category: {
      type: String,
      enum: Object.values(PROJECT_CATEGORIES),
      default: PROJECT_CATEGORIES.OTHER,
    },

    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.PENDING,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    likeCount: {
      type: Number,
      default: 0,
    },

    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

projectSchema.index({ owner: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ title: "text", description: "text" });

export default model("Project", projectSchema);
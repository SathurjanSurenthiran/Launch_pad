import { connect } from "./config/database.js";
import User from "./models/user.model.js";
import mongoose from "mongoose";
import logger from "./utils/logger.js";

const run = async () => {
  const email = process.argv[2];
  const role = process.argv[3] ? process.argv[3].toUpperCase() : 'STUDENT';

  if (!email) {
    console.error("Usage: node src/set-role.js <email> <STUDENT|RECRUITER|ADMIN>");
    process.exit(1);
  }

  if (!['STUDENT', 'RECRUITER', 'ADMIN'].includes(role)) {
    console.error("Invalid role. Choose STUDENT, RECRUITER, or ADMIN.");
    process.exit(1);
  }

  try {
    await connect();
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { role: role },
      { new: true }
    );
    if (user) {
      logger.info(`Successfully updated role of ${email} to: ${user.role} ✅`);
    } else {
      logger.warn(`User with email '${email}' not found in the database. Please sign in with this email first so the account gets created.`);
    }
  } catch (error) {
    logger.error("Failed to update role: " + error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();

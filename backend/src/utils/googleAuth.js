import { OAuth2Client } from "google-auth-library";
import env from "../config/env.js";
import AuthenticationException from "../exceptions/authentication.exception.js";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Verifies a Google ID token and returns user details.
 * @param {string} idToken 
 * @returns {Promise<{googleId: string, name: string, email: string, picture: string}>}
 * @throws {AuthenticationException} if verification fails
 */
export const verifyGoogleToken = async (idToken) => {
  if (env.NODE_ENV === "development" && idToken && idToken.startsWith("mock_")) {
    const role = idToken.split("_")[1] || "student";
    return {
      googleId: `mock_${role}_google_id`,
      name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `${role}@test.com`,
      picture: "",
    };
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("No payload found in the token ticket");
    }

    const { sub: googleId, name, email, picture } = payload;
    return { googleId, name, email, picture };
  } catch (error) {
    throw new AuthenticationException(`Google authentication failed: ${error.message}`);
  }
};

export default {
  verifyGoogleToken,
};

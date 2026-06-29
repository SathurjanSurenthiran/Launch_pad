import AppException from "./app.exceptions.js";
import { HTTP_STATUS } from "../constants/http-status.js";

class AuthenticationException extends AppException {
  constructor(message = "Authentication failed") {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

export default AuthenticationException;

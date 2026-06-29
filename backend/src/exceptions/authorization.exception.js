import AppException from "./app.exceptions.js";
import { HTTP_STATUS } from "../constants/http-status.js";

class AuthorizationException extends AppException {
  constructor(message = "Access denied") {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

export default AuthorizationException;

import AppException from "./app.exceptions.js";
import { HTTP_STATUS } from "../constants/http-status.js";

class ConflictException extends AppException {
  constructor(message = "Resource conflict occurred") {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

export default ConflictException;

import AppException from "./app.exceptions.js";
import { HTTP_STATUS } from "../constants/http-status.js";

class NotFoundException extends AppException {
  constructor(message = "Resource not found") {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

export default NotFoundException;

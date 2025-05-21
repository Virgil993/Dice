export class UserError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "UserError";

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UserError.prototype);
  }
}

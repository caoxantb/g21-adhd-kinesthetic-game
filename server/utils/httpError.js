export class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

export class Unauthorized extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

export class Forbidden extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
}

export class NotFound extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

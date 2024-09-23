export type ApiErrorDetails<E> = E & {
  message: string;
  code?: string | null;
};

export class ApiError<E> extends Error {
  details: ApiErrorDetails<E>;

  constructor(message: string, errorDetails: ApiErrorDetails<E>) {
    super(message);
    this.name = 'ApiError';
    this.details = errorDetails;
  }
}

export class InlineOtpNotSupported extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InlineOtpNotSupported';
  }
}

export class InlineProcessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InlineProcessError';
  }
}

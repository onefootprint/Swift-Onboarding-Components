export type ApiErrorDetails<E> = {
  message: E;
  code?: number;
};

export class ApiError<E> extends Error {
  details: ApiErrorDetails<E>;

  constructor(message: string, errorDetails: ApiErrorDetails<E>) {
    super(message);
    this.name = 'ApiError';
    this.details = errorDetails;
  }
}

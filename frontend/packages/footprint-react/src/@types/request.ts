export type ApiErrorDetails<E> = E & {
  message: string;
  code?: string;
};

export class ApiError<E> extends Error {
  details: ApiErrorDetails<E>;

  constructor(message: string, errorDetails: ApiErrorDetails<E>) {
    super(message);
    this.name = 'ApiError';
    this.details = errorDetails;
  }
}

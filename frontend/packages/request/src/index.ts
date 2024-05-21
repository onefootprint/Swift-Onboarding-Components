export { default as enRequestJson } from './config/locales/en/request.json';
export { default as esRequestJson } from './config/locales/es/request.json';
export type {
  FootprintServerError,
  PaginatedRequestResponse,
  RequestError,
} from './request';
export { default } from './request';
export {
  baseRequest,
  getErrorMessage,
  isFootprintError,
  isFootprintServerError,
  isLogoutError,
  isUnhandledError,
  requestWithoutCaseConverter,
  useRequestError,
} from './request';

import type { SdkKind } from './request-utils/constants';
import sendSdkTelemetry from './request-utils/send-sdk-telemetry';

const debugMode = false; // Enable this for local development

export const logInfo = (kind: SdkKind, info: string) => {
  const infoMessage = `@onefootprint/footprint-js: ${info}`;
  if (debugMode) {
    console.warn(infoMessage);
  } else {
    let domain;
    try {
      domain = window.location.href;
    } catch (_e) {
      // Safe to ignore if this throws, might happen in some environments
    }
    sendSdkTelemetry(kind, info, 'info', domain);
  }
  return infoMessage;
};

export const logWarn = (kind: SdkKind, warning: string) => {
  const warningMessage = `@onefootprint/footprint-js: ${warning}`;
  if (debugMode) {
    console.warn(warningMessage);
  } else {
    let domain;
    try {
      domain = window.location.href;
    } catch (_e) {
      // Safe to ignore if this throws, might happen in some environments
    }
    sendSdkTelemetry(kind, warning, 'warn', domain);
  }
  return warningMessage;
};

export const logError = (kind: SdkKind, error: string) => {
  const errorMessage = `@onefootprint/footprint-js: ${error}`;
  if (debugMode) {
    console.error(errorMessage);
  } else {
    let domain;
    try {
      domain = window.location.href;
    } catch (_e) {
      // Safe to ignore if this throws, might happen in some environments
    }
    sendSdkTelemetry(kind, error, 'error', domain);
  }
  return errorMessage;
};

import * as Linking from 'expo-linking';
import type { FootprintVerifyProps } from 'src/footprint.types';

import sendSdkTelemetry from './send-sdk-telemetry';

const debugMode = false; // Enable this for local development

export const getStringMessage = (msg?: unknown | Error): string => {
  if (typeof msg === 'string') {
    return msg;
  }
  if (typeof msg !== 'object') {
    return 'Something went wrong';
  }
  if ((msg as Error).message) {
    return (msg as Error).message;
  }

  try {
    return JSON.stringify(msg);
  } catch {
    // Do nothing
  }
  return 'Something went wrong';
};

const messagePrefix = '@onefootprint/footprint-js';

export const logError = (props: FootprintVerifyProps, error: unknown) => {
  const errorMessage = getStringMessage(error);
  const errorMessageWithPrefix = `${messagePrefix}: ${errorMessage}`;
  if (debugMode) {
    console.error(errorMessageWithPrefix);
  } else {
    sendSdkTelemetry(
      errorMessage,
      'error',
      props.redirectUrl ?? Linking.createURL('/'),
    );
  }
  return errorMessageWithPrefix;
};

export const logWarn = (props: FootprintVerifyProps, error: unknown) => {
  const warnMessage = getStringMessage(error);
  const warnMessageWithPrefix = `${messagePrefix}: ${warnMessage}`;
  if (debugMode) {
    console.warn(warnMessageWithPrefix);
  } else {
    sendSdkTelemetry(
      warnMessage,
      'warn',
      props.redirectUrl ?? Linking.createURL('/'),
    );
  }
  return warnMessageWithPrefix;
};

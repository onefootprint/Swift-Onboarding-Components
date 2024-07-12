import * as Linking from 'expo-linking';

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

const messagePrefix = '@onefootprint/footprint-expo';

export const logError = (error: unknown) => {
  const errorMessage = getStringMessage(error);
  const errorMessageWithPrefix = `${messagePrefix}: ${errorMessage}`;
  if (debugMode) {
    console.error(errorMessageWithPrefix);
  } else {
    Linking.getInitialURL()
      .then(tenantDomain => {
        sendSdkTelemetry(errorMessage, 'error', tenantDomain ?? '');
      })
      .catch(() => {
        // Ignore any errors and send without tenant domain
        sendSdkTelemetry(errorMessage, 'error');
      });
  }

  return errorMessageWithPrefix;
};

export const logWarn = (error: unknown) => {
  const warnMessage = getStringMessage(error);
  const warnMessageWithPrefix = `${messagePrefix}: ${warnMessage}`;
  if (debugMode) {
    console.warn(warnMessageWithPrefix);
  } else {
    Linking.getInitialURL()
      .then(tenantDomain => {
        sendSdkTelemetry(warnMessage, 'warn', tenantDomain ?? '');
      })
      .catch(() => {
        // Ignore any errors and send without tenant domain
        sendSdkTelemetry(warnMessage, 'warn');
      });
  }

  return warnMessageWithPrefix;
};

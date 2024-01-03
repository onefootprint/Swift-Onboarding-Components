import { FootprintVerifyProps } from 'src/footprint.types';
import sendSdkTelemetry from './send-sdk-telemetry';

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

const logError = (props: FootprintVerifyProps, error: unknown) => {
  let debugMode = false; // Enable this for local development

  const errorMessage = getStringMessage(error);
  const errorMessageWithPrefix = `@onefootprint/footprint-js: ${errorMessage}`;
  if (debugMode) {
    console.error(errorMessageWithPrefix);
  } else {
    sendSdkTelemetry(errorMessage);
  }

  props.onError?.(errorMessage);
};

export default logError;

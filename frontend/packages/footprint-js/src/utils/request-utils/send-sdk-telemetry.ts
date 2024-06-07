import type { SdkKind } from './constants';
import { API_BASE_URL, SDK_NAME, SDK_VERSION } from './constants';
import transformKeys from './transform-keys';

type SdkTelemetryRequest = {
  tenantDomain?: string;
  sdkKind?: string;
  sdkName?: string;
  sdkVersion?: string;
  logLevel?: string;
  logMessage?: string;
  sessionId?: string;
};

const sendSdkTelemetry = (kind: SdkKind, message: string, level: 'error' | 'warn', domain?: string) => {
  const body: SdkTelemetryRequest = {
    tenantDomain: domain,
    sdkKind: kind,
    sdkName: SDK_NAME,
    sdkVersion: SDK_VERSION,
    logLevel: level,
    logMessage: message,
  };
  try {
    // Fire and forget. No need to await or handle the response.
    fetch(`${API_BASE_URL}/org/sdk_telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformKeys(body)),
    });
  } catch (_e) {
    // Do nothing
  }
};

export default sendSdkTelemetry;

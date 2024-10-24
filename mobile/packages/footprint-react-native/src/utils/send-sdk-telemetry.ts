import { version } from '../../package.json';
import { API_BASE_URL, SDK_KIND, SDK_NAME } from './constants';
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

const sendSdkTelemetry = (message: string, level: 'error' | 'warn' | 'info', domain?: string) => {
  const body: SdkTelemetryRequest = {
    tenantDomain: domain,
    sdkKind: SDK_KIND,
    sdkName: SDK_NAME,
    sdkVersion: version,
    logLevel: level,
    logMessage: message,
  };
  // Fire and forget. No need to await or handle the response.
  fetch(`${API_BASE_URL}/org/sdk_telemetry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transformKeys(body)),
  });
};

export default sendSdkTelemetry;

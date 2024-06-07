import { UAParser } from 'ua-parser-js';

import { API_URL, COMMIT_SHA, NODE_ENV, VERCEL_ENV, VERCEL_GIT_COMMIT_REF, VERCEL_URL } from '../constants';
import type { PrimitiveData } from '../types';

const getEnvInfo = async (): Promise<PrimitiveData> => {
  const isSSR = typeof window === 'undefined';
  if (isSSR) return Promise.resolve({});

  const uaParser = new UAParser();
  const device = uaParser.getDevice();
  const os = uaParser.getOS();
  const browser = uaParser.getBrowser();

  let hasSupportForWebauthn = false;
  if (window.PublicKeyCredential) {
    hasSupportForWebauthn = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }

  const data: Record<string, string> = {
    deviceModel: device.model || '',
    deviceType: device.type || 'unknown',
    deviceVendor: device.vendor || '',
    osName: os.name || '',
    osVersion: os.version || '',
    browserName: browser.name || '',
    browserVersion: browser.version || '',
    hasSupportForWebauthn: hasSupportForWebauthn ? 'true' : 'false',
    release: COMMIT_SHA || 'local',
    environment: VERCEL_ENV,
    apiUrl: API_URL,
    nodeEnv: NODE_ENV || '',
    vercelEnv: VERCEL_ENV,
    gitCommitRef: VERCEL_GIT_COMMIT_REF,
    deploymentUrl: VERCEL_URL,
    host: window.location.host,
  };

  // Filter data to remove entries with empty values
  return Object.fromEntries(Object.entries(data).filter(([, value]) => !!value && value.length > 0));
};

export default getEnvInfo;

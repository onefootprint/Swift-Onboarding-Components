import { client } from '@onefootprint/axios';
import { DEV_OB_CONFIG_KEY } from '../../config/constants';
import createSandboxId from '../../utils/create-sandbox-id';

const OVERRIDE_API_HOST_PARAM = 'apiHost';
const DEFAULT_API_URL = 'https://api.dev.onefootprint.com';

const getOverrideApiBaseUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const apiHost = urlParams.get(OVERRIDE_API_HOST_PARAM);
  return apiHost ? `https://${apiHost}` : null;
};

client.setConfig({
  baseURL: getOverrideApiBaseUrl() || process.env.REACT_APP_FP_API_URL || DEFAULT_API_URL,
  headers: {
    'X-Fp-Client-Version': 'frontend-avis',
    'X-Onboarding-Config-Key': DEV_OB_CONFIG_KEY,
    // TODO: Remove
    'X-Sandbox-Id': createSandboxId(),
  },
});

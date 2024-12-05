import axios from 'axios';

const OVERRIDE_API_HOST_PARAM = 'apiHost';

const getOverrideApiBaseUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const apiHost = urlParams.get(OVERRIDE_API_HOST_PARAM);
  if (apiHost) {
    return `https://${apiHost}`;
  }
  return null;
};

const request = axios.create({
  baseURL: 'https://pos.preview.onefootprint.com/api/',
});

const envFootprintBaseApiUrl = process.env.REACT_APP_FP_API_URL;

export const fpRequest = axios.create({
  baseURL: getOverrideApiBaseUrl() || envFootprintBaseApiUrl || 'https://api.onefootprint.com',
});

export default request;

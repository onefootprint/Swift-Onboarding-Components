import type { FormData } from '../proxy-configs.types';

export const QUERY_KEY = 'proxy_configs';

export const CREATE_DEFAULT_VALUES: FormData = {
  name: '',
  url: '',
  method: 'POST',
  accessReason: '',
  headers: [{ name: '', value: '', secret: false }],
  pinnedServerCertificates: [{ certificate: '' }],
  clientIdentity: {
    certificate: '',
    key: '',
  },
  ingressSettings: {
    contentType: 'json',
    rules: [{ token: '', target: '' }],
  },
};

import type { ProxyConfigDetails } from '@onefootprint/types';
import type { FormData } from 'src/pages/proxy-configs/proxy-configs.types';

const getDefaultValues = (proxyConfig: ProxyConfigDetails): FormData => ({
  name: proxyConfig.name,
  url: proxyConfig.url,
  method: proxyConfig.method,
  accessReason: proxyConfig.accessReason,
  headers: [
    ...proxyConfig.headers.map(header => ({
      name: header.name,
      value: header.value,
      secret: false,
      disabled: false,
    })),
    ...proxyConfig.secretHeaders.map(header => ({
      name: header.name,
      value: '•••••••••••••••',
      secret: true,
      disabled: true,
    })),
  ],
  pinnedServerCertificates: proxyConfig.pinnedServerCertificates.map(
    certificate => ({ certificate }),
  ),
  ingressSettings: {
    contentType: proxyConfig.ingressContentType || 'none',
    rules: proxyConfig.ingressRules,
  },
  clientIdentity: {
    certificate: proxyConfig.clientCertificate || '',
    key: '',
  },
});

export default getDefaultValues;

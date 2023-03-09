import type { FormData } from '@/proxy-configs/proxy-configs.types';

const getDataInExpectedMode = (data: FormData) => {
  const {
    clientIdentity,
    name,
    method,
    url,
    accessReason,
    ingressSettings,
    pinnedServerCertificates,
    headers,
  } = data;
  const filteredHeaders = headers.filter(header => header.value && header.name);

  return {
    name,
    method,
    url,
    accessReason,
    clientIdentity:
      clientIdentity.certificate && clientIdentity.key
        ? {
            certificate: clientIdentity.certificate,
            key: clientIdentity.key,
          }
        : null,
    headers: filteredHeaders
      .filter(header => !header.secret)
      .map(header => ({ name: header.name, value: header.value })),
    ingressSettings: {
      ...ingressSettings,
      rules: ingressSettings.rules.map(rule => ({
        token: `custom.${rule.token}`,
        target: rule.target,
      })),
    },
    pinnedServerCertificates: pinnedServerCertificates
      .filter(({ certificate }) => certificate)
      .map(({ certificate }) => certificate),
    secretHeaders: filteredHeaders
      .filter(header => header.secret)
      .map(header => ({ name: header.name, value: header.value })),
  };
};

export default getDataInExpectedMode;

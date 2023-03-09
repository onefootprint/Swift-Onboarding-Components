import type { ProxyConfigMethod, ProxyIngressRule } from '@onefootprint/types';

export type FormData = {
  accessReason: string;
  clientIdentity: { certificate: string; key: string };
  headers: { name: string; value: string; secret: boolean }[];
  ingressSettings: { contentType: 'json'; rules: ProxyIngressRule[] };
  method: ProxyConfigMethod;
  name: string;
  pinnedServerCertificates: { certificate: string }[];
  url: string;
};

export type StepProps = {
  id: string;
  onSubmit: (formData: FormData) => void;
  values: FormData;
};

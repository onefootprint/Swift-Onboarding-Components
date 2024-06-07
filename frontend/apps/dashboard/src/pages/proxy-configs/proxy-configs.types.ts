import type { ProxyConfigIngressRule, ProxyConfigMethod } from '@onefootprint/types';

export type FormData = {
  accessReason: string;
  clientIdentity: { certificate: string; key: string };
  headers: {
    name: string;
    value: string;
    secret: boolean;
    disabled?: boolean;
  }[];
  ingressSettings: {
    contentType: 'json' | 'none';
    rules: ProxyConfigIngressRule[];
  };
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

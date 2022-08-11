import { DataKinds } from 'src/types/data-kind';
import type { OnboardingConfig } from 'src/types/onboarding-config';

export const sandboxOnboardingConfig: OnboardingConfig = {
  id: 'ob_config_id_sFMH49H7gtMLdbO4FjywO',
  key: 'ob_config_pk_aCmd7FmKmfZ9xfJFn099Mn',
  name: 'Acme Bank',
  orgName: 'Acme Bank',
  logoUrl: null,
  mustCollectDataKinds: [DataKinds.email],
  canAccessDataKinds: [DataKinds.email],
  isLive: false,
  createdAt: '7/20/22, 3:40 AM',
  status: 'enabled',
};

export const liveOnboardingKey: OnboardingConfig = {
  id: 'ob_config_id_e0XeR8sxG2Fs6k7fQmYrEG',
  key: 'ob_live_cp5NX9wDbxkldd52hnJuRB',
  name: 'Lorem11',
  orgName: 'Acme Bank',
  logoUrl: null,
  mustCollectDataKinds: [DataKinds.ssn],
  canAccessDataKinds: [DataKinds.ssn],
  isLive: true,
  createdAt: '8/10/22, 11:56 AM',
  status: 'disabled',
};

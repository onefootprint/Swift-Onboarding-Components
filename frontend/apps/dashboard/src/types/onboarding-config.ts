import { DataKinds } from './data-kind';

export type OnboardingConfig = {
  canAccessDataKinds: DataKinds[];
  createdAt: string;
  id: string;
  isLive: boolean;
  key: string;
  logoUrl: string | null;
  mustCollectDataKinds: DataKinds[];
  name: string;
  orgName: string;
  status: 'enabled' | 'disabled';
};

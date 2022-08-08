import { DataKind } from './data-kind';

export type OnboardingConfig = {
  canAccessDataKinds: DataKind[];
  createdAt: string;
  id: string;
  isLive: boolean;
  key: string;
  logoUrl: string | null;
  mustCollectDataKinds: DataKind[];
  name: string;
  orgName: string;
  status: 'enabled' | 'disabled';
};

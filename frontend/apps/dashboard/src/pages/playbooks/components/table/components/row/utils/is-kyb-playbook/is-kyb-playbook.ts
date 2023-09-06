import type { OnboardingConfig } from '@onefootprint/types';
import { CollectedKybDataOption } from '@onefootprint/types';

export const isKybCdo = (data: string) =>
  Object.values(CollectedKybDataOption).includes(
    data as CollectedKybDataOption,
  );

const isKybPlaybook = (playbook: OnboardingConfig) => {
  const { mustCollectData } = playbook;
  return mustCollectData.some(data => isKybCdo(data));
};

export default isKybPlaybook;

import { OnboardingConfigStatus } from '@onefootprint/types';
import { z } from 'zod';

const onboardingStatusEnum = z.enum([OnboardingConfigStatus.disabled, OnboardingConfigStatus.enabled]);
const playbooksConfigQuery = z.object({
  onboarding_config_id: z.string().optional(),
  onboarding_configs_page: z.string().optional(),
  onboarding_configs_search: z.string().optional(),
  onboarding_configs_status: onboardingStatusEnum.optional(),
});
const playbookTabsEnum = z.enum(['data', 'verification-checks', 'passkeys', 'rules']);

export type PlaybookTabs = z.infer<typeof playbookTabsEnum>;
export type PlaybooksConfigQuery = z.infer<typeof playbooksConfigQuery>;
export const tabsRouterSchema = z
  .object({
    tab: playbookTabsEnum.default('data'),
  })
  .merge(playbooksConfigQuery);

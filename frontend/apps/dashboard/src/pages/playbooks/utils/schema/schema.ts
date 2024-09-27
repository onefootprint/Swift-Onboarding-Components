import { OnboardingConfigStatus } from '@onefootprint/types';
import { z } from 'zod';

const onboardingStatusEnum = z.enum([OnboardingConfigStatus.disabled, OnboardingConfigStatus.enabled]);
const playbooksConfigQuery = z.object({
  id: z.string().optional(),
  page: z.string().optional(),
  search: z.string().optional(),
  kind: z.string().optional(),
  status: onboardingStatusEnum.optional(),
});
const playbookTabsEnum = z.enum(['data', 'verification-checks', 'rules', 'settings']);

export type PlaybookTabs = z.infer<typeof playbookTabsEnum>;
export type PlaybooksConfigQuery = z.infer<typeof playbooksConfigQuery>;
export const tabsRouterSchema = z
  .object({
    tab: playbookTabsEnum.default('data'),
  })
  .merge(playbooksConfigQuery);

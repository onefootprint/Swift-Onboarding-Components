import { z } from 'zod';

const playbooksConfigQuery = z.object({
  id: z.string().optional(),
  page: z.string().optional(),
  search: z.string().optional(),
  kinds: z.string().optional(),
  hide_disabled: z.string().optional(),
  show_filters: z.string().optional(),
});
const playbookTabsEnum = z.enum(['data', 'verification-checks', 'rules', 'settings', 'information']);

export type PlaybookTabs = z.infer<typeof playbookTabsEnum>;
export type PlaybooksConfigQuery = z.infer<typeof playbooksConfigQuery>;
export const tabsRouterSchema = z
  .object({
    tab: playbookTabsEnum.default('data'),
  })
  .merge(playbooksConfigQuery);

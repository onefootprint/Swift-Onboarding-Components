import type { FormData } from '../drawer-filter.type';
import { FiltersDateRange } from '../drawer-filter.type';

const transformFormDataToQuery = ({
  labels,
  others,
  period,
  customDate,
  playbooks,
  externalId,
}: FormData) => {
  const getPeriod = () => {
    if (period === FiltersDateRange.Custom) {
      const newFrom = customDate.from.toISOString();
      const newTo = customDate.to.toISOString();
      return [newFrom, newTo];
    }
    return period;
  };

  const has = (key: string) => {
    if (!others) return 'false';
    return others.includes(key).toString();
  };

  const playbookIds = Object.keys(playbooks).filter(key => playbooks[key]);

  return {
    labels,
    date_range: getPeriod(),
    watchlist_hit: has('watchlist_hit'),
    has_outstanding_workflow_request: has('has_outstanding_workflow_request'),
    show_unverified: has('show_unverified'),
    playbook_ids: playbookIds,
    external_id: externalId || undefined,
  };
};

export default transformFormDataToQuery;

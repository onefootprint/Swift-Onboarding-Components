import { SelectNew, Shimmer } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import ALL_PLAYBOOKS_ID from '../../constants';
import useFilters from '../../hooks/use-filters';
import usePlaybookOptions from '../../hooks/use-playbook-options';

const PlaybooksFilter = () => {
  const { t } = useTranslation('home', {
    keyPrefix: 'onboarding-metrics.filters',
  });
  const filters = useFilters();
  const { data, isPending } = usePlaybookOptions({});

  const allPlaybooksOption = {
    label: t('all-playbooks'),
    value: ALL_PLAYBOOKS_ID,
  };
  const playbooksData = [allPlaybooksOption, ...(data || [])];

  const playbooksFilterValue = playbooksData?.find(({ value }) => value === filters.values.playbook_id) ?? {
    label: t('all-playbooks'),
    value: ALL_PLAYBOOKS_ID,
  };

  const handleChange = (newPlaybook: string) => {
    filters.push({
      ...filters.query,
      playbook_id: newPlaybook === ALL_PLAYBOOKS_ID ? undefined : newPlaybook,
    });
  };

  return (
    <>
      {isPending && <Loading />}
      {data && (
        <SelectNew
          disabled={playbooksData.length === 1}
          onChange={handleChange}
          options={playbooksData}
          size="compact"
          value={playbooksFilterValue.value}
        />
      )}
    </>
  );
};

const Loading = () => <Shimmer height="32px" width="124px" />;

export default PlaybooksFilter;

import { SelectCustom, Shimmer } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import usePlaybookOptions from 'src/hooks/use-playbook-options';

import ALL_PLAYBOOKS_ID from '../../constants';
import useFilters from '../../hooks/use-filters';

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
        <SelectCustom.Root
          disabled={playbooksData.length === 1}
          onValueChange={handleChange}
          value={playbooksFilterValue.value}
        >
          <SelectCustom.Input size="compact" placeholder={t('all-playbooks')}>
            <SelectCustom.Value placeholder={t('all-playbooks')}>{playbooksFilterValue.label}</SelectCustom.Value>
          </SelectCustom.Input>
          <SelectCustom.Content maxHeight="50vh" maxWidth="400px" minWidth="240px" popper align="end">
            <SelectCustom.Group>
              {playbooksData.map(option => (
                <SelectCustom.Item key={option.value} value={option.value} showChecked>
                  {option.label}
                </SelectCustom.Item>
              ))}
            </SelectCustom.Group>
          </SelectCustom.Content>
        </SelectCustom.Root>
      )}
    </>
  );
};

const Loading = () => <Shimmer height="32px" width="124px" />;

export default PlaybooksFilter;
